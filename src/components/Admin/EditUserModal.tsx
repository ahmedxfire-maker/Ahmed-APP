import React, { useState, useEffect } from 'react';
import { useAuth, defaultSuperAdminPermissions, defaultEmployeePermissions } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Eye, 
  EyeOff, 
  Sliders, 
  Save
} from 'lucide-react';
import { AppUser, UserRole, AccountStatus, UserPermissions } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: AppUser | null;
}

export const EditUserModal: React.FC<Props> = ({ isOpen, onClose, userToEdit }) => {
  const { updateUser, users } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<AccountStatus>('active');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [permissions, setPermissions] = useState<UserPermissions>(defaultEmployeePermissions);
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setUsername(userToEdit.username);
      setEmail(userToEdit.email);
      setPhoneNumber(userToEdit.phoneNumber || '');
      setPassword(userToEdit.password);
      setStatus(userToEdit.status);
      setDepartment(userToEdit.department);
      setJobTitle(userToEdit.jobTitle);
      setRole(userToEdit.role);
      setPermissions(userToEdit.permissions || (userToEdit.role === 'super_admin' ? defaultSuperAdminPermissions : defaultEmployeePermissions));
      setNotes(userToEdit.notes || '');
      setErrorMsg(null);
    }
  }, [userToEdit]);

  if (!isOpen || !userToEdit) return null;

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

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المستخدم الكامل' : 'Please enter full name');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg(language === 'ar' ? 'اسم المستخدم يجب ألا يقل عن 3 أحرف' : 'Username must be at least 3 characters');
      return;
    }

    const isDuplicate = users.some(
      u => u.id !== userToEdit.id && u.username.toLowerCase() === cleanUsername
    );
    if (isDuplicate) {
      setErrorMsg(
        language === 'ar' 
          ? 'اسم المستخدم هذا مستخدم بالفعل من قبل حساب آخر، يرجى اختيار اسم مستخدم آخر' 
          : 'This username is already taken by another account'
      );
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setErrorMsg(language === 'ar' ? 'رقم الهاتف ضروريًا وإلزاميًا (8 أرقام على الأقل)' : 'Phone number is required (min 8 digits)');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 4 أحرف أو أرقام' : 'Password must be at least 4 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser(userToEdit.id, {
        name: trimmedName,
        username: cleanUsername,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        status,
        role,
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        permissions,
        notes: notes.trim()
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      console.error('Error updating user:', err);
      setIsSubmitting(false);
      setErrorMsg(language === 'ar' ? 'حدث خطأ أثناء حفظ التعديلات' : 'Failed to update user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {language === 'ar' ? `تعديل بيانات المستخدم: ${userToEdit.name}` : `Edit User: ${userToEdit.name}`}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                @{userToEdit.username} • {userToEdit.id}
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
                {language === 'ar' ? 'البيانات الأساسية والدخول' : 'Basic & Login Data'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  <span className="text-emerald-600 mr-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'اسم المستخدم (لتسجيل الدخول)' : 'Username (Login)'}
                  <span className="text-emerald-600 mr-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-emerald-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-slate-900 font-semibold"
                  dir="ltr"
                  placeholder="username"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {language === 'ar' ? 'اسم مستخدم فريد للدخول بدون مسافات' : 'Unique username without spaces'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'رقم الهاتف (ضروريًا)' : 'Phone Number (Required)'}
                  <span className="text-rose-600 mr-1">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 bg-rose-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'كلمة المرور الجديدة / الحالية' : 'Password (Change / Keep)'}
                  <span className="text-emerald-600 mr-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-emerald-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 text-slate-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {language === 'ar' ? 'يمكن للمدير تعيين كلمة مرور جديدة للمستخدم' : 'Admin can set a new password'}
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
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
                        : 'bg-slate-50 border-slate-200 text-slate-500'
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الإدارة / القسم' : 'Department / Division'}
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 3: الدور والصلاحيات */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {language === 'ar' ? 'تعديل الصلاحيات والدور' : 'Role & Permissions'}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleRoleChange('super_admin')}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  role === 'super_admin'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Super Admin (المستخدم المدير)</span>
                </div>
              </div>

              <div
                onClick={() => handleRoleChange('employee')}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  role === 'employee'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Employee / User (الموظف)</span>
                </div>
              </div>
            </div>

            {/* Granular Toggles */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                {language === 'ar' ? 'تعديل الصلاحيات الممنوحة من المدير:' : 'Modify Granted Permissions:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Reports & Data Entry */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canCreateReports}
                    onChange={() => handlePermissionToggle('canCreateReports')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">إنشاء بلاغ رصد وإضافة طلبات</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canCreatePests}
                    onChange={() => handlePermissionToggle('canCreatePests')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>إضافة وتعديل بيانات الآفات</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canCreateLocations}
                    onChange={() => handlePermissionToggle('canCreateLocations')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>إضافة وتعديل المواقع والمراكز</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canCreateControl}
                    onChange={() => handlePermissionToggle('canCreateControl')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>إضافة تدابير وتوصيات المكافحة</span>
                </label>

                {/* View & Privacy */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canViewOwnDataOnly}
                    onChange={() => handlePermissionToggle('canViewOwnDataOnly')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>متابعة البيانات التي أدخلها فقط</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canEditProfile}
                    onChange={() => handlePermissionToggle('canEditProfile')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>تعديل بياناته الشخصية</span>
                </label>

                {/* Reports & Export */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canViewReports}
                    onChange={() => handlePermissionToggle('canViewReports')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>الإطلاع على التقارير وحفظها وطباعتها</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canExportData}
                    onChange={() => handlePermissionToggle('canExportData')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>استخراج وتصدير البيانات والنسخ الاحتياطية</span>
                </label>

                {/* High Privilege / Admin */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canDeleteData}
                    onChange={() => handlePermissionToggle('canDeleteData')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={!permissions.canDeleteData ? 'text-slate-400' : 'text-rose-700 font-semibold'}>
                    حذف بيانات من المنظومة
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canAccessAdmin}
                    onChange={() => handlePermissionToggle('canAccessAdmin')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={!permissions.canAccessAdmin ? 'text-slate-400' : 'text-emerald-700 font-semibold'}>
                    الوصول للوحة الإدارة
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canManageUsers}
                    onChange={() => handlePermissionToggle('canManageUsers')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={!permissions.canManageUsers ? 'text-slate-400' : 'text-emerald-700 font-semibold'}>
                    إدارة وتعديل المستخدمين
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={permissions.canManageRoles}
                    onChange={() => handlePermissionToggle('canManageRoles')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={!permissions.canManageRoles ? 'text-slate-400' : 'text-emerald-700 font-semibold'}>
                    إدارة الأدوار والصلاحيات
                  </span>
                </label>
              </div>

              {/* Modules */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  الأقسام المسموح برؤيتها في قاعدة البيانات:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'dashboard', label: 'المؤشرات والخريطة' },
                    { id: 'reports', label: 'بلاغات الإصابة' },
                    { id: 'pests', label: 'الآفات الحجرية' },
                    { id: 'control', label: 'تدابير المكافحة' },
                    { id: 'monthly', label: 'الإحصائيات الشهرية' },
                    { id: 'locations', label: 'المواقع والمناطق' }
                  ].map(mod => {
                    const isAllowed = permissions.allowedModules.includes(mod.id);
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => handleModuleToggle(mod.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
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

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'تحديث بيانات المستخدم' : 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
