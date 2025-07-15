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

export interface TranslationResources {
  [namespace: string]: TranslationNamespace;
}

export interface TranslationData {
  [language: string]: TranslationResources;
}

export interface TranslationKey {
  namespace: string;
  key: string;
  defaultValue?: string;
}

export interface TranslationOptions {
  count?: number;
  defaultValue?: string;
  interpolation?: Record<string, string | number>;
  ordinal?: boolean;
  postProcess?: string | string[];
}

export interface TranslationFunction {
  (key: string, options?: TranslationOptions): string;
  (key: string, defaultValue?: string): string;
}

// Formatting interfaces
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZone?: string;
  hour12?: boolean;
}

export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  useGrouping?: boolean;
  unit?: string;
  unitDisplay?: 'short' | 'long' | 'narrow';
}

export interface CurrencyFormatOptions {
  currency: string;
  currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Language detection
export interface LanguageDetectionOptions {
  order?: ('localStorage' | 'navigator' | 'htmlTag' | 'path' | 'subdomain')[];
  caches?: ('localStorage' | 'sessionStorage' | 'cookie')[];
  fallbackLanguage?: SupportedLanguage;
  checkWhitelist?: boolean;
}

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  source: 'localStorage' | 'navigator' | 'htmlTag' | 'path' | 'subdomain' | 'fallback';
  confidence: number;
}

// Error handling
export interface TranslationError {
  code: 'MISSING_KEY' | 'INVALID_LANGUAGE' | 'NAMESPACE_NOT_FOUND' | 'INTERPOLATION_ERROR';
  message: string;
  key?: string;
  namespace?: string;
  language?: SupportedLanguage;
}

export interface TranslationErrorHandler {
  (error: TranslationError): void;
}

// Validation
export interface TranslationValidationResult {
  isValid: boolean;
  errors: TranslationError[];
  warnings: string[];
}

export interface TranslationValidationOptions {
  checkMissingKeys?: boolean;
  checkEmptyValues?: boolean;
  checkInterpolation?: boolean;
  strictMode?: boolean;
}

// Storage
export interface LanguageStorage {
  get(): SupportedLanguage | null;
  set(language: SupportedLanguage): void;
  remove(): void;
}

export interface TranslationCache {
  get(key: string): string | null;
  set(key: string, value: string): void;
  clear(): void;
  size(): number;
}

// Component props
export interface I18nProviderProps {
  children: React.ReactNode;
  fallbackLanguage?: SupportedLanguage;
  onError?: TranslationErrorHandler;
  debug?: boolean;
}

export interface TranslationContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: TranslationFunction;
  isLoading: boolean;
  error: TranslationError | null;
  formatDate: (date: Date | string | number, options?: DateFormatOptions) => string;
  formatNumber: (number: number, options?: NumberFormatOptions) => string;
  formatCurrency: (amount: number, options?: CurrencyFormatOptions) => string;
}

// Utility types
export type TranslationKeyPath<T> = T extends string
  ? never
  : T extends Record<string, any>
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends Record<string, any>
          ? `${K}.${TranslationKeyPath<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type DeepTranslationKeys<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends Record<string, any>
        ? `${K & string}.${DeepTranslationKeys<T[K]>}`
        : K & string;
    }[keyof T]
  : never;

// Hook types
export interface UseTranslationResult {
  t: TranslationFunction;
  i18n: {
    language: SupportedLanguage;
    changeLanguage: (language: SupportedLanguage) => Promise<void>;
    getFixedT: (language?: SupportedLanguage) => TranslationFunction;
    exists: (key: string) => boolean;
  };
  ready: boolean;
}

export interface UseLanguageResult {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  supportedLanguages: readonly Language[];
  isLanguageSupported: (language: string) => language is SupportedLanguage;
}

// Redux state
export interface I18nState {
  language: SupportedLanguage;
  isLoading: boolean;
  error: TranslationError | null;
  loadedNamespaces: string[];
  lastChanged: number;
}

// Action types
export interface SetLanguageAction {
  type: 'i18n/setLanguage';
  payload: SupportedLanguage;
}

export interface SetLoadingAction {
  type: 'i18n/setLoading';
  payload: boolean;
}

export interface SetErrorAction {
  type: 'i18n/setError';
  payload: TranslationError | null;
}

export interface AddNamespaceAction {
  type: 'i18n/addNamespace';
  payload: string;
}

export interface ResetAction {
  type: 'i18n/reset';
}

export type I18nAction = 
  | SetLanguageAction
  | SetLoadingAction
  | SetErrorAction
  | AddNamespaceAction
  | ResetAction;

// Middleware types
export interface I18nMiddlewareOptions {
  persistLanguage?: boolean;
  detectLanguage?: boolean;
  fallbackLanguage?: SupportedLanguage;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

// Performance and caching
export interface I18nPerformanceMetrics {
  translationTime: number;
  cacheHitRate: number;
  loadTime: number;
  memoryUsage: number;
}

export interface I18nCacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  strategy: 'lru' | 'fifo';
}

// Plugin system
export interface I18nPlugin {
  name: string;
  init: (context: TranslationContextValue) => void;
  destroy?: () => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
  onTranslation?: (key: string, value: string) => string;
}

// Testing utilities
export interface I18nTestUtils {
  mockTranslation: (key: string, value: string) => void;
  mockLanguage: (language: SupportedLanguage) => void;
  clearMocks: () => void;
  getTranslationCalls: () => Array<{ key: string; options?: TranslationOptions }>;
}