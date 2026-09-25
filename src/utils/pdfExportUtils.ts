import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Pest, MonthlyStat, InfestationReport, Location } from '../types';

/**
 * Capture an HTMLElement and download it as an official multi-page A4 PDF using jsPDF
 */
export async function exportElementToPDF(
  element: HTMLElement,
  filename: string,
  title?: string
): Promise<void> {
  // Save current scroll position
  const originalScrollY = window.scrollY;
  window.scrollTo(0, 0);

  // Wait for fonts to be ready if supported
  if (typeof document !== 'undefined' && 'fonts' in document && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed if font loading promise fails
    }
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp printing
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth || 1200
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Available height per page in mm (leaving room for margins and footer)
    const pageContentHeight = pageHeight - (margin * 2);

    if (contentHeight <= pageContentHeight) {
      // Single page document
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    } else {
      // Multi-page document: slice canvas vertically
      const totalPages = Math.ceil(contentHeight / pageContentHeight);
      const canvasPageHeight = (canvas.width * pageContentHeight) / contentWidth;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        // The slice height is either full page or remaining height
        const remainingCanvasHeight = canvas.height - (page * canvasPageHeight);
        const currentSliceHeight = Math.min(canvasPageHeight, remainingCanvasHeight);
        pageCanvas.height = currentSliceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0, page * canvasPageHeight, canvas.width, currentSliceHeight,
            0, 0, canvas.width, currentSliceHeight
          );

          const pageSliceData = pageCanvas.toDataURL('image/jpeg', 0.95);
          const currentPdfHeight = (currentSliceHeight * contentWidth) / canvas.width;
          pdf.addImage(pageSliceData, 'JPEG', margin, margin, contentWidth, currentPdfHeight);
        }

        // Add footer page number
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `وثيقة رسمية - الإدارة المركزية للحجر الزراعي | صفحة ${page + 1} من ${totalPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
    }

    pdf.save(filename);
  } finally {
    window.scrollTo(0, originalScrollY);
  }
}

/**
 * Generate and download an official PDF of the Monthly Statistics
 */
export async function exportMonthlyStatsToPDF(
  stats: MonthlyStat[],
  seasonTitle?: string
): Promise<void> {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let totalReports = 0;
  let totalAffected = 0;
  let totalTreated = 0;
  let totalOutbreaks = 0;

  stats.forEach(s => {
    totalReports += s.newReportsCount;
    totalAffected += s.affectedFeddans;
    totalTreated += s.treatedFeddans;
    totalOutbreaks += s.activeOutbreaks;
  });

  const avgEfficiency = totalAffected > 0 
    ? ((totalTreated / totalAffected) * 100).toFixed(1)
    : '100';

  // Create temporary offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.width = '1100px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '40px 50px';
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.direction = 'rtl';
  container.style.color = '#0f172a';
  container.style.zIndex = '-1000';

  container.innerHTML = `
    <!-- Header -->
    <div style="border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; font-size: 11px; color: #475569;">
        <div style="text-align: right; line-height: 1.6;">
          <strong style="color: #065f46; font-size: 13px;">جمهورية مصر العربية</strong><br />
          وزارة الزراعة واستصلاح الأراضي<br />
          الإدارة المركزية للحجر الزراعي (CAPQ)
        </div>
        <div style="text-align: center;">
          <div style="font-size: 14px; font-weight: 800; color: #064e3b;">منظومة الرصد والتتبع الوبائي والحجري للآفات الزراعية</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">معتمدة وفق معايير الاتفاقية الدولية لوقاية النباتات (IPPC / FAO)</div>
        </div>
        <div style="text-align: left; line-height: 1.6;">
          التاريخ: <strong>${today}</strong><br />
          المرجع: <strong>CAPQ-STAT-MONTHLY-2026</strong><br />
          درجة السرية: <strong>وثيقة رسمية معتمدة</strong>
        </div>
      </div>

      <div style="text-align: center; margin-top: 10px;">
        <h1 style="font-size: 22px; font-weight: 900; color: #064e3b; margin: 0 0 6px 0;">
          التقرير الإحصائي الشهري لعمليات الرصد والمكافحة وتطهير البؤر الحجرية
        </h1>
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          ${seasonTitle || 'بيان دوري مقارن للمساحات المتضررة والمساحات المعالجة وكفاءة أعمال الحصار الحجري بكافة المحافظات'}
        </p>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; text-align: center;">
      <div style="padding: 14px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px;">
        <div style="font-size: 11px; color: #64748b;">إجمالي بلاغات الرصد</div>
        <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${totalReports.toLocaleString('ar-EG')}</div>
        <div style="font-size: 10px; color: #64748b;">إشعاراً ميدانياً</div>
      </div>
      <div style="padding: 14px; border: 1px solid #fecdd3; background: #fff1f2; border-radius: 12px;">
        <div style="font-size: 11px; color: #9f1239; font-weight: 600;">المساحة المتضررة الكلية</div>
        <div style="font-size: 22px; font-weight: 900; color: #be123c; margin-top: 4px;">${totalAffected.toLocaleString('ar-EG')}</div>
        <div style="font-size: 10px; color: #be123c;">فدان مستهدف</div>
      </div>
      <div style="padding: 14px; border: 1px solid #a7f3d0; background: #ecfdf5; border-radius: 12px;">
        <div style="font-size: 11px; color: #065f46; font-weight: 600;">المساحة المعالجة والمكافحة</div>
        <div style="font-size: 22px; font-weight: 900; color: #047857; margin-top: 4px;">${totalTreated.toLocaleString('ar-EG')}</div>
        <div style="font-size: 10px; color: #047857;">فدان تم تطهيره بنجاح</div>
      </div>
      <div style="padding: 14px; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 12px;">
        <div style="font-size: 11px; color: #1e40af; font-weight: 600;">متوسط نسبة كفاءة الاحتواء</div>
        <div style="font-size: 22px; font-weight: 900; color: #1d4ed8; margin-top: 4px;">${avgEfficiency}%</div>
        <div style="font-size: 10px; color: #1d4ed8;">معدل نجاح العمليات</div>
      </div>
    </div>

    <!-- Main Statistics Table -->
    <div style="margin-bottom: 26px;">
      <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px; border-right: 4px solid #065f46; padding-right: 8px;">
        بيانات الرصد الميداني والمساحات المحصورة والمعالجة شهرياً
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
        <thead>
          <tr style="background: #f1f5f9; color: #1e293b; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; width: 35px; text-align: center;">م</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0;">الشهر والسنة</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; text-align: center;">كود الفترة</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; text-align: center;">بلاغات الرصد</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; text-align: left;">المساحة المتضررة (فدان)</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; text-align: left;">المساحة المعالجة (فدان)</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; text-align: center;">نسبة الإنجاز</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0; text-align: center;">البؤر النشطة</th>
            <th style="padding: 9px 8px; border: 1px solid #e2e8f0;">تقييم الوضع الحجري</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map((stat, idx) => {
            const rate = stat.affectedFeddans > 0 
              ? ((stat.treatedFeddans / stat.affectedFeddans) * 100).toFixed(1)
              : '100';
            const statusText = stat.activeOutbreaks >= 8 
              ? 'حصار موسمي مكثف' 
              : stat.activeOutbreaks >= 4 
                ? 'بؤر قيد السيطرة' 
                : 'وضع آمن ومستقر';
            const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            return `
              <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${stat.month}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">${stat.monthCode}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${stat.newReportsCount}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; color: #be123c; font-weight: 600;">${stat.affectedFeddans.toLocaleString('ar-EG')}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; color: #047857; font-weight: 600;">${stat.treatedFeddans.toLocaleString('ar-EG')}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 800; color: #1d4ed8;">${rate}%</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px; background: ${stat.activeOutbreaks >= 8 ? '#ffe4e6; color: #9f1239;' : '#f1f5f9; color: #334155;'}">
                    ${stat.activeOutbreaks}
                  </span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px; color: #334155;">${statusText}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
            <td colspan="3" style="padding: 9px 8px; border: 1px solid #cbd5e1; text-align: center; color: #0f172a;">الإجمالي العام للفترة (${stats.length} أشهر)</td>
            <td style="padding: 9px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900;">${totalReports.toLocaleString('ar-EG')}</td>
            <td style="padding: 9px 8px; border: 1px solid #cbd5e1; text-align: left; color: #be123c; font-weight: 900;">${totalAffected.toLocaleString('ar-EG')} فدان</td>
            <td style="padding: 9px 8px; border: 1px solid #cbd5e1; text-align: left; color: #047857; font-weight: 900;">${totalTreated.toLocaleString('ar-EG')} فدان</td>
            <td style="padding: 9px 8px; border: 1px solid #cbd5e1; text-align: center; color: #1d4ed8; font-weight: 900;">${avgEfficiency}%</td>
            <td style="padding: 9px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900;">${totalOutbreaks}</td>
            <td style="padding: 9px 8px; border: 1px solid #cbd5e1; color: #065f46; font-size: 10px;">بيانات معتمدة رسمياً</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Official Certification & Signature Block -->
    <div style="margin-top: 30px; border-top: 2px solid #cbd5e1; padding-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; font-size: 11px;">
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">مسؤول الإحصاء ونظم المعلومات</div>
        <div style="font-weight: bold;">التوقيع: ............................</div>
      </div>
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">مدير عام الإدارة العامة للمكافحة</div>
        <div style="font-weight: bold;">التوقيع والختم: ............................</div>
      </div>
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">رئيس الإدارة المركزية للحجر الزراعي</div>
        <div style="font-weight: bold; color: #064e3b;">يعتمد رسمياً: ............................</div>
      </div>
    </div>

    <!-- Footer Security Note -->
    <div style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 9px; color: #94a3b8;">
      هذا التقرير صادر إلكترونياً عن منظومة حصر وتتبع الآفات الحجرية والزراعية المصرية (CAPQ) ومعتمد بموجب التشريعات الزراعية والتصديرية.
    </div>
  `;

  document.body.appendChild(container);

  try {
    const todayIso = new Date().toISOString().split('T')[0];
    await exportElementToPDF(
      container,
      `التقرير_الإحصائي_الشهري_CAPQ_${todayIso}.pdf`,
      'التقرير الإحصائي الشهري'
    );
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generate and download an official PDF of the Pest Inventory
 */
export async function exportPestsToPDF(pests: Pest[]): Promise<void> {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const a1Count = pests.filter(p => p.quarantineCategory?.includes('أ1')).length;
  const a2Count = pests.filter(p => p.quarantineCategory?.includes('أ2')).length;
  const rnqpCount = pests.filter(p => p.quarantineCategory?.includes('RNQP')).length;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.width = '1100px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '40px 50px';
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.direction = 'rtl';
  container.style.color = '#0f172a';
  container.style.zIndex = '-1000';

  container.innerHTML = `
    <!-- Header -->
    <div style="border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; font-size: 11px; color: #475569;">
        <div style="text-align: right; line-height: 1.6;">
          <strong style="color: #065f46; font-size: 13px;">جمهورية مصر العربية</strong><br />
          وزارة الزراعة واستصلاح الأراضي<br />
          الإدارة المركزية للحجر الزراعي (CAPQ)
        </div>
        <div style="text-align: center;">
          <div style="font-size: 14px; font-weight: 800; color: #064e3b;">السجل الرسمي المعتمد لحصر وتصنيف الآفات</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">وفق معايير منظمة الأغذية والزراعة (FAO) والاتفاقية الدولية لوقاية النباتات (IPPC)</div>
        </div>
        <div style="text-align: left; line-height: 1.6;">
          التاريخ: <strong>${today}</strong><br />
          المرجع: <strong>CAPQ-INV-PESTS-2026</strong><br />
          درجة السرية: <strong>سجل رسمي دائم</strong>
        </div>
      </div>

      <div style="text-align: center; margin-top: 10px;">
        <h1 style="font-size: 22px; font-weight: 900; color: #064e3b; margin: 0 0 6px 0;">
          السجل الرسمي لحصر الآفات الزراعية والحجرية والكائنات الممرضة
        </h1>
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          بيان تفصيلي بأسماء وتصنيفات ومحاصيل العوائل ودرجات خطورة الآفات المسجلة بالقطاع الزراعي المصري
        </p>
      </div>
    </div>

    <!-- Inventory KPIs -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; text-align: center;">
      <div style="padding: 14px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px;">
        <div style="font-size: 11px; color: #64748b;">إجمالي الآفات المسجلة</div>
        <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${pests.length}</div>
        <div style="font-size: 10px; color: #64748b;">نوعاً وكائناً ممرضاً</div>
      </div>
      <div style="padding: 14px; border: 1px solid #fecdd3; background: #fff1f2; border-radius: 12px;">
        <div style="font-size: 11px; color: #9f1239; font-weight: 600;">آفات حجرية أ1 (محظورة)</div>
        <div style="font-size: 22px; font-weight: 900; color: #be123c; margin-top: 4px;">${a1Count}</div>
        <div style="font-size: 10px; color: #be123c;">محظورة تماماً من الدخول</div>
      </div>
      <div style="padding: 14px; border: 1px solid #fde68a; background: #fffbeb; border-radius: 12px;">
        <div style="font-size: 11px; color: #92400e; font-weight: 600;">آفات حجرية أ2 (حصار)</div>
        <div style="font-size: 22px; font-weight: 900; color: #b45309; margin-top: 4px;">${a2Count}</div>
        <div style="font-size: 10px; color: #b45309;">محدودة الانتشار قيد المراقبة</div>
      </div>
      <div style="padding: 14px; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 12px;">
        <div style="font-size: 11px; color: #1e40af; font-weight: 600;">آفات غير حجرية خاضعة للوائح (RNQP)</div>
        <div style="font-size: 22px; font-weight: 900; color: #1d4ed8; margin-top: 4px;">${rnqpCount}</div>
        <div style="font-size: 10px; color: #1d4ed8;">خاضعة لإشراف التقاوي</div>
      </div>
    </div>

    <!-- Pests Table -->
    <div style="margin-bottom: 26px;">
      <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px; border-right: 4px solid #065f46; padding-right: 8px;">
        جدول حصر الكائنات الممرضة والآفات المصنفة
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
        <thead>
          <tr style="background: #f1f5f9; color: #1e293b; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 8px; border: 1px solid #e2e8f0; width: 35px; text-align: center;">م</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; width: 70px;">الكود</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">الاسم الشائع</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">الاسم العلمي</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">النوع</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">التصنيف الحجري</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">المحاصيل العائلة المستهدفة</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">درجة الخطورة</th>
          </tr>
        </thead>
        <tbody>
          ${pests.map((pest, idx) => {
            const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            const riskColor = pest.riskLevel === 'حرج جداً' 
              ? '#ffe4e6; color: #9f1239;' 
              : pest.riskLevel === 'مرتفع' 
                ? '#fef3c7; color: #92400e;' 
                : '#dcfce7; color: #166534;';

            return `
              <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #065f46;">${pest.id}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${pest.commonName}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-style: italic; font-family: monospace; color: #475569;">${pest.scientificName}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="padding: 2px 6px; background: #f1f5f9; border-radius: 4px; font-size: 10px;">${pest.type}</span>
                </td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-size: 10px; font-weight: 600;">${pest.quarantineCategory}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-size: 10px; color: #475569;">${pest.primaryHostCrops.join('، ')}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; background: ${riskColor}">
                    ${pest.riskLevel}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Signatures -->
    <div style="margin-top: 30px; border-top: 2px solid #cbd5e1; padding-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; font-size: 11px;">
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">مسؤول السجل والتصنيف الحجري</div>
        <div style="font-weight: bold;">التوقيع: ............................</div>
      </div>
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">مدير المعامل المركزية وبحوث الوقاية</div>
        <div style="font-weight: bold;">التوقيع والختم: ............................</div>
      </div>
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">رئيس الإدارة المركزية للحجر الزراعي</div>
        <div style="font-weight: bold; color: #064e3b;">يعتمد رسمياً: ............................</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const todayIso = new Date().toISOString().split('T')[0];
    await exportElementToPDF(
      container,
      `سجل_حصر_الآفات_الحجرية_CAPQ_${todayIso}.pdf`,
      'سجل حصر الآفات الحجرية'
    );
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generate and download an official PDF of Field Surveillance Reports
 */
export async function exportReportsToPDF(
  reports: InfestationReport[],
  locations: Location[],
  pests: Pest[]
): Promise<void> {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalArea = reports.reduce((acc, r) => acc + r.affectedAreaFeddans, 0);
  const severeCount = reports.filter(r => r.severity === 'جسيمة').length;
  const mediumCount = reports.filter(r => r.severity === 'متوسطة').length;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.width = '1100px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '40px 50px';
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.direction = 'rtl';
  container.style.color = '#0f172a';
  container.style.zIndex = '-1000';

  container.innerHTML = `
    <!-- Header -->
    <div style="border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; font-size: 11px; color: #475569;">
        <div style="text-align: right; line-height: 1.6;">
          <strong style="color: #065f46; font-size: 13px;">جمهورية مصر العربية</strong><br />
          وزارة الزراعة واستصلاح الأراضي<br />
          الإدارة المركزية للحجر الزراعي (CAPQ)
        </div>
        <div style="text-align: center;">
          <div style="font-size: 14px; font-weight: 800; color: #064e3b;">سجل بلاغات وتقارير الرصد الميداني للبؤر الحجرية</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">توثيق الرصد الميداني وإجراءات الحصار والتطهير الزراعي</div>
        </div>
        <div style="text-align: left; line-height: 1.6;">
          التاريخ: <strong>${today}</strong><br />
          المرجع: <strong>CAPQ-REP-FIELD-2026</strong><br />
          درجة السرية: <strong>وثيقة رسمية معتمدة</strong>
        </div>
      </div>

      <div style="text-align: center; margin-top: 10px;">
        <h1 style="font-size: 22px; font-weight: 900; color: #064e3b; margin: 0 0 6px 0;">
          سجل تقارير الرصد الميداني للبؤر والإصابات الحجرية
        </h1>
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          بيان معتمد بكافة البلاغات الميدانية والمواقع الجغرافية ونسب الإصابة وإجراءات المكافحة المتخذة
        </p>
      </div>
    </div>

    <!-- Reports KPIs -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; text-align: center;">
      <div style="padding: 14px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px;">
        <div style="font-size: 11px; color: #64748b;">إجمالي البلاغات المسجلة</div>
        <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${reports.length}</div>
        <div style="font-size: 10px; color: #64748b;">تقرير حقل معتمد</div>
      </div>
      <div style="padding: 14px; border: 1px solid #fecdd3; background: #fff1f2; border-radius: 12px;">
        <div style="font-size: 11px; color: #9f1239; font-weight: 600;">المساحة الإجمالية المتضررة</div>
        <div style="font-size: 22px; font-weight: 900; color: #be123c; margin-top: 4px;">${totalArea.toFixed(1)}</div>
        <div style="font-size: 10px; color: #be123c;">فدان متأثر بالإصابة</div>
      </div>
      <div style="padding: 14px; border: 1px solid #fde68a; background: #fffbeb; border-radius: 12px;">
        <div style="font-size: 11px; color: #92400e; font-weight: 600;">إصابات جسيمة (بؤر حجرية)</div>
        <div style="font-size: 22px; font-weight: 900; color: #b45309; margin-top: 4px;">${severeCount}</div>
        <div style="font-size: 10px; color: #b45309;">تتطلب تدخلاً فورياً</div>
      </div>
      <div style="padding: 14px; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 12px;">
        <div style="font-size: 11px; color: #1e40af; font-weight: 600;">إصابات متوسطة وخفيفة</div>
        <div style="font-size: 22px; font-weight: 900; color: #1d4ed8; margin-top: 4px;">${mediumCount}</div>
        <div style="font-size: 10px; color: #1d4ed8;">تحت بروتوكول المكافحة</div>
      </div>
    </div>

    <!-- Reports Table -->
    <div style="margin-bottom: 26px;">
      <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px; border-right: 4px solid #065f46; padding-right: 8px;">
        جدول تفاصيل بلاغات الرصد الميداني
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
        <thead>
          <tr style="background: #f1f5f9; color: #1e293b; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 8px; border: 1px solid #e2e8f0; width: 35px; text-align: center;">م</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; width: 75px;">رقم البلاغ</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">الموقع (المحافظة / المركز)</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">الآفة المكتشفة</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">المحصول</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">تاريخ الرصد</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">الشدة</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">المساحة (فدان)</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">مكان الإصابة</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">مفتش الرصد</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map((r, idx) => {
            const loc = locations.find(l => l.id === r.locationId);
            const pest = pests.find(p => p.id === r.pestId);
            const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            const severityStyle = r.severity === 'جسيمة' 
              ? 'background: #ffe4e6; color: #9f1239;' 
              : r.severity === 'متوسطة' 
                ? 'background: #fef3c7; color: #92400e;' 
                : 'background: #dcfce7; color: #166534;';

            return `
              <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #065f46;">${r.id}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${loc ? `${loc.governorate} — ${loc.markaz}` : r.locationId}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; color: #064e3b; font-weight: 600;">${pest ? pest.commonName : r.pestId}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-weight: 600;">${r.crop}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">${r.detectionDate}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; ${severityStyle}">
                    ${r.severity}
                  </span>
                </td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #be123c;">${r.affectedAreaFeddans}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-size: 10px;">${r.infestationSite}</td>
                <td style="padding: 7px 8px; border: 1px solid #e2e8f0; font-size: 10px; color: #475569;">${r.sampleInspector}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Signatures -->
    <div style="margin-top: 30px; border-top: 2px solid #cbd5e1; padding-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; font-size: 11px;">
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">مهندس الرصد والإنذار المبكر</div>
        <div style="font-weight: bold;">التوقيع: ............................</div>
      </div>
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">مدير إدارة الحجر الزراعي بالمنطقة</div>
        <div style="font-weight: bold;">التوقيع والختم: ............................</div>
      </div>
      <div>
        <div style="color: #64748b; margin-bottom: 35px;">رئيس الإدارة المركزية للحجر الزراعي</div>
        <div style="font-weight: bold; color: #064e3b;">يعتمد رسمياً: ............................</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const todayIso = new Date().toISOString().split('T')[0];
    await exportElementToPDF(
      container,
      `سجل_بلاغات_الرصد_الميداني_CAPQ_${todayIso}.pdf`,
      'سجل بلاغات الرصد الميداني'
    );
  } finally {
    document.body.removeChild(container);
  }
}
