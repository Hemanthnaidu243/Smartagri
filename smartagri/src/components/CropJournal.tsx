import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  Sliders,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CropJournalRecord, WeeklyGrowthPhoto, Language } from '../types';

interface CropJournalProps {
  language: Language;
  onShowToast?: (msg: string) => void;
  onNavigateToCropDoctor?: () => void;
}

const STORAGE_KEY = 'smartagri_crop_journal_records_v1';

// Seed initial authentic demonstration record
const INITIAL_JOURNAL_RECORDS: CropJournalRecord[] = [
  {
    id: 'crop-paddy-demo-1',
    cropName: 'Paddy (Rice)',
    cropNameTelugu: 'వరి (సాంబ మసూరి)',
    variety: 'BPT 5204 (Samba Mahsuri)',
    sowingDate: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 36 days ago
    plotName: 'Canal Block - Field #2',
    areaAcres: 2.5,
    soilType: 'Clay Loam (Medium Black)',
    currentStage: 'vegetative',
    currentStageLabel: 'Vegetative & Active Tillering',
    currentStageLabelTelugu: 'శాఖీయ మరియు పిలకల దశ (36 రోజులు)',
    daysElapsed: 36,
    estimatedDurationDays: 135,
    growthProgressPercent: 27,
    notes: 'Direct seeded using drum seeder. Soil enriched with 2 tons FYM and Azospirillum culture.',
    targetHarvestDate: new Date(Date.now() + 99 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
    photos: [
      {
        id: 'photo-1',
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weekNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
        stage: 'Seedling Emergence',
        stageTelugu: 'మొలక దశ',
        heightCm: 12,
        notes: 'Good germination rate across 95% of rows. Light green foliage.',
        waterGivenLiters: 1200,
      },
      {
        id: 'photo-2',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weekNumber: 3,
        imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        stage: 'Early Tillering',
        stageTelugu: 'పిలకలు తొడిగే దశ',
        heightCm: 26,
        notes: 'Applied neem cake and Jeevamrutham. Vigorous root branching noted.',
        pestObservations: 'No stem borer or leaf folder seen.',
        waterGivenLiters: 2400,
      },
      {
        id: 'photo-3',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weekNumber: 5,
        imageUrl: 'https://images.unsplash.com/photo-1599818818556-9a25b182d334?auto=format&fit=crop&w=600&q=80',
        stage: 'Max Tillering Canopy',
        stageTelugu: 'పూర్తి పిలకల విస్తరణ',
        heightCm: 42,
        notes: 'Dense emerald canopy. Maintained 2-inch standing water layer.',
        waterGivenLiters: 3000,
      },
    ],
  },
];

// Helper to compress images on client side to preserve localStorage limit
async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 700;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reader failed'));
    reader.readAsDataURL(file);
  });
}

export const CropJournal: React.FC<CropJournalProps> = ({
  language,
  onShowToast,
  onNavigateToCropDoctor,
}) => {
  const [records, setRecords] = useState<CropJournalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load journal from storage', e);
    }
    return INITIAL_JOURNAL_RECORDS;
  });

  const [selectedCropId, setSelectedCropId] = useState<string>(
    records[0]?.id || 'crop-paddy-demo-1'
  );

  // Modal States
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // New Crop Form
  const [newCropName, setNewCropName] = useState('Chillies (Mirchi)');
  const [newCropVariety, setNewCropVariety] = useState('Teja / Guntur Sannam');
  const [newSowingDate, setNewSowingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newPlotName, setNewPlotName] = useState('Survey #14 - South Acre');
  const [newAreaAcres, setNewAreaAcres] = useState(1.5);
  const [newSoilType, setNewSoilType] = useState('Black Cotton Soil');
  const [newDurationDays, setNewDurationDays] = useState(150);
  const [newNotes, setNewNotes] = useState('Raised nursery bed transplanting.');

  // New Photo Entry Form
  const [photoWeek, setPhotoWeek] = useState<number>(6);
  const [photoStage, setPhotoStage] = useState('Flowering & Bud Initiation');
  const [photoStageTe, setPhotoStageTe] = useState('పూత మరియు మొగ్గ దశ');
  const [photoHeight, setPhotoHeight] = useState<number>(48);
  const [photoNotes, setPhotoNotes] = useState('Healthy flowering observed.');
  const [photoPest, setPhotoPest] = useState('No thrips or mites spotted.');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Comparison State
  const [comparePhoto1Id, setComparePhoto1Id] = useState<string>('');
  const [comparePhoto2Id, setComparePhoto2Id] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Storage quota exceeded; keeping memory state', e);
    }
  }, [records]);

  const activeRecord = records.find((r) => r.id === selectedCropId) || records[0];

  // Recalculate stages
  const getStageInfo = (days: number, totalDuration: number) => {
    const ratio = days / totalDuration;
    if (ratio <= 0.1) {
      return {
        stage: 'germination' as const,
        label: 'Sowing & Germination',
        labelTe: 'విత్తన మొలక దశ',
      };
    } else if (ratio <= 0.35) {
      return {
        stage: 'vegetative' as const,
        label: 'Vegetative & Tillering',
        labelTe: 'శాఖీయ & పిలకల దశ',
      };
    } else if (ratio <= 0.6) {
      return {
        stage: 'flowering' as const,
        label: 'Flowering & Booting',
        labelTe: 'చిరుపొట్ట & పూత దశ',
      };
    } else if (ratio <= 0.85) {
      return {
        stage: 'grain_filling' as const,
        label: 'Grain / Pod Filling',
        labelTe: 'గింజ పాలుపోసుకునే దశ',
      };
    } else {
      return {
        stage: 'maturity' as const,
        label: 'Maturity & Harvest Ready',
        labelTe: 'కోతకు సిద్ధమైన దశ',
      };
    }
  };

  // Add new crop handler
  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    const sowTime = new Date(newSowingDate).getTime();
    const nowTime = Date.now();
    const days = Math.max(0, Math.floor((nowTime - sowTime) / (1000 * 60 * 60 * 24)));
    const duration = newDurationDays || 120;
    const stage = getStageInfo(days, duration);
    const harvestDate = new Date(sowTime + duration * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newRecord: CropJournalRecord = {
      id: `crop-${Date.now()}`,
      cropName: newCropName,
      cropNameTelugu:
        newCropName.toLowerCase().includes('chilli')
          ? 'మిరప'
          : newCropName.toLowerCase().includes('cotton')
          ? 'పత్తి'
          : newCropName.toLowerCase().includes('paddy')
          ? 'వరి'
          : newCropName,
      variety: newCropVariety,
      sowingDate: newSowingDate,
      plotName: newPlotName,
      areaAcres: newAreaAcres,
      soilType: newSoilType,
      currentStage: stage.stage,
      currentStageLabel: stage.label,
      currentStageLabelTelugu: stage.labelTe,
      daysElapsed: days,
      estimatedDurationDays: duration,
      growthProgressPercent: Math.min(100, Math.round((days / duration) * 100)),
      photos: [],
      notes: newNotes,
      targetHarvestDate: harvestDate,
      updatedAt: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setSelectedCropId(newRecord.id);
    setIsAddCropModalOpen(false);
    if (onShowToast) {
      onShowToast(
        language === 'te'
          ? `కొత్త పంట రికార్డు (${newCropName}) సృష్టించబడింది!`
          : `Created new crop growth journal for ${newCropName}!`
      );
    }
  };

  // Add weekly photo entry handler
  const handleAddPhotoEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    let finalImageUrl =
      'https://images.unsplash.com/photo-1599818818556-9a25b182d334?auto=format&fit=crop&w=600&q=80';

    if (photoFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await compressImageToDataUrl(photoFile);
      } catch (err) {
        console.error('Failed to compress image', err);
      }
      setIsUploading(false);
    } else if (photoPreview) {
      finalImageUrl = photoPreview;
    }

    const newEntry: WeeklyGrowthPhoto = {
      id: `photo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weekNumber: photoWeek || (activeRecord.photos.length + 1),
      imageUrl: finalImageUrl,
      stage: photoStage,
      stageTelugu: photoStageTe,
      heightCm: photoHeight,
      notes: photoNotes,
      pestObservations: photoPest,
    };

    const updatedRecord: CropJournalRecord = {
      ...activeRecord,
      photos: [...activeRecord.photos, newEntry],
      updatedAt: new Date().toISOString(),
    };

    setRecords((prev) => prev.map((r) => (r.id === activeRecord.id ? updatedRecord : r)));
    setIsAddPhotoModalOpen(false);
    setPhotoFile(null);
    setPhotoPreview(null);

    if (onShowToast) {
      onShowToast(
        language === 'te'
          ? `వారం ${newEntry.weekNumber} ఫోటో మరియు వివరాలు నమోదు చేయబడ్డాయి!`
          : `Saved Week ${newEntry.weekNumber} growth log and photo!`
      );
    }
  };

  // Delete Crop Record
  const handleDeleteRecord = (id: string) => {
    if (records.length <= 1) {
      if (onShowToast) {
        onShowToast(
          language === 'te'
            ? 'కనీసం ఒక పంట రికార్డు ఉండాలి.'
            : 'At least one crop record must remain in the journal.'
        );
      }
      return;
    }

    if (
      window.confirm(
        language === 'te'
          ? 'ఈ పంట రికార్డును ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?'
          : 'Are you sure you want to delete this crop record and its photo history?'
      )
    ) {
      const remaining = records.filter((r) => r.id !== id);
      setRecords(remaining);
      setSelectedCropId(remaining[0]?.id || '');
      if (onShowToast) {
        onShowToast(language === 'te' ? 'రికార్డు తొలగించబడింది.' : 'Crop record deleted.');
      }
    }
  };

  // Setup comparison
  const openCompareModal = () => {
    if (!activeRecord || activeRecord.photos.length < 2) {
      if (onShowToast) {
        onShowToast(
          language === 'te'
            ? 'పోల్చడానికి కనీసం 2 వారాల ఫోటోలు ఉండాలి.'
            : 'Need at least 2 weekly photos in this record to compare growth.'
        );
      }
      return;
    }
    setComparePhoto1Id(activeRecord.photos[0].id);
    setComparePhoto2Id(activeRecord.photos[activeRecord.photos.length - 1].id);
    setIsCompareModalOpen(true);
  };

  const photo1 = activeRecord?.photos.find((p) => p.id === comparePhoto1Id);
  const photo2 = activeRecord?.photos.find((p) => p.id === comparePhoto2Id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-teal-200 dark:border-teal-800/60 bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Agronomic Crop Life-Cycle Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'te' ? 'పంట ఎదుగుదల డైరీ & టైమ్‌లైన్ 📖' : 'Crop Growth Journal & Timeline 📖'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {language === 'te'
                ? 'విత్తిన తేదీ నుండి కోత వరకు పంట ఎదుగుదలను వారాలవారీగా ఫోటోలతో రికార్డ్ చేయండి. పక్కపక్కనే ఫోటోలను పోల్చి చూసి చీడపీడలను సకాలంలో గుర్తించండి.'
                : 'Track vegetative canopy development, seedling emergence, and flowering milestones with weekly photo logs, height tracking, and side-by-side growth comparison.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddCropModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'te' ? '+ కొత్త పంట రికార్డు' : '+ Record New Crop'}</span>
            </button>
          </div>
        </div>

        {/* Crop Records Switcher Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-500 font-semibold shrink-0">
            {language === 'te' ? 'మీ పంటల రికార్డులు:' : 'Active Fields:'}
          </span>
          {records.map((r) => {
            const isSelected = r.id === selectedCropId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedCropId(r.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                <span>{language === 'te' ? r.cropNameTelugu : r.cropName}</span>
                <span className="text-[10px] opacity-80">({r.plotName})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Crop Dashboard */}
      {activeRecord && (
        <div className="space-y-8">
          {/* Top Info Strip */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activeRecord.plotName} &bull; {activeRecord.areaAcres} Acres &bull; {activeRecord.soilType}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {language === 'te' ? activeRecord.cropNameTelugu : activeRecord.cropName} &ndash;{' '}
                  <span className="font-medium text-slate-600 dark:text-slate-400 text-base">
                    {activeRecord.variety}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCompareModal}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{language === 'te' ? 'ఫోటో పోలిక (Compare)' : 'Compare Growth'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? '+ ఫోటో నమోదు' : '+ Add Growth Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteRecord(activeRecord.id)}
                  className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Growth Stage Progress Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                    {language === 'te' ? activeRecord.currentStageLabelTelugu : activeRecord.currentStageLabel}
                  </span>
                  <span className="text-slate-500 font-medium">
                    Day {activeRecord.daysElapsed} of {activeRecord.estimatedDurationDays}
                  </span>
                </div>

                <div className="text-slate-500">
                  <span>{language === 'te' ? 'అంచనా కోత తేదీ:' : 'Target Harvest:'} </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeRecord.targetHarvestDate}</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeRecord.growthProgressPercent}%` }}
                />
              </div>

              {/* Stages Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-center text-[10px] sm:text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">1. Sowing</span>
                  <span className="text-slate-500">Days 1–10</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="block font-bold text-emerald-800 dark:text-emerald-300">2. Vegetative</span>
                  <span className="text-emerald-600">Days 11–40 (Active)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">3. Panicle / Flow</span>
                  <span className="text-slate-500">Days 41–70</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">4. Grain Filling</span>
                  <span className="text-slate-500">Days 71–105</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">5. Harvest</span>
                  <span className="text-slate-500">Days 106–135</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Growth Photo Timeline Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{language === 'te' ? 'వారం వారీ ఎదుగుదల ఫోటోలు & గమనికలు' : 'Weekly Photographic Growth Records'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {activeRecord.photos.length} {language === 'te' ? 'నమోదులు' : 'Entries'}
              </span>
            </div>

            {activeRecord.photos.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {language === 'te'
                    ? 'ఈ పంటకు ఇంకా ఫోటోలు నమోదు చేయలేదు. వారం 1 ఫోటోను ఇప్పుడే జోడించండి!'
                    : 'No growth photos recorded for this crop yet. Capture or upload your Week 1 photo!'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {language === 'te' ? '+ ఫోటో జోడించండి' : '+ Add First Photo'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeRecord.photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                      <img
                        src={photo.imageUrl}
                        alt={`Week ${photo.weekNumber}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-bold">
                        Week {photo.weekNumber}
                      </div>
                      {photo.heightCm && (
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-emerald-900/80 backdrop-blur-xs text-emerald-200 text-[11px] font-bold">
                          {photo.heightCm} cm Height
                        </div>
                      )}
                    </div>

                    {/* Meta & Notes */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {language === 'te' ? photo.stageTelugu : photo.stage}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{photo.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {photo.notes}
                        </p>
                      </div>

                      {photo.pestObservations && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{photo.pestObservations}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add New Crop */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {language === 'te' ? 'కొత్త పంట రికార్డును నమోదు చేయండి' : 'Create New Crop Growth Record'}
              </h3>
              <button
                onClick={() => setIsAddCropModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'te' ? 'పంట పేరు' : 'Crop Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  placeholder="e.g. Cotton, Paddy, Chillies, Maize"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'te' ? 'రకం / హైబ్రిడ్' : 'Variety / Hybrid'}
                  </label>
                  <input
                    type="text"
                    value={newCropVariety}
                    onChange={(e) => setNewCropVariety(e.target.value)}
                    placeholder="e.g. Teja, BPT 5204"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'te' ? 'విత్తిన / నాటిన తేదీ' : 'Sowing Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newSowingDate}
                    onChange={(e) => setNewSowingDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'te' ? 'పొలం / సర్వే నెం' : 'Plot / Field'}
                  </label>
                  <input
                    type="text"
                    value={newPlotName}
                    onChange={(e) => setNewPlotName(e.target.value)}
                    placeholder="e.g. Survey #42"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'te' ? 'విస్తీర్ణం (ఎకరాలు)' : 'Area (Acres)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    value={newAreaAcres}
                    onChange={(e) => setNewAreaAcres(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'te' ? 'నేల రకం' : 'Soil Type'}
                </label>
                <select
                  value={newSoilType}
                  onChange={(e) => setNewSoilType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Black Cotton Soil">Black Cotton Soil (నల్ల రేగడి)</option>
                  <option value="Red Sandy Loam">Red Sandy Loam (ఎర్ర నేల)</option>
                  <option value="Clay Loam">Clay Loam (బంకమన్ను)</option>
                  <option value="Alluvial Loam">Alluvial Loam (ఒండ్రు నేల)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'te' ? 'పంట గమనికలు' : 'Initial Observations / Notes'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Seed treatment done with Pseudomonas."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCropModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {language === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {language === 'te' ? 'సేవ్ చేయండి' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Weekly Photo Entry */}
      {isAddPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {language === 'te' ? 'వారం వారీ ఫోటో & గమనికల నమోదు' : 'Add Weekly Growth Photo Entry'}
              </h3>
              <button
                onClick={() => setIsAddPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoEntry} className="space-y-4 text-xs">
              {/* Photo Input / Preview */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {language === 'te' ? 'పంట ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి' : 'Crop Leaf / Field Photo'}
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center space-y-2 hover:border-emerald-500 transition-colors">
                  {photoPreview ? (
                    <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setPhotoFile(f);
                            const url = URL.createObjectURL(f);
                            setPhotoPreview(url);
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'te' ? 'వారం సంఖ్య' : 'Week Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={photoWeek}
                    onChange={(e) => setPhotoWeek(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'te' ? 'మొక్క ఎత్తు (సెం.మీ)' : 'Plant Height (cm)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={photoHeight}
                    onChange={(e) => setPhotoHeight(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'te' ? 'ఎదుగుదల దశ' : 'Growth Stage Description'}
                </label>
                <input
                  type="text"
                  value={photoStage}
                  onChange={(e) => setPhotoStage(e.target.value)}
                  placeholder="e.g. Active Flowering, Branching"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'te' ? 'చీడపీడల గమనికలు' : 'Pest / Disease Observations'}
                </label>
                <input
                  type="text"
                  value={photoPest}
                  onChange={(e) => setPhotoPest(e.target.value)}
                  placeholder="e.g. Clean leaves, no leaf curl."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'te' ? 'రైతు గమనికలు' : 'Notes / Actions Taken'}
                </label>
                <textarea
                  rows={2}
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  placeholder="e.g. Irrigated through drip for 2 hours."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {language === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isUploading ? 'Saving...' : language === 'te' ? 'సేవ్ చేయండి' : 'Save Photo Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Side-by-Side Comparison */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <span>{language === 'te' ? 'పక్కపక్కనే ఫోటోల ఎదుగుదల పోలిక' : 'Side-by-Side Growth Comparison'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'te'
                    ? 'భిన్న వారాల ఫోటోలను పోల్చి చూసి కాండం, ఆకుల ఎదుగుదలను గమనించండి.'
                    : 'Compare foliage density, canopy expansion, and recovery across two different growth weeks.'}
                </p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Photo A (Earlier Stage):
                </label>
                <select
                  value={comparePhoto1Id}
                  onChange={(e) => setComparePhoto1Id(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {activeRecord.photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      Week {p.weekNumber} &bull; {p.stage} ({p.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Photo B (Later Stage):
                </label>
                <select
                  value={comparePhoto2Id}
                  onChange={(e) => setComparePhoto2Id(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {activeRecord.photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      Week {p.weekNumber} &bull; {p.stage} ({p.date})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dual Images View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Image A */}
              {photo1 && (
                <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40">
                  <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img src={photo1.imageUrl} alt="Week 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Week {photo1.weekNumber} &ndash; {photo1.stage}</span>
                      <span className="text-emerald-600">{photo1.heightCm} cm</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{photo1.notes}</p>
                  </div>
                </div>
              )}

              {/* Image B */}
              {photo2 && (
                <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40">
                  <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img src={photo2.imageUrl} alt="Week 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Week {photo2.weekNumber} &ndash; {photo2.stage}</span>
                      <span className="text-emerald-600">{photo2.heightCm} cm</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{photo2.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Growth Analysis Summary */}
            {photo1 && photo2 && photo2.heightCm && photo1.heightCm && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <span>
                  <strong>Growth Delta:</strong> +{Math.max(0, photo2.heightCm - photo1.heightCm)} cm height gain over{' '}
                  {Math.abs(photo2.weekNumber - photo1.weekNumber)} weeks.
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  Healthy vegetative expansion detected.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
