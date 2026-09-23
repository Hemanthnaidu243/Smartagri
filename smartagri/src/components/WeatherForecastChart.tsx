import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  TrendingUp, 
  Sparkles, 
  Sun, 
  CloudRain, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { WeatherData, Language } from '../types';

interface WeatherForecastChartProps {
  weather: WeatherData;
  language: Language;
}

export const WeatherForecastChart: React.FC<WeatherForecastChartProps> = ({
  weather,
  language,
}) => {
  const [chartMode, setChartMode] = useState<'temperature' | 'combined'>('combined');

  const chartData = weather.forecast.map((item) => ({
    day: language === 'te' ? item.dayTelugu : item.day,
    rawDay: item.day,
    tempHigh: item.tempHigh,
    tempLow: item.tempLow,
    tempAvg: Math.round((item.tempHigh + item.tempLow) / 2),
    rainChance: item.rainChance,
    condition: item.condition,
  }));

  // Calculations for KPI tags
  const maxTemp = Math.max(...chartData.map((d) => d.tempHigh));
  const minTemp = Math.min(...chartData.map((d) => d.tempLow));
  const avgWeeklyTemp = Math.round(
    chartData.reduce((acc, d) => acc + d.tempAvg, 0) / chartData.length
  );
  const highestRainDay = [...chartData].sort((a, b) => b.rainChance - a.rainChance)[0];

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{data.day}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{data.condition}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>High: <strong>{data.tempHigh}°C</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Low: <strong>{data.tempLow}°C</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-500" />
              <span>{language === 'te' ? 'వర్ష సూచన:' : 'Rain Probability:'}</span>
            </span>
            <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {data.rainChance}%
            </span>
          </div>

          {/* Micro spray suitability hint */}
          <div className="text-[10px] pt-0.5">
            <span className="text-slate-400">{language === 'te' ? 'రైతు సలహా: ' : 'Agronomy Tip: '}</span>
            <span className={data.rainChance > 40 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
              {data.rainChance > 40
                ? (language === 'te' ? 'వర్ష సూచన వల్ల పిచికారీని వాయిదా వేయండి' : 'Postpone foliar sprays')
                : (language === 'te' ? 'పిచికారీకి అనుకూల సమయం' : 'Safe foliar spray window')}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-6">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {language === 'te' ? '7-రోజుల ఉష్ణోగ్రత & వాతావరణ ధోరణి' : '7-Day Thermal & Precipitation Forecast'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'te'
                  ? 'రియల్-టైమ్ అగ్రో-మెటీరియాలజీ ట్రెండ్ మరియు వర్ష సూచనల విశ్లేషణ'
                  : 'Interactive Recharts visualization for diurnal temperature ranges & rain risks'}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartMode('combined')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              chartMode === 'combined'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'ఉష్ణోగ్రత & వర్షం' : 'Combined (Temp + Rain)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChartMode('temperature')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              chartMode === 'temperature'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'ఉష్ణోగ్రత మాత్రమే' : 'Thermal Bands'}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-0.5">
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sun className="w-3 h-3" />
            <span>Peak Daytime Temp</span>
          </span>
          <p className="text-lg font-black text-amber-900 dark:text-amber-100 font-mono">
            {maxTemp}°C
          </p>
          <p className="text-[10px] text-slate-500 truncate">Maximum heat load</p>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-0.5">
          <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            <span>Minimum Night Dip</span>
          </span>
          <p className="text-lg font-black text-blue-900 dark:text-blue-100 font-mono">
            {minTemp}°C
          </p>
          <p className="text-[10px] text-slate-500 truncate">Overnight cooling</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-0.5">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>7-Day Mean Temp</span>
          </span>
          <p className="text-lg font-black text-emerald-900 dark:text-emerald-100 font-mono">
            {avgWeeklyTemp}°C
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">Vegetative comfort zone</p>
        </div>

        <div className="p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/50 space-y-0.5">
          <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <CloudRain className="w-3 h-3" />
            <span>Max Rain Risk</span>
          </span>
          <p className="text-lg font-black text-cyan-900 dark:text-cyan-100 font-mono">
            {highestRainDay.rainChance}%
          </p>
          <p className="text-[10px] text-slate-500 truncate">on {highestRainDay.day}</p>
        </div>
      </div>

      {/* Dynamic Recharts Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
          >
            <defs>
              {/* High Temperature Gradient */}
              <linearGradient id="tempHighGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>

              {/* Low Temperature Gradient */}
              <linearGradient id="tempLowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>

              {/* Rain Bar Gradient */}
              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#94a3b8"
              strokeOpacity={0.2}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            {/* Left Y-Axis for Temperature (°C) */}
            <YAxis
              yAxisId="temp"
              domain={[15, 40]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${v}°`}
            />

            {/* Right Y-Axis for Rain Probability (%) when in combined mode */}
            {chartMode === 'combined' && (
              <YAxis
                yAxisId="rain"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#06b6d4' }}
                tickFormatter={(v) => `${v}%`}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
            />

            {/* Optimal vegetative growth baseline indicator */}
            <ReferenceLine
              yAxisId="temp"
              y={25}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: 'Optimal 25°C',
                position: 'insideBottomLeft',
                fill: '#10b981',
                fontSize: 10,
              }}
            />

            {/* Rain Probability Bar (Combined mode) */}
            {chartMode === 'combined' && (
              <Bar
                yAxisId="rain"
                dataKey="rainChance"
                name={language === 'te' ? 'వర్ష సూచన (%)' : 'Rain Chance (%)'}
                fill="url(#rainGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            )}

            {/* Daytime High Temp Area & Line */}
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="tempHigh"
              name={language === 'te' ? 'గరిష్ట ఉష్ణోగ్రత (°C)' : 'Max Temp (°C)'}
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#tempHighGrad)"
              dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#f59e0b' }}
            />

            {/* Nighttime Low Temp Area & Line */}
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="tempLow"
              name={language === 'te' ? 'కనిష్ట ఉష్ణోగ్రత (°C)' : 'Min Temp (°C)'}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#tempLowGrad)"
              dot={{ r: 3, fill: '#3b82f6', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Advisory Guidance Footer */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {language === 'te'
            ? 'ఈ 7-రోజుల ఉష్ణోగ్రత ధోరణి ఆధారంగా రాత్రి మరియు పగటి ఉష్ణోగ్రతల వ్యత్యాసాన్ని గమనించవచ్చు. ఉష్ణోగ్రత 32°C దాటినప్పుడు బాష్పోత్సేకం పెరిగి ఆకులకు నీటి ఎద్దడి రాకుండా సాయంత్రపు సమయాల్లో నీటి తడులు ఇవ్వండి.'
            : 'Track the diurnal temperature gap to optimize irrigation timings. Keep foliar sprays within the 20°C–28°C envelope to avoid leaf scorch, and schedule irrigation during early morning or sunset.'}
        </p>
      </div>
    </div>
  );
};
