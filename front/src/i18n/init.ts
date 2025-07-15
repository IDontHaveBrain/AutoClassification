import { type Store } from '@reduxjs/toolkit';

import { setLanguage } from '../stores/i18nSlice';
import type { RootState } from '../stores/rootStore';

import i18n, { getCurrentLanguage } from './config';

// Simplified i18n initialization for Redux store
export const initializeI18n = (store: Store<RootState>) => {
  // Set initial language from i18n config
  store.dispatch(setLanguage(getCurrentLanguage()));
  return i18n;
};

// Simplified sync function
export const syncI18nWithStore = (store: Store<RootState>) => {
  // Subscribe to store changes and update i18n if needed
  store.subscribe(() => {
    const state = store.getState();
    const currentI18nLanguage = getCurrentLanguage();
    const storeLanguage = state.i18n.currentLanguage;

    // If store language is different from i18n language, update i18n
    if (storeLanguage !== currentI18nLanguage) {
      i18n.changeLanguage(storeLanguage);
    }
  });
};