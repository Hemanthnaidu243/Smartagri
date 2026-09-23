import React, { useState } from 'react';
import { 
  Sprout, 
  Sparkles, 
  ArrowRight, 
  Scan, 
  Cpu, 
  Languages, 
  Droplets, 
  Smartphone, 
  ShieldCheck, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HeroProps {
  language: Language;
  onNavigate: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ language, onNavigate }) => {
  const t = translations[language];
  const [activeVisualNode, setActiveVisualNode] = useState<'leaf' | 'sensor' | 'ai' | 'weather'>('leaf');

  const statIcons = [Cpu, Languages, Droplets, Smartphone];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 transition-colors duration-200">
      {/* Subtle organic background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
              <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>{t.hero.badge}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[11px] opacity-80">{t.hero.demoLabel}</span>
            </div>

            {/* Main Headings */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-[1.1]">
                <span className="text-emerald-600 dark:text-emerald-400">{t.hero.titlePrimary}</span>
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                "{t.hero.subheading}"
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t.hero.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('crop-doctor')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{t.hero.btnDetect}</span>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-emerald-50/60 dark:hover:bg-slate-700/80 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <span>{t.hero.btnFeatures}</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>

              <button
                onClick={() => onNavigate('crop-doctor')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t.hero.btnGetStarted}</span>
              </button>
            </div>

            {/* Trust Indicator Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Latency Detection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Both English & తెలుగు Supported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>100% Client-Safe Privacy</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Smart Agriculture AI Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 shadow-2xl shadow-emerald-500/10">
              
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    SmartAgri Vision Scanner
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  <Activity className="w-3 h-3 animate-spin" />
                  <span>AI LIVE SENSOR</span>
                </div>
              </div>

              {/* Graphic Centerpiece: Interactive Visual Leaf Diagnostic with Scanner Line */}
              <div className="relative my-4 aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group">
                
                {/* Visual SVG Leaf with Foliar Venation and Scanning Laser */}
                <svg viewBox="0 0 400 300" className="w-full h-full object-contain p-2">
                  <defs>
                    <linearGradient id="laserGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                      <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="leafBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#86efac" />
                      <stop offset="50%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#14532d" />
                    </linearGradient>
                  </defs>

                  {/* Grid background */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
                  </pattern>
                  <rect width="400" height="300" fill="url(#grid)" />

                  {/* Leaf Silhouette */}
                  <g transform="translate(200, 150) rotate(-15) translate(-200, -150)">
                    <path
                      d="M 200 30 C 270 70 300 170 250 250 C 220 285 195 290 190 290 C 185 290 160 285 130 250 C 80 170 110 70 200 30 Z"
                      fill="url(#leafBody)"
                      stroke="#166534"
                      strokeWidth="2"
                    />
                    {/* Main Vein */}
                    <path d="M 200 35 L 200 285" stroke="#bbf7d0" strokeWidth="3" strokeLinecap="round" />
                    {/* Lateral Veins */}
                    <path d="M 200 100 Q 240 85 270 80" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 200 100 Q 160 85 130 80" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 200 160 Q 250 145 275 135" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 200 160 Q 150 145 125 135" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 200 220 Q 240 210 260 195" stroke="#bbf7d0" strokeWidth="1.2" opacity="0.8" />
                    <path d="M 200 220 Q 160 210 140 195" stroke="#bbf7d0" strokeWidth="1.2" opacity="0.8" />

                    {/* Diagnostic Hotspots */}
                    <circle cx="235" cy="140" r="14" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" />
                    <circle cx="235" cy="140" r="7" fill="#ef4444" />
                    <circle cx="150" cy="190" r="10" fill="#eab308" fillOpacity="0.3" stroke="#eab308" strokeWidth="1.5" />
                    <circle cx="150" cy="190" r="5" fill="#eab308" />
                  </g>

                  {/* Horizontal animated scan beam */}
                  <line x1="20" y1="120" x2="380" y2="120" stroke="url(#laserGrad)" strokeWidth="4">
                    <animate attributeName="y1" values="40;260;40" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="y2" values="40;260;40" dur="4s" repeatCount="indefinite" />
                  </line>

                  {/* Scanning targeting reticle */}
                  <rect x="18" y="18" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" />
                  <rect x="362" y="18" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" />
                  <rect x="18" y="262" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" />
                  <rect x="362" y="262" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" />
                </svg>

                {/* Floating Telemetry Tags */}
                <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 rounded-md px-2.5 py-1 text-[11px] text-white">
                  <span className="text-slate-400">Target: </span>
                  <span className="font-mono text-emerald-400 font-semibold">Tomato / Solanum</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-emerald-600/60 rounded-md px-2.5 py-1 text-[11px] text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-emerald-300">Confidence: 94.8%</span>
                </div>
              </div>

              {/* Interactive Telemetry Nodes */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div 
                  onClick={() => setActiveVisualNode('leaf')}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    activeVisualNode === 'leaf' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 font-semibold text-emerald-800 dark:text-emerald-300' 
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Chlorophyll</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">78.4 SPAD</p>
                </div>

                <div 
                  onClick={() => setActiveVisualNode('sensor')}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    activeVisualNode === 'sensor' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 font-semibold text-emerald-800 dark:text-emerald-300' 
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Soil Moisture</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">64% Field Cap</p>
                </div>

                <div 
                  onClick={() => setActiveVisualNode('ai')}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    activeVisualNode === 'ai' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 font-semibold text-emerald-800 dark:text-emerald-300' 
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Early Blight</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Foliar Warning</p>
                </div>
              </div>

              {/* Quick Prompt to try Crop Doctor */}
              <button
                onClick={() => onNavigate('crop-doctor')}
                className="w-full mt-3 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Test your own crop leaf photo now &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Animated Statistics Cards */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {t.hero.stats.map((item, idx) => {
            const Icon = statIcons[idx % statIcons.length];
            return (
              <div
                key={idx}
                className="group relative p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm hover:border-emerald-300 dark:hover:border-emerald-700/80 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {item.stat}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
