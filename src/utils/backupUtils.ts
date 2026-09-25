import { Pest, Location, InfestationReport, ControlMeasure, MonthlyStat, AppUser } from '../types';

export interface BackupSummary {
  pestsCount: number;
  locationsCount: number;
  reportsCount: number;
  controlMeasuresCount: number;
  monthlyStatsCount: number;
  usersCount: number;
  totalRecords: number;
}

export interface BackupPayload {
  system: string;
  systemNameArabic: string;
  version: string;
  exportDate: string;
  exportedBy: string;
  summary: BackupSummary;
  data: {
    pests: Pest[];
    locations: Location[];
    reports: InfestationReport[];
    controlMeasures: ControlMeasure[];
    monthlyStats: MonthlyStat[];
    users?: AppUser[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  summary?: BackupSummary;
  exportDate?: string;
  exportedBy?: string;
  payload?: BackupPayload;
}

/**
 * Downloads a JavaScript object as a formatted JSON file
 */
export function downloadJSONFile(data: unknown, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete system backup JSON file
 */
export function exportSystemBackup(params: {
  pests: Pest[];
  locations: Location[];
  reports: InfestationReport[];
  controlMeasures: ControlMeasure[];
  monthlyStats: MonthlyStat[];
  users?: AppUser[];
  exportedByName?: string;
  includeUsers?: boolean;
}): BackupPayload {
  const {
    pests,
    locations,
    reports,
    controlMeasures,
    monthlyStats,
    users = [],
    exportedByName = 'مدير النظام (Super Admin)',
    includeUsers = true
  } = params;

  const usersToExport = includeUsers ? users : [];

  const summary: BackupSummary = {
    pestsCount: pests.length,
    locationsCount: locations.length,
    reportsCount: reports.length,
    controlMeasuresCount: controlMeasures.length,
    monthlyStatsCount: monthlyStats.length,
    usersCount: usersToExport.length,
    totalRecords: pests.length + locations.length + reports.length + controlMeasures.length + monthlyStats.length + usersToExport.length
  };

  const payload: BackupPayload = {
    system: 'EQAPS - Egyptian Plant Quarantine & Agricultural Pests System',
    systemNameArabic: 'منظومة الآفات الحجرية والزراعية المصرية - وزارة الزراعة واستصلاح الأراضي',
    version: '2026.1',
    exportDate: new Date().toISOString(),
    exportedBy: exportedByName,
    summary,
    data: {
      pests,
      locations,
      reports,
      controlMeasures,
      monthlyStats,
      ...(includeUsers ? { users: usersToExport } : {})
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `نسخة_احتياطية_منظومة_الحجر_الزراعي_${today}_${time}.json`;

  downloadJSONFile(payload, filename);
  return payload;
}

/**
 * Validates whether uploaded JSON content conforms to the backup structure
 */
export function validateBackupFile(fileContent: string): ValidationResult {
  try {
    const parsed = JSON.parse(fileContent);

    if (!parsed || typeof parsed !== 'object') {
      return {
        isValid: false,
        error: 'الملف لا يحتوي على كائن JSON صالح (Invalid JSON format)'
      };
    }

    // Support both structured { data: { pests, ... } } and flat { pests, ... }
    const sourceData = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;

    const pests: Pest[] = Array.isArray(sourceData.pests) ? sourceData.pests : [];
    const locations: Location[] = Array.isArray(sourceData.locations) ? sourceData.locations : [];
    const reports: InfestationReport[] = Array.isArray(sourceData.reports) ? sourceData.reports : [];
    const controlMeasures: ControlMeasure[] = Array.isArray(sourceData.controlMeasures) ? sourceData.controlMeasures : [];
    const monthlyStats: MonthlyStat[] = Array.isArray(sourceData.monthlyStats) ? sourceData.monthlyStats : [];
    const users: AppUser[] = Array.isArray(sourceData.users) ? sourceData.users : [];

    const totalRecords = pests.length + locations.length + reports.length + controlMeasures.length + monthlyStats.length + users.length;

    if (totalRecords === 0) {
      return {
        isValid: false,
        error: 'الملف فارغ أو لا يحتوي على أي مجموعات بيانات معروفة (الآفات، المواقع، البلاغات، المكافحة)'
      };
    }

    const summary: BackupSummary = {
      pestsCount: pests.length,
      locationsCount: locations.length,
      reportsCount: reports.length,
      controlMeasuresCount: controlMeasures.length,
      monthlyStatsCount: monthlyStats.length,
      usersCount: users.length,
      totalRecords
    };

    const payload: BackupPayload = {
      system: parsed.system || 'EQAPS',
      systemNameArabic: parsed.systemNameArabic || 'منظومة الحجر الزراعي',
      version: parsed.version || '1.0',
      exportDate: parsed.exportDate || new Date().toISOString(),
      exportedBy: parsed.exportedBy || 'غير محدد',
      summary,
      data: {
        pests,
        locations,
        reports,
        controlMeasures,
        monthlyStats,
        users
      }
    };

    return {
      isValid: true,
      summary,
      exportDate: payload.exportDate,
      exportedBy: payload.exportedBy,
      payload
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `فشل قراءة الملف: ${err?.message || 'صيغة JSON غير صحيحة'}`
    };
  }
}
