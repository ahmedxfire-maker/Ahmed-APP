import React, { useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { Calendar, PieChart as PieIcon, BarChart3, TrendingUp, AlertOctagon } from 'lucide-react';
import { MonthlyStatsTable } from './MonthlyStatsTable';

const PEST_TYPE_COLORS: Record<string, string> = {
  'حشرية': '#ef4444',
  'فطرية': '#f59e0b',
  'نيماتودا': '#8b5cf6',
  'حشائش': '#10b981',
  'اكاروسي': '#ec4899',
  'قوارض': '#64748b',
  'بكتيري': '#0ea5e9',
  'طحالب': '#14b8a6',
  'فقاريات': '#a855f7'
};

const SEVERITY_COLORS = {
  'خفيفة': '#10b981',
  'متوسطة': '#f59e0b',
  'جسيمة': '#e11d48'
};

interface DashboardChartsProps {
  onOpenPrintReport?: (mode: 'monthly') => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ onOpenPrintReport }) => {
  const { monthlyStats, pests, reports } = useDatabase();
  const { t, language, tPestType, tCrop, tSite, tMonth } = useLanguage();

  // Translated monthly stats for AreaChart
  const formattedMonthlyStats = useMemo(() => {
    return monthlyStats.map(stat => ({
      ...stat,
      displayMonth: language === 'ar' ? stat.month : tMonth(stat.month)
    }));
  }, [monthlyStats, language, tMonth]);

  // 1. Pest types distribution
  const pestTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    pests.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      name: language === 'ar' ? type : tPestType(type),
      value: count,
      color: PEST_TYPE_COLORS[type] || '#94a3b8'
    }));
  }, [pests, language, tPestType]);

  // 2. Infestation Severity distribution from reports
  const severityData = useMemo(() => {
    const counts: Record<string, number> = { 'خفيفة': 0, 'متوسطة': 0, 'جسيمة': 0 };
    const feddans: Record<string, number> = { 'خفيفة': 0, 'متوسطة': 0, 'جسيمة': 0 };

    reports.forEach(r => {
      if (counts[r.severity] !== undefined) {
        counts[r.severity] += 1;
        feddans[r.severity] += r.affectedAreaFeddans || 0;
      }
    });

    return [
      { name: language === 'ar' ? 'خفيفة' : 'Low', count: counts['خفيفة'], feddans: Number(feddans['خفيفة'].toFixed(1)), color: SEVERITY_COLORS['خفيفة'] },
      { name: language === 'ar' ? 'متوسطة' : 'Moderate', count: counts['متوسطة'], feddans: Number(feddans['متوسطة'].toFixed(1)), color: SEVERITY_COLORS['متوسطة'] },
      { name: language === 'ar' ? 'جسيمة' : 'Severe', count: counts['جسيمة'], feddans: Number(feddans['جسيمة'].toFixed(1)), color: SEVERITY_COLORS['جسيمة'] }
    ];
  }, [reports, language]);

  // 3. Most affected host crops
  const affectedCropsData = useMemo(() => {
    const cropMap = new Map<string, { feddans: number; reports: number }>();
    reports.forEach(r => {
      // Split or take main crop name
      const cropName = r.crop.split('(')[0].trim();
      const existing = cropMap.get(cropName) || { feddans: 0, reports: 0 };
      cropMap.set(cropName, {
        feddans: existing.feddans + r.affectedAreaFeddans,
        reports: existing.reports + 1
      });
    });

    return Array.from(cropMap.entries())
      .map(([crop, data]) => ({
        crop: language === 'ar' ? crop : tCrop(crop),
        feddans: Number(data.feddans.toFixed(1)),
        reports: data.reports
      }))
      .sort((a, b) => b.feddans - a.feddans)
      .slice(0, 6);
  }, [reports, language, tCrop]);

  // 4. Infestation sites distribution (ساق، اوراق، جذور، تربة، ثمار، بذور)
  const infestationSitesData = useMemo(() => {
    const sitesCount: Record<string, number> = {
      'ساق': 0,
      'اوراق': 0,
      'جذور': 0,
      'تربة': 0,
      'ثمار': 0,
      'بذور': 0
    };

    reports.forEach(r => {
      if (sitesCount[r.infestationSite] !== undefined) {
        sitesCount[r.infestationSite] += 1;
      }
    });

    return Object.entries(sitesCount).map(([site, count]) => ({
      site: language === 'ar' ? site : tSite(site),
      count
    }));
  }, [reports, language, tSite]);

  return (
    <div className="space-y-6">
      {/* Monthly Operations Timeline Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t.charts.monthlyTrendTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.charts.monthlyTrendSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded bg-rose-500"></span> {t.charts.affectedFeddans}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> {t.charts.treatedFeddans}
            </span>
          </div>
        </div>

        <div className="h-72 w-full" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedMonthlyStats} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAffected" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTreated" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="displayMonth" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: 'none',
                  direction: language === 'ar' ? 'rtl' : 'ltr'
                }}
              />
              <Area
                type="monotone"
                dataKey="affectedFeddans"
                name={t.charts.affectedFeddans}
                stroke="#e11d48"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAffected)"
              />
              <Area
                type="monotone"
                dataKey="treatedFeddans"
                name={t.charts.treatedFeddans}
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTreated)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Official Monthly Statistics Table with Excel / CSV / PDF Exports */}
      <MonthlyStatsTable onOpenPrintReport={onOpenPrintReport} />

      {/* Grid: Pest Types Distribution & Severity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Pest Types Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <PieIcon className="w-4 h-4" />
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {t.charts.pestTypeDistribution}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t.charts.pestTypeSubtitle}
            </p>
          </div>

          <div className="h-56 w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pestTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {pestTypeData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                    direction: language === 'ar' ? 'rtl' : 'ltr'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type Badges Legend */}
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 justify-center">
            {pestTypeData.map(item => (
              <span key={item.name} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>

        {/* 2. Most Affected Host Crops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {t.charts.affectedCropsTitle}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t.charts.affectedCropsSubtitle}
            </p>
          </div>

          <div className="h-56 w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={affectedCropsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis dataKey="crop" type="category" stroke="#475569" tick={{ fontSize: 11, fontWeight: 500 }} width={80} />
                <Tooltip
                  formatter={(val) => [`${val} ${t.common.feddans}`, t.charts.affectedFeddans]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                    direction: language === 'ar' ? 'rtl' : 'ltr'
                  }}
                />
                <Bar dataKey="feddans" fill="#059669" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-3 border-t border-slate-100">
            {language === 'ar' 
              ? <>أعلى المحاصيل استهدافاً: <strong>{affectedCropsData[0]?.crop || 'الموالح'}</strong> و <strong>{affectedCropsData[1]?.crop || 'القمح'}</strong></>
              : <>Top impacted crops: <strong>{affectedCropsData[0]?.crop || 'Citrus'}</strong> and <strong>{affectedCropsData[1]?.crop || 'Wheat'}</strong></>}
          </div>
        </div>

        {/* 3. Infestation Sites (ساق، اوراق، جذور...) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <AlertOctagon className="w-4 h-4" />
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {t.charts.infestationSitesTitle}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t.charts.infestationSitesSubtitle}
            </p>
          </div>

          <div className="h-56 w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={infestationSitesData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="site" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val}`, language === 'ar' ? 'عدد البلاغات' : 'Report count']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                    direction: language === 'ar' ? 'rtl' : 'ltr'
                  }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-3 border-t border-slate-100">
            {language === 'ar'
              ? <>تتركز معظم الإصابات في <strong className="text-amber-700">الأوراق والسيقان</strong> متبوعة بـ <strong className="text-amber-700">الجذور</strong></>
              : <>Most infestations target <strong className="text-amber-700">Leaves & Stems</strong>, followed by <strong className="text-amber-700">Roots</strong></>}
          </div>
        </div>
      </div>
    </div>
  );
};
