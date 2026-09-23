import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  RefreshCw,
  Search,
  Navigation,
  Clock,
  Calendar,
  Compass,
  Thermometer,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { LiveWeatherData, Language } from '../types';
import { getLiveWeather, POPULAR_AGRO_REGIONS } from '../services/weatherService';

interface WeatherAdvisoryProps {
  language: Language;
  onShowToast?: (msg: string) => void;
}

export const WeatherAdvisory: React.FC<WeatherAdvisoryProps> = ({ language }) => {
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLocationName, setActiveLocationName] = useState<string>('Guntur, Andhra Pradesh');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const fetchWeather = async (q?: string, lat?: number, lon?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLiveWeather({ q, lat, lon });
      setWeatherData(data);
      if (q) {
        setActiveLocationName(q);
      } else if (data.location) {
        setActiveLocationName(data.location);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'te'
            ? 'వాతావరణ కేంద్రం నుండి సమాచారం పొందలేకపోయాము. దయచేసి రీట్రై క్లిక్ చేయండి.'
            : 'Unable to retrieve live meteorological data. Please click Retry.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Guntur');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchWeather(searchQuery.trim());
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'te' ? 'మీ బ్రౌజర్‌లో GPS సపోర్ట్ లేదు.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(undefined, latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setError(
          language === 'te'
            ? 'GPS లొకేషన్ యాక్సెస్ అనుమతించబడలేదు. దయచేసి జిల్లా పేరును సెర్చ్ చేయండి.'
            : 'GPS location access denied or unavailable. Please search by your district or town name.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getWeatherIcon = (code: number, className = 'w-8 h-8') => {
    if (code === 0 || code === 1) return <Sun className={`${className} text-amber-500`} />;
    if (code === 2 || code === 3) return <Cloud className={`${className} text-sky-400`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-500`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-indigo-500`} />;
    if (code >= 95) return <AlertTriangle className={`${className} text-purple-500`} />;
    return <Cloud className={`${className} text-emerald-500`} />;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Location Quick Select */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'te' ? 'జిల్లా లేదా గ్రామం పేరు నమోదు చేయండి (ఉదా: Guntur, Warangal)...' : 'Search farm district or town (e.g., Guntur, Warangal)...'}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>{language === 'te' ? 'శోధించండి' : 'Search'}</span>
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? (language === 'te' ? 'లొకేషన్ వెతుకుతోంది...' : 'Locating GPS...') : (language === 'te' ? 'నా స్థానం (GPS)' : 'My GPS')}</span>
            </button>
            <button
              onClick={() => fetchWeather(activeLocationName)}
              disabled={loading}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition disabled:opacity-50"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Popular Agricultural Hub Chips */}
        <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            {language === 'te' ? 'రైతు కేంద్రాలు:' : 'Agro Hubs:'}
          </span>
          <div className="flex gap-1.5 flex-nowrap">
            {POPULAR_AGRO_REGIONS.map((region) => (
              <button
                key={region.name}
                onClick={() => {
                  setSearchQuery(region.name);
                  fetchWeather(region.name, region.lat, region.lon);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
                  activeLocationName.toLowerCase().includes(region.name.toLowerCase())
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-72 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="h-72 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
              {language === 'te' ? 'వాతావరణ కేంద్రం అందుబాటులో లేదు' : 'Weather Service Notification'}
            </h4>
            <p className="text-amber-800 dark:text-amber-300 text-sm mt-1">{error}</p>
            <button
              onClick={() => fetchWeather('Guntur')}
              className="mt-3 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition"
            >
              {language === 'te' ? 'మళ్లీ ప్రయత్నించండి (గుంటూరు)' : 'Retry with Guntur Hub'}
            </button>
          </div>
        </div>
      )}

      {/* Live Weather Card & Advisory Dashboard */}
      {weatherData && !loading && (
        <div className="space-y-6">
          {/* Main Top Cards: Current Weather & Spraying/Irrigation Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-Time Observation Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl">
              {/* Subtle background graphic */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Location and Live Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {weatherData.location}
                    </h2>
                    <span className="text-xs bg-emerald-700/60 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                      {weatherData.country || 'India'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    GPS: {weatherData.latitude.toFixed(3)}°N, {weatherData.longitude.toFixed(3)}°E • Live Satellite Station
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                    <Clock className="w-3 h-3" />
                    {new Date(weatherData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Core Temperature & Weather Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                    {getWeatherIcon(weatherData.weatherCode, 'w-16 h-16')}
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-5xl sm:text-6xl font-black tracking-tight">{weatherData.temperature}</span>
                      <span className="text-2xl font-semibold text-emerald-200 ml-1">°C</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-100 mt-1">
                      {language === 'te' ? weatherData.weatherConditionTelugu : weatherData.weatherCondition}
                    </div>
                    {weatherData.apparentTemperature !== undefined && (
                      <div className="text-xs text-emerald-200/70 mt-0.5">
                        {language === 'te' ? 'అనిపించే ఉష్ణోగ్రత:' : 'Feels like:'} {weatherData.apparentTemperature}°C
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Agricultural Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-sky-300 shrink-0" />
                    <div>
                      <div className="text-xs text-emerald-200/70">{language === 'te' ? 'గాలిలో తేమ' : 'Humidity'}</div>
                      <div className="text-base font-bold text-white">{weatherData.relativeHumidity}%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-teal-300 shrink-0" />
                    <div>
                      <div className="text-xs text-emerald-200/70">{language === 'te' ? 'గాలి వేగం' : 'Wind Speed'}</div>
                      <div className="text-base font-bold text-white">{weatherData.windSpeed} km/h</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CloudRain className="w-5 h-5 text-blue-300 shrink-0" />
                    <div>
                      <div className="text-xs text-emerald-200/70">{language === 'te' ? 'వర్షపాతం' : 'Precipitation'}</div>
                      <div className="text-base font-bold text-white">{weatherData.precipitation} mm</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
                    <div>
                      <div className="text-xs text-emerald-200/70">{language === 'te' ? 'డ్రిఫ్ట్ భద్రత' : 'Drift Risk'}</div>
                      <div className="text-base font-bold text-white">
                        {weatherData.windSpeed < 14 ? (language === 'te' ? 'సురక్షితం' : 'Low') : (language === 'te' ? 'ఎక్కువ' : 'High')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Spraying Advisory Window Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-base">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    {language === 'te' ? 'మందుల పిచికారీ సలహా' : 'Foliar Spray Advisory'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      weatherData.sprayAdvisory === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : weatherData.sprayAdvisory === 'caution'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {weatherData.sprayAdvisory === 'optimal' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {weatherData.sprayAdvisory === 'caution' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {weatherData.sprayAdvisory === 'hazardous' && <XCircle className="w-3.5 h-3.5" />}
                    {weatherData.sprayAdvisory === 'optimal'
                      ? (language === 'te' ? 'అనుకూలం' : 'OPTIMAL')
                      : weatherData.sprayAdvisory === 'caution'
                      ? (language === 'te' ? 'జాగ్రత్త' : 'CAUTION')
                      : (language === 'te' ? 'వద్దని సలహా' : 'HAZARDOUS')}
                  </span>
                </div>

                <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {language === 'te' ? weatherData.sprayAdvisoryTextTelugu : weatherData.sprayAdvisoryText}
                </p>

                {/* Checklist factors */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                    <span className="text-zinc-600 dark:text-zinc-400">{language === 'te' ? 'గాలి వేగం (< 14 km/h)' : 'Wind Drift (< 14 km/h)'}</span>
                    <span className={`font-semibold flex items-center gap-1 ${weatherData.sprayFactors.windSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {weatherData.sprayFactors.windSafe ? '✓ Safe' : '⚠ High'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                    <span className="text-zinc-600 dark:text-zinc-400">{language === 'te' ? 'వర్షం ముప్పు' : 'Rain Wash-off Risk'}</span>
                    <span className={`font-semibold flex items-center gap-1 ${!weatherData.sprayFactors.rainRisk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {!weatherData.sprayFactors.rainRisk ? '✓ Clear' : '⚠ Impending Rain'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{language === 'te' ? 'ఉదయం 6:30 - 9:00 మధ్య పిచికారీ చేయడం వల్ల మందు అత్యుత్తమంగా పనిచేస్తుంది.' : 'Spray during early morning or sunset hours for maximum leaf absorption.'}</span>
              </div>
            </div>
          </div>

          {/* Smart Irrigation Advisory Banner */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border border-sky-200 dark:border-sky-800/70 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-500 text-white rounded-2xl shadow-sm shrink-0">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sky-950 dark:text-sky-200 text-base">
                      {language === 'te' ? 'స్మార్ట్ సాగునీటి మార్గదర్శి' : 'Smart Irrigation Schedule'}
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      weatherData.irrigationGuidance.wateringUrgency === 'postpone'
                        ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                        : weatherData.irrigationGuidance.wateringUrgency === 'high'
                        ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                        : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                    }`}>
                      {weatherData.irrigationGuidance.wateringUrgency === 'postpone'
                        ? (language === 'te' ? 'తడి వాయిదా వేయండి' : 'Postpone Irrigation')
                        : weatherData.irrigationGuidance.wateringUrgency === 'high'
                        ? (language === 'te' ? 'అత్యవసర తడి' : 'High Priority')
                        : (language === 'te' ? 'సాధారణ తడి' : 'Normal Schedule')}
                    </span>
                  </div>
                  <p className="text-sm text-sky-900 dark:text-sky-300 mt-1 leading-relaxed">
                    {language === 'te' ? weatherData.irrigationGuidance.recommendationTelugu : weatherData.irrigationGuidance.recommendation}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-sky-100 dark:border-sky-800 text-xs shrink-0 md:text-right">
                <div className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {language === 'te' ? 'నీటి తడులకు ఉత్తమ సమయం:' : 'Optimal Watering Window:'}
                </div>
                <div className="text-sky-700 dark:text-sky-300 font-bold text-sm mt-0.5">
                  {language === 'te' ? weatherData.irrigationGuidance.optimalTimeTelugu : weatherData.irrigationGuidance.optimalTime}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Interactive Forecast Cards */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {language === 'te' ? 'రాబోయే 7 రోజుల వ్యవసాయ వాతావరణ నివేదిక' : '7-Day Agricultural Weather Forecast'}
              </h3>
              <span className="text-xs text-zinc-400 font-medium">
                {language === 'te' ? 'Open-Meteo లైవ్ డేటా' : 'Open-Meteo Live Station'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.dailyForecast.map((day, idx) => (
                <div
                  key={day.date}
                  className={`p-4 rounded-2xl border transition flex flex-col items-center text-center ${
                    idx === 0
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/60 hover:border-emerald-400'
                  }`}
                >
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {language === 'te' ? day.dayTelugu : day.day}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>

                  <div className="my-3">
                    {getWeatherIcon(day.weatherCode, 'w-8 h-8')}
                  </div>

                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-full">
                    {language === 'te' ? day.conditionTelugu : day.condition}
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-base font-bold text-zinc-900 dark:text-white">{day.tempHigh}°</span>
                    <span className="text-xs text-zinc-400 font-medium">/ {day.tempLow}°</span>
                  </div>

                  {/* Rain Chance */}
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <CloudRain className="w-3 h-3" />
                    <span>{day.precipitationProbability}% rain</span>
                  </div>

                  {/* Daily Spray Window Tag */}
                  <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/80 w-full">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight inline-block ${
                        day.sprayWindow === 'optimal'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : day.sprayWindow === 'caution'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                      }`}
                    >
                      {day.sprayWindow === 'optimal'
                        ? (language === 'te' ? 'స్ప్రే OK' : 'Spray OK')
                        : day.sprayWindow === 'caution'
                        ? (language === 'te' ? 'జాగ్రత్త' : 'Caution')
                        : (language === 'te' ? 'వద్దు' : 'Avoid')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
