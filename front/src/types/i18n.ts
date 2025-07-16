// Core i18n types and interfaces

export type SupportedLanguage = 'ko' | 'en';

export const SUPPORTED_LANGUAGE_CODES: readonly SupportedLanguage[] = ['ko', 'en'] as const;

export interface Language {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: readonly Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
] as const;

// Translation interfaces
export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface TranslationOptions {
  count?: number;
  defaultValue?: string;
  interpolation?: Record<string, string | number>;
}

export interface TranslationFunction {
  (key: string, options?: TranslationOptions): string;
  (key: string, defaultValue?: string): string;
}

// Error handling
export interface TranslationError {
  code: 'MISSING_KEY' | 'INVALID_LANGUAGE' | 'NAMESPACE_NOT_FOUND' | 'INTERPOLATION_ERROR';
  message: string;
  key?: string;
  namespace?: string;
  language?: SupportedLanguage;
}