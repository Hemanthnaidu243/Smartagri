import { ImageQualityReport, ImageQualityGrade, ImageQualityIssue, ImageEnhancementState } from '../types';

/**
 * Analyzes crop leaf image quality:
 * - Detects underexposure (too dark), overexposure (glare/too bright)
 * - Detects blur / focus degradation using spatial Laplacian variance
 * - Detects low resolution
 * - Generates intuitive farmer-friendly descriptions in English and Telugu
 */
export async function analyzeImageQuality(dataUrl: string): Promise<ImageQualityReport> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // Downsampled canvas for fast client-side pixel evaluation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const sampleWidth = Math.min(width, 240);
      const sampleHeight = Math.min(height, 240);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      const issues: ImageQualityIssue[] = [];
      const warnings: string[] = [];
      const warningsTelugu: string[] = [];

      if (!ctx) {
        resolve({
          brightness: 128,
          blurScore: 70,
          width,
          height,
          status: 'good',
          lightingLabel: 'Good Lighting',
          lightingLabelTelugu: 'మంచి వెలుతురు',
          clarityLabel: 'Clear Details',
          clarityLabelTelugu: 'స్పష్టమైన వివరాలు',
          issues: [],
          warnings: [],
          warningsTelugu: [],
          isAcceptable: true,
          canEnhance: false,
        });
        return;
      }

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      const data = imageData.data;

      // 1. Calculate Average Luminance & Distribution
      let totalLuminance = 0;
      let darkPixelCount = 0;
      let blownOutPixelCount = 0;
      const pixelCount = sampleWidth * sampleHeight;
      const grayscale: number[] = new Array(pixelCount);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Standard relative luminance formula
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        grayscale[i / 4] = lum;

        if (lum < 40) darkPixelCount++;
        if (lum > 235) blownOutPixelCount++;
      }

      const avgBrightness = Math.round(totalLuminance / pixelCount);
      const darkRatio = darkPixelCount / pixelCount;
      const blownRatio = blownOutPixelCount / pixelCount;

      // 2. High-Frequency Contrast / Edge Variance (Sharpness estimation)
      let edgeDeltaSum = 0;
      for (let y = 1; y < sampleHeight - 1; y++) {
        for (let x = 1; x < sampleWidth - 1; x++) {
          const idx = y * sampleWidth + x;
          const center = grayscale[idx];
          const left = grayscale[idx - 1];
          const right = grayscale[idx + 1];
          const top = grayscale[idx - sampleWidth];
          const bottom = grayscale[idx + sampleWidth];

          const diff = Math.abs(4 * center - left - right - top - bottom);
          edgeDeltaSum += diff;
        }
      }

      const avgEdgeDelta = edgeDeltaSum / ((sampleWidth - 2) * (sampleHeight - 2));
      // Normalize to 0 - 100 sharpness score
      const blurScore = Math.min(100, Math.round((avgEdgeDelta / 25) * 100));

      // Quality evaluation with farmer-friendly labels
      let status: ImageQualityGrade = 'good';
      let lightingLabel = 'Optimal Daylight';
      let lightingLabelTelugu = 'సరిపడా పగటి వెలుతురు';
      let clarityLabel = 'Sharp & Focused';
      let clarityLabelTelugu = 'స్పష్టమైన ఆకు చిత్రం';
      let canEnhance = false;

      // Low resolution check
      if (width < 300 || height < 300) {
        issues.push({
          type: 'low_res',
          title: 'Low Resolution Photo',
          titleTelugu: 'తక్కువ స్పష్టత గల ఫోటో',
          description: 'The photo resolution is low, which may hide tiny pest spots or fungal spores.',
          descriptionTelugu: 'ఫోటో పరిమాణం చిన్నదిగా ఉంది, దీనివల్ల చిన్న మచ్చలు లేదా తెగులు స్పష్టంగా కనిపించకపోవచ్చు.',
          tip: 'Move closer to the affected leaf section or capture in HD mode.',
          tipTelugu: 'ఆకుకు మరింత దగ్గరగా కెమెరాను ఉంచి స్పష్టంగా ఫోటో తీయండి.',
          canAutoFix: false,
        });
        warnings.push('Low image resolution. Capture closer to the leaf for optimal diagnosis.');
        warningsTelugu.push('ఫోటో స్పష్టత తక్కువగా ఉంది. ఆకు దగ్గరగా ఫోటో తీస్తే మంచి ఫలితం వస్తుంది.');
        clarityLabel = 'Low Resolution';
        clarityLabelTelugu = 'తక్కువ స్పష్టత';
        status = 'fair';
      }

      // Underexposure (Too Dark) check
      if (avgBrightness < 68 || darkRatio > 0.45) {
        canEnhance = true;
        issues.push({
          type: 'dark',
          title: 'Photo Too Dark (Shadowed)',
          titleTelugu: 'ఫోటో చాలా చీకటిగా / నీడలో ఉంది',
          description: 'Leaf veins and pathogen spots are obscured by poor lighting.',
          descriptionTelugu: 'వెలుతురు లేకపోవడం వల్ల ఆకు నరాలు మరియు తెగులు మచ్చలు చీకట్లో కనిపించడం లేదు.',
          tip: 'Step into sunlight or turn on the camera flashlight.',
          tipTelugu: 'మంచి వెలుతురులో లేదా మొబైల్ ఫ్లాష్‌లైట్ ఆన్ చేసి ఫోటో తీయండి.',
          canAutoFix: true,
        });
        warnings.push('Image is dark. Automatic brightness boost is ready.');
        warningsTelugu.push('ఫోటో చీకటిగా ఉంది. ఆటోమేటిక్ బ్రైట్‌నెస్ సరిచేయబడుతుంది.');
        lightingLabel = 'Too Dark / Shadowed';
        lightingLabelTelugu: 'చీకటిగా ఉంది';
        status = 'fair';
      } else if (avgBrightness > 220 || blownRatio > 0.35) {
        // Overexposure (Harsh Glare) check
        canEnhance = true;
        issues.push({
          type: 'bright',
          title: 'Harsh Glare / Too Bright',
          titleTelugu: 'ఎక్కువ కాంతి / ఎండ మెరుపు',
          description: 'Direct sun reflection is washing out the leaf color.',
          descriptionTelugu: 'తీవ్రమైన ఎండ కాంతి వల్ల ఆకు అసలు రంగు స్పష్టంగా కనిపించడం లేదు.',
          tip: 'Shade the leaf with your hand or body when taking the photo.',
          tipTelugu: 'మీ చేతి నీడను ఆకుపై ఉంచి స్పష్టమైన ఫోటో తీయండి.',
          canAutoFix: true,
        });
        warnings.push('High sun glare detected. Contrast recovery ready.');
        warningsTelugu.push('ఎక్కువ ఎండ కాంతి ఉంది. కాంట్రాస్ట్ సరిచేయబడుతుంది.');
        lightingLabel = 'Harsh Sun Glare';
        lightingLabelTelugu = 'ఎక్కువ ఎండ కాంతి';
        status = 'fair';
      }

      // Blurry / Out of Focus check
      if (blurScore < 24) {
        canEnhance = true;
        issues.push({
          type: 'blurry',
          title: 'Slightly Out of Focus',
          titleTelugu: 'ఆకు కొద్దిగా అస్పష్టంగా ఉంది',
          description: 'The leaf edges and textures appear soft or motion-blurred.',
          descriptionTelugu: 'కెమెరా కదలడం వల్ల ఆకు అంచులు స్పష్టంగా కనిపించడం లేదు.',
          tip: 'Hold the camera completely steady and tap the leaf on your screen to focus.',
          tipTelugu: 'కెమెరాను కదలకుండా ఉంచి స్క్రీన్‌పై ఆకును ట్యాప్ చేసి ఫోకస్ చేయండి.',
          canAutoFix: true,
        });
        warnings.push('Foliage is slightly blurry. Smart sharpening can improve visibility.');
        warningsTelugu.push('ఆకు చిత్రం కొద్దిగా అస్పష్టంగా ఉంది. స్పష్టతను పెంచవచ్చు.');
        clarityLabel = 'Soft / Blurry Focus';
        clarityLabelTelugu = 'కొద్దిగా అస్పష్టంగా ఉంది';
        if (status === 'fair') status = 'poor';
        else status = 'fair';
      }

      if (issues.length >= 2 && (blurScore < 18 || avgBrightness < 45)) {
        status = 'poor';
      }

      resolve({
        brightness: avgBrightness,
        blurScore: Math.max(12, blurScore),
        width,
        height,
        status,
        lightingLabel,
        lightingLabelTelugu,
        clarityLabel,
        clarityLabelTelugu,
        issues,
        warnings,
        warningsTelugu,
        isAcceptable: status !== 'poor',
        canEnhance,
      });
    };

    img.onerror = () => {
      resolve({
        brightness: 128,
        blurScore: 50,
        width: 400,
        height: 300,
        status: 'fair',
        lightingLabel: 'Standard Lighting',
        lightingLabelTelugu: 'సాధారణ వెలుతురు',
        clarityLabel: 'Readable',
        clarityLabelTelugu: 'చదవదగినది',
        issues: [],
        warnings: ['Could not verify all image properties.'],
        warningsTelugu: ['ఫోటో లక్షణాలను పూర్తిగా పరిశీలించలేకపోయాము.'],
        isAcceptable: true,
        canEnhance: false,
      });
    };

    img.src = dataUrl;
  });
}

/**
 * Automatically enhances an agricultural crop photo:
 * - Adaptive brightness boost (gamma curve tailored to underexposed foliage)
 * - Local contrast stretching & color saturation boost for leaf chloroplasts & lesions
 * - Unsharp masking / high-frequency sharpening convolution kernel
 * - Returns a crisp new Base64 data URL while keeping original safe
 */
export async function enhanceCropImage(
  dataUrl: string,
  qualityReport?: ImageQualityReport
): Promise<{ enhancedDataUrl: string; state: ImageEnhancementState }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      // Keep max dimension bounded to 1600px for optimal AI vision processing speed & memory
      const maxDim = 1600;
      let targetWidth = naturalWidth;
      let targetHeight = naturalHeight;
      if (naturalWidth > maxDim || naturalHeight > maxDim) {
        if (naturalWidth > naturalHeight) {
          targetWidth = maxDim;
          targetHeight = Math.round((naturalHeight / naturalWidth) * maxDim);
        } else {
          targetHeight = maxDim;
          targetWidth = Math.round((naturalWidth / naturalHeight) * maxDim);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve({
          enhancedDataUrl: dataUrl,
          state: {
            isEnhanced: false,
            brightnessBoost: 0,
            contrastBoost: 0,
            sharpnessApplied: false,
            algorithmSummary: 'Canvas context unavailable',
            algorithmSummaryTelugu: 'క్యాలిక్యులేషన్ అందుబాటులో లేదు',
          },
        });
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const pixels = imgData.data;

      const currentBrightness = qualityReport?.brightness ?? 80;
      let brightnessBoostPercent = 0;
      let contrastFactor = 1.08;

      // Dynamic Exposure Compensation Factor
      if (currentBrightness < 50) {
        // Severely dark image (e.g. 30-49)
        brightnessBoostPercent = 65;
        contrastFactor = 1.25;
      } else if (currentBrightness < 75) {
        // Moderately dark image
        brightnessBoostPercent = 40;
        contrastFactor = 1.18;
      } else if (currentBrightness < 100) {
        // Mildly underexposed image
        brightnessBoostPercent = 20;
        contrastFactor = 1.12;
      } else if (currentBrightness > 215) {
        // Overexposed / sun glare: reduce brightness slightly, increase local contrast
        brightnessBoostPercent = -15;
        contrastFactor = 1.30;
      } else {
        // Well-balanced image: slight contrast & vividness polish
        brightnessBoostPercent = 10;
        contrastFactor = 1.08;
      }

      // Precalculate lookup table for fast pixel transformation
      const lut = new Uint8Array(256);
      const brightOffset = (brightnessBoostPercent / 100) * 80;

      for (let i = 0; i < 256; i++) {
        // Contrast around midpoint 128 + dynamic brightness offset
        let val = (i - 128) * contrastFactor + 128 + brightOffset;
        // Non-linear shadow lift for chlorophyll tones
        if (brightnessBoostPercent > 0 && i < 110) {
          const shadowLift = (110 - i) * 0.28;
          val += shadowLift;
        }
        lut[i] = Math.max(0, Math.min(255, Math.round(val)));
      }

      // Apply LUT and slight saturation boost to enhance fungal spots & leaf veins
      for (let i = 0; i < pixels.length; i += 4) {
        const r = lut[pixels[i]];
        const g = lut[pixels[i + 1]];
        const b = lut[pixels[i + 2]];

        // Mild saturation stretch (10%) to highlight yellowing / brown spots
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        pixels[i] = Math.max(0, Math.min(255, Math.round(gray + 1.12 * (r - gray))));
        pixels[i + 1] = Math.max(0, Math.min(255, Math.round(gray + 1.12 * (g - gray))));
        pixels[i + 2] = Math.max(0, Math.min(255, Math.round(gray + 1.12 * (b - gray))));
      }

      ctx.putImageData(imgData, 0, 0);

      // Unsharp Mask Sharpening Filter to bring out leaf veins and lesion margins
      applyUnsharpMask(ctx, targetWidth, targetHeight, 0.35);

      const enhancedDataUrl = canvas.toDataURL('image/jpeg', 0.94);

      resolve({
        enhancedDataUrl,
        state: {
          isEnhanced: true,
          brightnessBoost: brightnessBoostPercent,
          contrastBoost: Math.round((contrastFactor - 1) * 100),
          sharpnessApplied: true,
          algorithmSummary: `Brightened +${brightnessBoostPercent}%, Contrast +${Math.round((contrastFactor - 1) * 100)}%, Vein Sharpening Active`,
          algorithmSummaryTelugu: `వెలుతురు +${brightnessBoostPercent}%, కాంట్రాస్ట్ +${Math.round((contrastFactor - 1) * 100)}%, ఆకు నరాల స్పష్టత మెరుగుపరచబడింది`,
        },
      });
    };

    img.onerror = () => {
      resolve({
        enhancedDataUrl: dataUrl,
        state: {
          isEnhanced: false,
          brightnessBoost: 0,
          contrastBoost: 0,
          sharpnessApplied: false,
          algorithmSummary: 'Failed to load source image for enhancement',
          algorithmSummaryTelugu: 'ఫోటోను మెరుగుపరచలేకపోయాము',
        },
      });
    };

    img.src = dataUrl;
  });
}

/**
 * Fast 3x3 unsharp mask convolution kernel
 */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  try {
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const s = src.data;
    const d = dst.data;

    // Kernel:
    // [  0, -a,  0 ]
    // [ -a, 1+4a, -a ]
    // [  0, -a,  0 ]
    const a = amount;
    const c = 1 + 4 * a;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const top = ((y - 1) * width + x) * 4;
        const bot = ((y + 1) * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;

        for (let ch = 0; ch < 3; ch++) {
          const val =
            c * s[idx + ch] -
            a * (s[top + ch] + s[bot + ch] + s[left + ch] + s[right + ch]);
          d[idx + ch] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
        d[idx + 3] = s[idx + 3];
      }
    }

    ctx.putImageData(dst, 0, 0);
  } catch {
    // If browser memory limits prevent convolution, retain original canvas
  }
}
