import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import 'dayjs/locale/ko';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

import { LANGUAGES } from '../i18n/config';
import { type SupportedLanguage } from '../types/i18n';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UseLanguageResult {
  currentLanguage: SupportedLanguage;
  availableLanguages: LanguageInfo[];
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
  formatDate: (date: string | Date, format?: string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: string | Date) => string;
  isRTL: boolean;
}

const LANGUAGE_INFO: Record<SupportedLanguage, LanguageInfo> = {
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
};

/**
 * 언어별 포맷팅 함수를 제공하며 현재 언어 컨텍스트를 자동 인식합니다.
 * i18nUtils의 중복 포맷팅 유틸리티는 이 훅으로 통합되었습니다.
 */
export const useLanguage = (): UseLanguageResult => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;
  const isLoading = !i18n.isInitialized;

  const availableLanguages = useMemo(
    () => Object.values(LANGUAGE_INFO),
    [],
  );

  const changeLanguage = useCallback(
    async (language: SupportedLanguage) => {
      await i18n.changeLanguage(language);
    },
    [i18n],
  );

  const formatDate = useCallback(
    (date: string | Date, format = 'YYYY-MM-DD') => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dayjs(dateObj).locale(currentLanguage).format(format);
      } catch (error) {
        return String(date);
      }
    },
    [currentLanguage],
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(currentLanguage, options).format(number);
      } catch (error) {
        return String(number);
      }
    },
    [currentLanguage],
  );

  const formatCurrency = useCallback(
    (amount: number, currency = 'KRW') => {
      try {
        return new Intl.NumberFormat(currentLanguage, {
          style: 'currency',
          currency,
        }).format(amount);
      } catch (error) {
        return `${amount} ${currency}`;
      }
    },
    [currentLanguage],
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
        return dayjs(date).fromNow();
      }
    },
    [currentLanguage],
  );

  const isRTL = useMemo(() => {
    const RTL_LANGUAGES: SupportedLanguage[] = [];
    return RTL_LANGUAGES.includes(currentLanguage);
  }, [currentLanguage]);

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    isLoading,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    isRTL,
  };
};

export const useLanguageInfo = (language?: SupportedLanguage): LanguageInfo => {
  const { currentLanguage } = useLanguage();
  const targetLanguage = language || currentLanguage;

  return useMemo(
    () => LANGUAGE_INFO[targetLanguage],
    [targetLanguage],
  );
};

export const useLanguageDetection = () => {
  const { changeLanguage } = useLanguage();

  const detectBrowserLanguage = useCallback(() => {
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    return Object.values(LANGUAGES).includes(browserLang) ? browserLang : LANGUAGES.ko;
  }, []);

  const detectSystemLanguage = useCallback(() => {
    const systemLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0] as SupportedLanguage;
    return Object.values(LANGUAGES).includes(systemLang) ? systemLang : LANGUAGES.ko;
  }, []);

  const autoDetectAndSet = useCallback(async () => {
    const detectedLanguage = detectBrowserLanguage();
    try {
      await changeLanguage(detectedLanguage);
      return detectedLanguage;
    } catch (error) {
      return LANGUAGES.ko;
    }
  }, [detectBrowserLanguage, changeLanguage]);

  return {
    detectBrowserLanguage,
    detectSystemLanguage,
    autoDetectAndSet,
  };
};