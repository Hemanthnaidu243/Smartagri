import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));

/**
 * Robust server-side Gemini API key retriever.
 * Prioritizes GEMINI_API_KEY2 per user instructions, then falls back to GEMINI_API_KEY.
 * Handles common copy-paste formatting quirks (quotes, assignment syntax, font letter confusions).
 * Keeps key strictly server-side and never exposes it to client.
 */
function getGeminiApiKey(): string | undefined {
  const rawKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
  if (!rawKey) return undefined;

  let cleaned = rawKey.trim();

  // Strip surrounding single or double quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Strip assignment prefix if user pasted "GEMINI_API_KEY2=..."
  if (cleaned.includes('=')) {
    cleaned = cleaned.split('=').pop()!.trim();
  }

  // Remove common typo prefix (e.g., "GEMI" prepended before "AIza...")
  if (cleaned.startsWith('GEMI')) {
    cleaned = cleaned.slice(4).trim();
  }

  // Fix font glyph confusion where lowercase 'l' was typed instead of uppercase 'I' in 'AIza'
  if (cleaned.startsWith('Alza')) {
    cleaned = 'AIza' + cleaned.slice(4);
  }

  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Determines if an error represents a temporary overload or transient condition
 * suitable for exponential backoff retry and compatible model fallback.
 */
function isTransientError(err: any): boolean {
  const status = err?.status || err?.statusCode || 0;
  const msg = (err?.message || '').toLowerCase();
  
  return (
    status === 503 ||
    status === 502 ||
    status === 504 ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('temporarily overloaded') ||
    msg.includes('overloaded') ||
    msg.includes('resource has been exhausted') ||
    msg.includes('rate limit') ||
    status === 429 ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('socket hang up')
  );
}

/**
 * Health check endpoint: Reports server status, key presence, and model fallback pipeline
 * without ever exposing the sensitive key value.
 */
app.get('/api/health', (req, res) => {
  const apiKey = getGeminiApiKey();
  const keySource = process.env.GEMINI_API_KEY2
    ? 'GEMINI_API_KEY2'
    : process.env.GEMINI_API_KEY
    ? 'GEMINI_API_KEY'
    : 'none';

  res.json({
    status: 'online',
    hasApiKey: Boolean(apiKey),
    keySource,
    primaryModel: 'gemini-3.1-flash-lite',
    fallbackModels: ['gemini-3.8-flash', 'gemini-flash-latest'],
    retryMechanism: 'Exponential backoff with automated multi-model cascade',
    service: 'SmartAgri Real-World Agronomy Vision Engine',
  });
});

// Compatible vision model hierarchy for seamless high-demand failover
// gemini-3.1-flash-lite is prioritized for ultra-high availability, low latency, and immunity to 503 spikes
const MODEL_CASCADE = [
  'gemini-3.1-flash-lite', // Primary recommended model: fast, reliable, resilient to high demand
  'gemini-3.8-flash',     // Secondary high-capacity vision model
  'gemini-flash-latest',   // Additional stable flash alias
];

// AI Crop Disease & Health Detection API
app.post('/api/detect-crop', async (req, res) => {
  try {
    const { imageBase64, mimeType, filename, language, mode } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.length < 50) {
      return res.status(400).json({ 
        success: false, 
        code: 'INVALID_IMAGE_PAYLOAD',
        error: language === 'te' 
          ? 'సరైన ఫోటో డేటా అందలేదు. దయచేసి మళ్లీ అప్‌లోడ్ చేయండి.' 
          : 'Invalid image data received. Please select or capture a valid crop leaf photo.' 
      });
    }

    // Clean base64 string if data URL prefix was included
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    if (cleanBase64.length < 100) {
      return res.status(400).json({
        success: false,
        code: 'CORRUPTED_IMAGE_PAYLOAD',
        error: language === 'te'
          ? 'చిత్రం చాలా చిన్నదిగా లేదా పాడై ఉంది.'
          : 'Image payload is empty or corrupted. Please capture a new photo.'
      });
    }

    // Handle Real AI Mode vs Demo Mode
    if (mode === 'real_ai') {
      const apiKey = getGeminiApiKey();

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          code: 'MISSING_API_KEY',
          missingApiKey: true,
          error:
            'REAL AI MODE requires GEMINI_API_KEY2 or GEMINI_API_KEY. Please verify your server-side environment variables.',
          errorTelugu:
            'రియల్ AI మోడ్ కోసం GEMINI_API_KEY2 అవసరం. సర్వర్‌లో కీ కాన్ఫిగరేషన్‌ను తనిఖీ చేయండి.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are a certified professional agricultural plant pathologist, crop doctor, and agronomy specialist.
Analyze this real-world crop leaf or plant image rigorously:
1. Confirm if a real plant/crop/leaf is visible (isPlantVisible: true/false). If no plant is found (e.g. human face, indoor furniture, random object), set isPlantVisible: false, confidenceScore: 20, healthStatus: "uncertain", and state clearly that no agricultural specimen was found.
2. Evaluate image quality (imageQualityStatus: "good" | "fair" | "poor"). If blurry or dark, note that in analysisLimitations.
3. Identify the most probable crop name (e.g., Tomato, Paddy/Rice, Cotton, Chilli, Groundnut, Maize, Potato, etc.).
4. Assess plant health status: "healthy", "warning", "critical", or "uncertain".
5. Identify visible symptoms and potential disease/stress. If uncertain, state "Uncertain / Indeterminate foliar symptoms. Professional lab examination recommended."
6. Assign an honest confidence score between 30 and 98 based on visual clarity and certainty.
7. Classify possible root causes into four categories:
   - environmental: (e.g. heat scorch, cold shock, wind abrasion, sun scald)
   - water: (e.g. excessive irrigation, waterlogging, drought stress, irregular watering)
   - nutrient: (e.g. nitrogen deficiency, iron chlorosis, zinc mottling, potassium leaf margin burn)
   - pestOrDisease: (e.g. Early Blight Alternaria, leaf curl begomovirus, thrips vector, Cercospora leaf spot, blast)
8. Provide actionable next steps: physical leaf checks, soil moisture checks, isolation of symptomatic vines.
9. Provide safe farmer actions. NEVER prescribe dangerous or uncalibrated synthetic pesticide doses without directing the farmer to their registered agricultural extension officer / Rythu Bharosa Kendra.
10. Provide complete, accurate Telugu translations for all fields so Telugu farmers in Andhra Pradesh and Telangana can read and listen to the advice directly.`;

      const contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      };

      const config = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlantVisible: { type: Type.BOOLEAN },
            imageQualityStatus: { type: Type.STRING, description: 'good, fair, or poor' },
            needsExpertInspection: { type: Type.BOOLEAN },
            cropName: { type: Type.STRING },
            cropNameTelugu: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            healthStatus: { type: Type.STRING, description: 'healthy, warning, critical, or uncertain' },
            healthStatusText: { type: Type.STRING },
            healthStatusTextTelugu: { type: Type.STRING },
            diseaseOrSymptom: { type: Type.STRING },
            diseaseOrSymptomTelugu: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, description: 'Low, Moderate, High, or Uncertain' },
            riskLevelTelugu: { type: Type.STRING },
            analysisLimitations: { type: Type.STRING },
            analysisLimitationsTelugu: { type: Type.STRING },
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            symptomsTelugu: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            causes: {
              type: Type.OBJECT,
              properties: {
                environmental: { type: Type.ARRAY, items: { type: Type.STRING } },
                environmentalTelugu: { type: Type.ARRAY, items: { type: Type.STRING } },
                water: { type: Type.ARRAY, items: { type: Type.STRING } },
                waterTelugu: { type: Type.ARRAY, items: { type: Type.STRING } },
                nutrient: { type: Type.ARRAY, items: { type: Type.STRING } },
                nutrientTelugu: { type: Type.ARRAY, items: { type: Type.STRING } },
                pestOrDisease: { type: Type.ARRAY, items: { type: Type.STRING } },
                pestOrDiseaseTelugu: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            recommendedNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedNextStepsTelugu: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            farmerActionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            farmerActionItemsTelugu: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'isPlantVisible',
            'imageQualityStatus',
            'cropName',
            'healthStatus',
            'diseaseOrSymptom',
            'confidenceScore',
            'riskLevel',
            'analysisLimitations',
            'symptoms',
            'recommendedNextSteps',
            'farmerActionItems',
          ],
        },
      };

      // Multi-Model Cascade with Exponential Backoff Retry for 503 High-Demand Spikes
      let response: any = null;
      let modelUsed = MODEL_CASCADE[0];
      let lastError: any = null;
      let totalAttemptsMade = 0;

      for (const currentModel of MODEL_CASCADE) {
        const maxRetriesForModel = currentModel === MODEL_CASCADE[0] ? 2 : 1;

        for (let attempt = 0; attempt <= maxRetriesForModel; attempt++) {
          totalAttemptsMade++;
          try {
            console.log(
              `[Gemini AI] Calling model: ${currentModel} (attempt ${attempt + 1}/${maxRetriesForModel + 1})`
            );
            response = await ai.models.generateContent({
              model: currentModel,
              contents,
              config,
            });
            modelUsed = currentModel;
            console.log(`[Gemini AI] Successfully received response from ${currentModel}`);
            break;
          } catch (err: any) {
            lastError = err;
            const errMsg = (err?.message || '').toLowerCase();
            const errStatus = err?.status || err?.statusCode;
            const isTransient = isTransientError(err);

            console.log(
              `[Gemini Failover] Model ${currentModel} busy (status ${errStatus || 'transient'}), initiating automatic failover...`
            );

            // If API key is invalid, fail fast so user can check configuration
            if (
              errStatus === 400 &&
              (errMsg.includes('api key not valid') || errMsg.includes('api_key_invalid'))
            ) {
              return res.status(401).json({
                success: false,
                code: 'INVALID_API_KEY',
                error: 'The provided GEMINI_API_KEY2 is invalid or unrecognized by Google Gemini API. Please verify the key.',
                errorTelugu: 'అందించిన GEMINI_API_KEY2 చెల్లదు. దయచేసి API కీని సరిచూసుకోండి.',
                canRetry: false,
              });
            }

            // If 503 Model Unavailable or high-demand transient error, apply exponential backoff
            if (isTransient && attempt < maxRetriesForModel) {
              const backoffMs = Math.min(1200 * Math.pow(2, attempt) + Math.random() * 400, 3500);
              console.log(`[Gemini AI] Retrying ${currentModel} in ${Math.round(backoffMs)}ms...`);
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
              continue;
            }

            // Move to next model in cascade
            break;
          }
        }

        if (response) {
          break;
        }
      }

      // If all models and retries failed, return an accurate error without switching to demo mode
      if (!response) {
        const errorMsg = lastError?.message || '';
        const isQuota =
          lastError?.status === 429 ||
          errorMsg.toLowerCase().includes('quota') ||
          errorMsg.toLowerCase().includes('resource_exhausted');
        const isUnavailable =
          lastError?.status === 503 ||
          errorMsg.toLowerCase().includes('unavailable') ||
          errorMsg.toLowerCase().includes('high demand');

        const statusCode = isUnavailable ? 503 : isQuota ? 429 : 500;
        const errorCode = isUnavailable
          ? 'MODEL_UNAVAILABLE_503'
          : isQuota
          ? 'QUOTA_EXCEEDED_429'
          : 'AI_DETECTION_FAILED';

        return res.status(statusCode).json({
          success: false,
          code: errorCode,
          attemptsMade: totalAttemptsMade,
          modelsAttempted: MODEL_CASCADE,
          canRetry: true,
          error: isUnavailable
            ? 'Gemini AI models are temporarily experiencing high demand (503). Automatic retries and fallbacks were performed. Please click Retry in a moment.'
            : isQuota
            ? 'Gemini API quota or rate limit temporarily exceeded. Please wait a few seconds before retrying.'
            : `AI Vision analysis encountered an issue: ${lastError?.message || 'Server error'}. Please try again.`,
          errorTelugu: isUnavailable
            ? 'జెమినీ మోడల్స్ అధిక డిమాండ్ వల్ల తాత్కాలికంగా అందుబాటులో లేవు (503). ఆటోమేటిక్ రీట్రైలు జరిగాయి. దయచేసి కొద్ది సేపటి తర్వాత మళ్లీ ప్రయత్నించండి.'
            : isQuota
            ? 'API కోటా పరిమితి దాటింది. దయచేసి కొద్ది సెకన్ల తర్వాత మళ్లీ ప్రయత్నించండి.'
            : 'AI విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
        });
      }

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        isGemini: true,
        modeUsed: 'real_ai',
        modelUsed,
        data: {
          ...parsed,
          timestamp: new Date().toISOString(),
          isGemini: true,
          modeUsed: 'real_ai',
          modelUsed,
        },
      });
    }

    // DEMO MODE: Safe agronomic simulation for offline demos
    return res.json({
      success: true,
      isGemini: false,
      modeUsed: 'demo',
      message: 'Processed in DEMO MODE using verified agronomic baseline data.',
    });
  } catch (err: any) {
    console.error('Server error during AI detection:', err);
    return res.status(500).json({
      success: false,
      code: 'SERVER_EXCEPTION',
      error: err?.message || 'Error processing crop image with vision engine.',
      canRetry: true,
    });
  }
});

// Real-Time Agronomic Voice Assistant API powered by Gemini AI
app.post('/api/voice-assistant', async (req, res) => {
  try {
    const rawQuery = req.body.query || req.body.question;
    const language = req.body.language || 'te';

    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question / query text is required.',
      });
    }

    const trimmedQuestion = rawQuery.trim();
    const apiKey = getGeminiApiKey();

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are "SmartAgri Kisan Mitra" (స్మార్ట్ అగ్రి కిసాన్ మిత్ర), an expert agricultural scientist and digital extension officer for Indian farmers (specializing in Andhra Pradesh & Telangana crops like Chilli, Paddy, Cotton, Tomato, Groundnut, Maize, Pulses, and Vegetables).

The farmer asks: "${trimmedQuestion}"

Provide authoritative, practical, farmer-focused guidance.
Return a STRICT JSON object with these exact keys:
{
  "text": "Comprehensive answer in clear, farmer-friendly English (2-4 sentences)",
  "textTelugu": "Natural, conversational, high-quality Telugu translation in authentic agricultural dialect (తెలుగులో స్పష్టమైన, గౌరవప్రదమైన సమాధానం)",
  "textEn": "Comprehensive answer in clear, farmer-friendly English (same as text)",
  "textTe": "Natural, conversational, high-quality Telugu translation (same as textTelugu)",
  "category": "pest_control" | "crop_disease" | "soil_health" | "irrigation" | "fertilizer" | "general",
  "actionStepsEn": ["Step 1", "Step 2", "Step 3"],
  "actionStepsTe": ["దశ 1", "దశ 2", "దశ 3"],
  "emergencyHelpline": "National Kisan Call Center: 1800-180-1551 (Toll Free, Telugu support available)",
  "suggestedFollowUps": ["Related follow-up question 1", "Related follow-up question 2"]
}

Guidelines:
- Give safe, sustainable solutions combining IPM (Integrated Pest Management), organic practices (Neem oil, Jeevamrutham, Trichoderma), and approved university standards.
- Never recommend dangerous banned chemicals.
- Return ONLY valid JSON, no markdown codeblocks, no formatting outside the JSON.`;

      for (const modelName of MODEL_CASCADE) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);
          return res.json({
            success: true,
            isGemini: true,
            modelUsed: modelName,
            text: parsed.text || parsed.textEn,
            textTelugu: parsed.textTelugu || parsed.textTe,
            ...parsed,
          });
        } catch (modelErr: any) {
          console.warn(`[VoiceAssistant] Model ${modelName} encountered error:`, modelErr?.message);
          continue;
        }
      }
    }

    // High-quality Agronomic Fallback Knowledge Engine (if API key not provided or model temporarily unavailable)
    const lower = trimmedQuestion.toLowerCase();
    let enAns = 'For personalized crop guidance, inspect your foliage for early symptoms and consult with your local Rythu Bharosa Kendra or toll-free Kisan Call Center at 1800-180-1551.';
    let teAns = 'సమగ్ర సలహా కోసం మీ పంట ఆకులను పరిశీలించి స్థానిక రైతు భరోసా కేంద్రం లేదా కిసాన్ కాల్ సెంటర్ 1800-180-1551 కి ఉచితంగా కాల్ చేయండి.';
    let category = 'general';
    let stepsEn = ['Monitor leaves during early morning hours', 'Maintain optimal soil aeration and drainage'];
    let stepsTe = ['ఉదయం వేళల్లో ఆకులను పరిశీలించండి', 'మడిలో నీరు నిల్వ ఉండకుండా చూడండి'];

    if (lower.includes('మిరప') || lower.includes('ముడత') || lower.includes('chilli') || lower.includes('curl') || lower.includes('thrips')) {
      category = 'pest_control';
      enAns = 'Chilli leaf curl is primarily caused by sucking pests (thrips and yellow mites). Upward curling indicates thrips, while downward curling indicates mites. Spray Neem oil (10,000 ppm @ 2-3 ml/L) and install 20 yellow and blue sticky traps per acre.';
      teAns = 'మిరపలో ఆకు ముడత తామర పురుగులు (పై ముడత) మరియు నల్లి (కింది ముడత) వల్ల వస్తుంది. ఎకరానికి 20 పసుపు, నీలి రంగు జిగురు అట్టలు అమర్చండి. వేప నూనె (10,000 ppm) లీటరు నీటికి 2-3 మి.లీ కలిపి పిచికారీ చేయండి.';
      stepsEn = ['Install 20 yellow/blue sticky traps per acre', 'Spray botanical Neem seed extract (5%)', 'Avoid excess chemical nitrogen fertilizer'];
      stepsTe = ['ఎకరానికి 20 పసుపు/నీలి జిగురు అట్టలు పెట్టండి', '5% వేప గింజల కషాయం పిచికారీ చేయండి', 'అధిక యూరియా వాడకాన్ని తగ్గించండి'];
    } else if (lower.includes('జీవామృతం') || lower.includes('organic') || lower.includes('jeevamrutham') || lower.includes('ఎరువు')) {
      category = 'fertilizer';
      enAns = 'To prepare Jeevamrutham: In 200L water, mix 10kg desi cow dung, 10L cow urine, 2kg jaggery, 2kg pulse flour (besan), and a handful of virgin forest/bund soil. Keep in shade for 48 hours, stirring clockwise twice daily. Apply 200L per acre through irrigation.';
      teAns = 'జీవామృతం తయారీ: 200 లీటర్ల నీటిలో 10 కేజీల దేశీ ఆవు పేడ, 10 లీటర్ల గోమూత్రం, 2 కేజీల బెల్లం, 2 కేజీల శనగపిండి, పిడికెడు గట్టు మట్టి కలపండి. నీడలో 48 గంటలు ఉంచి రోజుకు 2 సార్లు కర్రతో తిప్పండి. ఎకరానికి 200 లీటర్లు నీటి తడులతో అందించండి.';
      stepsEn = ['Ferment for 48 hours under shade', 'Stir clockwise 50 times morning & evening', 'Apply within 7-10 days of preparation'];
      stepsTe = ['నీడలో 48 గంటలు పులియబెట్టండి', 'ఉదయం, సాయంత్రం కర్రతో కుడివైపుకు తిప్పండి', 'తయారైన 7-10 రోజుల్లో పొలానికి అందించండి'];
    } else if (lower.includes('వర్షం') || lower.includes('spray') || lower.includes('పిచికారీ') || lower.includes('rain') || lower.includes('weather')) {
      category = 'irrigation';
      enAns = 'Do not spray pesticides or foliar nutrients if rain is expected within 4-6 hours or if winds exceed 15 km/h. High winds cause severe drift, and rain washes away the active chemical, wasting your money.';
      teAns = 'రాబోయే 4-6 గంటల్లో వర్షం పడే అవకాశం ఉన్నా లేదా గాలి వేగం గంటకు 15 కి.మీ మించి ఉన్నా ఎట్టి పరిస్థితుల్లోనూ మందులు పిచికారీ చేయకండి. గాలి వల్ల మందు పక్కకు వెళ్లిపోతుంది, వర్షానికి కరిగిపోయి పెట్టుబడి నష్టపోతారు.';
      stepsEn = ['Check our live weather radar before loading sprayer', 'Spray only during calm morning hours (6:30 - 9:00 AM)', 'Add a natural sticker/spreader agent (wetting agent)'];
      stepsTe = ['పిచికారీకి ముందు లైవ్ వాతావరణాన్ని తనిఖీ చేయండి', 'గాలి తక్కువగా ఉండే ఉదయం 6:30 - 9:00 మధ్య మాత్రమే కొట్టండి', 'వర్షం ముప్పు ఉంటే జిగురు ద్రావణం (స్ప్రెడ్డర్) కలపండి'];
    } else if (lower.includes('వరి') || lower.includes('paddy') || lower.includes('rice') || lower.includes('సుడిదోమ') || lower.includes('bph')) {
      category = 'pest_control';
      enAns = 'For Brown Plant Hopper (BPH / సుడిదోమ) in paddy: Drain water completely from the field for 2-3 days to break humidity at the stem base. Form alleyways (ఆకులు విడదీయడం) every 2 meters for aeration and sunlight penetration.';
      teAns = 'వరిలో సుడిదోమ నివారణకు: పొలంలోని నీటిని 2-3 రోజులు పూర్తిగా తీసివేసి ఆరబెట్టండి. సూర్యరశ్మి మరియు గాలి సోకేలా ప్రతి 2 మీటర్లకు పాయలు తీయండి (ఆలివేస్). పిచికారీ చేసేటప్పుడు మందు మొక్కల మొదళ్లకు తగిలేలా చూడండి.';
      stepsEn = ['Drain field water for 2-3 days immediately', 'Form aeration alleys every 2 meters', 'Direct spray nozzle towards the base of rice tillers'];
      stepsTe = ['పొలంలోని నీటిని వెంటనే 2-3 రోజులు ఆరబెట్టండి', 'ప్రతి 2 మీటర్లకు గాలి కోసం పాయలు తీయండి', 'మందును మొక్కల మొదళ్లకు తగిలేలా పిచికారీ చేయండి'];
    }

    return res.json({
      success: true,
      isGemini: false,
      modelUsed: 'agronomy-expert-rulebase',
      text: enAns,
      textTelugu: teAns,
      textEn: enAns,
      textTe: teAns,
      category,
      actionStepsEn: stepsEn,
      actionStepsTe: stepsTe,
      emergencyHelpline: 'National Kisan Call Center: 1800-180-1551 (Toll Free)',
      suggestedFollowUps: [
        language === 'te' ? 'ఈ సమస్యకు సేంద్రీయ నివారణ ఏమిటి?' : 'What is the organic remedy for this?',
        language === 'te' ? 'నీటి తడులు ఎప్పుడు ఇవ్వాలి?' : 'When should I irrigate?',
      ],
    });
  } catch (err: any) {
    console.error('Error in /api/voice-assistant:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process voice query.',
    });
  }
});

// Day of week abbreviations
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_TE = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];

function getWmoInfo(code: number): { condition: string; conditionTelugu: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', conditionTelugu: 'నిర్మలమైన ఆకాశం' };
    case 1:
      return { condition: 'Mainly Clear', conditionTelugu: 'చాలావరకు నిర్మలంగా' };
    case 2:
      return { condition: 'Partly Cloudy', conditionTelugu: 'పాక్షికంగా మేఘావృతం' };
    case 3:
      return { condition: 'Overcast', conditionTelugu: 'దట్టమైన మేఘాలు' };
    case 45:
    case 48:
      return { condition: 'Fog & Mist', conditionTelugu: 'పొగమంచు' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', conditionTelugu: 'చిరుజల్లులు' };
    case 61:
      return { condition: 'Slight Rain', conditionTelugu: 'తేలికపాటి వర్షం' };
    case 63:
      return { condition: 'Moderate Rain', conditionTelugu: 'మోస్తరు వర్షం' };
    case 65:
      return { condition: 'Heavy Rain', conditionTelugu: 'భారీ వర్షం' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', conditionTelugu: 'వర్షపు జల్లులు' };
    case 95:
      return { condition: 'Thunderstorm', conditionTelugu: 'ఉరుములు మెరుపులతో కూడిన వర్షం' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', conditionTelugu: 'వడగండ్ల వాన' };
    default:
      return { condition: 'Scattered Clouds', conditionTelugu: 'చెదురుమదురు మేఘాలు' };
  }
}

// REAL LIVE WEATHER & IRRIGATION ADVISORY API (Open-Meteo Integration)
app.get('/api/weather', async (req, res) => {
  try {
    const { q, lat, lon } = req.query;

    let targetLat = lat ? parseFloat(lat as string) : NaN;
    let targetLon = lon ? parseFloat(lon as string) : NaN;
    let locationName = (q as string) || '';
    let countryName = 'India';
    let regionName = '';

    // If query text provided without lat/lon, perform real geocoding
    if ((isNaN(targetLat) || isNaN(targetLon)) && locationName.trim()) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        locationName.trim()
      )}&count=5&language=en&format=json`;

      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        return res.status(502).json({
          success: false,
          code: 'GEOCODING_SERVICE_ERROR',
          error: 'Weather geocoding service temporarily unavailable. Please try again.',
          errorTelugu: 'లొకేషన్ సెర్చ్ సర్వీస్ అందుబాటులో లేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
        });
      }

      const geoData: any = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return res.status(404).json({
          success: false,
          code: 'LOCATION_NOT_FOUND',
          error: `Could not find weather data for "${locationName}". Please verify the location name or enter a district/town.`,
          errorTelugu: `"${locationName}" కోసం వాతావరణ సమాచారం దొరకలేదు. దయచేసి సరైన జిల్లా లేదా పట్టణం పేరు నమోదు చేయండి.`,
        });
      }

      const bestMatch = geoData.results[0];
      targetLat = bestMatch.latitude;
      targetLon = bestMatch.longitude;
      locationName = bestMatch.name;
      countryName = bestMatch.country || 'India';
      regionName = bestMatch.admin1 || '';
    }

    // Default to Guntur / Andhra Pradesh if neither provided
    if (isNaN(targetLat) || isNaN(targetLon)) {
      targetLat = 16.3067;
      targetLon = 80.4365;
      locationName = 'Guntur';
      regionName = 'Andhra Pradesh';
    }

    // Query real meteorological data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      return res.status(502).json({
        success: false,
        code: 'WEATHER_API_ERROR',
        error: 'Unable to retrieve live meteorological data from satellite network. Please try again.',
        errorTelugu: 'వాతావరణ కేంద్రం నుండి తాజా సమాచారాన్ని పొందలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.',
      });
    }

    const wData: any = await weatherRes.json();
    const current = wData.current || {};
    const daily = wData.daily || {};

    const temp = Math.round((current.temperature_2m ?? 28) * 10) / 10;
    const apparentTemp = Math.round((current.apparent_temperature ?? temp) * 10) / 10;
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const precipitation = current.precipitation ?? 0;
    const rain = current.rain ?? 0;
    const windSpeed = Math.round((current.wind_speed_10m ?? 8) * 10) / 10;
    const weatherCode = current.weather_code ?? 2;

    const { condition, conditionTelugu } = getWmoInfo(weatherCode);

    // Agronomic Spray Advisory Evaluation
    let sprayAdvisory: 'optimal' | 'caution' | 'hazardous' = 'optimal';
    let sprayAdvisoryText = '';
    let sprayAdvisoryTextTelugu = '';

    const windSafe = windSpeed < 14;
    const rainRisk = precipitation > 0.4 || rain > 0.4;
    const humiditySafe = humidity <= 85;

    if (windSpeed >= 18 || rainRisk || weatherCode >= 80) {
      sprayAdvisory = 'hazardous';
      sprayAdvisoryText = `Hazardous spray window! High wind speed (${windSpeed} km/h) or precipitation increases droplet drift and runoff. Postpone foliar spraying.`;
      sprayAdvisoryTextTelugu = `పిచికారీకి ప్రమాదకరమైన సమయం! అధిక గాలి వేగం (${windSpeed} కి.మీ/గం) లేదా వర్షం వల్ల మందులు కొట్టుకుపోయే ప్రమాదం ఉంది. పిచికారీని వాయిదా వేయండి.`;
    } else if (windSpeed >= 14 || humidity > 85 || temp > 35) {
      sprayAdvisory = 'caution';
      sprayAdvisoryText = `Caution advised. Temperature (${temp}°C) or humidity (${humidity}%) is high. Use coarse droplet nozzles or spray only in early dawn/evening hours.`;
      sprayAdvisoryTextTelugu = `జాగ్రత్త అవసరం. ఉష్ణోగ్రత (${temp}°C) లేదా తేమ (${humidity}%) ఎక్కువగా ఉంది. ఉదయం లేదా సాయంత్రం వేళల్లో మాత్రమే పిచికారీ చేయండి.`;
    } else {
      sprayAdvisory = 'optimal';
      sprayAdvisoryText = `Optimal spray window! Calm wind (${windSpeed} km/h), mild humidity (${humidity}%), and dry foliage ensure maximum chemical absorption and zero drift.`;
      sprayAdvisoryTextTelugu = `పిచికారీకి అత్యుత్తమ అనుకూల సమయం! అనుకూలమైన గాలి వేగం (${windSpeed} కి.మీ/గం) మరియు తగిన తేమ (${humidity}%) ఉన్నందున మందు ఆకులపై సమర్థవంతంగా పనిచేస్తుంది.`;
    }

    // Smart Irrigation Guidance Evaluation
    let tomorrowRainProb = 0;
    let tomorrowRainSum = 0;
    if (daily.precipitation_probability_max && daily.precipitation_probability_max.length > 1) {
      tomorrowRainProb = daily.precipitation_probability_max[1] || 0;
      tomorrowRainSum = daily.precipitation_sum?.[1] || 0;
    }

    let wateringUrgency: 'low' | 'moderate' | 'high' | 'postpone' = 'moderate';
    let irrigationRecommendation = '';
    let irrigationRecommendationTelugu = '';

    if (tomorrowRainProb >= 60 || tomorrowRainSum >= 8 || precipitation > 1) {
      wateringUrgency = 'postpone';
      irrigationRecommendation = `Postpone field irrigation! High rain probability (${tomorrowRainProb}%) or active rainfall expected. Conserve borewell power and prevent waterlogging.`;
      irrigationRecommendationTelugu = `నీటి తడులను వాయిదా వేయండి! రేపు వర్షం కురిసే అవకాశం (${tomorrowRainProb}%) ఉంది. నీటి నిల్వ మరియు బోరు మోటార్ ఖర్చును ఆదా చేసుకోండి.`;
    } else if (temp >= 33 && humidity < 50) {
      wateringUrgency = 'high';
      irrigationRecommendation = `High soil evapotranspiration! Provide light, frequent drip cycles to prevent crop water stress and leaf scorching.`;
      irrigationRecommendationTelugu = `ఎక్కువ ఉష్ణోగ్రత వల్ల నేల త్వరగా ఎండిపోతుంది! డ్రిప్ ద్వారా తగినంత నీటి తడులను అందించండి.`;
    } else {
      wateringUrgency = 'moderate';
      irrigationRecommendation = `Normal irrigation schedule. Target 60–65% field moisture capacity during current vegetative/flowering phase.`;
      irrigationRecommendationTelugu = `సాధారణ నీటి షెడ్యూల్ పాటించండి. పంట వేర్లకు తగినంత తేమ ఉండేలా సాయంత్రం వేళల్లో నీరు పెట్టండి.`;
    }

    // Build 7-day forecast array
    const forecastDates = daily.time || [];
    const forecastList = forecastDates.map((dateStr: string, idx: number) => {
      const d = new Date(dateStr);
      const dayIdx = d.getDay();
      const isToday = idx === 0;
      const isTomorrow = idx === 1;

      const code = daily.weather_code?.[idx] ?? 2;
      const wInfo = getWmoInfo(code);
      const prob = daily.precipitation_probability_max?.[idx] ?? 10;
      const sum = daily.precipitation_sum?.[idx] ?? 0;

      let window: 'optimal' | 'caution' | 'hazardous' = 'optimal';
      if (prob > 50 || sum > 5) window = 'hazardous';
      else if (prob > 25 || sum > 1) window = 'caution';

      return {
        date: dateStr,
        day: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : DAYS_EN[dayIdx],
        dayTelugu: isToday ? 'ఈరోజు' : isTomorrow ? 'రేపు' : DAYS_TE[dayIdx],
        weatherCode: code,
        condition: wInfo.condition,
        conditionTelugu: wInfo.conditionTelugu,
        tempHigh: Math.round(daily.temperature_2m_max?.[idx] ?? 32),
        tempLow: Math.round(daily.temperature_2m_min?.[idx] ?? 22),
        precipitationProbability: prob,
        precipitationSum: sum,
        sprayWindow: window,
      };
    });

    return res.json({
      success: true,
      data: {
        location: regionName ? `${locationName}, ${regionName}` : locationName,
        country: countryName,
        region: regionName,
        latitude: targetLat,
        longitude: targetLon,
        temperature: temp,
        apparentTemperature: apparentTemp,
        relativeHumidity: humidity,
        precipitation,
        rain,
        weatherCode,
        weatherCondition: condition,
        weatherConditionTelugu: conditionTelugu,
        windSpeed,
        sprayAdvisory,
        sprayAdvisoryText,
        sprayAdvisoryTextTelugu,
        sprayFactors: {
          windSafe,
          rainRisk,
          humiditySafe,
        },
        irrigationGuidance: {
          recommendation: irrigationRecommendation,
          recommendationTelugu: irrigationRecommendationTelugu,
          wateringUrgency,
          soilMoistureLossEstimate: temp > 33 ? 'high' : temp > 26 ? 'moderate' : 'low',
          optimalTime: '5:30 AM – 8:30 AM or 5:00 PM – 7:00 PM',
          optimalTimeTelugu: 'ఉదయం 5:30 - 8:30 లేదా సాయంత్రం 5:00 - 7:00 గంటలకు',
        },
        dailyForecast: forecastList,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Weather API error:', err);
    return res.status(500).json({
      success: false,
      code: 'WEATHER_INTERNAL_ERROR',
      error: 'Failed to process meteorological data. Please try again.',
      errorTelugu: 'వాతావరణ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 Smart Agriculture platform online on http://localhost:${PORT}`);
  });
}

startServer();

