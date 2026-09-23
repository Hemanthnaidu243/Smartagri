import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Camera,
  Plus,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Droplets,
  Layers,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ChevronRight,
  SlidersHorizontal,
  X,
  Upload,
} from 'lucide-react';
import { CropJournalRecord, WeeklyGrowthPhoto, Language } from '../types';
import {
  getStoredCrops,
  saveCropRecord,
  deleteCropRecord,
  addGrowthPhotoToCrop,
  compressImage,
} from '../services/cropJournalService';

interface CropGrowthJournalProps {
  language: Language;
}

export const CropGrowthJournal: React.FC<CropGrowthJournalProps> = ({ language }) => {
  const [crops, setCrops] = useState<CropJournalRecord[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare' | 'details'>('timeline');

  // Modals
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState<boolean>(false);

  // Comparison State
  const [compareBeforeId, setCompareBeforeId] = useState<string>('');
  const [compareAfterId, setCompareAfterId] = useState<string>('');

  // New Crop Form
  const [newCropForm, setNewCropForm] = useState({
    cropName: 'Chilli (మిరప)',
    cropNameTelugu: 'మిరప',
    variety: 'Teja S-17',
    sowingDate: new Date().toISOString().split('T')[0],
    plotName: 'North Plot A',
    areaAcres: 2.0,
    soilType: 'Black Cotton Regur Soil',
    notes: 'Drip fertigation installed.',
    estimatedDurationDays: 140,
    targetHarvestDate: '',
  });

  // New Log Form
  const [newLogForm, setNewLogForm] = useState({
    weekNumber: 1,
    date: new Date().toISOString().split('T')[0],
    stage: 'Early Vegetative',
    stageTelugu: 'శాఖీయ దశ',
    heightCm: 15,
    notes: 'Healthy leaf canopy development.',
    pestObservations: 'No pests spotted.',
    waterGivenLiters: 2000,
    imageUrl: '',
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = getStoredCrops();
    setCrops(loaded);
    if (loaded.length > 0) {
      setSelectedCropId(loaded[0].id);
      if (loaded[0].photos.length >= 2) {
        setCompareBeforeId(loaded[0].photos[0].id);
        setCompareAfterId(loaded[0].photos[loaded[0].photos.length - 1].id);
      }
    }
  }, []);

  const activeCrop = crops.find((c) => c.id === selectedCropId) || crops[0];

  useEffect(() => {
    if (activeCrop && activeCrop.photos.length >= 2) {
      setCompareBeforeId(activeCrop.photos[0].id);
      setCompareAfterId(activeCrop.photos[activeCrop.photos.length - 1].id);
    }
  }, [selectedCropId]);

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const sowing = new Date(newCropForm.sowingDate);
    const harvestDate = new Date(sowing);
    harvestDate.setDate(harvestDate.getDate() + (newCropForm.estimatedDurationDays || 140));

    const newRecord: CropJournalRecord = {
      id: `crop_${Date.now()}`,
      cropName: newCropForm.cropName,
      cropNameTelugu: newCropForm.cropNameTelugu || newCropForm.cropName,
      variety: newCropForm.variety,
      sowingDate: newCropForm.sowingDate,
      plotName: newCropForm.plotName,
      areaAcres: Number(newCropForm.areaAcres) || 1,
      soilType: newCropForm.soilType,
      currentStage: 'germination',
      currentStageLabel: 'Germination & Seedling',
      currentStageLabelTelugu: 'మొలక & నారు దశ',
      daysElapsed: 1,
      estimatedDurationDays: newCropForm.estimatedDurationDays,
      growthProgressPercent: 5,
      photos: [],
      notes: newCropForm.notes,
      targetHarvestDate: harvestDate.toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    saveCropRecord(newRecord);
    const updated = getStoredCrops();
    setCrops(updated);
    setSelectedCropId(newRecord.id);
    setIsAddCropModalOpen(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImage(file);
      setNewLogForm((prev) => ({ ...prev, imageUrl: compressed }));
    } catch (err) {
      console.error('Photo compression error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAddWeeklyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCrop) return;

    const newLog: WeeklyGrowthPhoto = {
      id: `log_${Date.now()}`,
      weekNumber: Number(newLogForm.weekNumber),
      date: newLogForm.date,
      stage: newLogForm.stage,
      stageTelugu: newLogForm.stageTelugu,
      heightCm: Number(newLogForm.heightCm),
      notes: newLogForm.notes,
      pestObservations: newLogForm.pestObservations,
      waterGivenLiters: Number(newLogForm.waterGivenLiters),
      imageUrl: newLogForm.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23991?auto=format&fit=crop&w=600&q=75',
    };

    addGrowthPhotoToCrop(activeCrop.id, newLog);
    const updated = getStoredCrops();
    setCrops(updated);
    setIsAddLogModalOpen(false);
    setNewLogForm((prev) => ({
      ...prev,
      weekNumber: prev.weekNumber + 1,
      heightCm: prev.heightCm + 5,
      imageUrl: '',
    }));
  };

  const handleDeleteActiveCrop = () => {
    if (!activeCrop) return;
    if (confirm(language === 'te' ? 'ఈ పంట రికార్డును తొలగించాలనుకుంటున్నారా?' : 'Delete this crop growth record?')) {
      deleteCropRecord(activeCrop.id);
      const updated = getStoredCrops();
      setCrops(updated);
      if (updated.length > 0) setSelectedCropId(updated[0].id);
    }
  };

  const photoBefore = activeCrop?.photos.find((p) => p.id === compareBeforeId);
  const photoAfter = activeCrop?.photos.find((p) => p.id === compareAfterId);

  return (
    <div className="space-y-6">
      {/* Top Header Card with Crop Selector & Add CTA */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'పంట పెరుగుదల & ఫోటో టైమ్‌లైన్ జర్నల్' : 'Field Crop Growth Tracker'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              {language === 'te' ? 'పంట అభివృద్ధి డైరీ & రికార్డులు' : 'Crop Growth Journal & Visual Timeline'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {crops.length > 0 && (
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.cropName} - {crop.variety} ({crop.plotName})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsAddCropModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'te' ? 'కొత్త పంట నమోదు' : 'New Crop'}</span>
            </button>
          </div>
        </div>

        {/* Selected Crop Overview Banner */}
        {activeCrop && (
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="text-xs text-zinc-400 font-medium">{language === 'te' ? 'రకం & పొలం' : 'Variety & Plot'}</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                  {activeCrop.variety}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {activeCrop.plotName} ({activeCrop.areaAcres} Acres)
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="text-xs text-zinc-400 font-medium">{language === 'te' ? 'విత్తిన తేదీ & వయస్సు' : 'Sowing & Crop Age'}</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                  Day {activeCrop.daysElapsed} of ~{activeCrop.estimatedDurationDays}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Sown: {new Date(activeCrop.sowingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="text-xs text-zinc-400 font-medium">{language === 'te' ? 'ప్రస్తుత దశ' : 'Current Growth Stage'}</div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  {language === 'te' ? activeCrop.currentStageLabelTelugu : activeCrop.currentStageLabel}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Target Harvest: {new Date(activeCrop.targetHarvestDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400">{language === 'te' ? 'కోత ప్రగతి' : 'Maturity'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{activeCrop.growthProgressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${activeCrop.growthProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sub Tabs: Timeline vs Compare */}
            <div className="flex items-center justify-between mt-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-4 text-sm font-bold">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{language === 'te' ? 'వారం వారీ ఎదుగుదల టైమ్‌లైన్' : 'Weekly Growth Timeline'} ({activeCrop.photos.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'compare'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{language === 'te' ? 'ఫోటో పోలిక (Side-by-Side)' : 'Side-by-Side Photo Comparison'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pb-3">
                <button
                  onClick={() => setIsAddLogModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'కొత్త ఫోటో / లాగ్ జోడించు' : 'Add Weekly Log'}</span>
                </button>
                <button
                  onClick={handleDeleteActiveCrop}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition"
                  title="Delete Crop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: Weekly Growth Timeline */}
      {activeTab === 'timeline' && activeCrop && (
        <div className="space-y-6">
          {activeCrop.photos.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl">
              <Camera className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                {language === 'te' ? 'ఇంకా ఫోటో లాగ్‌లు నమోదు కాలేదు' : 'No growth photos recorded yet'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {language === 'te'
                  ? 'మొదటి వారం నారు ఫోటో మరియు ఎత్తు వివరాలను నమోదు చేయండి.'
                  : 'Capture or upload your first weekly crop photo to track plant height, canopy health, and fertilizer response.'}
              </p>
              <button
                onClick={() => setIsAddLogModalOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'te' ? 'మొదటి ఫోటో జోడించండి' : 'Record Week 1 Log'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeCrop.photos.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div>
                    {/* Photo with Week badge overlay */}
                    <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <img
                        src={log.imageUrl}
                        alt={`Week ${log.weekNumber}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                        <span>Week {log.weekNumber}</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                        {log.heightCm} cm
                      </div>
                    </div>

                    {/* Log Details */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>{new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {language === 'te' ? log.stageTelugu : log.stage}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {log.notes}
                      </p>

                      {log.pestObservations && (
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-xl">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Pest/Field: </span>
                          {log.pestObservations}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Water / Nutrition Footer */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      {log.waterGivenLiters ? `${log.waterGivenLiters} L` : 'Rainfed'}
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Log Verified ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Side-by-Side Photo Comparison */}
      {activeTab === 'compare' && activeCrop && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                {language === 'te' ? 'వారం వారీ ఫోటో పోలిక విశ్లేషణ' : 'Side-by-Side Growth Comparison'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {language === 'te'
                  ? 'ఏవైనా రెండు వారాల ఫోటోలను పక్కపక్కనే ఉంచి మొక్కల ఎత్తు, ఆకుల విస్తీర్ణాన్ని పరిశీలించండి.'
                  : 'Select any two historical logs to visually evaluate canopy expansion, leaf vigor, and growth rate.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Before:</span>
                <select
                  value={compareBeforeId}
                  onChange={(e) => setCompareBeforeId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  {activeCrop.photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      Week {p.weekNumber} ({new Date(p.date).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">After:</span>
                <select
                  value={compareAfterId}
                  onChange={(e) => setCompareAfterId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  {activeCrop.photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      Week {p.weekNumber} ({new Date(p.date).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Side by Side Display */}
          {photoBefore && photoAfter ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Card */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Week {photoBefore.weekNumber} (Baseline)</span>
                  <span className="text-zinc-500">{new Date(photoBefore.date).toLocaleDateString()}</span>
                </div>
                <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                  <img src={photoBefore.imageUrl} alt="Before" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-white">Height: {photoBefore.heightCm} cm</div>
                  <div className="text-zinc-600 dark:text-zinc-400">{photoBefore.stage}</div>
                  <p className="text-zinc-500 pt-1">{photoBefore.notes}</p>
                </div>
              </div>

              {/* After Card */}
              <div className="border border-emerald-300 dark:border-emerald-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>Week {photoAfter.weekNumber} (Current)</span>
                  <span>{new Date(photoAfter.date).toLocaleDateString()}</span>
                </div>
                <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                  <img src={photoAfter.imageUrl} alt="After" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-1 text-xs">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <span>Height: {photoAfter.heightCm} cm</span>
                    {photoAfter.heightCm != null && photoBefore.heightCm != null && photoAfter.heightCm > photoBefore.heightCm && (
                      <span className="text-emerald-600 text-[11px] font-bold">
                        (+{(photoAfter.heightCm - photoBefore.heightCm).toFixed(1)} cm growth)
                      </span>
                    )}
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400">{photoAfter.stage}</div>
                  <p className="text-zinc-500 pt-1">{photoAfter.notes}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs">
              Need at least 2 weekly logs to perform photo comparison.
            </div>
          )}
        </div>
      )}

      {/* Modal: Add New Crop */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                {language === 'te' ? 'కొత్త పంట రికార్డు నమోదు' : 'Create New Crop Journal'}
              </h3>
              <button onClick={() => setIsAddCropModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'te' ? 'పంట పేరు (Crop Name)' : 'Crop Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newCropForm.cropName}
                  onChange={(e) => setNewCropForm({ ...newCropForm, cropName: e.target.value })}
                  placeholder="e.g. Chilli (మిరప), Cotton (పత్తి), Paddy (వరి)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'విత్తన రకం (Variety)' : 'Variety / Hybrid'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCropForm.variety}
                    onChange={(e) => setNewCropForm({ ...newCropForm, variety: e.target.value })}
                    placeholder="e.g. Teja, BPT 5204"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'విత్తిన తేదీ (Sowing Date)' : 'Sowing Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newCropForm.sowingDate}
                    onChange={(e) => setNewCropForm({ ...newCropForm, sowingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'మడి / పొలం పేరు (Plot Name)' : 'Plot Name / Field ID'}
                  </label>
                  <input
                    type="text"
                    value={newCropForm.plotName}
                    onChange={(e) => setNewCropForm({ ...newCropForm, plotName: e.target.value })}
                    placeholder="e.g. South Borewell 2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'విస్తీర్ణం ఎకరాల్లో (Acres)' : 'Plot Area (Acres)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCropForm.areaAcres}
                    onChange={(e) => setNewCropForm({ ...newCropForm, areaAcres: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'te' ? 'నేల రకం (Soil Type)' : 'Soil Type'}
                </label>
                <input
                  type="text"
                  value={newCropForm.soilType}
                  onChange={(e) => setNewCropForm({ ...newCropForm, soilType: e.target.value })}
                  placeholder="e.g. Black Cotton Regur Soil"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'te' ? 'రైతు గమనికలు (Notes)' : 'Farm Notes / Fertilizer Baseline'}
                </label>
                <textarea
                  rows={2}
                  value={newCropForm.notes}
                  onChange={(e) => setNewCropForm({ ...newCropForm, notes: e.target.value })}
                  placeholder="e.g. Basal FYM applied. Drip spacing 75cm."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCropModalOpen(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  {language === 'te' ? 'పంటను నమోదు చేయి' : 'Save Crop Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Weekly Growth Log */}
      {isAddLogModalOpen && activeCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                {language === 'te' ? 'వారం వారీ వృద్ధి లాగ్ & ఫోటో నమోదు' : `Add Growth Log for ${activeCrop.cropName}`}
              </h3>
              <button onClick={() => setIsAddLogModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWeeklyLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'వారం సంఖ్య (Week #)' : 'Week Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newLogForm.weekNumber}
                    onChange={(e) => setNewLogForm({ ...newLogForm, weekNumber: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'లాగ్ తేదీ' : 'Log Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newLogForm.date}
                    onChange={(e) => setNewLogForm({ ...newLogForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'మొక్క ఎత్తు (Plant Height cm)' : 'Plant Height (cm)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newLogForm.heightCm}
                    onChange={(e) => setNewLogForm({ ...newLogForm, heightCm: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {language === 'te' ? 'ఎదుగుదల దశ' : 'Growth Stage'}
                  </label>
                  <select
                    value={newLogForm.stage}
                    onChange={(e) => setNewLogForm({ ...newLogForm, stage: e.target.value, stageTelugu: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="Germination & Cotyledon">Germination / Cotyledon</option>
                    <option value="Early Vegetative (2-4 leaves)">Early Vegetative (2-4 leaves)</option>
                    <option value="Branching & Tillering">Branching & Tillering</option>
                    <option value="Early Floral Bud Initiation">Early Floral Bud Initiation</option>
                    <option value="Peak Flowering & Fruit Set">Peak Flowering & Fruit Set</option>
                    <option value="Grain / Fruit Filling">Grain / Fruit Filling</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload with Compression */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'te' ? 'పంట ఆకు / చేను ఫోటో (Photo)' : 'Field Crop Photo'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{isUploadingPhoto ? 'Compressing...' : 'Upload from Device'}</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {newLogForm.imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500 shrink-0">
                      <img src={newLogForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'te' ? 'ఆరోగ్య పరిశీలనలు (Observations)' : 'Canopy Health & Agronomic Notes'}
                </label>
                <textarea
                  rows={2}
                  value={newLogForm.notes}
                  onChange={(e) => setNewLogForm({ ...newLogForm, notes: e.target.value })}
                  placeholder="e.g. Foliage dark green, sprayed Jeevamrutham 200L."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLogModalOpen(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  {language === 'te' ? 'లాగ్ సేవ్ చేయి' : 'Save Weekly Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
