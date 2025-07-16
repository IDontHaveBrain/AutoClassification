import { FALLBACK_LANGUAGE } from '../i18n/config';
import { type SupportedLanguage } from '../types/i18n';

/**
 * 참고: 포맷팅 유틸리티들(formatDate, formatNumber, formatCurrency)은
 * React 컨텍스트와 자동 언어 인식을 위해 useLanguage 훅으로 이관되었습니다.
 */

export const isValidLanguage = (language: string): language is SupportedLanguage => {
  return language === 'ko' || language === 'en';
};

export const getSafeLanguage = (code: string, fallback: SupportedLanguage = FALLBACK_LANGUAGE): SupportedLanguage => {
  return isValidLanguage(code) ? code : fallback;
};