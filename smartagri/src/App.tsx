import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CropDoctor } from './components/CropDoctor';
import { WeatherAdvisory } from './components/WeatherAdvisory';
import { SoilHealthAnalyzer } from './components/SoilHealthAnalyzer';
import { CropJournal } from './components/CropJournal';
import { Dashboard } from './components/Dashboard';
import { KnowledgeCenter } from './components/KnowledgeCenter';
import { EmergencyHelp } from './components/EmergencyHelp';
import { FaqSection } from './components/FaqSection';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { DetectionHistoryDrawer } from './components/DetectionHistoryDrawer';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ApiSetupModal } from './components/ApiSetupModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Language, UploadedImageInfo, FarmerProfile, AppMode, ThemeMode } from './types';
import { defaultProfile } from './data/dashboardData';
import { translations } from './i18n/translations';
import { ArrowRight, Sparkles, BookOpen, ShieldAlert, Cpu, Mic } from 'lucide-react';

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Operating Mode: 'real_ai' vs 'demo'
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('smartagri_mode');
    return saved === 'real_ai' || saved === 'demo' ? saved : 'real_ai';
  });

  // Language state (English / Telugu)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('smartagri_lang');
    return saved === 'te' || saved === 'en' ? saved : 'en';
  });

  // Theme Mode state (light, dark, system)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('smartagri_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    const legacy = localStorage.getItem('smartagri_theme');
    if (legacy === 'dark' || legacy === 'light') return legacy;
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = themeMode === 'dark' ? true : themeMode === 'light' ? false : systemIsDark;

  // Sync dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smartagri_theme_mode', themeMode);
    localStorage.setItem('smartagri_theme', isDark ? 'dark' : 'light');
  }, [isDark, themeMode]);

  // Detection history
  const [history, setHistory] = useState<UploadedImageInfo[]>(() => {
    try {
      const saved = localStorage.getItem('smartagri_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Farmer profile
  const [profile, setProfile] = useState<FarmerProfile>(() => {
    try {
      const saved = localStorage.getItem('smartagri_profile');
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isApiSetupOpen, setIsApiSetupOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync language to localStorage
  useEffect(() => {
    localStorage.setItem('smartagri_lang', language);
  }, [language]);

  // Sync mode to localStorage
  useEffect(() => {
    localStorage.setItem('smartagri_mode', appMode);
  }, [appMode]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartagri_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not persist history to localStorage', e);
    }
  }, [history]);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartagri_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not persist profile to localStorage', e);
    }
  }, [profile]);

  // Handlers
  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : prev === 'light' ? 'dark' : isDark ? 'light' : 'dark'));
  };

  const handleToggleMode = () => {
    setAppMode((prev) => (prev === 'real_ai' ? 'demo' : 'real_ai'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveToHistory = (record: UploadedImageInfo) => {
    setHistory((prev) => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    showToast(language === 'te' ? 'రికార్డు తొలగించబడింది' : 'Scan record removed');
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast(language === 'te' ? 'చరిత్ర క్లియర్ చేయబడింది' : 'All history cleared');
  };

  const handleSaveProfile = (newProfile: FarmerProfile) => {
    setProfile(newProfile);
    showToast(language === 'te' ? 'రైతు వివరాలు భద్రపరచబడ్డాయి!' : 'Farmer profile updated!');
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      
      {/* Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        isDark={isDark}
        themeMode={themeMode}
        onChangeThemeMode={setThemeMode}
        onToggleTheme={handleToggleTheme}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        onOpenApiSetup={() => setIsApiSetupOpen(true)}
        appMode={appMode}
        profile={profile}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <div className="space-y-16">
            {/* Hero Section with interactive visual scanner */}
            <Hero
              language={language}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Quick Interactive Teaser: AI Crop Doctor & Voice Assistant */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 blur-3xl pointer-events-none" />
                
                <div className="max-w-2xl space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-World Agricultural AI Assistant</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    {language === 'te'
                      ? 'మీ పంట ఆకు ఫోటోను లైవ్ కెమెరాతో తీసి క్షణాల్లో తెగులును గుర్తించండి'
                      : 'Capture a real leaf photo with live camera to diagnose early foliar disease'}
                  </h2>

                  <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                    {language === 'te'
                      ? 'టమాటా, వరి, పత్తి, మిర్చి మరియు మొక్కజొన్న పంటల వ్యాధులను నిజమైన గూగుల్ జెమినీ విజన్ మోడల్ లేదా డెమో నమూనాల ద్వారా తక్షణమే విశ్లేషించండి.'
                      : 'Empower field decisions using real Google Gemini Vision diagnostics or verified agronomic specimens with full Telugu and English voice support.'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setCurrentTab('crop-doctor');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-emerald-800 hover:bg-emerald-50 shadow-md transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <span>{t.hero.btnDetect}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsVoiceAssistantOpen(true)}
                      className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-800/80 hover:bg-emerald-800 text-white border border-white/20 transition-all flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4 text-emerald-300" />
                      <span>{language === 'te' ? 'వాయిస్ అసిస్టెంట్‌తో మాట్లాడండి' : 'Voice Assistant'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Embedded Live Crop Doctor Section */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-10">
              <CropDoctor
                language={language}
                appMode={appMode}
                onToggleMode={handleToggleMode}
                onSaveToHistory={handleSaveToHistory}
                onShowToast={showToast}
                onOpenApiSetup={() => setIsApiSetupOpen(true)}
              />
            </div>

            {/* Smart Dashboard Section */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-10">
              <Dashboard
                language={language}
                history={history}
                profile={profile}
                onNavigateToCropDoctor={() => {
                  setCurrentTab('crop-doctor');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateTab={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onShowToast={showToast}
              />
            </div>

            {/* Emergency & Extension Direct Line Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Certified Agronomist Assistance</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {t.emergency.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    {language === 'te'
                      ? 'కేంద్ర ప్రభుత్వ కిసాన్ కాల్ సెంటర్ 1800-180-1551 ద్వారా నేరుగా తెలుగులోనే వ్యవసాయ అధికారులతో మాట్లాడండి.'
                      : 'Connect with certified government agronomists via Kisan Call Center 1800-180-1551 or your local Rythu Bharosa Kendra.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentTab('emergency');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 shrink-0 transition-transform hover:scale-105"
                >
                  {t.nav.emergency} &rarr;
                </button>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-6">
              <FaqSection language={language} />
            </div>
          </div>
        )}

        {currentTab === 'crop-doctor' && (
          <CropDoctor
            language={language}
            appMode={appMode}
            onToggleMode={handleToggleMode}
            onSaveToHistory={handleSaveToHistory}
            onShowToast={showToast}
            onOpenApiSetup={() => setIsApiSetupOpen(true)}
          />
        )}

        {currentTab === 'weather' && (
          <WeatherAdvisory
            language={language}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'soil' && (
          <SoilHealthAnalyzer
            language={language}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'journal' && (
          <CropJournal
            language={language}
            onShowToast={showToast}
            onNavigateToCropDoctor={() => {
              setCurrentTab('crop-doctor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            language={language}
            history={history}
            profile={profile}
            onNavigateToCropDoctor={() => {
              setCurrentTab('crop-doctor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'knowledge' && (
          <KnowledgeCenter language={language} />
        )}

        {currentTab === 'emergency' && (
          <EmergencyHelp language={language} />
        )}

        {currentTab === 'faq' && (
          <FaqSection language={language} />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        language={language}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Farmer Profile Modal */}
      <FarmerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        language={language}
      />

      {/* Detection History Drawer */}
      <DetectionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteRecord={handleDeleteRecord}
        onClearHistory={handleClearHistory}
        language={language}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        language={language}
      />

      {/* API Setup & Mode Modal */}
      <ApiSetupModal
        isOpen={isApiSetupOpen}
        onClose={() => setIsApiSetupOpen(false)}
        currentMode={appMode}
        onSelectMode={(mode) => {
          setAppMode(mode);
          showToast(
            mode === 'real_ai'
              ? (language === 'te' ? 'రియల్ AI మోడ్ ప్రారంభించబడింది!' : 'Switched to Real AI Mode (Gemini 3.8)')
              : (language === 'te' ? 'డెమో మోడ్ ప్రారంభించబడింది!' : 'Switched to Demo Mode (Agronomic Specimens)')
          );
        }}
        language={language}
      />

      {/* Floating Notification Toast */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
