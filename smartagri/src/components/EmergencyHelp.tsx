import React from 'react';
import { Phone, ShieldAlert, Clock, MapPin, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { extensionContacts } from '../data/extensionContacts';

interface EmergencyHelpProps {
  language: Language;
}

export const EmergencyHelp: React.FC<EmergencyHelpProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-bounce" />
          <span>Agricultural Emergency Network</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.emergency.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          {t.emergency.subtitle}
        </p>
      </div>

      {/* Urgent Pest Outbreak Alert Banner */}
      <div className="rounded-2xl border border-amber-300 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
              {language === 'te' ? '⚠️ అత్యవసర సస్యరక్షణ హెచ్చరిక: రసం పీల్చే పురుగులు & గులాబీ రంగు కాయతొలుచు పురుగు' : '⚠️ Regional Agronomic Alert: Sucking Pest Vector & Pink Bollworm Surge'}
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {language === 'te' 
                ? 'వరి మరియు పత్తి పైర్లలో తామర పురుగు మరియు కాయతొలుచు పురుగు ఉధృతి పెరుగుతోంది. వెంటనే సమీపంలోని కిసాన్ కాల్ సెంటర్ లేదా రైతు భరోసా కేంద్రాన్ని సంప్రదించండి.' 
                : 'Rapid foliar yellowing or boll drop detected in central agro-zones. If symptoms match beyond 15% leaf area, contact Kisan Call Center immediately for calibrated pheromone trap placement.'}
            </p>
          </div>
        </div>
      </div>

      {/* Hotline Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {extensionContacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === 'te' ? contact.titleTelugu : contact.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'te' ? contact.subtitleTelugu : contact.subtitle}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                  {contact.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'te' ? contact.descriptionTelugu : contact.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'te' ? contact.timingTelugu : contact.timing}</span>
              </div>
            </div>

            {/* Direct Dial Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Toll-Free Helpline
                </span>
                <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {contact.phone}
                </p>
              </div>

              <a
                href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.emergency.callNow}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Note */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 text-center">
        {t.emergency.notice}
      </div>
    </div>
  );
};
