// Main provider exports
export { I18nProvider, useI18nReady, withI18n } from './provider';

// Hooks
export { useLanguageSelector } from './hooks';

// Initialization utilities
export { useI18nInitialization,withI18nInitialization } from './withI18nInitialization';

// Error boundary
export { TranslationErrorBoundary, withTranslationErrorBoundary } from './TranslationErrorBoundary';

// Configuration exports
export {
  changeLanguage,
  getCurrentLanguage,
  default as i18n,
  initializeI18n,
  isI18nInitialized,
} from './config';

// Utility exports
export {
  formatUtils,
  getLanguageDirection,
  getLanguageDisplayName,
  i18nAlert,
  languageDetection,
  languageValidation,
  translationKeyHelpers } from '../utils/i18nUtils';

// Store exports
export {
  clearError,
  getLanguageConfig,
  isSupportedLanguage,
  selectAvailableLanguages,
  selectCurrentLanguage,
  selectIsLoading,
  selectLastError,
  setError,
  setLanguage,
  setLoading,
  SUPPORTED_LANGUAGES,
} from '../stores/i18nSlice';

// Type exports
export type {
  I18nState,
  Language,
  SupportedLanguage,
  TranslationLoadingState } from '../stores/i18nSlice';
export type {
  AnyTranslationKey,
  LanguageConfig,
  Namespace,
  TextDirection,
  TFunction,
  TranslationKeyPath,
  TranslationKeys,
  UseI18nResult,
  UseTranslationResult } from '../types/i18n';
