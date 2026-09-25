import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Printer, 
  X, 
  FileCheck2, 
  FileSpreadsheet, 
  FileText, 
  Bug, 
  Calendar, 
  Map, 
  AlertTriangle, 
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Loader2
} from 'lucide-react';
import { 
  exportPestsToCSV, 
  exportPestsToXLSX, 
  exportMonthlyStatsToCSV, 
  exportMonthlyStatsToXLSX,
  exportElementToPDF,
  exportMonthlyStatsToPDF,
  exportPestsToPDF
} from '../../utils/exportUtils';

export type ReportPrintMode = 'general' | 'pests' | 'monthly';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: ReportPrintMode;
}

export const OfficialPrintReport: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'general' 
}) => {
  const { 
    pests, 
    locations, 
    reports, 
    locationZoneStatuses, 
    controlMeasures, 
    monthlyStats 
  } = useDatabase();
  const { t, language, tGovernorate, tPestName, tPestType, tCategory, tZone, tSector, tCrop, tSite, tMonth } = useLanguage();

  const [activeMode, setActiveMode] = useState<ReportPrintMode>(initialMode);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen && initialMode) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const today = language === 'ar' 
    ? new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalAffected = reports.reduce((s, r) => s + r.affectedAreaFeddans, 0).toFixed(1);
  const severeReports = reports.filter(r => r.severity === 'جسيمة');
  const pfaList = locationZoneStatuses.filter(s => s.classification === 'منطقة خالية من الإصابة (PFA)');
  const highRiskList = locationZoneStatuses.filter(s => s.classification === 'منطقة عالية الإصابة (بؤرة حجرية)');

  // Monthly stats calculations
  let totalMonthlyReports = 0;
  let totalMonthlyAffected = 0;
  let totalMonthlyTreated = 0;
  let totalMonthlyOutbreaks = 0;
  monthlyStats.forEach(s => {
    totalMonthlyReports += s.newReportsCount;
    totalMonthlyAffected += s.affectedFeddans;
    totalMonthlyTreated += s.treatedFeddans;
    totalMonthlyOutbreaks += s.activeOutbreaks;
  });
  const avgMonthlyEfficiency = totalMonthlyAffected > 0 
    ? ((totalMonthlyTreated / totalMonthlyAffected) * 100).toFixed(1)
    : '100';

  // Pest inventory classification counts
  const a1Pests = pests.filter(p => p.quarantineCategory?.includes('أ1'));
  const a2Pests = pests.filter(p => p.quarantineCategory?.includes('أ2'));
  const rnqpPests = pests.filter(p => p.quarantineCategory?.includes('RNQP'));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) return;
    setIsExportingPDF(true);
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const filename = activeMode === 'pests' 
        ? `CAPQ_Pests_Inventory_${todayIso}.pdf`
        : activeMode === 'monthly'
          ? `CAPQ_Monthly_Phytosanitary_Stats_${todayIso}.pdf`
          : `CAPQ_Executive_Report_${todayIso}.pdf`;

      await exportElementToPDF(reportContentRef.current, filename);
    } catch (error) {
      console.error('Failed to export PDF from official print report:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCurrentXLSX = () => {
    if (activeMode === 'pests') {
      exportPestsToXLSX(pests);
    } else if (activeMode === 'monthly') {
      exportMonthlyStatsToXLSX(monthlyStats);
    } else {
      exportPestsToXLSX(pests);
    }
  };

  const handleExportCurrentCSV = () => {
    if (activeMode === 'pests') {
      exportPestsToCSV(pests);
    } else if (activeMode === 'monthly') {
      exportMonthlyStatsToCSV(monthlyStats);
    } else {
      exportPestsToCSV(pests);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-6 print:m-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Controls Bar (hidden during print) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 bg-slate-50 gap-4 print:hidden">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <span className="font-bold text-slate-800 text-sm sm:text-base">
                {language === 'ar' ? 'مركز التقارير والتوثيق الرسمي المعتمد (CAPQ)' : 'Official Phytosanitary Reporting Center (CAPQ)'}
              </span>
            </div>

            {/* Document Type Switcher */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-700">
              <button
                onClick={() => setActiveMode('general')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeMode === 'general' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'التقرير التنفيذي العام' : 'Executive Overview'}</span>
              </button>
              <button
                onClick={() => setActiveMode('pests')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeMode === 'pests' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'سجل حصر الآفات' : 'Pests Inventory'}</span>
              </button>
              <button
                onClick={() => setActiveMode('monthly')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeMode === 'monthly' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'الإحصائيات الشهرية' : 'Monthly Statistics'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {(activeMode === 'pests' || activeMode === 'monthly') && (
              <>
                <button
                  onClick={handleExportCurrentXLSX}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
                  title={language === 'ar' ? 'تصدير كملف إكسيل Excel (XLSX)' : 'Export as Excel'}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel (XLSX)</span>
                </button>
                <button
                  onClick={handleExportCurrentCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                  title={language === 'ar' ? 'تصدير كملف CSV' : 'Export as CSV'}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>CSV</span>
                </button>
              </>
            )}

            {/* Direct PDF Download */}
            <button
              id="download-official-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-60 rounded-xl shadow-xs transition cursor-pointer"
              title={language === 'ar' ? 'تصدير وتحميل وثيقة رسمية PDF مباشرة للتقديم' : 'Download certified PDF report'}
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileDown className="w-4 h-4 text-white" />
              )}
              <span>{isExportingPDF ? (language === 'ar' ? 'جارٍ إنشاء PDF...' : 'Generating PDF...') : (language === 'ar' ? 'تحميل وثيقة PDF' : 'Download PDF')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
              title={language === 'ar' ? 'معاينة الطباعة المباشرة من المتصفح' : 'Print Document'}
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة المستند' : 'Print Document'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title={language === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div 
          ref={reportContentRef}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          className={`p-8 sm:p-12 space-y-8 print:p-6 text-slate-900 ${language === 'ar' ? "font-['Cairo',sans-serif]" : "font-sans"} bg-white`}
        >
          
          {/* Official Ministerial Letterhead */}
          <div className="border-b-2 border-emerald-900 pb-6 text-center space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-3 text-xs text-slate-600">
              <div className={`${language === 'ar' ? 'text-right' : 'text-left'} font-semibold leading-relaxed`}>
                {language === 'ar' ? (
                  <>
                    جمهورية مصر العربية<br />
                    وزارة الزراعة واستصلاح الأراضي<br />
                    الإدارة المركزية للحجر الزراعي المصري (CAPQ)
                  </>
                ) : (
                  <>
                    Arab Republic of Egypt<br />
                    Ministry of Agriculture & Land Reclamation<br />
                    Central Administration of Plant Quarantine (CAPQ)
                  </>
                )}
              </div>
              <div className="text-center font-bold text-emerald-950 text-sm">
                {language === 'ar' ? 'منظومة الرصد والتتبع الوبائي والحجري للآفات الزراعية' : 'Phytosanitary Surveillance & Quarantine Pest Tracking System'}
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  {language === 'ar' 
                    ? 'معتمدة وفق معايير الاتفاقية الدولية لوقاية النباتات (IPPC / FAO)' 
                    : 'Certified compliant with IPPC / FAO Phytosanitary Standards (ISPM)'}
                </div>
              </div>
              <div className={`${language === 'ar' ? 'text-left' : 'text-right'} font-semibold leading-relaxed`}>
                {language === 'ar' ? 'التاريخ:' : 'Date:'} {today}<br />
                {language === 'ar' ? 'الرقم المرجعي:' : 'Ref:'} {activeMode === 'pests' ? 'CAPQ-INV-PESTS-2026' : activeMode === 'monthly' ? 'CAPQ-STAT-MONTHLY-2026' : 'CAPQ-REP-EXEC-2026'}<br />
                {language === 'ar' ? 'درجة السرية: وثيقة رسمية معتمدة' : 'Security: Certified Official Document'}
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-emerald-900">
              {activeMode === 'pests' && (language === 'ar' ? 'السجل الرسمي المعتمد لحصر وتصنيف الآفات الزراعية والحجرية' : 'Official National Pest List & Quarantine Classification Register')}
              {activeMode === 'monthly' && (language === 'ar' ? 'التقرير الإحصائي الشهري لعمليات الرصد والمكافحة وتطهير البؤر' : 'Monthly Statistical Report on Phytosanitary Surveillance & Eradication')}
              {activeMode === 'general' && (language === 'ar' ? 'تقرير الحصر الشامل والتوزيع الجغرافي للآفات الزراعية والحجرية' : 'Comprehensive Phytosanitary Status & Geographical Distribution Report')}
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto">
              {activeMode === 'pests' && (language === 'ar' 
                ? 'بيان مرجعي بجميع الآفات الحشرية، الفطرية، البكتيرية، النيماتودا، والحشائش المصنفة حجرياً واقتصادياً بالزراعات المصرية'
                : 'Official register of regulated quarantine pests (A1, A2, RNQP) affecting agricultural crops in Egypt')}
              {activeMode === 'monthly' && (language === 'ar'
                ? 'تحليل دوري مقارن للمساحات المتضررة مقابل المساحات المعالجة ومعدلات استئصال البؤر الحجرية بكافة المحافظات'
                : 'Periodic comparative performance analysis of surveillance notifications, affected acreage, and containment efficacy')}
              {activeMode === 'general' && (language === 'ar'
                ? 'بيان تفصيلي بانتشار وكثافة الآفات الحجرية بالقطاعات الزراعية وتصنيف الأمان التصديري للمناطق الخالية (PFA)'
                : 'Executive summary detailing quarantine pest dispersion, emergency containment actions, and export-safe zones (PFA)')}
            </p>
          </div>

          {/* ==================================================== */}
          {/* MODE 1: PESTS INVENTORY REPORT (سجل حصر الآفات)      */}
          {/* ==================================================== */}
          {activeMode === 'pests' && (
            <div className="space-y-6">
              {/* Pest Key KPI Cards */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs text-slate-500 font-medium">{language === 'ar' ? 'إجمالي الآفات المسجلة' : 'Total Regulated Pests'}</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{pests.length}</p>
                  <span className="text-[10px] text-slate-500">{language === 'ar' ? 'نوعاً وكائناً ممرضاً' : 'Regulated species'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60">
                  <span className="text-xs text-rose-800 font-semibold">{language === 'ar' ? 'آفات حجرية أ1 (محظورة)' : 'A1 Quarantine Pests'}</span>
                  <p className="text-2xl font-black text-rose-700 mt-1">{a1Pests.length}</p>
                  <span className="text-[10px] text-rose-600">{language === 'ar' ? 'محظورة تماماً من الدخول' : 'Absent / Strict Quarantine'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
                  <span className="text-xs text-amber-800 font-semibold">{language === 'ar' ? 'آفات حجرية أ2 (حصار)' : 'A2 Quarantine Pests'}</span>
                  <p className="text-2xl font-black text-amber-800 mt-1">{a2Pests.length}</p>
                  <span className="text-[10px] text-amber-700">{language === 'ar' ? 'محدودة الانتشار تحت المراقبة' : 'Limited under official control'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
                  <span className="text-xs text-blue-800 font-semibold">{language === 'ar' ? 'آفات اقتصادية (RNQP)' : 'RNQP Regulated Non-Quarantine'}</span>
                  <p className="text-2xl font-black text-blue-700 mt-1">{rnqpPests.length}</p>
                  <span className="text-[10px] text-blue-600">{language === 'ar' ? 'خاضعة لرقابة التقاوي' : 'Certified seed surveillance'}</span>
                </div>
              </div>

              {/* Full Pest Inventory Table */}
              <div className="space-y-3">
                <h3 className={`text-sm font-bold text-slate-900 flex items-center gap-2 ${language === 'ar' ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-emerald-700`}>
                  {language === 'ar' ? 'جدول حصر الكائنات الممرضة والآفات المسجلة رسمياً بالمنظومة' : 'Official Regulated Pest List & Quarantine Classifications'}
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">{t.pests.colCode}</th>
                        <th className="p-2.5">{t.pests.colCommonName}</th>
                        <th className="p-2.5">{t.pests.colScientificName}</th>
                        <th className="p-2.5">{t.pests.colType}</th>
                        <th className="p-2.5">{t.pests.colCategory}</th>
                        <th className="p-2.5">{t.pests.colHostCrops}</th>
                        <th className="p-2.5">{t.pests.colRisk}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pests.map((pest, idx) => (
                        <tr key={pest.id} className="text-slate-800">
                          <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-mono text-[11px] font-bold text-emerald-800">{pest.id}</td>
                          <td className="p-2.5 font-bold text-slate-900">{language === 'ar' ? pest.commonName : tPestName(pest.commonName)}</td>
                          <td className="p-2.5 italic text-slate-600 font-mono text-[11px]" dir="ltr">{pest.scientificName}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {language === 'ar' ? pest.type : tPestType(pest.type)}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800 text-[11px]">
                            {language === 'ar' ? pest.quarantineCategory : tCategory(pest.quarantineCategory)}
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px]">
                            {pest.primaryHostCrops.map(c => language === 'ar' ? c : tCrop(c)).join(', ')}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              pest.riskLevel === 'حرج جداً' ? 'bg-rose-100 text-rose-800' :
                              pest.riskLevel === 'مرتفع' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {language === 'ar' ? pest.riskLevel : (pest.riskLevel === 'حرج جداً' ? 'Critical' : pest.riskLevel === 'مرتفع' ? 'High' : 'Moderate')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* MODE 2: MONTHLY STATISTICS REPORT (الإحصائيات الشهرية) */}
          {/* ==================================================== */}
          {activeMode === 'monthly' && (
            <div className="space-y-6">
              {/* Monthly Stats KPI Summary */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs text-slate-500 font-medium">{language === 'ar' ? 'إجمالي بلاغات الرصد' : 'Total Surveillance Reports'}</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{totalMonthlyReports}</p>
                  <span className="text-[10px] text-slate-500">{language === 'ar' ? 'إشعاراً ميدانياً' : 'Field notifications'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60">
                  <span className="text-xs text-rose-800 font-semibold">{language === 'ar' ? 'المساحة المتضررة الكلية' : 'Total Infested Area'}</span>
                  <p className="text-2xl font-black text-rose-700 mt-1">{totalMonthlyAffected.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  <span className="text-[10px] text-rose-600">{language === 'ar' ? 'فدان مستهدف' : 'Feddans affected'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="text-xs text-emerald-800 font-semibold">{language === 'ar' ? 'المساحة المعالجة والمكافحة' : 'Treated & Cleared Area'}</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{totalMonthlyTreated.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  <span className="text-[10px] text-emerald-600">{language === 'ar' ? 'فدان تم تطهيره بنجاح' : 'Feddans treated'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
                  <span className="text-xs text-blue-800 font-semibold">{language === 'ar' ? 'متوسط نسبة كفاءة الاحتواء' : 'Containment Efficiency'}</span>
                  <p className="text-2xl font-black text-blue-700 mt-1">{avgMonthlyEfficiency}%</p>
                  <span className="text-[10px] text-blue-600">{language === 'ar' ? 'معدل نجاح العمليات' : 'Average success rate'}</span>
                </div>
              </div>

              {/* Monthly Table Details */}
              <div className="space-y-3">
                <h3 className={`text-sm font-bold text-slate-900 flex items-center gap-2 ${language === 'ar' ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-blue-700`}>
                  {language === 'ar' ? 'جدول الإحصائيات الدورية لعمليات الرصد والمكافحة الحقلية' : 'Surveillance & Field Eradication Operations Statistics'}
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">{t.monthlyStats.colMonth}</th>
                        <th className="p-2.5">{t.monthlyStats.colMonthCode}</th>
                        <th className="p-2.5 text-center">{t.monthlyStats.colNewReports}</th>
                        <th className="p-2.5">{t.monthlyStats.colAffectedArea}</th>
                        <th className="p-2.5">{t.monthlyStats.colTreatedArea}</th>
                        <th className="p-2.5">{t.monthlyStats.colEfficiency}</th>
                        <th className="p-2.5 text-center">{t.monthlyStats.colActiveOutbreaks}</th>
                        <th className="p-2.5">{t.monthlyStats.colStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyStats.map((stat, idx) => {
                        const rate = stat.affectedFeddans > 0 
                          ? ((stat.treatedFeddans / stat.affectedFeddans) * 100).toFixed(1)
                          : '100';

                        return (
                          <tr key={stat.monthCode} className="text-slate-800">
                            <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{language === 'ar' ? stat.month : tMonth(stat.month)}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-600">{stat.monthCode}</td>
                            <td className="p-2.5 text-center font-bold">{stat.newReportsCount}</td>
                            <td className="p-2.5 font-semibold text-rose-700">{stat.affectedFeddans.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t.common.feddans}</td>
                            <td className="p-2.5 font-semibold text-emerald-700">{stat.treatedFeddans.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t.common.feddans}</td>
                            <td className="p-2.5 font-bold text-blue-800">{rate}%</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                stat.activeOutbreaks >= 8 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {stat.activeOutbreaks}
                              </span>
                            </td>
                            <td className="p-2.5 text-[11px]">
                              {stat.activeOutbreaks >= 8 
                                ? (language === 'ar' ? 'حصار موسمي مكثف' : 'Intensive Containment')
                                : stat.activeOutbreaks >= 4 
                                  ? (language === 'ar' ? 'بؤر قيد السيطرة' : 'Under Control')
                                  : (language === 'ar' ? 'وضع آمن ومستقر' : 'Stable / Low Risk')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-200">
                        <td className="p-2.5" colSpan={3}>{language === 'ar' ? 'الإجمالي العام للفترة بالكامل' : 'Overall Cumulative Total'}</td>
                        <td className="p-2.5 text-center">{totalMonthlyReports}</td>
                        <td className="p-2.5 text-rose-700">{totalMonthlyAffected.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t.common.feddans}</td>
                        <td className="p-2.5 text-emerald-700">{totalMonthlyTreated.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t.common.feddans}</td>
                        <td className="p-2.5 text-blue-800">{avgMonthlyEfficiency}%</td>
                        <td className="p-2.5 text-center">{totalMonthlyOutbreaks}</td>
                        <td className="p-2.5 text-slate-600">{language === 'ar' ? 'بيانات مدققة ومعتمدة' : 'Verified & Certified'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* MODE 3: GENERAL EXECUTIVE REPORT (التقرير التنفيذي) */}
          {/* ==================================================== */}
          {activeMode === 'general' && (
            <div className="space-y-6">
              {/* Key Metrics Section */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs text-slate-500">{t.kpi.totalPests}</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{pests.length}</p>
                  <span className="text-[10px] text-slate-500">{language === 'ar' ? 'نوعاً مصنفاً' : 'Classified pests'}</span>
                </div>
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
                  <span className="text-xs text-rose-800 font-semibold">{t.kpi.affectedArea}</span>
                  <p className="text-2xl font-black text-rose-700 mt-1">{totalAffected}</p>
                  <span className="text-[10px] text-rose-600">{t.common.feddans}</span>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="text-xs text-emerald-800 font-semibold">{t.kpi.pfaDistricts}</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{pfaList.length}</p>
                  <span className="text-[10px] text-emerald-600">{language === 'ar' ? 'مركزاً معتمداً للتصدير' : 'Export certified districts'}</span>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
                  <span className="text-xs text-amber-800 font-semibold">{t.kpi.activeHotspots}</span>
                  <p className="text-2xl font-black text-amber-800 mt-1">{highRiskList.length}</p>
                  <span className="text-[10px] text-amber-700">{language === 'ar' ? 'تحت الحصار الفوري' : 'Under immediate quarantine'}</span>
                </div>
              </div>

              {/* Geographical Zone Classification */}
              <div className="space-y-3">
                <h3 className={`text-base font-bold text-slate-900 flex items-center gap-2 ${language === 'ar' ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-emerald-700`}>
                  {language === 'ar' ? 'أولاً: التوزيع الجغرافي للمواقع والتصنيف الوبائي والحجري' : '1. Regional Distribution & Phytosanitary Zone Classifications'}
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
                    <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">{t.reports.colGovMarkaz}</th>
                        <th className="p-2.5">{t.locations.colSector}</th>
                        <th className="p-2.5">{t.locations.colClassification}</th>
                        <th className="p-2.5">{t.reports.colAffectedArea}</th>
                        <th className="p-2.5">{language === 'ar' ? 'الآفات السائدة' : 'Dominant Pests'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {locationZoneStatuses.map(item => (
                        <tr key={item.location.id} className="text-slate-800">
                          <td className="p-2.5 font-bold">
                            {language === 'ar' ? item.location.governorate : tGovernorate(item.location.governorate)} — {item.location.markaz}
                          </td>
                          <td className="p-2.5 text-slate-600">{language === 'ar' ? item.location.agriculturalSector : tSector(item.location.agriculturalSector)}</td>
                          <td className="p-2.5">
                            <span className="font-bold">{language === 'ar' ? item.classification : tZone(item.classification)}</span>
                          </td>
                          <td className="p-2.5">{item.totalAffectedFeddans} {t.common.feddans}</td>
                          <td className="p-2.5 text-slate-600">
                            {item.dominantPests.length > 0 
                              ? item.dominantPests.map(p => language === 'ar' ? p : tPestName(p)).join(language === 'ar' ? '، ' : ', ') 
                              : (language === 'ar' ? 'خالية تماماً' : 'Pest Free')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Severe Outbreak Details */}
              <div className="space-y-3">
                <h3 className={`text-base font-bold text-slate-900 flex items-center gap-2 ${language === 'ar' ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-rose-700`}>
                  {language === 'ar' ? 'ثانياً: البؤر الحجرية عالية الخطورة والإجراءات المتخذة' : '2. Critical Quarantine Outbreaks & Emergency Measures'}
                </h3>
                <div className="space-y-2">
                  {severeReports.map(rep => {
                    const loc = locations.find(l => l.id === rep.locationId);
                    const pest = pests.find(p => p.id === rep.pestId);
                    const controls = controlMeasures.filter(c => c.pestId === rep.pestId);

                    return (
                      <div key={rep.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900 text-sm">
                            {pest ? (language === 'ar' ? pest.commonName : tPestName(pest.commonName)) : ''} ({pest?.scientificName}) — {loc ? (language === 'ar' ? loc.governorate : tGovernorate(loc.governorate)) : ''} ({loc?.markaz})
                          </span>
                          <span className="font-semibold text-rose-700">
                            {language === 'ar' ? 'المساحة المتضررة: ' : 'Affected Area: '} {rep.affectedAreaFeddans} {t.common.feddans}
                          </span>
                        </div>
                        <div className="text-slate-700 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong>{language === 'ar' ? 'المحصول المستهدف: ' : 'Host Crop: '}</strong> {language === 'ar' ? rep.crop : tCrop(rep.crop)} | <strong>{language === 'ar' ? 'مكان الإصابة: ' : 'Site: '}</strong> {language === 'ar' ? rep.infestationSite : tSite(rep.infestationSite)} | <strong>{language === 'ar' ? 'مفتش الرصد: ' : 'Inspector: '}</strong> {rep.sampleInspector}
                            {rep.fieldCoordinates && (
                              <span className="font-mono text-[11px] text-blue-700 mr-2" dir="ltr">
                                [GPS: {rep.fieldCoordinates.latitude}°N, {rep.fieldCoordinates.longitude}°E]
                              </span>
                            )}
                          </div>
                          {rep.fieldPhotoUrl && (
                            <div className="shrink-0">
                              <img 
                                src={rep.fieldPhotoUrl} 
                                alt="Field documentation" 
                                className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-2xs" 
                              />
                            </div>
                          )}
                        </div>
                        {controls.length > 0 && (
                          <div className="text-slate-600 pt-1 border-t border-rose-200/60">
                            <strong>{language === 'ar' ? 'بروتوكول المكافحة المعتمد: ' : 'Approved Treatment Protocol: '}</strong> {controls[0].pesticideName} ({language === 'ar' ? 'المادة الفعالة: ' : 'Active: '} {controls[0].activeIngredient}) — {language === 'ar' ? 'فترة الأمان PHI: ' : 'PHI: '} {controls[0].phiDays} {language === 'ar' ? 'يوم' : 'days'}.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Signatures & Ministerial Certification Block */}
          <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-3 text-center text-xs font-bold text-slate-800">
            <div>
              <p className="text-slate-500 font-normal">
                {language === 'ar' ? 'مهندس الرصد والإنذار المبكر' : 'Early Warning & Field Officer'}
              </p>
              <div className="h-14"></div>
              <p>{language === 'ar' ? 'التوقيع: ............................' : 'Signature: ............................'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-normal">
                {language === 'ar' ? 'مدير إدارة الحجر الزراعي والمكافحة' : 'Director of Pest Control & Quarantine'}
              </p>
              <div className="h-14"></div>
              <p>{language === 'ar' ? 'التوقيع والختم: ............................' : 'Stamp & Signature: ............................'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-normal">
                {language === 'ar' ? 'رئيس الإدارة المركزية للحجر الزراعي' : 'Head of Central Administration (CAPQ)'}
              </p>
              <div className="h-14"></div>
              <p>{language === 'ar' ? 'يعتمد رسمياً: ............................' : 'Official Certification: ............................'}</p>
            </div>
          </div>

          {/* Document Footer Note */}
          <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
            {language === 'ar'
              ? 'هذه الوثيقة صادرة عن منظومة الحجر الزراعي وقاعدة بيانات الآفات المصرية — معتمدة وفق اشتراطات التصدير والحجر الصحي الزراعي'
              : 'Official phytosanitary document issued by Central Administration of Plant Quarantine (CAPQ) - Ministry of Agriculture'}
          </div>
        </div>
      </div>
    </div>
  );
};
