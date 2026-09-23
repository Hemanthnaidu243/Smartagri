import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  UploadCloud, 
  Camera, 
  Trash2, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Printer, 
  BookmarkCheck,
  Share2,
  Download,
  Info,
  Sparkles,
  Sliders,
  Sun,
  Eye,
  Check,
  Layers,
  HelpCircle,
  Wand2,
  ArrowRight,
  ZoomIn,
  ShieldCheck,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { 
  Language, 
  UploadedImageInfo, 
  CropAnalysisResult, 
  AppMode, 
  ImageQualityReport 
} from '../types';
import { translations } from '../i18n/translations';
import { sampleLeaves, SampleLeaf } from '../data/sampleCrops';
import { detectCropHealth } from '../services/cropService';
import { analyzeImageQuality, enhanceCropImage } from '../utils/imageQuality';
import { CameraCaptureModal } from './CameraCaptureModal';

interface CropDoctorProps {
  language: Language;
  appMode: AppMode;
  onToggleMode: () => void;
  onSaveToHistory: (record: UploadedImageInfo) => void;
  onShowToast: (msg: string) => void;
  onOpenApiSetup: () => void;
}

export const CropDoctor: React.FC<CropDoctorProps> = ({
  language,
  appMode,
  onToggleMode,
  onSaveToHistory,
  onShowToast,
  onOpenApiSetup,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileGalleryInputRef = useRef<HTMLInputElement>(null);

  const [currentImage, setCurrentImage] = useState<UploadedImageInfo | null>(null);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [resultLanguage, setResultLanguage] = useState<Language>(language);

  // Sync result language when app language changes
  React.useEffect(() => {
    setResultLanguage(language);
  }, [language]);

  // Automatically runs quality analysis and auto-enhancement if image is dark or fair
  const evaluateAndOptionallyEnhance = async (
    rawBase64: string,
    filename: string,
    fileType: string,
    fileSizeFormatted: string,
    source: 'upload' | 'camera' | 'dragdrop' | 'sample',
    autoEnhanceIfDark: boolean = true
  ) => {
    const now = new Date().toLocaleString(language === 'te' ? 'te-IN' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // 1. Initial Quality Pre-Scan
    const initialReport = await analyzeImageQuality(rawBase64);

    let activeDataUrl = rawBase64;
    let isEnhanced = false;
    let enhancementState = undefined;
    let finalReport = initialReport;

    // 2. Auto-Enhancement for dark / underexposed foliage
    if (autoEnhanceIfDark && initialReport.canEnhance && (initialReport.brightness < 72 || initialReport.status !== 'good')) {
      try {
        const enhancedResult = await enhanceCropImage(rawBase64, initialReport);
        activeDataUrl = enhancedResult.enhancedDataUrl;
        isEnhanced = true;
        enhancementState = enhancedResult.state;
        
        // Re-evaluate quality on the enhanced preview
        finalReport = await analyzeImageQuality(activeDataUrl);
      } catch (err) {
        console.warn('Auto-enhancement failed, falling back to original:', err);
      }
    }

    setQualityReport(finalReport);
    setCurrentImage({
      id: (source === 'camera' ? 'cam-' : 'img-') + Date.now(),
      name: filename,
      type: fileType,
      size: fileSizeFormatted,
      dataUrl: activeDataUrl,
      originalDataUrl: rawBase64,
      isEnhanced: isEnhanced,
      enhancementState: enhancementState,
      uploadedAt: now,
      source: source,
      qualityReport: finalReport,
    });

    if (isEnhanced) {
      onShowToast(
        language === 'te' 
          ? 'ఫోటో స్పష్టత మరియు వెలుతురు ఆటోమేటిక్‌గా మెరుగుపరచబడింది!' 
          : 'Image exposure & sharpness automatically enhanced for AI diagnosis!'
      );
    }
  };

  // Process and validate an image file
  const processImageFile = async (
    file: File,
    source: 'upload' | 'camera' | 'dragdrop' | 'sample'
  ) => {
    setErrorMessage(null);
    setHasSaved(false);
    setQualityReport(null);
    setShowOriginalComparison(false);

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage(t.cropDoctor.validationError);
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(
        language === 'te'
          ? 'ఫోటో పరిమాణం 15MB మించి ఉంది. దయచేసి చిన్న ఫోటోను ఎంచుకోండి.'
          : 'File size exceeds 15MB limit. Please upload a smaller image.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      await evaluateAndOptionallyEnhance(
        dataUrl,
        file.name,
        file.type || 'image/jpeg',
        sizeFormatted,
        source,
        true // Auto-enhance if dark
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], 'upload');
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0], 'dragdrop');
    }
  };

  // Live Camera Photo Captured Handler
  const handleLiveCameraCaptured = async (
    dataUrl: string,
    filename: string,
    sizeFormatted: string
  ) => {
    setErrorMessage(null);
    setHasSaved(false);
    setShowOriginalComparison(false);

    await evaluateAndOptionallyEnhance(
      dataUrl,
      filename,
      'image/jpeg',
      sizeFormatted,
      'camera',
      true
    );

    onShowToast(language === 'te' ? 'కెమెరా ఫోటో సిద్ధంగా ఉంది!' : 'Live photo captured successfully!');
  };

  // Quick select verified sample leaf
  const handleSelectSample = async (sample: SampleLeaf) => {
    setErrorMessage(null);
    setHasSaved(false);
    setShowOriginalComparison(false);

    const now = new Date().toLocaleString(language === 'te' ? 'te-IN' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const report = await analyzeImageQuality(sample.imageUrl);
    setQualityReport(report);

    setCurrentImage({
      id: 'sample-' + Date.now(),
      name: sample.filename,
      type: sample.fileType,
      size: sample.fileSize,
      dataUrl: sample.imageUrl,
      originalDataUrl: sample.imageUrl,
      isEnhanced: false,
      uploadedAt: now,
      source: 'sample',
      qualityReport: report,
      result: sample.expectedResult,
    });
  };

  // Manual "Fix Image" / "Enhance Image" Button Handler
  const handleManualFixImage = async () => {
    if (!currentImage) return;
    setIsEnhancing(true);

    try {
      const sourceUrl = currentImage.originalDataUrl || currentImage.dataUrl;
      const res = await enhanceCropImage(sourceUrl, currentImage.qualityReport);
      const newReport = await analyzeImageQuality(res.enhancedDataUrl);

      setQualityReport(newReport);
      setCurrentImage({
        ...currentImage,
        dataUrl: res.enhancedDataUrl,
        isEnhanced: true,
        enhancementState: res.state,
        qualityReport: newReport,
      });

      onShowToast(
        language === 'te'
          ? 'ఫోటో స్పష్టత మెరుగుపరచబడింది!'
          : 'Image successfully enhanced with AI filter!'
      );
    } catch (err: any) {
      onShowToast(
        language === 'te'
          ? 'ఫోటోను మెరుగుపరచడంలో లోపం ఏర్పడింది.'
          : 'Could not enhance image. Please retry or retake.'
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  // Revert back to original captured image
  const handleRevertToOriginal = async () => {
    if (!currentImage || !currentImage.originalDataUrl) return;
    setIsEnhancing(true);

    try {
      const origReport = await analyzeImageQuality(currentImage.originalDataUrl);
      setQualityReport(origReport);
      setCurrentImage({
        ...currentImage,
        dataUrl: currentImage.originalDataUrl,
        isEnhanced: false,
        enhancementState: undefined,
        qualityReport: origReport,
      });
      onShowToast(
        language === 'te' ? 'అసలు ఫోటో పునరుద్ధరించబడింది' : 'Reverted to original photo'
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  // Trigger Detection
  const handleStartDetection = async () => {
    if (!currentImage) {
      setErrorMessage(
        language === 'te'
          ? 'దయచేసి విశ్లేషణకు ముందు ఫోటోను ఎంచుకోండి లేదా కెమెరాతో తీయండి.'
          : 'Please select an image or capture a leaf photo before analyzing.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStepIndex(0);

    const stepInterval = setInterval(() => {
      setAnalysisStepIndex((prev) => (prev < 2 ? prev + 1 : prev));
    }, 600);

    try {
      // Send the optimal image (enhanced if available) to the backend
      const result = await detectCropHealth(
        currentImage.dataUrl,
        currentImage.name,
        currentImage.type,
        resultLanguage,
        appMode
      );

      clearInterval(stepInterval);
      setCurrentImage({
        ...currentImage,
        result: result,
      });
      setIsAnalyzing(false);
      onShowToast(
        language === 'te'
          ? 'పంట ఆరోగ్యం విజయవంతంగా విశ్లేషించబడింది!'
          : 'Crop diagnosis completed successfully!'
      );
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMessage(
        err?.message ||
          (language === 'te'
            ? 'విశ్లేషణ విఫలమైంది. దయచేసి స్పష్టమైన ఫోటోతో మళ్లీ ప్రయత్నించండి.'
            : 'Analysis failed. Please retry with a clearer photo.')
      );
    }
  };

  const handleReset = () => {
    setCurrentImage(null);
    setQualityReport(null);
    setErrorMessage(null);
    setHasSaved(false);
    setShowOriginalComparison(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileGalleryInputRef.current) mobileGalleryInputRef.current.value = '';
  };

  const handleSaveReport = () => {
    if (currentImage && currentImage.result && !hasSaved) {
      onSaveToHistory(currentImage);
      setHasSaved(true);
      onShowToast(t.results.savedToast);
    }
  };

  // Share Result via Web Share API or Clipboard Copy
  const handleShareResult = async () => {
    if (!currentImage || !currentImage.result) return;
    const res = currentImage.result;

    const shareTitle = `${res.cropName} - Foliar Diagnosis`;
    const shareText = `Crop: ${res.cropName}\nStatus: ${res.healthStatusText}\nCondition: ${res.diseaseOrSymptom}\nConfidence: ${res.confidenceScore}%\nDiagnosed via Smart Agriculture AI.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
        onShowToast(language === 'te' ? 'రిపోర్ట్ షేర్ చేయబడింది' : 'Report shared successfully');
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}`);
      onShowToast(
        language === 'te'
          ? 'రిపోర్ట్ టెక్స్ట్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది'
          : 'Report summary copied to clipboard'
      );
    }
  };

  // Print friendly view
  const handlePrint = () => {
    window.print();
  };

  // Download complete text report file
  const handleDownloadReport = () => {
    if (!currentImage?.result) return;
    const res = currentImage.result;
    const isTe = resultLanguage === 'te';
    const reportText = `=====================================================
SmartAgri AI Crop Doctor - Agricultural Diagnostic Report
=====================================================
Date & Time: ${new Date().toLocaleString()}
Engine: ${res.isGemini ? 'Google Gemini Vision AI' : 'Verified Agronomic Specimen Model'}
Model: ${res.modelUsed || 'Gemini 3.1'}

1. PLANT IDENTIFICATION
-----------------------------------------------------
Crop Name: ${isTe ? res.cropNameTelugu : res.cropName}
Scientific Name: ${res.scientificName || 'N/A'}
Visual Quality Grade: ${res.imageQualityStatus.toUpperCase()}

2. HEALTH & DIAGNOSIS
-----------------------------------------------------
Status: ${isTe ? res.healthStatusTextTelugu : res.healthStatusText}
Primary Diagnosis: ${isTe ? res.diseaseOrSymptomTelugu : res.diseaseOrSymptom}
Risk Level: ${isTe ? res.riskLevelTelugu : res.riskLevel}
Visual Pattern Confidence: ${res.confidenceScore}%

3. DETECTED SYMPTOMS
-----------------------------------------------------
${(isTe ? res.symptomsTelugu : res.symptoms).map((s, i) => `${i + 1}. ${s}`).join('\n')}

4. RECOMMENDED NEXT STEPS & TREATMENTS
-----------------------------------------------------
${(isTe ? res.recommendedNextStepsTelugu : res.recommendedNextSteps).map((step, i) => `${i + 1}. ${step}`).join('\n')}

5. IMMEDIATE FARMER ACTION ITEMS
-----------------------------------------------------
${(isTe ? res.farmerActionItemsTelugu : res.farmerActionItems).map((act, i) => `[ ] Step ${i + 1}: ${act}`).join('\n')}

6. PREVENTIVE CROP MANAGEMENT
-----------------------------------------------------
${(isTe ? res.preventiveTipsTelugu || [] : res.preventiveTips || []).map((tip, i) => `* ${tip}`).join('\n')}

LIMITATIONS & DISCLAIMER:
-----------------------------------------------------
${isTe ? res.analysisLimitationsTelugu : res.analysisLimitations}
National Kisan Call Center: 1800-180-1551 (Toll Free)
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CropDoctor_Report_${res.cropName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(isTe ? 'నివేదిక ఫైల్ డౌన్‌లోడ్ చేయబడింది!' : 'Diagnostic report downloaded!');
  };

  const result = currentImage?.result;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={mobileGalleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleLiveCameraCaptured}
        language={language}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-950 text-white rounded-3xl p-6 sm:p-9 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 backdrop-blur-md text-emerald-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {language === 'te' 
                ? 'AI పంట వ్యాధి నిర్ధారణ మరియు స్మార్ట్ ఫోటో మెరుగుదల' 
                : 'AI Crop Diagnostic & Smart Image Quality Enhancement'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t.cropDoctor.title}
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {language === 'te'
              ? 'ఆకు ఫోటోను తీయండి లేదా అప్‌లోడ్ చేయండి. మా స్మార్ట్ ప్రీ-స్కాన్ ఇంజిన్ చీకటి ఫోటోలను ఆటోమేటిక్‌గా సరిచేసి, స్పష్టమైన వ్యాధి నిర్ధారణను అందిస్తుంది.'
              : 'Upload or capture a leaf photo. Our pre-scan engine automatically brightens dark leaves, enhances contrast, and detects plant pathogens with Gemini Vision.'}
          </p>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
          <Wand2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* STEP 1: Upload / Capture Card (Shown when no image is selected) */}
      {!currentImage && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all bg-white dark:bg-slate-900 shadow-sm ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {t.cropDoctor.dropzoneTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'te'
                    ? 'చీకటిగా ఉన్న ఫోటోలను మా సిస్టమ్ స్వయంచాలకంగా ప్రకాశవంతం చేస్తుంది. కంప్యూటర్ లేదా మొబైల్ కెమెరాతో ఫోటో తీయండి.'
                    : 'Drag & drop leaf photo, or use device camera. Dark or shadowed images will be automatically brightened.'}
                </p>
              </div>

              {/* Action Buttons: Camera + File Upload + Gallery */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {/* 1. Live Camera */}
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'te' ? 'లైవ్ కెమెరా తెరవండి' : 'Open Field Camera'}</span>
                </button>

                {/* 2. Browse Computer */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>{t.cropDoctor.browseButton}</span>
                </button>

                {/* 3. Mobile Gallery */}
                <button
                  type="button"
                  onClick={() => mobileGalleryInputRef.current?.click()}
                  className="px-4 py-3.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'te' ? 'మొబైల్ గ్యాలరీ' : 'Gallery'}</span>
                </button>
              </div>

              {/* Supported Formats */}
              <p className="text-[11px] text-slate-400 font-mono">
                {t.cropDoctor.formatHint}
              </p>
            </div>
          </div>

          {/* Verification Samples Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'te' ? 'పరీక్షించడానికి ఉదాహరణ ఆకులు' : 'Or Test with Pre-Verified Samples'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'te'
                    ? 'మీ వద్ద ఫోటో లేకపోతే క్రింది నమూనాలను ఎంచుకుని తనిఖీ చేయండి'
                    : 'Click any verified field sample to immediately test the diagnosis workflow'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {sampleLeaves.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col space-y-2"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 relative">
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      {sample.name}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {language === 'te' ? sample.nameTelugu : sample.name}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {language === 'te' ? sample.descriptionTelugu : sample.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Pre-Analysis Preview & Smart Quality Enhancement */}
      {currentImage && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-md space-y-6">
            
            {/* Top Toolbar: Image Mode Badges & Comparison Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.cropDoctor.imageDetailsTitle}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Source: {currentImage.source === 'camera' ? 'Live Camera' : currentImage.source === 'sample' ? 'Sample Leaf' : 'File Upload'}
                </span>

                {currentImage.isEnhanced && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'te' ? 'మెరుగుపరచబడింది' : 'Enhanced Preview'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Compare Original Toggle (if enhanced) */}
                {currentImage.originalDataUrl && currentImage.isEnhanced && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {showOriginalComparison 
                          ? (language === 'te' ? 'మెరుగైన ఫోటో చూడండి' : 'Show Enhanced')
                          : (language === 'te' ? 'అసలు ఫోటోతో పోల్చండి' : 'Compare Original')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRevertToOriginal}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                    >
                      {language === 'te' ? 'రీసెట్' : 'Revert'}
                    </button>
                  </>
                )}

                {/* Reset / Remove Photo */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-colors flex items-center gap-1.5"
                  title="Remove current image"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  <span>{language === 'te' ? 'ఫోటో తీసివేయండి' : 'Clear Photo'}</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Preview & Quality Diagnostic */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Image Preview with Interactive Controls */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group shadow-inner">
                  <img
                    src={showOriginalComparison && currentImage.originalDataUrl ? currentImage.originalDataUrl : currentImage.dataUrl}
                    alt={currentImage.name}
                    className="w-full h-full object-contain"
                  />

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 shadow-md">
                    {showOriginalComparison ? (
                      <span className="text-amber-400 font-bold">{language === 'te' ? 'అసలు ఫోటో (RAW)' : 'Original (Raw)'}</span>
                    ) : currentImage.isEnhanced ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{language === 'te' ? 'మెరుగైన ఫోటో' : 'Enhanced (Ready)'}</span>
                      </span>
                    ) : (
                      <span>{language === 'te' ? 'ఫోటో ప్రివ్యూ' : 'Standard'}</span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                    {currentImage.size}
                  </div>
                </div>

                {/* Enhancement Algorithm Details Tag */}
                {currentImage.isEnhanced && currentImage.enhancementState && !showOriginalComparison && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wand2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {language === 'te' 
                          ? currentImage.enhancementState.algorithmSummaryTelugu 
                          : currentImage.enhancementState.algorithmSummary}
                      </span>
                    </span>
                    <span className="font-bold text-emerald-700 font-mono">AUTO</span>
                  </div>
                )}
              </div>

              {/* Quality Diagnostic Card & Farmer Friendly Evaluation */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Farmer Friendly Quality Banner (Replacing technical jargon) */}
                {qualityReport && (
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    qualityReport.status === 'good'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                      : qualityReport.status === 'fair'
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                      : 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-200'
                  }`}>
                    
                    {/* Header: Friendly Quality Grade */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {qualityReport.status === 'good' ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : qualityReport.status === 'fair' ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                        )}

                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base">
                            {qualityReport.status === 'good' 
                              ? (language === 'te' ? 'చిత్ర నాణ్యత: స్పష్టంగా ఉంది (ఉత్తమం)' : 'Image Quality: Clear & Ready')
                              : qualityReport.status === 'fair'
                              ? (language === 'te' ? 'చిత్ర నాణ్యత: సరిపోతుంది (పరిశీలించవచ్చు)' : 'Image Quality: Readable with Guidance')
                              : (language === 'te' ? 'చిత్ర నాణ్యత: స్పష్టత తక్కువగా ఉంది' : 'Image Quality: Needs Better Lighting')}
                          </h4>
                          <p className="text-[11px] opacity-80">
                            {language === 'te' 
                              ? 'ఆకులోని వ్యాధి లక్షణాలను గుర్తించడానికి ప్రీ-స్కాన్ పూర్తి చేయబడింది' 
                              : 'AI vision pre-scan completed for optimal pathogen detection'}
                          </p>
                        </div>
                      </div>

                      {/* Lighting and Clarity Status Badges (Farmer Friendly) */}
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 shadow-xs">
                          ☀️ {language === 'te' ? qualityReport.lightingLabelTelugu : qualityReport.lightingLabel}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 shadow-xs">
                          🔍 {language === 'te' ? qualityReport.clarityLabelTelugu : qualityReport.clarityLabel}
                        </span>
                      </div>
                    </div>

                    {/* Detected Issues & Actionable Advice */}
                    {qualityReport.issues.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {qualityReport.issues.map((issue, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/10 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{language === 'te' ? issue.titleTelugu : issue.title}</span>
                              </span>
                              {issue.canAutoFix && (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                                  {language === 'te' ? 'ఆటోమేటిక్ సరిచేయగలదు' : 'Auto-Fix Available'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              {language === 'te' ? issue.descriptionTelugu : issue.description}
                            </p>
                            <p className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              <span>💡 {language === 'te' ? 'రైతు సలహా: ' : 'Tip: '}</span>
                              <span>{language === 'te' ? issue.tipTelugu : issue.tip}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 pt-1 font-medium">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>
                          {language === 'te' 
                            ? 'వెలుతురు మరియు ఆకు వివరాలు స్పష్టంగా ఉన్నాయి. AI విశ్లేషణను వెంటనే ప్రారంభించవచ్చు.' 
                            : 'Optimal daylight illumination and sharp foliage focus. Ready for high-confidence AI diagnosis.'}
                        </span>
                      </div>
                    )}

                    {/* "Fix Image" / "Enhance Exposure" Interactive Action */}
                    {qualityReport.canEnhance && !currentImage.isEnhanced && (
                      <div className="pt-2 flex items-center justify-between gap-3 bg-emerald-100/50 dark:bg-emerald-950/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="text-xs">
                          <p className="font-bold text-emerald-900 dark:text-emerald-200">
                            {language === 'te' ? 'ఫోటోను మరింత స్పష్టంగా చేయాలా?' : 'Enhance Image Exposure & Sharpness?'}
                          </p>
                          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                            {language === 'te'
                              ? 'చీకటిగా ఉన్న భాగాలను సరిచేసి ఆకు నరాలను స్పష్టంగా చూపిస్తుంది'
                              : 'Automatically brightens shadows and sharpens leaf veins'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleManualFixImage}
                          disabled={isEnhancing}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                        >
                          <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                          <span>
                            {isEnhancing
                              ? (language === 'te' ? 'సరిచేస్తోంది...' : 'Fixing...')
                              : (language === 'te' ? '✨ ఫోటోను సరిచేయండి' : '✨ Fix Image')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Practical Leaf Scouting Checklist (Requirement #3) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'te' ? 'ఖచ్చితమైన ఫలితాల కోసం చిట్కాలు' : 'Best Diagnostics Practices'}</span>
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{language === 'te' ? 'ఆకుకు దగ్గరగా ఫోటో తీయండి' : 'Close-up to leaf spot'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{language === 'te' ? 'సహజ వెలుతురు ఉండేలా చూడండి' : 'Sufficient daylight / torch'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{language === 'te' ? 'ముందు మరియు వెనుక భాగాలు' : 'Frame front & back sides'}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button: Detect Crop Health */}
                {!result && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleStartDetection}
                      disabled={isAnalyzing}
                      className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-95"
                    >
                      <Search className="w-4 h-4" />
                      <span>
                        {language === 'te' ? '🔍 పంట ఆరోగ్యాన్ని విశ్లేషించండి' : '🔍 Analyze Crop Image'}
                      </span>
                    </button>

                    <button
                      onClick={() => setIsCameraModalOpen(true)}
                      disabled={isAnalyzing}
                      className="py-3 px-4 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'te' ? 'మళ్లీ తీయండి' : 'Retake'}</span>
                    </button>

                    <button
                      onClick={handleReset}
                      disabled={isAnalyzing}
                      className="py-3 px-4 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>{t.cropDoctor.removeImage}</span>
                    </button>
                  </div>
                )}

                {/* Error message with prominent Retry button and clear diagnostics */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{language === 'te' ? 'విశ్లేషణ లోపం / నోటీసు' : 'Analysis Notice'}</span>
                    </div>
                    <p className="leading-relaxed font-medium">{errorMessage}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleStartDetection}
                        disabled={isAnalyzing}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span>{language === 'te' ? '🔄 మళ్లీ విశ్లేషించండి (Retry)' : '🔄 Retry Analysis'}</span>
                      </button>

                      {appMode === 'real_ai' && (
                        <button
                          type="button"
                          onClick={onOpenApiSetup}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
                        >
                          {language === 'te' 
                            ? 'సర్వర్ మరియు AI మోడల్ స్థితిని చూడండి →' 
                            : 'View Server & Gemini Model Status →'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scanning Progress Animation with user-friendly high-demand status */}
            {isAnalyzing && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.cropDoctor.analyzingTitle}</span>
                  </span>
                  <span className="font-mono text-slate-500">
                    Step {analysisStepIndex + 1} of 3
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((analysisStepIndex + 1) / 3) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 animate-pulse text-center font-medium">
                  {t.cropDoctor.analyzingSteps[analysisStepIndex]}
                </p>

                {appMode === 'real_ai' && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                    {language === 'te'
                      ? '⚡ రద్దీ ఉన్నప్పుడు ఆటోమేటిక్ రీట్రై మరియు మోడల్ ఫాల్‌బ్యాక్ యాక్టివ్‌గా ఉన్నాయి'
                      : '⚡ Automatic exponential backoff & multi-model fallback active if Gemini models experience peak load'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Full Professional Results Dashboard */}
          {result && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-9 shadow-xl space-y-8 animate-in fade-in-50 duration-300">
              
              {/* Header Status Bar with Language Quick-Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      {t.results.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      {result.modeUsed === 'real_ai'
                        ? `REAL AI (${(result.modelUsed || 'GEMINI 3.8 FLASH').toUpperCase()})`
                        : 'DEMO AGRONOMIC SPECIMEN'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {resultLanguage === 'te' ? result.cropNameTelugu : result.cropName}
                  </h3>

                  {result.scientificName && (
                    <p className="text-xs text-slate-500 italic">
                      Taxonomy: {result.scientificName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Result language switch */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                    <button
                      onClick={() => setResultLanguage('en')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        resultLanguage === 'en'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setResultLanguage('te')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        resultLanguage === 'te'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      తెలుగు
                    </button>
                  </div>

                  {/* Health status badge */}
                  <div>
                    {result.healthStatus === 'healthy' ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 font-bold text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{resultLanguage === 'te' ? result.healthStatusTextTelugu : result.healthStatusText}</span>
                      </div>
                    ) : result.healthStatus === 'warning' ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 font-bold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>{resultLanguage === 'te' ? result.healthStatusTextTelugu : result.healthStatusText}</span>
                      </div>
                    ) : result.healthStatus === 'uncertain' ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm">
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                        <span>{resultLanguage === 'te' ? 'అనిశ్చిత పరిస్థితి' : 'Uncertain / Non-plant Subject'}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200 font-bold text-xs sm:text-sm">
                        <AlertOctagon className="w-4 h-4 text-red-600" />
                        <span>{resultLanguage === 'te' ? result.healthStatusTextTelugu : result.healthStatusText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {resultLanguage === 'te' ? 'నిర్ధారించిన సమస్య / తెగులు' : 'Identified Condition'}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                    {resultLanguage === 'te' ? result.diseaseOrSymptomTelugu : result.diseaseOrSymptom}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.results.confidence}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {result.confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${result.confidenceScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Visual pattern match probability
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t.results.riskLevel}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-3 h-3 rounded-full ${
                      result.riskLevel === 'Low' ? 'bg-emerald-500' : result.riskLevel === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {resultLanguage === 'te' ? result.riskLevelTelugu : result.riskLevel}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Categorized Possible Causes Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>
                      {resultLanguage === 'te' ? '🔍 సాధ్యమైన కారణాల వర్గీకరణ' : '🔍 Possible Causes Analysis'}
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-500 italic">
                    {resultLanguage === 'te'
                      ? 'గమనిక: ఇవి సంభావ్య కారణాలు మాత్రమే, ల్యాబ్ ధృవీకరణ కాదు'
                      : 'Note: Categorized possibilities, not confirmed lab diagnoses'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Cause 1: Environmental Stress */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      ☀️ {resultLanguage === 'te' ? 'వాతావరణ ఒత్తిడి' : 'Environmental Stress'}
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {result.causes?.environmental ? (
                        (resultLanguage === 'te' ? result.causes.environmentalTelugu : result.causes.environmental).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500">•</span>
                            <span>{c}</span>
                          </li>
                        ))
                      ) : (
                        <li>Sun scald or high heat fluctuation.</li>
                      )}
                    </ul>
                  </div>

                  {/* Cause 2: Water-Related Issues */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      💧 {resultLanguage === 'te' ? 'నీటి సంబంధిత సమస్యలు' : 'Water-Related Issues'}
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {result.causes?.water ? (
                        (resultLanguage === 'te' ? result.causes.waterTelugu : result.causes.water).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-500">•</span>
                            <span>{c}</span>
                          </li>
                        ))
                      ) : (
                        <li>Intermittent water stress or poor drainage.</li>
                      )}
                    </ul>
                  </div>

                  {/* Cause 3: Nutrient-Related Symptoms */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      🌱 {resultLanguage === 'te' ? 'పోషక లోపాలు' : 'Nutrient Deficiencies'}
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {result.causes?.nutrient ? (
                        (resultLanguage === 'te' ? result.causes.nutrientTelugu : result.causes.nutrient).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500">•</span>
                            <span>{c}</span>
                          </li>
                        ))
                      ) : (
                        <li>Potential zinc or iron chlorosis.</li>
                      )}
                    </ul>
                  </div>

                  {/* Cause 4: Pest or Disease Possibilities */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                      🐛 {resultLanguage === 'te' ? 'తెగుళ్లు లేదా కీటకాలు' : 'Pest / Pathogen Risk'}
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {result.causes?.pestOrDisease ? (
                        (resultLanguage === 'te' ? result.causes.pestOrDiseaseTelugu : result.causes.pestOrDisease).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-red-500">•</span>
                            <span>{c}</span>
                          </li>
                        ))
                      ) : (
                        <li>Fungal foliar spotting or sucking pests.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Visible Symptoms & Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visible Symptoms */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {t.results.cards.symptoms}
                  </h4>
                  <ul className="space-y-2">
                    {(resultLanguage === 'te' ? result.symptomsTelugu : result.symptoms).map((symptom, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Next Steps */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {t.results.cards.nextSteps}
                  </h4>
                  <ul className="space-y-2">
                    {(resultLanguage === 'te' ? result.recommendedNextStepsTelugu : result.recommendedNextSteps).map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Safe Farmer Recommendations Banner */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 sm:p-6 space-y-3">
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {t.results.recommendationsTitle}
                </h4>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  {t.results.recommendationsLead}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(resultLanguage === 'te' ? result.farmerActionItemsTelugu : result.farmerActionItems).map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Analysis Limitations Notice */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">{t.results.limitations}: </strong>
                  <span>{resultLanguage === 'te' ? result.analysisLimitationsTelugu : result.analysisLimitations}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.results.analyzeAnother}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Save to History */}
                  <button
                    onClick={handleSaveReport}
                    disabled={hasSaved}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      hasSaved
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>{hasSaved ? (resultLanguage === 'te' ? 'భద్రపరచబడింది' : 'Saved') : t.results.saveHistory}</span>
                  </button>

                  {/* Share Result */}
                  <button
                    onClick={handleShareResult}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{resultLanguage === 'te' ? 'ఫలితం షేర్ చేయండి' : 'Share Result'}</span>
                  </button>

                  {/* Download Report */}
                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                    title="Download summary report file (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{resultLanguage === 'te' ? 'డౌన్‌లోడ్ రిపోర్ట్' : 'Download Report'}</span>
                  </button>

                  {/* Print Report */}
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.results.printReport}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
