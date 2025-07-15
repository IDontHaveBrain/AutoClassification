import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  type I18nState,
  type SupportedLanguage,
  type TranslationError,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
} from '../types/i18n';
import { LanguageDetector, languageStorage } from '../utils/i18nUtils';

// Initial state
const initialState: I18nState = {
  language: 'en', // Default fallback, will be detected on initialization
  isLoading: false,
  error: null,
  loadedNamespaces: [],
  lastChanged: Date.now(),
};

// Detect initial language
const detectInitialLanguage = (): SupportedLanguage => {
  try {
    // First try to get from localStorage
    const stored = languageStorage.get();
    if (stored) {
      return stored;
    }

    // Then try to detect from browser/system
    const detected = LanguageDetector.detect({
      order: ['localStorage', 'navigator', 'htmlTag'],
      fallbackLanguage: 'en',
      checkWhitelist: true,
    });

    return detected.language;
  } catch (error) {
    console.warn('Failed to detect initial language:', error);
    return 'en'; // Safe fallback
  }
};

// Set initial language
initialState.language = detectInitialLanguage();

// Create slice
const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      const newLanguage = action.payload;
      
      // Validate language
      if (!SUPPORTED_LANGUAGE_CODES.includes(newLanguage)) {
        console.error(`Unsupported language: ${newLanguage}`);
        return;
      }

      // Update state
      state.language = newLanguage;
      state.lastChanged = Date.now();
      state.error = null;

      // Persist to localStorage
      try {
        languageStorage.set(newLanguage);
      } catch (error) {
        console.error('Failed to persist language to storage:', error);
      }

      // Update HTML lang attribute
      try {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = newLanguage;
        }
      } catch (error) {
        console.warn('Failed to update HTML lang attribute:', error);
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<TranslationError | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },

    addNamespace: (state, action: PayloadAction<string>) => {
      const namespace = action.payload;
      if (!state.loadedNamespaces.includes(namespace)) {
        state.loadedNamespaces.push(namespace);
      }
    },

    removeNamespace: (state, action: PayloadAction<string>) => {
      const namespace = action.payload;
      state.loadedNamespaces = state.loadedNamespaces.filter(ns => ns !== namespace);
    },

    clearNamespaces: (state) => {
      state.loadedNamespaces = [];
    },

    reset: (state) => {
      state.language = 'en';
      state.isLoading = false;
      state.error = null;
      state.loadedNamespaces = [];
      state.lastChanged = Date.now();
      
      // Clear from localStorage
      try {
        languageStorage.remove();
      } catch (error) {
        console.error('Failed to clear language from storage:', error);
      }
    },

    initializeFromStorage: (state) => {
      const detectedLanguage = detectInitialLanguage();
      if (detectedLanguage !== state.language) {
        state.language = detectedLanguage;
        state.lastChanged = Date.now();
      }
    },
  },
});

// Export actions
export const {
  setLanguage,
  setLoading,
  setError,
  addNamespace,
  removeNamespace,
  clearNamespaces,
  reset,
  initializeFromStorage,
} = i18nSlice.actions;

// Export reducer
export const i18nReducer = i18nSlice.reducer;

// Selectors
export const selectLanguage = (state: { i18n: I18nState }) => state.i18n.language;
export const selectIsLoading = (state: { i18n: I18nState }) => state.i18n.isLoading;
export const selectError = (state: { i18n: I18nState }) => state.i18n.error;
export const selectLoadedNamespaces = (state: { i18n: I18nState }) => state.i18n.loadedNamespaces;
export const selectLastChanged = (state: { i18n: I18nState }) => state.i18n.lastChanged;

// Computed selectors
export const selectLanguageInfo = (state: { i18n: I18nState }) => {
  const language = selectLanguage(state);
  return SUPPORTED_LANGUAGES.find(lang => lang.code === language);
};

export const selectIsLanguageSupported = (state: { i18n: I18nState }) => (language: string) => {
  return SUPPORTED_LANGUAGE_CODES.includes(language as SupportedLanguage);
};

export const selectSupportedLanguages = () => SUPPORTED_LANGUAGES;

export const selectAvailableLanguages = (state: { i18n: I18nState }) => {
  const currentLanguage = selectLanguage(state);
  return SUPPORTED_LANGUAGES.filter(lang => lang.code !== currentLanguage);
};

export const selectHasError = (state: { i18n: I18nState }) => {
  return state.i18n.error !== null;
};

export const selectIsNamespaceLoaded = (state: { i18n: I18nState }) => (namespace: string) => {
  return state.i18n.loadedNamespaces.includes(namespace);
};

export const selectI18nState = (state: { i18n: I18nState }) => state.i18n;

// Async action creators (thunks)
export const changeLanguage = (language: SupportedLanguage) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Validate language
    if (!SUPPORTED_LANGUAGE_CODES.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Set language
    dispatch(setLanguage(language));

    // Additional async operations can be added here
    // For example: loading translation files, API calls, etc.

  } catch (error) {
    const translationError: TranslationError = {
      code: 'INVALID_LANGUAGE',
      message: error instanceof Error ? error.message : 'Unknown error',
      language,
    };
    dispatch(setError(translationError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const initializeI18n = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Initialize from storage
    dispatch(initializeFromStorage());

  } catch (error) {
    const translationError: TranslationError = {
      code: 'INVALID_LANGUAGE',
      message: error instanceof Error ? error.message : 'Failed to initialize i18n',
    };
    dispatch(setError(translationError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const resetI18n = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(reset());
  } catch (error) {
    const translationError: TranslationError = {
      code: 'INVALID_LANGUAGE',
      message: error instanceof Error ? error.message : 'Failed to reset i18n',
    };
    dispatch(setError(translationError));
  } finally {
    dispatch(setLoading(false));
  }
};

// Export constants
export { SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGE_CODES };

// Export types
export type { SupportedLanguage, I18nState, TranslationError };

// Default export
export default i18nSlice.reducer;