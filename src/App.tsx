import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PortalHome } from './components/Portal/PortalHome';
import { AboutProject } from './components/Portal/AboutProject';
import { PortalFooter } from './components/Portal/PortalFooter';
import { OverviewKPIs } from './components/Dashboard/OverviewKPIs';
import { EgyptQuarantineMap } from './components/Map/EgyptQuarantineMap';
import { DashboardCharts } from './components/Dashboard/DashboardCharts';
import { MonthlyStatsTable } from './components/Dashboard/MonthlyStatsTable';
import { PestsTable } from './components/Tables/PestsTable';
import { ReportsTable } from './components/Tables/ReportsTable';
import { ControlMeasuresTable } from './components/Tables/ControlMeasuresTable';
import { LocationsTable } from './components/Tables/LocationsTable';
import { OfficialPrintReport, ReportPrintMode } from './components/Reports/OfficialPrintReport';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { LoginPage } from './components/Auth/LoginPage';
import { CreateUserModal } from './components/Admin/CreateUserModal';
import { UsersManagementModal } from './components/Admin/UsersManagementModal';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { BackupModal } from './components/Modals/BackupModal';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

function AppContent() {
  const { t, language } = useLanguage();
  const { currentUser, isSuperAdmin, hasPermission } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<ReportPrintMode>('general');
  
  // Auth & Admin Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<boolean>(false);
  const [isUsersManagementModalOpen, setIsUsersManagementModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'import'>('export');

  const handleOpenBackup = (tab: 'export' | 'import' = 'export') => {
    setBackupModalTab(tab);
    setIsBackupModalOpen(true);
  };

  const handleOpenPrintReport = (mode: ReportPrintMode = 'general') => {
    // If user is employee without report viewing permission, block opening
    if (currentUser && !hasPermission('canViewReports')) {
      alert(language === 'ar' ? 'عفواً، حسابك لا يملك صلاحية استعراض أو طباعة التقارير الرسمية وفقاً لسياسة الإدارة.' : 'Permission denied for viewing or printing reports.');
      return;
    }
    setPrintMode(mode);
    setIsPrintModalOpen(true);
  };

  // If user is not authenticated, display standalone login page at start of program
  if (!currentUser) {
    return (
      <LoginPage 
        isStandalone={true}
        onSuccessRedirect={() => {
          setActiveTab('home');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-100/70 text-slate-900 flex flex-col ${language === 'ar' ? "font-['Cairo',sans-serif]" : 'font-sans'}`}>
      {/* Top Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenPrintReport={handleOpenPrintReport}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCreateUser={() => setIsCreateUserModalOpen(true)}
        onOpenUsersManagement={() => setIsUsersManagementModalOpen(true)}
        onOpenBackup={handleOpenBackup}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'home' && (
          <PortalHome 
            setActiveTab={setActiveTab} 
            onOpenPrintReport={handleOpenPrintReport}
            onOpenNewReportModal={() => setActiveTab('reports')}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Overview KPI Cards */}
            <OverviewKPIs onNavigateTab={(tab) => setActiveTab(tab)} />

            {/* Geographic Distribution Map (The core requirement) */}
            <EgyptQuarantineMap
              onSelectPest={() => setActiveTab('pests')}
              onSelectLocation={() => setActiveTab('reports')}
            />

            {/* Monthly Stats & Biological Charts */}
            <DashboardCharts onOpenPrintReport={handleOpenPrintReport} />
          </div>
        )}

        {activeTab === 'pests' && (
          <PestsTable onOpenPrintReport={handleOpenPrintReport} />
        )}

        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <MonthlyStatsTable onOpenPrintReport={handleOpenPrintReport} />
          </div>
        )}

        {activeTab === 'reports' && (
          <ReportsTable />
        )}

        {activeTab === 'control' && (
          <ControlMeasuresTable />
        )}

        {activeTab === 'locations' && (
          <LocationsTable />
        )}

        {activeTab === 'about' && (
          <AboutProject />
        )}

        {/* Dedicated Admin & User Management Panel */}
        {activeTab === 'admin' && (
          <>
            {isSuperAdmin || hasPermission('canAccessAdmin') ? (
              <AdminDashboard onOpenBackup={handleOpenBackup} />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {language === 'ar' ? 'منطقة محظورة - مقتصرة على مدير النظام (Super Admin)' : 'Restricted Area - Super Admin Only'}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {language === 'ar' 
                    ? 'هذه الشاشة مخصصة لإدارة حسابات الموظفين وتعيين الصلاحيات وسجلات العمليات. يرجى تسجيل الدخول بحساب المدير للمتابعة.'
                    : 'This screen is restricted to system administrators for managing accounts and permissions. Please log in with an administrator account.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تسجيل الدخول كمدير' : 'Login as Admin'}</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Official Government Website Portal Footer */}
      <PortalFooter 
        setActiveTab={setActiveTab} 
        onOpenPrintReport={handleOpenPrintReport} 
      />

      {/* Official Printable Ministerial Report Modal */}
      <OfficialPrintReport
        isOpen={isPrintModalOpen}
        initialMode={printMode}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Login Modal / Page */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl my-6 flex flex-col items-center">
            <LoginPage 
              onSuccessRedirect={() => {
                setIsLoginModalOpen(false);
              }}
              onCancel={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
      />

      {/* Admin View All Users & Manage Credentials / Permissions Modal */}
      {isSuperAdmin && (
        <UsersManagementModal
          isOpen={isUsersManagementModalOpen}
          onClose={() => setIsUsersManagementModalOpen(false)}
          onOpenCreateUser={() => {
            setIsUsersManagementModalOpen(false);
            setIsCreateUserModalOpen(true);
          }}
          onGoToAdminTab={() => {
            setIsUsersManagementModalOpen(false);
            setActiveTab('admin');
          }}
        />
      )}

      {/* User Profile Self-Service Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        initialTab={backupModalTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DatabaseProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </DatabaseProvider>
    </LanguageProvider>
  );
}

