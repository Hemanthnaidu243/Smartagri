import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  FlipHorizontal, 
  AlertCircle, 
  Flashlight, 
  FlashlightOff,
  Sun,
  Layers,
  ZoomIn,
  Eye,
  Sparkles
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, filename: string, sizeFormatted: string) => void;
  language: Language;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  language,
}) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlobSize, setCapturedBlobSize] = useState<string>('0 MB');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // Torch/flashlight state
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  
  // Active guidance tab (leaf front vs leaf back)
  const [leafSideTarget, setLeafSideTarget] = useState<'front' | 'back'>('front');

  // Stop camera tracks cleanly
  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          if (track.kind === 'video') {
            (track as any).applyConstraints?.({ advanced: [{ torch: false }] }).catch(() => {});
          }
        } catch {}
        track.stop();
      });
      streamRef.current = null;
    }
    setIsTorchOn(false);
  };

  // Start video stream
  const startCamera = async (mode: 'user' | 'environment') => {
    stopTracks();
    setError(null);
    setIsInitializing(true);
    setIsTorchSupported(false);
    setIsTorchOn(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        language === 'te'
          ? 'మీ బ్రౌజర్‌లో లైవ్ కెమెరా యాక్సెస్ అందుబాటులో లేదు. దయచేసి ఫైల్ అప్‌లోడ్ ఆప్షన్ ఉపయోగించండి.'
          : 'Live camera capture is not supported in this browser. Please use the file upload option.'
      );
      setIsInitializing(false);
      return;
    }

    try {
      // Check for available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode === 'environment' ? { ideal: 'environment' } : 'user',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if torch/flashlight is hardware-supported on this track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (capabilities && capabilities.torch) {
          setIsTorchSupported(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsInitializing(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          language === 'te'
            ? 'కెమెరా అనుమతి నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో కెమెరా అనుమతించండి లేదా ఫోటో అప్‌లోడ్ చేయండి.'
            : 'Camera permission was denied. Please allow camera access in browser permissions or use file upload.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(
          language === 'te'
            ? 'ఏ కెమెరా పరికరం కనుగొనబడలేదు. దయచేసి వెబ్‌క్యామ్ కనెక్ట్ అయిందో లేదో చూడండి.'
            : 'No camera hardware found on this device. Please connect a webcam or upload a saved photo.'
        );
      } else {
        // Fallback retry without facingMode constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setError(null);
        } catch (fallbackErr: any) {
          setError(
            language === 'te'
              ? 'కెమెరా ప్రారంభించడంలో విఫలమైంది: ' + (fallbackErr.message || 'Error')
              : 'Could not initialize camera stream: ' + (fallbackErr.message || 'Error')
          );
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      startCamera(facingMode);
    } else {
      stopTracks();
    }
    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode]);

  // Flip camera toggle
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Toggle Hardware Torch / Flashlight if supported
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const nextState = !isTorchOn;
      await (videoTrack as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Could not toggle camera torch:', e);
      setIsTorchOn(false);
    }
  };

  // Capture frame from video
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    setCapturedPreview(dataUrl);

    // Approximate size calculation
    const head = 'data:image/jpeg;base64,';
    const sizeInBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
    const sizeFormatted = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    setCapturedBlobSize(sizeFormatted);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
  };

  // Confirm photo
  const handleConfirmPhoto = () => {
    if (!capturedPreview) return;

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/[T.]/g, '_')
      .slice(0, 15);
    const filename = `crop_leaf_${leafSideTarget}_${timestamp}.jpg`;

    onCapture(capturedPreview, filename, capturedBlobSize);
    stopTracks();
    onClose();
  };

  const handleModalClose = () => {
    stopTracks();
    setCapturedPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>{language === 'te' ? 'రైతు లైవ్ కెమెరా' : 'Smart Field Camera'}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  {language === 'te' ? 'ఆటో గైడెన్స్' : 'Guided Capture'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {language === 'te'
                  ? 'మంచి వెలుతురులో ఆకును దగ్గరగా ఉంచి ముందు, వెనుక భాగాలను తీయండి'
                  : 'Capture clear close-ups of both front & back sides of the infected leaf'}
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Flashlight / Torch Toggle */}
            {isTorchSupported && !capturedPreview && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  isTorchOn 
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isTorchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight for dark leaves'}
              >
                {isTorchOn ? <FlashlightOff className="w-4 h-4" /> : <Flashlight className="w-4 h-4 text-amber-400" />}
                <span className="hidden md:inline">{isTorchOn ? 'Torch On' : 'Torch'}</span>
              </button>
            )}

            {/* Flip Camera */}
            {hasMultipleCameras && !capturedPreview && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                title="Switch Camera (Back / Front)"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="hidden md:inline">
                  {facingMode === 'environment' ? 'Rear' : 'Front'}
                </span>
              </button>
            )}

            <button
              onClick={handleModalClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[440px]">
          
          {/* Error Banner */}
          {error && (
            <div className="max-w-md p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30"
              >
                {language === 'te' ? 'మళ్లీ ప్రయత్నించండి' : 'Retry Camera Access'}
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isInitializing && !error && (
            <div className="text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                {language === 'te' ? 'లైవ్ కెమెరా ప్రారంభమవుతోంది...' : 'Initializing high-resolution camera feed...'}
              </p>
            </div>
          )}

          {/* Live Video Stream */}
          {!capturedPreview && (
            <div className={`relative w-full h-full flex items-center justify-center ${error || isInitializing ? 'hidden' : 'block'}`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain max-h-[68vh]"
              />

              {/* Composition Guidelines & Leaf Reticle */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 sm:p-6">
                
                {/* Top Quick Tip Pill */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <div className="text-[11px] font-semibold text-emerald-300 bg-slate-950/85 px-3 py-1.5 rounded-full border border-emerald-500/50 shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {language === 'te' 
                        ? 'ఆకు మచ్చకు దగ్గరగా (10-15 సెం.మీ) కెమెరాను ఉంచండి' 
                        : 'Move 10-15 cm close to affected leaf spot'}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-300 bg-slate-950/85 px-3 py-1.5 rounded-full border border-amber-500/40 backdrop-blur-sm">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {language === 'te' 
                        ? 'చీకటిగా ఉంటే ఫ్లాష్‌లైట్ లేదా సూర్యకాంతి వాడండి' 
                        : 'Use natural daylight or torch if shadowed'}
                    </span>
                  </div>
                </div>

                {/* Center Targeting Reticle */}
                <div className="w-full max-w-xs sm:max-w-sm border-2 border-dashed border-emerald-400/70 rounded-3xl aspect-[4/3] relative flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                  {/* Target Crosshairs */}
                  <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 absolute top-3 left-3 rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 absolute top-3 right-3 rounded-tr-lg" />
                  <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 absolute bottom-3 left-3 rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 absolute bottom-3 right-3 rounded-br-lg" />

                  <div className="text-center p-3">
                    <span className="text-[11px] font-bold text-white bg-emerald-600/80 px-2.5 py-1 rounded-full shadow-sm">
                      {leafSideTarget === 'front' 
                        ? (language === 'te' ? 'ఆకు పైభాగం' : 'Leaf Front Surface')
                        : (language === 'te' ? 'ఆకు వెనుకభాగం (పురుగులు/తెగులు కోసం)' : 'Leaf Underside')}
                    </span>
                  </div>
                </div>

                {/* Bottom Leaf Side Selector Guide */}
                <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setLeafSideTarget('front')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      leafSideTarget === 'front'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? '1. ఆకు ముందు భాగం' : '1. Front Side'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeafSideTarget('back')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      leafSideTarget === 'back'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? '2. ఆకు వెనుక భాగం' : '2. Back Side (Underside)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Captured Frame Preview */}
          {capturedPreview && (
            <div className="relative w-full h-full flex items-center justify-center p-3">
              <img
                src={capturedPreview}
                alt="Captured Leaf Preview"
                className="w-full h-full object-contain max-h-[68vh] rounded-xl border border-slate-800"
              />
              <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                <Check className="w-4 h-4" />
                <span>
                  {language === 'te' ? 'ఫోటో సిద్ధంగా ఉంది' : 'Leaf Captured'} ({capturedBlobSize})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {language === 'te' 
                ? 'AI విశ్లేషణ కోసం అధిక నాణ్యత గల చిత్రం అవసరం' 
                : 'High-clarity sample required for accurate AI diagnosis'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
            </button>

            {!capturedPreview ? (
              <button
                type="button"
                onClick={handleCaptureFrame}
                disabled={isInitializing || Boolean(error)}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'te' ? 'స్పష్టమైన ఫోటో తీయండి' : 'Capture Photo'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'మళ్లీ తీయండి' : 'Retake'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'te' ? 'ఈ ఫోటోను పరిశీలించండి' : 'Proceed With Photo'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
