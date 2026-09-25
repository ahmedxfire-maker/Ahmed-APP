import React, { useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bug, AlertTriangle, ShieldCheck, MapPin, FileSpreadsheet, ShieldAlert, Wheat } from 'lucide-react';

export const OverviewKPIs: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { pests, reports, locations, locationZoneStatuses, controlMeasures } = useDatabase();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const totalAffectedFeddans = reports.reduce((sum, r) => sum + (r.affectedAreaFeddans || 0), 0);
    const severeReports = reports.filter(r => r.severity === 'جسيمة').length;
    const pfaCount = locationZoneStatuses.filter(s => s.classification === 'منطقة خالية من الإصابة (PFA)').length;
    const highRiskCount = locationZoneStatuses.filter(s => s.classification === 'منطقة عالية الإصابة (بؤرة حجرية)').length;
    const quarantineA1A2Pests = pests.filter(p => p.quarantineCategory?.includes('أ1') || p.quarantineCategory?.includes('أ2')).length;

    return {
      pestsCount: pests.length,
      reportsCount: reports.length,
      locationsCount: locations.length,
      totalAffectedFeddans: Number(totalAffectedFeddans.toFixed(1)),
      severeReports,
      pfaCount,
      pfaPercent: Math.round((pfaCount / (locations.length || 1)) * 100),
      highRiskCount,
      quarantineA1A2Pests,
      controlsCount: controlMeasures.length
    };
  }, [pests, reports, locations, locationZoneStatuses, controlMeasures]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Registered Pests */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('pests')}
        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpis.registeredPests}</span>
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition">
            <Bug className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{stats.pestsCount}</span>
          <span className="text-xs text-slate-500 font-medium">{t.kpis.pestsUnit}</span>
        </div>
        <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
          <span>{t.kpis.quarantineRegulatedBadge.replace('{count}', String(stats.quarantineA1A2Pests))}</span>
        </div>
      </div>

      {/* 2. Total Infestation Reports & Affected Feddans */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('reports')}
        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpis.totalAffectedArea}</span>
          <span className="p-2 rounded-xl bg-rose-50 text-rose-700 group-hover:scale-110 transition">
            <Wheat className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{stats.totalAffectedFeddans}</span>
          <span className="text-xs text-slate-500 font-medium">{t.kpis.affectedUnit}</span>
        </div>
        <div className="mt-2 text-xs text-rose-700 font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{t.kpis.reportsBadge.replace('{count}', String(stats.reportsCount)).replace('{severe}', String(stats.severeReports))}</span>
        </div>
      </div>

      {/* 3. Export-Approved Pest Free Areas (PFA) */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('locations')}
        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpis.pfaTitle}</span>
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition">
            <ShieldCheck className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-600">{stats.pfaCount}</span>
          <span className="text-xs text-slate-500 font-medium">{t.kpis.pfaUnit.replace('{percent}', String(stats.pfaPercent))}</span>
        </div>
        <div className="mt-2 text-xs text-emerald-700 font-semibold">
          <span>{t.kpis.pfaBadge}</span>
        </div>
      </div>

      {/* 4. High Risk Hotspots & Control Measures */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('control')}
        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpis.hotspotsTitle}</span>
          <span className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition">
            <ShieldAlert className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-600">{stats.highRiskCount}</span>
          <span className="text-xs text-slate-500 font-medium">{t.kpis.hotspotsUnit}</span>
        </div>
        <div className="mt-2 text-xs text-amber-800 font-semibold flex items-center justify-between">
          <span>{t.kpis.hotspotsBadge.replace('{measures}', String(stats.controlsCount))}</span>
        </div>
      </div>
    </div>
  );
};
