import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Map, 
  Bug, 
  FileText, 
  ShieldAlert, 
  MapPin, 
  Printer, 
  Cloud,
  Sparkles, 
  Wheat, 
  Calendar,
  Languages,
  Globe,
  Building2,
  PhoneCall,
  Home,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Sliders,
  UserCheck,
  Download,
  Upload,
  Users
} from 'lucide-react';
import { ReportPrintMode } from './Reports/OfficialPrintReport';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPrintReport: (mode?: ReportPrintMode) => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenCreateUser: () => void;
  onOpenUsersManagement?: () => void;
  onOpenBackup?: (tab?: 'export' | 'import') => void;
}

export const Navbar: React.FC<Props> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenPrintReport,
  onOpenLogin,
  onOpenProfile,
  onOpenCreateUser,
  onOpenUsersManagement,
  onOpenBackup
}) => {
  const { locationZoneStatuses, isCloudConnected } = useDatabase();
  const { t, language, toggleLanguage } = useLanguage();
  const { currentUser, users, logout, isSuperAdmin, hasPermission } = useAuth();

  const highRiskCount = locationZoneStatuses.filter(
    s => s.classification === 'منطقة عالية الإصابة (بؤرة حجرية)'
  ).length;

  // Check which modules the user can browse
  const canSeeModule = (moduleId: string) => {
    if (!currentUser) return true;
    if (isSuperAdmin) return true;
    if (moduleId === 'home' || moduleId === 'about') return true;
    return currentUser.permissions?.allowedModules?.includes(moduleId) ?? true;
  };

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'dashboard', label: t.nav.dashboard, icon: Map },
    { id: 'pests', label: t.nav.pests, icon: Bug },
    { id: 'reports', label: t.nav.reports, icon: FileText },
    { id: 'control', label: t.nav.control, icon: ShieldAlert },
    { id: 'monthly', label: t.nav.monthly, icon: Calendar },
    { id: 'locations', label: t.nav.locations, icon: MapPin },
    { id: 'about', label: t.nav.about, icon: Building2 }
  ].filter(item => canSeeModule(item.id));

  // If Super Admin, add dedicated Admin Dashboard tab
  if (isSuperAdmin || hasPermission('canAccessAdmin')) {
    navItems.push({
      id: 'admin',
      label: language === 'ar' ? 'لوحة الإدارة والمستخدمين' : 'Admin & Users',
      icon: ShieldCheck
    });
  }

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Governmental Top Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 text-[11px] text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-200">{t.portal.govHeader}</span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] flex-wrap">
            <a href="tel:19561" className="hover:text-emerald-400 transition flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>{t.portal.hotlineTitle}: <strong className="text-white font-mono tracking-wider">19561</strong></span>
            </a>

            {/* User Auth Bar Indicator */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-r border-slate-700 pr-3 mr-1">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                  title="عرض وتعديل الملف الشخصي"
                >
                  <span className={`w-2 h-2 rounded-full ${currentUser.role === 'super_admin' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                  <span className="text-slate-200 font-semibold">{currentUser.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    currentUser.role === 'super_admin' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' : 'bg-blue-900/80 text-blue-300 border border-blue-500/40'
                  }`}>
                    {currentUser.role === 'super_admin' ? 'Super Admin' : 'Employee'}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 transition p-1 cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition border-r border-slate-700 pr-3 mr-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Portal Brand & Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Logo - Clickable to Home */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
          title={language === 'ar' ? 'الصفحة الرئيسية للبوابة' : 'Portal Home'}
        >
          <div 
            id="navbar-ministry-logo-container"
            className="w-[120px] h-[120px] shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-200"
            style={{ width: '120px', height: '120px' }}
          >
            <img
              id="navbar-ministry-logo"
              src="/ministry-logo-120.png"
              alt={language === 'ar' ? 'شعار وزارة الزراعة واستصلاح الأراضي - جمهورية مصر العربية' : 'Ministry of Agriculture and Land Reclamation Emblem'}
              width={120}
              height={120}
              className="w-[120px] h-[120px] object-contain drop-shadow-md"
              style={{ width: '120px', height: '120px' }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 
                id="main-app-title"
                className="text-lg sm:text-xl font-black text-slate-50 tracking-tight leading-tight group-hover:text-emerald-300 transition"
              >
                {t.brand.title}
              </h1>
              <span 
                id="eqaps-badge"
                className="hidden sm:inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap tracking-wider"
              >
                {t.brand.badge}
              </span>
            </div>
            <p 
              id="main-app-subtitle"
              className="text-xs font-medium text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap"
            >
              <span className="text-emerald-400 font-semibold">{t.brand.subtitleInstitute}</span>
              <span className="text-slate-500">—</span>
              <span>{t.brand.subtitleDesc}</span>
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          {highRiskCount > 0 && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>{t.brand.activeOutbreaksAlert.replace('{count}', String(highRiskCount))}</span>
            </button>
          )}

          {/* Super Admin Quick Create User Action */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5">
              {/* Button specifically for Admin to view and manage all users */}
              <button
                id="navbar-manage-all-users-btn"
                onClick={onOpenUsersManagement}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white border border-emerald-500/40 text-xs font-bold transition shadow-xs cursor-pointer group"
                title={language === 'ar' ? 'استعراض كافة المستخدمين، إظهار بياناتهم وتعديل أسمائهم، كلمات المرور وصلاحياتهم' : 'Review all users, show credentials and adjust permissions'}
              >
                <Users className="w-3.5 h-3.5 text-emerald-300 group-hover:scale-110 transition" />
                <span>{language === 'ar' ? 'استعراض كافة المستخدمين' : 'All Users'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  {users.length}
                </span>
              </button>

              <button
                onClick={onOpenCreateUser}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title={language === 'ar' ? 'إنشاء مستخدم جديد وتحديد صلاحياته' : 'Create new user'}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ar' ? 'إنشاء مستخدم' : 'New User'}</span>
              </button>
            </div>
          )}

          {/* Language Switcher Button */}
          <button
            id="language-switch-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
            title={language === 'ar' ? 'Switch to English interface' : 'التحويل للواجهة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>

          {/* Backup & Restore Buttons */}
          {(!currentUser || isSuperAdmin || hasPermission('canExportData')) && (
            <div className="flex items-center gap-1">
              <button
                id="navbar-export-backup-btn"
                onClick={() => onOpenBackup?.('export')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
                title={language === 'ar' ? 'تصدير نسخة احتياطية من قاعدة البيانات' : 'Export Database Backup'}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">{language === 'ar' ? 'تصدير نسخة' : 'Export Backup'}</span>
              </button>

              {(isSuperAdmin || !currentUser) && (
                <button
                  id="navbar-import-backup-btn"
                  onClick={() => onOpenBackup?.('import')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
                  title={language === 'ar' ? 'استيراد واستعادة نسخة احتياطية' : 'Import Database Backup'}
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden xl:inline">{language === 'ar' ? 'استيراد نسخة' : 'Import Backup'}</span>
                </button>
              )}
            </div>
          )}

          {/* Official Report Print Button - ONLY visible if user has canViewReports permission */}
          {(!currentUser || hasPermission('canViewReports')) && (
            <button
              onClick={() => onOpenPrintReport()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t.brand.officialReportBtn}</span>
              <span className="sm:hidden">{t.brand.reportShortBtn}</span>
            </button>
          )}

          {/* Login or User Profile Avatar Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer text-xs"
              title={language === 'ar' ? 'تعديل البيانات الشخصية' : 'Profile'}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] text-white ${
                currentUser.role === 'super_admin' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}>
                {currentUser.name.slice(0, 1)}
              </div>
              <span className="font-semibold text-slate-200 max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'ar' ? 'دخول' : 'Sign In'}</span>
            </button>
          )}

          {/* Central Cloud Database Sync Status Indicator */}
          <div
            id="cloud-db-status"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold shadow-xs"
            title={language === 'ar' ? 'قاعدة بيانات سحابية موحدة مركزية - البيانات متزامنة ومحفوظة تلقائياً من أي جهاز أو هاتف محمول' : 'Central Cloud Database - Real-time sync across all PCs and smartphones'}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCloudConnected ? 'bg-emerald-400' : 'bg-teal-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isCloudConnected ? 'bg-emerald-500' : 'bg-teal-500'}`}></span>
            </span>
            <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden lg:inline text-[11px] text-slate-300">
              {language === 'ar' ? 'سحابة مركزية' : 'Cloud'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

