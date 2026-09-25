import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Wheat, 
  PhoneCall, 
  MapPin, 
  Mail, 
  ExternalLink, 
  ShieldCheck,
  Globe,
  Building2,
  FileCheck
} from 'lucide-react';
import { ReportPrintMode } from '../Reports/OfficialPrintReport';

interface Props {
  setActiveTab: (tab: string) => void;
  onOpenPrintReport: (mode?: ReportPrintMode) => void;
}

export const PortalFooter: React.FC<Props> = ({ setActiveTab, onOpenPrintReport }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 mt-auto">
      {/* 1. Target DOM Element: div:nth-of-type(1) preserving exact selectors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 py-4 border-b border-slate-800/80">
        {/* div:nth-of-type(1) */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
          {/* span:nth-of-type(2) */}
          <span className="text-[#67728b] text-[12px] font-normal">{t.footer.copyright}</span>
        </div>

        {/* div:nth-of-type(2) */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-[#67728b]">
          {/* span:nth-of-type(1) */}
          <span>{t.footer.pestControlAdmin}</span>
          {/* span:nth-of-type(2) */}
          <span>•</span>
          {/* span:nth-of-type(3) */}
          <span>{t.footer.projects}</span>
          {/* span:nth-of-type(4) */}
          <span>•</span>
          {/* span:nth-of-type(5) */}
          <span className="text-[#ffffff] text-[12px] font-normal">{t.footer.certified}</span>
        </div>
      </div>

      {/* 2. Comprehensive Portal Directory Section as div:nth-of-type(2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Institutional Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-950/40 border border-emerald-400/30 shrink-0">
                <Wheat className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-white text-sm tracking-tight leading-snug">
                  {t.brand.title}
                </div>
                <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                  {t.brand.subtitleInstitute}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isAr
                ? 'البوابة الرقمية الرسمية المعتمدة لمشروع حصر أنواع وتوزيع وكثافة الآفات الزراعية على أهم المحاصيل بالزراعات المصرية، بالتعاون بين معهد بحوث وقاية النباتات والإدارة المركزية للحجر الزراعي.'
                : 'Official certified digital portal for the National Project for Surveying Agricultural Pest Types, Distribution & Density on Major Crops in Egypt, under PPRI & CAPQ.'}
            </p>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between max-w-sm">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-bold">{t.portal.hotlineTitle}:</span>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono tracking-wider">
                {t.portal.hotlineNumber}
              </span>
            </div>
          </div>

          {/* Col 3: Portal Services Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'خدمات البوابة' : 'Portal Services'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {isAr ? 'الرئيسية' : 'Home Portal'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {isAr ? 'الخريطة التفاعلية لبؤر الحجر' : 'Interactive Quarantine Map'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('pests')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {isAr ? 'سجل ودليل الآفات الحجرية' : 'Quarantine Pests Registry'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('control')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {isAr ? 'توصيات المبيدات وفترات PHI' : 'Pesticides & PHI Safety'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPrintReport('all')}
                  className="hover:text-emerald-400 transition cursor-pointer text-emerald-400 font-semibold"
                >
                  {isAr ? 'إصدار التقرير الإحصائي PDF' : 'Export Certified Report PDF'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Authorities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'جهات ومواقع رسمية' : 'Official Portals'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="hover:text-white transition block">
                  {isAr ? 'وزارة الزراعة واستصلاح الأراضي' : 'Ministry of Agriculture (Egypt)'}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition block">
                  {isAr ? 'مركز البحوث الزراعية (ARC)' : 'Agricultural Research Center'}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition block">
                  {isAr ? 'الإدارة المركزية للحجر الزراعي (CAPQ)' : 'Central Admin of Plant Quarantine'}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition block">
                  {isAr ? 'الاتفاقية الدولية IPPC' : 'International Plant Protection (IPPC)'}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition block">
                  {isAr ? 'منظمة الأغذية والزراعة (FAO)' : 'Food and Agriculture Org (FAO)'}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Head Office */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'المقر والتواصل' : 'Headquarters'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {isAr ? '7 شارع نادي الصيد، الدقي، الجيزة' : '7 Nadi El-Seid St, Dokki, Giza'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@ppri.gov.eg</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>www.arc.sci.eg</span>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('about')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  {isAr ? 'عن المعهد والمشروع' : 'About PPRI & Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
