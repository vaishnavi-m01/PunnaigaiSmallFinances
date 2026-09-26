import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, ta } from '../i18n/partner';

type Language = 'en' | 'ta';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

const LANGUAGE_KEY = '@app_language';

const dictionaries: Record<Language, Record<string, string>> = {
  en,
  ta,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const loadLang = async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored === 'ta' || stored === 'en') {
        setLanguageState(stored);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const dict: Record<string, string> = dictionaries[language] || dictionaries['en'];
    let text = dict[key] || dictionaries['en'][key] || key;

    if (variables) {
      Object.keys(variables).forEach((varKey) => {
        text = text.replace(new RegExp(`{{\\s*${varKey}\\s*}}`, 'g'), String(variables[varKey]));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
