import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Location } from '../../types';
import { LocationModal } from '../Modals/LocationModal';
import { 
  MapPin, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Filter, 
  ShieldCheck, 
  AlertTriangle,
  Compass,
  Navigation
} from 'lucide-react';

export const LocationsTable: React.FC<{ onSelectLocation?: (locationId: string) => void }> = ({ onSelectLocation }) => {
  const { locations, locationZoneStatuses, addLocation, updateLocation, deleteLocation, reports } = useDatabase();
  const { t, language, tGovernorate, tZone, tSector } = useLanguage();
  const { currentUser, isSuperAdmin, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);

  const isEmployee = currentUser?.role === 'employee';
  const canExport = hasPermission('canExportData');
  const canDelete = !isEmployee && (isSuperAdmin || hasPermission('canDeleteData'));

  // Governorates list
  const governorates = useMemo(() => {
    return Array.from(new Set(locations.map(l => l.governorate)));
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const status = locationZoneStatuses.find(s => s.location.id === loc.id);

      const matchesSearch = 
        loc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.governorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.markaz.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.agriculturalSector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGov = selectedGovernorate === 'all' || loc.governorate === selectedGovernorate;
      const matchesClassification = selectedClassification === 'all' || status?.classification === selectedClassification;

      return matchesSearch && matchesGov && matchesClassification;
    });
  }, [locations, locationZoneStatuses, searchTerm, selectedGovernorate, selectedClassification]);

  const handleExportCSV = () => {
    const headers = language === 'ar' ? [
      'معرف الموقع',
      'المحافظة / المنطقة',
      'المركز',
      'خط العرض',
      'خط الطول',
      'الرقعة الزراعية (فدان)',
      'القطاع الزراعي',
      'التصنيف الحجري للرصد',
      'المساحة المتضررة (فدان)',
      'عدد البلاغات النشطة'
    ] : [
      'Location ID',
      'Governorate',
      'District (Markaz)',
      'Latitude',
      'Longitude',
      'Arable Area (Feddans)',
      'Agricultural Sector',
      'Phytosanitary Zone Classification',
      'Affected Area (Feddans)',
      'Active Reports Count'
    ];

    const rows = filteredLocations.map(loc => {
      const status = locationZoneStatuses.find(s => s.location.id === loc.id);
      return [
        loc.id,
        `"${language === 'ar' ? loc.governorate : tGovernorate(loc.governorate)}"`,
        `"${loc.markaz}"`,
        loc.coordinates.lat,
        loc.coordinates.lng,
        loc.agriculturalAreaFeddans,
        `"${language === 'ar' ? loc.agriculturalSector : tSector(loc.agriculturalSector)}"`,
        `"${status ? (language === 'ar' ? status.classification : tZone(status.classification)) : ''}"`,
        status?.totalAffectedFeddans || 0,
        status?.activeReportsCount || 0
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Phytosanitary_Locations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string, name: string) => {
    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من حذف الموقع "${name}" (${id})؟ سيؤدي ذلك لحذف تقارير الرصد المرتبطة به.`
      : `Are you sure you want to delete location "${name}" (${id})? This will delete associated reports.`;
    if (window.confirm(confirmMsg)) {
      deleteLocation(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <MapPin className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {t.locations.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.locations.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canExport && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
          )}
          <button
            onClick={() => {
              setLocationToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.locations.addNewLocation}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className={`w-4 h-4 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالمعرف، المحافظة، المركز، القطاع...' : 'Search ID, governorate, markaz, sector...'}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium">{language === 'ar' ? 'المحافظة:' : 'Governorate:'}</span>
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">{language === 'ar' ? `كافة المحافظات (${governorates.length})` : `All Governorates (${governorates.length})`}</option>
              {governorates.map(gov => (
                <option key={gov} value={gov}>{language === 'ar' ? gov : tGovernorate(gov)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium">{language === 'ar' ? 'تصنيف المنطقة:' : 'Zone Classification:'}</span>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">{language === 'ar' ? 'كافة التصنيفات' : 'All Classifications'}</option>
              <option value="منطقة خالية من الإصابة (PFA)">{language === 'ar' ? 'خالية (PFA)' : 'Pest Free Area (PFA)'}</option>
              <option value="منطقة منخفضة الإصابة (ALPP)">{language === 'ar' ? 'منخفضة (ALPP)' : 'Low Prevalence (ALPP)'}</option>
              <option value="منطقة متوسطة الإصابة">{language === 'ar' ? 'متوسطة' : 'Moderate Infestation'}</option>
              <option value="منطقة عالية الإصابة (بؤرة حجرية)">{language === 'ar' ? 'عالية (بؤرة حجرية)' : 'High Infestation (Quarantine Focus)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">{t.locations.colId}</th>
              <th className="py-3.5 px-4">{t.locations.colGov}</th>
              <th className="py-3.5 px-4">{t.locations.colMarkaz}</th>
              <th className="py-3.5 px-4">{t.locations.colCoordinates}</th>
              <th className="py-3.5 px-4">{t.locations.colArea}</th>
              <th className="py-3.5 px-4">{t.locations.colSector}</th>
              <th className="py-3.5 px-4">{t.locations.colClassification}</th>
              <th className="py-3.5 px-4">{t.reports.colAffectedArea}</th>
              <th className="py-3.5 px-4 text-center">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  {language === 'ar' ? 'لا توجد مواقع مطابقة للبحث أو التصفية' : 'No locations match search or filter'}
                </td>
              </tr>
            ) : (
              filteredLocations.map((loc) => {
                const status = locationZoneStatuses.find(s => s.location.id === loc.id);

                return (
                  <tr key={loc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {loc.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'ar' ? loc.governorate : tGovernorate(loc.governorate)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {language === 'ar' ? `مركز ${loc.markaz}` : `${loc.markaz} District`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600" dir="ltr">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-slate-400" />
                        <span>{loc.coordinates.lat.toFixed(3)}° N, {loc.coordinates.lng.toFixed(3)}° E</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(loc.agriculturalAreaFeddans / 1000).toFixed(0)} {language === 'ar' ? 'ألف فدان' : 'k Feddans'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {language === 'ar' ? loc.agriculturalSector : tSector(loc.agriculturalSector)}
                    </td>
                    <td className="py-3.5 px-4">
                      {status && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          status.classification === 'منطقة خالية من الإصابة (PFA)' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          status.classification === 'منطقة منخفضة الإصابة (ALPP)' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                          status.classification === 'منطقة متوسطة الإصابة' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            status.classification === 'منطقة خالية من الإصابة (PFA)' ? 'bg-emerald-500' :
                            status.classification === 'منطقة منخفضة الإصابة (ALPP)' ? 'bg-sky-500' :
                            status.classification === 'منطقة متوسطة الإصابة' ? 'bg-amber-500' :
                            'bg-rose-600'
                          }`} />
                          {language === 'ar' ? status.classification : tZone(status.classification)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                      {status?.totalAffectedFeddans || 0} <span className="font-normal text-slate-500 text-[11px]">{t.common.feddans}</span>
                      {status && status.activeReportsCount > 0 && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ({status.activeReportsCount} {language === 'ar' ? 'بلاغ نشط' : 'active reports'})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setLocationToEdit(loc);
                            setIsModalOpen(true);
                          }}
                          title={language === 'ar' ? 'تعديل بيانات الموقع' : 'Edit location'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(loc.id, `${loc.governorate} - ${loc.markaz}`)}
                            title={language === 'ar' ? 'حذف الموقع' : 'Delete location'}
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

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          {language === 'ar'
            ? <>عرض <strong>{filteredLocations.length}</strong> موقع ومركز زراعي مسجل</>
            : <>Displaying <strong>{filteredLocations.length}</strong> registered surveillance districts</>}
        </div>
        <div>
          {language === 'ar' ? 'تغطية جغرافية شاملة لمحافظات الدلتا، القناة، ومصر الوسطى والعليا والواحات' : 'Comprehensive geographical coverage across Delta, Canal, Middle/Upper Egypt and Oases'}
        </div>
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setLocationToEdit(null);
        }}
        onSave={(data) => {
          if (locationToEdit) {
            updateLocation(locationToEdit.id, data);
          } else {
            addLocation(data);
          }
        }}
        locationToEdit={locationToEdit}
      />
    </div>
  );
};
