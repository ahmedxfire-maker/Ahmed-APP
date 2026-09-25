import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { InfestationReport } from '../../types';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  MapPin, 
  Download,
  FileDown,
  Loader2,
  User,
  Camera,
  Navigation,
  ExternalLink,
  Eye,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ReportModal } from '../Modals/ReportModal';
import { exportReportsToPDF } from '../../utils/pdfExportUtils';

interface Props {
  onOpenPrintReport?: () => void;
}

export const ReportsTable: React.FC<Props> = ({ onOpenPrintReport }) => {
  const { reports, locations, pests, deleteReport, updateReport, addReport } = useDatabase();
  const { language, t, tGovernorate, tPestName, tSeverity, tSite, tCrop } = useLanguage();
  const { currentUser, isSuperAdmin, hasPermission } = useAuth();
  
  const isEmployee = currentUser?.role === 'employee';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  
  // Super Admins or managers can optionally toggle, but Employees are strictly and permanently locked to their own data
  const [onlyMyReports, setOnlyMyReports] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<InfestationReport | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Lightbox photo viewer state
  const [selectedPhotoReport, setSelectedPhotoReport] = useState<InfestationReport | null>(null);

  const canExport = hasPermission('canExportData');
  // Employee strictly CANNOT delete data
  const canDelete = !isEmployee && (isSuperAdmin || hasPermission('canDeleteData'));
  const canCreate = hasPermission('canCreateReports');

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // 1. If user is Employee: STRICTLY and PERMANENTLY filter to only their own entered reports
      if (isEmployee && currentUser) {
        const matchesUser = 
          r.createdByUserId === currentUser.id ||
          (r.createdByUsername && r.createdByUsername.toLowerCase() === currentUser.username.toLowerCase()) ||
          (r.sampleInspector && r.sampleInspector.toLowerCase().includes(currentUser.name.toLowerCase()));
        if (!matchesUser) return false;
      } else if (onlyMyReports && currentUser) {
        // Optional toggle for non-employee users who turn on "only my reports"
        const matchesUser = 
          r.createdByUserId === currentUser.id ||
          (r.createdByUsername && r.createdByUsername.toLowerCase() === currentUser.username.toLowerCase()) ||
          (r.sampleInspector && r.sampleInspector.toLowerCase().includes(currentUser.name.toLowerCase()));
        if (!matchesUser) return false;
      }

      const loc = locations.find(l => l.id === r.locationId);
      const pest = pests.find(p => p.id === r.pestId);

      const matchesSearch = 
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sampleInspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc && `${loc.governorate} ${loc.markaz}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pest && `${pest.commonName} ${pest.scientificName}`.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSeverity = selectedSeverity === 'all' || r.severity === selectedSeverity;
      const matchesSite = selectedSite === 'all' || r.infestationSite === selectedSite;

      return matchesSearch && matchesSeverity && matchesSite;
    });
  }, [reports, searchTerm, selectedSeverity, selectedSite, locations, pests, isEmployee, onlyMyReports, currentUser]);

  const handleExportCSV = () => {
    const headers = language === 'ar' ? [
      'معرف التقرير',
      'المحافظة',
      'المركز',
      'الآفة',
      'المحصول',
      'تاريخ الرصد',
      'شدة الإصابة',
      'المساحة المتضررة (فدان)',
      'مكان الإصابة',
      'نسبة الإصابة (%)',
      'مفتش الرصد',
      'إحداثيات GPS'
    ] : [
      'Report ID',
      'Governorate',
      'District',
      'Pest',
      'Crop',
      'Date',
      'Severity',
      'Affected Area (Feddans)',
      'Infestation Site',
      'Infestation Rate (%)',
      'Inspector',
      'GPS Coordinates'
    ];

    const rows = filteredReports.map(r => {
      const loc = locations.find(l => l.id === r.locationId);
      const pest = pests.find(p => p.id === r.pestId);
      const gpsStr = r.fieldCoordinates ? `${r.fieldCoordinates.latitude}, ${r.fieldCoordinates.longitude}` : '';
      return [
        r.id,
        loc ? (language === 'ar' ? loc.governorate : tGovernorate(loc.governorate)) : r.locationId,
        loc?.markaz || '',
        `"${language === 'ar' ? (pest?.commonName || r.pestId) : tPestName(pest?.commonName || r.pestId)}"`,
        `"${language === 'ar' ? r.crop : tCrop(r.crop)}"`,
        r.detectionDate,
        language === 'ar' ? r.severity : tSeverity(r.severity),
        r.affectedAreaFeddans,
        language === 'ar' ? r.infestationSite : tSite(r.infestationSite),
        `${r.infestationRatePercent}%`,
        `"${r.sampleInspector}"`,
        `"${gpsStr}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Phytosanitary_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDirectPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportReportsToPDF(filteredReports, locations, pests);
    } catch (error) {
      console.error('Failed to export Reports PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDelete = (id: string) => {
    // Strictly block if employee
    if (isEmployee) {
      alert(language === 'ar' ? 'غير مصرح للموظف بحذف أي بيانات.' : 'Employees are not authorized to delete data.');
      return;
    }

    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من حذف تقرير الإصابة رقم "${id}"؟`
      : `Are you sure you want to delete report "${id}"?`;
    if (window.confirm(confirmMsg)) {
      deleteReport(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {t.reports.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.reports.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct PDF Download - Only if hasPermission('canExportData') */}
          {canExport && (
            <button
              id="export-reports-pdf-btn"
              onClick={handleDownloadDirectPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 border border-rose-200 rounded-xl transition cursor-pointer shadow-2xs"
              title={language === 'ar' ? 'تصدير بلاغات الرصد الميداني كوثيقة PDF رسمية للتقديم' : 'Export official field infestation PDF report'}
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 text-rose-600" />
              )}
              <span>{isExportingPDF ? (language === 'ar' ? 'جارٍ توليد PDF...' : 'Generating PDF...') : (language === 'ar' ? 'تحميل وثيقة PDF' : 'Download PDF')}</span>
            </button>
          )}

          {canExport && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
          )}

          {/* Add Report - Can Create Reports */}
          {canCreate && (
            <button
              onClick={() => {
                setReportToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.reports.addNewReport}
            </button>
          )}
        </div>
      </div>

      {/* Scope banner: FOR EMPLOYEE - Strictly locked to their own entered reports without any "show all" button */}
      {isEmployee && currentUser && (
        <div className="px-6 py-2.5 bg-blue-50/90 border-b border-blue-200 text-blue-900 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">
              {language === 'ar' 
                ? 'نطاق العرض المعتمد: يتم حصر العرض على البلاغات التي قمت بإدخالها فقط (وفق سياسة أمن معلومات الحجر الزراعي لحساب الموظف)' 
                : 'Display Scope: Showing only reports entered by your account (Surveillance Officer privacy policy)'}
            </span>
          </div>

          <span className="text-[11px] font-bold text-blue-800 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
            {language === 'ar' ? 'بلاغاتك الخاصة فقط' : 'Your Reports Only'}
          </span>
        </div>
      )}

      {/* Scope banner for Super Admin or non-employee (with optional toggle) */}
      {!isEmployee && currentUser && isSuperAdmin && (
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 text-slate-700 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              {onlyMyReports
                ? (language === 'ar' ? 'نطاق العرض: مفلتر لعرض بلاغاتك فقط' : 'Scope: Filtered to my reports only')
                : (language === 'ar' ? 'عرض شامل لكافة بلاغات الجمهورية (صلاحيات الإدارة المركزية)' : 'Displaying all surveillance reports nationwide')}
            </span>
          </div>

          <button
            onClick={() => setOnlyMyReports(!onlyMyReports)}
            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 transition cursor-pointer"
          >
            {onlyMyReports 
              ? (language === 'ar' ? 'إظهار كافة البلاغات' : 'Show all reports') 
              : (language === 'ar' ? 'حصر على بلاغاتي فقط' : 'Filter to my reports')}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className={`w-4 h-4 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالمعرف، المحافظة، الآفة، المحصول، المفتش...' : 'Search report ID, governorate, pest, crop, inspector...'}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium">{t.reports.filterSeverity}</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">{language === 'ar' ? `كافة الدرجات (${reports.length})` : `All Severities (${reports.length})`}</option>
              <option value="خفيفة">{language === 'ar' ? 'خفيفة' : 'Low'}</option>
              <option value="متوسطة">{language === 'ar' ? 'متوسطة' : 'Moderate'}</option>
              <option value="جسيمة">{language === 'ar' ? 'جسيمة' : 'Severe'}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium">{t.reports.filterSite}</span>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">{language === 'ar' ? 'كافة الأماكن' : 'All Plant Sites'}</option>
              {['ساق', 'اوراق', 'جذور', 'تربة', 'ثمار', 'بذور'].map(site => (
                <option key={site} value={site}>
                  {language === 'ar' ? site : tSite(site)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table with Photo & GPS columns */}
      <div className="overflow-x-auto">
        <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">{t.reports.colId}</th>
              <th className="py-3.5 px-3 text-center">
                <span className="flex items-center justify-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'الصورة الميدانية' : 'Field Photo'}</span>
                </span>
              </th>
              <th className="py-3.5 px-4">{t.reports.colGovMarkaz}</th>
              <th className="py-3.5 px-4">{t.reports.colPest}</th>
              <th className="py-3.5 px-4">{t.reports.colCrop}</th>
              <th className="py-3.5 px-4">{t.reports.colDate}</th>
              <th className="py-3.5 px-4">{t.reports.colSeverity}</th>
              <th className="py-3.5 px-4">{t.reports.colAffectedArea}</th>
              <th className="py-3.5 px-4">{t.reports.colSite}</th>
              <th className="py-3.5 px-4">{t.reports.colInspector}</th>
              <th className="py-3.5 px-4 text-center">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  {language === 'ar' ? 'لا توجد تقارير مطابقة لمعايير البحث والتصفية' : 'No reports matching search and filter criteria'}
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const loc = locations.find(l => l.id === report.locationId);
                const pest = pests.find(p => p.id === report.pestId);

                return (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition">
                    {/* Report ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {report.id}
                    </td>

                    {/* Field Photo Thumbnail */}
                    <td className="py-3 px-3 text-center">
                      {report.fieldPhotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPhotoReport(report)}
                          className="relative inline-block w-10 h-10 rounded-xl overflow-hidden border border-emerald-300 shadow-2xs hover:scale-110 hover:shadow-md transition cursor-pointer group"
                          title={language === 'ar' ? 'عرض صورة التوثيق الميداني المكبرة' : 'View full field photo'}
                        >
                          <img 
                            src={report.fieldPhotoUrl} 
                            alt="Field pest" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-tl-md"></span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          —
                        </span>
                      )}
                    </td>

                    {/* Location & GPS Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {loc ? (language === 'ar' ? loc.governorate : tGovernorate(loc.governorate)) : ''} — {loc?.markaz}
                        </span>
                      </div>

                      {/* GPS coordinates badge if attached */}
                      {report.fieldCoordinates ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 font-mono w-fit">
                          <Navigation className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>
                            {report.fieldCoordinates.latitude.toFixed(4)}°N, {report.fieldCoordinates.longitude.toFixed(4)}°E
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${report.fieldCoordinates.latitude},${report.fieldCoordinates.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-900 ml-1"
                            title={language === 'ar' ? 'عرض على خرائط Google' : 'View on Google Maps'}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({report.locationId})
                        </span>
                      )}
                    </td>

                    {/* Pest */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {pest ? (language === 'ar' ? pest.commonName : tPestName(pest.commonName)) : report.pestId}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono italic" dir="ltr">
                        {pest?.scientificName}
                      </span>
                    </td>

                    {/* Crop */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {language === 'ar' ? report.crop : tCrop(report.crop)}
                    </td>

                    {/* Detection Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {report.detectionDate}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        report.severity === 'جسيمة' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        report.severity === 'متوسطة' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {language === 'ar' ? report.severity : tSeverity(report.severity)}
                      </span>
                    </td>

                    {/* Affected Area */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {report.affectedAreaFeddans} <span className="font-normal text-slate-500 text-[11px]">{t.common.feddans}</span>
                    </td>

                    {/* Infestation Site */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {language === 'ar' ? report.infestationSite : tSite(report.infestationSite)}
                      </span>
                    </td>

                    {/* Inspector */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-[140px] truncate" title={report.sampleInspector}>
                      {report.sampleInspector}
                    </td>

                    {/* Actions: Edit allowed, Delete strictly disabled for Employee */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setReportToEdit(report);
                            setIsModalOpen(true);
                          }}
                          title={language === 'ar' ? 'تعديل التقرير' : 'Edit report'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Report - strictly forbidden for Employee */}
                        {canDelete && !isEmployee && (
                          <button
                            onClick={() => handleDelete(report.id)}
                            title={language === 'ar' ? 'حذف التقرير' : 'Delete report'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          {language === 'ar'
            ? <>عرض <strong>{filteredReports.length}</strong> تقرير رصد من أصل <strong>{reports.length}</strong> بلاغ</>
            : <>Displaying <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> surveillance reports</>}
        </div>
        <div>
          {language === 'ar' ? 'إجمالي المساحة المتضررة في البلاغات المعروضة: ' : 'Total affected area in current view: '}
          <strong className="text-slate-900 font-bold">
            {filteredReports.reduce((s, r) => s + r.affectedAreaFeddans, 0).toFixed(1)} {t.common.feddans}
          </strong>
        </div>
      </div>

      {/* Edit/Create Report Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReportToEdit(null);
        }}
        onSave={(data) => {
          if (reportToEdit) {
            updateReport(reportToEdit.id, data);
          } else {
            addReport({
              ...data,
              createdByUserId: currentUser?.id,
              createdByUsername: currentUser?.username,
              sampleInspector: data.sampleInspector || currentUser?.name || 'مفتش الحجر الزراعي'
            });
          }
        }}
        reportToEdit={reportToEdit}
      />

      {/* High-Resolution Photo Viewer Lightbox */}
      {selectedPhotoReport && selectedPhotoReport.fieldPhotoUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Camera className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {language === 'ar' ? 'صورة التوثيق الميداني للبلاغ' : 'Surveillance Field Photo'} ({selectedPhotoReport.id})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {selectedPhotoReport.crop} — {selectedPhotoReport.sampleInspector}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Viewport */}
            <div className="p-3 max-h-[70vh] flex items-center justify-center bg-black/60">
              <img
                src={selectedPhotoReport.fieldPhotoUrl}
                alt="High resolution field documentation"
                className="max-h-[60vh] w-auto object-contain rounded-2xl shadow-xl"
              />
            </div>

            {/* Photo Metadata Bar */}
            <div className="p-4 bg-slate-950 text-slate-300 text-xs flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              <div className="flex items-center gap-3 flex-wrap">
                {selectedPhotoReport.fieldPhotoTimestamp && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(selectedPhotoReport.fieldPhotoTimestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </span>
                )}
                {selectedPhotoReport.fieldCoordinates && (
                  <span className="flex items-center gap-1.5 text-blue-400 font-mono" dir="ltr">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>
                      {selectedPhotoReport.fieldCoordinates.latitude}° N, {selectedPhotoReport.fieldCoordinates.longitude}° E
                    </span>
                  </span>
                )}
              </div>

              {selectedPhotoReport.fieldCoordinates && (
                <a
                  href={`https://www.google.com/maps?q=${selectedPhotoReport.fieldCoordinates.latitude},${selectedPhotoReport.fieldCoordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition text-xs"
                >
                  <span>{language === 'ar' ? 'معاينة في خرائط Google' : 'Open in Google Maps'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
