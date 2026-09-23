import { SoilAnalysisInput, SoilHealthReport, SoilType, SoilNutrientRating } from '../types';

export const SOIL_TYPE_METADATA: Record<SoilType, { name: string; nameTelugu: string; characteristics: string; characteristicsTelugu: string }> = {
  black_cotton: {
    name: 'Black Cotton Soil (Regur)',
    nameTelugu: 'నల్ల రేగడి నేల',
    characteristics: 'High moisture retention, deep cracking in summer, rich in montmorillonite clay and calcium.',
    characteristicsTelugu: 'అధిక తేమ నిలుపుదల సామర్థ్యం, వేసవిలో లోతైన పగుళ్లు, కాల్షియం మరియు బంకమట్టి సమృద్ధిగా ఉంటాయి.',
  },
  red_sandy_loam: {
    name: 'Red Sandy Loam (Chalka)',
    nameTelugu: 'ఎర్ర నేలలు / చెల్కలు',
    characteristics: 'Well-drained, porous, permeable, rich in iron oxides, highly responsive to organic manuring and irrigation.',
    characteristicsTelugu: 'నీరు త్వరగా ఇంకే నేలలు, ఇనుప ధాతువు సమృద్ధి, సేంద్రీయ ఎరువులు మరియు తేలికపాటి తడులకు బాగా అనుకూలం.',
  },
  alluvial: {
    name: 'Alluvial River Delta Soil',
    nameTelugu: 'వరి నేలలు / ఒండ్రు మట్టి నేలలు',
    characteristics: 'Extremely fertile river silt, rich in potash and phosphoric acid, ideal for high-yield irrigated agriculture.',
    characteristicsTelugu: 'నదీ పరివాహక సారవంతమైన ఒండ్రు నేలలు, పొటాష్ సమృద్ధి, వరి మరియు వాణిజ్య పంటలకు అత్యుత్తమం.',
  },
  clay_loam: {
    name: 'Heavy Clay Loam',
    nameTelugu: 'బంకమట్టి నేల',
    characteristics: 'Fine texture, moderate-to-high water holding capacity, requires proper aeration and drainage ditches.',
    characteristicsTelugu: 'సన్నని మట్టి రేణువులు, ఎక్కువ తేమ నిల్వ, మురుగునీరు పోయే సౌకర్యం కల్పించాలి.',
  },
  laterite: {
    name: 'Laterite Soil',
    nameTelugu: 'ఎర్రటి లేటరైట్ నేలలు',
    characteristics: 'Formed under high rainfall, acidic reaction, low nitrogen and potash, suitable for plantation crops.',
    characteristicsTelugu: 'ఎక్కువ వర్షపాతం వల్ల ఏర్పడే ఆమ్ల నేలలు, సేంద్రీయ పదార్ధం తక్కువ, తోట పంటలకు అనుకూలం.',
  },
  coastal_sandy: {
    name: 'Coastal Sandy Soil',
    nameTelugu: 'తీరప్రాంత ఇసుక నేలలు',
    characteristics: 'Coarse sand, very low water holding capacity, rapid leaching, ideal for drip fertigation and tuber crops.',
    characteristicsTelugu: 'ముతక ఇసుక, తేమ నిలువ ఉండదు, డ్రిప్ ఫెర్టిగేషన్ ద్వారా నీరు మరియు ఎరువులు ఇవ్వాలి.',
  },
};

export const SOIL_PRESETS: Array<{ id: string; label: string; labelTelugu: string; values: SoilAnalysisInput }> = [
  {
    id: 'guntur_chilli_cotton',
    label: 'Guntur Black Soil (Chilli / Cotton)',
    labelTelugu: 'గుంటూరు నల్లరేగడి నేల (మిరప / పత్తి)',
    values: {
      soilType: 'black_cotton',
      pH: 7.4,
      nitrogen: 245,
      phosphorus: 22,
      potassium: 310,
      moisture: 48,
      organicCarbon: 0.58,
      fieldPlotName: 'South Field (Plot A)',
      targetCrop: 'Chilli / Cotton',
    },
  },
  {
    id: 'telangana_red_chalka',
    label: 'Telangana Red Sandy Loam (Maize / Groundnut)',
    labelTelugu: 'తెలంగాణ ఎర్ర చెల్క నేల (మొక్కజొన్న / వేరుశనగ)',
    values: {
      soilType: 'red_sandy_loam',
      pH: 6.3,
      nitrogen: 210,
      phosphorus: 14,
      potassium: 190,
      moisture: 32,
      organicCarbon: 0.45,
      fieldPlotName: 'North Block (Plot 2)',
      targetCrop: 'Groundnut / Maize',
    },
  },
  {
    id: 'godavari_delta_paddy',
    label: 'Godavari Alluvial Delta (Paddy / Sugarcane)',
    labelTelugu: 'గోదావరి డెల్టా ఒండ్రు నేల (వరి / చెరకు)',
    values: {
      soilType: 'alluvial',
      pH: 6.9,
      nitrogen: 320,
      phosphorus: 28,
      potassium: 260,
      moisture: 65,
      organicCarbon: 0.82,
      fieldPlotName: 'Canal Wet Plot (Plot 1)',
      targetCrop: 'Paddy',
    },
  },
  {
    id: 'rayalaseema_dry_loam',
    label: 'Rayalaseema Dry Red Soil (Groundnut / Millets)',
    labelTelugu: 'రాయలసీమ మెట్ట ఎర్ర నేల (వేరుశనగ / చిరుధాన్యాలు)',
    values: {
      soilType: 'red_sandy_loam',
      pH: 7.8,
      nitrogen: 180,
      phosphorus: 12,
      potassium: 220,
      moisture: 24,
      organicCarbon: 0.38,
      fieldPlotName: 'Borewell Plot 3',
      targetCrop: 'Groundnut',
    },
  },
];

/**
 * Evaluates soil health based on ICAR and ANGRAU/PJTSAU agronomic standards.
 * Provides balanced organic amendments and prevents unsafe fertilizer recommendations.
 */
export function analyzeSoilHealth(input: SoilAnalysisInput): SoilHealthReport {
  const { pH, nitrogen, phosphorus, potassium, moisture, soilType } = input;

  // 1. pH Assessment
  let phStatus: 'acidic' | 'slightly_acidic' | 'optimal' | 'slightly_alkaline' | 'alkaline' = 'optimal';
  let phLabel = 'Neutral & Optimal (6.5 – 7.5)';
  let phLabelTelugu = 'తటస్థ & అనుకూలం (6.5 – 7.5)';
  let phCorrectionAdvice = 'pH is in the ideal availability zone for all primary, secondary, and micronutrients. Maintain with farmyard manure.';
  let phCorrectionAdviceTelugu = 'మట్టి pH అన్ని రకాల పోషకాల లభ్యతకు అత్యంత అనుకూలంగా ఉంది. సేంద్రీయ ఎరువులతో స్థిరంగా ఉంచండి.';

  if (pH < 5.5) {
    phStatus = 'acidic';
    phLabel = 'Strongly Acidic (pH < 5.5)';
    phLabelTelugu = 'తీవ్రమైన ఆమ్ల నేల (pH < 5.5)';
    phCorrectionAdvice = 'Apply Agricultural Lime (CaCO3) @ 1.5–2.0 tons/acre before pre-sowing ploughing. Avoid acid-forming fertilizers like Ammonium Sulfate.';
    phCorrectionAdviceTelugu = 'ఎకరానికి 1.5 - 2 టన్నుల వ్యవసాయ సున్నం వేసి దున్నండి. అమోనియం సల్ఫేట్ వంటి ఆమ్ల స్వభావ ఎరువులను నివారించండి.';
  } else if (pH < 6.5) {
    phStatus = 'slightly_acidic';
    phLabel = 'Slightly Acidic (6.0 – 6.5)';
    phLabelTelugu = 'స్వల్ప ఆమ్ల నేల (6.0 – 6.5)';
    phCorrectionAdvice = 'Broadcast 250–400 kg/acre Dolomite or agricultural lime and incorporate with 4 tons of well-rotted FYM.';
    phCorrectionAdviceTelugu = 'ఎకరానికి 250-400 కేజీల డోలమైట్ లేదా సున్నం వేసి, 4 టన్నుల పశువుల ఎరువుతో కలపండి.';
  } else if (pH > 8.5) {
    phStatus = 'alkaline';
    phLabel = 'Strongly Alkaline / Sodic (pH > 8.5)';
    phLabelTelugu = 'తీవ్రమైన క్షార / చౌడు నేల (pH > 8.5)';
    phCorrectionAdvice = 'Apply Agricultural Gypsum (CaSO4.2H2O) @ 2.0–3.5 tons/acre followed by deep ponding and leaching. Grow green manure crops like Daincha.';
    phCorrectionAdviceTelugu = 'ఎకరానికి 2 - 3.5 టన్నుల వ్యవసాయ జిప్సం వేసి నీరు నింపి బయటకు వదలండి (లీచింగ్). జీలుగా వంటి పచ్చిరొట్ట ఎరువులు సాగు చేయండి.';
  } else if (pH > 7.5) {
    phStatus = 'slightly_alkaline';
    phLabel = 'Slightly Alkaline (7.5 – 8.5)';
    phLabelTelugu = 'స్వల్ప క్షార నేల (7.5 – 8.5)';
    phCorrectionAdvice = 'Incorporate 5 tons of well-rotted farmyard manure, pressmud, or Jeevamrutham to release organic acids and unlock micronutrients.';
    phCorrectionAdviceTelugu = 'ఎకరానికి 5 టన్నుల పశువుల ఎరువు లేదా ప్రెస్‌మడ్ మరియు జీవామృతం అందించి సూక్ష్మపోషకాల లభ్యతను పెంచండి.';
  }

  // 2. Nutrients evaluation
  // Nitrogen (Low < 280, Med 280-560, High > 560)
  const nRating: SoilNutrientRating = {
    value: nitrogen,
    unit: 'kg/ha',
    status: nitrogen < 280 ? 'low' : nitrogen > 560 ? 'excessive' : 'optimal',
    benchmark: 'Optimal Range: 280 – 560 kg/ha',
    advice:
      nitrogen < 280
        ? 'Nitrogen is deficient. Incorporate Daincha green manure and apply Neem-coated urea in 3-4 split doses during peak tillering/branching.'
        : nitrogen > 560
        ? 'Nitrogen is excessive! High N causes vegetative succulence, making crops highly prone to sucking pests like thrips and stem rot. Suspend urea.'
        : 'Nitrogen level is optimal. Maintain current split-application schedule.',
    adviceTelugu:
      nitrogen < 280
        ? 'నత్రజని లోపించింది. జీలుగా పచ్చిరొట్ట పైరు వేయండి, యూరియాను వేపపూతతో 3-4 సమ విడతలుగా మాత్రమే వేయండి.'
        : nitrogen > 560
        ? 'నత్రజని ఎక్కువగా ఉంది! అధిక యూరియా వల్ల పంట ఏపుగా పెరిగి ఆకుముడత, పురుగుల బెడద పెరుగుతుంది. యూరియా వాడకం ఆపండి.'
        : 'నత్రజని తగిన మోతాదులో ఉంది. సాధారణ షెడ్యూల్ పాటించండి.',
  };

  // Phosphorus (Low < 11, Med 11-25, High > 25)
  const pRating: SoilNutrientRating = {
    value: phosphorus,
    unit: 'kg/ha',
    status: phosphorus < 11 ? 'low' : phosphorus > 25 ? 'excessive' : 'optimal',
    benchmark: 'Optimal Range: 11 – 25 kg/ha',
    advice:
      phosphorus < 11
        ? 'Phosphorus is low. Apply Single Super Phosphate (SSP) as a basal placement directly near the root zone along with Phosphate Solubilizing Bacteria (PSB).'
        : phosphorus > 25
        ? 'Phosphorus is abundantly high. Excess phosphate inhibits zinc and iron uptake. Withhold DAP/complex fertilizers for this season.'
        : 'Phosphorus is well-balanced for robust root establishment and early vegetative vigor.',
    adviceTelugu:
      phosphorus < 11
        ? 'భాస్వరం తక్కువగా ఉంది. విత్తే సమయంలో సింగిల్ సూపర్ ఫాస్ఫేట్ (SSP) మరియు PSB బ్యాక్టీరియాను వేర్ల దగ్గర పడేలా వేయండి.'
        : phosphorus > 25
        ? 'భాస్వరం ఎక్కువగా ఉంది. ఎక్కువైతే జింక్, ఇనుము లోపాలు వస్తాయి. ఈ సీజన్‌లో DAP లేదా కాంప్లెక్స్ ఎరువుల వాడకం తగ్గించండి.'
        : 'భాస్వరం సరైన మోతాదులో ఉంది. వేర్లు బలంగా పెరగడానికి అనుకూలం.',
  };

  // Potassium (Low < 110, Med 110-280, High > 280)
  const kRating: SoilNutrientRating = {
    value: potassium,
    unit: 'kg/ha',
    status: potassium < 110 ? 'low' : potassium > 280 ? 'excessive' : 'optimal',
    benchmark: 'Optimal Range: 110 – 280 kg/ha',
    advice:
      potassium < 110
        ? 'Potassium is low. Apply Muriate of Potash (MOP) split across early and grain/fruit filling stages to bolster disease and drought resistance.'
        : potassium > 280
        ? 'Potassium is in rich supply. Soil has strong mineral reserves; reduce external potash applications.'
        : 'Potassium is in the sweet spot for strong plant stems, pest immunity, and optimal fruit weight.',
    adviceTelugu:
      potassium < 110
        ? 'పొటాష్ తక్కువగా ఉంది. కాయ ఊరే దశలో మరియు పూత దశలో మ్యూరేట్ ఆఫ్ పొటాష్ (MOP) ఎరువును అందించండి.'
        : potassium > 280
        ? 'పొటాష్ సమృద్ధిగా ఉంది. అదనపు పొటాష్ ఎరువుల ఖర్చును తగ్గించుకోవచ్చు.'
        : 'పొటాష్ సమతుల్యంగా ఉంది. మొక్క రోగనిరోధక శక్తికి, నాణ్యమైన దిగుబడికి ఇది మంచిది.',
  };

  // Moisture evaluation
  const moistureRating = {
    percentage: moisture,
    status: (moisture < 30 ? 'dry' : moisture > 70 ? 'waterlogged' : 'optimal') as 'dry' | 'optimal' | 'waterlogged',
    advice:
      moisture < 30
        ? 'Soil moisture is low. Apply light irrigation through drip or furrow to preserve microbial activity and prevent wilting.'
        : moisture > 70
        ? 'Soil is saturated / waterlogged! Drain excess water immediately to avoid root rot and Pythium damping-off.'
        : 'Soil moisture is in the optimal root aeration range (40–60%). Maintain consistent intervals.',
    adviceTelugu:
      moisture < 30
        ? 'నేలలో తేమ తక్కువగా ఉంది. డ్రిప్ లేదా కాల్వల ద్వారా తేలికపాటి తడి అందించండి.'
        : moisture > 70
        ? 'పొలంలో నీరు ఎక్కువగా నిలిచింది! వేరుకుళ్లు తెగులు రాకుండా వెంటనే మురుగునీటిని బయటకు పంపండి.'
        : 'నేలలో తేమ మరియు గాలి సమతుల్యంగా ఉన్నాయి. మొక్క ఆరోగ్యంగా పెరుగుతుంది.',
  };

  // 3. Calculate Overall Soil Health Score (0 - 100)
  let score = 50;

  // pH score (up to 25 pts)
  if (pH >= 6.5 && pH <= 7.5) score += 25;
  else if ((pH >= 6.0 && pH < 6.5) || (pH > 7.5 && pH <= 8.0)) score += 18;
  else if ((pH >= 5.5 && pH < 6.0) || (pH > 8.0 && pH <= 8.5)) score += 10;
  else score += 3;

  // N score (up to 25 pts)
  if (nRating.status === 'optimal') score += 25;
  else score += 12;

  // P score (up to 25 pts)
  if (pRating.status === 'optimal') score += 25;
  else score += 14;

  // K score (up to 25 pts)
  if (kRating.status === 'optimal') score += 25;
  else score += 15;

  score = Math.min(100, Math.max(15, Math.round(score * 0.8)));

  let rating: 'excellent' | 'good' | 'moderate' | 'poor' = 'good';
  let ratingLabel = 'Good Soil Health';
  let ratingLabelTelugu = 'మంచి నేల ఆరోగ్యం';

  if (score >= 80) {
    rating = 'excellent';
    ratingLabel = 'Prime Agricultural Fertility';
    ratingLabelTelugu = 'అత్యుత్తమ సారవంతమైన నేల';
  } else if (score >= 65) {
    rating = 'good';
    ratingLabel = 'Good Agro-Fertility';
    ratingLabelTelugu = 'మంచి సారవంతమైన నేల';
  } else if (score >= 50) {
    rating = 'moderate';
    ratingLabel = 'Moderate Fertility (Needs Organic Inputs)';
    ratingLabelTelugu = 'మోస్తరు సారం (సేంద్రీయ ఎరువులు అవసరం)';
  } else {
    rating = 'poor';
    ratingLabel = 'Degraded / Requires Soil Reclamation';
    ratingLabelTelugu = 'సారం తగ్గిన నేల (సవరింపు చర్యలు అవసరం)';
  }

  // 4. Crop Suitability Ranking
  const cropSuitability = getSuitabilityList(soilType, pH, nitrogen, phosphorus, potassium);

  // 5. Soil Amendment & Organic Care Plan
  const amendmentPlan = {
    organic: [
      'Incorporate 4–5 tons/acre well-decomposed Farmyard Manure (FYM) or 2 tons Vermicompost before final tillage.',
      'Sow green manuring crops (Daincha / Sunnhemp) at onset of rains and plough in-situ at 45 days (flowering stage) to add 80 kg natural Nitrogen.',
      'Drench soil with Jeevamrutham (200 Litres/acre) every 15–20 days to multiply native beneficial micro-organisms.',
      'Apply Trichoderma viride and Pseudomonas fluorescens (2 kg each mixed in 200 kg FYM) to naturally suppress root rot and wilt pathogens.',
    ],
    organicTelugu: [
      'ఆఖరి దుక్కిలో ఎకరానికి 4 - 5 టన్నుల చివికిన పశువుల ఎరువు లేదా 2 టన్నుల వర్మీకంపోస్ట్ వేయండి.',
      'తొలకరిలో జీలుగా లేదా జనుము విత్తి 45 రోజుల పూత దశలో కలియదున్నడం ద్వారా ఎకరానికి 80 కేజీల సహజ నత్రజని లభిస్తుంది.',
      'ప్రతి 15-20 రోజులకు ఒకసారి ఎకరానికి 200 లీటర్ల జీవామృతం నీటి తడులతో అందించండి.',
      'వేరుకుళ్లు, ఎండు తెగుళ్ల నివారణకు ట్రైకోడెర్మా విరిడే మరియు సూడోమోనాస్ (చెరో 2 కేజీలు 200 కేజీల పశువుల ఎరువులో కలిపి) నేలలో వేయండి.',
    ],
    chemicalCaution: [
      'Never apply un-decomposed raw animal manure or fresh poultry litter, as it causes severe nitrogen burn and pathogen infestation.',
      'Perform soil test verification at your nearest Rythu Bharosa Kendra (RBK) or Krishi Vigyan Kendra (KVK) before buying high-cost complex fertilizers.',
      'Always use Neem-coated Urea to prevent rapid nitrate leaching into ground water and reduce application losses by 20–25%.',
    ],
    chemicalCautionTelugu: [
      'పచ్చి పేడ లేదా కోళ్ల వ్యర్థాలను నేరుగా పొలంలో వేయకండి, ఇది వేరు పురుగు మరియు వేడిని పుట్టిస్తుంది.',
      'ఖరీదైన ఎరువులు కొనే ముందు మీ సమీప రైతు భరోసా కేంద్రం (RBK) లేదా కృషి విజ్ఞాన కేంద్రం (KVK) లో నేల నమూనా పరీక్ష చేయించండి.',
      'యూరియా కొట్టుకుపోకుండా ఎల్లప్పుడూ వేపపూత పూసిన యూరియానే వాడండి.',
    ],
  };

  const meta = SOIL_TYPE_METADATA[soilType] || SOIL_TYPE_METADATA.black_cotton;

  return {
    overallScore: score,
    rating,
    ratingLabel,
    ratingLabelTelugu,
    soilTypeLabel: meta.name,
    soilTypeLabelTelugu: meta.nameTelugu,
    phAssessment: {
      status: phStatus,
      label: phLabel,
      labelTelugu: phLabelTelugu,
      correctionAdvice: phCorrectionAdvice,
      correctionAdviceTelugu: phCorrectionAdviceTelugu,
    },
    nutrients: {
      nitrogen: nRating,
      phosphorus: pRating,
      potassium: kRating,
    },
    moistureAssessment: moistureRating,
    cropSuitability,
    amendmentPlan,
    disclaimer:
      'Agronomic advisory estimate based on ICAR and state agricultural university benchmarks. Not a substitute for a certified NABL laboratory soil test. Visit your nearest Rythu Bharosa Kendra (RBK) or KVK for a government Soil Health Card.',
    disclaimerTelugu:
      'ఈ విశ్లేషణ వ్యవసాయ విశ్వవిద్యాలయాల మార్గదర్శకాల ఆధారంగా రూపొందించిన అంచనా మాత్రమే. ఖచ్చితమైన వివరాల కోసం మీ గ్రామ రైతు భరోసా కేంద్రం (RBK) లేదా KVK వద్ద భూసార పరీక్ష చేయించుకోండి.',
    timestamp: new Date().toISOString(),
  };
}

function getSuitabilityList(
  soilType: SoilType,
  pH: number,
  nitrogen: number,
  phosphorus: number,
  potassium: number
) {
  const isNeutral = pH >= 6.2 && pH <= 7.8;
  const hasGoodPotash = potassium >= 110;

  switch (soilType) {
    case 'black_cotton':
      return [
        {
          cropName: 'Chilli (మిరప)',
          cropNameTelugu: 'మిరప',
          suitabilityPercent: isNeutral && hasGoodPotash ? 94 : 85,
          reason: 'Deep black soil provides excellent calcium and moisture retention, producing superior pod color and pungency.',
          reasonTelugu: 'నల్లరేగడి నేలలో కాల్షియం మరియు తేమ నిలుపుదల మిరప కాయ నాణ్యతకు, రంగుకు అత్యంత అనుకూలం.',
          category: 'cash_crop' as const,
        },
        {
          cropName: 'Cotton (పత్తి)',
          cropNameTelugu: 'పత్తి',
          suitabilityPercent: isNeutral ? 95 : 88,
          reason: 'Deep clay profile supports deep taproot expansion and optimal boll burst opening without moisture stress.',
          reasonTelugu: 'లోతైన నల్లరేగడి నేల పత్తి తల్లివేరు లోతుగా దిగడానికి, కాయలు బాగా పగలడానికి దోహదపడుతుంది.',
          category: 'cash_crop' as const,
        },
        {
          cropName: 'Bengal Gram / Chickpea (శనగ)',
          cropNameTelugu: 'శనగ',
          suitabilityPercent: pH >= 7.0 && pH <= 8.2 ? 92 : 82,
          reason: 'Thrives in residual moisture of black soil during Rabi season; root nodules fix atmospheric nitrogen.',
          reasonTelugu: 'రబీలో నల్లరేగడి తేమతో శనగ అద్భుతంగా పండుతుంది, నేలలో నత్రజని స్థిరీకరణ జరుగుతుంది.',
          category: 'pulse' as const,
        },
        {
          cropName: 'Maize (మొక్కజొన్న)',
          cropNameTelugu: 'మొక్కజొన్న',
          suitabilityPercent: 86,
          reason: 'High nutrient responsiveness, requires good furrow drainage to prevent seedling damping.',
          reasonTelugu: 'అధిక పోషకాలను తీసుకునే శక్తి, నీరు నిలవకుండా బోదెలు తీస్తే అధిక దిగుబడి వస్తుంది.',
          category: 'grain' as const,
        },
      ];

    case 'red_sandy_loam':
      return [
        {
          cropName: 'Groundnut (వేరుశనగ)',
          cropNameTelugu: 'వేరుశనగ',
          suitabilityPercent: pH >= 6.0 && pH <= 7.5 ? 94 : 84,
          reason: 'Porous friable structure allows effortless peg penetration into soil and uniform pod development.',
          reasonTelugu: 'వదులైన ఎర్ర నేలల్లో ఊడలు సులభంగా మట్టిలోకి దిగి కాయలు గుత్తులుగా బాగా ఊరుతాయి.',
          category: 'cash_crop' as const,
        },
        {
          cropName: 'Maize (మొక్కజొన్న)',
          cropNameTelugu: 'మొక్కజొన్న',
          suitabilityPercent: 90,
          reason: 'Porous drainage prevents root asphyxiation; responds vigorously to split fertigation.',
          reasonTelugu: 'మురుగునీటి సమస్య ఉండదు, సమతుల్య ఎరువులతో ఎర్ర నేలలో దిగుబడి బాగా వస్తుంది.',
          category: 'grain' as const,
        },
        {
          cropName: 'Tomato & Vegetables (టమాటా & కూరగాయలు)',
          cropNameTelugu: 'టమాటా & కూరగాయలు',
          suitabilityPercent: 88,
          reason: 'Excellent root zone aeration, quick harvest turnover, responsive to drip irrigation.',
          reasonTelugu: 'వేర్లకు మంచి గాలి లభిస్తుంది, డ్రిప్ పద్ధతిలో అధిక దిగుబడులు సాధించవచ్చు.',
          category: 'horticulture' as const,
        },
        {
          cropName: 'Millets / Ragi (చిరుధాన్యాలు / రాగులు)',
          cropNameTelugu: 'రాగులు & చిరుధాన్యాలు',
          suitabilityPercent: 92,
          reason: 'Drought hardy, low fertilizer requirements, perfect fit for rainfed red soil tracts.',
          reasonTelugu: 'తక్కువ నీటితో, తక్కువ పెట్టుబడితో ఎర్ర నేలల్లో ధైర్యంగా పండించవచ్చు.',
          category: 'grain' as const,
        },
      ];

    case 'alluvial':
      return [
        {
          cropName: 'Paddy / Rice (వరి)',
          cropNameTelugu: 'వరి',
          suitabilityPercent: 96,
          reason: 'Fine silt texture provides superior puddleability, holding standing water with minimal percolation loss.',
          reasonTelugu: 'ఒండ్రు నేలలు దమ్ము చేయడానికి అత్యుత్తమం, నీటిని నిలిపి ఉంచి మంచి పిలకలు రావడానికి సహాయపడతాయి.',
          category: 'grain' as const,
        },
        {
          cropName: 'Sugarcane (చెరకు)',
          cropNameTelugu: 'చెరకు',
          suitabilityPercent: 92,
          reason: 'Heavy biomass production supported by rich alluvial silt layers and high water availability.',
          reasonTelugu: 'సారవంతమైన ఒండ్రు నేలలో చెరకు గడలు లావుగా పెరిగి చక్కెర శాతం పెరుగుతుంది.',
          category: 'cash_crop' as const,
        },
        {
          cropName: 'Banana (అరటి)',
          cropNameTelugu: 'అరటి',
          suitabilityPercent: 90,
          reason: 'Continuous moisture and nutrient availability in delta plains produce heavy bunches.',
          reasonTelugu: 'డెల్టా నేలలో పుష్కలమైన పోషకాల వల్ల పెద్ద అరటి గెలలు వస్తాయి.',
          category: 'horticulture' as const,
        },
        {
          cropName: 'Turmeric (పసుపు)',
          cropNameTelugu: 'పసుపు',
          suitabilityPercent: 89,
          reason: 'Rich organic silt enhances rhizome expansion and curcumin percentage.',
          reasonTelugu: 'ఒండ్రు నేలలో పసుపు కొమ్ములు లావుగా ఊరి కర్కుమిన్ శాతం పెరుగుతుంది.',
          category: 'cash_crop' as const,
        },
      ];

    default:
      return [
        {
          cropName: 'Paddy (వరి)',
          cropNameTelugu: 'వరి',
          suitabilityPercent: 85,
          reason: 'Widely adaptable with appropriate bunding and irrigation management.',
          reasonTelugu: 'తగిన నీటి యాజమాన్యంతో సాగు చేయవచ్చు.',
          category: 'grain' as const,
        },
        {
          cropName: 'Groundnut (వేరుశనగ)',
          cropNameTelugu: 'వేరుశనగ',
          suitabilityPercent: 82,
          reason: 'Good performance with light frequent watering.',
          reasonTelugu: 'తేలికపాటి తడులతో మంచి దిగుబడి సాధించవచ్చు.',
          category: 'cash_crop' as const,
        },
        {
          cropName: 'Pulses (పప్పుదినుసులు)',
          cropNameTelugu: 'పప్పుదినుసులు',
          suitabilityPercent: 88,
          reason: 'Improves soil health through symbiotic nitrogen fixation.',
          reasonTelugu: 'నేలలో నత్రజనిని పెంచి భూసారాన్ని కాపాడుతాయి.',
          category: 'pulse' as const,
        },
      ];
  }
}
