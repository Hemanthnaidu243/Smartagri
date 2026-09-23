import React, { useState } from 'react';
import {
  Layers,
  FlaskConical,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Sparkles,
  Droplets,
  BookmarkCheck,
  ShieldCheck,
  RotateCcw,
  Sliders,
  FileCheck,
} from 'lucide-react';
import { Language, SoilAnalysisInput, SoilHealthReport, SoilType } from '../types';
import {
  analyzeSoilHealth,
  SOIL_PRESETS,
  SOIL_TYPE_METADATA,
} from '../services/soilService';

interface SoilHealthAnalyzerProps {
  language: Language;
  onShowToast?: (msg: string) => void;
}

export const SoilHealthAnalyzer: React.FC<SoilHealthAnalyzerProps> = ({ language }) => {
  const [inputValues, setInputValues] = useState<SoilAnalysisInput>({
    soilType: 'black_cotton',
    pH: 7.2,
    nitrogen: 280,
    phosphorus: 18,
    potassium: 240,
    moisture: 45,
    organicCarbon: 0.65,
    fieldPlotName: 'Main Farm Plot',
    targetCrop: 'Chilli / Cotton',
  });

  const [activePreset, setActivePreset] = useState<string>('guntur_chilli_cotton');
  const [report, setReport] = useState<SoilHealthReport>(() => analyzeSoilHealth(inputValues));

  const handleInputChange = (field: keyof SoilAnalysisInput, value: any) => {
    const updated = { ...inputValues, [field]: value };
    setInputValues(updated);
    setReport(analyzeSoilHealth(updated));
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = SOIL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      setInputValues(preset.values);
      setReport(analyzeSoilHealth(preset.values));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 65) return 'text-teal-500 stroke-teal-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-500/40 mb-3">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'భూసార విశ్లేషణ మరియు పంట సిఫార్సు' : 'ICAR-Standard Soil Fertility Engine'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'te' ? 'స్మార్ట్ సాయిల్ హెల్త్ ఎనలైజర్' : 'Smart Soil Health & Fertility Analyzer'}
          </h2>
          <p className="mt-2 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            {language === 'te'
              ? 'మీ పొలం మట్టి pH, నత్రజని (N), భాస్వరం (P), పొటాష్ (K) మరియు తేమ వివరాలను నమోదు చేసి, శాస్త్రీయ భూసార నివేదిక మరియు అనువైన పంటల సలహాను పొందండి.'
              : 'Evaluate soil pH, NPK balance, moisture, and soil profile. Receive scientific fertility index scores, custom amendment roadmaps, and crop suitability rankings.'}
          </p>
        </div>
      </div>

      {/* Quick Sample Presets */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{language === 'te' ? 'ప్రాంతీయ నేల నమూనా ప్రిసెట్‌లు (1-క్లిక్ టెస్ట్):' : 'Regional Soil Sample Presets (1-Click Test):'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SOIL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`text-left p-3 rounded-2xl border transition text-xs font-medium flex items-center justify-between ${
                activePreset === preset.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:border-emerald-400'
              }`}
            >
              <div>
                <div className="font-bold">{language === 'te' ? preset.labelTelugu : preset.label}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  pH {preset.values.pH} • N {preset.values.nitrogen} • P {preset.values.phosphorus}
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 ${activePreset === preset.id ? 'text-emerald-600' : 'text-zinc-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Form & Visual Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Input Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-base">
              <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {language === 'te' ? 'నేల పారామితుల నమోదు' : 'Soil Input Parameters'}
            </h3>
            <button
              onClick={() => handleApplyPreset('guntur_chilli_cotton')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              {language === 'te' ? 'రీసెట్' : 'Reset'}
            </button>
          </div>

          {/* Soil Type Select */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              {language === 'te' ? 'నేల రకం (Soil Type)' : 'Soil Type'}
            </label>
            <select
              value={inputValues.soilType}
              onChange={(e) => handleInputChange('soilType', e.target.value as SoilType)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="black_cotton">Black Cotton Soil (నల్ల రేగడి నేల)</option>
              <option value="red_sandy_loam">Red Sandy Loam (ఎర్ర చెల్క నేలలు)</option>
              <option value="alluvial">Alluvial Delta Soil (ఒండ్రు మట్టి నేల)</option>
              <option value="clay_loam">Heavy Clay Loam (బంకమట్టి నేల)</option>
              <option value="laterite">Laterite Soil (లేటరైట్ నేల)</option>
              <option value="coastal_sandy">Coastal Sandy Soil (ఇసుక నేల)</option>
            </select>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {language === 'te'
                ? SOIL_TYPE_METADATA[inputValues.soilType]?.characteristicsTelugu
                : SOIL_TYPE_METADATA[inputValues.soilType]?.characteristics}
            </p>
          </div>

          {/* pH Slider & Value */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {language === 'te' ? 'నేల రసాయన చర్య (Soil pH)' : 'Soil Reaction (pH)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                {inputValues.pH}
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="9.5"
              step="0.1"
              value={inputValues.pH}
              onChange={(e) => handleInputChange('pH', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-semibold">
              <span>Acidic (4.0)</span>
              <span className="text-emerald-600 dark:text-emerald-400">Ideal (6.5 - 7.5)</span>
              <span>Alkaline (9.5)</span>
            </div>
          </div>

          {/* Nitrogen (N) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {language === 'te' ? 'నత్రజని (Nitrogen - N)' : 'Available Nitrogen (N)'}
              </label>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{inputValues.nitrogen} kg/ha</span>
            </div>
            <input
              type="range"
              min="100"
              max="650"
              step="5"
              value={inputValues.nitrogen}
              onChange={(e) => handleInputChange('nitrogen', parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
              <span>Low (&lt; 280)</span>
              <span className="text-emerald-600 font-medium">Optimum (280 - 560)</span>
              <span>High (&gt; 560)</span>
            </div>
          </div>

          {/* Phosphorus (P) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {language === 'te' ? 'భాస్వరం (Phosphorus - P2O5)' : 'Available Phosphorus (P)'}
              </label>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{inputValues.phosphorus} kg/ha</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={inputValues.phosphorus}
              onChange={(e) => handleInputChange('phosphorus', parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
              <span>Low (&lt; 11)</span>
              <span className="text-emerald-600 font-medium">Optimum (11 - 25)</span>
              <span>High (&gt; 25)</span>
            </div>
          </div>

          {/* Potassium (K) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {language === 'te' ? 'పొటాషియం (Potassium - K2O)' : 'Available Potassium (K)'}
              </label>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{inputValues.potassium} kg/ha</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={inputValues.potassium}
              onChange={(e) => handleInputChange('potassium', parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
              <span>Low (&lt; 110)</span>
              <span className="text-emerald-600 font-medium">Optimum (110 - 280)</span>
              <span>High (&gt; 280)</span>
            </div>
          </div>

          {/* Soil Moisture */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                {language === 'te' ? 'నేలలో తేమ శాతం (Moisture)' : 'Current Soil Moisture'}
              </label>
              <span className="text-xs font-bold text-sky-600">{inputValues.moisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={inputValues.moisture}
              onChange={(e) => handleInputChange('moisture', parseInt(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field Plot Label */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {language === 'te' ? 'మడి / సర్వే నంబర్ (ఐచ్ఛికం)' : 'Plot Name / Field ID (Optional)'}
            </label>
            <input
              type="text"
              value={inputValues.fieldPlotName || ''}
              onChange={(e) => handleInputChange('fieldPlotName', e.target.value)}
              placeholder="e.g., East Acre Borewell Plot"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right Column: Visual Dashboard & Suitability (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overall Health Score Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-zinc-100 dark:stroke-zinc-800"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${getScoreColor(report.overallScore)} transition-all duration-700`}
                    strokeDasharray={`${report.overallScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                    {report.overallScore}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">/ 100</span>
                </div>
              </div>

              {/* Status & Summary */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? report.ratingLabelTelugu : report.ratingLabel}</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-2">
                  {language === 'te' ? report.soilTypeLabelTelugu : report.soilTypeLabel}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {language === 'te' ? report.phAssessment.correctionAdviceTelugu : report.phAssessment.correctionAdvice}
                </p>
              </div>
            </div>

            {/* pH Assessment Ribbon */}
            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  {language === 'te' ? 'pH స్థితి:' : 'pH Status:'}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {language === 'te' ? report.phAssessment.labelTelugu : report.phAssessment.label}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-gradient-to-r from-rose-400 via-emerald-400 to-indigo-500 relative">
                {/* Pointer marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white rounded-full shadow-md"
                  style={{ left: `${Math.min(96, Math.max(4, ((inputValues.pH - 4) / (9.5 - 4)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* N-P-K Nutrient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nitrogen */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-zinc-500">Nitrogen (N)</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    report.nutrients.nitrogen.status === 'optimal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {report.nutrients.nitrogen.status}
                </span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {report.nutrients.nitrogen.value} <span className="text-xs font-normal text-zinc-400">kg/ha</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-tight">
                {language === 'te' ? report.nutrients.nitrogen.adviceTelugu : report.nutrients.nitrogen.advice}
              </p>
            </div>

            {/* Phosphorus */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-zinc-500">Phosphorus (P)</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    report.nutrients.phosphorus.status === 'optimal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {report.nutrients.phosphorus.status}
                </span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {report.nutrients.phosphorus.value} <span className="text-xs font-normal text-zinc-400">kg/ha</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-tight">
                {language === 'te' ? report.nutrients.phosphorus.adviceTelugu : report.nutrients.phosphorus.advice}
              </p>
            </div>

            {/* Potassium */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-zinc-500">Potassium (K)</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    report.nutrients.potassium.status === 'optimal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {report.nutrients.potassium.status}
                </span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {report.nutrients.potassium.value} <span className="text-xs font-normal text-zinc-400">kg/ha</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-tight">
                {language === 'te' ? report.nutrients.potassium.adviceTelugu : report.nutrients.potassium.advice}
              </p>
            </div>
          </div>

          {/* Crop Suitability Matrix */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-base">
                <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {language === 'te' ? 'ఈ నేలకు అత్యంత అనుకూలమైన పంటలు' : 'Ranked Crop Suitability'}
              </h3>
              <span className="text-xs text-zinc-400 font-medium">ICAR Compatibility</span>
            </div>

            <div className="space-y-3">
              {report.cropSuitability.map((crop) => (
                <div
                  key={crop.cropName}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">
                      {crop.cropName}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {crop.suitabilityPercent}% Match
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mb-2">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${crop.suitabilityPercent}%` }}
                    />
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {language === 'te' ? crop.reasonTelugu : crop.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Organic Soil Reclamation & Improvement Plan */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-6">
            <h4 className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 text-sm mb-3">
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {language === 'te' ? 'సేంద్రీయ భూసార వృద్ధి కార్యాచరణ' : 'Recommended Soil Improvement Practices'}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-900 dark:text-emerald-300">
              {(language === 'te' ? report.amendmentPlan.organicTelugu : report.amendmentPlan.organic).map(
                (tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Laboratory Testing Disclaimer */}
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-zinc-900 dark:text-white">
                {language === 'te' ? 'గమనిక / నిరాకరణ:' : 'Official Agronomic Disclaimer:'}{' '}
              </span>
              {language === 'te' ? report.disclaimerTelugu : report.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
