import { type InitOptions } from 'i18next';

import { type SupportedLanguage } from '../types/i18n';

export const LANGUAGES: Record<string, SupportedLanguage> = {
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
  API: 'api',
  VALIDATION: 'validation',
} as const;

export const DEFAULT_LANGUAGE = LANGUAGES.ko;
export const FALLBACK_LANGUAGE = LANGUAGES.en;

export const i18nConfig: InitOptions = {
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS: NAMESPACES.COMMON,
  ns: Object.values(NAMESPACES),

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    allowMultiLoading: false,
    requestOptions: {
      cache: 'default',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  },

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added',
  },

  saveMissing: false,
  saveMissingTo: 'fallback',

  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },

  supportedLngs: Object.values(LANGUAGES),
  load: 'languageOnly',

  // Error handling - silenced in production
  parseMissingKeyHandler: (_key: string, defaultValue?: string) => {
    return defaultValue || _key;
  },
};

// Type aliases for config consistency
export type LanguageCode = SupportedLanguage;
export type NamespaceKey = typeof NAMESPACES[keyof typeof NAMESPACES];