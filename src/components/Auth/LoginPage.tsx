import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Wheat, 
  AlertCircle, 
  KeyRound,
  Building2,
  Globe,
  X
} from 'lucide-react';

interface Props {
  onSuccessRedirect?: () => void;
  onCancel?: () => void;
  isStandalone?: boolean;
}

export const LoginPage: React.FC<Props> = ({ onSuccessRedirect, onCancel, isStandalone = false }) => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter your username');
      return;
    }

    if (!password) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = login(username, password);
      setIsSubmitting(false);
      if (result.success) {
        if (onSuccessRedirect) {
          onSuccessRedirect();
        }
      } else {
        setErrorMessage(result.error || (language === 'ar' ? 'تعذر تسجيل الدخول' : 'Login failed'));
      }
    }, 250);
  };

  return (
    <div className={`${isStandalone ? 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950' : 'min-h-[75vh]'} flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden`}>
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Standalone Header Bar */}
      {isStandalone && (
        <div className="w-full max-w-xl flex items-center justify-between mb-6 px-2 text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span 
              id="login-top-system-title"
              className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide"
            >
              {language === 'ar' ? 'المنظومة الوطنية لرصد وتتبع الآفات على المحاصيل الزراعية' : 'National System for Pest Surveillance & Tracking on Agricultural Crops'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition cursor-pointer text-xs font-semibold"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      )}

      {/* Top Modal Close Button (if modal mode) */}
      {!isStandalone && onCancel && (
        <div className="w-full max-w-xl flex justify-end mb-3 z-20">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer text-xs font-semibold shadow-xs"
            title={language === 'ar' ? 'إغلاق نافذة تسجيل الدخول' : 'Close Login Modal'}
          >
            <X className="w-4 h-4" />
            <span>{language === 'ar' ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>
      )}

      {/* الشعار في أعلى صفحة تسجيل الدخول بالوسط بمقاس 120 * 120 بيكسل مع خلفية شفافة */}
      <div className="flex flex-col items-center justify-center mb-5 text-center z-10 w-full animate-in fade-in slide-in-from-top-4 duration-300">
        <div
          id="login-page-ministry-logo-container"
          className="flex items-center justify-center relative transition-transform duration-300 hover:scale-105"
          style={{ width: '120px', height: '120px' }}
        >
          <img
            id="login-page-ministry-logo"
            src="/ministry-logo-120.png"
            alt={language === 'ar' ? 'شعار وزارة الزراعة واستصلاح الأراضي - جمهورية مصر العربية' : 'Ministry of Agriculture and Land Reclamation Emblem'}
            width={120}
            height={120}
            className="w-[120px] h-[120px] object-contain drop-shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-black/30 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Governmental Brand Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-7 relative overflow-hidden border-b border-emerald-500/20">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/40 shrink-0">
              <Wheat className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                {language === 'ar' ? 'جمهورية مصر العربية — وزارة الزراعة' : 'Arab Republic of Egypt — Ministry of Agriculture'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {language === 'ar' ? 'تسجيل الدخول للمنظومة' : 'Portal Official Sign In'}
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md">
            {language === 'ar'
              ? 'المنظومة الوطنية لرصد وتتبع الآفات على المحاصيل الزراعية، وحصر بؤر الإصابة وتطبيق تدابير المكافحة المعتمدة.'
              : 'National System for Pest Surveillance & Tracking on Agricultural Crops and outbreak containment.'}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-300/90 font-medium">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span id="login-admin-agency-label" className="font-semibold tracking-wide">
              {language === 'ar' ? 'الإدارة المركزية للمكافحة (EQAPS)' : 'Central Administration for Pest Control (EQAPS)'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'ar' ? 'اسم المستخدم (Username)' : 'Username'}
                <span className="text-rose-500 mr-1">*</span>
              </label>
              <div className="relative">
                <User className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسم المستخدم المصرح به' : 'Enter registered username'}
                  className={`w-full ${language === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono`}
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'ar' ? 'كلمة المرور (Password)' : 'Password'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${language === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer`}
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? (language === 'ar' ? 'جارٍ التحقق من بيانات الدخول...' : 'Authenticating...') 
                  : (language === 'ar' ? 'دخول إلى المنظومة' : 'Sign In')}
              </span>
            </button>
          </form>

          {/* Optional Cancel Button if modal */}
          {!isStandalone && onCancel && (
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء وإغلاق النافذة' : 'Cancel and Close'}
              </button>
            </div>
          )}

          {/* Secure System Notice */}
          <div className="pt-2 text-center text-[11px] text-slate-400">
            <p>
              {language === 'ar' 
                ? 'بوابة رقمية رسمية مشفرة ومخصصة للمصرح لهم فقط' 
                : 'Official encrypted portal restricted to authorized personnel'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      {isStandalone && (
        <div className="mt-8 text-center text-slate-400 text-xs space-y-1">
          <p>© {new Date().getFullYear()} وزارة الزراعة واستصلاح الأراضي — جمهورية مصر العربية</p>
          <p className="text-[11px] text-slate-500">
            {language === 'ar' 
              ? 'الإدارة المركزية للمكافحة (EQAPS) • نظام الإنذار المبكر والرصد الميداني'
              : 'Central Administration for Pest Control (EQAPS) • Early Warning & Field Surveillance'}
          </p>
        </div>
      )}
    </div>
  );
};
