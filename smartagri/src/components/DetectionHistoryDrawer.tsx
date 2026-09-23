import React, { useState } from 'react';
import { X, Trash2, History, CheckCircle2, AlertTriangle, AlertOctagon, ExternalLink, Calendar } from 'lucide-react';
import { UploadedImageInfo, Language, CropAnalysisResult } from '../types';
import { translations } from '../i18n/translations';

interface DetectionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: UploadedImageInfo[];
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  language: Language;
}

export const DetectionHistoryDrawer: React.FC<DetectionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onDeleteRecord,
  onClearHistory,
  language,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const [selectedRecord, setSelectedRecord] = useState<UploadedImageInfo | null>(null);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t.history.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {history.length} {language === 'te' ? 'స్కాన్లు' : 'scans recorded'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  {t.history.empty}
                </p>
              </div>
            ) : (
              history.map((record) => {
                const res = record.result;
                return (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                        <img
                          src={record.dataUrl}
                          alt={record.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {record.name}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{record.uploadedAt}</span>
                        </p>

                        {res && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            {res.healthStatus === 'healthy' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{language === 'te' ? 'ఆరోగ్యకరం' : 'Healthy'}</span>
                              </span>
                            ) : res.healthStatus === 'warning' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{language === 'te' ? 'సమస్య' : 'Issue'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                <AlertOctagon className="w-3 h-3 text-red-600" />
                                <span>{language === 'te' ? 'తెగులు' : 'Disease'}</span>
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">
                              {res.confidenceScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {res && (
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="w-full py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>{t.history.viewDetails}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={onClearHistory}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.history.clearAll}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedRecord && selectedRecord.result && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-mono">{selectedRecord.uploadedAt}</p>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {language === 'te' ? selectedRecord.result.cropNameTelugu : selectedRecord.result.cropName}
                </h4>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img src={selectedRecord.dataUrl} alt="Leaf" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white">Diagnosis: </strong>
                {language === 'te' ? selectedRecord.result.diseaseOrSymptomTelugu : selectedRecord.result.diseaseOrSymptom}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Risk Level: </strong>
                {language === 'te' ? selectedRecord.result.riskLevelTelugu : selectedRecord.result.riskLevel}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">AI Confidence: </strong>
                {selectedRecord.result.confidenceScore}%
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
