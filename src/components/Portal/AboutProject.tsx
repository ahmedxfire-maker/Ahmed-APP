import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Building2, 
  Wheat, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Globe, 
  Award, 
  CheckCircle2, 
  Scale, 
  Microscope,
  FlaskConical,
  Trees,
  Sprout
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const researchDepartments = [
    {
      title: isAr ? 'قسم بحوث الحشرات الاقتصادية وتصنيف الحشرات' : 'Economic Insects & Taxonomy Research Dept',
      desc: isAr ? 'المسؤول عن التشخيص المورفولوجي والوراثي الدقيق للحشرات الحجرية والغازية وتوثيق العينات المرجعية.' : 'Responsible for precise morphological and genetic diagnosis of exotic quarantine pests.'
    },
    {
      title: isAr ? 'قسم بحوث آفات الخضر والمحاصيل البستانية' : 'Horticultural & Vegetable Pest Research Dept',
      desc: isAr ? 'إجراء دراسات التعداد والكثافة الحشرية على الطماطم، البطاطس، العنب، والموالح ووضع برامج المكافحة المتكاملة IPM.' : 'Studies population dynamics and densities across vegetables and export fruits.'
    },
    {
      title: isAr ? 'قسم بحوث آفات النخيل والمناطق الصحراوية' : 'Date Palm & Desert Pests Research Dept',
      desc: isAr ? 'تنفيذ الحملة القومية لمكافحة سوسة النخيل الحمراء وحصر آفات التمور بالواحات والوادي الجديد وسيناء.' : 'Executing national campaign for Red Palm Weevil containment in oases and desert frontiers.'
    },
    {
      title: isAr ? 'قسم بحوث المكافحة الحيوية والمتطفلات' : 'Biological Control & Parasitoids Research Dept',
      desc: isAr ? 'تربية وإكثار الأعداء الحيوية والمفترسات محلياً للحد من استخدام المبيدات الكيميائية وضمان متطلبات التصدير.' : 'Mass-rearing local parasitoids and predators to reduce chemical load and meet export standards.'
    },
    {
      title: isAr ? 'قسم بحوث وقاية الحبوب والمواد المخزونة' : 'Stored Products Protection Research Dept',
      desc: isAr ? 'تأمين الصوامع ومخازن الغلال الاستراتيجية وموانئ الحجر الزراعي ضد حشرات وخنافس الحبوب.' : 'Protecting strategic grain silos and quarantine seaports from storage pests.'
    },
    {
      title: isAr ? 'معمل تحليل متبقيات المبيدات والسموم' : 'Pesticide Residue & Toxicity Analysis Lab',
      desc: isAr ? 'رصد فترات ما قبل الحصاد PHI وفحص الحدود القصوى للمتبقيات MRLs لضمان سلامة المستهلك والصادرات.' : 'Monitoring Pre-Harvest Intervals (PHI) and Maximum Residue Limits (MRL) for food safety.'
    }
  ];

  const regionalStations = [
    { name: isAr ? 'محطة بحوث سخا — كفر الشيخ' : 'Sakha Station — Kafr El-Sheikh', scope: isAr ? 'محاصيل الدلتا والقطن والأرز' : 'Delta Crops, Cotton & Rice' },
    { name: isAr ? 'محطة بحوث سدس — بني سويف' : 'Sids Station — Beni Suef', scope: isAr ? 'شمال ووسط الصعيد والمحاصيل الحقلية' : 'Middle Egypt & Field Crops' },
    { name: isAr ? 'محطة بحوث شندويل — سوهاج' : 'Shandaweel Station — Sohag', scope: isAr ? 'جنوب الصعيد وقصب السكر والبساتين' : 'Upper Egypt & Sugarcane' },
    { name: isAr ? 'محطة بحوث النوبارية — البحيرة' : 'Nubaria Station — Beheira', scope: isAr ? 'الأراضي المستصلحة والمزارع التصديرية الكبرى' : 'Reclaimed Lands & Export Mega-farms' },
    { name: isAr ? 'محطة بحوث الإسماعيلية — القناة' : 'Ismailia Station — Suez Canal', scope: isAr ? 'الموالح والمانجو ومحاور التصدير الشرقي' : 'Citrus, Mango & Eastern Export Hubs' },
    { name: isAr ? 'محطة بحوث الخارجة — الوادي الجديد' : 'Kharga Station — New Valley', scope: isAr ? 'نخيل التمر والواحات والمشاريع القومية' : 'Date Palms, Oases & Toshka Corridors' }
  ];

  const projectObjectives = [
    isAr ? 'إنشاء قاعدة بيانات قومية جغرافية تفاعلية دقيقة لكافة أنواع الآفات الحجرية والاقتصادية بالقطر المصري.' : 'Establish a comprehensive GIS interactive database for all quarantine and economic pests in Egypt.',
    isAr ? 'التتبع المبكر وحصار بؤر الإصابة فور رصدها لمنع انتشارها وحماية الرقعة الزراعية.' : 'Early tracking and immediate isolation of outbreak hotspots to protect arable lands.',
    isAr ? 'دعم اعتماد المناطق الخالية من الآفات (PFA) طبقاً لمعيار الصحة النباتية الدولي ISPM 4 لفتح أسواق تصديرية جديدة.' : 'Support certification of Pest-Free Areas (PFA) under ISPM 4 international standards for export expansion.',
    isAr ? 'ترشيد استخدام المبيدات الكيميائية وتشجيع تطبيقات المكافحة الحيوية المتكاملة (IPM).' : 'Rationalize pesticide application while fostering Integrated Pest Management (IPM).',
    isAr ? 'تأهيل وتدريب مهندسي الإرشاد الزراعي ولجان الفحص الميداني وأصحاب الحيازات الزراعية.' : 'Capacity building for extension engineers, quarantine inspectors, and agricultural growers.'
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Institutional Hero Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'وزارة الزراعة واستصلاح الأراضي — مركز البحوث الزراعية' : 'Ministry of Agriculture & Land Reclamation — ARC'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {isAr 
              ? 'معهد بحوث وقاية النباتات (PPRI)' 
              : 'Plant Protection Research Institute (PPRI)'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {isAr
              ? 'يُعد معهد بحوث وقاية النباتات أحد أقدم وأكبر المعاهد البحثية التابعة لمركز البحوث الزراعية بجمهورية مصر العربية، حيث أُنشئ بهدف حماية الثروة الزراعية القومية من مخاطر الآفات الحشرية والحيوانية والأمراض النباتية، ووضع الاستراتيجيات العلمية المستدامة للمكافحة والحفاظ على التوازن البيئي وجودة الصادرات المصرية.'
              : 'The Plant Protection Research Institute (PPRI) is among the oldest and foremost scientific pillars under the Agricultural Research Center of Egypt, established to safeguard national agricultural assets against invasive pests, secure export quality, and formulate sustainable phytosanitary protection policies.'}
          </p>
        </div>
      </section>

      {/* 2. The National Project Overview */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {isAr ? 'المشروع القومي البحثي' : 'The National Research Project'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isAr 
              ? 'مشروع حصر أنواع وتوزيع وكثافة الآفات الزراعية على أهم المحاصيل بالزراعات المصرية' 
              : 'Project for Surveying Agricultural Pest Types, Distribution & Density on Major Crops in Egypt'}
          </h2>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          {isAr
            ? 'انطلاقاً من التوجيهات الرئاسية والوزارية لتعظيم الإنتاج الزراعي وتأمين الأمن الغذائي، ينفذ المعهد هذا المشروع بالتعاون الوثيق مع الإدارة المركزية للحجر الزراعي (CAPQ) والإدارة المركزية لمكافحة الآفات. يعمل المشروع على إجراء مسوح ميدانية موسمية شاملة وتطبيق تقنيات الاستشعار الجغرافي ونظم المعلومات GIS لرسم خريطة بيولوجية دقيقة لتواجد وكثافة الآفات على المحاصيل الاستراتيجية والتصديرية.'
            : 'Under national directives for maximizing agricultural productivity and food sovereignty, PPRI executes this project in partnership with the Central Administration of Plant Quarantine (CAPQ). The program deploys extensive seasonal field surveys and advanced GIS systems to map pest distribution and outbreak risks across all prime Egyptian governorates.'}
        </p>

        {/* Project Objectives Grid */}
        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'الأهداف الاستراتيجية للمشروع:' : 'Strategic Project Objectives:'}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Research Departments */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-900">
            {isAr ? 'الأقسام البحثية والمختبرات المتخصصة' : 'Specialized Research Departments & Laboratories'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {isAr ? 'كوادر علمية ومختبرات معتمدة دولياً لتحليل العينات وتشخيص الآفات' : 'Scientific faculty and accredited diagnostic laboratories'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {researchDepartments.map((dept, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Microscope className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{dept.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{dept.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Regional Stations Network */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>{isAr ? 'شبكة المحطات الإقليمية بالمحافظات' : 'National Regional Research Stations Network'}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {isAr ? 'أذرع ميدانية تغطي كافة البيئات الزراعية المصرية من الدلتا إلى أقصى الصعيد والوادي الجديد' : 'Field stations covering all microclimates from Nile Delta to Upper Egypt and desert frontiers'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {regionalStations.map((station, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-900">{station.name}</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">{station.scope}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Legal & Regulatory Framework */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Scale className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {isAr ? 'المرجعيات التشريعية والمعايير الدولية المعتمدة' : 'Legislative References & International Standards'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-white text-sm mb-1">
              {isAr ? 'قانون الزراعة المصري رقم 53 لسنة 1966' : 'Egyptian Agriculture Law No. 53/1966'}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isAr ? 'ينظم اشتراطات الحجر الزراعي الداخلي والخارجي، ومسؤوليات ضبط وحصار الآفات ومنع دخول المسببات الحجرية.' : 'Regulates domestic and border quarantine controls and pest containment mandates.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-white text-sm mb-1">
              {isAr ? 'معايير الصحة النباتية الدولية (ISPM)' : 'International Standards (ISPM / IPPC)'}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isAr ? 'تطبيق المعايير ISPM 4 (المناطق الخالية PFA) وISPM 6 (مراقبة ورصد الآفات) وISPM 8 (تحديد حالة الآفة في منطقة ما).' : 'Compliance with ISPM 4 (Pest Free Areas), ISPM 6 (Surveillance), and ISPM 8 (Pest Status).'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-white text-sm mb-1">
              {isAr ? 'لجنة مبيدات الآفات الزراعية (APC)' : 'Agricultural Pesticide Committee (APC)'}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isAr ? 'الالتزام بكتيب التوصيات الفنية المعتمدة للمبيدات ومطابقة الحدود القصوى للمتبقيات لأسواق التصدير الأوروبية والعالمية.' : 'Adherence to approved chemical registrations and strict Maximum Residue Limits (MRLs).'}
            </p>
          </div>
        </div>
      </section>

      {/* 6. Headquarters & Official Contact Directory */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 mb-4">
          {isAr ? 'المقر الرئيسي وقنوات التواصل الرسمي' : 'Headquarters & Official Contact Directory'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{isAr ? 'العنوان' : 'Address'}</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {isAr ? '7 شارع نادي الصيد، الدقي، الجيزة، جمهورية مصر العربية' : '7 Nadi El-Seid Street, Dokki, Giza, Egypt'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{isAr ? 'الخط الساخن والبدالة' : 'Hotline & Telephone'}</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                <span>{isAr ? 'الخط الساخن الموحد:' : 'Emergency Hotline:'} 19561</span><br />
                <span>+20 2 37604746 / 37604747</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{isAr ? 'البريد الإلكتروني والبوابة' : 'Email & Digital Portal'}</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                <span>info@ppri.gov.eg</span><br />
                <span>quarantine.surveillance@arc.gov.eg</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
