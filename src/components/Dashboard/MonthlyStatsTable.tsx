import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { MonthlyStat } from '../../types';
import { 
  exportMonthlyStatsToCSV, 
  exportMonthlyStatsToXLSX,
  exportMonthlyStatsToPDF 
} from '../../utils/exportUtils';
import { 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Filter,
  Layers,
  ChevronDown,
  FileDown,
  Loader2
} from 'lucide-react';

interface Props {
  onOpenPrintReport?: (mode: 'monthly') => void;
}

export const MonthlyStatsTable: React.FC<Props> = ({ onOpenPrintReport }) => {
  const { monthlyStats } = useDatabase();
  const { t, language, tMonth } = useLanguage();
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Filtered stats
  const filteredStats = useMemo(() => {
    if (selectedSeason === 'all') return monthlyStats;
    if (selectedSeason === '2025') return monthlyStats.filter(s => s.monthCode.startsWith('2025'));
    if (selectedSeason === '2026') return monthlyStats.filter(s => s.monthCode.startsWith('2026'));
    return monthlyStats;
  }, [monthlyStats, selectedSeason]);

  // Aggregate metrics
  const totals = useMemo(() => {
    let reports = 0;
    let affected = 0;
    let treated = 0;
    let outbreaks = 0;

    filteredStats.forEach(s => {
      reports += s.newReportsCount;
      affected += s.affectedFeddans;
      treated += s.treatedFeddans;
      outbreaks += s.activeOutbreaks;
    });

    const efficiency = affected > 0 ? ((treated / affected) * 100).toFixed(1) : '100';

    return {
      reports,
      affected,
      treated,
      outbreaks,
      efficiency
    };
  }, [filteredStats]);

  const handleExportCSV = () => {
    exportMonthlyStatsToCSV(filteredStats);
    setExportDropdownOpen(false);
  };

  const handleExportXLSX = () => {
    exportMonthlyStatsToXLSX(filteredStats);
    setExportDropdownOpen(false);
  };

  const handleDownloadDirectPDF = async () => {
    setExportDropdownOpen(false);
    setIsExportingPDF(true);
    try {
      const title = selectedSeason === 'all' 
        ? (language === 'ar' ? 'بيان دوري شامل لكافة المواسم المسجلة بالمنظومة' : 'Comprehensive Multi-Season Phytosanitary Monthly Registry')
        : (language === 'ar' ? `بيان دوري لإحصائيات موسم ${selectedSeason}` : `Phytosanitary Monthly Registry - Season ${selectedSeason}`);
      await exportMonthlyStatsToPDF(filteredStats, title);
    } catch (error) {
      console.error('Failed to export Monthly Stats PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrintPDF = () => {
    setExportDropdownOpen(false);
    if (onOpenPrintReport) {
      onOpenPrintReport('monthly');
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header with Controls & Export Menu */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {t.monthly.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.monthly.subtitle}
          </p>
        </div>

        {/* Filter and Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Season / Year Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'ar' ? 'الفترة:' : 'Season:'}</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent border-none text-slate-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">{language === 'ar' ? `كافة المواسم (${monthlyStats.length} أشهر)` : `All Seasons (${monthlyStats.length} mos)`}</option>
              <option value="2026">{language === 'ar' ? 'موسم 2026' : 'Season 2026'}</option>
              <option value="2025">{language === 'ar' ? 'موسم 2025' : 'Season 2025'}</option>
            </select>
          </div>

          {/* Direct Formatted PDF Button */}
          <button
            id="export-monthly-pdf-btn"
            onClick={handleDownloadDirectPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 border border-rose-200 rounded-xl transition cursor-pointer shadow-2xs"
            title={language === 'ar' ? 'تصدير وثيقة رسمية بصيغة PDF مباشرة باستخدام jsPDF للتقديم والاعتماد' : 'Export official PDF document for regulatory submission'}
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-rose-600" />
            )}
            <span>{isExportingPDF ? (language === 'ar' ? 'جارٍ توليد PDF...' : 'Generating PDF...') : (language === 'ar' ? 'تحميل وثيقة PDF' : 'Download PDF')}</span>
          </button>

          {/* Quick Direct Buttons for Excel, CSV, and Modal Print */}
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
            title={language === 'ar' ? 'تصدير جدول الإحصائيات الشهرية بتنسيق Microsoft Excel' : 'Export monthly statistics as Excel'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
            title={language === 'ar' ? 'تصدير جدول الإحصائيات بتنسيق CSV المتوافق' : 'Export monthly statistics as CSV'}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition cursor-pointer"
            title={language === 'ar' ? 'عرض مركز التوثيق والطباعة الرسمي' : 'Open Official Reporting & Print Center'}
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'مركز التقارير' : 'Report Center'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:px-6 bg-slate-50/80 border-b border-slate-100 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block">{t.monthly.summaryTotalReports}</span>
            <span className="text-base font-extrabold text-slate-900">{totals.reports}</span>
            <span className="text-[10px] text-slate-400 mx-1">{language === 'ar' ? 'بلاغاً معتمداً' : 'records'}</span>
          </div>
          <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Layers className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block">{t.monthly.summaryTotalAffected}</span>
            <span className="text-base font-extrabold text-rose-700">{totals.affected}</span>
            <span className="text-[10px] text-slate-400 mx-1">{t.common.feddans}</span>
          </div>
          <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block">{t.monthly.summaryTotalTreated}</span>
            <span className="text-base font-extrabold text-emerald-700">{totals.treated}</span>
            <span className="text-[10px] text-slate-400 mx-1">{t.common.feddans}</span>
          </div>
          <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block">{t.monthly.summaryAvgEfficiency}</span>
            <span className="text-base font-extrabold text-blue-700">{totals.efficiency}%</span>
            <span className="text-[10px] text-slate-400 mx-1">{language === 'ar' ? 'معدل تطهير' : 'clearance'}</span>
          </div>
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Main Table Structure */}
      <div className="overflow-x-auto">
        <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse`}>
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold border-b border-slate-200">
              <th className="py-3 px-4">{t.monthly.colMonth}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'كود الفترة' : 'Code'}</th>
              <th className="py-3 px-4 text-center">{t.monthly.colReports}</th>
              <th className="py-3 px-4">{t.monthly.colAffected}</th>
              <th className="py-3 px-4">{t.monthly.colTreated}</th>
              <th className="py-3 px-4">{t.monthly.colEfficiency}</th>
              <th className="py-3 px-4 text-center">{t.monthly.colOutbreaks}</th>
              <th className="py-3 px-4">{t.monthly.colStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredStats.map((stat) => {
              const rate = stat.affectedFeddans > 0 
                ? Number(((stat.treatedFeddans / stat.affectedFeddans) * 100).toFixed(1))
                : 100;

              const isHighOutbreak = stat.activeOutbreaks >= 8;
              const isModerateOutbreak = stat.activeOutbreaks >= 4 && stat.activeOutbreaks < 8;

              return (
                <tr key={stat.monthCode} className="hover:bg-slate-50/80 transition group">
                  {/* Month */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span className="font-bold text-slate-900">{language === 'ar' ? stat.month : tMonth(stat.month)}</span>
                    </div>
                  </td>

                  {/* Month Code */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    {stat.monthCode}
                  </td>

                  {/* Reports Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800 text-xs">
                      {stat.newReportsCount}
                    </span>
                  </td>

                  {/* Affected Area */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-rose-700">
                      {language === 'ar' ? stat.affectedFeddans.toLocaleString('ar-EG') : stat.affectedFeddans.toLocaleString('en-US')} {t.common.feddans}
                    </span>
                  </td>

                  {/* Treated Area */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-emerald-700">
                      {language === 'ar' ? stat.treatedFeddans.toLocaleString('ar-EG') : stat.treatedFeddans.toLocaleString('en-US')} {t.common.feddans}
                    </span>
                  </td>

                  {/* Containment Efficiency */}
                  <td className="py-3.5 px-4">
                    <div className="w-40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{rate}%</span>
                        <span className="text-[10px] text-slate-400">
                          {rate >= 90 ? (language === 'ar' ? 'ممتاز' : 'Excellent') : rate >= 80 ? (language === 'ar' ? 'جيد جداً' : 'Very Good') : (language === 'ar' ? 'متوسط' : 'Moderate')}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            rate >= 90 ? 'bg-emerald-500' : rate >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Active Outbreaks */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isHighOutbreak 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : isModerateOutbreak
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isHighOutbreak ? 'bg-rose-600 animate-pulse' : isModerateOutbreak ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}></span>
                      {stat.activeOutbreaks} {language === 'ar' ? 'بؤر' : 'nodes'}
                    </span>
                  </td>

                  {/* Epidemiological Status */}
                  <td className="py-3.5 px-4 text-xs">
                    {isHighOutbreak ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {t.monthly.statusHighAlert}
                      </span>
                    ) : isModerateOutbreak ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        {language === 'ar' ? 'بؤر قيد الحصار والسيطرة' : 'Under containment protocols'}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {t.monthly.statusStable}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Totals Row */}
          <tfoot>
            <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-200 text-xs">
              <td className="py-3 px-4" colSpan={2}>
                {language === 'ar' ? `المجموع العام المعتمد (${filteredStats.length} فترات زمنية)` : `Certified Total Summary (${filteredStats.length} periods)`}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300">
                  {totals.reports} {language === 'ar' ? 'بلاغ' : 'reports'}
                </span>
              </td>
              <td className="py-3 px-4 text-rose-700">
                {language === 'ar' ? totals.affected.toLocaleString('ar-EG') : totals.affected.toLocaleString('en-US')} {t.common.feddans}
              </td>
              <td className="py-3 px-4 text-emerald-700">
                {language === 'ar' ? totals.treated.toLocaleString('ar-EG') : totals.treated.toLocaleString('en-US')} {t.common.feddans}
              </td>
              <td className="py-3 px-4 text-blue-800">
                {language === 'ar' ? 'متوسط الإنجاز:' : 'Avg Rate:'} {totals.efficiency}%
              </td>
              <td className="py-3 px-4 text-center">
                {totals.outbreaks} {language === 'ar' ? 'بؤرة إجمالية' : 'total hotspots'}
              </td>
              <td className="py-3 px-4 text-slate-600 font-medium">
                {language === 'ar' ? 'معتمد رسمياً من الإدارة المركزية للحجر الزراعي' : 'CAPQ Phytosanitary Directorate Certified'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
