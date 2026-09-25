import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  HardDrive, 
  Calendar, 
  User, 
  ArrowRight,
  FileCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateBackupFile, ValidationResult } from '../../utils/backupUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'export' | 'import';
}

export const BackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTab = 'export'
}) => {
  const { 
    pests, 
    locations, 
    reports, 
    controlMeasures, 
    monthlyStats, 
    exportBackup, 
    importBackup 
  } = useDatabase();
  const { currentUser, users, importUsersBatch, logActivity, hasPermission } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);

  // Export State
  const [includeUsersInExport, setIncludeUsersInExport] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Import State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [includeUsersInImport, setIncludeUsersInImport] = useState<boolean>(true);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<{
    message: string;
    counts: {
      pests: number;
      locations: number;
      reports: number;
      controlMeasures: number;
      monthlyStats: number;
      users: number;
    };
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setExportSuccess(false);
      setImportSuccess(null);
      setImportError(null);
      setSelectedFile(null);
      setValidationResult(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Total current live records count
  const currentTotalRecords = pests.length + locations.length + reports.length + controlMeasures.length + monthlyStats.length + (includeUsersInExport ? users.length : 0);

  // Handle Export
  const handleExport = () => {
    setIsExporting(true);
    try {
      const authorName = currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'مدير النظام الفائق';
      exportBackup(authorName, includeUsersInExport ? users : []);
      setExportSuccess(true);
      
      logActivity(
        'export_data',
        `تم استخراج وتصدير نسخة احتياطية كاملة للنظام تضم (${currentTotalRecords}) سجلاً`
      );

      setTimeout(() => {
        setExportSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Process selected file
  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportError(isRtl ? 'يرجى اختيار ملف بامتداد JSON صالح (.json)' : 'Please choose a valid .json file');
      setSelectedFile(null);
      setValidationResult(null);
      return;
    }

    setImportError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const validation = validateBackupFile(content);
      setValidationResult(validation);
      if (!validation.isValid) {
        setImportError(validation.error || (isRtl ? 'ملف غير صالح' : 'Invalid file format'));
      }
    };
    reader.onerror = () => {
      setImportError(isRtl ? 'حدث خطأ أثناء قراءة الملف من جهازك' : 'Error reading file from disk');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Import Execution
  const handleExecuteImport = async () => {
    if (!validationResult || !validationResult.payload) {
      setImportError(isRtl ? 'لا يوجد ملف تم فحصه بنجاح للاستيراد' : 'No valid file to import');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importBackup(
        validationResult.payload,
        importMode,
        includeUsersInImport ? importUsersBatch : undefined
      );

      setImportSuccess(result);

      logActivity(
        'update_report',
        `تم استيراد نسخة احتياطية بنمط (${importMode === 'replace' ? 'استبدال كامل' : 'دمج وتحديث'}) شملت ${result.counts.pests + result.counts.reports + result.counts.locations + result.counts.controlMeasures} سجلاً`
      );
    } catch (err: any) {
      console.error('Import execution error:', err);
      setImportError(err?.message || (isRtl ? 'فشل استيراد النسخة الاحتياطية' : 'Failed to import backup'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div 
      id="backup-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="backup-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {isRtl ? 'النسخ الاحتياطي واستعادة قاعدة البيانات' : 'Database Backup & Restore'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl 
                  ? 'حفظ وأرشفة كافة بيانات المنظومة أو استعادتها من ملف خارجي' 
                  : 'Archive all quarantine datasets or restore from JSON backup file'}
              </p>
            </div>
          </div>
          <button
            id="close-backup-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2">
          <button
            id="tab-export-backup"
            type="button"
            onClick={() => {
              setActiveTab('export');
              setImportError(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isRtl ? 'تصدير نسخة احتياطية (Export)' : 'Export Backup'}</span>
          </button>

          <button
            id="tab-import-backup"
            type="button"
            onClick={() => {
              setActiveTab('import');
              setExportSuccess(false);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isRtl ? 'استيراد واستعادة نسخة (Import)' : 'Import & Restore'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ======================= TAB 1: EXPORT ======================= */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              {/* Informational Banner */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  <span className="font-bold">
                    {isRtl ? 'حماية شاملة ومزامنة سحابية:' : 'Comprehensive Protection:'}
                  </span>{' '}
                  {isRtl
                    ? 'يتم تجميع كافة سجلات الآفات الحجرية، بلاغات الرصد الميداني، إحداثيات المواقع، تدابير وبروتوكولات المكافحة، والإحصائيات الشهرية في ملف JSON مشفر ومنظم يسهل حفظه بأمان أو نقله بين الخوادم.'
                    : 'All quarantine pests, field reports, locations, control protocols, and monthly stats will be compiled into a standardized JSON backup file.'}
                </div>
              </div>

              {/* Current Dataset Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  {isRtl ? 'إحصائيات البيانات الحالية الجاهزة للتصدير:' : 'Current Datasets Ready for Export:'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 block">{isRtl ? 'الآفات المسجلة' : 'Pests'}</span>
                    <span className="text-lg font-bold text-slate-900">{pests.length}</span>
                    <span className="text-[11px] text-slate-400 block">{isRtl ? 'نوعاً وتصنيفاً' : 'records'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 block">{isRtl ? 'بلاغات الرصد' : 'Reports'}</span>
                    <span className="text-lg font-bold text-slate-900">{reports.length}</span>
                    <span className="text-[11px] text-slate-400 block">{isRtl ? 'بلاغاً ميدانياً' : 'field reports'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 block">{isRtl ? 'المواقع الجغرافية' : 'Locations'}</span>
                    <span className="text-lg font-bold text-slate-900">{locations.length}</span>
                    <span className="text-[11px] text-slate-400 block">{isRtl ? 'مركزاً ومحافظة' : 'centers'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 block">{isRtl ? 'بروتوكولات المكافحة' : 'Control Measures'}</span>
                    <span className="text-lg font-bold text-slate-900">{controlMeasures.length}</span>
                    <span className="text-[11px] text-slate-400 block">{isRtl ? 'توصية معتمدة' : 'protocols'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 block">{isRtl ? 'الإحصائيات الشهرية' : 'Monthly Stats'}</span>
                    <span className="text-lg font-bold text-slate-900">{monthlyStats.length}</span>
                    <span className="text-[11px] text-slate-400 block">{isRtl ? 'شهراً مسجلاً' : 'months'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 block">{isRtl ? 'المستخدمين والصلاحيات' : 'User Accounts'}</span>
                    <span className="text-lg font-bold text-slate-900">{users.length}</span>
                    <span className="text-[11px] text-slate-400 block">{isRtl ? 'حساباً مسجلاً' : 'accounts'}</span>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    id="include-users-checkbox"
                    type="checkbox"
                    checked={includeUsersInExport}
                    onChange={(e) => setIncludeUsersInExport(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>
                    {isRtl 
                      ? 'تضمين حسابات المستخدمين والصلاحيات وسجل النشاطات في ملف النسخة' 
                      : 'Include user accounts, roles and system permissions in backup'}
                  </span>
                </label>
              </div>

              {/* Success Feedback Banner */}
              {exportSuccess && (
                <div className="p-3.5 bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {isRtl 
                      ? 'تم تصدير وتحميل النسخة الاحتياطية بنجاح إلى جهازك!' 
                      : 'Backup exported and downloaded successfully!'}
                  </span>
                </div>
              )}

              {/* Export Action Button */}
              <div className="pt-3">
                <button
                  id="execute-export-backup-btn"
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{isRtl ? 'جارٍ تجميع وتنزيل النسخة الاحتياطية...' : 'Preparing backup...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>{isRtl ? 'تحميل النسخة الاحتياطية الآن (Export JSON Backup)' : 'Download Backup Now (JSON)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ======================= TAB 2: IMPORT ======================= */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Informational Warning */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <span className="font-bold">
                    {isRtl ? 'تنبيه أمان الاستعادة:' : 'Security & Safety Notice:'}
                  </span>{' '}
                  {isRtl
                    ? 'يرجى التأكد من أن الملف المراد استيراده تم تصديره من منظومة الحجر الزراعي المصرية (EQAPS). سيتم التحقق من بنية البيانات وصحتها قبل التنفيذ.'
                    : 'Ensure the file was generated by EQAPS. File schema and integrity are validated before committing.'}
                </div>
              </div>

              {/* Drag and drop upload zone */}
              <div
                id="backup-file-dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-teal-500 bg-teal-50/50 scale-[1.01]' 
                    : selectedFile 
                      ? 'border-emerald-400 bg-emerald-50/30' 
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="backup-file-input"
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedFile ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {selectedFile ? <FileCheck className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>

                  <div>
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {isRtl ? 'انقر لاختيار ملف آخر' : 'Click to choose another file'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {isRtl ? 'انقر لاختيار ملف النسخة الاحتياطية (.json) أو اسحبه وأفلته هنا' : 'Click to select .json backup file or drag & drop here'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {isRtl ? 'يقبل ملفات JSON الناتجة من أمر التصدير' : 'Accepts standard JSON backup files'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Validation Summary Preview */}
              {validationResult?.isValid && validationResult.summary && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {isRtl ? 'تم التحقق من سلامة الملف بنجاح' : 'File Validated Successfully'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {validationResult.summary.totalRecords} {isRtl ? 'سجل' : 'records'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">{isRtl ? 'الآفات المسجلة:' : 'Pests:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{validationResult.summary.pestsCount}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">{isRtl ? 'بلاغات الرصد:' : 'Reports:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{validationResult.summary.reportsCount}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">{isRtl ? 'المواقع الجغرافية:' : 'Locations:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{validationResult.summary.locationsCount}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">{isRtl ? 'بروتوكولات المكافحة:' : 'Control:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{validationResult.summary.controlMeasuresCount}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">{isRtl ? 'الإحصائيات الشهرية:' : 'Monthly Stats:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{validationResult.summary.monthlyStatsCount}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">{isRtl ? 'حسابات المستخدمين:' : 'Users:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{validationResult.summary.usersCount}</span>
                    </div>
                  </div>

                  {validationResult.exportDate && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {isRtl ? 'تاريخ التصدير:' : 'Exported on:'} {new Date(validationResult.exportDate).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                      </span>
                      {validationResult.exportedBy && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {validationResult.exportedBy}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Import Mode Strategy Selection */}
              {validationResult?.isValid && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    {isRtl ? 'طريقة الاستعادة والتطبيق:' : 'Restore Strategy:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="import-mode-merge-btn"
                      type="button"
                      onClick={() => setImportMode('merge')}
                      className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        importMode === 'merge'
                          ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          {isRtl ? 'دمج وتحديث السجلات' : 'Merge & Update'}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {isRtl ? 'موصى به' : 'Recommended'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {isRtl
                          ? 'دمج البيانات وتحديث السجلات المشتركة دون حذف أي بيانات مسجلة حالياً.'
                          : 'Merges records, updates existing IDs, and keeps current non-conflicting data.'}
                      </p>
                    </button>

                    <button
                      id="import-mode-replace-btn"
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        importMode === 'replace'
                          ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          {isRtl ? 'استعادة كاملة واستبدال' : 'Full Overwrite'}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {isRtl ? 'استبدال كامل' : 'Replace All'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {isRtl
                          ? 'استبدال قاعدة البيانات بالكامل بمحتويات ملف النسخة الاحتياطية.'
                          : 'Replaces live collections completely with data inside this backup file.'}
                      </p>
                    </button>
                  </div>

                  {validationResult.summary?.usersCount && validationResult.summary.usersCount > 0 && (
                    <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none pt-1">
                      <input
                        id="restore-users-checkbox"
                        type="checkbox"
                        checked={includeUsersInImport}
                        onChange={(e) => setIncludeUsersInImport(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span>
                        {isRtl
                          ? 'استعادة وتحديث حسابات المستخدمين والصلاحيات الموجودة بالنسخة'
                          : 'Restore and update user accounts and permissions from backup'}
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Error Alert */}
              {importError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success Alert */}
              {importSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-sm">{importSuccess.message}</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {isRtl
                      ? `تمت المزامنة بنجاح مع قاعدة البيانات السحابية (Firestore) ومحرك التخزين المحلي.`
                      : 'Successfully synchronized to Firestore cloud database and local state.'}
                  </p>
                </div>
              )}

              {/* Execute Import Action Button */}
              <div className="pt-2">
                <button
                  id="execute-import-backup-btn"
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={!validationResult?.isValid || isImporting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-600/25 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{isRtl ? 'جارٍ استعادة ومزامنة السجلات في Firestore...' : 'Synchronizing records to database...'}</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-5 h-5" />
                      <span>{isRtl ? 'تأكيد واستعادة النسخة الاحتياطية الآن' : 'Confirm & Restore Backup Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{isRtl ? 'منظومة الحجر الزراعي المصرية 2026' : 'EQAPS 2026 System'}</span>
          </div>
          <button
            id="close-modal-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
