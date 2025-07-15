import { InitOptions } from 'i18next';

export const LANGUAGES = {
  ko: 'ko',
  en: 'en',
} as const;

export const NAMESPACES = {
  COMMON: 'common',
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  WORKSPACE: 'workspace',
  NOTICE: 'notice',
  TEST: 'test',
} as const;

export const DEFAULT_LANGUAGE = LANGUAGES.ko;
export const FALLBACK_LANGUAGE = LANGUAGES.ko;

export const i18nConfig: InitOptions = {
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS: NAMESPACES.COMMON,
  ns: Object.values(NAMESPACES),
  
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/{{lng}}/{{ns}}.missing.json',
  },

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },

  saveMissing: process.env.NODE_ENV === 'development',
  saveMissingTo: 'fallback',

  debug: process.env.NODE_ENV === 'development',

  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
    checkWhitelist: true,
  },

  supportedLngs: Object.values(LANGUAGES),
  load: 'languageOnly',
  
  // Error handling
  parseMissingKeyHandler: (key: string, defaultValue?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${key}`);
    }
    return defaultValue || key;
  },
};

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];
export type Namespace = typeof NAMESPACES[keyof typeof NAMESPACES];