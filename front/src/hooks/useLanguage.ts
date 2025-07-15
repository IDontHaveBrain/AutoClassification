import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useI18n } from 'react-i18next';
import dayjs from 'dayjs';

import { Language, LANGUAGES } from '../i18n/config';
import { 
  selectLanguage, 
  selectIsLoading, 
  selectError, 
  selectIsInitialized,
  setError,
  resetError 
} from '../stores/i18nSlice';
import { useI18nContext } from '../i18n/provider';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UseLanguageResult {
  currentLanguage: Language;
  availableLanguages: LanguageInfo[];
  changeLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  formatDate: (date: string | Date, format?: string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: string | Date) => string;
  isRTL: boolean;
  clearError: () => void;
}

const LANGUAGE_INFO: Record<Language, LanguageInfo> = {
  [LANGUAGES.ko]: {
    code: LANGUAGES.ko,
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
  [LANGUAGES.en]: {
    code: LANGUAGES.en,
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
};

/**
 * Hook for language management with formatting utilities
 */
export const useLanguage = (): UseLanguageResult => {
  const dispatch = useDispatch();
  const { i18n } = useI18n();
  const { changeLanguage: contextChangeLanguage } = useI18nContext();
  
  const currentLanguage = useSelector(selectLanguage);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isInitialized = useSelector(selectIsInitialized);

  const availableLanguages = useMemo(
    () => Object.values(LANGUAGE_INFO),
    []
  );

  const changeLanguage = useCallback(
    async (language: Language) => {
      try {
        dispatch(resetError());
        await contextChangeLanguage(language);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to change language';
        dispatch(setError(errorMessage));
        throw error;
      }
    },
    [contextChangeLanguage, dispatch]
  );

  const formatDate = useCallback(
    (date: string | Date, format = 'YYYY-MM-DD') => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dayjs(dateObj).locale(currentLanguage).format(format);
      } catch (error) {
        console.error('Date formatting error:', error);
        return String(date);
      }
    },
    [currentLanguage]
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(currentLanguage, options).format(number);
      } catch (error) {
        console.error('Number formatting error:', error);
        return String(number);
      }
    },
    [currentLanguage]
  );

  const formatCurrency = useCallback(
    (amount: number, currency = 'KRW') => {
      try {
        return new Intl.NumberFormat(currentLanguage, {
          style: 'currency',
          currency,
        }).format(amount);
      } catch (error) {
        console.error('Currency formatting error:', error);
        return `${amount} ${currency}`;
      }
    },
    [currentLanguage]
  );

  const formatRelativeTime = useCallback(
    (date: string | Date) => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diff = now.getTime() - dateObj.getTime();
        
        const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' });
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        
        if (years > 0) return rtf.format(-years, 'year');
        if (months > 0) return rtf.format(-months, 'month');
        if (days > 0) return rtf.format(-days, 'day');
        if (hours > 0) return rtf.format(-hours, 'hour');
        if (minutes > 0) return rtf.format(-minutes, 'minute');
        return rtf.format(-seconds, 'second');
      } catch (error) {
        console.error('Relative time formatting error:', error);
        return dayjs(date).fromNow();
      }
    },
    [currentLanguage]
  );

  const isRTL = useMemo(() => {
    // Add RTL languages if needed in the future
    const RTL_LANGUAGES: Language[] = [];
    return RTL_LANGUAGES.includes(currentLanguage);
  }, [currentLanguage]);

  const clearError = useCallback(() => {
    dispatch(resetError());
  }, [dispatch]);

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    isLoading,
    error,
    isInitialized,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    isRTL,
    clearError,
  };
};

/**
 * Hook for getting language-specific information
 */
export const useLanguageInfo = (language?: Language): LanguageInfo => {
  const { currentLanguage } = useLanguage();
  const targetLanguage = language || currentLanguage;
  
  return useMemo(
    () => LANGUAGE_INFO[targetLanguage],
    [targetLanguage]
  );
};

/**
 * Hook for language detection utilities
 */
export const useLanguageDetection = () => {
  const { changeLanguage } = useLanguage();
  
  const detectBrowserLanguage = useCallback(() => {
    const browserLang = navigator.language.split('-')[0] as Language;
    return Object.values(LANGUAGES).includes(browserLang) ? browserLang : LANGUAGES.ko;
  }, []);
  
  const detectSystemLanguage = useCallback(() => {
    const systemLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0] as Language;
    return Object.values(LANGUAGES).includes(systemLang) ? systemLang : LANGUAGES.ko;
  }, []);
  
  const autoDetectAndSet = useCallback(async () => {
    const detectedLanguage = detectBrowserLanguage();
    try {
      await changeLanguage(detectedLanguage);
      return detectedLanguage;
    } catch (error) {
      console.error('Auto-detection failed:', error);
      return LANGUAGES.ko;
    }
  }, [detectBrowserLanguage, changeLanguage]);
  
  return {
    detectBrowserLanguage,
    detectSystemLanguage,
    autoDetectAndSet,
  };
};