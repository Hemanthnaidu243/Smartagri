import React from 'react';
import { Sprout, Phone, ShieldCheck, Heart, ArrowUp } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  language: Language;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const t = translations[language];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                {t.brand}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {t.footer.aboutText}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>National Kisan Call Center: 1800-180-1551 (Toll Free)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('crop-doctor')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-emerald-700 dark:text-emerald-400"
                >
                  {t.nav.cropDoctor} 🌿
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {t.nav.dashboard}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('knowledge')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {t.nav.knowledge}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('emergency')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {t.nav.emergency}
                </button>
              </li>
            </ul>
          </div>

          {/* Agronomic Advisory Disclaimer Note */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Agronomy & AI Protocol Notice</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 leading-relaxed text-[11px] text-slate-500">
              {t.footer.disclaimerText}
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} {t.brand}. Dedicated to sustainable food systems & modern farmer empowerment.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
