import { Pest, Location, InfestationReport, ControlMeasure } from '../types';

export const initialPests: Pest[] = [
  {
    id: 'PEST-001',
    commonName: 'سوسة النخيل الحمراء',
    scientificName: 'Rhynchophorus ferrugineus',
    type: 'حشرية',
    quarantineCategory: 'آفة حجرية أ2 (محدودة الانتشار تحت الحصار)',
    primaryHostCrops: ['نخيل البلح', 'نخيل الزينة'],
    description: 'حشرة غازية خطيرة تحفر يرقاتها في جذوع النخيل مسببة تآكل الأنسجة الوعائية وانهيار القمة النامية.',
    riskLevel: 'حرج جداً'
  },
  {
    id: 'PEST-002',
    commonName: 'ذبابة ثمار الخوخ / الفاكهة',
    scientificName: 'Bactrocera zonata',
    type: 'حشرية',
    quarantineCategory: 'آفة حجرية أ2 (محدودة الانتشار تحت الحصار)',
    primaryHostCrops: ['الموالح', 'المانجو', 'الخوخ', 'الجوافة', 'المشمش'],
    description: 'تضع إناثها البيض تحت بشرة الثمار مما يؤدي لتعفن اللب وتساقط المحصول، وتعد عائقاً رئيساً للتصدير.',
    riskLevel: 'حرج جداً'
  },
  {
    id: 'PEST-003',
    commonName: 'العفن البني في البطاطس',
    scientificName: 'Ralstonia solanacearum',
    type: 'بكتيري',
    quarantineCategory: 'آفة حجرية أ1 (محظورة تماماً)',
    primaryHostCrops: ['البطاطس', 'الطماطم', 'الباذنجان'],
    description: 'مرض بكتيري خطير يؤدي إلى ذبول النبات وتلون الحزم الوعائية للدرنات باللون البني وإفراز إفرازات بكتيرية.',
    riskLevel: 'حرج جداً'
  },
  {
    id: 'PEST-004',
    commonName: 'صانعة أنفاق الطماطم (توتا أبسلوتا)',
    scientificName: 'Tuta absoluta',
    type: 'حشرية',
    quarantineCategory: 'آفة حجرية أ2 (محدودة الانتشار تحت الحصار)',
    primaryHostCrops: ['الطماطم', 'الفلفل', 'الباذنجان'],
    description: 'فراشة صغيرة تتغذى يرقاتها بين بشرتي الورقة وتثقب الثمار مما يقلل الإنتاجية بنسبة قد تصل إلى 90%.',
    riskLevel: 'مرتفع'
  },
  {
    id: 'PEST-005',
    commonName: 'صدأ القمح الأصفر (المخطط)',
    scientificName: 'Puccinia striiformis',
    type: 'فطرية',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['القمح', 'الشعير'],
    description: 'فطر يظهر على هيئة بثور صفراء مسحوقية في خطوط طولية على نصل الورقة ويسبب ضمور الحبوب ونقص المحصول.',
    riskLevel: 'مرتفع'
  },
  {
    id: 'PEST-006',
    commonName: 'نيماتودا تعقد الجذور',
    scientificName: 'Meloidogyne incognita',
    type: 'نيماتودا',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['الموز', 'الطماطم', 'العنب', 'البطاطس', 'الخيار'],
    description: 'ديدان مجهرية تهاجم المجموع الجذري مسببة تكون عقد وأورام تعيق امتصاص الماء والعناصر الغذائية.',
    riskLevel: 'متوسط'
  },
  {
    id: 'PEST-007',
    commonName: 'هالوك الفول البلدي',
    scientificName: 'Orobanche crenata',
    type: 'حشائش',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['الفول البلدي', 'البسلة', 'الحمص'],
    description: 'نبات زهري طفيلي كامل خالي من الكلوروفيل يتطفل على جذور البقوليات ويمتص الغذاء مسبباً موت العائل.',
    riskLevel: 'مرتفع'
  },
  {
    id: 'PEST-008',
    commonName: 'العنكبوت الأحمر ذو البقعتين',
    scientificName: 'Tetranychus urticae',
    type: 'اكاروسي',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['الفراولة', 'القطن', 'القرعيات', 'فول الصويا'],
    description: 'أكاروس يمتص عصارة الأوراق من السطح السفلي وينسج خيوطاً عنكبوتية كثيفة تسبب اصفرار وجفاف الأوراق.',
    riskLevel: 'متوسط'
  },
  {
    id: 'PEST-009',
    commonName: 'فأر الغيط النيلي',
    scientificName: 'Arvicanthis niloticus',
    type: 'قوارض',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['قصب السكر', 'القمح', 'الذرة الشامية', 'الأرز'],
    description: 'قارض حقلي يقرض سيقان القصب وسنابل القمح وأكواز الذرة ويحدث فاقداً هائلاً أثناء النضج وقبل الحصاد.',
    riskLevel: 'متوسط'
  },
  {
    id: 'PEST-010',
    commonName: 'دودة ورق القطن',
    scientificName: 'Spodoptera littoralis',
    type: 'حشرية',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['القطن', 'البرسيم', 'الذرة', 'الخضراوات'],
    description: 'يرقات شرهة تلتهم مساحات واسعة من المجموع الخضري والبراعم الزهرية ولوز القطن وتتكاثر بسرعة فائقة.',
    riskLevel: 'مرتفع'
  },
  {
    id: 'PEST-011',
    commonName: 'طحالب انسداد قنوات الري والأرز',
    scientificName: 'Cladophora & Spirogyra spp.',
    type: 'طحالب',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['حقول الأرز', 'قنوات الري والصرف المغطى'],
    description: 'تكون حصائر طحلبية كثيفة تعيق حركة مياه الري وتخنق بادرات الأرز حديثة الشتل في مياه الغمر.',
    riskLevel: 'منخفض'
  },
  {
    id: 'PEST-012',
    commonName: 'عصفور دوري المزارع النيلي',
    scientificName: 'Passer domesticus niloticus',
    type: 'فقاريات',
    quarantineCategory: 'آفة اقتصادية خاضعة للرقابة (RNQP)',
    primaryHostCrops: ['القمح', 'دوار الشمس', 'الذرة الرفيعة'],
    description: 'تهاجم أسرابه سنابل الحبوب في الطور اللبني والعجيني مسببة تساقط وضياع نسب معتبرة من المحصول في أطراف الحقول.',
    riskLevel: 'منخفض'
  }
];

export const initialLocations: Location[] = [
  {
    id: 'LOC-001',
    governorate: 'البحيرة',
    markaz: 'دمنهور',
    coordinates: { lat: 31.0379, lng: 30.4688 },
    agriculturalAreaFeddans: 145000,
    agriculturalSector: 'وجه بحري - الدلتا'
  },
  {
    id: 'LOC-002',
    governorate: 'البحيرة',
    markaz: 'النوبارية',
    coordinates: { lat: 30.6667, lng: 30.0667 },
    agriculturalAreaFeddans: 320000,
    agriculturalSector: 'الأراضي الجديدة والواحات'
  },
  {
    id: 'LOC-003',
    governorate: 'الشرقية',
    markaz: 'الزقازيق',
    coordinates: { lat: 30.5877, lng: 31.502 },
    agriculturalAreaFeddans: 165000,
    agriculturalSector: 'وجه بحري - الدلتا'
  },
  {
    id: 'LOC-004',
    governorate: 'الشرقية',
    markaz: 'الصالحية الجديدة',
    coordinates: { lat: 30.7416, lng: 31.9056 },
    agriculturalAreaFeddans: 180000,
    agriculturalSector: 'الأراضي الجديدة والواحات'
  },
  {
    id: 'LOC-005',
    governorate: 'كفر الشيخ',
    markaz: 'بيلا ودسوق',
    coordinates: { lat: 31.1107, lng: 30.9388 },
    agriculturalAreaFeddans: 285000,
    agriculturalSector: 'وجه بحري - الدلتا'
  },
  {
    id: 'LOC-006',
    governorate: 'الدقهلية',
    markaz: 'المنصورة وميت غمر',
    coordinates: { lat: 31.0409, lng: 31.3785 },
    agriculturalAreaFeddans: 210000,
    agriculturalSector: 'وجه بحري - الدلتا'
  },
  {
    id: 'LOC-007',
    governorate: 'الإسماعيلية',
    markaz: 'القنطرة شرق وفايد',
    coordinates: { lat: 30.5965, lng: 32.2715 },
    agriculturalAreaFeddans: 115000,
    agriculturalSector: 'القناة وسيناء'
  },
  {
    id: 'LOC-008',
    governorate: 'الفيوم',
    markaz: 'إطسا وطامية',
    coordinates: { lat: 29.3084, lng: 30.8428 },
    agriculturalAreaFeddans: 190000,
    agriculturalSector: 'مصر الوسطى'
  },
  {
    id: 'LOC-009',
    governorate: 'المنيا',
    markaz: 'ملوي وبني مزار',
    coordinates: { lat: 28.1099, lng: 30.7503 },
    agriculturalAreaFeddans: 310000,
    agriculturalSector: 'مصر الوسطى'
  },
  {
    id: 'LOC-010',
    governorate: 'أسيوط',
    markaz: 'القوصية ومنفلوط',
    coordinates: { lat: 27.1801, lng: 31.1837 },
    agriculturalAreaFeddans: 175000,
    agriculturalSector: 'مصر العليا'
  },
  {
    id: 'LOC-011',
    governorate: 'قنا',
    markaz: 'نجع حمادي وقوص',
    coordinates: { lat: 26.1551, lng: 32.716 },
    agriculturalAreaFeddans: 160000,
    agriculturalSector: 'مصر العليا'
  },
  {
    id: 'LOC-012',
    governorate: 'أسوان',
    markaz: 'كوم أمبو ونصر النوبة',
    coordinates: { lat: 24.0889, lng: 32.8998 },
    agriculturalAreaFeddans: 140000,
    agriculturalSector: 'مصر العليا'
  },
  {
    id: 'LOC-013',
    governorate: 'الوادي الجديد',
    markaz: 'الخارجة والداخلة',
    coordinates: { lat: 25.4514, lng: 30.5472 },
    agriculturalAreaFeddans: 230000,
    agriculturalSector: 'الأراضي الجديدة والواحات'
  },
  {
    id: 'LOC-014',
    governorate: 'الغربية',
    markaz: 'طنطا والمحلة الكبرى',
    coordinates: { lat: 30.7865, lng: 31.0004 },
    agriculturalAreaFeddans: 155000,
    agriculturalSector: 'وجه بحري - الدلتا'
  },
  {
    id: 'LOC-015',
    governorate: 'الجيزة',
    markaz: 'الواحات البحرية والعياط',
    coordinates: { lat: 28.3582, lng: 28.8683 },
    agriculturalAreaFeddans: 120000,
    agriculturalSector: 'الأراضي الجديدة والواحات'
  }
];

export const initialInfestationReports: InfestationReport[] = [
  {
    id: 'REP-2026-001',
    locationId: 'LOC-013', // الوادي الجديد
    pestId: 'PEST-001', // سوسة النخيل الحمراء
    crop: 'نخيل البلح (السيوي والصعيدي)',
    detectionDate: '2026-02-14',
    severity: 'جسيمة',
    affectedAreaFeddans: 48.5,
    infestationSite: 'ساق',
    infestationRatePercent: 14.2,
    sampleInspector: 'م. أحمد الشريف (تفتيش حجر الخارجة)',
    containmentStatus: 'تحت المعالجة الكيميائية',
    notes: 'تم رصد إفرازات صمغية وتآكل عميق في جذوع 65 نخلة، تم تطبيق الحقن الموضعي وعزل البؤرة ضمن الحزام الحجري.'
  },
  {
    id: 'REP-2026-002',
    locationId: 'LOC-002', // النوبارية
    pestId: 'PEST-002', // ذبابة ثمار الخوخ
    crop: 'الموالح (برتقال صيفي)',
    detectionDate: '2026-02-18',
    severity: 'متوسطة',
    affectedAreaFeddans: 85.0,
    infestationSite: 'ثمار',
    infestationRatePercent: 5.8,
    sampleInspector: 'د. طارق الدسوقي (معمل بحوث وقاية النبات)',
    containmentStatus: 'قيد المتابعة',
    notes: 'نصب 120 مصيدة جاذبة جنسية فرمونية ورش جزئي بالطعوم السامة، الحفاظ على مطابقة اشتراطات التصدير للاتحاد الأوروبي.'
  },
  {
    id: 'REP-2026-003',
    locationId: 'LOC-001', // البحيرة - دمنهور
    pestId: 'PEST-003', // العفن البني في البطاطس
    crop: 'البطاطس (عروة شتوية)',
    detectionDate: '2026-01-22',
    severity: 'خفيفة',
    affectedAreaFeddans: 12.0,
    infestationSite: 'جذور',
    infestationRatePercent: 1.5,
    sampleInspector: 'م. يوسف الغنام (مشروع حصر ومكافحة العفن البني)',
    containmentStatus: 'تم الاحتواء والحصار',
    notes: 'فحص عينات الدرنات المعملية عبر ELISA وPCR؛ تأكيد عزل الحوض الزراعي عن المناطق الخالية من العفن البني (PFA).'
  },
  {
    id: 'REP-2026-004',
    locationId: 'LOC-005', // كفر الشيخ
    pestId: 'PEST-005', // صدأ القمح الأصفر
    crop: 'القمح (جيزة 171 ومصر 3)',
    detectionDate: '2026-02-05',
    severity: 'متوسطة',
    affectedAreaFeddans: 120.0,
    infestationSite: 'اوراق',
    infestationRatePercent: 8.4,
    sampleInspector: 'م. صابر رضوان (الإرشاد الزراعي بكفر الشيخ)',
    containmentStatus: 'تحت المعالجة الكيميائية',
    notes: 'ظهور بؤر اصفرار خطية على الأوراق بسبب انخفاض درجات الحرارة والرطوبة العالية، بدأت فرق الرش بالمبيدات الفطرية الجهازية.'
  },
  {
    id: 'REP-2026-005',
    locationId: 'LOC-004', // الشرقية - الصالحية
    pestId: 'PEST-004', // توتا ابسلوتا
    crop: 'الطماطم (صوب زراعية)',
    detectionDate: '2026-02-28',
    severity: 'جسيمة',
    affectedAreaFeddans: 35.0,
    infestationSite: 'اوراق',
    infestationRatePercent: 22.0,
    sampleInspector: 'م. حسام البحيري (إدارة الحجر الزراعي بالشرقية)',
    containmentStatus: 'تحت المعالجة الكيميائية',
    notes: 'أنفاق هوائية شفافة كثيفة على أوراق الطماطم وثقوب تغذية في الثمار الغضة، إطلاق حشرة المفترس ميريد وتكثيف الرش الحيوي.'
  },
  {
    id: 'REP-2026-006',
    locationId: 'LOC-008', // الفيوم
    pestId: 'PEST-007', // هالوك الفول
    crop: 'الفول البلدي (سخا 1)',
    detectionDate: '2026-01-15',
    severity: 'جسيمة',
    affectedAreaFeddans: 62.0,
    infestationSite: 'جذور',
    infestationRatePercent: 18.5,
    sampleInspector: 'م. عصام فوزي (مديرية الزراعة بالفيوم)',
    containmentStatus: 'قيد المتابعة',
    notes: 'خروج شماريخ الهالوك الزهرية بكثافة فوق سطح التربة وموت موضعي لبقع الفول، توصية بالرش بمبيد راوند أب بجرعات متدرجة خفيفة.'
  },
  {
    id: 'REP-2026-007',
    locationId: 'LOC-011', // قنا
    pestId: 'PEST-009', // فأر الغيط
    crop: 'قصب السكر',
    detectionDate: '2026-01-30',
    severity: 'متوسطة',
    affectedAreaFeddans: 150.0,
    infestationSite: 'ساق',
    infestationRatePercent: 7.2,
    sampleInspector: 'م. خالد الهواري (حملة مكافحة القوارض)',
    containmentStatus: 'مستقرة',
    notes: 'توزيع طعوم فوسفيد الزنك ومسيلات الدم في محيط مصارف القصب لتقليل قرض السيقان ومستوى السكر.'
  },
  {
    id: 'REP-2026-008',
    locationId: 'LOC-007', // الإسماعيلية
    pestId: 'PEST-008', // العنكبوت الأحمر
    crop: 'الفراولة التصديرية',
    detectionDate: '2026-02-10',
    severity: 'خفيفة',
    affectedAreaFeddans: 28.0,
    infestationSite: 'اوراق',
    infestationRatePercent: 3.1,
    sampleInspector: 'م. نبيل الملاح (فحص الصادرات الزراعية)',
    containmentStatus: 'تم الاحتواء والحصار',
    notes: 'اصفرار باهت بالسطح العلوي، تم إدخال المفترس الأكاروسي فايتوسيلس ومراعاة فترة ما قبل الحصاد PHI بدقة.'
  },
  {
    id: 'REP-2026-009',
    locationId: 'LOC-009', // المنيا
    pestId: 'PEST-006', // نيماتودا تعقد الجذور
    crop: 'العنب (فليم سيدلس)',
    detectionDate: '2026-02-20',
    severity: 'متوسطة',
    affectedAreaFeddans: 40.0,
    infestationSite: 'جذور',
    infestationRatePercent: 9.0,
    sampleInspector: 'د. سامح عبد الفتاح (مركز البحوث الزراعية)',
    containmentStatus: 'تحت المعالجة الكيميائية',
    notes: 'عقد جذرية واضحة وضعف في النموات الربيعية، معاملة بحقن الفايدات في شبكة الري بالتنقيط.'
  },
  {
    id: 'REP-2026-010',
    locationId: 'LOC-012', // أسوان
    pestId: 'PEST-001', // سوسة النخيل
    crop: 'نخيل البلح (البرحي والمجدول والسكوتي)',
    detectionDate: '2026-03-02',
    severity: 'خفيفة',
    affectedAreaFeddans: 18.0,
    infestationSite: 'ساق',
    infestationRatePercent: 2.2,
    sampleInspector: 'م. بشير جلال (حجر زراعي أسوان)',
    containmentStatus: 'تم الاحتواء والحصار',
    notes: 'رصد مبكر عبر المجسات الصوتية والمصائد الكيرمونية، حقن النخيل المصاب وتطويق المزرعة.'
  }
];

export const initialControlMeasures: ControlMeasure[] = [
  {
    id: 'CTRL-001',
    pestId: 'PEST-001',
    pesticideName: 'سيلكتكرون 72% EC / إيمامكتين بنزوات 5% SG',
    activeIngredient: 'Emamectin Benzoate + Profenofos',
    phiDays: 30,
    dosageAndMethod: 'حقن مباشر في جذع النخلة بتركيز 25-40 سم3 في ثقوب مائلة بعمق 15-20 سم مع الغلق الفوري بالجبس أو الشمع الزراعي.',
    quarantineMeasures: 'حظر نقل فسائل النخيل نهائياً خارج نطاق المنطقة إلا بشهادة خلو معتمدة من الحجر الزراعي وإجراء فرم للمخلفات المصابة.',
    approvalAuthority: 'لجنة مبيدات الآفات الزراعية المصرية (رقم تسجيل 2419)'
  },
  {
    id: 'CTRL-002',
    pestId: 'PEST-002',
    pesticideName: 'مالاثيون 57% EC مع مادة الجذب بومينال',
    activeIngredient: 'Malathion + Protein Hydrolysate Bait',
    phiDays: 7,
    dosageAndMethod: 'رش جزئي لحزم الجذوع بارتفاع 1.5 متر بمعدل 500 سم3 بومينال + 250 سم3 مالاثيون لكل 20 لتر ماء كل 10 أيام.',
    quarantineMeasures: 'إلزام جميع مزارع التصدير ببروتوكول الذبابة القومي، ونصب مصائد جاكسون وفيرمونية بمعدل مصيدة لكل 5 أفدنة قبل 60 يوماً من الجمع.',
    approvalAuthority: 'مشروع حصر ومكافحة ذبابة الفاكهة (رقم تسجيل 1804)'
  },
  {
    id: 'CTRL-003',
    pestId: 'PEST-003',
    pesticideName: 'مبيدات نحاسية وقائية وتعقيم التربة',
    activeIngredient: 'Copper Hydroxide + Hydrogen Peroxide',
    phiDays: 0,
    dosageAndMethod: 'المعاملة بمركبات هيدروكسيد النحاس بمعدل 250 جم/100 لتر ماء وتطهير مياه الري وتجفيف قنوات الصرف.',
    quarantineMeasures: 'إجراءات حجرية صارمة: إعلان الحقل كمنطقة موبوءة محظور زراعة البطاطس فيها لمدة 5 سنوات وحظر استخدام الدرنات كتقاوي وإلغاء صفة PFA.',
    approvalAuthority: 'مشروع حصر ومكافحة مرض العفن البني في البطاطس - بروتوكول EU'
  },
  {
    id: 'CTRL-004',
    pestId: 'PEST-004',
    pesticideName: 'كوراجين 20% SC (كلورانترانيليبرول)',
    activeIngredient: 'Chlorantraniliprole 200 g/L',
    phiDays: 3,
    dosageAndMethod: 'رش ورقي بمعدل 60 سم3 / 200 لتر ماء مع استخدام مواد ناشرة عند فقس البيض وبدء ظهور الأنفاق.',
    quarantineMeasures: 'إلزام الصوب الزراعية بتركيب شباك مانعة للحشرات 50 Mesh واستخدام مصائد دلتا فرمونية سوداء وتدمير الثمار المتساقطة بالحرق.',
    approvalAuthority: 'لجنة مبيدات الآفات الزراعية (رقم تسجيل 1563)'
  },
  {
    id: 'CTRL-005',
    pestId: 'PEST-005',
    pesticideName: 'أوبيراتور 25% EC (تيلت / بروبيكونازول)',
    activeIngredient: 'Propiconazole 250 g/L',
    phiDays: 28,
    dosageAndMethod: 'رش النباتات بمعدل 100 سم3 / 100 لتر ماء عند أول إشعار بؤري للصدأ الأصفر مع تكرار الرش بعد 15 يوماً.',
    quarantineMeasures: 'حظر تداول وزراعة الأصناف القابلة للكسر الوراثي في محافظات الوجه البحري (مثل سدس 12 ومصر 1) والاعتماد على الأصناف المقاومة المعتمدة.',
    approvalAuthority: 'قسم بحوث أمراض القمح - معهد بحوث أمراض النبات'
  },
  {
    id: 'CTRL-006',
    pestId: 'PEST-006',
    pesticideName: 'فايدات 24% L (أوكساميل)',
    activeIngredient: 'Oxamyl 24% SL',
    phiDays: 21,
    dosageAndMethod: 'حقن مع ماء الري بالتنقيط بمعدل 2 لتر / فدان عند بداية النشاط الجذري في الربيع، متبوعاً بدفعة ثانية بعد 3 أسابيع.',
    quarantineMeasures: 'حظر نقل شتلات الخضر والفاكهة من المشاتل المصابة إلا بعد أخذ شهادة تحليل معملية رسمية تثبت خلو التربة والجذور من أطوار النيماتودا.',
    approvalAuthority: 'لجنة تسجيل المبيدات الزراعية (رقم تسجيل 980)'
  },
  {
    id: 'CTRL-007',
    pestId: 'PEST-007',
    pesticideName: 'راوند أب 48% SL (جرعات خفيفة منشطة)',
    activeIngredient: 'Glyphosate 480 g/L',
    phiDays: 45,
    dosageAndMethod: 'رش الفول بمعدل 75 سم3 / فدان في 100 لتر ماء عند بداية تزهير الفول، مع تكرار الرش بعد 21 يوماً لقمع استطالة شماريخ الهالوك.',
    quarantineMeasures: 'غربلة تقاوي الفول والبسلة في محطات الحجر الزراعي وحظر زراعة التقاوي الملوثة ببذور الهالوك واتباع دورة زراعية تشمل الكتان.',
    approvalAuthority: 'معهد بحوث المحاصيل الحقلية'
  },
  {
    id: 'CTRL-008',
    pestId: 'PEST-008',
    pesticideName: 'فيرتيمك 1.8% EC (أبامكتين)',
    activeIngredient: 'Abamectin 18 g/L',
    phiDays: 3,
    dosageAndMethod: 'رش المجموع الخضري بتركيز 40 سم3 / 100 لتر ماء مع تغطية السطح السفلي للأوراق بالكامل ويفضل في الصباح الباكر.',
    quarantineMeasures: 'إلزام مزارع الفراولة التصديرية بنظام الإدارة المتكاملة (IPM) واستخدام المفترسات الحيوية لتقليل متبقيات المبيدات لأقصى حد.',
    approvalAuthority: 'لجنة مبيدات الآفات (رقم تسجيل 1140)'
  }
];

export const initialMonthlyStats = [
  { month: 'أكتوبر 2025', monthCode: '2025-10', newReportsCount: 18, affectedFeddans: 230, treatedFeddans: 210, activeOutbreaks: 4 },
  { month: 'نوفمبر 2025', monthCode: '2025-11', newReportsCount: 24, affectedFeddans: 310, treatedFeddans: 290, activeOutbreaks: 5 },
  { month: 'ديسمبر 2025', monthCode: '2025-12', newReportsCount: 15, affectedFeddans: 190, treatedFeddans: 180, activeOutbreaks: 3 },
  { month: 'يناير 2026', monthCode: '2026-01', newReportsCount: 32, affectedFeddans: 445, treatedFeddans: 380, activeOutbreaks: 8 },
  { month: 'فبراير 2026', monthCode: '2026-02', newReportsCount: 41, affectedFeddans: 590, treatedFeddans: 520, activeOutbreaks: 11 },
  { month: 'مارس 2026', monthCode: '2026-03', newReportsCount: 29, affectedFeddans: 380, treatedFeddans: 360, activeOutbreaks: 6 }
];
