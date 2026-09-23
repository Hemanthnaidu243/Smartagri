import { WeatherData, FarmingReminder, CropSuggestion, CropRecommendationInput, FarmerProfile } from '../types';

export const regionWeatherMap: Record<string, WeatherData> = {
  Guntur: {
    location: 'Guntur Agro-Meteorological Station',
    temperature: 29,
    condition: 'Partly Cloudy with Mild Breeze',
    conditionTelugu: 'పాక్షికంగా మేఘావృతం, అనుకూలమైన గాలి',
    humidity: 62,
    rainfall: 15,
    windSpeed: 8,
    sprayAdvisory: 'optimal',
    sprayAdvisoryText: 'Optimal window for foliar spray. Wind is mild (<10 km/h) with low precipitation risk.',
    sprayAdvisoryTextTelugu: 'మందుల పిచికారీకి అత్యంత అనుకూలమైన సమయం. గాలి వేగం తక్కువగా ఉంది (8 కి.మీ/గం).',
    forecast: [
      { day: 'Today', dayTelugu: 'ఈరోజు', tempHigh: 31, tempLow: 23, condition: 'Partly Cloudy', rainChance: 15 },
      { day: 'Tomorrow', dayTelugu: 'రేపు', tempHigh: 32, tempLow: 24, condition: 'Sunny', rainChance: 10 },
      { day: 'Wed', dayTelugu: 'బుధవారం', tempHigh: 33, tempLow: 24, condition: 'Clear Sky', rainChance: 10 },
      { day: 'Thu', dayTelugu: 'గురువారం', tempHigh: 30, tempLow: 22, condition: 'Scattered Showers', rainChance: 40 },
      { day: 'Fri', dayTelugu: 'శుక్రవారం', tempHigh: 29, tempLow: 22, condition: 'Light Rain', rainChance: 60 },
      { day: 'Sat', dayTelugu: 'శనివారం', tempHigh: 31, tempLow: 23, condition: 'Passing Clouds', rainChance: 20 },
      { day: 'Sun', dayTelugu: 'ఆదివారం', tempHigh: 32, tempLow: 24, condition: 'Sunny & Clear', rainChance: 10 },
    ],
  },
  Warangal: {
    location: 'Warangal Agricultural Research Station',
    temperature: 28,
    condition: 'Overcast with High Humidity',
    conditionTelugu: 'మేఘావృతం, గాలిలో అధిక తేమ',
    humidity: 78,
    rainfall: 45,
    windSpeed: 14,
    sprayAdvisory: 'caution',
    sprayAdvisoryText: 'Caution advised. Relative humidity is high; delay systemic sprays if cloud cover deepens.',
    sprayAdvisoryTextTelugu: 'జాగ్రత్త అవసరం. తేమ శాతం ఎక్కువగా ఉంది; వర్ష సూచన ఉంటే పిచికారీని వాయిదా వేయండి.',
    forecast: [
      { day: 'Today', dayTelugu: 'ఈరోజు', tempHigh: 29, tempLow: 22, condition: 'Overcast', rainChance: 45 },
      { day: 'Tomorrow', dayTelugu: 'రేపు', tempHigh: 28, tempLow: 21, condition: 'Showers', rainChance: 70 },
      { day: 'Wed', dayTelugu: 'బుధవారం', tempHigh: 27, tempLow: 21, condition: 'Thunderstorms', rainChance: 80 },
      { day: 'Thu', dayTelugu: 'గురువారం', tempHigh: 30, tempLow: 22, condition: 'Rain', rainChance: 55 },
      { day: 'Fri', dayTelugu: 'శుక్రవారం', tempHigh: 31, tempLow: 23, condition: 'Partly Cloudy', rainChance: 25 },
      { day: 'Sat', dayTelugu: 'శనివారం', tempHigh: 32, tempLow: 23, condition: 'Clear Sky', rainChance: 15 },
      { day: 'Sun', dayTelugu: 'ఆదివారం', tempHigh: 33, tempLow: 24, condition: 'Sunny', rainChance: 10 },
    ],
  },
  Vijayawada: {
    location: 'Krishna Delta Agro-Climate Zone',
    temperature: 31,
    condition: 'Warm & Sunny',
    conditionTelugu: 'ఎండగా మరియు వెచ్చగా ఉంది',
    humidity: 58,
    rainfall: 5,
    windSpeed: 7,
    sprayAdvisory: 'optimal',
    sprayAdvisoryText: 'Excellent conditions for herbicide or biostimulant application.',
    sprayAdvisoryTextTelugu: 'ఎరువులు లేదా సస్యరక్షణ మందుల పిచికారీకి అనుకూలమైన పరిస్థితులు.',
    forecast: [
      { day: 'Today', dayTelugu: 'ఈరోజు', tempHigh: 33, tempLow: 24, condition: 'Sunny', rainChance: 5 },
      { day: 'Tomorrow', dayTelugu: 'రేపు', tempHigh: 33, tempLow: 25, condition: 'Sunny', rainChance: 5 },
      { day: 'Wed', dayTelugu: 'బుధవారం', tempHigh: 34, tempLow: 25, condition: 'Sunny & Hot', rainChance: 5 },
      { day: 'Thu', dayTelugu: 'గురువారం', tempHigh: 32, tempLow: 24, condition: 'Partly Cloudy', rainChance: 20 },
      { day: 'Fri', dayTelugu: 'శుక్రవారం', tempHigh: 31, tempLow: 23, condition: 'Passing Clouds', rainChance: 30 },
      { day: 'Sat', dayTelugu: 'శనివారం', tempHigh: 32, tempLow: 24, condition: 'Clear', rainChance: 10 },
      { day: 'Sun', dayTelugu: 'ఆదివారం', tempHigh: 33, tempLow: 24, condition: 'Sunny', rainChance: 10 },
    ],
  },
};

export const defaultReminders: FarmingReminder[] = [
  {
    id: 'rem-1',
    title: 'Top-dressing Zinc Sulphate on Paddy Block A',
    titleTelugu: 'వరి బ్లాక్-A లో జింక్ సల్ఫేట్ ఎరువు వేయడం',
    category: 'fertilizer',
    dueDate: '2026-09-25',
    crop: 'Paddy (BPT 5204)',
    completed: false,
    notes: 'Apply 10 kg/acre mixed with dry sand 20 days after transplanting.',
  },
  {
    id: 'rem-2',
    title: 'Check Soil Moisture & Initiate Evening Drip Cycle',
    titleTelugu: 'నేల తేమను పరిశీలించి సాయంత్రం డ్రిప్ ఆన్ చేయడం',
    category: 'irrigation',
    dueDate: '2026-09-23',
    crop: 'Tomato & Chillies',
    completed: false,
    notes: 'Target 65% field capacity during flowering phase.',
  },
  {
    id: 'rem-3',
    title: 'Install Yellow Sticky Traps for Whitefly Scouting',
    titleTelugu: 'పత్తిలో తెల్లదోమ గుర్తింపు కోసం పసుపు రంగు జిగురు అట్టలు అమర్చడం',
    category: 'inspection',
    dueDate: '2026-09-24',
    crop: 'Cotton',
    completed: true,
    notes: '20 traps per acre at canopy height to track whitefly migration.',
  },
  {
    id: 'rem-4',
    title: 'Plan Harvest & Tuber Drying Tarpaulins',
    titleTelugu: 'పంట కోత మరియు ఆరబెట్టే టార్పాలిన్ల ఏర్పాటు',
    category: 'harvest',
    dueDate: '2026-09-30',
    crop: 'Groundnut (K6)',
    completed: false,
    notes: 'Inspect pod maturity black inner ring before pulling vines.',
  },
];

export const defaultProfile: FarmerProfile = {
  name: 'Ramesh Rao',
  location: 'Guntur, Andhra Pradesh',
  farmSize: '5.5 Acres',
  primaryCrops: ['Tomato', 'Paddy (Rice)', 'Cotton', 'Chillies'],
  soilType: 'Black Cotton Soil',
  irrigationSource: 'Borewell & Drip Network',
  preferredLanguage: 'en',
};

export function getCropRecommendations(input: CropRecommendationInput): CropSuggestion[] {
  const suggestions: CropSuggestion[] = [];

  const isBlack = input.soilType.toLowerCase().includes('black');
  const isRed = input.soilType.toLowerCase().includes('red');
  const isAlluvial = input.soilType.toLowerCase().includes('alluvial');
  const isKharif = input.season.toLowerCase().includes('kharif');
  const isRabi = input.season.toLowerCase().includes('rabi');
  const isSummer = input.season.toLowerCase().includes('zaid') || input.season.toLowerCase().includes('summer');
  const isAbundant = input.waterAvailability.toLowerCase().includes('abundant');

  if (isBlack) {
    suggestions.push({
      id: 'sug-cotton',
      name: 'Bt Cotton (High-Yield Hybrid)',
      nameTelugu: 'హైబ్రిడ్ పత్తి (బిటి కాటన్)',
      suitabilityScore: 96,
      season: 'Kharif',
      seasonTelugu: 'ఖరీఫ్',
      durationDays: '150–160 Days',
      waterRequirement: 'Medium (500–700 mm)',
      waterRequirementTelugu: 'మధ్యస్థం (500-700 మి.మీ)',
      expectedYield: '12–15 Quintals / Acre',
      keyAdvice: 'Deep black soils have optimal moisture retention for cotton taproot development.',
      keyAdviceTelugu: 'నల్ల రేగడి నేలలలో తేమ ఎక్కువ కాలం నిల్వ ఉండి పత్తి వేర్లకు బలం చేకూరుస్తుంది.',
      marketDemand: 'High',
    });
    suggestions.push({
      id: 'sug-chilli',
      name: 'Guntur Sannam Chillies (Spicy Variety)',
      nameTelugu: 'గుంటూరు సన్నం మిరప',
      suitabilityScore: 92,
      season: 'Kharif / Rabi',
      seasonTelugu: 'ఖరీఫ్ / రబీ',
      durationDays: '150–180 Days',
      waterRequirement: 'Medium with Drip',
      waterRequirementTelugu: 'బిందు సేద్యంతో మధ్యస్థం',
      expectedYield: '25–30 Quintals (Dry) / Acre',
      keyAdvice: 'Ensure raised bed planting with plastic mulch to safeguard against collar rot.',
      keyAdviceTelugu: 'మొక్క కుళ్లు తెగులు రాకుండా ఎత్తైన మడులు మరియు మల్చింగ్ వాడండి.',
      marketDemand: 'High',
    });
  }

  if (isAlluvial || isAbundant) {
    suggestions.push({
      id: 'sug-paddy',
      name: 'Fine Grain Paddy (BPT 5204 / Samba Mahsuri)',
      nameTelugu: 'సాంబా మసూరి వరి (BPT 5204)',
      suitabilityScore: 95,
      season: 'Kharif / Rabi',
      seasonTelugu: 'ఖరీఫ్ / రబీ',
      durationDays: '135–145 Days',
      waterRequirement: 'High (1100–1250 mm)',
      waterRequirementTelugu: 'ఎక్కువ (1100-1250 మి.మీ)',
      expectedYield: '28–32 Bags (75kg) / Acre',
      keyAdvice: 'Adopt Alternate Wetting & Drying (AWD) to curtail methane emissions and conserve 25% water.',
      keyAdviceTelugu: 'ఆరుతడి విధానం పాటించి 25% నీటిని ఆదా చేయండి.',
      marketDemand: 'High',
    });
  }

  if (isRed || !isAbundant) {
    suggestions.push({
      id: 'sug-groundnut',
      name: 'Spanish Groundnut (K-6 / Kadiri)',
      nameTelugu: 'వేరుశనగ (కదిరి రకం)',
      suitabilityScore: 94,
      season: 'Kharif / Rabi',
      seasonTelugu: 'ఖరీఫ్ / రబీ',
      durationDays: '105–115 Days',
      waterRequirement: 'Low to Moderate (400–500 mm)',
      waterRequirementTelugu: 'తక్కువ నుండి మధ్యస్థం',
      expectedYield: '14–18 Quintals / Acre',
      keyAdvice: 'Well-drained sandy loam soil allows effortless peg penetration and uniform pod development.',
      keyAdviceTelugu: 'ఇసుక నేలల్లో ఊడలు సులభంగా దిగి కాయలు సమానంగా ఎదుగుతాయి.',
      marketDemand: 'High',
    });
  }

  // Universal resilient crops
  suggestions.push({
    id: 'sug-maize',
    name: 'Hybrid Maize / Corn (DHM 117)',
    nameTelugu: 'హైబ్రిడ్ మొక్కజొన్న (DHM 117)',
    suitabilityScore: 89,
    season: isSummer ? 'Summer (Zaid)' : 'Kharif / Rabi',
    seasonTelugu: isSummer ? 'వేసవి (జాయద్)' : 'ఖరీఫ్ / రబీ',
    durationDays: '110–120 Days',
    waterRequirement: 'Moderate (500–600 mm)',
    waterRequirementTelugu: 'మధ్యస్థం (500-600 మి.మీ)',
    expectedYield: '30–35 Quintals / Acre',
    keyAdvice: 'Scout regularly for early Fall Armyworm whorl feeding and apply Metarhizium bio-fungus.',
    keyAdviceTelugu: 'లద్దె పురుగు ఆశించకుండా సుడిలో పరిశీలిస్తూ జీవ సంబంధిత మందులు వాడండి.',
    marketDemand: 'Medium',
  });

  suggestions.push({
    id: 'sug-greengram',
    name: 'Green Gram / Moong Pulse (LGG 460)',
    nameTelugu: 'పెసలు (LGG 460 రకం)',
    suitabilityScore: 88,
    season: 'Rabi / Summer Catch Crop',
    seasonTelugu: 'రబీ / వేసవి పైరు',
    durationDays: '65–70 Days',
    waterRequirement: 'Low (250–350 mm)',
    waterRequirementTelugu: 'చాలా తక్కువ (250-350 మి.మీ)',
    expectedYield: '6–8 Quintals / Acre',
    keyAdvice: 'Short duration catch crop that fixes atmospheric nitrogen, restoring depleted soils.',
    keyAdviceTelugu: 'తక్కువ కాలంలో చేతికి వచ్చే పంట, నేలలో నత్రజని స్థిరీకరించి భూసారాన్ని పెంచుతుంది.',
    marketDemand: 'High',
  });

  return suggestions;
}
