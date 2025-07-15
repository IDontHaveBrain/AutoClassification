import {
  type CurrencyFormatOptions,
  type DateFormatOptions,
  type LanguageDetectionOptions,
  type LanguageDetectionResult,
  type LanguageStorage,
  type NumberFormatOptions,
  type SupportedLanguage,
  type TranslationCache,
  type TranslationError,
  type TranslationValidationOptions,
  type TranslationValidationResult,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
} from '../types/i18n';

// Language detection utilities
export class LanguageDetector {
  private static readonly STORAGE_KEY = 'i18n-language';
  private static readonly DEFAULT_OPTIONS: LanguageDetectionOptions = {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    fallbackLanguage: 'en',
    checkWhitelist: true,
  };

  static detect(options: LanguageDetectionOptions = {}): LanguageDetectionResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    for (const method of opts.order || []) {
      const result = this.detectByMethod(method, opts);
      if (result) {
        return result;
      }
    }

    return {
      language: opts.fallbackLanguage || 'en',
      source: 'fallback',
      confidence: 1.0,
    };
  }

  private static detectByMethod(
    method: string,
    options: LanguageDetectionOptions
  ): LanguageDetectionResult | null {
    switch (method) {
      case 'localStorage':
        return this.detectFromLocalStorage(options);
      case 'navigator':
        return this.detectFromNavigator(options);
      case 'htmlTag':
        return this.detectFromHtmlTag(options);
      case 'path':
        return this.detectFromPath(options);
      case 'subdomain':
        return this.detectFromSubdomain(options);
      default:
        return null;
    }
  }

  private static detectFromLocalStorage(options: LanguageDetectionOptions): LanguageDetectionResult | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && this.isValidLanguage(stored, options)) {
        return {
          language: stored as SupportedLanguage,
          source: 'localStorage',
          confidence: 1.0,
        };
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }
    return null;
  }

  private static detectFromNavigator(options: LanguageDetectionOptions): LanguageDetectionResult | null {
    if (typeof navigator === 'undefined') return null;

    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      const normalized = this.normalizeLanguage(lang);
      if (this.isValidLanguage(normalized, options)) {
        return {
          language: normalized as SupportedLanguage,
          source: 'navigator',
          confidence: 0.8,
        };
      }
    }

    return null;
  }

  private static detectFromHtmlTag(options: LanguageDetectionOptions): LanguageDetectionResult | null {
    if (typeof document === 'undefined') return null;

    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const normalized = this.normalizeLanguage(htmlLang);
      if (this.isValidLanguage(normalized, options)) {
        return {
          language: normalized as SupportedLanguage,
          source: 'htmlTag',
          confidence: 0.7,
        };
      }
    }

    return null;
  }

  private static detectFromPath(options: LanguageDetectionOptions): LanguageDetectionResult | null {
    if (typeof window === 'undefined') return null;

    const pathSegments = window.location.pathname.split('/');
    const langSegment = pathSegments[1];
    
    if (langSegment && this.isValidLanguage(langSegment, options)) {
      return {
        language: langSegment as SupportedLanguage,
        source: 'path',
        confidence: 0.9,
      };
    }

    return null;
  }

  private static detectFromSubdomain(options: LanguageDetectionOptions): LanguageDetectionResult | null {
    if (typeof window === 'undefined') return null;

    const subdomain = window.location.hostname.split('.')[0];
    
    if (this.isValidLanguage(subdomain, options)) {
      return {
        language: subdomain as SupportedLanguage,
        source: 'subdomain',
        confidence: 0.9,
      };
    }

    return null;
  }

  private static normalizeLanguage(lang: string): string {
    return lang.split('-')[0].toLowerCase();
  }

  private static isValidLanguage(lang: string, options: LanguageDetectionOptions): boolean {
    if (!options.checkWhitelist) return true;
    return SUPPORTED_LANGUAGE_CODES.includes(lang as SupportedLanguage);
  }
}

// Language validation functions
export class LanguageValidator {
  static isSupported(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGE_CODES.includes(language as SupportedLanguage);
  }

  static getSupportedLanguages(): readonly SupportedLanguage[] {
    return SUPPORTED_LANGUAGE_CODES;
  }

  static getLanguageInfo(code: SupportedLanguage) {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  static validateLanguageCode(code: string): SupportedLanguage {
    if (!this.isSupported(code)) {
      throw new Error(`Unsupported language code: ${code}`);
    }
    return code as SupportedLanguage;
  }

  static getSafeLanguage(code: string, fallback: SupportedLanguage = 'en'): SupportedLanguage {
    return this.isSupported(code) ? code as SupportedLanguage : fallback;
  }
}

// Translation key helpers
export class TranslationKeyHelper {
  static parseKey(key: string): { namespace: string; key: string } {
    const parts = key.split(':');
    if (parts.length === 2) {
      return { namespace: parts[0], key: parts[1] };
    }
    return { namespace: 'common', key };
  }

  static buildKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  static isValidKey(key: string): boolean {
    return typeof key === 'string' && key.length > 0 && !key.includes('..');
  }

  static normalizeKey(key: string): string {
    return key.replace(/\s+/g, '_').toLowerCase();
  }

  static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) return;

    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }
}

// Formatting utilities
export class FormattingUtils {
  static formatDate(
    date: Date | string | number,
    language: SupportedLanguage,
    options: DateFormatOptions = {}
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }

    const defaultOptions: DateFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formatOptions = { ...defaultOptions, ...options };
    
    try {
      return new Intl.DateTimeFormat(this.getLocale(language), formatOptions).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateObj.toLocaleDateString();
    }
  }

  static formatNumber(
    number: number,
    language: SupportedLanguage,
    options: NumberFormatOptions = {}
  ): string {
    if (typeof number !== 'number' || isNaN(number)) {
      throw new Error('Invalid number provided');
    }

    try {
      return new Intl.NumberFormat(this.getLocale(language), options).format(number);
    } catch (error) {
      console.error('Number formatting error:', error);
      return number.toString();
    }
  }

  static formatCurrency(
    amount: number,
    language: SupportedLanguage,
    options: CurrencyFormatOptions
  ): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Invalid amount provided');
    }

    if (!options.currency) {
      throw new Error('Currency code is required');
    }

    const formatOptions: NumberFormatOptions = {
      style: 'currency',
      currency: options.currency,
      currencyDisplay: options.currencyDisplay || 'symbol',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
    };

    try {
      return new Intl.NumberFormat(this.getLocale(language), formatOptions).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `${options.currency} ${amount}`;
    }
  }

  static formatPercent(
    value: number,
    language: SupportedLanguage,
    options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
  ): string {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Invalid value provided');
    }

    const formatOptions: NumberFormatOptions = {
      style: 'percent',
      minimumFractionDigits: options.minimumFractionDigits || 0,
      maximumFractionDigits: options.maximumFractionDigits || 2,
    };

    try {
      return new Intl.NumberFormat(this.getLocale(language), formatOptions).format(value);
    } catch (error) {
      console.error('Percent formatting error:', error);
      return `${(value * 100).toFixed(2)}%`;
    }
  }

  static formatRelativeTime(
    date: Date | string | number,
    language: SupportedLanguage,
    options: { unit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' } = {}
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    let value: number;
    let unit: Intl.RelativeTimeFormatUnit;

    if (options.unit) {
      unit = options.unit;
      switch (unit) {
        case 'second':
          value = diffInSeconds;
          break;
        case 'minute':
          value = Math.floor(diffInSeconds / 60);
          break;
        case 'hour':
          value = Math.floor(diffInSeconds / 3600);
          break;
        case 'day':
          value = Math.floor(diffInSeconds / 86400);
          break;
        case 'week':
          value = Math.floor(diffInSeconds / 604800);
          break;
        case 'month':
          value = Math.floor(diffInSeconds / 2629744);
          break;
        case 'year':
          value = Math.floor(diffInSeconds / 31556926);
          break;
        default:
          value = diffInSeconds;
          unit = 'second';
      }
    } else {
      // Auto-detect best unit
      const absSeconds = Math.abs(diffInSeconds);
      if (absSeconds < 60) {
        value = diffInSeconds;
        unit = 'second';
      } else if (absSeconds < 3600) {
        value = Math.floor(diffInSeconds / 60);
        unit = 'minute';
      } else if (absSeconds < 86400) {
        value = Math.floor(diffInSeconds / 3600);
        unit = 'hour';
      } else if (absSeconds < 2629744) {
        value = Math.floor(diffInSeconds / 86400);
        unit = 'day';
      } else if (absSeconds < 31556926) {
        value = Math.floor(diffInSeconds / 2629744);
        unit = 'month';
      } else {
        value = Math.floor(diffInSeconds / 31556926);
        unit = 'year';
      }
    }

    try {
      return new Intl.RelativeTimeFormat(this.getLocale(language), { numeric: 'auto' }).format(-value, unit);
    } catch (error) {
      console.error('Relative time formatting error:', error);
      return dateObj.toLocaleDateString();
    }
  }

  private static getLocale(language: SupportedLanguage): string {
    const localeMap: Record<SupportedLanguage, string> = {
      ko: 'ko-KR',
      en: 'en-US',
    };
    return localeMap[language] || 'en-US';
  }
}

// Language storage utilities
export class LanguageStorageManager implements LanguageStorage {
  private static readonly STORAGE_KEY = 'i18n-language';

  get(): SupportedLanguage | null {
    try {
      const stored = localStorage.getItem(LanguageStorageManager.STORAGE_KEY);
      if (stored && LanguageValidator.isSupported(stored)) {
        return stored as SupportedLanguage;
      }
    } catch (error) {
      console.warn('Failed to get language from storage:', error);
    }
    return null;
  }

  set(language: SupportedLanguage): void {
    try {
      if (!LanguageValidator.isSupported(language)) {
        throw new Error(`Unsupported language: ${language}`);
      }
      localStorage.setItem(LanguageStorageManager.STORAGE_KEY, language);
    } catch (error) {
      console.error('Failed to set language in storage:', error);
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(LanguageStorageManager.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove language from storage:', error);
    }
  }
}

// Translation cache implementation
export class TranslationCacheManager implements TranslationCache {
  private cache = new Map<string, { value: string; timestamp: number }>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds

  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries (LRU)
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < Math.floor(this.maxSize * 0.1); i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Translation validation
export class TranslationValidator {
  static validate(
    translations: Record<string, any>,
    options: TranslationValidationOptions = {}
  ): TranslationValidationResult {
    const errors: TranslationError[] = [];
    const warnings: string[] = [];

    const defaultOptions: TranslationValidationOptions = {
      checkMissingKeys: true,
      checkEmptyValues: true,
      checkInterpolation: true,
      strictMode: false,
    };

    const opts = { ...defaultOptions, ...options };

    this.validateObject(translations, '', errors, warnings, opts);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static validateObject(
    obj: any,
    path: string,
    errors: TranslationError[],
    warnings: string[],
    options: TranslationValidationOptions
  ): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        this.validateTranslationValue(currentPath, value, errors, warnings, options);
      } else if (typeof value === 'object' && value !== null) {
        this.validateObject(value, currentPath, errors, warnings, options);
      } else if (options.strictMode) {
        errors.push({
          code: 'INVALID_LANGUAGE',
          message: `Invalid value type at path: ${currentPath}`,
          key: currentPath,
        });
      }
    }
  }

  private static validateTranslationValue(
    path: string,
    value: string,
    errors: TranslationError[],
    warnings: string[],
    options: TranslationValidationOptions
  ): void {
    if (options.checkEmptyValues && value.trim() === '') {
      warnings.push(`Empty translation value at path: ${path}`);
    }

    if (options.checkInterpolation) {
      const interpolationRegex = /\{\{([^}]+)\}\}/g;
      const matches = value.match(interpolationRegex);
      
      if (matches) {
        for (const match of matches) {
          const variable = match.slice(2, -2).trim();
          if (!variable || variable.includes(' ')) {
            errors.push({
              code: 'INTERPOLATION_ERROR',
              message: `Invalid interpolation variable in path: ${path}`,
              key: path,
            });
          }
        }
      }
    }
  }
}

// Error utilities
export class ErrorUtils {
  static createTranslationError(
    code: TranslationError['code'],
    message: string,
    additionalInfo?: Partial<TranslationError>
  ): TranslationError {
    return {
      code,
      message,
      ...additionalInfo,
    };
  }

  static handleTranslationError(error: TranslationError, fallback?: string): string {
    console.error('Translation error:', error);
    
    switch (error.code) {
      case 'MISSING_KEY':
        return fallback || error.key || 'Missing translation';
      case 'NAMESPACE_NOT_FOUND':
        return fallback || `Namespace not found: ${error.namespace}`;
      case 'INVALID_LANGUAGE':
        return fallback || `Invalid language: ${error.language}`;
      case 'INTERPOLATION_ERROR':
        return fallback || error.key || 'Interpolation error';
      default:
        return fallback || 'Translation error';
    }
  }
}

// Utility functions
export const i18nUtils = {
  LanguageDetector,
  LanguageValidator,
  TranslationKeyHelper,
  FormattingUtils,
  LanguageStorageManager,
  TranslationCacheManager,
  TranslationValidator,
  ErrorUtils,
};

// Translation store
let translationStore: Record<string, Record<string, any>> = {};

// Translation loading function
export const loadTranslations = async (language: SupportedLanguage, namespace: string): Promise<Record<string, any>> => {
  const cacheKey = `${language}-${namespace}`;
  
  // Check cache first
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  try {
    const response = await fetch(`/locales/${language}/${namespace}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}/${namespace}`);
    }
    
    const translations = await response.json();
    
    // Cache the translations
    translationCache.set(cacheKey, JSON.stringify(translations));
    
    // Store in memory
    if (!translationStore[language]) {
      translationStore[language] = {};
    }
    translationStore[language][namespace] = translations;
    
    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${language}/${namespace}:`, error);
    return {};
  }
};

// Main translate function
export const translate = (
  key: string,
  language: SupportedLanguage,
  params?: Record<string, string | number>
): string => {
  const { namespace, key: translationKey } = TranslationKeyHelper.parseKey(key);
  
  // Get translations for the language and namespace
  const translations = translationStore[language]?.[namespace];
  if (!translations) {
    // Try to load synchronously from cache or return fallback
    const cached = translationCache.get(`${language}-${namespace}`);
    if (cached) {
      const parsedTranslations = JSON.parse(cached);
      if (!translationStore[language]) {
        translationStore[language] = {};
      }
      translationStore[language][namespace] = parsedTranslations;
    } else {
      // Return key as fallback
      return key;
    }
  }
  
  // Get the translation value
  const value = TranslationKeyHelper.getNestedValue(
    translationStore[language]?.[namespace],
    translationKey
  );
  
  if (typeof value !== 'string') {
    // Fallback to English if available
    if (language !== 'en') {
      const fallbackValue = TranslationKeyHelper.getNestedValue(
        translationStore['en']?.[namespace],
        translationKey
      );
      if (typeof fallbackValue === 'string') {
        return interpolate(fallbackValue, params);
      }
    }
    return key; // Return key as final fallback
  }
  
  return interpolate(value, params);
};

// Interpolation function
const interpolate = (
  template: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return template;
  
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
};

// Initialize translations for common namespaces
export const initializeTranslations = async (language: SupportedLanguage): Promise<void> => {
  const commonNamespaces = ['common', 'navigation', 'auth', 'workspace', 'notice', 'test'];
  
  await Promise.all(
    commonNamespaces.map(namespace => loadTranslations(language, namespace))
  );
};

// Default instances
export const languageStorage = new LanguageStorageManager();
export const translationCache = new TranslationCacheManager();
export const languageDetector = LanguageDetector;
export const languageValidator = LanguageValidator;
export const formattingUtils = FormattingUtils;
export const translationKeyHelper = TranslationKeyHelper;
export const translationValidator = TranslationValidator;
export const errorUtils = ErrorUtils;