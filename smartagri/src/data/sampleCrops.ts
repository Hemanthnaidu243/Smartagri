import { CropAnalysisResult } from '../types';

export interface SampleLeaf {
  id: string;
  name: string;
  nameTelugu: string;
  filename: string;
  fileSize: string;
  fileType: string;
  imageUrl: string;
  description: string;
  descriptionTelugu: string;
  expectedResult: CropAnalysisResult;
}

// Generate realistic SVG representations of authentic crop specimens
function createLeafSvg(type: 'tomato' | 'rice' | 'corn' | 'cotton' | 'potato'): string {
  let svgContent = '';

  switch (type) {
    case 'tomato':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <radialGradient id="leafGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#3b7a33"/>
              <stop offset="70%" stop-color="#214e1a"/>
              <stop offset="100%" stop-color="#14330f"/>
            </radialGradient>
            <radialGradient id="spotGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#2a1a0f"/>
              <stop offset="60%" stop-color="#543719"/>
              <stop offset="85%" stop-color="#8a6125"/>
              <stop offset="100%" stop-color="#889617" stop-opacity="0.9"/>
            </radialGradient>
          </defs>
          <rect width="400" height="400" fill="#1e241e"/>
          <!-- Soil texture back -->
          <circle cx="200" cy="200" r="190" fill="#161b16"/>
          <!-- Main Petiole -->
          <path d="M 200,380 Q 195,240 190,40" stroke="#5d8a3e" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M 194,220 Q 130,170 80,150" stroke="#4c7731" stroke-width="4" fill="none"/>
          <path d="M 194,210 Q 270,160 320,140" stroke="#4c7731" stroke-width="4" fill="none"/>
          <!-- Central Compound Leaflet -->
          <path d="M 190,40 C 130,70 120,160 170,220 C 185,240 195,240 205,220 C 255,160 250,70 190,40 Z" fill="url(#leafGrad)"/>
          <!-- Left Leaflet -->
          <path d="M 80,150 C 70,110 110,120 150,160 C 160,170 150,180 140,180 C 100,180 70,170 80,150 Z" fill="url(#leafGrad)"/>
          <!-- Right Leaflet -->
          <path d="M 320,140 C 330,100 290,110 250,150 C 240,160 250,170 260,170 C 300,170 330,160 320,140 Z" fill="url(#leafGrad)"/>
          <!-- Venation -->
          <path d="M 190,50 L 190,220 M 190,90 Q 160,110 145,130 M 190,90 Q 220,110 235,130 M 190,130 Q 160,150 150,180 M 190,130 Q 220,150 230,180" stroke="#689f47" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.7"/>
          <!-- Early Blight Concentric Target Rings Lesions -->
          <ellipse cx="165" cy="130" rx="22" ry="18" fill="url(#spotGrad)"/>
          <circle cx="165" cy="130" r="14" fill="none" stroke="#1c1109" stroke-width="2"/>
          <circle cx="165" cy="130" r="7" fill="none" stroke="#2a1a0f" stroke-width="1.5"/>
          <ellipse cx="215" cy="170" rx="18" ry="14" fill="url(#spotGrad)"/>
          <circle cx="215" cy="170" r="11" fill="none" stroke="#1c1109" stroke-width="1.5"/>
          <ellipse cx="150" cy="185" rx="14" ry="10" fill="url(#spotGrad)"/>
          <!-- Chlorotic Yellow Halos -->
          <path d="M 130,125 Q 165,95 200,125 Q 165,160 130,125 Z" fill="#b0b522" opacity="0.35"/>
        </svg>
      `;
      break;

    case 'rice':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <linearGradient id="paddyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#2d6e1b"/>
              <stop offset="35%" stop-color="#46a329"/>
              <stop offset="50%" stop-color="#54be32"/>
              <stop offset="65%" stop-color="#46a329"/>
              <stop offset="100%" stop-color="#1f5212"/>
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill="#182319"/>
          <!-- Healthy elongated linear paddy leaf blade -->
          <path d="M 215,390 Q 205,250 190,160 Q 170,80 195,15 C 205,75 225,170 225,250 Q 225,330 215,390 Z" fill="url(#paddyGrad)"/>
          <!-- Secondary tillering blade behind -->
          <path d="M 180,390 Q 155,270 120,180 Q 95,120 70,80 C 100,125 145,230 170,310 Z" fill="#2d6e1b" opacity="0.85"/>
          <!-- Parallel venation & distinct prominent midrib -->
          <path d="M 195,15 Q 170,80 190,160 Q 205,250 215,390" stroke="#75dc4d" stroke-width="2" fill="none" opacity="0.9"/>
          <path d="M 192,50 L 192,380 M 198,50 L 198,380 M 204,80 L 204,380 M 209,100 L 209,380" stroke="#5cb938" stroke-width="0.8" opacity="0.5" fill="none"/>
          <!-- Prime dew drop reflections showing clean foliar health -->
          <circle cx="190" cy="120" r="3.5" fill="#ffffff" opacity="0.75"/>
          <circle cx="210" cy="220" r="2.5" fill="#ffffff" opacity="0.6"/>
          <circle cx="185" cy="180" r="2" fill="#ffffff" opacity="0.6"/>
        </svg>
      `;
      break;

    case 'corn':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <linearGradient id="cornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#387a22"/>
              <stop offset="50%" stop-color="#46922b"/>
              <stop offset="100%" stop-color="#245514"/>
            </linearGradient>
            <linearGradient id="blightStripe" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#80683a" stop-opacity="0.8"/>
              <stop offset="50%" stop-color="#40321a"/>
              <stop offset="100%" stop-color="#80683a" stop-opacity="0.8"/>
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill="#1c211a"/>
          <!-- Broad arching maize leaf -->
          <path d="M 60,380 C 110,260 160,180 230,120 C 290,70 360,40 380,30 C 340,65 280,140 220,230 C 170,300 120,355 60,380 Z" fill="url(#cornGrad)"/>
          <!-- Central Thick Midrib -->
          <path d="M 60,380 C 110,260 160,180 230,120 C 290,70 360,40 380,30" stroke="#a4d97f" stroke-width="4" fill="none" opacity="0.8"/>
          <!-- Northern Leaf Blight: Cigar-shaped tan/brown elliptical lesions parallel to veins -->
          <path d="M 180,195 Q 230,155 270,125 Q 240,165 190,205 Z" fill="url(#blightStripe)"/>
          <ellipse cx="225" cy="165" rx="38" ry="8" transform="rotate(-33 225 165)" fill="#544324" opacity="0.9"/>
          <ellipse cx="225" cy="165" rx="42" ry="11" transform="rotate(-33 225 165)" stroke="#9c873a" stroke-width="1.5" fill="none" opacity="0.7"/>
          <!-- Secondary Lesion -->
          <ellipse cx="150" cy="245" rx="28" ry="6" transform="rotate(-38 150 245)" fill="#544324"/>
          <ellipse cx="150" cy="245" rx="31" ry="8" transform="rotate(-38 150 245)" stroke="#9c873a" stroke-width="1" fill="none" opacity="0.6"/>
        </svg>
      `;
      break;

    case 'cotton':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <radialGradient id="cottonGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#47802b"/>
              <stop offset="80%" stop-color="#2b5518"/>
              <stop offset="100%" stop-color="#1e3e0f"/>
            </radialGradient>
          </defs>
          <rect width="400" height="400" fill="#1b201a"/>
          <!-- Distorted leaf with upward cupping edges -->
          <!-- 3-5 Lobed Palmately lobed leaf blade with crinkling -->
          <path d="M 200,340 L 195,240 
                   C 140,240 90,270 50,220 
                   C 75,180 100,160 80,110 
                   C 125,120 150,105 170,60 
                   C 185,90 200,60 210,50 
                   C 225,95 255,100 295,90 
                   C 285,140 315,170 340,200 
                   C 300,240 260,230 205,240 Z" fill="url(#cottonGrad)"/>
          <!-- Vein thickening & Enation outgrowths characteristic of CLCuV -->
          <path d="M 195,240 L 210,50" stroke="#87c74b" stroke-width="6" fill="none"/>
          <path d="M 195,240 L 80,110" stroke="#79b441" stroke-width="5" fill="none"/>
          <path d="M 195,240 L 295,90" stroke="#79b441" stroke-width="5" fill="none"/>
          <path d="M 195,240 L 50,220" stroke="#689e34" stroke-width="4" fill="none"/>
          <path d="M 195,240 L 340,200" stroke="#689e34" stroke-width="4" fill="none"/>
          <!-- Cupped curled curled margins & ruffled yellowing veins -->
          <path d="M 80,110 Q 120,135 170,60" stroke="#d5e84a" stroke-width="2.5" fill="none"/>
          <path d="M 210,50 Q 250,75 295,90" stroke="#d5e84a" stroke-width="2.5" fill="none"/>
          <!-- Curling shadow folds -->
          <path d="M 50,220 C 70,200 90,195 120,210" stroke="#172e0d" stroke-width="4" fill="none" opacity="0.6"/>
        </svg>
      `;
      break;

    case 'potato':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <radialGradient id="potatoGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#3f7528"/>
              <stop offset="85%" stop-color="#244815"/>
              <stop offset="100%" stop-color="#18310d"/>
            </radialGradient>
            <radialGradient id="lateBlightRot" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#1a140d"/>
              <stop offset="50%" stop-color="#302313"/>
              <stop offset="80%" stop-color="#523e20"/>
              <stop offset="100%" stop-color="#808c2a" stop-opacity="0.8"/>
            </radialGradient>
          </defs>
          <rect width="400" height="400" fill="#1b201a"/>
          <!-- Compound ovate potato leaf -->
          <path d="M 200,360 Q 195,250 190,120" stroke="#486e2d" stroke-width="6" fill="none"/>
          <!-- Terminal leaflet -->
          <path d="M 190,120 C 130,110 110,50 190,20 C 270,50 250,110 190,120 Z" fill="url(#potatoGrad)"/>
          <!-- Mid leaflets -->
          <path d="M 193,220 C 110,210 100,160 140,140 C 180,140 190,180 193,220 Z" fill="url(#potatoGrad)"/>
          <path d="M 193,220 C 270,210 280,160 240,140 C 200,140 190,180 193,220 Z" fill="url(#potatoGrad)"/>
          <!-- Phytophthora Infestans: Dark water-soaked rotting lesions with pale margins -->
          <path d="M 120,45 C 145,55 170,35 185,50 C 180,75 140,85 115,70 Z" fill="url(#lateBlightRot)"/>
          <path d="M 230,155 C 265,160 270,185 250,200 C 225,205 215,185 230,155 Z" fill="url(#lateBlightRot)"/>
          <!-- White downy sporulation along margin border -->
          <path d="M 115,70 Q 150,85 185,50" stroke="#e8f4d8" stroke-width="2" fill="none" opacity="0.75" stroke-dasharray="3,2"/>
          <path d="M 225,205 Q 255,200 270,185" stroke="#e8f4d8" stroke-width="2" fill="none" opacity="0.75" stroke-dasharray="3,2"/>
        </svg>
      `;
      break;
  }

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent.trim());
}

export const sampleLeaves: SampleLeaf[] = [
  {
    id: 'sample-tomato-early-blight',
    name: 'Tomato Leaf – Early Blight',
    nameTelugu: 'టొమాటో ఆకు – ముందస్తు తెగులు (ఆల్టర్నేరియా)',
    filename: 'tomato_early_blight_sample_01.jpg',
    fileSize: '1.42 MB',
    fileType: 'image/jpeg',
    imageUrl: createLeafSvg('tomato'),
    description: 'Target-like concentric brown spots surrounded by chlorotic yellow margin on lower foliage.',
    descriptionTelugu: 'ఆకులపై వలయాల వంటి గోధుమ రంగు మచ్చలు మరియు పసుపు రంగు వలయాలు.',
    expectedResult: {
      cropName: 'Tomato (Solanum lycopersicum)',
      cropNameTelugu: 'టొమాటో (టమాటా)',
      scientificName: 'Alternaria solani',
      isPlantVisible: true,
      imageQualityStatus: 'good',
      needsExpertInspection: true,
      healthStatus: 'warning',
      healthStatusText: 'Possible Early Blight Fungal Infection',
      healthStatusTextTelugu: 'ఆల్టర్నేరియా శిలీంద్ర తెగులు లక్షణాలు గుర్తించబడ్డాయి',
      diseaseOrSymptom: 'Early Blight (Alternaria solani)',
      diseaseOrSymptomTelugu: 'ఆల్టర్నేరియా ఆకు మచ్చ తెగులు (Early Blight)',
      confidenceScore: 94,
      riskLevel: 'Moderate',
      riskLevelTelugu: 'మధ్యస్థ ప్రమాదం',
      analysisLimitations:
        'Visual pattern aligns with Alternaria solani. Early foliar symptoms can overlap with Septoria leaf spot; verify fungal sporulation on undersides before applying curative fungicides.',
      analysisLimitationsTelugu:
        'ఆల్టర్నేరియా లక్షణాలతో సరిపోలుతోంది. సెప్టోరియా ఆకు మచ్చలతో కూడా కొద్దిగా పోలిక ఉండవచ్చు కాబట్టి రసాయనాలు వాడే ముందు జాగ్రత్తగా పరిశీలించండి.',
      symptoms: [
        'Concentric "bullseye" brown rings on older lower leaves',
        'Chlorotic yellow halos developing around dark necrotic lesions',
        'Premature leaf drop and senescence under damp humid conditions',
        'Leaf margins curling and drying from tips backward',
      ],
      symptomsTelugu: [
        'దిగువ ముసలి ఆకులపై గుండ్రటి వలయాల వంటి గోధుమ రంగు మచ్చలు',
        'మచ్చల చుట్టూ పసుపు రంగు వలయం ఏర్పడటం',
        'తేమతో కూడిన వాతావరణంలో ఆకులు రాలిపోవడం',
        'ఆకు అంచులు క్రమంగా ఎండిపోవడం',
      ],
      causes: {
        environmental: ['High humidity combined with warm afternoon temperatures (24°C–29°C)'],
        environmentalTelugu: ['అధిక తేమ మరియు వెచ్చని ఉష్ణోగ్రతలు'],
        water: ['Overhead splashing water dislodging soil-borne fungal spores onto lower leaves'],
        waterTelugu: ['నీరు చిమ్మడం వల్ల నేలలోని శిలీంద్రాలు ఆకులపై చేరడం'],
        nutrient: ['Stress from depleted nitrogen or potassium in older senescing foliage'],
        nutrientTelugu: ['ముసలి ఆకులలో నత్రజని లేదా పొటాష్ కొరత'],
        pestOrDisease: ['Infection by Alternaria solani fungal spores harboring in crop debris'],
        pestOrDiseaseTelugu: ['ఆల్టర్నేరియా సొలాని శిలీంద్రం పంట వ్యర్థాలలో నిల్వ ఉండటం'],
      },
      recommendedNextSteps: [
        'Prune and safely destroy lower infected leaves touching the soil.',
        'Switch from overhead sprinkler to drip irrigation to keep foliage dry.',
        'Apply copper hydroxide or Mancozeb (2.5g/L) or neem seed kernel extract (5%).',
        'Stake plants to improve air circulation and sunlight penetration.',
      ],
      recommendedNextStepsTelugu: [
        'నేలను తాకుతున్న తెగులు సోకిన కింది ఆకులను కత్తిరించి కాల్చివేయండి.',
        'పైనుండి నీరు చిమ్మకుండా బిందు సేద్యం ద్వారా మాత్రమే నీరందించండి.',
        'మాంకోజెబ్ (2.5 గ్రా/లీటర్) లేదా వేప గింజల కషాయం (5%) పిచికారీ చేయండి.',
        'మొక్కలకు కర్రల సపోర్ట్ ఇచ్చి గాలి, వెలుతురు బాగా తగిలేలా చూడండి.',
      ],
      farmerActionItems: [
        'Inspect surrounding tomato beds to isolate the perimeter within 24 hours.',
        'Avoid working in the field when foliage is wet to prevent spore dissemination.',
        'Ensure soil organic mulch barrier prevents soil-splash of fungal spores.',
        'Consult local Rythu Bharosa Kendra / Extension Officer if lesions advance to stems.',
      ],
      farmerActionItemsTelugu: [
        '24 గంటల్లో సమీపంలోని టమోటా మొక్కలను కూడా పరిశీలించండి.',
        'ఆకులు తడిగా ఉన్నప్పుడు పొలంలో పనులు చేయవద్దు (తెగులు వ్యాప్తి చెందకుండా).',
        'నేల నుండి తెగులు ఆకులకు వ్యాపించకుండా మల్చింగ్ ఏర్పాటు చేయండి.',
        'తెగులు కాండానికి పాకితే వెంటనే గ్రామ వ్యవసాయ అధికారిని సంప్రదించండి.',
      ],
      timestamp: new Date().toISOString(),
      isGemini: false,
      modeUsed: 'demo',
    },
  },
  {
    id: 'sample-rice-healthy',
    name: 'Rice (Paddy) – Healthy Foliage',
    nameTelugu: 'వరి ఆకు – పూర్తి ఆరోగ్యకరమైన స్థితి',
    filename: 'paddy_leaf_healthy_02.png',
    fileSize: '1.85 MB',
    fileType: 'image/png',
    imageUrl: createLeafSvg('rice'),
    description: 'Vibrant uniform chlorophyll, smooth linear venation, zero blast or sheath blight lesions.',
    descriptionTelugu: 'ఆకుపచ్చని ఆకు, ఎలాంటి అగ్గి తెగులు లేదా పొట్ట కుళ్లు తెగులు మచ్చలు లేవు.',
    expectedResult: {
      cropName: 'Paddy / Rice (Oryza sativa)',
      cropNameTelugu: 'వరి (వరి ధాన్యం)',
      scientificName: 'Oryza sativa',
      isPlantVisible: true,
      imageQualityStatus: 'good',
      needsExpertInspection: false,
      healthStatus: 'healthy',
      healthStatusText: 'Optimal Foliar Health & Chlorophyll Vigor',
      healthStatusTextTelugu: 'ఆకు పూర్తిగా ఆరోగ్యంగా మరియు బలంగా ఉంది',
      diseaseOrSymptom: 'No Pathological Symptoms Detected',
      diseaseOrSymptomTelugu: 'ఎలాంటి తెగులు లేదా వ్యాధి లక్షణాలు కనిపించలేదు',
      confidenceScore: 98,
      riskLevel: 'Low',
      riskLevelTelugu: 'తక్కువ ప్రమాదం (ఆరోగ్యకరం)',
      analysisLimitations:
        'Foliage displays prime vegetative vigor. Periodic field monitoring is still recommended during tillering and panicle initiation phases.',
      analysisLimitationsTelugu:
        'ఆకు ఆరోగ్యంగా ఉంది. పిలకలు తొడిగే దశ మరియు చిరుపొట్ట దశలో కూడా ఇలాగే క్రమం తప్పకుండా గమనిస్తూ ఉండండి.',
      symptoms: [
        'Uniform emerald-green coloration throughout the leaf blade',
        'Strong central midrib with intact structural rigidity',
        'Zero spindle-shaped blast lesions or water-soaked sheath spots',
        'Clean leaf tips with no bacterial leaf streak or tip burn',
      ],
      symptomsTelugu: [
        'ఆకు అంతటా సమానమైన స్వచ్ఛమైన ఆకుపచ్చ రంగు',
        'బలమైన ఈనెల నిర్మాణం మరియు నిటారైన ఆకు',
        'అగ్గి తెగులు లేదా బాక్టీరియల్ ఆకు ఎండు తెగులు మచ్చలు లేకపోవడం',
        'ఆకు కొసలు ఎండిపోకుండా ఆరోగ్యంగా ఉండటం',
      ],
      causes: {
        environmental: ['Balanced solar radiation and optimal daytime photosynthetic activity'],
        environmentalTelugu: ['అనుకూలమైన సూర్యరశ్మి మరియు కిరణజన్య సంయోగక్రియ'],
        water: ['Adequate root-zone standing water with proper intermittent aeration'],
        waterTelugu: ['తగినంత నీటి తేమ మరియు వేర్లకు ఆక్సిజన్ అందడం'],
        nutrient: ['Balanced N-P-K nutrient uptake with sufficient micronutrients'],
        nutrientTelugu: ['సమతుల్య పోషకాలు మరియు సూక్ష్మపోషకాలు'],
        pestOrDisease: ['No active fungal mycelium, bacterial streaks, or insect vector presence'],
        pestOrDiseaseTelugu: ['ఎలాంటి తెగులు లేదా పురుగుల దాడి లేదు'],
      },
      recommendedNextSteps: [
        'Maintain balanced nitrogen application; avoid excessive urea which invites blast.',
        'Follow Alternate Wetting and Drying (AWD) irrigation to strengthen roots.',
        'Apply balanced potassium (MOP) to enhance natural disease resistance.',
        'Keep field bunds clean of wild weed hosts (Echinochloa grass).',
      ],
      recommendedNextStepsTelugu: [
        'నత్రజని (యూరియా) మోతాదుకు మించి వాడవద్దు, లేకపోతే అగ్గి తెగులు వచ్చే అవకాశం ఉంది.',
        'ఆరుతడి విధానం (AWD) లో నీరు పెట్టి వేర్లను దృఢపరచండి.',
        'రోగనిరోధక శక్తి పెంచడానికి తగినంత పొటాష్ ఎరువును వేయండి.',
        'గట్లపై కలుపు మొక్కలు లేకుండా శుభ్రంగా ఉంచండి.',
      ],
      farmerActionItems: [
        'Log this scan as a baseline for the current crop cycle.',
        'Monitor field water depth (2–5 cm during panicle initiation).',
        'Scout weekly for early brown planthopper (BPH) or stem borer presence at water level.',
        'No chemical spray required at this stage.',
      ],
      farmerActionItemsTelugu: [
        'ఈ నివేదికను ఆరోగ్యకరమైన రికార్డుగా భద్రపరుచుకోండి.',
        'పొలంలో నీటి మట్టాన్ని సరిగ్గా ఉంచండి (2-5 సెం.మీ).',
        'సుడిదోమ లేదా కాండం తొలిచే పురుగు ఆశించకుండా కాండం దగ్గర గమనిస్తూ ఉండండి.',
        'ప్రస్తుతం ఎలాంటి రసాయన మందులు వాడవలసిన అవసరం లేదు.',
      ],
      timestamp: new Date().toISOString(),
      isGemini: false,
      modeUsed: 'demo',
    },
  },
  {
    id: 'sample-corn-blight',
    name: 'Corn (Maize) – Northern Leaf Blight',
    nameTelugu: 'మొక్కజొన్న – ఆకు ఎండు తెగులు (నార్తర్న్ బ్లైట్)',
    filename: 'corn_northern_blight_sample_03.jpg',
    fileSize: '2.10 MB',
    fileType: 'image/jpeg',
    imageUrl: createLeafSvg('corn'),
    description: 'Long cigar-shaped elliptical grayish-tan lesions running parallel to leaf veins.',
    descriptionTelugu: 'ఆకు ఈనెల వెంబడి చుట్ట ఆకారంలో పొడవాటి బూడిద రంగు మచ్చలు.',
    expectedResult: {
      cropName: 'Maize / Corn (Zea mays)',
      cropNameTelugu: 'మొక్కజొన్న',
      scientificName: 'Exserohilum turcicum',
      isPlantVisible: true,
      imageQualityStatus: 'good',
      needsExpertInspection: true,
      healthStatus: 'warning',
      healthStatusText: 'Northern Corn Leaf Blight (NCLB) Detected',
      healthStatusTextTelugu: 'మొక్కజొన్న ఆకు ఎండు తెగులు లక్షణాలు గుర్తించబడ్డాయి',
      diseaseOrSymptom: 'Northern Corn Leaf Blight (Exserohilum turcicum)',
      diseaseOrSymptomTelugu: 'మొక్కజొన్న ఆకు ఎండు తెగులు (NCLB)',
      confidenceScore: 92,
      riskLevel: 'Moderate',
      riskLevelTelugu: 'మధ్యస్థ ప్రమాదం',
      analysisLimitations:
        'Lesion morphology strongly indicates Exserohilum turcicum. Confirm whether lesions have reached the ear leaf before tassel emergence to determine economic threshold.',
      analysisLimitationsTelugu:
        'లక్షణాలు ఆకు ఎండు తెగులుతో సరిపోలుతున్నాయి. కంకి ఆకు వరకు తెగులు పాకిందో లేదో పరీక్షించి తగిన నివారణ చర్యలు చేపట్టండి.',
      symptoms: [
        'Characteristic elongated cigar-shaped grayish-tan lesions (2.5 to 15 cm)',
        'Lesions restricted between parallel leaf veins with distinct borders',
        'Dark olive-green fungal sporulation visible during humid mornings',
        'Severe reduction of photosynthetic green leaf canopy',
      ],
      symptomsTelugu: [
        'చుట్ట ఆకారంలో పొడవైన బూడిద-గోధుమ రంగు మచ్చలు (2.5 నుండి 15 సెం.మీ)',
        'ఆకు ఈనెల మధ్య మాత్రమే వ్యాపించే పొడవైన ఎండు మచ్చలు',
        'తేమ ఉన్నప్పుడు మచ్చలపై నల్లటి బూజు లక్షణాలు',
        'ఆకుపచ్చని కిరణజన్య సంయోగక్రియ విస్తీర్ణం తగ్గిపోవడం',
      ],
      causes: {
        environmental: ['Prolonged wet weather with moderate temperatures (18°C–27°C) and heavy dews'],
        environmentalTelugu: ['చల్లని వాతావరణం మరియు రాత్రిపూట పడే అధిక మంచు'],
        water: ['Extended free leaf moisture allowing fungal spore germination within 6 hours'],
        waterTelugu: ['ఆకులపై ఎక్కువ సేపు నీటి బిందువులు నిలిచి ఉండటం'],
        nutrient: ['Dense vegetative growth with inadequate potassium-to-nitrogen ratio'],
        nutrientTelugu: ['మొక్కల మధ్య రద్దీ మరియు పొటాష్ లోపం'],
        pestOrDisease: ['Windborne conidia of Exserohilum turcicum from infected crop residue'],
        pestOrDiseaseTelugu: ['గాలి ద్వారా వ్యాపించే ఎక్సెరోహైలమ్ టర్సికమ్ శిలీంద్ర బీజాలు'],
      },
      recommendedNextSteps: [
        'Apply systemic fungicide like Azoxystrobin + Difenoconazole (1ml/L) or Propiconazole.',
        'Ensure spray reaches both upper and lower canopy layers uniformly.',
        'Avoid excessive field density to promote air movement.',
        'Plant resistant hybrids in the subsequent planting season.',
      ],
      recommendedNextStepsTelugu: [
        'అజాక్సిస్ట్రోబిన్ + డైఫెనోకోనజోల్ (1 మి.లీ/లీటర్) లేదా ప్రొపికోనజోల్ పిచికారీ చేయండి.',
        'మందు ద్రావణం పై మరియు కింది ఆకులన్నింటికీ సమానంగా తగిలేలా పిచికారీ చేయండి.',
        'మొక్కల మధ్య తగినంత దూరం ఉండేలా చూసి గాలి వెలుతురు ప్రసరించేలా చూడండి.',
        'తదుపరి పంటకు తెగులును తట్టుకునే విత్తనాలను ఎంచుకోండి.',
      ],
      farmerActionItems: [
        'Calculate economic threshold: If lesions appear on 3rd leaf below ear before tasseling, spray immediately.',
        'Collect representative samples to show the local Agricultural Officer.',
        'Do not retain seed grains from heavily blighted crop patches.',
        'Deep plow field stubble after harvest to bury fungal spores.',
      ],
      farmerActionItemsTelugu: [
        'కంకి కింద మూడవ ఆకుపై కూడా మచ్చలు కనిపిస్తే వెంటనే పిచికారీ చేయండి.',
        'సందేహం ఉంటే నమూనా ఆకును వ్యవసాయ విస్తరణ అధికారికి చూపించండి.',
        'తెగులు సోకిన పంట నుండి విత్తనాలను ఉంచుకోవద్దు.',
        'పంట కోత తర్వాత మిగిలిన వ్యర్థాలను లోతుగా దున్ని నేలలో కలపండి.',
      ],
      timestamp: new Date().toISOString(),
      isGemini: false,
      modeUsed: 'demo',
    },
  },
  {
    id: 'sample-cotton-curl',
    name: 'Cotton Leaf – Leaf Curl Virus',
    nameTelugu: 'పత్తి ఆకు – ఆకు ముడుత తెగులు (వైరస్)',
    filename: 'cotton_leaf_curl_sample_04.jpg',
    fileSize: '1.95 MB',
    fileType: 'image/jpeg',
    imageUrl: createLeafSvg('cotton'),
    description: 'Upward curling of leaf margins, severe vein thickening, and enation cup-shaped outgrowths.',
    descriptionTelugu: 'ఆకు అంచులు పైకి ముడుచుకోవడం, ఈనెలు మందంగా మారడం.',
    expectedResult: {
      cropName: 'Cotton (Gossypium hirsutum)',
      cropNameTelugu: 'పత్తి (దూది పంట)',
      scientificName: 'Cotton Leaf Curl Geminivirus (CLCuV)',
      isPlantVisible: true,
      imageQualityStatus: 'good',
      needsExpertInspection: true,
      healthStatus: 'critical',
      healthStatusText: 'Potential Cotton Leaf Curl Viral Disease',
      healthStatusTextTelugu: 'తీవ్రమైన పత్తి ఆకు ముడుత వైరస్ లక్షణాలు గుర్తించబడ్డాయి',
      diseaseOrSymptom: 'Cotton Leaf Curl Virus (CLCuV) transmitted by Whitefly',
      diseaseOrSymptomTelugu: 'తెల్లదోమ ద్వారా వ్యాపించే పత్తి ఆకు ముడుత వైరస్',
      confidenceScore: 91,
      riskLevel: 'High',
      riskLevelTelugu: 'అధిక ప్రమాదం (తీవ్రమైనది)',
      analysisLimitations:
        'Viral diseases cannot be cured with chemical fungicides. Immediate vector management (whitefly control) is essential to halt horizontal field transmission.',
      analysisLimitationsTelugu:
        'వైరస్ తెగుళ్లకు నేరుగా రసాయన మందులు పనిచేయవు. దీనిని వ్యాప్తి చేసే తెల్లదోమను అరికట్టడం ద్వారా మాత్రమే పంటను కాపాడుకోవచ్చు.',
      symptoms: [
        'Upward and inward curling of leaf margins (boat-shaped cups)',
        'Prominent thickening, swelling and darkening of underlying veins',
        'Enation or small leafy outgrowths developing on vein undersides',
        'Stunted internodal growth and impaired square/boll formation',
      ],
      symptomsTelugu: [
        'ఆకు అంచులు పైకి దోనెలా ముడుచుకుపోవడం',
        'ఆకు అడుగు భాగంలో ఈనెలు ఉబ్బి మందంగా మారడం',
        'ఈనెల కింద చిన్న ఆకుల వంటి బొడిపెలు రావడం',
        'మొక్క ఎదుగుదల ఆగిపోయి పూత, కాత రాలిపోవడం',
      ],
      causes: {
        environmental: ['Warm dry periods facilitating rapid whitefly population reproduction'],
        environmentalTelugu: ['వేడి వాతావరణం తెల్లదోమ సంతతి పెరగడానికి అనుకూలం'],
        water: ['Water-stressed cotton crops exhibiting higher susceptibility to sucking pests'],
        waterTelugu: ['నీటి ఎద్దడి వల్ల మొక్కల రక్షణ వ్యవస్థ బలహీనపడటం'],
        nutrient: ['Excessive vegetative nitrogen rendering tender foliage vulnerable'],
        nutrientTelugu: ['అధిక యూరియా వాడకం వల్ల ఆకులు మృదువుగా మారి పురుగులకు ఆహారంగా మారడం'],
        pestOrDisease: ['Bemisia tabaci (Whitefly) vector transmitting CLCuV virus during sap feeding'],
        pestOrDiseaseTelugu: ['తెల్లదోమలు రసం పీల్చేటప్పుడు వైరస్ ఆకుల్లోకి ప్రవేశించడం'],
      },
      recommendedNextSteps: [
        'Eradicate and burn severely stunted viral reservoir plants immediately.',
        'Install yellow sticky traps (15–20 per acre) to monitor and catch whiteflies.',
        'Spray Diafenthiuron (1g/L) or Flonicamid (0.3g/L) or Spiromesifen to control whitefly vector.',
        'Avoid indiscriminate pyrethroid sprays that eliminate natural whitefly predators.',
      ],
      recommendedNextStepsTelugu: [
        'తీవ్రంగా ముడుచుకుపోయిన మొక్కలను పీకి కాల్చివేయండి.',
        'తెల్లదోమల నివారణకు ఎకరానికి 15-20 పసుపు రంగు జిగురు అట్టలను అమర్చండి.',
        'డయాఫెంథియురాన్ (1 గ్రా/లీ) లేదా ఫ్లోనికామిడ్ (0.3 గ్రా/లీ) పిచికారీ చేయండి.',
        'విచక్షణారహితంగా మందులు కొట్టవద్దు (మిత్రపురుగులు చనిపోతాయి).',
      ],
      farmerActionItems: [
        'Spray during early morning or evening directing nozzles to leaf undersides.',
        'Coordinate pest control with neighboring farmers to avoid pest drift.',
        'Apply 1% neem oil as an ovicide to destroy whitefly nymph clusters.',
        'Notify your local agricultural extension center if widespread in the village.',
      ],
      farmerActionItemsTelugu: [
        'ఉదయం లేదా సాయంత్రం వేళల్లో ఆకుల అడుగు భాగానికి మందు తగిలేలా పిచికారీ చేయండి.',
        'పక్క పొలాల రైతులతో కలిసి ఒకేసారి పిచికారీ చేయడం ఉత్తమం.',
        'తెల్లదోమల గుడ్లు నాశనం కావడానికి 1% వేపనూనె కలిపి పిచికారీ చేయండి.',
        'గ్రామంలో తెగులు ఎక్కువగా ఉంటే వ్యవసాయ అధికారులకు సమాచారం ఇవ్వండి.',
      ],
      timestamp: new Date().toISOString(),
      isGemini: false,
      modeUsed: 'demo',
    },
  },
  {
    id: 'sample-potato-late-blight',
    name: 'Potato Foliage – Late Blight',
    nameTelugu: 'బంగాళాదుంప – లేట్ బ్లైట్ తెగులు (ఆకు ఎండు)',
    filename: 'potato_late_blight_sample_05.jpg',
    fileSize: '1.74 MB',
    fileType: 'image/jpeg',
    imageUrl: createLeafSvg('potato'),
    description: 'Irregular dark water-soaked necrotic patches with whitish downy fungal mildew on reverse.',
    descriptionTelugu: 'ఆకులపై నల్లటి తడి మచ్చలు మరియు చల్లని తేమ వాతావరణంలో వేగంగా వ్యాపించే తెగులు.',
    expectedResult: {
      cropName: 'Potato (Solanum tuberosum)',
      cropNameTelugu: 'బంగాళాదుంప (ఆలుగడ్డ)',
      scientificName: 'Phytophthora infestans',
      isPlantVisible: true,
      imageQualityStatus: 'good',
      needsExpertInspection: true,
      healthStatus: 'critical',
      healthStatusText: 'Severe Late Blight (Phytophthora) Outbreak',
      healthStatusTextTelugu: 'తీవ్రమైన లేట్ బ్లైట్ శిలీంద్ర తెగులు గుర్తించబడింది',
      diseaseOrSymptom: 'Late Blight (Phytophthora infestans)',
      diseaseOrSymptomTelugu: 'లేట్ బ్లైట్ ఆకు కుళ్లు/ఎండు తెగులు',
      confidenceScore: 95,
      riskLevel: 'High',
      riskLevelTelugu: 'అధిక ప్రమాదం (తక్షణ నివారణ అవసరం)',
      analysisLimitations:
        'Phytophthora infestans is an aggressive oomycete pathogen capable of destroying a canopy within 5–7 days in cool humid conditions (>90% RH). Immediate preventive cover required.',
      analysisLimitationsTelugu:
        'చల్లని మరియు తేమతో కూడిన వాతావరణంలో ఈ తెగులు 5-7 రోజుల్లో పొలం మొత్తాన్ని నాశనం చేయగలదు. తక్షణమే చర్యలు చేపట్టాలి.',
      symptoms: [
        'Dark brown to black water-soaked lesions spreading inward from leaf margins',
        'Delicate white fungal downy mold visible on underside during humid mornings',
        'Rapid rotting and foul odor from decaying foliage',
        'Brown necrotic lesions extending to petioles and main stems',
      ],
      symptomsTelugu: [
        'ఆకు అంచుల నుండి లోపలికి వ్యాపించే నల్లటి నీటి మచ్చలు',
        'ఉదయం వేళల్లో ఆకు అడుగు భాగంలో తెల్లటి బూజు వంటి పొర',
        'ఆకులు కుళ్ళిపోయి దుర్వాసన రావడం',
        'కాండాలు మరియు కొమ్మలపై నల్లటి మచ్చలు ఏర్పడటం',
      ],
      causes: {
        environmental: ['Persistent cool temperatures (12°C–20°C) with fog, dew, and RH over 90%'],
        environmentalTelugu: ['చల్లని వాతావరణం, దట్టమైన పొగమంచు మరియు అధిక తేమ'],
        water: ['Prolonged leaf wetness exceeding 8 hours accelerating sporangia germination'],
        waterTelugu: ['ఆకులపై ఎక్కువ సమయం తేమ నిలిచి ఉండటం'],
        nutrient: ['Excessive nitrogen making foliage succulent and easily penetrable by germ tubes'],
        nutrientTelugu: ['అధిక నత్రజని వల్ల ఆకులపై కవచం బలహీనపడటం'],
        pestOrDisease: ['Aggressive oomycete pathogen Phytophthora infestans spreading via motile zoospores'],
        pestOrDiseaseTelugu: ['ఫైటోఫ్తోరా ఇన్ఫెస్టాన్స్ అనే అతి ప్రమాదకరమైన శిలీంద్రం'],
      },
      recommendedNextSteps: [
        'Apply systemic oomycide: Cymoxanil + Mancozeb (3g/L) or Dimethomorph + Mancozeb.',
        'Halt all overhead sprinkler irrigation immediately.',
        'Harvest healthy tubers cautiously and avoid harvesting in wet muddy soil.',
        'Earth up soil ridges to create a physical barrier protecting underground tubers.',
      ],
      recommendedNextStepsTelugu: [
        'సైమోక్సానిల్ + మాంకోజెబ్ (3 గ్రా/లీటర్) లేదా డైమెథోమార్ఫ్ పిచికారీ చేయండి.',
        'పైనుండి నీరు చిలకరించడం వెంటనే ఆపివేయండి.',
        'దుంపలను తవ్వేటప్పుడు జాగ్రత్తగా తవ్వండి, తడి నేలలో తవ్వవద్దు.',
        'దుంపలపైకి నేరుగా తెగులు చేరకుండా మొక్కల మొదళ్లకు మట్టిని ఎగదోయండి.',
      ],
      farmerActionItems: [
        'Destroy severely blighted foliage before tuber harvesting (haulm destruction).',
        'Dip seed tubers in fungicide before the next season planting.',
        'Store harvested potatoes in well-ventilated dry conditions.',
        'Check weather forecast: consecutive cool rainy days demand repeat spray in 7 days.',
      ],
      farmerActionItemsTelugu: [
        'దుంపలు తీయడానికి 10 రోజుల ముందే తెగులు సోకిన ఆకులను కోసి తొలగించండి.',
        'తదుపరి పంటకు విత్తన దుంపలను మందులో శుద్ధి చేసి నాటండి.',
        'నిల్వ చేసే గదులలో గాలి వెలుతురు ఉండేలా చూసుకోండి.',
        'వర్షాలు కొనసాగితే వారం రోజుల తర్వాత మళ్లీ పిచికారీ చేయండి.',
      ],
      timestamp: new Date().toISOString(),
      isGemini: false,
      modeUsed: 'demo',
    },
  },
];
