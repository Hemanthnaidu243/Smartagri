import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, MessageSquare, Bot, User } from 'lucide-react';
import { Language, VoiceAssistantQuery } from '../types';
import { translations } from '../i18n/translations';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState<'en' | 'te'>(language);
  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState<VoiceAssistantQuery[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Smart Farming Voice Assistant. You can ask about crop diseases, organic fertilizers like Jeevamrutham, weather spray windows, or irrigation tips.',
      textTelugu: 'నమస్కారం! నేను మీ స్మార్ట్ అగ్రి వాయిస్ అసిస్టెంట్. మీరు పంటల తెగుళ్లు, జీవామృతం తయారీ, వాతావరణం లేదా నీటి తడుల గురించి అడగవచ్చు.',
      timestamp: 'Just now',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync speech language when primary app language changes
  useEffect(() => {
    setSpeechLang(language);
  }, [language]);

  // Check browser speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQueryInput(transcript);
        handleSendQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to bottom on message update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      recognitionRef.current.lang = speechLang === 'te' ? 'te-IN' : 'en-US';
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition already started', err);
      }
    }
  };

  // Text-To-Speech Reader
  const speakText = (text: string, langCode: 'en' | 'te') => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'te' ? 'te-IN' : 'en-US';
    utterance.rate = 0.95;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      langCode === 'te' ? v.lang.includes('te') : v.lang.includes('en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

    // Intelligent Agronomy Knowledge Response Generator (offline fallback)
    const generateAssistantAnswer = (q: string): { en: string; te: string } => {
      const lower = q.toLowerCase();

      if (lower.includes('సమస్య') || lower.includes('రోగం') || lower.includes('disease') || lower.includes('blight') || lower.includes('leaf')) {
        return {
          en: 'For crop leaf diseases, first check if lesions have concentric brown rings (Early Blight) or water-soaked streaks. Isolate the infected foliage, prevent overhead watering, and spray 5% Neem Seed Extract or Trichoderma bio-fungicide.',
          te: 'పంట ఆకులపై గుండ్రటి గోధుమ రంగు మచ్చలు ఉంటే అది ఆల్టర్నేరియా తెగులు కావచ్చు. ముందుగా తెగులు సోకిన ఆకులను తీసివేయండి, వేప గింజల కషాయం (5%) లేదా ట్రైకోడెర్మా పిచికారీ చేయండి.',
        };
      }

      if (lower.includes('జీవామృతం') || lower.includes('organic') || lower.includes('jeevamrutham') || lower.includes('fertilizer') || lower.includes('ఎరువు')) {
        return {
          en: 'To make Jeevamrutham: mix 10 kg cow dung, 10 liters cow urine, 2 kg jaggery, 2 kg pulse flour, and a handful of farm soil in 200 liters of water. Ferment for 48 hours in the shade and stir twice daily. Apply through irrigation channels.',
          te: 'జీవామృతం తయారీ: 200 లీటర్ల నీటిలో 10 కేజీల దేశీ ఆవు పేడ, 10 లీటర్ల ఆవు మూత్రం, 2 కేజీల బెల్లం, 2 కేజీల శనగపిండి మరియు పిడికెడు మట్టి కలపండి. 2 రోజులు నీడలో ఉంచి రోజుకు రెండుసార్లు తిప్పండి. నీటి తడులతో పాటు పొలానికి అందించండి.',
        };
      }

      if (lower.includes('నీరు') || lower.includes('water') || lower.includes('irrigation') || lower.includes('డ్రిప్') || lower.includes('తడి')) {
        return {
          en: 'Adopt drip irrigation during early morning hours to prevent evaporation. Maintain soil moisture around 60–65% during the flowering and fruit development stage to prevent blossom end rot.',
          te: 'నీరు ఆవిరి కాకుండా ఉండటానికి ఉదయం లేదా సాయంత్రం వేళల్లో డ్రిప్ ద్వారా నీరు పెట్టండి. పూత మరియు కాయ దశలో నేలలో 60-65% తేమ ఉండేలా చూసుకోండి.',
        };
      }

      if (lower.includes('తెల్లదోమ') || lower.includes('పురుగు') || lower.includes('pest') || lower.includes('thrips') || lower.includes('cotton')) {
        return {
          en: 'For sucking pests like whitefly and thrips, install 15–20 yellow and blue sticky traps per acre. Avoid excess chemical nitrogen which makes foliage tender. Spray Neem oil (10,000 ppm) at early infestation.',
          te: 'తెల్లదోమ మరియు తామర పురుగుల నివారణకు ఎకరానికి 15-20 పసుపు, నీలి రంగు జిగురు అట్టలను అమర్చండి. లేత ఆకులపై వేపనూనె లేదా వేప కషాయం పిచికారీ చేయండి.',
        };
      }

      // Default universal answer
      return {
        en: 'For exact agricultural diagnostics, upload a high-resolution leaf photo into our AI Crop Doctor or consult your local Rythu Bharosa Kendra (RBK) agricultural extension officer for customized soil and crop advice.',
        te: 'మరింత ఖచ్చితమైన విశ్లేషణ కోసం మీ పంట ఆకు ఫోటోను AI క్రాప్ డాక్టర్‌లో అప్‌లోడ్ చేయండి లేదా మీ సమీప రైతు భరోసా కేంద్రం (RBK) వ్యవసాయ అధికారిని సంప్రదించండి.',
      };
    };

    const handleSendQuestion = async (textToSend?: string) => {
      const query = (textToSend || queryInput).trim();
      if (!query) return;

      const userMsg: VoiceAssistantQuery = {
        id: 'u-' + Date.now(),
        sender: 'user',
        text: query,
        timestamp: 'Now',
      };

      const pendingAssistantId = 'a-' + Date.now();
      const loadingMsg: VoiceAssistantQuery = {
        id: pendingAssistantId,
        sender: 'assistant',
        text: 'Consulting Agronomy AI Specialist...',
        textTelugu: 'వ్యవసాయ నిపుణుడిని సంప్రదిస్తోంది...',
        timestamp: 'Now',
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setQueryInput('');

      try {
        const res = await fetch('/api/voice-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, language }),
        });

        const data = await res.json();

        let finalEn = '';
        let finalTe = '';

        if (res.ok && data.success) {
          finalEn = data.text;
          finalTe = data.textTelugu;
        } else {
          // Fallback to offline rule-based agronomy knowledge
          const fallback = generateAssistantAnswer(query);
          finalEn = fallback.en;
          finalTe = fallback.te;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAssistantId
              ? {
                  ...m,
                  text: finalEn,
                  textTelugu: finalTe,
                  isLoading: false,
                }
              : m
          )
        );

        // Automatically speak answer in chosen speech language
        if (speechLang === 'te') {
          speakText(finalTe, 'te');
        } else {
          speakText(finalEn, 'en');
        }
      } catch (err) {
        console.error('Voice Assistant fetch error:', err);
        const fallback = generateAssistantAnswer(query);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAssistantId
              ? {
                  ...m,
                  text: fallback.en,
                  textTelugu: fallback.te,
                  isLoading: false,
                }
              : m
          )
        );
        if (speechLang === 'te') {
          speakText(fallback.te, 'te');
        } else {
          speakText(fallback.en, 'en');
        }
      }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'te' ? 'రైతు వాయిస్ అసిస్టెంట్' : 'AI Kisan Voice Assistant'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  WebSpeech 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'te' ? 'తెలుగు మరియు ఇంగ్లీష్‌లో మాట్లాడండి' : 'Bilingual voice recognition & speech'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switch for speech */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setSpeechLang('en')}
                className={`px-2 py-0.5 rounded ${
                  speechLang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSpeechLang('te')}
                className={`px-2 py-0.5 rounded ${
                  speechLang === 'te'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                తెలుగు
              </button>
            </div>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const displayText = speechLang === 'te' && msg.textTelugu ? msg.textTelugu : msg.text;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p>{displayText}</p>

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">SmartAgri Agronomist</span>
                      <button
                        onClick={() => speakText(displayText, speechLang)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{language === 'te' ? 'వినండి' : 'Read Aloud'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions Carousel */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-600 dark:text-slate-400">
          <span className="shrink-0 font-bold text-emerald-600">
            {language === 'te' ? 'సూచనలు:' : 'Try asking:'}
          </span>
          {[
            { en: 'What causes tomato leaf curl?', te: 'టమాటా ఆకు ముడుత రోగం ఎందుకు వస్తుంది?' },
            { en: 'How to prepare organic Jeevamrutham?', te: 'జీవామృతం ఎలా తయారు చేయాలి?' },
            { en: 'Is today good for spraying pesticide?', te: 'ఈరోజు మందుల పిచికారీకి అనుకూలమా?' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(speechLang === 'te' ? item.te : item.en)}
              className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 whitespace-nowrap hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {speechLang === 'te' ? item.te : item.en}
            </button>
          ))}
        </div>

        {/* Input Bar & Mic Trigger */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2.5">
          {/* Big Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={!voiceSupported}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/40'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
            }`}
            title={
              voiceSupported
                ? isListening
                  ? 'Listening... Click to stop'
                  : 'Click and speak'
                : 'Voice input not supported on this browser'
            }
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              isListening
                ? language === 'te'
                  ? 'మీ మాటలు వింటున్నాము...'
                  : 'Listening to your voice...'
                : language === 'te'
                ? 'ప్రశ్నను టైప్ చేయండి లేదా మైక్ నొక్కండి...'
                : 'Type question or tap microphone to speak...'
            }
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendQuestion();
            }}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendQuestion()}
            disabled={!queryInput.trim()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'te' ? 'పంపండి' : 'Ask'}</span>
          </button>
        </div>

        {/* Voice Support Notice */}
        {!voiceSupported && (
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 text-[10px] text-center border-t border-amber-200 dark:border-amber-900">
            Note: Speech recognition requires a WebSpeech-compatible browser (e.g. Chrome, Edge). You can still type queries above.
          </div>
        )}
      </div>
    </div>
  );
};
