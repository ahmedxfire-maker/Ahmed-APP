import React, { useState, useEffect } from 'react';
import { Pest, PestType, QuarantineCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, Save, Bug } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Pest, 'id'>) => void;
  pestToEdit?: Pest | null;
}

const PEST_TYPES: PestType[] = [
  'حشرية',
  'فطرية',
  'نيماتودا',
  'حشائش',
  'اكاروسي',
  'قوارض',
  'بكتيري',
  'طحالب',
  'فقاريات'
];

const QUARANTINE_CATEGORIES: QuarantineCategory[] = [
  'آفة حجرية أ1 (محظورة تماماً)',
  'آفة حجرية أ2 (محدودة الانتشار تحت الحصار)',
  'آفة اقتصادية خاضعة للرقابة (RNQP)'
];

export const PestModal: React.FC<Props> = ({ isOpen, onClose, onSave, pestToEdit }) => {
  const { language, tCategory, tPestType, tRisk } = useLanguage();
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [type, setType] = useState<PestType>('حشرية');
  const [quarantineCategory, setQuarantineCategory] = useState<QuarantineCategory>('آفة حجرية أ2 (محدودة الانتشار تحت الحصار)');
  const [primaryHostCrops, setPrimaryHostCrops] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<'منخفض' | 'متوسط' | 'مرتفع' | 'حرج جداً'>('مرتفع');

  useEffect(() => {
    if (pestToEdit) {
      setCommonName(pestToEdit.commonName);
      setScientificName(pestToEdit.scientificName);
      setType(pestToEdit.type);
      setQuarantineCategory(pestToEdit.quarantineCategory);
      setPrimaryHostCrops(pestToEdit.primaryHostCrops.join(', '));
      setDescription(pestToEdit.description);
      setRiskLevel(pestToEdit.riskLevel);
    } else {
      setCommonName('');
      setScientificName('');
      setType('حشرية');
      setQuarantineCategory('آفة حجرية أ2 (محدودة الانتشار تحت الحصار)');
      setPrimaryHostCrops(language === 'ar' ? 'القمح، الذرة' : 'Wheat, Corn');
      setDescription('');
      setRiskLevel('مرتفع');
    }
  }, [pestToEdit, isOpen, language]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonName.trim() || !scientificName.trim()) return;

    onSave({
      commonName: commonName.trim(),
      scientificName: scientificName.trim(),
      type,
      quarantineCategory,
      primaryHostCrops: primaryHostCrops.split(',').map(c => c.trim()).filter(Boolean),
      description: description.trim(),
      riskLevel
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Bug className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {pestToEdit 
                ? (language === 'ar' ? 'تعديل بيانات آفة زراعية' : 'Edit Pest Registry Record') 
                : (language === 'ar' ? 'إضافة آفة زراعية / حجرية جديدة' : 'Add New Agricultural / Quarantine Pest')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الاسم الشائع للآفة *' : 'Pest Common Name *'}
              </label>
              <input
                type="text"
                required
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: سوسة النخيل الحمراء' : 'e.g. Red Palm Weevil'}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الاسم العلمي اللاتيني *' : 'Scientific Binomial Name *'}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="e.g. Rhynchophorus ferrugineus"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'نوع الآفة * (9 فئات معتمدة)' : 'Pest Biological Type *'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PestType)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                {PEST_TYPES.map(t => (
                  <option key={t} value={t}>{language === 'ar' ? t : tPestType(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'درجة الخطورة الوبائية' : 'Epidemiological Risk Level'}
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                {(['منخفض', 'متوسط', 'مرتفع', 'حرج جداً'] as const).map(lvl => (
                  <option key={lvl} value={lvl}>{language === 'ar' ? lvl : tRisk(lvl)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'التصنيف الحجري الدولي (Quarantine Status)' : 'Quarantine Regulatory Category (IPPC)'}
            </label>
            <select
              value={quarantineCategory}
              onChange={(e) => setQuarantineCategory(e.target.value as QuarantineCategory)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              {QUARANTINE_CATEGORIES.map(qc => (
                <option key={qc} value={qc}>{language === 'ar' ? qc : tCategory(qc)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'المحاصيل العائلة الرئيسية (مفصولة بفاصلة)' : 'Primary Host Crops (comma-separated)'}
            </label>
            <input
              type="text"
              value={primaryHostCrops}
              onChange={(e) => setPrimaryHostCrops(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: القمح، الشعير، الذرة الشامية' : 'e.g. Wheat, Barley, Maize'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'الوصف وأعراض الإصابة والأثر الاقتصادي' : 'Symptoms, Life Cycle & Economic Impact'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب وصفاً موجزاً لأعراض الإصابة الحقلية ودورة حياة الآفة...' : 'Enter symptoms, biological life cycle, and impact...'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
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
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {language === 'ar' ? 'حفظ بيانات الآفة' : 'Save Pest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
