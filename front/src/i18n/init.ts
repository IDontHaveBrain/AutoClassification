import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import { i18nConfig } from './config';

export const initI18n = async () => {
  // Only initialize if not already initialized
  if (!i18n.isInitialized) {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(i18nConfig);
  }

  return i18n;
};

export default i18n;