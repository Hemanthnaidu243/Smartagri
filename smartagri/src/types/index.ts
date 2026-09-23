export type Language = 'en' | 'te';

export type AppMode = 'demo' | 'real_ai';

export type ThemeMode = 'light' | 'dark' | 'system';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'uncertain';

export type ImageQualityGrade = 'good' | 'fair' | 'poor';

export interface PossibleCauses {
  environmental: string[];
  environmentalTelugu: string[];
  water: string[];
  waterTelugu: string[];
  nutrient: string[];
  nutrientTelugu: string[];
  pestOrDisease: string[];
  pestOrDiseaseTelugu: string[];
}

export interface CropAnalysisResult {
  cropName: string;
  cropNameTelugu: string;
  scientificName?: string;
  isPlantVisible: boolean;
  imageQualityStatus: ImageQualityGrade;
  needsExpertInspection: boolean;
  healthStatus: HealthStatus;
  healthStatusText: string;
  healthStatusTextTelugu: string;
  diseaseOrSymptom: string;
  diseaseOrSymptomTelugu: string;
  confidenceScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Uncertain';
  riskLevelTelugu: string;
  analysisLimitations: string;
  analysisLimitationsTelugu: string;
  symptoms: string[];
  symptomsTelugu: string[];
  causes?: PossibleCauses;
  recommendedNextSteps: string[];
  recommendedNextStepsTelugu: string[];
  farmerActionItems: string[];
  farmerActionItemsTelugu: string[];
  preventiveTips?: string[];
  preventiveTipsTelugu?: string[];
  isGemini?: boolean;
  modeUsed?: AppMode;
  modelUsed?: string;
  timestamp: string;
}

export interface ImageQualityIssue {
  type: 'dark' | 'bright' | 'blurry' | 'low_res' | 'good';
  title: string;
  titleTelugu: string;
  description: string;
  descriptionTelugu: string;
  tip: string;
  tipTelugu: string;
  canAutoFix: boolean;
}

export interface ImageEnhancementState {
  isEnhanced: boolean;
  brightnessBoost: number; // percentage (e.g. +35%)
  contrastBoost: number;
  sharpnessApplied: boolean;
  algorithmSummary: string;
  algorithmSummaryTelugu: string;
}

export interface ImageQualityReport {
  brightness: number; // 0 - 255
  blurScore: number; // estimated sharpness index
  width: number;
  height: number;
  status: ImageQualityGrade;
  lightingLabel: string;
  lightingLabelTelugu: string;
  clarityLabel: string;
  clarityLabelTelugu: string;
  issues: ImageQualityIssue[];
  warnings: string[];
  warningsTelugu: string[];
  isAcceptable: boolean;
  canEnhance: boolean;
}

export interface UploadedImageInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  dataUrl: string; // Active image (enhanced if applied, or original)
  originalDataUrl?: string; // Always preserved for comparison & fallback
  isEnhanced?: boolean;
  enhancementState?: ImageEnhancementState;
  uploadedAt: string;
  source: 'upload' | 'camera' | 'dragdrop' | 'sample';
  qualityReport?: ImageQualityReport;
  result?: CropAnalysisResult;
}

export interface FarmerProfile {
  name: string;
  location: string;
  farmSize: string;
  primaryCrops: string[];
  soilType: string;
  irrigationSource: string;
  preferredLanguage: Language;
}

export interface FarmingReminder {
  id: string;
  title: string;
  titleTelugu: string;
  category: 'sowing' | 'irrigation' | 'inspection' | 'fertilizer' | 'harvest';
  dueDate: string;
  crop: string;
  completed: boolean;
  notes: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  conditionTelugu: string;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  sprayAdvisory: 'optimal' | 'caution' | 'hazardous';
  sprayAdvisoryText: string;
  sprayAdvisoryTextTelugu: string;
  forecast: Array<{
    day: string;
    dayTelugu: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
    rainChance: number;
  }>;
}

export interface CropRecommendationInput {
  soilType: string;
  location: string;
  season: string;
  waterAvailability: string;
  avgTemperature: string;
  cropPreference?: string;
}

export interface CropSuggestion {
  id: string;
  name: string;
  nameTelugu: string;
  suitabilityScore: number;
  season: string;
  seasonTelugu: string;
  durationDays: string;
  waterRequirement: string;
  waterRequirementTelugu: string;
  expectedYield: string;
  keyAdvice: string;
  keyAdviceTelugu: string;
  marketDemand: 'High' | 'Medium';
}

export interface KnowledgeArticle {
  id: string;
  category: 'disease' | 'organic' | 'soil' | 'water' | 'fertilizer' | 'sustainability';
  title: string;
  titleTelugu: string;
  summary: string;
  summaryTelugu: string;
  readTime: string;
  keyTakeaways: string[];
  keyTakeawaysTelugu: string[];
  details: string;
  detailsTelugu: string;
}

export interface ExtensionContact {
  id: string;
  title: string;
  titleTelugu: string;
  subtitle: string;
  subtitleTelugu: string;
  phone: string;
  timing: string;
  timingTelugu: string;
  category: 'helpline' | 'government' | 'university' | 'whatsapp';
  description: string;
  descriptionTelugu: string;
}

export interface VoiceAssistantQuery {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  textTelugu?: string;
  timestamp: string;
  isLoading?: boolean;
}

// ---------------- NEW FEATURE TYPES ----------------

export interface LiveWeatherData {
  location: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  apparentTemperature?: number;
  relativeHumidity: number; // %
  precipitation: number; // mm
  rain: number; // mm
  weatherCode: number;
  weatherCondition: string;
  weatherConditionTelugu: string;
  windSpeed: number; // km/h
  sprayAdvisory: 'optimal' | 'caution' | 'hazardous';
  sprayAdvisoryText: string;
  sprayAdvisoryTextTelugu: string;
  sprayFactors: {
    windSafe: boolean;
    rainRisk: boolean;
    humiditySafe: boolean;
  };
  irrigationGuidance: {
    recommendation: string;
    recommendationTelugu: string;
    wateringUrgency: 'low' | 'moderate' | 'high' | 'postpone';
    soilMoistureLossEstimate: 'low' | 'moderate' | 'high';
    optimalTime: string;
    optimalTimeTelugu: string;
  };
  dailyForecast: Array<{
    date: string;
    day: string;
    dayTelugu: string;
    weatherCode: number;
    condition: string;
    conditionTelugu: string;
    tempHigh: number;
    tempLow: number;
    precipitationProbability: number;
    precipitationSum: number;
    sprayWindow: 'optimal' | 'caution' | 'hazardous';
  }>;
  lastUpdated: string;
}

export type SoilType =
  | 'black_cotton'
  | 'red_sandy_loam'
  | 'clay_loam'
  | 'alluvial'
  | 'laterite'
  | 'coastal_sandy';

export interface SoilAnalysisInput {
  soilType: SoilType;
  pH: number;
  nitrogen: number; // kg/ha (100 - 600)
  phosphorus: number; // kg/ha (5 - 90)
  potassium: number; // kg/ha (50 - 550)
  moisture: number; // % (10 - 90)
  organicCarbon?: number; // % (0.2 - 1.5)
  fieldPlotName?: string;
  targetCrop?: string;
}

export interface SoilNutrientRating {
  value: number;
  unit: string;
  status: 'low' | 'optimal' | 'excessive';
  benchmark: string;
  advice: string;
  adviceTelugu: string;
}

export interface SoilHealthReport {
  overallScore: number; // 0 - 100
  rating: 'excellent' | 'good' | 'moderate' | 'poor';
  ratingLabel: string;
  ratingLabelTelugu: string;
  soilTypeLabel: string;
  soilTypeLabelTelugu: string;
  phAssessment: {
    status: 'acidic' | 'slightly_acidic' | 'optimal' | 'slightly_alkaline' | 'alkaline';
    label: string;
    labelTelugu: string;
    correctionAdvice: string;
    correctionAdviceTelugu: string;
  };
  nutrients: {
    nitrogen: SoilNutrientRating;
    phosphorus: SoilNutrientRating;
    potassium: SoilNutrientRating;
  };
  moistureAssessment: {
    percentage: number;
    status: 'dry' | 'optimal' | 'waterlogged';
    advice: string;
    adviceTelugu: string;
  };
  cropSuitability: Array<{
    cropName: string;
    cropNameTelugu: string;
    suitabilityPercent: number;
    reason: string;
    reasonTelugu: string;
    category: 'grain' | 'cash_crop' | 'horticulture' | 'pulse';
  }>;
  amendmentPlan: {
    organic: string[];
    organicTelugu: string[];
    chemicalCaution: string[];
    chemicalCautionTelugu: string[];
  };
  disclaimer: string;
  disclaimerTelugu: string;
  timestamp: string;
}

export interface WeeklyGrowthPhoto {
  id: string;
  date: string;
  weekNumber: number;
  imageUrl: string;
  stage: string;
  stageTelugu: string;
  heightCm?: number;
  notes: string;
  pestObservations?: string;
  waterGivenLiters?: number;
}

export interface CropJournalRecord {
  id: string;
  cropName: string;
  cropNameTelugu: string;
  variety: string;
  sowingDate: string; // YYYY-MM-DD
  plotName: string;
  areaAcres: number;
  soilType: string;
  currentStage: 'germination' | 'vegetative' | 'flowering' | 'grain_filling' | 'maturity' | 'harvested';
  currentStageLabel: string;
  currentStageLabelTelugu: string;
  daysElapsed: number;
  estimatedDurationDays: number;
  growthProgressPercent: number;
  photos: WeeklyGrowthPhoto[];
  notes: string;
  targetHarvestDate: string;
  updatedAt: string;
}
