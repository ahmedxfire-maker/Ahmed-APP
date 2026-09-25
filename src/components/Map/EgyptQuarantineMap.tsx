import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { ZoneClassification } from '../../types';
import { MapPin, AlertTriangle, ShieldCheck, Info, Filter, Eye, Layers } from 'lucide-react';

interface Props {
  onSelectLocation?: (locationId: string) => void;
  onSelectPest?: (pestId: string) => void;
}

export const EgyptQuarantineMap: React.FC<Props> = ({ onSelectLocation, onSelectPest }) => {
  const { locations, locationZoneStatuses, reports, pests } = useDatabase();
  const { 
    t, 
    language, 
    tZone, 
    tGovernorate, 
    tMarkaz, 
    tSector, 
    tPestName, 
    tPestType, 
    tSeverity, 
    tCrop, 
    tSite 
  } = useLanguage();

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [filterPestId, setFilterPestId] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');

  // Helper colors for the 4 requested zones
  const getZoneStyle = (classification: ZoneClassification) => {
    switch (classification) {
      case 'منطقة خالية من الإصابة (PFA)':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          text: 'text-emerald-800',
          lightBg: 'bg-emerald-50',
          label: t.map.pfaZone,
          pinColor: '#10b981',
          shadow: 'shadow-emerald-200'
        };
      case 'منطقة منخفضة الإصابة (ALPP)':
        return {
          bg: 'bg-sky-500',
          border: 'border-sky-600',
          text: 'text-sky-800',
          lightBg: 'bg-sky-50',
          label: t.map.alppZone,
          pinColor: '#0ea5e9',
          shadow: 'shadow-sky-200'
        };
      case 'منطقة متوسطة الإصابة':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          text: 'text-amber-800',
          lightBg: 'bg-amber-50',
          label: t.map.medZone,
          pinColor: '#f59e0b',
          shadow: 'shadow-amber-200'
        };
      case 'منطقة عالية الإصابة (بؤرة حجرية)':
        return {
          bg: 'bg-rose-600',
          border: 'border-rose-700',
          text: 'text-rose-800',
          lightBg: 'bg-rose-50',
          label: t.map.highZone,
          pinColor: '#e11d48',
          shadow: 'shadow-rose-300'
        };
    }
  };

  // Filtered locations
  const filteredStatuses = useMemo(() => {
    return locationZoneStatuses.filter(item => {
      if (filterZone !== 'all' && item.classification !== filterZone) {
        return false;
      }
      if (filterPestId !== 'all') {
        const hasPest = reports.some(
          r => r.locationId === item.location.id && r.pestId === filterPestId
        );
        if (!hasPest) return false;
      }
      return true;
    });
  }, [locationZoneStatuses, filterZone, filterPestId, reports]);

  // Statistics for the 4 zones
  const zoneStats = useMemo(() => {
    const pfa = locationZoneStatuses.filter(s => s.classification === 'منطقة خالية من الإصابة (PFA)').length;
    const low = locationZoneStatuses.filter(s => s.classification === 'منطقة منخفضة الإصابة (ALPP)').length;
    const med = locationZoneStatuses.filter(s => s.classification === 'منطقة متوسطة الإصابة').length;
    const high = locationZoneStatuses.filter(s => s.classification === 'منطقة عالية الإصابة (بؤرة حجرية)').length;
    const totalFeddans = locationZoneStatuses.reduce((acc, s) => acc + s.totalAffectedFeddans, 0);

    return { pfa, low, med, high, totalFeddans, totalLocations: locationZoneStatuses.length };
  }, [locationZoneStatuses]);

  const selectedStatus = useMemo(() => {
    return locationZoneStatuses.find(s => s.location.id === selectedLocationId);
  }, [selectedLocationId, locationZoneStatuses]);

  const selectedReports = useMemo(() => {
    if (!selectedLocationId) return [];
    return reports.filter(r => r.locationId === selectedLocationId);
  }, [selectedLocationId, reports]);

  // Map coordinate conversion to SVG percentage coordinates (Egypt bounds ~ Lat 22-31.5, Lng 25-35)
  const getSvgCoordinates = (lat: number, lng: number) => {
    const minLat = 23.5;
    const maxLat = 31.8;
    const minLng = 28.0;
    const maxLng = 34.8;

    const x = ((lng - minLng) / (maxLng - minLng)) * 800 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 620 + 30;

    return { x, y };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner / Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {t.map.title}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {t.map.subtitle}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 font-medium">{t.map.filterZone}</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">{t.map.allZones} ({locations.length})</option>
              <option value="منطقة خالية من الإصابة (PFA)">{tZone('منطقة خالية من الإصابة (PFA)')}</option>
              <option value="منطقة منخفضة الإصابة (ALPP)">{tZone('منطقة منخفضة الإصابة (ALPP)')}</option>
              <option value="منطقة متوسطة الإصابة">{tZone('منطقة متوسطة الإصابة')}</option>
              <option value="منطقة عالية الإصابة (بؤرة حجرية)">{tZone('منطقة عالية الإصابة (بؤرة حجرية)')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-sm">
            <span className="text-slate-600 font-medium">{t.map.filterPest}</span>
            <select
              value={filterPestId}
              onChange={(e) => setFilterPestId(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="all">{t.map.allPests}</option>
              {pests.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ar' ? p.commonName : (tPestName(p.commonName) || p.scientificName)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Classification Indicator Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-slate-100 border-b border-slate-100 bg-slate-50/50">
        <div 
          onClick={() => setFilterZone(filterZone === 'منطقة خالية من الإصابة (PFA)' ? 'all' : 'منطقة خالية من الإصابة (PFA)')}
          className={`p-3 sm:p-4 transition cursor-pointer hover:bg-emerald-50/70 ${filterZone === 'منطقة خالية من الإصابة (PFA)' ? 'bg-emerald-50 ring-2 ring-emerald-400 inset-0' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.map.pfaZone}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {zoneStats.pfa}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'معتمدة لتصدير المحاصيل للأسواق الدولية' : 'Certified for global export markets'}</p>
        </div>

        <div 
          onClick={() => setFilterZone(filterZone === 'منطقة منخفضة الإصابة (ALPP)' ? 'all' : 'منطقة منخفضة الإصابة (ALPP)')}
          className={`p-3 sm:p-4 transition cursor-pointer hover:bg-sky-50/70 ${filterZone === 'منطقة منخفضة الإصابة (ALPP)' ? 'bg-sky-50 ring-2 ring-sky-400 inset-0' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              {t.map.alppZone}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              {zoneStats.low}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'تحت الرصد الروتيني وكثافة إصابة طفيفة' : 'Routine surveillance, low density'}</p>
        </div>

        <div 
          onClick={() => setFilterZone(filterZone === 'منطقة متوسطة الإصابة' ? 'all' : 'منطقة متوسطة الإصابة')}
          className={`p-3 sm:p-4 transition cursor-pointer hover:bg-amber-50/70 ${filterZone === 'منطقة متوسطة الإصابة' ? 'bg-amber-50 ring-2 ring-amber-400 inset-0' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              {t.map.medZone}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {zoneStats.med}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'تتطلب تدخلاً علاجياً وتطبيق خطط مكافحة' : 'Requires targeted IPM treatments'}</p>
        </div>

        <div 
          onClick={() => setFilterZone(filterZone === 'منطقة عالية الإصابة (بؤرة حجرية)' ? 'all' : 'منطقة عالية الإصابة (بؤرة حجرية)')}
          className={`p-3 sm:p-4 transition cursor-pointer hover:bg-rose-50/70 ${filterZone === 'منطقة عالية الإصابة (بؤرة حجرية)' ? 'bg-rose-50 ring-2 ring-rose-400 inset-0' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              {t.map.highZone}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {zoneStats.high}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'تخضع للحصار الحجري وحظر تداول الشتلات' : 'Quarantine lockdown & seedling embargo'}</p>
        </div>
      </div>

      {/* Map Layout: Vector Stage + Side Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Map Vector Graphic Canvas */}
        <div className="lg:col-span-8 p-4 sm:p-6 bg-slate-900 relative flex flex-col justify-between overflow-hidden">
          {/* Nile Basin subtle background grid and styling */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {language === 'ar' ? 'الرصد الميداني اللحظي لمراكز الحجر الزراعي - جمهورية مصر العربية' : 'Real-time quarantine surveillance nodes - Arab Republic of Egypt'}
            </span>
            <span>{language === 'ar' ? 'انقر على أي موقع لعرض تقرير البؤرة الحجرية' : 'Click any node to view quarantine details'}</span>
          </div>

          {/* SVG Map of Egypt showing agricultural regions & Nile Course */}
          <div className="relative w-full aspect-[4/3] max-h-[550px] mx-auto z-10">
            <svg
              viewBox="0 0 900 680"
              className="w-full h-full filter drop-shadow-md select-none"
              style={{ direction: 'ltr' }}
            >
              {/* Egypt Land Contour Simplified Representation */}
              <defs>
                <linearGradient id="nileGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="desertBg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Egypt Boundary Path */}
              <path
                d="M 50 40 L 820 40 L 850 140 L 730 200 L 790 420 L 820 640 L 50 640 Z"
                fill="url(#desertBg)"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Mediterranean Sea outline */}
              <path
                d="M 50 40 Q 250 55 450 45 Q 600 50 780 40 L 820 120"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                opacity="0.5"
              />
              <text x="320" y="30" fill="#38bdf8" fontSize="12" fontWeight="bold" opacity="0.7">
                {language === 'ar' ? 'البحر الأبيض المتوسط' : 'Mediterranean Sea'}
              </text>

              {/* Red Sea & Gulf of Suez/Aqaba */}
              <path
                d="M 720 130 L 670 210 L 710 320 L 770 470 L 820 620"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                opacity="0.4"
              />
              <text x="730" y="380" fill="#38bdf8" fontSize="12" opacity="0.6" transform="rotate(65, 730, 380)">
                {language === 'ar' ? 'البحر الأحمر' : 'Red Sea'}
              </text>

              {/* Nile Delta & River Path (Green Ag Zone) */}
              <path
                d="M 400 130 L 320 50 Q 420 40 540 50 L 460 130 Z"
                fill="#064e3b"
                fillOpacity="0.4"
                stroke="#059669"
                strokeWidth="1.5"
              />
              {/* Nile River Corridor from Aswan to Cairo/Delta */}
              <path
                d="M 430 130 Q 410 200 420 280 Q 435 340 455 410 Q 520 470 510 520 Q 490 560 520 640"
                fill="none"
                stroke="url(#nileGlow)"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Regions Labels */}
              <text x="370" y="80" fill="#a7f3d0" fontSize="13" fontWeight="bold" opacity="0.8">
                {language === 'ar' ? 'دلتا النيل (الرقعة الزراعية الخصبة)' : 'Nile Delta (Agricultural Basin)'}
              </text>
              <text x="360" y="270" fill="#94a3b8" fontSize="12" opacity="0.7">
                {language === 'ar' ? 'مصر الوسطى (الفيوم - المنيا)' : 'Middle Egypt (Faiyum - Minya)'}
              </text>
              <text x="440" y="470" fill="#94a3b8" fontSize="12" opacity="0.7">
                {language === 'ar' ? 'مصر العليا (قنا - الأقصر - أسوان)' : 'Upper Egypt (Qena - Luxor - Aswan)'}
              </text>
              <text x="140" y="450" fill="#cbd5e1" fontSize="12" opacity="0.6">
                {language === 'ar' ? 'الوادي الجديد وتوشكى' : 'New Valley & Toshka'}
              </text>
              <text x="680" y="110" fill="#cbd5e1" fontSize="11" opacity="0.6">
                {language === 'ar' ? 'شبه جزيرة سيناء' : 'Sinai Peninsula'}
              </text>

              {/* Render Location Nodes & Hotspots */}
              {filteredStatuses.map((status) => {
                const { x, y } = getSvgCoordinates(status.location.coordinates.lat, status.location.coordinates.lng);
                const style = getZoneStyle(status.classification);
                const isSelected = selectedLocationId === status.location.id;

                return (
                  <g
                    key={status.location.id}
                    onClick={() => {
                      setSelectedLocationId(status.location.id);
                      if (onSelectLocation) onSelectLocation(status.location.id);
                    }}
                    className="cursor-pointer group transition-all"
                  >
                    {/* Pulsing ring for High Infestation / Quarantine Hotspots */}
                    {status.classification === 'منطقة عالية الإصابة (بؤرة حجرية)' && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 26 : 20}
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer glow ring on selection */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="24"
                        fill="none"
                        stroke="#f8fafc"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Location Pin Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 14 : 10}
                      fill={style.pinColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Feddans Indicator on Map */}
                    {status.totalAffectedFeddans > 0 && (
                      <text
                        x={x}
                        y={y - 14}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow-md"
                      >
                        {status.totalAffectedFeddans} {language === 'ar' ? 'ف' : 'fed'}
                      </text>
                    )}

                    {/* Governorate & Markaz Name Label */}
                    <text
                      x={x}
                      y={y + 20}
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      fontSize={isSelected ? "12" : "11"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      textAnchor="middle"
                      className="pointer-events-none transition-all drop-shadow"
                    >
                      {tGovernorate(status.location.governorate)} - {tMarkaz(status.location.markaz)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer status */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 gap-2">
            <div>
              {language === 'ar' ? 'المواقع المعروضة:' : 'Visible Locations:'} <span className="text-white font-bold">{filteredStatuses.length}</span> {language === 'ar' ? 'من أصل' : 'of'}{' '}
              <span className="text-slate-300">{locations.length}</span> {language === 'ar' ? 'موقعاً زراعياً مرصوداً' : 'monitored agricultural nodes'}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {t.map.pfaLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> {t.map.alppLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {t.map.medLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> {t.map.highLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Side Details Panel: Active Node Inspection */}
        <div className="lg:col-span-4 p-5 bg-slate-50 border-r border-slate-100 flex flex-col justify-between overflow-y-auto max-h-[640px]">
          {selectedStatus ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">{t.map.selectedGovernorate}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {tGovernorate(selectedStatus.location.governorate)} — {tMarkaz(selectedStatus.location.markaz)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.map.sector} {tSector(selectedStatus.location.agriculturalSector)}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getZoneStyle(selectedStatus.classification).lightBg} ${getZoneStyle(selectedStatus.classification).text} border ${getZoneStyle(selectedStatus.classification).border}`}>
                  {tZone(selectedStatus.classification)}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'المساحة المتضررة' : 'Affected Area'}</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {selectedStatus.totalAffectedFeddans} <span className="text-xs font-normal text-slate-500">{t.common.feddans}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'الرقعة الزراعية الكلية' : 'Total Arable Land'}</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {(selectedStatus.location.agriculturalAreaFeddans / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">{t.common.feddans}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'بلاغات الإصابة النشطة' : 'Active Reports'}</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {selectedStatus.activeReportsCount} <span className="text-xs font-normal text-slate-500">{language === 'ar' ? 'تقرير' : 'reports'}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'إحداثيات الموقع' : 'Coordinates'}</span>
                  <p className="text-xs font-mono text-slate-700 mt-1">
                    {selectedStatus.location.coordinates.lat.toFixed(2)}°N, {selectedStatus.location.coordinates.lng.toFixed(2)}°E
                  </p>
                </div>
              </div>

              {/* Active Reports List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.map.relatedReports} ({selectedReports.length})
                </h4>

                {selectedReports.length === 0 ? (
                  <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.map.noReportsForLocation}</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedReports.map(rep => {
                      const pest = pests.find(p => p.id === rep.pestId);
                      return (
                        <div key={rep.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span 
                              onClick={() => onSelectPest && onSelectPest(rep.pestId)}
                              className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                            >
                              {language === 'ar' ? pest?.commonName : (tPestName(pest?.commonName || '') || pest?.scientificName)}
                              <span className="text-[10px] font-normal text-slate-500">({tPestType(pest?.type || '')})</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              rep.severity === 'جسيمة' ? 'bg-rose-100 text-rose-800' :
                              rep.severity === 'متوسطة' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {t.common.severity}: {tSeverity(rep.severity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>{t.common.crop}: <strong className="text-slate-800">{tCrop(rep.crop)}</strong></span>
                            <span>{language === 'ar' ? 'المساحة:' : 'Area:'} <strong>{rep.affectedAreaFeddans} {t.common.feddans}</strong></span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>{t.reports.colSite}: {tSite(rep.infestationSite)}</span>
                            <span>{t.common.date}: {rep.detectionDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quarantine Action summary */}
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs text-blue-900">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-700" /> 
                  {language === 'ar' ? 'توجيه الحجر الزراعي للمنطقة:' : 'Phytosanitary Protocol Guideline:'}
                </span>
                {selectedStatus.classification === 'منطقة عالية الإصابة (بؤرة حجرية)' && 
                  (language === 'ar' 
                    ? 'فرض حظر فوري على نقل مواد الإكثار الخضري والشتلات خارج نطاق المركز، وتنفيذ حملات مكافحة إلزامية تحت إشراف مفتشي الحجر.'
                    : 'Immediate ban on moving vegetative propagation material & seedlings out of the district; mandatory eradication under CAPQ supervision.')}
                {selectedStatus.classification === 'منطقة متوسطة الإصابة' && 
                  (language === 'ar'
                    ? 'تكثيف المصائد الفرمونية والضوئية وتنفيذ برامج الإدارة المتكاملة (IPM) قبل انتقال العدوى للمناطق المجاورة.'
                    : 'Intensify pheromone and light traps; enforce integrated pest management (IPM) protocols before regional spread.')}
                {selectedStatus.classification === 'منطقة منخفضة الإصابة (ALPP)' && 
                  (language === 'ar'
                    ? 'استمرار المراقبة الميدانية الدورية وفحص شحنات التصدير في المحطات المعتمدة.'
                    : 'Continue regular field surveillance and pre-shipment inspections at certified export stations.')}
                {selectedStatus.classification === 'منطقة خالية من الإصابة (PFA)' && 
                  (language === 'ar'
                    ? 'منطقة نموذجية معتمدة للتصدير للأسواق العالمية (الاتحاد الأوروبي، الخليج، شرق آسيا)، يرجى الحفاظ على نقاط التفتيش لمنع دخول الآفات.'
                    : 'Benchmark zone certified for global export markets (EU, Gulf, East Asia) conforming to ISPM 4 standards.')}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 h-full">
              <MapPin className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-slate-700">
                {language === 'ar' ? 'حدد مركزاً أو موقعاً من الخريطة' : 'Select a Location from the Map'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {language === 'ar' 
                  ? 'انقر على أي دائرة بالمحافظات المصرية لاستعراض حالة الآفات الحجرية، تصنيف المنطقة، وتقارير الرصد الميداني.'
                  : 'Click any district node to review quarantine pest prevalence, classification status, and field inspection reports.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
