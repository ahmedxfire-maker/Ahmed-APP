import * as XLSX from 'xlsx';
import { Pest, MonthlyStat } from '../types';

/**
 * Utility to download generated CSV string
 */
function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV fields properly
 */
function escapeCSV(field: string | number | undefined | null): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * 1. Export Pest Inventory to CSV
 */
export function exportPestsToCSV(pests: Pest[]) {
  const headers = [
    'معرف الآفة',
    'الاسم الشائع',
    'الاسم العلمي',
    'نوع الآفة',
    'التصنيف الحجري الدولي',
    'المحاصيل العائلة الرئيسية',
    'درجة الخطورة',
    'الوصف والأعراض التشخيصية'
  ];

  const rows = pests.map(p => [
    escapeCSV(p.id),
    escapeCSV(p.commonName),
    escapeCSV(p.scientificName),
    escapeCSV(p.type),
    escapeCSV(p.quarantineCategory),
    escapeCSV(p.primaryHostCrops.join('، ')),
    escapeCSV(p.riskLevel),
    escapeCSV(p.description)
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const today = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `حصر_الآفات_الزراعية_والحجرية_المصرية_${today}.csv`);
}

/**
 * 2. Export Pest Inventory to XLSX
 */
export function exportPestsToXLSX(pests: Pest[]) {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build sheet rows with official header
  const titleRows = [
    ['جمهورية مصر العربية - وزارة الزراعة واستصلاح الأراضي - الإدارة المركزية للحجر الزراعي (CAPQ)'],
    ['السجل الرسمي المعتمد لحصر الآفات الزراعية والحجرية والكائنات الممرضة'],
    [`تاريخ الاستخراج: ${today} | الرقم المرجعي: CAPQ-PEST-INV-2026`],
    [''] // Blank row
  ];

  const tableHeaders = [
    'م',
    'معرف الآفة',
    'الاسم الشائع',
    'الاسم العلمي (Scientific Name)',
    'نوع الآفة',
    'التصنيف الحجري',
    'المحاصيل العائلة المستهدفة',
    'درجة الخطورة',
    'الوصف والأعراض التشخيصية'
  ];

  const dataRows = pests.map((p, index) => [
    index + 1,
    p.id,
    p.commonName,
    p.scientificName,
    p.type,
    p.quarantineCategory,
    p.primaryHostCrops.join('، '),
    p.riskLevel,
    p.description
  ]);

  const summaryRow = [
    'الإجمالي',
    `${pests.length} آفة مسجلة`,
    '',
    '',
    '',
    '',
    '',
    '',
    'وثيقة رسمية صادرة عن منظومة الحجر الزراعي المصري'
  ];

  const sheetData = [...titleRows, tableHeaders, ...dataRows, [''], summaryRow];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // م
    { wch: 14 }, // معرف الآفة
    { wch: 28 }, // الاسم الشائع
    { wch: 30 }, // الاسم العلمي
    { wch: 14 }, // نوع الآفة
    { wch: 36 }, // التصنيف الحجري
    { wch: 32 }, // المحاصيل
    { wch: 14 }, // درجة الخطورة
    { wch: 55 }  // الوصف
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'سجل الآفات الحجرية');

  const todayIso = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `سجل_حصر_الآفات_الحجرية_${todayIso}.xlsx`);
}

/**
 * 3. Export Monthly Statistics to CSV
 */
export function exportMonthlyStatsToCSV(monthlyStats: MonthlyStat[]) {
  const headers = [
    'الشهر والسنة',
    'كود الشهر',
    'عدد بلاغات الرصد الميداني',
    'إجمالي المساحة المتضررة (فدان)',
    'المساحة المعالجة والمكافحة (فدان)',
    'نسبة كفاءة الاحتواء (%)',
    'عدد البؤر الحجرية النشطة',
    'مؤشر الحالة الوبائية'
  ];

  let totalReports = 0;
  let totalAffected = 0;
  let totalTreated = 0;
  let totalOutbreaks = 0;

  const rows = monthlyStats.map(stat => {
    totalReports += stat.newReportsCount;
    totalAffected += stat.affectedFeddans;
    totalTreated += stat.treatedFeddans;
    totalOutbreaks += stat.activeOutbreaks;

    const rate = stat.affectedFeddans > 0 
      ? ((stat.treatedFeddans / stat.affectedFeddans) * 100).toFixed(1) + '%'
      : '100%';

    const status = stat.activeOutbreaks > 7 
      ? 'انتشار نشط تحت الحصار' 
      : stat.activeOutbreaks > 3 
        ? 'بؤر محدودة قيد المعالجة' 
        : 'مستقر وآمن';

    return [
      escapeCSV(stat.month),
      escapeCSV(stat.monthCode),
      escapeCSV(stat.newReportsCount),
      escapeCSV(stat.affectedFeddans),
      escapeCSV(stat.treatedFeddans),
      escapeCSV(rate),
      escapeCSV(stat.activeOutbreaks),
      escapeCSV(status)
    ];
  });

  const avgRate = totalAffected > 0 
    ? ((totalTreated / totalAffected) * 100).toFixed(1) + '%' 
    : '0%';

  const summaryRow = [
    escapeCSV('الإجمالي العام'),
    escapeCSV('-'),
    escapeCSV(totalReports),
    escapeCSV(totalAffected),
    escapeCSV(totalTreated),
    escapeCSV(avgRate),
    escapeCSV(totalOutbreaks),
    escapeCSV('معتمد رسمياً')
  ];

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(',')),
    summaryRow.join(',')
  ].join('\r\n');

  const today = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `الإحصائيات_الشهرية_للرصد_والمكافحة_${today}.csv`);
}

/**
 * 4. Export Monthly Statistics to XLSX
 */
export function exportMonthlyStatsToXLSX(monthlyStats: MonthlyStat[]) {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const titleRows = [
    ['جمهورية مصر العربية - وزارة الزراعة واستصلاح الأراضي - الإدارة المركزية للحجر الزراعي (CAPQ)'],
    ['التقرير الإحصائي الشهري لعمليات الرصد والمكافحة واحتواء البؤر الحجرية'],
    [`تاريخ الاستخراج: ${today} | الرقم المرجعي: CAPQ-STAT-MONTHLY-2026`],
    [''] // Blank row
  ];

  const tableHeaders = [
    'م',
    'الشهر والسنة',
    'كود الفترة',
    'عدد بلاغات الرصد',
    'المساحة المتضررة (فدان)',
    'المساحة المعالجة والمكافحة (فدان)',
    'نسبة كفاءة الاحتواء (%)',
    'البؤر الحجرية النشطة',
    'التقييم الوبائي للقطاع'
  ];

  let totalReports = 0;
  let totalAffected = 0;
  let totalTreated = 0;
  let totalOutbreaks = 0;

  const dataRows = monthlyStats.map((stat, idx) => {
    totalReports += stat.newReportsCount;
    totalAffected += stat.affectedFeddans;
    totalTreated += stat.treatedFeddans;
    totalOutbreaks += stat.activeOutbreaks;

    const rate = stat.affectedFeddans > 0 
      ? Number(((stat.treatedFeddans / stat.affectedFeddans) * 100).toFixed(1))
      : 100;

    const status = stat.activeOutbreaks > 7 
      ? 'انتشار موسمي مكثف - تحت الحصار' 
      : stat.activeOutbreaks > 3 
        ? 'بؤر متوسطة قيد المعالجة' 
        : 'استقرار وبائي ومؤشرات آمنة';

    return [
      idx + 1,
      stat.month,
      stat.monthCode,
      stat.newReportsCount,
      stat.affectedFeddans,
      stat.treatedFeddans,
      `${rate}%`,
      stat.activeOutbreaks,
      status
    ];
  });

  const avgRate = totalAffected > 0 
    ? ((totalTreated / totalAffected) * 100).toFixed(1) + '%' 
    : '0%';

  const summaryRow = [
    'الإجمالي',
    `الفترة بالكامل (${monthlyStats.length} أشهر)`,
    '-',
    totalReports,
    totalAffected,
    totalTreated,
    avgRate,
    totalOutbreaks,
    'تقرير معتمد من الإدارة المركزية للحجر الزراعي'
  ];

  const sheetData = [...titleRows, tableHeaders, ...dataRows, [''], summaryRow];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 6 },  // م
    { wch: 20 }, // الشهر
    { wch: 14 }, // كود
    { wch: 18 }, // بلاغات
    { wch: 24 }, // متضررة
    { wch: 26 }, // معالجة
    { wch: 20 }, // نسبة
    { wch: 20 }, // بؤر
    { wch: 36 }  // تقييم
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الإحصائيات الشهرية');

  const todayIso = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `الإحصائيات_الشهرية_للرصد_والمكافحة_${todayIso}.xlsx`);
}

/**
 * 5. Re-export Direct Formatted PDF Exports (Powered by jsPDF & html2canvas)
 */
export {
  exportElementToPDF,
  exportMonthlyStatsToPDF,
  exportPestsToPDF,
  exportReportsToPDF
} from './pdfExportUtils';
