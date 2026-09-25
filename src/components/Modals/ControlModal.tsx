import React, { useState, useEffect } from 'react';
import { ControlMeasure } from '../../types';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Save, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ControlMeasure, 'id'>) => void;
  controlToEdit?: ControlMeasure | null;
}

export const ControlModal: React.FC<Props> = ({ isOpen, onClose, onSave, controlToEdit }) => {
  const { pests } = useDatabase();
  const { language, tPestName } = useLanguage();

  const [pestId, setPestId] = useState('');
  const [pesticideName, setPesticideName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [phiDays, setPhiDays] = useState<number>(14);
  const [dosageAndMethod, setDosageAndMethod] = useState('');
  const [quarantineMeasures, setQuarantineMeasures] = useState('');
  const [approvalAuthority, setApprovalAuthority] = useState('لجنة مبيدات الآفات الزراعية المصرية');

  useEffect(() => {
    if (controlToEdit) {
      setPestId(controlToEdit.pestId);
      setPesticideName(controlToEdit.pesticideName);
      setActiveIngredient(controlToEdit.activeIngredient);
      setPhiDays(controlToEdit.phiDays);
      setDosageAndMethod(controlToEdit.dosageAndMethod);
      setQuarantineMeasures(controlToEdit.quarantineMeasures);
      setApprovalAuthority(controlToEdit.approvalAuthority);
    } else {
      setPestId(pests[0]?.id || '');
      setPesticideName('');
      setActiveIngredient('');
      setPhiDays(14);
      setDosageAndMethod('');
      setQuarantineMeasures('');
      setApprovalAuthority(language === 'ar' ? 'لجنة مبيدات الآفات الزراعية المصرية' : 'Agricultural Pesticides Committee (APC)');
    }
  }, [controlToEdit, isOpen, pests, language]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pestId || !pesticideName.trim() || !activeIngredient.trim()) return;

    onSave({
      pestId,
      pesticideName: pesticideName.trim(),
      activeIngredient: activeIngredient.trim(),
      phiDays: Number(phiDays) || 0,
      dosageAndMethod: dosageAndMethod.trim(),
      quarantineMeasures: quarantineMeasures.trim(),
      approvalAuthority: approvalAuthority.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {controlToEdit 
                ? (language === 'ar' ? 'تعديل توصية وبروتوكول مكافحة' : 'Edit Control Recommendation') 
                : (language === 'ar' ? 'إضافة توصية مكافحة وتدبير حجري' : 'Add Phytosanitary Control Measure')}
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'الآفة المستهدفة بالتوصية *' : 'Target Pest *'}
            </label>
            <select
              required
              value={pestId}
              onChange={(e) => setPestId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            >
              {pests.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ar' ? p.commonName : tPestName(p.commonName)} ({p.scientificName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'نوع المبيد الموصى به *' : 'Recommended Chemical / Product *'}
              </label>
              <input
                type="text"
                required
                value={pesticideName}
                onChange={(e) => setPesticideName(e.target.value)}
                placeholder={language === 'ar' ? 'الاسم التجاري والتركيز' : 'Trade name & concentration'}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المادة الفعالة (Active Ingredient) *' : 'Active Ingredient (a.i.) *'}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                placeholder="e.g. Chlorantraniliprole 20%"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'فترة ما قبل الحصاد (PHI بالأيام) *' : 'Pre-Harvest Interval (PHI in Days) *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={phiDays}
                onChange={(e) => setPhiDays(parseInt(e.target.value) || 0)}
                placeholder={language === 'ar' ? 'مثال: 7 أو 14 أو 21 يوماً' : 'e.g. 7, 14, or 21 days'}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'جهة الاعتماد والتسجيل' : 'Registration Authority'}
              </label>
              <input
                type="text"
                value={approvalAuthority}
                onChange={(e) => setApprovalAuthority(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'الجرعة وطريقة التطبيق الحقلية *' : 'Field Dosage & Application Technique *'}
            </label>
            <textarea
              rows={2}
              required
              value={dosageAndMethod}
              onChange={(e) => setDosageAndMethod(e.target.value)}
              placeholder={language === 'ar' ? 'الجرعة لكل فدان أو لكل 100 لتر ماء، وتوقيت الرش...' : 'Dosage per feddan / 100L water and application timing...'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'تدابير الحجر الصحي والإجراءات الوقائية الإلزامية *' : 'Mandatory Quarantine Protocols & Restrictions *'}
            </label>
            <textarea
              rows={2}
              required
              value={quarantineMeasures}
              onChange={(e) => setQuarantineMeasures(e.target.value)}
              placeholder={language === 'ar' ? 'إجراءات الحصار، حظر نقل الشتلات، التخلص الآمن من المخلفات...' : 'Containment procedures, movement restrictions, safe disposal...'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
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
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {language === 'ar' ? 'حفظ بروتوكول المكافحة' : 'Save Recommendation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
