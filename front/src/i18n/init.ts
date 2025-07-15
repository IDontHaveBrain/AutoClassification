import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { Store } from '@reduxjs/toolkit';

import { i18nConfig, DEFAULT_LANGUAGE, LANGUAGES, Language } from './config';
import { setLanguage, setInitialized, setLoading, setError } from '../stores/i18nSlice';

let store: Store | null = null;

export const initI18n = async (reduxStore: Store) => {
  store = reduxStore;

  try {
    store.dispatch(setLoading(true));

    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...i18nConfig,
        lng: getInitialLanguage(),
      });

    // Set up language change listener
    i18n.on('languageChanged', (lng: string) => {
      const validLanguage = Object.values(LANGUAGES).includes(lng as Language) 
        ? lng as Language 
        : DEFAULT_LANGUAGE;
      
      if (store) {
        store.dispatch(setLanguage(validLanguage));
      }
      
      // Persist to localStorage
      localStorage.setItem('i18nextLng', validLanguage);
      
      // Update document language
      document.documentElement.lang = validLanguage;
    });

    // Set up error handling
    i18n.on('failedLoading', (lng: string, ns: string, msg: string) => {
      console.error(`Failed to load ${lng}/${ns}:`, msg);
      if (store) {
        store.dispatch(setError(`Failed to load translations: ${msg}`));
      }
    });

    // Set up successful loading
    i18n.on('loaded', () => {
      if (store) {
        store.dispatch(setError(null));
        store.dispatch(setLoading(false));
      }
    });

    // Mark as initialized
    if (store) {
      store.dispatch(setInitialized(true));
      store.dispatch(setLoading(false));
    }

    // Set initial document language
    document.documentElement.lang = i18n.language;

    return i18n;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    if (store) {
      store.dispatch(setError(error instanceof Error ? error.message : 'Failed to initialize i18n'));
      store.dispatch(setLoading(false));
    }
    throw error;
  }
};

export const changeLanguage = async (language: Language) => {
  try {
    if (store) {
      store.dispatch(setLoading(true));
    }
    
    await i18n.changeLanguage(language);
    
    if (store) {
      store.dispatch(setLanguage(language));
      store.dispatch(setLoading(false));
    }
  } catch (error) {
    console.error('Failed to change language:', error);
    if (store) {
      store.dispatch(setError(error instanceof Error ? error.message : 'Failed to change language'));
      store.dispatch(setLoading(false));
    }
    throw error;
  }
};

const getInitialLanguage = (): Language => {
  // Check localStorage first
  const stored = localStorage.getItem('i18nextLng');
  if (stored && Object.values(LANGUAGES).includes(stored as Language)) {
    return stored as Language;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (Object.values(LANGUAGES).includes(browserLang as Language)) {
    return browserLang as Language;
  }

  // Fall back to default
  return DEFAULT_LANGUAGE;
};

export const getStore = () => store;

export default i18n;