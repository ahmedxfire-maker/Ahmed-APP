import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  MapPin, 
  Bug, 
  FileText, 
  ShieldAlert, 
  Printer, 
  PhoneCall, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  ArrowRight, 
  Building2, 
  FileCheck, 
  Leaf, 
  Wheat, 
  Calendar,
  Activity,
  Flame,
  Globe2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ReportPrintMode } from '../Reports/OfficialPrintReport';

interface Props {
  setActiveTab: (tab: string) => void;
  onOpenPrintReport: (mode?: ReportPrintMode) => void;
  onOpenNewReportModal?: () => void;
}

export const PortalHome: React.FC<Props> = ({ setActiveTab, onOpenPrintReport, onOpenNewReportModal }) => {
  const { pests, reports, locationZoneStatuses } = useDatabase();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Key KPI stats
  const totalPests = pests.length;
  const a1Count = pests.filter(p => p.quarantineCategory?.includes('أ1') || p.quarantineCategory?.includes('A1')).length;
  const a2Count = pests.filter(p => p.quarantineCategory?.includes('أ2') || p.quarantineCategory?.includes('A2')).length;
  const pfaCount = locationZoneStatuses.filter(z => z.classification?.includes('PFA') || z.classification?.includes('خالية')).length;
  const activeHotspots = locationZoneStatuses.filter(z => z.classification?.includes('عالية') || z.classification?.includes('بؤرة')).length;
  const totalReports = reports.length;

  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setActiveTab('pests');
  };

  const quickServices = [
    {
      id: 'pests',
      title: t.portal.service1Title,
      desc: t.portal.service1Desc,
      icon: Bug,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200 hover:border-amber-400',
      badge: `${totalPests} آفة مسجلة`,
      badgeEn: `${totalPests} Registered Pests`,
      onClick: () => setActiveTab('pests')
    },
    {
      id: 'dashboard',
      title: t.portal.service2Title,
      desc: t.portal.service2Desc,
      icon: MapPin,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200 hover:border-emerald-400',
      badge: `${activeHotspots} بؤر نشطة`,
      badgeEn: `${activeHotspots} Active Outbreaks`,
      onClick: () => setActiveTab('dashboard')
    },
    {
      id: 'report',
      title: t.portal.service3Title,
      desc: t.portal.service3Desc,
      icon: FileText,
      color: 'from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200 hover:border-blue-400',
      badge: 'بلاغ فوري 24/7',
      badgeEn: 'Instant Report 24/7',
      onClick: () => {
        if (onOpenNewReportModal) {
          onOpenNewReportModal();
        } else {
          setActiveTab('reports');
        }
      }
    },
    {
      id: 'control',
      title: t.portal.service4Title,
      desc: t.portal.service4Desc,
      icon: ShieldAlert,
      color: 'from-purple-500/10 to-indigo-500/10 text-purple-700 border-purple-200 hover:border-purple-400',
      badge: 'دليل المبيدات وPHI',
      badgeEn: 'Pesticides & PHI Guide',
      onClick: () => setActiveTab('control')
    },
    {
      id: 'monthly',
      title: t.portal.service5Title,
      desc: t.portal.service5Desc,
      icon: Calendar,
      color: 'from-sky-500/10 to-blue-500/10 text-sky-700 border-sky-200 hover:border-sky-400',
      badge: 'مؤشرات 2026',
      badgeEn: '2026 Indicators',
      onClick: () => setActiveTab('monthly')
    },
    {
      id: 'print',
      title: t.portal.service6Title,
      desc: t.portal.service6Desc,
      icon: Printer,
      color: 'from-rose-500/10 to-pink-500/10 text-rose-700 border-rose-200 hover:border-rose-400',
      badge: 'وثائق رسمية PDF',
      badgeEn: 'Official PDF Docs',
      onClick: () => onOpenPrintReport('all')
    }
  ];

  const earlyWarnings = [
    {
      pest: language === 'ar' ? 'سوسة النخيل الحمراء' : 'Red Palm Weevil',
      scientific: 'Rhynchophorus ferrugineus',
      zones: language === 'ar' ? 'الواحات البحرية، الوادي الجديد، الجيزة' : 'Bahariya, New Valley, Giza',
      status: language === 'ar' ? 'إنذار مشدد - حقن وعزل فوري' : 'High Alert - Trunk Injection',
      severity: 'high',
      crop: language === 'ar' ? 'نخيل البلح والتمور' : 'Date Palms'
    },
    {
      pest: language === 'ar' ? 'دودة الحشد الخريفية' : 'Fall Armyworm',
      scientific: 'Spodoptera frugiperda',
      zones: language === 'ar' ? 'محافظات الصعيد والدلتا والفيوم' : 'Upper Egypt, Delta, Fayoum',
      status: language === 'ar' ? 'مكافحة فرمونية وبكتيرية نشطة' : 'Pheromone & Biocontrol Active',
      severity: 'high',
      crop: language === 'ar' ? 'الذرة الشامية والرفيعة' : 'Maize & Sorghum'
    },
    {
      pest: language === 'ar' ? 'ذبابة فاكهة البحر المتوسط' : 'Mediterranean Fruit Fly',
      scientific: 'Ceratitis capitata',
      zones: language === 'ar' ? 'البحيرة، الإسماعيلية، القليوبية' : 'Beheira, Ismailia, Qalyubia',
      status: language === 'ar' ? 'برنامج المصائد الجاذبة ورش جزئي' : 'Attract & Kill Program',
      severity: 'medium',
      crop: language === 'ar' ? 'الموالح، المانجو، الخوخ' : 'Citrus, Mango, Peach'
    },
    {
      pest: language === 'ar' ? 'العفن البني في البطاطس' : 'Potato Brown Rot',
      scientific: 'Ralstonia solanacearum',
      zones: language === 'ar' ? 'مناطق التصدير الخالية PFA المعتمدة' : 'Export Pest-Free Areas (PFA)',
      status: language === 'ar' ? 'فحص PCR معتمد للتصدير للاتحاد الأوروبي' : 'Certified PCR Tests for EU Export',
      severity: 'quarantine',
      crop: language === 'ar' ? 'محصول البطاطس' : 'Potato'
    }
  ];

  const strategicCrops = [
    {
      name: language === 'ar' ? 'الموالح والبرتقال' : 'Citrus & Oranges',
      sub: language === 'ar' ? 'الصادر الزراعي رقم 1 لمصر عالمياً' : 'Egypt #1 Agricultural Export Globally',
      pestsMonitored: 'ذبابة الفاكهة، صانعات الأنفاق، تدهور الموالح',
      pestsMonitoredEn: 'Fruit Flies, Leafminers, Citrus Tristeza',
      badge: 'مراقبة تصديرية قصوى'
    },
    {
      name: language === 'ar' ? 'نخيل البلح والتمور' : 'Date Palms',
      sub: language === 'ar' ? 'أكبر منتج للتمور في العالم' : 'World’s Largest Date Producer',
      pestsMonitored: 'سوسة النخيل الحمراء، حلم الغبار، خنفساء الطلع',
      pestsMonitoredEn: 'Red Palm Weevil, Dust Mites, Pollen Beetle',
      badge: 'بروتوكول حقن وطني'
    },
    {
      name: language === 'ar' ? 'محصول البطاطس' : 'Potatoes',
      sub: language === 'ar' ? 'مشروع المناطق الخالية PFA' : 'Potato Brown Rot PFA Project',
      pestsMonitored: 'العفن البني، العفن الحلقي، فراشة درنات البطاطس',
      pestsMonitoredEn: 'Brown Rot, Ring Rot, Potato Tuber Moth',
      badge: 'اعتماد أوروبي ISPM 4'
    },
    {
      name: language === 'ar' ? 'القمح والحبوب' : 'Wheat & Grains',
      sub: language === 'ar' ? 'الأمن الغذائي القومي الاستراتيجي' : 'National Strategic Food Security',
      pestsMonitored: 'التفحم السائب، صدأ القمح الأصفر، حشرات الحبوب',
      pestsMonitoredEn: 'Loose Smut, Yellow Rust, Storage Pests',
      badge: 'حماية موسمية 2026'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Official Portal Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl border border-slate-800">
        {/* Decorative Grid and Glow Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
                <Wheat className="w-4 h-4 text-emerald-400" />
                <span>{t.portal.heroBadge}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-snug text-white">
                {t.portal.heroTitle}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                {t.portal.heroSubtitle}
              </p>

              {/* Portal Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute right-4 rtl:right-4 ltr:left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.portal.searchPlaceholder}
                    className="w-full bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 rounded-2xl py-3.5 pr-12 pl-32 rtl:pr-12 rtl:pl-32 ltr:pl-12 ltr:pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute left-2 rtl:left-2 ltr:right-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    {t.common.search}
                  </button>
                </div>
              </form>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t.portal.btnExploreMap}</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenNewReportModal) {
                      onOpenNewReportModal();
                    } else {
                      setActiveTab('reports');
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{t.portal.btnReportOutbreak}</span>
                </button>

                <button
                  onClick={() => onOpenPrintReport('all')}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>{t.portal.btnOfficialPDF}</span>
                </button>
              </div>
            </div>

            {/* Quick Live Indicators Card */}
            <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {language === 'ar' ? 'مؤشرات الأمان الحيوي القومي' : 'National Biosecurity Pulse'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  {language === 'ar' ? 'محدث لحظياً' : 'Real-time 2026'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="text-2xl font-black text-white">{totalPests}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? 'الآفات المصنفة رسمياً' : 'Classified Pests'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="text-2xl font-black text-rose-400">{activeHotspots}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? 'بؤر حجرية قيد الحصار' : 'Active Hotspots'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="text-2xl font-black text-emerald-400">{pfaCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? 'مراكز خالية معتمدة PFA' : 'Certified PFA Zones'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="text-2xl font-black text-amber-400">{totalReports}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? 'محاضر رصد وتطهير' : 'Field Inspection Logs'}
                  </div>
                </div>
              </div>

              {/* Emergency Hotline Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.portal.hotlineTitle}</div>
                    <div className="text-[10px] text-emerald-300">{t.portal.hotlineSub}</div>
                  </div>
                </div>
                <div className="text-lg font-black text-emerald-400 tracking-wider">
                  {t.portal.hotlineNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Portal Digital Services Hub */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.portal.quickServicesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.portal.quickServicesSub}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            {language === 'ar' ? 'خدمات معهد بحوث وقاية النباتات' : 'PPRI Digital Services'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={service.onClick}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer hover:border-emerald-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center transition border border-slate-200 group-hover:border-emerald-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition">
                      {language === 'ar' ? service.badge : service.badgeEn}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>{language === 'ar' ? 'الدخول إلى الخدمة' : 'Access Service'}</span>
                  <ArrowIcon className="w-4 h-4 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Early Warning & Phytosanitary Bulletins */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.portal.alertsTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.portal.alertsSub}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'ar' ? 'عرض خريطة البؤر' : 'View Outbreaks Map'}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earlyWarnings.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{item.pest}</span>
                      <span className="text-xs font-normal italic text-slate-500 font-mono">({item.scientific})</span>
                    </h4>
                    <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mt-1">
                      {item.crop}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    item.severity === 'high'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : item.severity === 'quarantine'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.zones}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {language === 'ar' ? 'لجنة الحصر والتدخل السريع' : 'Rapid Response Inspection Unit'}
                </span>
                <button
                  onClick={() => setActiveTab('control')}
                  className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {language === 'ar' ? 'بروتوكول المكافحة' : 'Control Protocol'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Strategic & Export Crops Under High Surveillance */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.portal.strategicCropsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t.portal.strategicCropsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategicCrops.map((crop, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {crop.badge}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">{crop.name}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{crop.sub}</p>
              
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium block mb-1">
                  {language === 'ar' ? 'الآفات الخاضعة للمسح:' : 'Target Pests:'}
                </span>
                <span className="text-slate-700 font-semibold leading-relaxed">
                  {language === 'ar' ? crop.pestsMonitored : crop.pestsMonitoredEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Citizen & Farmer Direct Reporting CTA Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-10 shadow-lg border border-emerald-700 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-emerald-200" />
            <span>{language === 'ar' ? 'المشاركة المجتمعية لحماية المحاصيل' : 'Community Phytosanitary Alert'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {language === 'ar' 
              ? 'هل لاحظت أعراض إصابة حشرية أو مرضية غير معتادة بحقلك؟' 
              : 'Observed unusual pest symptoms or crop damage in your field?'}
          </h2>

          <p className="text-sm text-emerald-100 leading-relaxed">
            {language === 'ar'
              ? 'ساهم في حماية الأمن الغذائي القومي والصادرات المصرية من خلال الإبلاغ الفوري لفرق معهد بحوث وقاية النباتات ولجان الحجر الزراعي لإرسال فريق فحص معملي وميداني عاجل.'
              : 'Contribute to safeguarding national food security and export integrity by reporting suspected exotic pests directly to PPRI rapid response laboratory units.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (onOpenNewReportModal) {
                  onOpenNewReportModal();
                } else {
                  setActiveTab('reports');
                }
              }}
              className="px-6 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-black transition shadow-md cursor-pointer"
            >
              {language === 'ar' ? 'تسجيل بلاغ رصد ميداني الآن' : 'Submit Field Observation Report'}
            </button>

            <a
              href="tel:19561"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-950/60 hover:bg-emerald-950 text-white border border-emerald-500/40 text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'الاتصال بالخط الساخن: 19561' : 'Call Emergency Hotline: 19561'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Partner Institutions & Standards */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
        <h3 className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          {t.portal.partnersTitle}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-700 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>{language === 'ar' ? 'مركز البحوث الزراعية (ARC)' : 'Agricultural Research Center'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <span>{language === 'ar' ? 'الإدارة المركزية للحجر الزراعي (CAPQ)' : 'Central Admin of Plant Quarantine'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-700" />
            <span>{language === 'ar' ? 'منظمة الأغذية والزراعة (FAO)' : 'Food and Agriculture Org (FAO)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <span>{language === 'ar' ? 'الاتفاقية الدولية لوقاية النباتات (IPPC)' : 'International Plant Protection Convention'}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
