import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Detect browser/OS language on initial load
  const getInitialLanguage = (): Language => {
    const browserLang = navigator.language.toLowerCase();
    // If browser language starts with 'ja' (e.g., 'ja', 'ja-JP'), use Japanese
    return browserLang.startsWith('ja') ? 'ja' : 'en';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
