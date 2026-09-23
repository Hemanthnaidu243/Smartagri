import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  Moon, 
  Sun, 
  Monitor,
  Globe, 
  History, 
  User, 
  Menu, 
  X, 
  ShieldAlert, 
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Mic,
  Cpu,
  Check,
  CloudSun,
  Layers,
  Calendar
} from 'lucide-react';
import { Language, FarmerProfile, AppMode, ThemeMode } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  isDark: boolean;
  themeMode?: ThemeMode;
  onChangeThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenApiSetup: () => void;
  appMode: AppMode;
  profile: FarmerProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  isDark,
  themeMode = 'system',
  onChangeThemeMode,
  onToggleTheme,
  historyCount,
  onOpenHistory,
  onOpenProfile,
  onOpenVoiceAssistant,
  onOpenApiSetup,
  appMode,
  profile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Sprout },
    { id: 'crop-doctor', label: t.nav.cropDoctor, icon: Stethoscope, highlight: true },
    { id: 'weather', label: t.nav.weather, icon: CloudSun },
    { id: 'soil', label: t.nav.soil, icon: Layers },
    { id: 'journal', label: t.nav.journal, icon: Calendar },
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'knowledge', label: t.nav.knowledge, icon: BookOpen },
    { id: 'emergency', label: t.nav.emergency, icon: ShieldAlert },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-emerald-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Logo & Mode Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-900 dark:text-white font-sans block">
                  {t.brand}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-[200px] md:max-w-none">
                  {t.tagline}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenApiSetup}
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 transition-all self-center ${
                appMode === 'real_ai'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-200'
              }`}
              title="Click to toggle Real AI / Demo Mode"
            >
              <Cpu className="w-2.5 h-2.5" />
              <span>{appMode === 'real_ai' ? 'REAL AI' : 'DEMO'}</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  } ${item.highlight && !isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Voice Assistant Mic Trigger */}
            <button
              onClick={onOpenVoiceAssistant}
              title="AI Kisan Voice Assistant (Telugu & English)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant'}
              </span>
            </button>

            {/* Language Switcher (English / Telugu) */}
            <button
              onClick={onToggleLanguage}
              title="Switch Language / భాషను మార్చండి"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Dark / Light / System Mode Toggle with Interactive Selector */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setThemeDropdownOpen((prev) => !prev)}
                title={`Theme: ${themeMode === 'system' ? 'System (Auto)' : themeMode === 'dark' ? 'Dark' : 'Light'}`}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 flex items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label="Select color theme"
              >
                {themeMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-emerald-400" />
                ) : themeMode === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Monitor className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    {language === 'te' ? 'థీమ్ ఎంచుకోండి' : 'Select Theme'}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeThemeMode ? onChangeThemeMode('light') : onToggleTheme();
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                      themeMode === 'light' ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === 'te' ? 'లైట్ మోడ్' : 'Light Mode'}</span>
                    </span>
                    {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeThemeMode ? onChangeThemeMode('dark') : onToggleTheme();
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                      themeMode === 'dark' ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'te' ? 'డార్క్ మోడ్' : 'Dark Mode'}</span>
                    </span>
                    {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeThemeMode ? onChangeThemeMode('system') : onToggleTheme();
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                      themeMode === 'system' ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === 'te' ? 'సిస్టమ్ (ఆటో)' : 'System Auto'}</span>
                    </span>
                    {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Scan History Trigger */}
            <button
              onClick={onOpenHistory}
              title={t.nav.history}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Farmer Profile Button */}
            <button
              onClick={onOpenProfile}
              title={t.nav.profile}
              className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {profile.name.charAt(0) || 'K'}
              </div>
              <span className="text-xs font-semibold max-w-[80px] truncate">
                {profile.name}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {profile.name.charAt(0) || 'K'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.name}</p>
                <p className="text-[10px] text-slate-500">{profile.location}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onOpenProfile();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-emerald-600 font-semibold"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Theme Selector */}
          <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {language === 'te' ? 'రంగు థీమ్ (Theme)' : 'Theme Mode'}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 capitalize">
                {themeMode}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => onChangeThemeMode && onChangeThemeMode('light')}
                className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeThemeMode && onChangeThemeMode('dark')}
                className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeThemeMode && onChangeThemeMode('system')}
                className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  themeMode === 'system'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenVoiceAssistant();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center justify-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Assistant</span>
            </button>
            <button
              onClick={() => {
                onOpenApiSetup();
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Mode Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
