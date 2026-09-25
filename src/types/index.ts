export type PestType = 
  | 'حشرية'
  | 'فطرية'
  | 'نيماتودا'
  | 'حشائش'
  | 'اكاروسي'
  | 'قوارض'
  | 'بكتيري'
  | 'طحالب'
  | 'فقاريات';

export type QuarantineCategory = 
  | 'آفة حجرية أ1 (محظورة تماماً)'
  | 'آفة حجرية أ2 (محدودة الانتشار تحت الحصار)'
  | 'آفة اقتصادية خاضعة للرقابة (RNQP)';

export type InfestationSeverity = 'خفيفة' | 'متوسطة' | 'جسيمة';

export type InfestationSite = 'ساق' | 'اوراق' | 'جذور' | 'تربة' | 'ثمار' | 'بذور';

export type ZoneClassification = 
  | 'منطقة خالية من الإصابة (PFA)'
  | 'منطقة منخفضة الإصابة (ALPP)'
  | 'منطقة متوسطة الإصابة'
  | 'منطقة عالية الإصابة (بؤرة حجرية)';

export interface Pest {
  id: string; // معرف الآفة
  commonName: string; // الاسم الشائع
  scientificName: string; // الاسم العلمي
  type: PestType; // نوع الآفة
  quarantineCategory: QuarantineCategory; // التصنيف الحجري
  primaryHostCrops: string[]; // أهم المحاصيل العائلة
  description: string; // الوصف والأعراض
  riskLevel: 'منخفض' | 'متوسط' | 'مرتفع' | 'حرج جداً';
  imagePlaceholder?: string;
}

export interface Location {
  id: string; // معرف الموقع
  governorate: string; // المحافظة
  markaz: string; // المركز
  coordinates: {
    lat: number;
    lng: number;
  };
  agriculturalAreaFeddans: number; // مساحة الرقعة الزراعية بالفدان
  agriculturalSector: 'وجه بحري - الدلتا' | 'مصر الوسطى' | 'مصر العليا' | 'القناة وسيناء' | 'الأراضي الجديدة والواحات';
}

export interface InfestationReport {
  id: string; // معرف التقرير
  locationId: string; // معرف الموقع
  pestId: string; // معرف الآفة
  crop: string; // المحصول المصاب
  detectionDate: string; // تاريخ رصد الإصابة (YYYY-MM-DD)
  severity: InfestationSeverity; // شدة الإصابة: خفيفة/متوسطة/جسيمة
  affectedAreaFeddans: number; // المساحة المتضررة بالفدان
  infestationSite: InfestationSite; // مكان الاصابة: ساق/اوراق/جذور/تربة/ثمار/بذور
  infestationRatePercent: number; // نسبة الإصابة المئوية %
  sampleInspector: string; // اسم مهندس الرصد / مفتش الحجر الزراعي
  containmentStatus: 'قيد المتابعة' | 'تحت المعالجة الكيميائية' | 'تم الاحتواء والحصار' | 'مستقرة';
  notes?: string; // ملاحظات إضافية
  createdByUserId?: string; // معرف المستخدم الذي أنشأ البلاغ
  createdByUsername?: string; // اسم مستخدم صاحب البلاغ
  fieldPhotoUrl?: string; // صورة حقلية من الكاميرا لتوثيق الإصابة
  fieldPhotoTimestamp?: string; // توقيت التقاط الصورة الميدانية
  fieldCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number; // دقة التحديد بالأمتار
    capturedAt?: string;
  };
}

export type UserRole = 'super_admin' | 'employee';
export type AccountStatus = 'active' | 'inactive';

export interface UserPermissions {
  canAccessAdmin: boolean; // الوصول والتحكم في لوحة الإدارة
  canManageUsers: boolean; // إدارة المستخدمين (إضافة، تعديل، حذف، تفعيل)
  canManageRoles: boolean; // إدارة الأدوار وتعيين الصلاحيات
  canViewReports: boolean; // الإطلاع على التقارير الرسمية وحفظها
  canExportData: boolean; // استخراج وتصدير البيانات (PDF / CSV)
  canDeleteData: boolean; // حذف البيانات من الموقع
  canCreateReports: boolean; // إنشاء بلاغ وإضافة طلبات
  canCreatePests: boolean; // إضافة آفات جديدة
  canCreateLocations: boolean; // إضافة مواقع جغرافية جديدة
  canCreateControl: boolean; // إضافة تدابير مكافحة
  canViewOwnDataOnly: boolean; // متابعة البيانات التي أدخلها فقط
  canEditProfile: boolean; // تعديل بياناته الشخصية
  allowedModules: string[]; // الأقسام المسموح له برؤيتها: ['dashboard', 'pests', 'reports', 'control', 'monthly', 'locations']
  hiddenSections?: string[]; // أقسام أو بيانات محجوبة من قبل المدير
}

export interface AppUser {
  id: string; // معرف المستخدم
  
  // البيانات الأساسية
  name: string; // الاسم
  username: string; // اسم المستخدم (فريد)
  email: string; // البريد الإلكتروني
  phoneNumber: string; // رقم الهاتف ضروريًا
  password: string; // كلمة المرور
  status: AccountStatus; // حالة الحساب: فعال / غير فعال
  role: UserRole; // Super Admin أو Employee
  
  // بيانات الوظيفة
  department: string; // الإدارة / القسم
  jobTitle: string; // المسمى الوظيفي
  
  // الصلاحيات (تُحدد من خلال المستخدم المدير مع إمكانية إعطاء صلاحيات إضافية)
  permissions: UserPermissions;
  
  createdAt: string;
  lastLoginAt?: string;
  createdById?: string; // المعرف الذي أنشأ الحساب
  notes?: string;
}

export type ActivityActionType = 
  | 'login' 
  | 'logout' 
  | 'create_user' 
  | 'update_user' 
  | 'delete_user' 
  | 'toggle_user_status' 
  | 'create_report' 
  | 'update_report' 
  | 'delete_report' 
  | 'create_pest' 
  | 'delete_pest' 
  | 'export_data' 
  | 'view_report' 
  | 'update_profile';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: ActivityActionType;
  details: string;
  timestamp: string;
  targetId?: string;
}

export interface ControlMeasure {
  id: string; // معرف التوصية
  pestId: string; // معرف الآفة
  pesticideName: string; // نوع المبيد الموصى به
  activeIngredient: string; // المادة الفعالة
  phiDays: number; // فترة ما قبل الحصاد (PHI بالايام)
  dosageAndMethod: string; // الجرعة وطريقة التطبيق
  quarantineMeasures: string; // تدابير الحجر الصحي والإجراءات الوقائية
  approvalAuthority: string; // جهة الاعتماد (لجنة مبيدات الآفات الزراعية)
}

export interface MonthlyStat {
  month: string; // مثلاً: يناير، فبراير
  monthCode: string; // 2026-01
  newReportsCount: number; // عدد التقارير الجديدة
  affectedFeddans: number; // المساحة المتضررة
  treatedFeddans: number; // المساحة المعالجة
  activeOutbreaks: number; // البؤر النشطة
}
