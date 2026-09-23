import { CropJournalRecord, WeeklyGrowthPhoto } from '../types';

const STORAGE_KEY = 'smartagri_crop_growth_journal_v2';

// Realistic starter crop to give farmers immediate interactive experience
const SEED_CHILLI_PHOTOS: WeeklyGrowthPhoto[] = [
  {
    id: 'photo_w1',
    date: '2026-08-15',
    weekNumber: 1,
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=75',
    stage: 'Germination & Cotyledon emergence',
    stageTelugu: 'మొలక దశ (విత్తనం మొలకెత్తుట)',
    heightCm: 4.5,
    notes: 'Uniform seed germination observed across all furrows. Maintained gentle sprinkler moisture.',
    pestObservations: 'No pests observed. Soil moisture adequate.',
    waterGivenLiters: 1200,
  },
  {
    id: 'photo_w3',
    date: '2026-08-29',
    weekNumber: 3,
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23991?auto=format&fit=crop&w=600&q=75',
    stage: 'Early Vegetative (4-6 true leaves)',
    stageTelugu: 'శాఖీయ దశ (4-6 ఆకులు)',
    heightCm: 14.0,
    notes: 'Applied well-decomposed FYM and drenched with Jeevamrutham. Vigorous dark green foliage.',
    pestObservations: 'Minor aphid presence on 2 plants; sprayed Neem oil 10,000 ppm.',
    waterGivenLiters: 2500,
  },
  {
    id: 'photo_w5',
    date: '2026-09-12',
    weekNumber: 5,
    imageUrl: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=75',
    stage: 'Active Branching & Stem Thickening',
    stageTelugu: 'కొమ్మలు తొడుగు దశ',
    heightCm: 26.5,
    notes: 'Secondary branching profuse. Main stem thick and upright. Installed yellow sticky traps.',
    pestObservations: 'Sticky traps caught 15 whiteflies; foliage healthy with no curl.',
    waterGivenLiters: 3200,
  },
  {
    id: 'photo_w6',
    date: '2026-09-20',
    weekNumber: 6,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=75',
    stage: 'Early Floral Bud Initiation',
    stageTelugu: 'మొగ్గ తొడుగు & ప్రారంభ పూత దశ',
    heightCm: 34.0,
    notes: 'Flower pinhead buds appearing at crown nodes. Applied light potassium spray to support flowering.',
    pestObservations: 'Clean canopy. No thrips or mites spotted on leaf undersides.',
    waterGivenLiters: 3500,
  },
];

const INITIAL_CROPS: CropJournalRecord[] = [
  {
    id: 'crop_chilli_teja_2026',
    cropName: 'Chilli (మిరప)',
    cropNameTelugu: 'మిరప',
    variety: 'Guntur Teja (S-17 High Pungency)',
    sowingDate: '2026-08-10',
    plotName: 'East Field - Plot 3B',
    areaAcres: 2.5,
    soilType: 'Black Cotton Regur Soil',
    currentStage: 'flowering',
    currentStageLabel: 'Floral Bud & Early Flowering',
    currentStageLabelTelugu: 'మొగ్గ & ప్రారంభ పూత దశ',
    daysElapsed: 44,
    estimatedDurationDays: 140,
    growthProgressPercent: 32,
    photos: SEED_CHILLI_PHOTOS,
    notes: 'Drip fertigation installed. High density bed spacing (75 cm x 45 cm). Target dry pod yield: 22 quintals/acre.',
    targetHarvestDate: '2026-12-28',
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Loads all farmer crop journal records from local storage.
 */
export function getStoredCrops(): CropJournalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CROPS));
      return INITIAL_CROPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CROPS;
  } catch (err) {
    console.error('Error reading crop journal storage:', err);
    return INITIAL_CROPS;
  }
}

/**
 * Saves or updates a crop record in local storage.
 */
export function saveCropRecord(record: CropJournalRecord): void {
  try {
    const existing = getStoredCrops();
    const index = existing.findIndex((c) => c.id === record.id);
    if (index >= 0) {
      existing[index] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      existing.unshift({ ...record, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save crop record:', err);
  }
}

/**
 * Deletes a crop record by ID.
 */
export function deleteCropRecord(cropId: string): void {
  try {
    const existing = getStoredCrops().filter((c) => c.id !== cropId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to delete crop record:', err);
  }
}

/**
 * Adds a new weekly photo log to an existing crop record.
 */
export function addGrowthPhotoToCrop(cropId: string, photoLog: WeeklyGrowthPhoto): void {
  try {
    const existing = getStoredCrops();
    const target = existing.find((c) => c.id === cropId);
    if (target) {
      target.photos = [...target.photos, photoLog];
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch (err) {
    console.error('Failed to append growth photo:', err);
  }
}

/**
 * Compresses an image data URL or file on a client-side HTML5 canvas
 * to max 800px width/height and ~70% JPEG quality.
 * Prevents localStorage quota exceeded errors and ensures instant rendering.
 */
export async function compressImage(fileOrDataUrl: File | string): Promise<string> {
  return new Promise((resolve, reject) => {
    let src = '';
    if (typeof fileOrDataUrl === 'string') {
      src = fileOrDataUrl;
    } else {
      src = URL.createObjectURL(fileOrDataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(src);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(src);
    };

    img.src = src;
  });
}
