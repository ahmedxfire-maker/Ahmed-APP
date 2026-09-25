import React, { useState } from 'react';
import { useAuth, defaultSuperAdminPermissions, defaultEmployeePermissions } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  UserPlus, 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Building2, 
  Briefcase, 
  Shield, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Eye, 
  EyeOff, 
  Layers, 
  Database,
  Sliders
} from 'lucide-react';
import { UserRole, AccountStatus, UserPermissions } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createUser } = useAuth();
  const { language } = useLanguage();

  // Basic Data
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<AccountStatus>('active');

  // Job Data
  const [department, setDepartment] = useState('مفتشية الحجر الزراعي - منفذ الإسكندرية');
  const [customDepartment, setCustomDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('مهندس فحص وتتبع ميداني');

  // Role & Permissions
  const [role, setRole] = useState<UserRole>('employee');
  const [permissions, setPermissions] = useState<UserPermissions>(defaultEmployeePermissions);
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Change default permissions when role toggles
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setPermissions(defaultSuperAdminPermissions);
    } else {
      setPermissions(defaultEmployeePermissions);
    }
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleModuleToggle = (module: string) => {
    setPermissions(prev => {
      const exists = prev.allowedModules.includes(module);
      return {
        ...prev,
        allowedModules: exists
          ? prev.allowedModules.filter(m => m !== module)
          : [...prev.allowedModules, module]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate
    if (!name.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المستخدم الكامل' : 'Please enter full name');
      return;
    }
    if (!username.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المستخدم بالإنجليزية' : 'Please enter username');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setErrorMsg(language === 'ar' ? 'رقم الهاتف ضروريًا وإلزاميًا (8 أرقام على الأقل)' : 'Phone number is strictly required (min 8 digits)');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 5) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 5 أحرف أو أرقام' : 'Password must be at least 5 characters');
      return;
    }

    const finalDepartment = department === 'custom' ? customDepartment.trim() : department;
    if (!finalDepartment) {
      setErrorMsg(language === 'ar' ? 'يرجى تحديد الإدارة أو القسم' : 'Please specify department');
      return;
    }
    if (!jobTitle.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال المسمى الوظيفي' : 'Please enter job title');
      return;
    }

    setIsSubmitting(true);
    const res = await createUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      status,
      role,
      department: finalDepartment,
      jobTitle: jobTitle.trim(),
      permissions,
      notes: notes.trim()
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || (language === 'ar' ? 'تعذر إنشاء المستخدم' : 'Failed to create user'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {language === 'ar' ? 'إنشاء مستخدم جديد في المنظومة' : 'Create New System User'}
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'ar' 
                  ? 'نموذج تسجيل بيانات المستخدم، الوظيفة، وتحديد الصلاحيات الممنوحة من قبل المدير' 
                  : 'Register user credentials, job details, and configure role-based permissions'}
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

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: البيانات الأساسية */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'ar' ? 'البيانات الأساسية للمستخدم' : 'Basic User Data'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <User className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: م. أحمد محمد إبراهيم' : 'e.g. Eng. Ahmed Ibrahim'}
                    className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition`}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'اسم المستخدم (Username)' : 'Username'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '_'))}
                  placeholder="e.g. ahmed_ibrahim"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmed@moa.gov.eg"
                    dir="ltr"
                    className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition`}
                  />
                </div>
              </div>

              {/* Phone Number - Marked as Required */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    {language === 'ar' ? 'رقم الهاتف (ضروريًا)' : 'Phone Number (Required)'}
                    <span className="text-rose-600 mr-1 font-black">*</span>
                  </span>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                    {language === 'ar' ? 'إلزامي للاتصال والطوارئ' : 'Strictly Required'}
                  </span>
                </label>
                <div className="relative">
                  <Phone className={`w-4 h-4 text-rose-500 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01012345678"
                    dir="ltr"
                    className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-rose-300 bg-rose-50/30 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition font-mono`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full ${language === 'ar' ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono`}
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

              {/* Account Status: Active / Inactive */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{language === 'ar' ? 'فعال (نشط)' : 'Active'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('inactive')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'inactive'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{language === 'ar' ? 'غير فعال (معطل)' : 'Inactive'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: بيانات الوظيفة */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'ar' ? 'بيانات الوظيفة' : 'Job Information'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الإدارة / القسم' : 'Department / Division'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <Building2 className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition`}
                  >
                    <option value="الإدارة المركزية للحجر الزراعي">الإدارة المركزية للحجر الزراعي</option>
                    <option value="مفتشية الحجر الزراعي - منفذ الإسكندرية">مفتشية الحجر الزراعي - منفذ الإسكندرية</option>
                    <option value="مفتشية الحجر الزراعي - ميناء دمياط">مفتشية الحجر الزراعي - ميناء دمياط</option>
                    <option value="مفتشية الحجر الزراعي - مطار القاهرة الدولي">مفتشية الحجر الزراعي - مطار القاهرة الدولي</option>
                    <option value="إدارة الرصد والإنذار المبكر للآفات">إدارة الرصد والإنذار المبكر للآفات</option>
                    <option value="مشروع حصر ومكافحة العفن البني في البطاطس">مشروع حصر ومكافحة العفن البني في البطاطس</option>
                    <option value="معهد بحوث وقاية النبات - الدقي">معهد بحوث وقاية النبات - الدقي</option>
                    <option value="معمل بحوث أمراض النبات - الجيزة">معمل بحوث أمراض النبات - الجيزة</option>
                    <option value="مديرية الزراعة - البحيرة">مديرية الزراعة - البحيرة</option>
                    <option value="مديرية الزراعة - الوادي الجديد">مديرية الزراعة - الوادي الجديد</option>
                    <option value="custom">إدارة أخرى (كتابة يدوية)...</option>
                  </select>
                </div>
                {department === 'custom' && (
                  <input
                    type="text"
                    required
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب اسم الإدارة أو القسم...' : 'Type department name...'}
                    className="w-full mt-2 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                )}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                  <span className="text-rose-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <Briefcase className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: مهندس فحص وتتبع ميداني' : 'e.g. Field Inspection Engineer'}
                    className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: الصلاحيات وتحديد نوع المستخدم */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {language === 'ar' ? 'تحديد الصلاحيات ونوع الدور' : 'Permissions & Role Selection'}
                </h4>
              </div>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                {language === 'ar' ? 'تُحدد من خلال المستخدم المدير' : 'Configured by Super Admin'}
              </span>
            </div>

            {/* Role Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Super Admin Card */}
              <div
                onClick={() => handleRoleChange('super_admin')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  role === 'super_admin'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Super Admin (المستخدم المدير)
                    </span>
                  </div>
                  {role === 'super_admin' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'كل الصلاحيات: المستخدمون، الأدوار، الصلاحيات، المحتوى، التقارير، الإعدادات، سجل العمليات، والتحكم بلوحة الإدارة.'
                    : 'All administrative privileges: users, roles, permissions, database control, official reports and audit logs.'}
                </p>
              </div>

              {/* Employee Card */}
              <div
                onClick={() => handleRoleChange('employee')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  role === 'employee'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Employee / User (الموظف / المستخدم)
                    </span>
                  </div>
                  {role === 'employee' && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'إنشاء بلاغ، متابعة ما أدخله فقط، تعديل بياناته. لا يحذف، لا يدخل لوحة الإدارة، لا يستخرج بيانات ولا يرى التقارير.'
                    : 'Create inspection reports, follow own records, edit profile. Restricted from deletion, exports, and admin dashboard.'}
                </p>
              </div>
            </div>

            {/* Granular Permissions Checklist (Allowed for customization) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  {language === 'ar' ? 'صلاحيات الإجراءات والبيانات الممنوحة:' : 'Action & Data Permissions Checklist:'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {language === 'ar' ? 'يمكن تعديلها أو إعطاء صلاحيات إضافية' : 'Customizable by Super Admin'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* canCreateReports */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canCreateReports}
                    onChange={() => handlePermissionToggle('canCreateReports')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">إنشاء بلاغ وإضافة طلبات</span>
                </label>

                {/* canViewOwnDataOnly */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canViewOwnDataOnly}
                    onChange={() => handlePermissionToggle('canViewOwnDataOnly')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">متابعة البيانات التي أدخلها فقط</span>
                </label>

                {/* canEditProfile */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canEditProfile}
                    onChange={() => handlePermissionToggle('canEditProfile')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">تعديل بياناته الشخصية</span>
                </label>

                {/* canDeleteData */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canDeleteData}
                    onChange={() => handlePermissionToggle('canDeleteData')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`font-semibold ${!permissions.canDeleteData ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    حذف بيانات من الموقع (غير مسموح للموظف افتراضياً)
                  </span>
                </label>

                {/* canAccessAdmin */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canAccessAdmin}
                    onChange={() => handlePermissionToggle('canAccessAdmin')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`font-semibold ${!permissions.canAccessAdmin ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    الوصول للوحة الإدارة (للمدير فقط)
                  </span>
                </label>

                {/* canViewReports */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canViewReports}
                    onChange={() => handlePermissionToggle('canViewReports')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`font-semibold ${!permissions.canViewReports ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    الإطلاع على التقارير الرسمية وحفظها
                  </span>
                </label>

                {/* canExportData */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={permissions.canExportData}
                    onChange={() => handlePermissionToggle('canExportData')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`font-semibold ${!permissions.canExportData ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    استخراج البيانات وتصدير CSV / PDF
                  </span>
                </label>
              </div>

              {/* Allowed Modules in Database */}
              <div className="pt-2 border-t border-slate-200/80">
                <span className="block text-[11px] font-bold text-slate-700 mb-2">
                  {language === 'ar' 
                    ? 'أقسام قاعدة البيانات المسموح له برؤيتها وتصفحها:' 
                    : 'Allowed Database Modules to Browse:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'dashboard', label: 'لوحة المؤشرات والخريطة' },
                    { id: 'reports', label: 'بلاغات الإصابة والرصد' },
                    { id: 'pests', label: 'سجل الآفات الحجرية' },
                    { id: 'control', label: 'تدابير المكافحة والمبيدات' },
                    { id: 'monthly', label: 'الإحصائيات الشهرية' },
                    { id: 'locations', label: 'المواقع والمناطق الجغرافية' }
                  ].map(mod => {
                    const isAllowed = permissions.allowedModules.includes(mod.id);
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => handleModuleToggle(mod.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          isAllowed
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        {mod.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'ar' ? 'جارٍ الإنشاء...' : 'Creating...') : (language === 'ar' ? 'حفظ وإنشاء المستخدم' : 'Save & Create User')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
