import { I18nConfig, SupportedLanguages } from '../types/i18n';

// Default i18n configuration
export const i18nConfig: I18nConfig = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ko'],
  fallbackLanguage: 'en',
  storageKey: 'app-language',
  loadTranslationsAsync: false,
  interpolation: {
    prefix: '{',
    suffix: '}',
    escapeValue: true,
  },
};

// Language configuration
export const languageConfigs = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
    rtl: false,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    flag: '🇰🇷',
    nativeName: '한국어',
    rtl: false,
  },
};

// Supported languages array
export const supportedLanguages: SupportedLanguages[] = ['en', 'ko'];

// Default language
export const defaultLanguage: SupportedLanguages = 'en';

// Language detection utility
export const detectBrowserLanguage = (): SupportedLanguages => {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguages;
  return supportedLanguages.includes(browserLang) ? browserLang : defaultLanguage;
};

// Storage utilities
export const getStoredLanguage = (): SupportedLanguages => {
  try {
    const stored = localStorage.getItem(i18nConfig.storageKey);
    return stored && supportedLanguages.includes(stored as SupportedLanguages) 
      ? (stored as SupportedLanguages) 
      : defaultLanguage;
  } catch (error) {
    console.warn('Failed to get stored language:', error);
    return defaultLanguage;
  }
};

export const setStoredLanguage = (language: SupportedLanguages): void => {
  try {
    localStorage.setItem(i18nConfig.storageKey, language);
  } catch (error) {
    console.warn('Failed to store language:', error);
  }
};

// Language resolution
export const resolveLanguage = (): SupportedLanguages => {
  // Priority: stored > browser > default
  const stored = getStoredLanguage();
  if (stored !== defaultLanguage) return stored;
  
  const browser = detectBrowserLanguage();
  if (browser !== defaultLanguage) return browser;
  
  return defaultLanguage;
};

// Export configuration
export default {
  config: i18nConfig,
  languages: languageConfigs,
  supportedLanguages,
  defaultLanguage,
  detectBrowserLanguage,
  getStoredLanguage,
  setStoredLanguage,
  resolveLanguage,
};