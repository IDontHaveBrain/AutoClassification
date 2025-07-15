import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type Language, type SupportedLanguage, type TranslationLoadingState } from '../types/i18n';

// Re-export types for easier consumption
export type { Language, SupportedLanguage, TranslationLoadingState } from '../types/i18n';

export interface I18nState {
  currentLanguage: SupportedLanguage;
  availableLanguages: Language[];
  isLoading: boolean;
  loadingState: TranslationLoadingState;
  lastError?: string;
  cachedLanguages: Set<SupportedLanguage>;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
] as const;

const initialState: I18nState = {
  currentLanguage: 'ko',
  availableLanguages: SUPPORTED_LANGUAGES,
  isLoading: false,
  loadingState: 'idle',
  lastError: undefined,
  cachedLanguages: new Set(['ko']),
};

// DEBUG: Log initial state
console.info('🔍 i18nSlice - Initial state:', {
  SUPPORTED_LANGUAGES,
  initialState,
  availableLanguagesLength: SUPPORTED_LANGUAGES.length,
});

const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.currentLanguage = action.payload;
      // Ensure cachedLanguages is a Set (safety check for persistence issues)
      if (!(state.cachedLanguages instanceof Set)) {
        state.cachedLanguages = new Set(Array.isArray(state.cachedLanguages) ? state.cachedLanguages : [state.currentLanguage]);
      }
      state.cachedLanguages.add(action.payload);
      state.lastError = undefined;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingState: (state, action: PayloadAction<TranslationLoadingState>) => {
      state.loadingState = action.payload;
      state.isLoading = action.payload === 'loading';
    },
    setAvailableLanguages: (state, action: PayloadAction<Language[]>) => {
      state.availableLanguages = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload;
      state.loadingState = 'error';
      state.isLoading = false;
    },
    clearError: (state) => {
      state.lastError = undefined;
      if (state.loadingState === 'error') {
        state.loadingState = 'idle';
      }
    },
    addCachedLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      // Ensure cachedLanguages is a Set (safety check for persistence issues)
      if (!(state.cachedLanguages instanceof Set)) {
        state.cachedLanguages = new Set(Array.isArray(state.cachedLanguages) ? state.cachedLanguages : [state.currentLanguage]);
      }
      state.cachedLanguages.add(action.payload);
    },
    clearCache: (state) => {
      state.cachedLanguages = new Set([state.currentLanguage]);
    },
  },
});

export const {
  setLanguage,
  setLoading,
  setLoadingState,
  setAvailableLanguages,
  setError,
  clearError,
  addCachedLanguage,
  clearCache,
} = i18nSlice.actions;

export const i18nReducer = i18nSlice.reducer;

// Selectors with proper typing
export const selectCurrentLanguage = (state: { i18n: I18nState }): SupportedLanguage =>
  state.i18n.currentLanguage;

export const selectAvailableLanguages = (state: { i18n: I18nState }): Language[] =>
  state.i18n.availableLanguages;

export const selectIsLoading = (state: { i18n: I18nState }): boolean =>
  state.i18n.isLoading;

export const selectLoadingState = (state: { i18n: I18nState }): TranslationLoadingState =>
  state.i18n.loadingState;

export const selectLastError = (state: { i18n: I18nState }): string | undefined =>
  state.i18n.lastError;

export const selectCachedLanguages = (state: { i18n: I18nState }): Set<SupportedLanguage> => {
  const cached = state.i18n.cachedLanguages;
  // Ensure cached languages is a Set (safety check for persistence issues)
  if (!(cached instanceof Set)) {
    return new Set(Array.isArray(cached) ? cached : [state.i18n.currentLanguage]);
  }
  return cached;
};

export const selectIsLanguageCached = (language: SupportedLanguage) =>
  (state: { i18n: I18nState }): boolean => {
    const cached = state.i18n.cachedLanguages;
    // Ensure cached languages is a Set (safety check for persistence issues)
    if (!(cached instanceof Set)) {
      const cachedArray = Array.isArray(cached) ? cached : [state.i18n.currentLanguage];
      return cachedArray.includes(language);
    }
    return cached.has(language);
  };

// Type guard for supported languages
export const isSupportedLanguage = (lang: unknown): lang is SupportedLanguage => {
  return typeof lang === 'string' &&
    SUPPORTED_LANGUAGES.some(supported => supported.code === lang);
};

// Helper to get language configuration
export const getLanguageConfig = (languageCode: SupportedLanguage): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
};