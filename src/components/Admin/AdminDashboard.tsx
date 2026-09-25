import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDatabase } from '../../context/DatabaseContext';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { AppUser, UserRole, AccountStatus } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  KeyRound, 
  ShieldAlert, 
  FileText, 
  Clock, 
  Database, 
  Sliders, 
  ArrowRightLeft,
  Building2,
  Phone,
  Mail,
  UserX,
  UserCheck,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Layers,
  Download,
  Upload,
  HardDrive
} from 'lucide-react';
import { BackupModal } from '../Modals/BackupModal';

interface Props {
  onOpenBackup?: (tab?: 'export' | 'import') => void;
}

export const AdminDashboard: React.FC<Props> = ({ onOpenBackup }) => {
  const { 
    currentUser, 
    users, 
    activityLogs, 
    deleteUser, 
    toggleUserStatus, 
    switchUserDemo 
  } = useAuth();
  const { pests, reports, locations, controlMeasures } = useDatabase();
  const { language } = useLanguage();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'roles' | 'database' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AppUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupTab, setBackupTab] = useState<'export' | 'import'>('export');

  const triggerBackup = (tab: 'export' | 'import') => {
    if (onOpenBackup) {
      onOpenBackup(tab);
    } else {
      setBackupTab(tab);
      setIsBackupModalOpen(true);
    }
  };

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber && u.phoneNumber.includes(searchTerm)) ||
        u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || u.department === departmentFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });
  }, [users, searchTerm, roleFilter, statusFilter, departmentFilter]);

  // KPIs
  const totalUsers = users.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const inactiveUsersCount = users.filter(u => u.status === 'inactive').length;
  const superAdminCount = users.filter(u => u.role === 'super_admin').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;

  const handleDelete = async (u: AppUser) => {
    if (u.id === currentUser?.id) {
      alert(language === 'ar' ? 'لا يمكن حذف الحساب الحالي المسجل به!' : 'Cannot delete active session account!');
      return;
    }

    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من رغبتك في حذف المستخدم "${u.name}" (${u.username}) نهائياً؟`
      : `Are you sure you want to permanently delete user "${u.name}" (${u.username})?`;

    if (window.confirm(confirmMsg)) {
      const res = await deleteUser(u.id);
      if (res.success) {
        setActionNotice(language === 'ar' ? `تم حذف المستخدم ${u.name} بنجاح` : `User ${u.name} deleted successfully`);
        setTimeout(() => setActionNotice(null), 3500);
      }
    }
  };

  const handleToggleStatus = async (u: AppUser) => {
    await toggleUserStatus(u.id);
    const newStatusText = u.status === 'active' ? (language === 'ar' ? 'معطل' : 'Inactive') : (language === 'ar' ? 'فعال' : 'Active');
    setActionNotice(language === 'ar' ? `تم تغيير حالة حساب ${u.name} إلى: ${newStatusText}` : `Updated status for ${u.name} to ${newStatusText}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSwitchUser = (u: AppUser) => {
    switchUserDemo(u.username);
    setActionNotice(language === 'ar' ? `تم التبديل الآن والدخول بحساب: ${u.name} (${u.role === 'super_admin' ? 'مدير' : 'موظف'})` : `Switched to user: ${u.name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'لوحة تحكم المستخدم المدير (Super Admin)' : 'Super Admin Management Console'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'ar' ? 'إدارة المستخدمين والأدوار وقاعدة البيانات' : 'Users, Roles & Database Administration'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'التحكم الشامل في حسابات موظفي الحجر الزراعي، تحديد الصلاحيات الدقيقة، الإطلاع على كافة البيانات، وسجل العمليات اللحظي.'
                : 'Comprehensive control over phytosanitary inspector accounts, role assignments, database visibility and audit trails.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
            <button
              id="admin-export-backup-btn"
              onClick={() => triggerBackup('export')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              title={language === 'ar' ? 'تصدير نسخة احتياطية لكافة بيانات المنظومة' : 'Export Database Backup'}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'تصدير نسخة احتياطية' : 'Export Backup'}</span>
            </button>

            <button
              id="admin-import-backup-btn"
              onClick={() => triggerBackup('import')}
              className="px-4 py-2.5 rounded-2xl bg-teal-900/80 hover:bg-teal-800 text-white text-xs font-bold transition border border-teal-600/50 shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              title={language === 'ar' ? 'استيراد واستعادة نسخة احتياطية' : 'Import Database Backup'}
            >
              <Upload className="w-4 h-4 text-teal-300" />
              <span>{language === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup'}</span>
            </button>

            <button
              id="create-new-user-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-700/30 flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إنشاء مستخدم جديد' : 'Create New User'}</span>
            </button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{totalUsers}</div>
          <div className="text-[11px] text-slate-400 mt-1">{language === 'ar' ? 'في المنظومة' : 'In system'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">{language === 'ar' ? 'حسابات فعالة' : 'Active'}</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">{activeUsersCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">{language === 'ar' ? 'متاح لهم الدخول' : 'Authorized to login'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600">{language === 'ar' ? 'حسابات معطلة' : 'Inactive / Suspended'}</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2 font-mono">{inactiveUsersCount}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">{language === 'ar' ? 'تم تعطيلها من المدير' : 'Suspended by admin'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600">{language === 'ar' ? 'المستخدم المدير' : 'Super Admins'}</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 font-mono">{superAdminCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">{language === 'ar' ? 'صلاحيات كاملة' : 'Full access'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">{language === 'ar' ? 'الموظفون' : 'Employees'}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2 font-mono">{employeeCount}</div>
          <div className="text-[11px] text-blue-600/80 mt-1">{language === 'ar' ? 'رصد وبلاغات فقط' : 'Limited inspector scope'}</div>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeAdminTab === 'users' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'roles'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === 'ar' ? 'مصفوفة الأدوار والصلاحيات' : 'Roles & Permissions Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'database'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{language === 'ar' ? 'التحكم في قاعدة البيانات والمحتوى' : 'Database & Content Control'}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل العمليات (Audit Trail)' : 'Activity Logs'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeAdminTab === 'logs' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {activityLogs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Users Management */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-80">
              <Search className={`w-4 h-4 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم، اسم المستخدم، الهاتف، الوظيفة...' : 'Search name, username, phone, title...'}
                className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Role filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'الدور:' : 'Role:'}</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">{language === 'ar' ? 'كافة الأدوار' : 'All Roles'}</option>
                  <option value="super_admin">{language === 'ar' ? 'Super Admin (المدير)' : 'Super Admin'}</option>
                  <option value="employee">{language === 'ar' ? 'Employee (موظف)' : 'Employee'}</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
                  <option value="active">{language === 'ar' ? 'فعال (نشط)' : 'Active'}</option>
                  <option value="inactive">{language === 'ar' ? 'غير فعال (معطل)' : 'Inactive'}</option>
                </select>
              </div>

              {/* Department filter */}
              {departments.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'الإدارة:' : 'Dept:'}</span>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-w-[180px] truncate"
                  >
                    <option value="all">{language === 'ar' ? 'كافة الإدارات' : 'All Depts'}</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'بيانات الاتصال' : 'Contact'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الإدارة والوظيفة' : 'Department & Job Title'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الدور' : 'Role'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'حالة الحساب' : 'Status'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الصلاحيات المحددة' : 'Permissions'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'الإجراءات والتحكم' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      {language === 'ar' ? 'لا يوجد مستخدمين مطابقين لمعايير التصفية والبحث' : 'No users found matching filters'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/70 transition ${isSelf ? 'bg-emerald-50/30' : ''}`}>
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              u.role === 'super_admin' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'bg-slate-800 text-white'
                            }`}>
                              {u.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                    {language === 'ar' ? 'أنت' : 'You'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 dir-ltr block text-left">
                                @{u.username}
                              </span>
                              {/* Password Preview for Admin */}
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5" dir="ltr">
                                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800">
                                  {revealedPasswords[u.id] ? u.password : '••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                  className="text-slate-400 hover:text-emerald-600 p-0.5 cursor-pointer"
                                  title={revealedPasswords[u.id] ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور للمدير'}
                                >
                                  {revealedPasswords[u.id] ? <EyeOff className="w-3 h-3 text-slate-600" /> : <Eye className="w-3 h-3 text-emerald-600" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact info: Phone & Email */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-900 font-mono font-semibold" dir="ltr">
                            <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{u.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono" dir="ltr">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{u.email}</span>
                          </div>
                        </td>

                        {/* Department & Job */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{u.jobTitle}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{u.department}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.role === 'super_admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Super Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                              <span>Employee (موظف)</span>
                            </span>
                          )}
                        </td>

                        {/* Status (Active / Inactive) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={language === 'ar' ? 'انقر لتبديل حالة الحساب' : 'Click to toggle status'}
                          >
                            <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span>{u.status === 'active' ? (language === 'ar' ? 'فعال' : 'Active') : (language === 'ar' ? 'غير فعال' : 'Inactive')}</span>
                          </button>
                        </td>

                        {/* Permissions Summary */}
                        <td className="py-3.5 px-4">
                          {u.role === 'super_admin' ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {language === 'ar' ? 'كافة الصلاحيات' : 'All permissions'}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {u.permissions?.canCreateReports && (
                                <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded border border-blue-100">
                                  إنشاء بلاغات
                                </span>
                              )}
                              {u.permissions?.canViewOwnDataOnly && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                  سجلاته فقط
                                </span>
                              )}
                              {u.permissions?.canEditProfile && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                  تعديل بياناته
                                </span>
                              )}
                              {!u.permissions?.canDeleteData && (
                                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded">
                                  محظور الحذف
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Switch to this user */}
                            <button
                              onClick={() => handleSwitchUser(u)}
                              title={language === 'ar' ? 'تسجيل الدخول بهذا الحساب وتجربة صلاحياته' : 'Switch & test as this user'}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>

                            {/* Edit user */}
                            <button
                              onClick={() => {
                                setUserToEdit(u);
                                setIsEditModalOpen(true);
                              }}
                              title={language === 'ar' ? 'تعديل اسم المستخدم، كلمة المرور، والصلاحيات' : 'Edit username, password & permissions'}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                            </button>

                            {/* Delete user */}
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={isSelf}
                              title={isSelf ? (language === 'ar' ? 'لا يمكن حذف الحساب الحالي' : 'Cannot delete self') : (language === 'ar' ? 'حذف المستخدم' : 'Delete user')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer stats */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              {language === 'ar'
                ? <>عرض <strong>{filteredUsers.length}</strong> مستخدم من أصل <strong>{users.length}</strong></>
                : <>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users</>}
            </div>
            <div className="text-[11px] text-slate-400">
              {language === 'ar' ? 'يتم حفظ كافة الحسابات والتغييرات سحابياً في الوقت الفعلي' : 'Real-time cloud synchronized'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeAdminTab === 'roles' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? 'مصفوفة وتفاصيل صلاحيات المستخدمين' : 'Role-Based Access Control (RBAC) Matrix'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'مقارنة دقيقة بين صلاحيات المستخدم المدير والموظف حسب متطلبات منظومة الحجر الزراعي'
                : 'Detailed comparison between Super Admin and Employee permission tiers'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs border border-slate-200 rounded-2xl overflow-hidden`}>
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="py-3 px-4">{language === 'ar' ? 'الصلاحية / الميزة' : 'Feature / Permission'}</th>
                  <th className="py-3 px-4 bg-emerald-800 text-center">{language === 'ar' ? 'المستخدم المدير (Super Admin)' : 'Super Admin'}</th>
                  <th className="py-3 px-4 bg-slate-800 text-center">{language === 'ar' ? 'الموظف / المستخدم (Employee)' : 'Employee'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'الملاحظات والضوابط' : 'Notes & Safeguards'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold">تسجيل الدخول بالاسم وكلمة المرور</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح (نعم)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح (نعم)</td>
                  <td className="py-3 px-4 text-slate-500">مشروط بكون الحساب في حالة (فعال). إذا كان معطلاً يتم حظر الدخول.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">الوصول والتحكم في لوحة الإدارة</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">كامل الصلاحية</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">محظور تماماً (لا)</td>
                  <td className="py-3 px-4 text-slate-500">لا تظهر الأيقونة ولا يمكن للموظف فتح لوحة التحكم الإدارية.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">إضافة مستخدمين جدد وتعديل بياناتهم</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح بالكامل</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">غير مصرح به</td>
                  <td className="py-3 px-4 text-slate-500">يحدد المدير كلمة المرور، الوظيفة، ورقم الهاتف الضروري لكل حساب.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">تحديد وحجب بيانات قاعدة البيانات</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">تحكم كامل</td>
                  <td className="py-3 px-4 text-center text-slate-600">مشاهدة الخدمات المتاحة له فقط</td>
                  <td className="py-3 px-4 text-slate-500">يحدد المدير الأقسام المسموح للموظف برؤيتها (آفات، بلاغات، مكافحة...).</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">إنشاء بلاغات الرصد وإضافة طلبات</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح (المهام الأساسية)</td>
                  <td className="py-3 px-4 text-slate-500">يتم تسجيل صاحب البلاغ تلقائياً وربطه بحساب المهندس المسجل.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">متابعة البيانات التي أدخلها فقط</td>
                  <td className="py-3 px-4 text-center text-slate-600">يرى كافة بلاغات الجمهورية</td>
                  <td className="py-3 px-4 text-center text-blue-600 font-bold">متابعة ما أدخله فقط</td>
                  <td className="py-3 px-4 text-slate-500">يتم فلترة قائمة البلاغات لتقتصر فقط على البلاغات التي أضافها الموظف نفسه.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">حذف أي بيانات أو بلاغات</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح للمدير</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">لا يمكنه حذف أي بيانات أدخلها</td>
                  <td className="py-3 px-4 text-slate-500">أزرار الحذف محجوبة عن الموظف لحماية سلامة السجلات الرقابية.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">الإطلاع على التقارير الرسمية وحفظها</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح بالكامل</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">لا يمكنه الإطلاع ولا حفظها</td>
                  <td className="py-3 px-4 text-slate-500">التقارير الوزارية المطبوعة مخصصة لمديري الحجر الزراعي فقط.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">استخراج البيانات (تصدير CSV / PDF)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح لكافة الجداول</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">لا يمكنه استخراج البيانات</td>
                  <td className="py-3 px-4 text-slate-500">أزرار التصدير وتوليد الملفات معطلة أو مخفية لحساب الموظف.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">تعديل البيانات الشخصية</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">مسموح (الاسم، الهاتف، كلمة المرور)</td>
                  <td className="py-3 px-4 text-slate-500">يستطيع الموظف تحديث رقم هاتفه وكلمة مروره عبر نافذة الملف الشخصي.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">سجل العمليات (Audit Trail)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">متابعة وفحص لحظي</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-bold">لا يراه</td>
                  <td className="py-3 px-4 text-slate-500">تسجيل آلي لكافة حركات الدخول، الإنشاء، والتعديل مع الطابع الزمني.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Database & Content Control */}
      {activeAdminTab === 'database' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? 'التحكم في قاعدة البيانات والمحتوى' : 'Database & Content Management'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'إحصائيات المجموعات السحابية الحية، إدارة البيانات ومراقبة ما يراه المستخدمون'
                : 'Live Firestore cloud metrics and surveillance records overview'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">سجل الآفات الحجرية</span>
              <div className="text-xl font-black text-slate-900 mt-1">{pests.length} آفة</div>
              <p className="text-[11px] text-slate-400 mt-1">مصنفة حسب الفئات الحجرية (أ1 و أ2 و RNQP)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">بلاغات الرصد والإصابة</span>
              <div className="text-xl font-black text-slate-900 mt-1">{reports.length} بلاغ</div>
              <p className="text-[11px] text-slate-400 mt-1">تتبع ميداني على مستوى المراكز والقرى</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">المواقع والمحطات الجغرافية</span>
              <div className="text-xl font-black text-slate-900 mt-1">{locations.length} موقع</div>
              <p className="text-[11px] text-slate-400 mt-1">موزعة على كافة قطاعات ومحافظات مصر</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">تدابير المكافحة والمبيدات</span>
              <div className="text-xl font-black text-slate-900 mt-1">{controlMeasures.length} توصية</div>
              <p className="text-[11px] text-slate-400 mt-1">معتمدة من لجنة مبيدات الآفات الزراعية</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">حماية البيانات المشتركة:</strong>
              <span>
                كافة البيانات مخزنة في قاعدة بيانات سحابية مركزية (Firestore). بصفتك المستخدم المدير، يمكنك مراقبة كل بلاغ رصد، تعديله، أو حذفه، بينما يقتصر الموظف فقط على متابعة ما قام بإدخاله شخصياً.
              </span>
            </div>
          </div>

          {/* Backup & Disaster Recovery Control Section */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-emerald-50/20 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'النسخ الاحتياطي والاستعادة السحابية (Cloud Backup & Restore)' : 'Database Backup & Disaster Recovery'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' 
                      ? 'تصدير كافة سجلات ومجموعات المنظومة في ملف أرشفة JSON أو استعادتها وتحديثها'
                      : 'Export or restore all system collections into/from standardized JSON backup files'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === 'ar' ? 'آمن ومتوافق مع المعايير الحكومية' : 'Enterprise JSON Ready'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Card 1: Export */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-600" />
                      {language === 'ar' ? 'تصدير نسخة احتياطية كاملة' : 'Export Full Backup'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                      .JSON
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === 'ar'
                      ? 'تنزيل ملف نسخة احتياطية يحوي كافة الآفات، البلاغات الميدانية، المواقع، وتوصيات المبيدات والمستخدمين.'
                      : 'Download a complete snapshot containing all pests, field reports, locations, control protocols and users.'}
                  </p>
                </div>

                <button
                  id="tab-database-export-btn"
                  type="button"
                  onClick={() => triggerBackup('export')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تصدير نسخة احتياطية (Export Backup)' : 'Export Backup (JSON)'}</span>
                </button>
              </div>

              {/* Card 2: Import */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-teal-600" />
                      {language === 'ar' ? 'استيراد واستعادة نسخة احتياطية' : 'Import & Restore Backup'}
                    </span>
                    <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-md border border-teal-200">
                      {language === 'ar' ? 'دمج أو استبدال' : 'Merge / Replace'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === 'ar'
                      ? 'رفع ملف نسخة احتياطية (.json) للدمج والتحديث مع السجلات القائمة أو الاستعادة الكاملة لقاعدة البيانات.'
                      : 'Upload a .json backup file to merge updates or perform a disaster recovery restore to Firestore.'}
                  </p>
                </div>

                <button
                  id="tab-database-import-btn"
                  type="button"
                  onClick={() => triggerBackup('import')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{language === 'ar' ? 'استيراد واستعادة نسخة احتياطية (Import Backup)' : 'Import & Restore Backup'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Activity Logs */}
      {activeAdminTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'سجل العمليات والرقابة (Audit Trail)' : 'System Audit Trail & Activity Logs'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'تسجيل لحظي لكافة الحركات والعمليات المنفذة في المنظومة لضمان الشفافية والمساءلة'
                  : 'Immutable chronological activity logs for compliance and oversight'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              {activityLogs.length} سجل
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {language === 'ar' ? 'لا توجد سجلات عمليات حتى الآن' : 'No activity logs recorded yet'}
              </div>
            ) : (
              activityLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const formattedTime = dateObj.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US');
                const formattedDate = dateObj.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');

                return (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        log.action.includes('login') ? 'bg-emerald-100 text-emerald-800' :
                        log.action.includes('user') ? 'bg-blue-100 text-blue-800' :
                        log.action.includes('delete') ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{log.userName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            log.userRole === 'super_admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.userRole === 'super_admin' ? 'مدير النظام' : 'موظف'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">({log.action})</span>
                        </div>
                        <p className="text-slate-700 mt-1 font-medium">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                      <div>{formattedTime}</div>
                      <div>{formattedDate}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        initialTab={backupTab}
      />
    </div>
  );
};
