import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  translations, 
  categoryTranslations, 
  pestTypeTranslations, 
  severityTranslations, 
  siteTranslations, 
  zoneTranslations, 
  sectorTranslations, 
  riskLevelTranslations, 
  containmentTranslations, 
  governorateTranslations, 
  markazTranslations, 
  pestCommonNames, 
  cropTranslations, 
  monthTranslations 
} from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.ar;
  // Helpers for data items
  tCategory: (val: string) => string;
  tPestType: (val: string) => string;
  tSeverity: (val: string) => string;
  tSite: (val: string) => string;
  tZone: (val: string) => string;
  tSector: (val: string) => string;
  tRisk: (val: string) => string;
  tContainment: (val: string) => string;
  tGovernorate: (val: string) => string;
  tMarkaz: (val: string) => string;
  tPestName: (val: string, pestList?: any[]) => string;
  tCrop: (val: string) => string;
  tMonth: (val: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('eqaps_language');
      return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  useEffect(() => {
    try {
      localStorage.setItem('eqaps_language', language);
    } catch {
      // Ignore localStorage errors in iframe sandboxes
    }

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', language);
      if (language === 'en') {
        document.body.classList.remove("font-['Cairo',sans-serif]");
        document.body.classList.add('font-sans');
      } else {
        document.body.classList.remove('font-sans');
        document.body.classList.add("font-['Cairo',sans-serif]");
      }
    }
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const currentTranslations = translations[language];

  // Translation helpers
  const tCategory = (val: string) => {
    if (!val) return '';
    return categoryTranslations[val]?.[language] || val;
  };

  const tPestType = (val: string) => {
    if (!val) return '';
    return pestTypeTranslations[val]?.[language] || val;
  };

  const tSeverity = (val: string) => {
    if (!val) return '';
    return severityTranslations[val]?.[language] || val;
  };

  const tSite = (val: string) => {
    if (!val) return '';
    return siteTranslations[val]?.[language] || val;
  };

  const tZone = (val: string) => {
    if (!val) return '';
    return zoneTranslations[val]?.[language] || val;
  };

  const tSector = (val: string) => {
    if (!val) return '';
    return sectorTranslations[val]?.[language] || val;
  };

  const tRisk = (val: string) => {
    if (!val) return '';
    return riskLevelTranslations[val]?.[language] || val;
  };

  const tContainment = (val: string) => {
    if (!val) return '';
    return containmentTranslations[val]?.[language] || val;
  };

  const tGovernorate = (val: string) => {
    if (!val) return '';
    return governorateTranslations[val]?.[language] || val;
  };

  const tMarkaz = (val: string) => {
    if (!val) return '';
    return markazTranslations[val]?.[language] || val;
  };

  const tPestName = (val: string, pestList?: any[]) => {
    if (!val) return '';
    // If val is a pest ID and pestList is provided, find the pest
    if (pestList && Array.isArray(pestList)) {
      const found = pestList.find(p => p.id === val || p.code === val);
      if (found) {
        if (language === 'ar') return found.commonName;
        return pestCommonNames[found.commonName]?.[language] || found.scientificName || found.commonName;
      }
    }
    // Check if directly in pestCommonNames dictionary
    if (pestCommonNames[val]?.[language]) {
      return pestCommonNames[val][language];
    }
    return val;
  };

  const tCrop = (val: string) => {
    if (!val) return '';
    return cropTranslations[val]?.[language] || val;
  };

  const tMonth = (val: string) => {
    if (!val) return '';
    return monthTranslations[val]?.[language] || val;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage,
        toggleLanguage,
        t: currentTranslations,
        tCategory,
        tPestType,
        tSeverity,
        tSite,
        tZone,
        tSector,
        tRisk,
        tContainment,
        tGovernorate,
        tMarkaz,
        tPestName,
        tCrop,
        tMonth
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
