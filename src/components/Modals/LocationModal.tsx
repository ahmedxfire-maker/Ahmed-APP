import React, { useState, useEffect } from 'react';
import { Location } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, Save, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Location, 'id'>) => void;
  locationToEdit?: Location | null;
}

const SECTORS = [
  'وجه بحري - الدلتا',
  'مصر الوسطى',
  'مصر العليا',
  'القناة وسيناء',
  'الأراضي الجديدة والواحات'
] as const;

export const LocationModal: React.FC<Props> = ({ isOpen, onClose, onSave, locationToEdit }) => {
  const { language, tSector } = useLanguage();
  const [governorate, setGovernorate] = useState('');
  const [markaz, setMarkaz] = useState('');
  const [lat, setLat] = useState<number>(30.5);
  const [lng, setLng] = useState<number>(31.2);
  const [agriculturalAreaFeddans, setAgriculturalAreaFeddans] = useState<number>(150000);
  const [agriculturalSector, setAgriculturalSector] = useState<typeof SECTORS[number]>('وجه بحري - الدلتا');

  useEffect(() => {
    if (locationToEdit) {
      setGovernorate(locationToEdit.governorate);
      setMarkaz(locationToEdit.markaz);
      setLat(locationToEdit.coordinates.lat);
      setLng(locationToEdit.coordinates.lng);
      setAgriculturalAreaFeddans(locationToEdit.agriculturalAreaFeddans);
      setAgriculturalSector(locationToEdit.agriculturalSector);
    } else {
      setGovernorate('');
      setMarkaz('');
      setLat(30.5);
      setLng(31.2);
      setAgriculturalAreaFeddans(150000);
      setAgriculturalSector('وجه بحري - الدلتا');
    }
  }, [locationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!governorate.trim() || !markaz.trim()) return;

    onSave({
      governorate: governorate.trim(),
      markaz: markaz.trim(),
      coordinates: {
        lat: Number(lat) || 30.0,
        lng: Number(lng) || 31.0
      },
      agriculturalAreaFeddans: Number(agriculturalAreaFeddans) || 10000,
      agriculturalSector
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <MapPin className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {locationToEdit 
                ? (language === 'ar' ? 'تعديل بيانات الموقع الزراعي' : 'Edit Phytosanitary Location') 
                : (language === 'ar' ? 'إضافة موقع جغرافي ومركز زراعي' : 'Add New Agricultural District')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المحافظة / المنطقة الزراعية *' : 'Governorate / Region *'}
              </label>
              <input
                type="text"
                required
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: البحيرة، الشرقية، الفيوم' : 'e.g. Beheira, Sharqia, Faiyum'}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المركز أو الإدارة الزراعية *' : 'District (Markaz) *'}
              </label>
              <input
                type="text"
                required
                value={markaz}
                onChange={(e) => setMarkaz(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: دمنهور، إيتاي البارود' : 'e.g. Damanhour, Itay El Baroud'}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'دائرة العرض (Latitude) *' : 'Latitude *'}
              </label>
              <input
                type="number"
                step="0.0001"
                required
                dir="ltr"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                placeholder="24.0 - 31.8"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'خط الطول (Longitude) *' : 'Longitude *'}
              </label>
              <input
                type="number"
                step="0.0001"
                required
                dir="ltr"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                placeholder="28.0 - 35.0"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'مساحة الرقعة الزراعية (فدان)' : 'Agricultural Area (Feddans)'}
              </label>
              <input
                type="number"
                required
                min="100"
                value={agriculturalAreaFeddans}
                onChange={(e) => setAgriculturalAreaFeddans(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'القطاع الزراعي الجغرافي' : 'Agricultural Sector'}
              </label>
              <select
                value={agriculturalSector}
                onChange={(e) => setAgriculturalSector(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              >
                {SECTORS.map(sec => (
                  <option key={sec} value={sec}>{language === 'ar' ? sec : tSector(sec)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {language === 'ar' ? 'حفظ بيانات الموقع' : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
