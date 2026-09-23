import { CropAnalysisResult, Language, AppMode } from '../types';
import { sampleLeaves } from '../data/sampleCrops';

export async function detectCropHealth(
  imageBase64: string,
  filename: string,
  mimeType: string,
  language: Language,
  mode: AppMode
): Promise<CropAnalysisResult> {
  // If in DEMO MODE and matched one of our pre-verified sample leaves, return that
  if (mode === 'demo') {
    const matchedSample = sampleLeaves.find(
      (s) => s.filename === filename || s.imageUrl === imageBase64
    );
    if (matchedSample) {
      await new Promise((res) => setTimeout(res, 1200));
      return {
        ...matchedSample.expectedResult,
        isPlantVisible: true,
        imageQualityStatus: 'good',
        needsExpertInspection: false,
        isGemini: false,
        modeUsed: 'demo',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // If in REAL AI MODE, call backend server proxy
  if (mode === 'real_ai') {
    try {
      const res = await fetch('/api/detect-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          filename,
          mimeType,
          language,
          mode: 'real_ai',
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        if (json?.missingApiKey) {
          throw new Error(
            language === 'te'
              ? 'రియల్ AI మోడ్ కోసం GEMINI_API_KEY2 అవసరం. సర్వర్ ఎన్విరాన్‌మెంట్‌లో కీ కాన్ఫిగరేషన్‌ను తనిఖీ చేయండి.'
              : 'REAL AI MODE requires GEMINI_API_KEY2. Please verify the key in your server environment.'
          );
        }

        const localizedError = language === 'te' && json?.errorTelugu ? json.errorTelugu : json?.error;
        throw new Error(
          localizedError ||
            (res.status === 503
              ? (language === 'te' 
                  ? 'జెమినీ AI మోడల్స్ అధిక డిమాండ్ వల్ల తాత్కాలికంగా అందుబాటులో లేవు (503). దయచేసి మళ్లీ విశ్లేషించండి.' 
                  : 'Gemini AI models are temporarily busy (503). Retries were performed; please click Retry to try again.')
              : (language === 'te'
                  ? 'జెమినీ విజన్ విశ్లేషణ సమయంలో సర్వర్ లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
                  : 'Server error while running Gemini vision analysis. Please try again.'))
        );
      }

      if (json.data) {
        return {
          ...json.data,
          isGemini: true,
          modeUsed: 'real_ai',
          modelUsed: json.modelUsed || json.data?.modelUsed,
          timestamp: new Date().toISOString(),
        };
      }

      throw new Error(
        language === 'te'
          ? 'AI విశ్లేషణ నుండి స్పష్టమైన సమాధానం రాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'Invalid payload structure received from AI vision model.'
      );
    } catch (err: any) {
      console.error('Real AI detection error:', err);
      throw err;
    }
  }

  // DEMO MODE fallback simulation on user-uploaded photo
  await new Promise((res) => setTimeout(res, 1400));
  const lowerName = filename.toLowerCase();

  // Agronomic rules based on plant type
  if (lowerName.includes('rice') || lowerName.includes('paddy') || lowerName.includes('వరి')) {
    return {
      cropName: 'Paddy / Rice (Oryza sativa)',
      cropNameTelugu: 'వరి (వరి పంట)',
      scientificName: 'Oryza sativa',
      isPlantVisible: true,
      imageQualityStatus: 'good',
      needsExpertInspection: false,
      healthStatus: 'healthy',
      healthStatusText: 'Healthy Foliage – No Severe Pathogens Detected',
      healthStatusTextTelugu: 'ఆరోగ్యకరమైన పంట – ఎలాంటి తీవ్రమైన తెగులు లక్షణాలు లేవు',
      diseaseOrSymptom: 'No Severe Foliar Symptoms Detected',
      diseaseOrSymptomTelugu: 'ఎలాంటి తీవ్రమైన తెగులు లక్షణాలు కనిపించలేదు',
      confidenceScore: 91,
      riskLevel: 'Low',
      riskLevelTelugu: 'తక్కువ ప్రమాదం',
      analysisLimitations:
        'Visual demo mode screening. Sub-surface root health and viral vectors require in-person field scouting.',
      analysisLimitationsTelugu:
        'డెమో మోడ్ పరిశీలన. వేరు సమస్యలు లేదా ఇతర పోషక లోపాలకు పొలంలో వేర్లను కూడా పరిశీలించండి.',
      symptoms: [
        'Uniform green pigment throughout leaf blade',
        'Intact leaf margin with zero bacterial streak signs',
        'Balanced chloroplastic coloration',
      ],
      symptomsTelugu: [
        'సమానమైన ఆకుపచ్చని ఆకు నిర్మాణం',
        'ఆకు అంచుల వెంబడి ఎలాంటి ఎండ్రకాయ లేదా అగ్గి తెగులు మచ్చలు లేవు',
        'సహజమైన పత్రహరిత అభివృద్ధి',
      ],
      causes: {
        environmental: ['Normal ambient temperature & light absorption'],
        environmentalTelugu: ['అనుకూలమైన వాతావరణ ఉష్ణోగ్రత'],
        water: ['Adequate root capillary moisture'],
        waterTelugu: ['సరిపడా నేల తేమ'],
        nutrient: ['Balanced nitrogen-potassium levels'],
        nutrientTelugu: ['సమతుల్య నత్రజని మరియు పొటాష్'],
        pestOrDisease: ['No active fungal mycelium or spore rings observed'],
        pestOrDiseaseTelugu: ['ఎలాంటి శిలీంద్ర లేదా పురుగుల లక్షణాలు లేవు'],
      },
      recommendedNextSteps: [
        'Maintain balanced organic manuring and optimal nitrogen levels.',
        'Adopt Alternate Wetting & Drying (AWD) irrigation to prevent waterlogging.',
        'Weekly scouting for leaf folder and stem borer presence.',
      ],
      recommendedNextStepsTelugu: [
        'సమతుల్య సేంద్రీయ ఎరువులు మరియు సిఫార్సు చేసిన మోతాదులో యూరియా వాడండి.',
        'ఆరుతడి విధానం ద్వారా నీటిని ఆదా చేయండి.',
        'ఆకుచుట్టు పురుగు మరియు కాండం తొలిచే పురుగు ఆశించకుండా గమనించండి.',
      ],
      farmerActionItems: [
        'Keep standing water at 2–3 cm during tillering stage.',
        'No emergency chemical intervention needed at present.',
        'Consult local Rythu Bharosa Kendra for seasonal fertilizer schedule.',
      ],
      farmerActionItemsTelugu: [
        'పిలకల దశలో 2-3 సెం.మీ మేర మాత్రమే నీరు ఉంచండి.',
        'ప్రస్తుతం ఎలాంటి రసాయన పురుగుమందుల పిచికారీ అవసరం లేదు.',
        'స్థానిక రైతు భరోసా కేంద్రం సిఫార్సుల ప్రకారం ఎరువులు వేయండి.',
      ],
      timestamp: new Date().toISOString(),
      isGemini: false,
      modeUsed: 'demo',
    };
  }

  // Default demo result with realistic breakdown
  return {
    cropName: 'Horticultural Foliage (Vegetable Leaf)',
    cropNameTelugu: 'కూరగాయలు / వ్యవసాయ పంట ఆకు',
    scientificName: 'Solanaceae / Horticultural',
    isPlantVisible: true,
    imageQualityStatus: 'good',
    needsExpertInspection: true,
    healthStatus: 'warning',
    healthStatusText: 'Early Foliar Lesions / Nutrient Discoloration',
    healthStatusTextTelugu: 'ఆకుపై ప్రాథమిక మచ్చలు / పోషక లోప లక్షణాలు',
    diseaseOrSymptom: 'Early Foliar Spotting & Marginal Chlorosis',
    diseaseOrSymptomTelugu: 'ఆకు మచ్చలు మరియు అంచులు పసుపుగా మారడం',
    confidenceScore: 84,
    riskLevel: 'Moderate',
    riskLevelTelugu: 'మధ్యస్థ ప్రమాదం',
    analysisLimitations:
      'Observation generated in DEMO MODE. For real-time vision model detection, switch to Real AI Mode in the top bar.',
    analysisLimitationsTelugu:
      'డెమో మోడ్ పరిశీలన. లైవ్ జెమినీ విజన్ విశ్లేషణ కోసం పైనున్న రియల్ AI మోడ్‌ను ఎంచుకోండి.',
    symptoms: [
      'Irregular brownish lesions scattered across leaf lamina',
      'Mild chlorosis (yellowing) bordering the symptomatic tissue',
      'Potential early fungal spore proliferation',
    ],
    symptomsTelugu: [
      'ఆకు ఉపరితలంపై అక్కడక్కడా గోధుమ రంగు మచ్చలు',
      'మచ్చల చుట్టూ లేత పసుపు రంగు వలయం',
      'ప్రాథమిక శిలీంద్ర తెగులు వ్యాప్తి సూచనలు',
    ],
    causes: {
      environmental: ['High afternoon heat and leaf surface moisture drying cycles'],
      environmentalTelugu: ['తీవ్రమైన ఎండ మరియు ఆకులపై తేమ ఆరిపోవడం'],
      water: ['Intermittent dry-wet swings promoting foliar stress'],
      waterTelugu: ['నీటి తడులలో హెచ్చుతగ్గులు'],
      nutrient: ['Possible early zinc or magnesium deficiency manifesting as interveinal chlorosis'],
      nutrientTelugu: ['జింక్ లేదా మెగ్నీషియం లోపం వల్ల ఈనెల మధ్య పసుపు రంగు'],
      pestOrDisease: ['Potential early Alternaria fungal spore infection'],
      pestOrDiseaseTelugu: ['ఆల్టర్నేరియా శిలీంద్ర తెగులు ఆశించే అవకాశం'],
    },
    recommendedNextSteps: [
      'Inspect undersides of affected leaves with a hand lens for insect frass.',
      'Refrain from flood irrigation during midday sun.',
      'Consult village agricultural assistant or call Kisan Call Center 1800-180-1551.',
    ],
    recommendedNextStepsTelugu: [
      'ఆకు అడుగు భాగంలో బూజు లేదా పురుగు గుడ్లు ఉన్నాయేమో పరిశీలించండి.',
      'మధ్యాహ్న ఎండలో పంటకు నీరు పెట్టవద్దు.',
      'గ్రామ వ్యవసాయ సహాయకుడిని లేదా కిసాన్ కాల్ సెంటర్ 1800-180-1551 ని సంప్రదించండి.',
    ],
    farmerActionItems: [
      'Isolate the infected plant bed from neighboring rows.',
      'Apply 5% Neem Seed Kernel Extract (NSKE) as an organic deterrent.',
      'Do NOT spray unverified synthetic fungicides without expert confirmation.',
    ],
    farmerActionItemsTelugu: [
      'తెగులు సోకిన మొక్కలను మిగిలిన పంట నుండి వేరుగా గమనించండి.',
      'నివారణగా వేప గింజల కషాయం (5%) పిచికారీ చేయండి.',
      'నిపుణుల నిర్ధారణ లేకుండా తీవ్రమైన పురుగుమందులు వాడవద్దు.',
    ],
    timestamp: new Date().toISOString(),
    isGemini: false,
    modeUsed: 'demo',
  };
}
