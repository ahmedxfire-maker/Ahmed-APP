import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Pest, PestType } from '../../types';
import { PestModal } from '../Modals/PestModal';
import { 
  Bug, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Filter, 
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  Printer,
  FileDown,
  Loader2
} from 'lucide-react';
import { exportPestsToCSV, exportPestsToXLSX, exportPestsToPDF } from '../../utils/exportUtils';

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

interface PestsTableProps {
  onSelectPest?: (pestId: string) => void;
  onOpenPrintReport?: (mode: 'pests') => void;
}

export const PestsTable: React.FC<PestsTableProps> = ({ onSelectPest, onOpenPrintReport }) => {
  const { pests, addPest, updatePest, deletePest, reports, getControlByPestId } = useDatabase();
  const { t, language, tPestType, tCrop, tCategory, tPestName } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pestToEdit, setPestToEdit] = useState<Pest | null>(null);
  const { currentUser, isSuperAdmin, hasPermission } = useAuth();
  const isEmployee = currentUser?.role === 'employee';
  const canDelete = !isEmployee && (isSuperAdmin || hasPermission('canDeleteData'));
  const canCreate = hasPermission('canCreatePests');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const filteredPests = useMemo(() => {
    return pests.filter(p => {
      const matchesSearch = 
        p.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.primaryHostCrops.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [pests, searchTerm, selectedType]);

  const handleExportCSV = () => {
    exportPestsToCSV(filteredPests);
  };

  const handleExportXLSX = () => {
    exportPestsToXLSX(filteredPests);
  };

  const handleDownloadDirectPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportPestsToPDF(filteredPests);
    } catch (error) {
      console.error('Failed to export Pests PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrintPDF = () => {
    if (onOpenPrintReport) {
      onOpenPrintReport('pests');
    } else {
      window.print();
    }
  };

  const handleDelete = (id: string, name: string) => {
    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من حذف الآفة "${name}" (${id}) من قاعدة البيانات؟`
      : `Are you sure you want to delete pest "${name}" (${id}) from the database?`;
    if (window.confirm(confirmMsg)) {
      deletePest(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Bug className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {t.pests.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.pests.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct PDF Download */}
          <button
            id="export-pests-pdf-btn"
            onClick={handleDownloadDirectPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 border border-rose-200 rounded-xl transition cursor-pointer shadow-2xs"
            title={language === 'ar' ? 'تصدير سجل حصر الآفات بصيغة PDF معتمدة ومجهزة للطباعة والتقديم' : 'Export certified pest inventory PDF'}
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-rose-600" />
            )}
            <span>{isExportingPDF ? (language === 'ar' ? 'جارٍ توليد PDF...' : 'Generating PDF...') : (language === 'ar' ? 'تحميل وثيقة PDF' : 'Download PDF')}</span>
          </button>

          {/* Export Excel (XLSX) */}
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
            title={language === 'ar' ? 'تصدير حصر الآفات لملف إكسيل Excel (XLSX) معتمد' : 'Export pest inventory as Excel'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ar' ? 'تصدير Excel' : 'Export Excel'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
            title={language === 'ar' ? 'تصدير حصر الآفات لملف CSV' : 'Export pest inventory as CSV'}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition cursor-pointer"
            title={language === 'ar' ? 'عرض وطباعة تقرير حصر الآفات الرسمي بصيغة PDF' : 'Open Official Pest Report Center'}
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'مركز التقارير' : 'Report Center'}</span>
          </button>

          {/* Add Pest */}
          <button
            onClick={() => {
              setPestToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.pests.addNewPest}</span>
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
            placeholder={language === 'ar' ? 'بحث بالاسم الشائع، العلمي، المعرف، المحصول...' : 'Search common name, scientific name, crop...'}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 font-medium shrink-0">{t.pests.filterType}</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">{language === 'ar' ? `كافة الأنواع (${pests.length})` : `All Types (${pests.length})`}</option>
            {PEST_TYPES.map(type => (
              <option key={type} value={type}>
                {language === 'ar' ? type : tPestType(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} text-xs`}>
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">{t.pests.colCode}</th>
              <th className="py-3.5 px-4">{t.pests.colCommonName}</th>
              <th className="py-3.5 px-4">{t.pests.colScientificName}</th>
              <th className="py-3.5 px-4">{t.pests.colType}</th>
              <th className="py-3.5 px-4">{t.pests.colCategory}</th>
              <th className="py-3.5 px-4">{t.pests.colHostCrops}</th>
              <th className="py-3.5 px-4">{language === 'ar' ? 'تقارير الرصد النشطة' : 'Active Reports'}</th>
              <th className="py-3.5 px-4 text-center">{t.pests.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredPests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  {language === 'ar' ? 'لا توجد نتائج مطابقة لخيارات البحث أو التصفية الحالية' : 'No records match current filter criteria'}
                </td>
              </tr>
            ) : (
              filteredPests.map((pest) => {
                const activeReports = reports.filter(r => r.pestId === pest.id);
                const controlCount = getControlByPestId(pest.id).length;

                return (
                  <tr key={pest.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {pest.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{language === 'ar' ? pest.commonName : tPestName(pest.commonName)}</span>
                        {pest.riskLevel === 'حرج جداً' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono italic text-slate-600" dir="ltr">
                      {pest.scientificName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        pest.type === 'حشرية' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        pest.type === 'بكتيري' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                        pest.type === 'فطرية' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        pest.type === 'نيماتودا' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        pest.type === 'حشائش' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        pest.type === 'اكاروسي' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                        pest.type === 'قوارض' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {language === 'ar' ? pest.type : tPestType(pest.type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold ${
                        pest.quarantineCategory?.includes('أ1') ? 'text-rose-700 font-bold' :
                        pest.quarantineCategory?.includes('أ2') ? 'text-amber-700 font-semibold' :
                        'text-slate-600'
                      }`}>
                        {language === 'ar' ? pest.quarantineCategory : tCategory(pest.quarantineCategory)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {pest.primaryHostCrops.map(crop => (
                          <span key={crop} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700">
                            {language === 'ar' ? crop : tCrop(crop)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          activeReports.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {activeReports.length} {language === 'ar' ? 'بلاغ' : 'reports'}
                        </span>
                        {controlCount > 0 && (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            ({controlCount} {language === 'ar' ? 'بروتوكول مكافحة' : 'protocols'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPestToEdit(pest);
                            setIsModalOpen(true);
                          }}
                          title={language === 'ar' ? 'تعديل بيانات الآفة' : 'Edit pest'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {canDelete && !isEmployee && (
                          <button
                            onClick={() => handleDelete(pest.id, pest.commonName)}
                            title={language === 'ar' ? 'حذف الآفة' : 'Delete pest'}
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

      {/* Table Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          {language === 'ar' 
            ? <>عرض <strong>{filteredPests.length}</strong> من أصل <strong>{pests.length}</strong> آفة مسجلة</>
            : <>Displaying <strong>{filteredPests.length}</strong> of <strong>{pests.length}</strong> registered pests</>}
        </div>
        <div>
          {language === 'ar' ? 'قاعدة بيانات الحجر الزراعي - وزارة الزراعة واستصلاح الأراضي' : 'Central Administration of Plant Quarantine (CAPQ) - Ministry of Agriculture'}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <PestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPestToEdit(null);
        }}
        onSave={(data) => {
          if (pestToEdit) {
            updatePest(pestToEdit.id, data);
          } else {
            addPest(data);
          }
        }}
        pestToEdit={pestToEdit}
      />
    </div>
  );
};
