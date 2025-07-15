import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type Language,setLanguage, setLoading } from '../stores/i18nSlice';
import { useAppDispatch, useAppSelector } from '../stores/rootHook';
import { type LanguageConfig, type SupportedLanguage,type UseLanguageResult } from '../types/i18n';
import { onAlert } from '../utils/alert';

/**
 * Custom hook for language switching functionality
 * Manages language state and provides language switching capabilities
 */
export const useLanguage = (): UseLanguageResult => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentLanguage, availableLanguages, isLoading } = useAppSelector((state) => state.i18n);

  // DEBUG: Log Redux store state
  console.info('🔍 useLanguage - Redux state:', {
    currentLanguage,
    availableLanguages,
    isLoading,
  });

  // Convert Language[] to LanguageConfig[]
  const languageConfigs: LanguageConfig[] = useMemo(() => {
    const configs = availableLanguages.map((lang: Language) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.name,
      flag: lang.flag,
      rtl: false, // Only supporting Korean and English (both LTR)
      dateFormat: getDateFormat(lang.code),
      numberFormat: getNumberFormat(lang.code),
    }));

    // DEBUG: Log converted configs
    console.info('🔍 useLanguage - languageConfigs:', configs);
    return configs;
  }, [availableLanguages]);

  // Check if current language is RTL
  const isRTL = useMemo(() => {
    const currentConfig = languageConfigs.find(lang => lang.code === currentLanguage);
    return currentConfig?.rtl || false;
  }, [currentLanguage, languageConfigs]);

  // Change language function
  const changeLanguage = useCallback(async (languageCode: string): Promise<void> => {
    try {
      dispatch(setLoading(true));

      // Check if language is available
      const isAvailable = availableLanguages.some(lang => lang.code === languageCode);
      if (!isAvailable) {
        throw new Error(`Language "${languageCode}" is not available`);
      }

      // Change language in i18n
      await i18n.changeLanguage(languageCode);

      // Update Redux store
      dispatch(setLanguage(languageCode));

      // Update HTML lang attribute
      document.documentElement.lang = languageCode;

      // Update HTML dir attribute for RTL languages
      const langConfig = languageConfigs.find(lang => lang.code === languageCode);
      document.documentElement.dir = langConfig?.rtl ? 'rtl' : 'ltr';

      // Show success message
      onAlert(`Language changed to ${languageConfigs.find(lang => lang.code === languageCode)?.name}`);

    } catch (error) {
      console.error('Failed to change language:', error);
      onAlert('Failed to change language. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  }, [i18n, dispatch, availableLanguages, languageConfigs]);

  // Initialize language on mount
  useEffect(() => {
    // Sync i18n language with Redux store
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }

    // Set HTML attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage, i18n, isRTL]);

  // Listen for i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== currentLanguage) {
        dispatch(setLanguage(lng));
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [currentLanguage, dispatch, i18n]);

  // Type guard for supported languages
  const isSupported = useCallback((language: string): language is SupportedLanguage => {
    return availableLanguages.some(lang => lang.code === language);
  }, [availableLanguages]);

  // Get language configuration
  const getLanguageConfig = useCallback((language: SupportedLanguage): LanguageConfig | undefined => {
    return languageConfigs.find(lang => lang.code === language);
  }, [languageConfigs]);

  return {
    currentLanguage,
    availableLanguages: languageConfigs,
    changeLanguage,
    isLoading,
    isRTL,
    isSupported,
    getLanguageConfig,
  };
};

/**
 * Hook for getting current language info only
 */
export const useCurrentLanguage = (): LanguageConfig => {
  const { currentLanguage, availableLanguages } = useLanguage();
  return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
};

/**
 * Hook for language detection
 */
export const useLanguageDetection = () => {
  const { changeLanguage } = useLanguage();

  const detectAndSetLanguage = useCallback(() => {
    // Try to detect language from various sources
    const detectedLanguage =
      navigator.language.split('-')[0] || // Browser language
      navigator.languages?.[0]?.split('-')[0] || // Browser languages
      'ko'; // Default fallback

    // Map common language codes
    const languageMap: Record<string, string> = {
      'en': 'en',
      'ko': 'ko',
    };

    const mappedLanguage = languageMap[detectedLanguage.toLowerCase()] || 'ko';
    changeLanguage(mappedLanguage);
  }, [changeLanguage]);

  return { detectAndSetLanguage };
};

// Helper functions
function getDateFormat(languageCode: string): string {
  const dateFormats: Record<string, string> = {
    'ko': 'YYYY년 MM월 DD일',
    'en': 'MM/DD/YYYY',
  };

  return dateFormats[languageCode] || dateFormats['ko'];
}

function getNumberFormat(languageCode: string): Intl.NumberFormatOptions {
  const numberFormats: Record<string, Intl.NumberFormatOptions> = {
    'ko': { locale: 'ko-KR' },
    'en': { locale: 'en-US' },
  };

  return numberFormats[languageCode] || numberFormats['ko'];
}