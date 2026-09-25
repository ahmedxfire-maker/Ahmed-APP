import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ControlMeasure } from '../../types';
import { ControlModal } from '../Modals/ControlModal';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Clock, 
  FlaskConical, 
  ShieldCheck,
  Filter
} from 'lucide-react';

export const ControlMeasuresTable: React.FC = () => {
  const { controlMeasures, addControlMeasure, updateControlMeasure, deleteControlMeasure, pests } = useDatabase();
  const { t, language, tPestName } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPestId, setSelectedPestId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controlToEdit, setControlToEdit] = useState<ControlMeasure | null>(null);
  const { currentUser, isSuperAdmin, hasPermission } = useAuth();
  const isEmployee = currentUser?.role === 'employee';
  const canDelete = !isEmployee && (isSuperAdmin || hasPermission('canDeleteData'));

  const filteredControls = useMemo(() => {
    return controlMeasures.filter(c => {
      const pest = pests.find(p => p.id === c.pestId);

      const matchesSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pesticideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.quarantineMeasures.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pest && `${pest.commonName} ${pest.scientificName}`.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPest = selectedPestId === 'all' || c.pestId === selectedPestId;

      return matchesSearch && matchesPest;
    });
  }, [controlMeasures, searchTerm, selectedPestId, pests]);

  const handleExportCSV = () => {
    const headers = language === 'ar' ? [
      'معرف التوصية',
      'معرف الآفة',
      'اسم الآفة',
      'نوع المبيد الموصى به',
      'المادة الفعالة',
      'فترة ما قبل الحصاد (PHI بالأيام)',
      'الجرعة وطريقة التطبيق',
      'تدابير الحجر الصحي والإجراءات الوقائية'
    ] : [
      'Protocol ID',
      'Pest ID',
      'Pest Name',
      'Pesticide Name',
      'Active Ingredient',
      'PHI (Days)',
      'Dosage & Method',
      'Quarantine Protocols'
    ];

    const rows = filteredControls.map(c => {
      const pest = pests.find(p => p.id === c.pestId);
      return [
        c.id,
        c.pestId,
        `"${pest ? (language === 'ar' ? pest.commonName : tPestName(pest.commonName)) : ''}"`,
        `"${c.pesticideName}"`,
        `"${c.activeIngredient}"`,
        c.phiDays,
        `"${c.dosageAndMethod}"`,
        `"${c.quarantineMeasures}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Phytosanitary_Control_Measures_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    const confirmMsg = language === 'ar'
      ? `هل تريد بالتأكيد حذف توصية المكافحة رقم "${id}"؟`
      : `Are you sure you want to delete control measure "${id}"?`;
    if (window.confirm(confirmMsg)) {
      deleteControlMeasure(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {t.control.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.control.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </button>
          <button
            onClick={() => {
              setControlToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.control.addNewMeasure}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالمبيد، المادة الفعالة، الآفة، تدبير الحجر...' : 'Search pesticide, active ingredient, pest, rule...'}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 font-medium shrink-0">{t.control.filterPest}</span>
          <select
            value={selectedPestId}
            onChange={(e) => setSelectedPestId(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">{language === 'ar' ? `كافة الآفات (${controlMeasures.length})` : `All Pests (${controlMeasures.length})`}</option>
            {pests.map(p => (
              <option key={p.id} value={p.id}>{language === 'ar' ? p.commonName : tPestName(p.id, p.commonName)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">{t.control.colId}</th>
              <th className="py-3.5 px-4">{t.control.colPest}</th>
              <th className="py-3.5 px-4">{t.control.colPesticide}</th>
              <th className="py-3.5 px-4">{t.control.colActiveIngredient}</th>
              <th className="py-3.5 px-4">{t.control.colPhi}</th>
              <th className="py-3.5 px-4">{t.control.colDosage}</th>
              <th className="py-3.5 px-4">{t.control.colQuarantineRules}</th>
              <th className="py-3.5 px-4 text-center">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredControls.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  {language === 'ar' ? 'لا توجد توصيات مكافحة مطابقة لخيارات البحث' : 'No control protocols match current filter'}
                </td>
              </tr>
            ) : (
              filteredControls.map((control) => {
                const pest = pests.find(p => p.id === control.pestId);

                return (
                  <tr key={control.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {control.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="text-slate-900">
                        {pest ? (language === 'ar' ? pest.commonName : tPestName(pest.commonName)) : control.pestId}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono italic" dir="ltr">
                        {pest?.scientificName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{control.pesticideName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600" dir="ltr">
                      {control.activeIngredient}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        control.phiDays === 0 ? 'bg-emerald-100 text-emerald-800' :
                        control.phiDays <= 7 ? 'bg-blue-100 text-blue-800' :
                        control.phiDays <= 21 ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {control.phiDays} {language === 'ar' ? 'يوم' : 'days'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-[11px] text-slate-600">
                      {control.dosageAndMethod}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm text-[11px] text-slate-700 bg-amber-50/40 p-2 rounded">
                      <div className="flex items-start gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{control.quarantineMeasures}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setControlToEdit(control);
                            setIsModalOpen(true);
                          }}
                          title={language === 'ar' ? 'تعديل التوصية' : 'Edit protocol'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {canDelete && !isEmployee && (
                          <button
                            onClick={() => handleDelete(control.id)}
                            title={language === 'ar' ? 'حذف التوصية' : 'Delete protocol'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
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
            ? <>عرض <strong>{filteredControls.length}</strong> من أصل <strong>{controlMeasures.length}</strong> بروتوكول مكافحة</>
            : <>Displaying <strong>{filteredControls.length}</strong> of <strong>{controlMeasures.length}</strong> control protocols</>}
        </div>
        <div>
          {language === 'ar' ? 'المبيدات خاضعة لمطابقة لجنة مبيدات الآفات الزراعية المصرية (APC)' : 'All pesticide recommendations approved by Egyptian Agricultural Pesticide Committee (APC)'}
        </div>
      </div>

      <ControlModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setControlToEdit(null);
        }}
        onSave={(data) => {
          if (controlToEdit) {
            updateControlMeasure(controlToEdit.id, data);
          } else {
            addControlMeasure(data);
          }
        }}
        controlToEdit={controlToEdit}
      />
    </div>
  );
};
