import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  UserCheck, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppUser, UserRole, AccountStatus } from '../../types';
import { EditUserModal } from './EditUserModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateUser: () => void;
  onGoToAdminTab?: () => void;
}

export const UsersManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenCreateUser,
  onGoToAdminTab
}) => {
  const { users, currentUser, isSuperAdmin, deleteUser, toggleUserStatus, switchUserDemo } = useAuth();
  const { language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  
  // State for user editing
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State to reveal passwords for specific user rows
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Filter users based on search and selected filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber.includes(searchTerm) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;
  const superAdminCount = users.filter(u => u.role === 'super_admin').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;

  const togglePasswordVisibility = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (user: AppUser) => {
    if (user.id === currentUser?.id) {
      alert(language === 'ar' ? 'لا يمكن حذف الحساب الخاص بك وأنت مسجل الدخول به.' : 'You cannot delete your own account while logged in.');
      return;
    }

    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من رغبتك في حذف المستخدم "${user.name}" (@${user.username}) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`
      : `Are you sure you want to permanently delete user "${user.name}" (@${user.username})? This action cannot be undone.`;

    if (window.confirm(confirmMsg)) {
      await deleteUser(user.id);
    }
  };

  const handleToggleStatus = async (user: AppUser) => {
    if (user.id === currentUser?.id) {
      alert(language === 'ar' ? 'لا يمكنك تعطيل حسابك الحالي المسجل به الدخول.' : 'You cannot deactivate your own current account.');
      return;
    }
    await toggleUserStatus(user.id);
  };

  const handleSwitchAccount = (user: AppUser) => {
    const confirmMsg = language === 'ar'
      ? `هل تريد تسجيل الدخول بحساب "${user.name}" (@${user.username}) لتجربة صلاحياته والواجهة الخاصة به؟`
      : `Switch to user "${user.name}" to test their permissions?`;

    if (window.confirm(confirmMsg)) {
      switchUserDemo(user.username);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
        <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl my-4 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shadow-inner">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {language === 'ar' ? 'استعراض وإدارة كافة المستخدمين' : 'All Users & Permissions Management'}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      {language === 'ar' ? 'خاص بالمدير فقط' : 'Admin Only'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {language === 'ar' 
                      ? 'عرض بيانات المستخدمين، تغيير أسماء المستخدمين، كلمات المرور، الصلاحيات، وحالات الحساب' 
                      : 'Review user profiles, edit usernames, reset passwords, adjust permissions, and manage account statuses'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={onOpenCreateUser}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}</span>
                </button>

                {onGoToAdminTab && (
                  <button
                    onClick={onGoToAdminTab}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition border border-white/10 cursor-pointer"
                    title={language === 'ar' ? 'فتح لوحة الإدارة الموسعة' : 'Open Full Admin Dashboard'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'لوحة الإدارة' : 'Admin Tab'}</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title={language === 'ar' ? 'إغلاق' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-slate-300">{language === 'ar' ? 'إجمالي المستخدمين:' : 'Total Users:'}</span>
                <span className="font-bold text-white text-sm font-mono">{totalUsers}</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-emerald-300">{language === 'ar' ? 'حسابات فعالة:' : 'Active:'}</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">{activeCount}</span>
              </div>
              <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-rose-300">{language === 'ar' ? 'غير فعالة:' : 'Inactive:'}</span>
                <span className="font-bold text-rose-400 text-sm font-mono">{inactiveCount}</span>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-400/20 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-emerald-200">{language === 'ar' ? 'مدير (Super Admin):' : 'Super Admins:'}</span>
                <span className="font-bold text-emerald-300 text-sm font-mono">{superAdminCount}</span>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-2.5 flex items-center justify-between col-span-2 sm:col-span-1">
                <span className="text-blue-300">{language === 'ar' ? 'موظفين (Employee):' : 'Employees:'}</span>
                <span className="font-bold text-blue-400 text-sm font-mono">{employeeCount}</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Strip */}
          <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className={`w-4 h-4 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم، اسم المستخدم، الهاتف، الوظيفة...' : 'Search by name, username, phone, title...'}
                className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">{language === 'ar' ? 'الدور:' : 'Role:'}</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">{language === 'ar' ? 'كافة الأدوار' : 'All Roles'}</option>
                  <option value="super_admin">{language === 'ar' ? 'Super Admin (المدير)' : 'Super Admin'}</option>
                  <option value="employee">{language === 'ar' ? 'Employee (موظف)' : 'Employee'}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
                  <option value="active">{language === 'ar' ? 'فعال (نشط)' : 'Active'}</option>
                  <option value="inactive">{language === 'ar' ? 'غير فعال (معطل)' : 'Inactive'}</option>
                </select>
              </div>

              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          {/* User List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {language === 'ar' ? 'لا يوجد مستخدمين مطابقين للبحث' : 'No users match your criteria'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {language === 'ar' 
                    ? 'جرب تعديل كلمات البحث أو تصفية الحالات والأدوار لتصفح جميع المستخدمين المسجلين' 
                    : 'Try modifying your search or filters to see all registered accounts'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const isPasswordRevealed = !!revealedPasswords[user.id];

                  return (
                    <div
                      key={user.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-xs hover:shadow-md ${
                        isSelf 
                          ? 'border-emerald-300 ring-1 ring-emerald-500/20 bg-emerald-50/10' 
                          : user.status === 'inactive' 
                            ? 'border-slate-200 bg-slate-50/40 opacity-80' 
                            : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Column 1: User Identity & Roles */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${
                            user.role === 'super_admin'
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-emerald-600/20'
                              : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white'
                          }`}>
                            {user.name.slice(0, 2)}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                                {user.name}
                              </h3>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {language === 'ar' ? 'حسابك الحالي' : 'Your Account'}
                                </span>
                              )}
                              {user.role === 'super_admin' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                  <span>Super Admin (المدير)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                  <UserCheck className="w-3 h-3 text-blue-700" />
                                  <span>Employee (موظف)</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="font-mono text-emerald-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]" dir="ltr">
                                @{user.username}
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                ID: {user.id}
                              </span>
                              {user.createdAt && (
                                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{user.createdAt.slice(0, 10)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Status & Quick Password Inspector */}
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {/* Active / Inactive Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                              user.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={language === 'ar' ? 'انقر لتبديل حالة تفعيل الحساب' : 'Click to toggle active status'}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                            <span>{user.status === 'active' ? (language === 'ar' ? 'فعال (نشط)' : 'Active') : (language === 'ar' ? 'غير فعال (معطل)' : 'Inactive')}</span>
                          </button>

                          {/* Password Box */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'كلمة المرور:' : 'Password:'}</span>
                            <span className="font-mono text-slate-800 font-bold px-1" dir="ltr">
                              {isPasswordRevealed ? user.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title={isPasswordRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            >
                              {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          </div>
                        </div>

                        {/* Column 3: Action Buttons */}
                        <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                          {/* Edit User Button */}
                          <button
                            onClick={() => handleEdit(user)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            title={language === 'ar' ? 'تعديل اسم المستخدم، كلمة المرور، والصلاحيات' : 'Edit Username, Password & Permissions'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تعديل البيانات والصلاحيات' : 'Edit User'}</span>
                          </button>

                          {/* Switch User (Test Login) */}
                          <button
                            onClick={() => handleSwitchAccount(user)}
                            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition cursor-pointer"
                            title={language === 'ar' ? 'تسجيل الدخول بهذا الحساب وتجربة صلاحياته' : 'Switch & test as this user'}
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isSelf}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                            title={isSelf ? (language === 'ar' ? 'لا يمكن حذف حسابك الحالي' : 'Cannot delete self') : (language === 'ar' ? 'حذف المستخدم' : 'Delete user')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Detailed Data Row: Contact, Dept, Permissions */}
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                        {/* Contact Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono text-slate-800 font-semibold" dir="ltr">
                            <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{user.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-slate-500 text-[11px]" dir="ltr">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>

                        {/* Department & Job */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{user.jobTitle}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{user.department}</span>
                          </div>
                        </div>

                        {/* Granted Permissions Summary */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 block mb-1">
                            {language === 'ar' ? 'الصلاحيات المعتمدة:' : 'Active Permissions:'}
                          </span>
                          {user.role === 'super_admin' ? (
                            <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {language === 'ar' ? 'صلاحيات إدارية كاملة وغير مقيدة' : 'Full Administrator Privileges'}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {user.permissions?.canCreateReports && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                                  إنشاء بلاغات
                                </span>
                              )}
                              {user.permissions?.canCreatePests && (
                                <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-medium">
                                  إضافة آفات
                                </span>
                              )}
                              {user.permissions?.canExportData && (
                                <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded font-medium">
                                  تصدير بيانات
                                </span>
                              )}
                              {user.permissions?.canViewReports && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                  عرض التقارير
                                </span>
                              )}
                              {user.permissions?.canViewOwnDataOnly && (
                                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                                  سجلاته فقط
                                </span>
                              )}
                              {user.permissions?.canDeleteData && (
                                <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-medium">
                                  حذف بيانات
                                </span>
                              )}
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                {user.permissions?.allowedModules?.length || 0} أقسام
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ar' 
                  ? 'يتم تطبيق أي تعديلات في بيانات وصلاحيات المستخدمين فوراً ومزامنتها على السحابة (Firestore)' 
                  : 'All user updates and permissions are persisted immediately to cloud Firestore'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          userToEdit={editingUser}
        />
      )}
    </>
  );
};
