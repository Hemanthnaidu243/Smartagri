import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Key, Cpu, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { AppMode, Language } from '../types';

interface ApiSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  language: Language;
}

export const ApiSetupModal: React.FC<ApiSetupModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  language,
}) => {
  const [healthStatus, setHealthStatus] = useState<{
    online: boolean;
    hasApiKey: boolean;
    keySource?: string;
    primaryModel?: string;
    fallbackModels?: string[];
  }>({
    online: false,
    hasApiKey: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus({
          online: data.status === 'online',
          hasApiKey: Boolean(data.hasApiKey),
          keySource: data.keySource || 'GEMINI_API_KEY2',
          primaryModel: data.primaryModel || 'gemini-3.8-flash',
          fallbackModels: data.fallbackModels || ['gemini-3.1-flash-lite', 'gemini-flash-latest'],
        });
      } else {
        setHealthStatus({ online: false, hasApiKey: false });
      }
    } catch {
      setHealthStatus({ online: false, hasApiKey: false });
    }
    setIsChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {language === 'te' ? 'AI మోడ్ & API సెటప్' : 'AI Operating Mode & API Setup'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'te' ? 'రియల్ విజన్ API మరియు డెమో మోడ్ మధ్య మారండి' : 'Toggle between Real Gemini Vision and Demo Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Status Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'te' ? 'సర్వర్ మరియు మోడల్ స్థితి:' : 'Backend & Model Status:'}
            </span>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{language === 'te' ? 'రిఫ్రెష్' : 'Check'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${healthStatus.online ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-slate-700 dark:text-slate-300">
                Server: {healthStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${healthStatus.hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-slate-700 dark:text-slate-300 truncate">
                {healthStatus.hasApiKey ? `Key: ${healthStatus.keySource || 'Active'}` : 'Key: Not Detected'}
              </span>
            </div>
          </div>

          {healthStatus.hasApiKey && (
            <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-200 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span>Primary: <strong>{healthStatus.primaryModel}</strong></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800 font-bold">503 Auto-Retry</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Fallback: {healthStatus.fallbackModels?.join(', ') || 'gemini-3.1-flash-lite'}
              </p>
            </div>
          )}
        </div>

        {/* Mode Selector Radio Cards */}
        <div className="space-y-3">
          {/* Real AI Mode */}
          <div
            onClick={() => onSelectMode('real_ai')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              currentMode === 'real_ai'
                ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'te' ? '🟢 రియల్ AI మోడ్ (Real Gemini Vision API)' : '🟢 Real AI Mode (Gemini Vision API)'}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {language === 'te'
                    ? 'మీరు తీసిన లేదా అప్‌లోడ్ చేసిన ఫోటోను GEMINI_API_KEY2 ద్వారా జెమినీ విజన్ మోడల్‌కి పంపుతుంది. 503 రద్దీ ఉంటే ఆటోమేటిక్ రీట్రై మరియు మోడల్ ఫాల్‌బ్యాక్ అమలు చేస్తుంది.'
                    : 'Sends leaf photos directly to Gemini Vision API using GEMINI_API_KEY2. Includes exponential backoff and multi-model failover for 503 error spikes.'}
                </p>
              </div>
            </div>
          </div>

          {/* Demo Mode */}
          <div
            onClick={() => onSelectMode('demo')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              currentMode === 'demo'
                ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'te' ? '🔵 డెమో మోడ్ (Verified Specimen Mode)' : '🔵 Demo Mode (Verified Agronomic Specimens)'}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Manual Choice Only
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {language === 'te'
                    ? 'ఇంటర్నెట్ లేదా API కీ లేనప్పుడు రైతు పరీక్షించదగిన ధృవీకరించిన ఆకు నమూనాలు. (ఆటోమేటిక్‌గా మారదు, మీ ఎంపిక మాత్రమే).'
                    : 'Intended only for offline presentations without network. Never entered automatically.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Instructions Box */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gemini API Environment Configuration:</span>
          </p>
          <p>
            1. Server uses <code className="text-emerald-700 dark:text-emerald-400 font-mono">GEMINI_API_KEY2</code> securely on the backend.
          </p>
          <p>
            2. High-demand 503 errors are handled transparently with exponential backoff and seamless fallback to <code className="font-mono text-emerald-700 dark:text-emerald-400">gemini-3.1-flash-lite</code>.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {language === 'te' ? 'పూర్తయింది' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
