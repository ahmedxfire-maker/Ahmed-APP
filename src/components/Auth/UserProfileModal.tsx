import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  User, 
  X, 
  Phone, 
  Lock, 
  Mail, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhoneNumber(currentUser.phoneNumber || '');
      setEmail(currentUser.email || '');
      setPassword(currentUser.password || '');
      setStatusMessage(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: language === 'ar' ? 'الاسم مطلوب' : 'Name is required' });
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setStatusMessage({ 
        type: 'error', 
        text: language === 'ar' ? 'رقم الهاتف ضروريًا وإلزاميًا (8 أرقام على الأقل)' : 'Phone number is required (min 8 digits)' 
      });
      return;
    }

    if (!password || password.length < 5) {
      setStatusMessage({ 
        type: 'error', 
        text: language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 5 خانات' : 'Password must be at least 5 characters' 
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password: password
      });
      setIsSaving(false);
      setStatusMessage({ 
        type: 'success', 
        text: language === 'ar' ? 'تم تحديث بياناتك الشخصية بنجاح' : 'Profile updated successfully' 
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setIsSaving(false);
      setStatusMessage({ 
        type: 'error', 
        text: language === 'ar' ? 'حدث خطأ أثناء حفظ البيانات' : 'Failed to update profile' 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'الملف الشخصي للمستخدم' : 'User Profile'}
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'ar' ? 'تعديل وتحديث بياناتك الشخصية' : 'Edit personal information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Read-only Job Info Banner */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">{currentUser.jobTitle}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentUser.role === 'super_admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {currentUser.role === 'super_admin' ? 'Super Admin (المدير)' : 'Employee (موظف)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{currentUser.department}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <span>اسم المستخدم: <strong className="font-mono text-slate-700">@{currentUser.username}</strong></span>
            <span className="text-emerald-700 font-semibold">حالة الحساب: فعال</span>
          </div>
        </div>

        {/* Form to edit personal info */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              <span className="text-rose-500 mr-1">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Phone Number - Marked required */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>
                {language === 'ar' ? 'رقم الهاتف (ضروريًا)' : 'Phone Number (Required)'}
                <span className="text-rose-600 mr-1 font-black">*</span>
              </span>
              <span className="text-[10px] text-rose-600 font-bold">إلزامي</span>
            </label>
            <div className="relative">
              <Phone className={`w-4 h-4 text-rose-500 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                dir="ltr"
                className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-rose-300 bg-rose-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              <span className="text-rose-500 mr-1">*</span>
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className={`w-full ${language === 'ar' ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${language === 'ar' ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer`}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
