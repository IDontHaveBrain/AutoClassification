import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Simplified i18n configuration
const i18nConfig = {
  fallbackLng: 'ko',
  defaultNS: 'common',
  ns: ['common', 'auth', 'navigation', 'workspace', 'notice', 'test'],
  supportedLngs: ['ko', 'en'],

  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18n_language',
  },

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  react: {
    useSuspense: false,
  },

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  debug: process.env.NODE_ENV === 'development',

  missingKeyHandler: (lng, ns, key, _fallbackValue) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    }
  },
};

// Initialize i18n but don't start it immediately
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next);

// Export initialization function that returns a Promise
export const initializeI18n = async (): Promise<void> => {
  try {
    await i18n.init(i18nConfig);
    console.info('i18n initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    throw error;
  }
};

// Check if i18n is already initialized
export const isI18nInitialized = (): boolean => {
  return i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'common');
};

export default i18n;

// Helper function to get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'ko';
};

// Helper function to change language
export const changeLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);
};