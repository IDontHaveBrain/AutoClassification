import { type Language } from '../stores/i18nSlice';
import { type TranslationKeyPath } from '../types/i18n';

/**
 * Language detection utilities
 */
export const languageDetection = {
  /**
   * Detect browser language
   */
  detectBrowserLanguage(): string {
    const browserLang = navigator.language || navigator.languages?.[0] || 'ko';
    return browserLang.split('-')[0].toLowerCase();
  },

  /**
   * Get language from localStorage
   */
  getStoredLanguage(): string | null {
    try {
      return localStorage.getItem('i18n_language');
    } catch {
      return null;
    }
  },

  /**
   * Store language in localStorage
   */
  storeLanguage(language: string): void {
    try {
      localStorage.setItem('i18n_language', language);
    } catch (error) {
      console.warn('Failed to store language preference:', error);
    }
  },

  /**
   * Get the best language match from available languages
   */
  getBestLanguageMatch(availableLanguages: Language[]): string {
    const stored = this.getStoredLanguage();
    if (stored && availableLanguages.some(lang => lang.code === stored)) {
      return stored;
    }

    const browserLang = this.detectBrowserLanguage();
    const match = availableLanguages.find(lang => lang.code === browserLang);

    return match?.code || 'ko'; // Default fallback
  },

  /**
   * Check if language is RTL
   * Currently only supporting Korean and English (both LTR)
   */
  isRTL(languageCode: string): boolean {
    const rtlLanguages: string[] = []; // No RTL languages supported currently
    return rtlLanguages.includes(languageCode.toLowerCase());
  },
};

/**
 * Language validation utilities
 */
export const languageValidation = {
  /**
   * Validate language code format
   */
  isValidLanguageCode(code: string): boolean {
    const languageCodePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    return languageCodePattern.test(code);
  },

  /**
   * Validate language object
   */
  isValidLanguage(language: unknown): language is Language {
    return (
      language &&
      typeof language === 'object' &&
      language !== null &&
      'code' in language &&
      'name' in language &&
      'flag' in language &&
      typeof (language as { code: unknown }).code === 'string' &&
      typeof (language as { name: unknown }).name === 'string' &&
      typeof (language as { flag: unknown }).flag === 'string' &&
      this.isValidLanguageCode((language as { code: string }).code)
    );
  },

  /**
   * Validate array of languages
   */
  isValidLanguageArray(languages: unknown[]): languages is Language[] {
    return Array.isArray(languages) && languages.every(this.isValidLanguage);
  },

  /**
   * Sanitize language code
   */
  sanitizeLanguageCode(code: string): string {
    return code.toLowerCase().split('-')[0];
  },
};

/**
 * Translation key helpers
 */
export const translationKeyHelpers = {
  /**
   * Build nested translation key
   */
  buildKey(namespace: string, key: string): string {
    return `${namespace}.${key}`;
  },

  /**
   * Parse translation key to get namespace and key
   */
  parseKey(fullKey: string): { namespace: string; key: string } {
    const parts = fullKey.split('.');
    if (parts.length < 2) {
      return { namespace: 'common', key: fullKey };
    }

    const namespace = parts[0];
    const key = parts.slice(1).join('.');
    return { namespace, key };
  },

  /**
   * Check if key exists in translation object
   */
  hasKey(translations: Record<string, unknown>, key: string): boolean {
    const keys = key.split('.');
    let current: unknown = translations;

    for (const k of keys) {
      if (!current || typeof current !== 'object' || current === null || !(k in current)) {
        return false;
      }
      current = (current as Record<string, unknown>)[k];
    }

    return typeof current === 'string';
  },

  /**
   * Get all keys from translation object
   */
  getAllKeys(translations: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = [];

    for (const key in translations) {
      if (Object.prototype.hasOwnProperty.call(translations, key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = translations[key];

        if (typeof value === 'string') {
          keys.push(fullKey);
        } else if (typeof value === 'object' && value !== null) {
          keys.push(...this.getAllKeys(value as Record<string, unknown>, fullKey));
        }
      }
    }

    return keys;
  },

  /**
   * Find missing keys between two translation objects
   */
  findMissingKeys(baseTranslations: Record<string, unknown>, targetTranslations: Record<string, unknown>): string[] {
    const baseKeys = this.getAllKeys(baseTranslations);
    const missingKeys: string[] = [];

    for (const key of baseKeys) {
      if (!this.hasKey(targetTranslations, key)) {
        missingKeys.push(key);
      }
    }

    return missingKeys;
  },

  /**
   * Validate translation key path
   */
  isValidKeyPath(keyPath: TranslationKeyPath): boolean {
    return typeof keyPath === 'string' && keyPath.length > 0;
  },
};

/**
 * Formatting utilities for different languages
 */
export const formatUtils = {
  /**
   * Format date according to language
   */
  formatDate(date: Date, language: string): string {
    const formatters: Record<string, Intl.DateTimeFormatOptions> = {
      'ko': {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      },
      'en': {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      },
    };

    const options = formatters[language] || formatters['ko'];

    try {
      return new Intl.DateTimeFormat(language, options).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  },

  /**
   * Format number according to language
   */
  formatNumber(number: number, language: string): string {
    const formatters: Record<string, Intl.NumberFormatOptions> = {
      'ko': { style: 'decimal' },
      'en': { style: 'decimal' },
    };

    const options = formatters[language] || formatters['ko'];

    try {
      return new Intl.NumberFormat(language, options).format(number);
    } catch {
      return number.toString();
    }
  },

  /**
   * Format currency according to language
   */
  formatCurrency(amount: number, language: string, currency = 'KRW'): string {
    const currencies: Record<string, string> = {
      'ko': 'KRW',
      'en': 'USD',
    };

    const defaultCurrency = currencies[language] || currency;

    try {
      return new Intl.NumberFormat(language, {
        style: 'currency',
        currency: defaultCurrency,
      }).format(amount);
    } catch {
      return `${amount} ${defaultCurrency}`;
    }
  },

  /**
   * Format relative time according to language
   */
  formatRelativeTime(date: Date, language: string): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    try {
      const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      }
    } catch {
      return date.toLocaleDateString();
    }
  },
};

/**
 * Alert system integration for i18n
 */
export const i18nAlert = {
  /**
   * Show localized alert message
   */
  showAlert(messageKey: string, t: (key: string) => string, callback?: () => void): void {
    const message = t(messageKey);

    // Use existing alert system
    const doAlert = (detail: { message: string; callback?: () => void }) => {
      window.dispatchEvent(
        new CustomEvent('Alert', {
          detail,
        }),
      );
    };

    doAlert({ message, callback });
  },

  /**
   * Show error alert with translation
   */
  showError(errorKey: string, t: (key: string) => string): void {
    this.showAlert(`errors.${errorKey}`, t);
  },

  /**
   * Show success alert with translation
   */
  showSuccess(successKey: string, t: (key: string) => string): void {
    this.showAlert(`common.${successKey}`, t);
  },

  /**
   * Show validation error alert
   */
  showValidationError(fieldKey: string, validationType: string, t: (key: string) => string): void {
    const messageKey = `validation.${validationType}`;
    const fieldName = t(`common.${fieldKey}`);
    const validationMessage = t(messageKey);

    this.showAlert('common.error', t, () => {
      console.error(`Validation error for ${fieldName}: ${validationMessage}`);
    });
  },
};

/**
 * Utility to get language direction
 */
export const getLanguageDirection = (language: string): 'ltr' | 'rtl' => {
  return languageDetection.isRTL(language) ? 'rtl' : 'ltr';
};

/**
 * Utility to get language display name
 */
export const getLanguageDisplayName = (
  language: string,
  availableLanguages: Language[],
): string => {
  const lang = availableLanguages.find(l => l.code === language);
  return lang?.name || language;
};