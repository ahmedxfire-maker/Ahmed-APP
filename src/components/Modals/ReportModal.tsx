import React, { useState, useEffect, useRef } from 'react';
import { InfestationReport, InfestationSeverity, InfestationSite } from '../../types';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Save, 
  FileText, 
  Camera, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  Eye,
  SwitchCamera,
  Upload,
  Loader2,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InfestationReport, 'id'>) => void;
  reportToEdit?: InfestationReport | null;
}

const SEVERITIES: InfestationSeverity[] = ['خفيفة', 'متوسطة', 'جسيمة'];
const INFESTATION_SITES: InfestationSite[] = ['ساق', 'اوراق', 'جذور', 'تربة', 'ثمار', 'بذور'];

// Helper to compress image into lightweight Base64 JPEG
const compressImage = (file: File | Blob, maxWidth = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

export const ReportModal: React.FC<Props> = ({ isOpen, onClose, onSave, reportToEdit }) => {
  const { locations, pests } = useDatabase();
  const { language, tGovernorate, tPestName, tPestType, tSeverity, tSite } = useLanguage();

  const [locationId, setLocationId] = useState('');
  const [pestId, setPestId] = useState('');
  const [crop, setCrop] = useState('');
  const [detectionDate, setDetectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState<InfestationSeverity>('متوسطة');
  const [affectedAreaFeddans, setAffectedAreaFeddans] = useState<number>(10);
  const [infestationSite, setInfestationSite] = useState<InfestationSite>('اوراق');
  const [infestationRatePercent, setInfestationRatePercent] = useState<number>(5.0);
  const [sampleInspector, setSampleInspector] = useState('م. مفتش حجر زراعي');
  const [containmentStatus, setContainmentStatus] = useState<'قيد المتابعة' | 'تحت المعالجة الكيميائية' | 'تم الاحتواء والحصار' | 'مستقرة'>('قيد المتابعة');
  const [notes, setNotes] = useState('');

  // Field Photo state
  const [fieldPhotoUrl, setFieldPhotoUrl] = useState<string | undefined>(undefined);
  const [fieldPhotoTimestamp, setFieldPhotoTimestamp] = useState<string | undefined>(undefined);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState<boolean>(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);

  // Live Camera state
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // GPS Geolocation state
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [fieldCoordinates, setFieldCoordinates] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    capturedAt?: string;
  } | undefined>(undefined);
  const [isManualGpsInput, setIsManualGpsInput] = useState<boolean>(false);

  // Stop camera tracks helper
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Initialize or reset form values
  useEffect(() => {
    if (reportToEdit) {
      setLocationId(reportToEdit.locationId);
      setPestId(reportToEdit.pestId);
      setCrop(reportToEdit.crop);
      setDetectionDate(reportToEdit.detectionDate);
      setSeverity(reportToEdit.severity);
      setAffectedAreaFeddans(reportToEdit.affectedAreaFeddans);
      setInfestationSite(reportToEdit.infestationSite);
      setInfestationRatePercent(reportToEdit.infestationRatePercent);
      setSampleInspector(reportToEdit.sampleInspector);
      setContainmentStatus(reportToEdit.containmentStatus);
      setNotes(reportToEdit.notes || '');
      setFieldPhotoUrl(reportToEdit.fieldPhotoUrl);
      setFieldPhotoTimestamp(reportToEdit.fieldPhotoTimestamp);
      setFieldCoordinates(reportToEdit.fieldCoordinates);
      setIsLiveCameraActive(false);
      setCameraError(null);
      setGpsError(null);
    } else {
      setLocationId(locations[0]?.id || '');
      setPestId(pests[0]?.id || '');
      setCrop(language === 'ar' ? 'القمح' : 'Wheat');
      setDetectionDate(new Date().toISOString().split('T')[0]);
      setSeverity('متوسطة');
      setAffectedAreaFeddans(15);
      setInfestationSite('اوراق');
      setInfestationRatePercent(6.5);
      setSampleInspector(language === 'ar' ? 'م. مهندس الرصد الميداني' : 'Field Surveillance Officer');
      setContainmentStatus('تحت المعالجة الكيميائية');
      setNotes('');
      setFieldPhotoUrl(undefined);
      setFieldPhotoTimestamp(undefined);
      setFieldCoordinates(undefined);
      setIsLiveCameraActive(false);
      setCameraError(null);
      setGpsError(null);

      // Automatically prompt or attempt geolocation if browser permits
      if (isOpen && 'geolocation' in navigator) {
        handleDetectLocation(true);
      }
    }
  }, [reportToEdit, isOpen, locations, pests, language]);

  // Clean up camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
    }
  }, [isOpen]);

  // Handle GPS location detection
  const handleDetectLocation = (isSilent = false) => {
    if (!('geolocation' in navigator)) {
      if (!isSilent) {
        setGpsError(language === 'ar' ? 'خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.' : 'Geolocation is not supported by your browser.');
      }
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setFieldCoordinates({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          capturedAt: new Date().toISOString()
        });
        setIsDetectingGps(false);
      },
      (error) => {
        setIsDetectingGps(false);
        if (!isSilent) {
          let msg = language === 'ar' ? 'تعذر جلب إحداثيات الموقع عبر GPS.' : 'Unable to retrieve GPS coordinates.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = language === 'ar' 
              ? 'تم رفض إذن الوصول للموقع الجغرافي. يرجى السماح بالوصول من إعدادات المتصفح أو إدخال الإحداثيات يدوياً.' 
              : 'Location permission was denied. Please allow location access or enter coordinates manually.';
          } else if (error.code === error.TIMEOUT) {
            msg = language === 'ar' ? 'انتهت مهلة انتظار إشارة الأقمار الصناعية GPS.' : 'GPS timeout occurred.';
          }
          setGpsError(msg);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Start live camera stream
  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      setIsLiveCameraActive(true);
      setCameraFacingMode(facing);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn('Video play warning:', e));
        }
      }, 100);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setIsLiveCameraActive(false);
      setCameraError(
        language === 'ar'
          ? 'تعذر تشغيل الكاميرا المباشرة. يرجى التأكد من منح الإذن للمتصفح، أو استخدام زر رفع صورة من المعرض/الكاميرا.'
          : 'Could not access device camera. Please grant camera permission or use the file upload option.'
      );
    }
  };

  // Capture snapshot from live camera stream
  const captureLiveSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    setFieldPhotoUrl(dataUrl);
    setFieldPhotoTimestamp(new Date().toISOString());
    stopCameraStream();
  };

  // Toggle front/back camera
  const toggleCameraFacing = () => {
    const newFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(newFacing);
  };

  // Handle image file selection (from phone camera or gallery)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsCompressingPhoto(true);

    try {
      const compressedDataUrl = await compressImage(file, 1200, 0.8);
      setFieldPhotoUrl(compressedDataUrl);
      setFieldPhotoTimestamp(new Date().toISOString());
    } catch (error) {
      console.error('Error compressing uploaded field photo:', error);
      alert(language === 'ar' ? 'تعذر معالجة الصورة المرفقة' : 'Could not process attached image');
    } finally {
      setIsCompressingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !pestId || !crop.trim()) return;

    onSave({
      locationId,
      pestId,
      crop: crop.trim(),
      detectionDate,
      severity,
      affectedAreaFeddans: Number(affectedAreaFeddans) || 1,
      infestationSite,
      infestationRatePercent: Number(infestationRatePercent) || 0,
      sampleInspector: sampleInspector.trim(),
      containmentStatus,
      notes: notes.trim(),
      fieldPhotoUrl,
      fieldPhotoTimestamp,
      fieldCoordinates
    });
    stopCameraStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl my-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 shadow-2xs">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {reportToEdit 
                  ? (language === 'ar' ? 'تعديل تقرير إصابة زراعية وتوثيق جغرافي' : 'Edit Infestation Surveillance Report') 
                  : (language === 'ar' ? 'تسجيل تقرير رصد جديد (مع صور ميدانية وGPS)' : 'Log New Surveillance Report (Photos & GPS)')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ar' ? 'التوثيق الميداني المعتمد لبؤر الآفات الحجرية والزراعية' : 'Certified field surveillance documentation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Location & Pest Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الموقع الجغرافي (المحافظة / المركز) *' : 'Location (Governorate / District) *'}
              </label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {language === 'ar' ? loc.governorate : tGovernorate(loc.governorate)} — {loc.markaz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الآفة المرصودة *' : 'Detected Pest *'}
              </label>
              <select
                required
                value={pestId}
                onChange={(e) => setPestId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
              >
                {pests.map(p => (
                  <option key={p.id} value={p.id}>
                    {language === 'ar' ? p.commonName : tPestName(p.commonName)} ({language === 'ar' ? p.type : tPestType(p.type)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Crop & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المحصول المصاب *' : 'Affected Host Crop *'}
              </label>
              <input
                type="text"
                required
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: القمح، الموالح، البطاطس' : 'e.g. Wheat, Citrus, Potatoes'}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'تاريخ رصد الإصابة *' : 'Detection Date *'}
              </label>
              <input
                type="date"
                required
                value={detectionDate}
                onChange={(e) => setDetectionDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
          </div>

          {/* Section 3: Severity, Acreage, Site */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'شدة الإصابة *' : 'Infestation Severity *'}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as InfestationSeverity)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
              >
                {SEVERITIES.map(s => (
                  <option key={s} value={s}>{language === 'ar' ? s : tSeverity(s)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المساحة المتضررة (فدان) *' : 'Affected Acreage (Feddans) *'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={affectedAreaFeddans}
                onChange={(e) => setAffectedAreaFeddans(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'مكان الإصابة بالنبات *' : 'Infestation Site *'}
              </label>
              <select
                value={infestationSite}
                onChange={(e) => setInfestationSite(e.target.value as InfestationSite)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
              >
                {INFESTATION_SITES.map(site => (
                  <option key={site} value={site}>{language === 'ar' ? site : tSite(site)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: FIELD PHOTO ATTACHMENT FROM CAMERA */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    {language === 'ar' ? 'التوثيق بالصور الميدانية (من الكاميرا)' : 'Field Photographic Documentation (Camera)'}
                  </h4>
                  <p className="text-[10px] text-emerald-700">
                    {language === 'ar' ? 'التقاط صورة فورية للإصابة الحقلية لتوثيق نوع الآفة وأعراض الإصابة' : 'Take field photo of the infestation to verify symptoms'}
                  </p>
                </div>
              </div>

              {/* Action buttons to trigger camera or file */}
              <div className="flex items-center gap-2">
                {!isLiveCameraActive && (
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'فتح الكاميرا والتقاط' : 'Open Camera'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'ar' ? 'اختيار / رفع صورة' : 'Upload Image'}</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Live Camera Viewfinder Screen */}
            {isLiveCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner mt-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 sm:h-72 object-cover"
                />

                {/* Viewfinder crosshairs and target guides */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-emerald-400/60 rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] text-emerald-300 font-mono bg-black/40 px-2 py-0.5 rounded">
                      {language === 'ar' ? 'وجّه العدسة نحو بؤرة الإصابة' : 'Focus on Infestation'}
                    </span>
                  </div>
                </div>

                {/* Camera Top Bar */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    {language === 'ar' ? 'بث مباشر من الكاميرا' : 'Live Camera'}
                  </span>

                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer"
                    title={language === 'ar' ? 'تبديل الكاميرا (أمامية / خلفية)' : 'Switch Camera'}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>

                {/* Camera Bottom Shutter Bar */}
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 z-10">
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold backdrop-blur-xs transition cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={captureLiveSnapshot}
                    className="w-14 h-14 rounded-full bg-white hover:bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xl border-4 border-emerald-500 active:scale-95 transition cursor-pointer"
                    title={language === 'ar' ? 'التقاط الصورة الآن' : 'Take snapshot'}
                  >
                    <Camera className="w-6 h-6 text-emerald-700" />
                  </button>
                </div>
              </div>
            )}

            {/* Error Message for Camera */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Loading Indicator when compressing */}
            {isCompressingPhoto && (
              <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                <span>{language === 'ar' ? 'جارٍ معالجة وضغط الصورة الحقلية...' : 'Optimizing and compressing field photo...'}</span>
              </div>
            )}

            {/* Attached Photo Preview */}
            {fieldPhotoUrl && !isLiveCameraActive && (
              <div className="p-3 bg-white rounded-2xl border border-emerald-300/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    onClick={() => setIsPhotoPreviewOpen(true)}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group"
                    title={language === 'ar' ? 'اضغط لمعاينة الصورة بالحجم الكامل' : 'Click to preview full image'}
                  >
                    <img 
                      src={fieldPhotoUrl} 
                      alt="Field photo" 
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="min-w-0 text-xs">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === 'ar' ? 'تم إرفاق صورة الرصد الميداني' : 'Field Photo Attached'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'ar' ? 'توقيت الالتقاط: ' : 'Captured: '}
                      <span className="font-mono" dir="ltr">
                        {fieldPhotoTimestamp ? new Date(fieldPhotoTimestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : detectionDate}
                      </span>
                    </p>
                    <span className="inline-block text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1">
                      {language === 'ar' ? 'صورة معتمدة ومضغوطة للتوثيق' : 'Certified Compressed Asset'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPhotoPreviewOpen(true)}
                    className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title={language === 'ar' ? 'تكبير ومعاينة الصورة' : 'Preview full photo'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFieldPhotoUrl(undefined);
                      setFieldPhotoTimestamp(undefined);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title={language === 'ar' ? 'حذف الصورة' : 'Remove photo'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: AUTOMATIC GPS GEOLOCATION COORDINATES */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">
                    {language === 'ar' ? 'الإحداثيات الجغرافية لبؤرة الإصابة (GPS)' : 'Geographic GPS Coordinates'}
                  </h4>
                  <p className="text-[10px] text-blue-700">
                    {language === 'ar' ? 'تحديد إحداثيات خط الطول والعرض تلقائياً عبر الأقمار الصناعية' : 'Auto-detect coordinates via GPS satellite positioning'}
                  </p>
                </div>
              </div>

              {/* 1-Click Detect GPS Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDetectLocation(false)}
                  disabled={isDetectingGps}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {isDetectingGps ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isDetectingGps 
                      ? (language === 'ar' ? 'جارٍ الرصد عبر GPS...' : 'Detecting GPS...') 
                      : (language === 'ar' ? 'تحديد الإحداثيات تلقائياً' : 'Auto-Detect GPS')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsManualGpsInput(!isManualGpsInput)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs font-medium transition cursor-pointer"
                  title={language === 'ar' ? 'تعديل أو إدخال يدوي' : 'Manual entry'}
                >
                  {isManualGpsInput ? (language === 'ar' ? 'إخفاء اليدوي' : 'Hide manual') : (language === 'ar' ? 'تعديل يدوي' : 'Manual')}
                </button>
              </div>
            </div>

            {/* Error Message for GPS */}
            {gpsError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Coordinates Result Card */}
            {fieldCoordinates ? (
              <div className="p-3 bg-white rounded-2xl border border-blue-300/80 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ar' ? 'تم قفل الإحداثيات الجغرافية بنجاح' : 'GPS Coordinates Locked'}</span>
                    {fieldCoordinates.accuracy && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {language === 'ar' ? `دقة الجهاز: ± ${fieldCoordinates.accuracy} م` : `Accuracy: ±${fieldCoordinates.accuracy}m`}
                      </span>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${fieldCoordinates.latitude},${fieldCoordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                  >
                    <span>{language === 'ar' ? 'عرض على خرائط Google' : 'View on Google Maps'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      {language === 'ar' ? 'خط العرض (Latitude):' : 'Latitude:'}
                    </span>
                    <strong className="text-slate-900 font-bold" dir="ltr">
                      {fieldCoordinates.latitude}° N
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      {language === 'ar' ? 'خط الطول (Longitude):' : 'Longitude:'}
                    </span>
                    <strong className="text-slate-900 font-bold" dir="ltr">
                      {fieldCoordinates.longitude}° E
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/70 rounded-xl border border-dashed border-blue-200 text-center text-xs text-slate-500">
                {language === 'ar'
                  ? 'اضغط زر "تحديد الإحداثيات تلقائياً" لالتقاط موقع البؤرة الحقلية فوراً عبر مستشعر الـ GPS.'
                  : 'Click "Auto-Detect GPS" to capture the current infestation field coordinates via GPS sensor.'}
              </div>
            )}

            {/* Manual Lat/Lng refinement inputs */}
            {isManualGpsInput && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'خط العرض (Latitude)' : 'Latitude'}
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={fieldCoordinates?.latitude || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFieldCoordinates(prev => ({
                        latitude: val,
                        longitude: prev?.longitude || 31.0,
                        accuracy: prev?.accuracy || 10,
                        capturedAt: new Date().toISOString()
                      }));
                    }}
                    placeholder="30.044421"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'خط الطول (Longitude)' : 'Longitude'}
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={fieldCoordinates?.longitude || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFieldCoordinates(prev => ({
                        latitude: prev?.latitude || 30.0,
                        longitude: val,
                        accuracy: prev?.accuracy || 10,
                        capturedAt: new Date().toISOString()
                      }));
                    }}
                    placeholder="31.235712"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    dir="ltr"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Additional info & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'نسبة الإصابة التقديرية (%)' : 'Estimated Infestation Rate (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={infestationRatePercent}
                onChange={(e) => setInfestationRatePercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'مهندس الرصد / مفتش الحجر الزراعي' : 'Surveillance Officer / Inspector'}
              </label>
              <input
                type="text"
                value={sampleInspector}
                onChange={(e) => setSampleInspector(e.target.value)}
                placeholder={language === 'ar' ? 'اسم المهندس أو الفرقة الحقلية' : 'Inspector name or field unit'}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'ملاحظات حقلية وإجراءات الحصار' : 'Field Observations & Containment Actions'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ar' ? 'وصف الأعراض الظاهرية، العزل، والمكافحة الفورية...' : 'Description of symptoms, isolation, and immediate measures...'}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ تقرير الإصابة والتوثيق' : 'Save Report'}</span>
            </button>
          </div>
        </form>

        {/* High-Resolution Photo Lightbox Preview Modal */}
        {isPhotoPreviewOpen && fieldPhotoUrl && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <div className="p-4 flex items-center justify-between border-b border-slate-800 text-white">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">
                    {language === 'ar' ? 'معاينة صورة الرصد الميداني' : 'Field Photo Preview'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-2 max-h-[70vh] flex items-center justify-center bg-black/60">
                <img
                  src={fieldPhotoUrl}
                  alt="Full size field photo"
                  className="max-h-[65vh] w-auto object-contain rounded-lg"
                />
              </div>

              {fieldCoordinates && (
                <div className="p-3 bg-slate-950 text-slate-300 text-xs flex items-center justify-between border-t border-slate-800">
                  <span className="font-mono" dir="ltr">
                    GPS: {fieldCoordinates.latitude}° N, {fieldCoordinates.longitude}° E
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${fieldCoordinates.latitude},${fieldCoordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{language === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
