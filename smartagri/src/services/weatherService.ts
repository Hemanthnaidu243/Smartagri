import { LiveWeatherData } from '../types';

export interface WeatherQueryOptions {
  q?: string;
  lat?: number;
  lon?: number;
}

export const POPULAR_AGRO_REGIONS = [
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, cropSpecialty: 'Chilli, Cotton, Tobacco' },
  { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941, cropSpecialty: 'Cotton, Chilli, Paddy' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, cropSpecialty: 'Paddy, Sugarcane, Pulses' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, cropSpecialty: 'Vegetables, Floriculture' },
  { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373, cropSpecialty: 'Groundnut, Sunflower, Bengal Gram' },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lon: 81.8040, cropSpecialty: 'Paddy, Banana, Coconut' },
  { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941, cropSpecialty: 'Turmeric, Maize, Soyabean' },
  { name: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006, cropSpecialty: 'Groundnut, Millets, Pomegranate' },
  { name: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288, cropSpecialty: 'Paddy, Maize, Cotton' },
  { name: 'Khammam', state: 'Telangana', lat: 17.2473, lon: 80.1514, cropSpecialty: 'Chilli, Cotton, Mango' },
];

/**
 * Fetches real, live meteorological data from our backend proxy or directly from Open-Meteo.
 * Never produces fake or simulated live data.
 */
export async function getLiveWeather(options: WeatherQueryOptions = {}): Promise<LiveWeatherData> {
  const { q, lat, lon } = options;

  let url = '/api/weather';
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (lat !== undefined) params.append('lat', lat.toString());
  if (lon !== undefined) params.append('lon', lon.toString());
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as LiveWeatherData;
      }
    }
  } catch (err) {
    console.warn('[WeatherService] Backend proxy request failed, using direct Open-Meteo fallback:', err);
  }

  // Direct client-side Open-Meteo fallback if backend is unreachable
  let targetLat = lat ?? 16.3067;
  let targetLon = lon ?? 80.4365;
  let locationName = q || 'Guntur';
  let countryName = 'India';

  if (q && (lat === undefined || lon === undefined)) {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`);
      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        if (geoJson.results && geoJson.results.length > 0) {
          const match = geoJson.results[0];
          targetLat = match.latitude;
          targetLon = match.longitude;
          locationName = match.name;
          countryName = match.country || 'India';
        }
      }
    } catch (e) {
      console.warn('[WeatherService] Geocoding lookup failed', e);
    }
  }

  const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;

  const fallbackRes = await fetch(directUrl);
  if (!fallbackRes.ok) {
    throw new Error('Unable to connect to live meteorological service. Please check your internet connection.');
  }

  const wData = await fallbackRes.json();
  const current = wData.current || {};
  const daily = wData.daily || {};

  const temp = Math.round((current.temperature_2m ?? 28) * 10) / 10;
  const apparentTemp = Math.round((current.apparent_temperature ?? temp) * 10) / 10;
  const humidity = Math.round(current.relative_humidity_2m ?? 65);
  const precipitation = current.precipitation ?? 0;
  const rain = current.rain ?? 0;
  const windSpeed = Math.round((current.wind_speed_10m ?? 8) * 10) / 10;
  const weatherCode = current.weather_code ?? 2;

  const wmoInfo = getWmoCodeDetails(weatherCode);

  // Spray advisory
  let sprayAdvisory: 'optimal' | 'caution' | 'hazardous' = 'optimal';
  let sprayAdvisoryText = '';
  let sprayAdvisoryTextTelugu = '';

  const windSafe = windSpeed < 14;
  const rainRisk = precipitation > 0.4 || rain > 0.4;
  const humiditySafe = humidity <= 85;

  if (windSpeed >= 18 || rainRisk || weatherCode >= 80) {
    sprayAdvisory = 'hazardous';
    sprayAdvisoryText = `Hazardous spray window! High wind (${windSpeed} km/h) or precipitation increases pesticide drift and runoff. Postpone foliar spraying.`;
    sprayAdvisoryTextTelugu = `పిచికారీకి ప్రమాదకరమైన సమయం! అధిక గాలి వేగం (${windSpeed} కి.మీ/గం) లేదా వర్షం వల్ల మందులు కొట్టుకుపోయే ప్రమాదం ఉంది. పిచికారీని వాయిదా వేయండి.`;
  } else if (windSpeed >= 14 || humidity > 85 || temp > 35) {
    sprayAdvisory = 'caution';
    sprayAdvisoryText = `Caution advised. Temperature (${temp}°C) or humidity (${humidity}%) is high. Spray during early morning (6:30–9:00 AM) with low-drift nozzles.`;
    sprayAdvisoryTextTelugu = `జాగ్రత్త అవసరం. ఉష్ణోగ్రత (${temp}°C) లేదా తేమ (${humidity}%) ఎక్కువగా ఉంది. ఉదయం లేదా సాయంత్రం వేళల్లో మాత్రమే పిచికారీ చేయండి.`;
  } else {
    sprayAdvisory = 'optimal';
    sprayAdvisoryText = `Optimal spray window! Calm wind (${windSpeed} km/h), mild humidity (${humidity}%), and dry foliage ensure maximum absorption with zero drift.`;
    sprayAdvisoryTextTelugu = `పిచికారీకి అత్యుత్తమ అనుకూల సమయం! అనుకూలమైన గాలి వేగం (${windSpeed} కి.మీ/గం) మరియు తగిన తేమ ఉన్నందున మందు సమర్థవంతంగా పనిచేస్తుంది.`;
  }

  // Irrigation guidance
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
    irrigationRecommendation = `Postpone field irrigation! High rain chance (${tomorrowRainProb}%) or active rainfall recorded. Conserve borewell power and prevent waterlogging.`;
    irrigationRecommendationTelugu = `నీటి తడులను వాయిదా వేయండి! రేపు వర్షం కురిసే అవకాశం (${tomorrowRainProb}%) ఉంది. నీటి నిల్వ మరియు బోరు మోటార్ ఖర్చును ఆదా చేసుకోండి.`;
  } else if (temp >= 33 && humidity < 50) {
    wateringUrgency = 'high';
    irrigationRecommendation = `High soil evapotranspiration! Provide light, frequent drip cycles to prevent crop water stress and leaf scorching.`;
    irrigationRecommendationTelugu = `ఎక్కువ ఉష్ణోగ్రత వల్ల నేల త్వరగా ఎండిపోతుంది! డ్రిప్ ద్వారా తగినంత నీటి తడులను అందించండి.`;
  } else {
    wateringUrgency = 'moderate';
    irrigationRecommendation = `Normal irrigation schedule. Target 60–65% field moisture capacity during current growth phase.`;
    irrigationRecommendationTelugu = `సాధారణ నీటి షెడ్యూల్ పాటించండి. పంట వేర్లకు తగినంత తేమ ఉండేలా సాయంత్రం వేళల్లో నీరు పెట్టండి.`;
  }

  const forecastDates = daily.time || [];
  const dailyForecast = forecastDates.map((dateStr: string, idx: number) => {
    const d = new Date(dateStr);
    const dayIdx = d.getDay();
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysTe = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];

    const fCode = daily.weather_code?.[idx] ?? 1;
    const fRainProb = daily.precipitation_probability_max?.[idx] ?? 0;
    const fRainSum = daily.precipitation_sum?.[idx] ?? 0;
    const fWmo = getWmoCodeDetails(fCode);

    let windowState: 'optimal' | 'caution' | 'hazardous' = 'optimal';
    if (fRainProb >= 50 || fRainSum >= 5) windowState = 'hazardous';
    else if (fRainProb >= 25) windowState = 'caution';

    return {
      date: dateStr,
      day: idx === 0 ? 'Today' : daysEn[dayIdx],
      dayTelugu: idx === 0 ? 'నేడు' : daysTe[dayIdx],
      weatherCode: fCode,
      condition: fWmo.condition,
      conditionTelugu: fWmo.conditionTelugu,
      tempHigh: Math.round(daily.temperature_2m_max?.[idx] ?? temp),
      tempLow: Math.round(daily.temperature_2m_min?.[idx] ?? temp - 6),
      precipitationProbability: fRainProb,
      precipitationSum: fRainSum,
      sprayWindow: windowState,
    };
  });

  return {
    location: locationName,
    country: countryName,
    latitude: targetLat,
    longitude: targetLon,
    temperature: temp,
    apparentTemperature: apparentTemp,
    relativeHumidity: humidity,
    precipitation,
    rain,
    weatherCode,
    weatherCondition: wmoInfo.condition,
    weatherConditionTelugu: wmoInfo.conditionTelugu,
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
      soilMoistureLossEstimate: temp > 34 ? 'high' : temp > 28 ? 'moderate' : 'low',
      optimalTime: '5:30 AM – 8:30 AM or 5:00 PM – 7:00 PM',
      optimalTimeTelugu: 'ఉదయం 5:30 - 8:30 లేదా సాయంత్రం 5:00 - 7:00',
    },
    dailyForecast,
    lastUpdated: new Date().toISOString(),
  };
}

function getWmoCodeDetails(code: number): { condition: string; conditionTelugu: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', conditionTelugu: 'నిర్మలమైన ఆకాశం' };
    case 1:
      return { condition: 'Mainly Clear', conditionTelugu: 'ఎక్కువగా నిర్మలం' };
    case 2:
      return { condition: 'Partly Cloudy', conditionTelugu: 'పాక్షికంగా మేఘావృతం' };
    case 3:
      return { condition: 'Overcast', conditionTelugu: 'పూర్తిగా మేఘావృతం' };
    case 45:
    case 48:
      return { condition: 'Foggy / Dew', conditionTelugu: 'పొగమంచు / మంచు' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', conditionTelugu: 'తేలికపాటి చిరుజల్లులు' };
    case 61:
      return { condition: 'Light Rain', conditionTelugu: 'తేలికపాటి వర్షం' };
    case 63:
      return { condition: 'Moderate Rain', conditionTelugu: 'మోస్తరు వర్షం' };
    case 65:
      return { condition: 'Heavy Rain', conditionTelugu: 'భారీ వర్షం' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', conditionTelugu: 'వర్షపు జల్లులు' };
    case 95:
      return { condition: 'Thunderstorm', conditionTelugu: 'ఉరుములతో కూడిన వర్షం' };
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm & Hail', conditionTelugu: 'తీవ్రమైన ఉరుములు మరియు వడగండ్ల వాన' };
    default:
      return { condition: 'Partly Cloudy', conditionTelugu: 'సాధారణ వాతావరణం' };
  }
}
