import { setLanguage } from '../stores/i18nSlice';
import { useAppDispatch, useAppSelector } from '../stores/rootHook';

import { changeLanguage } from './config';

/**
 * Hook for language selection functionality
 */
export const useLanguageSelector = () => {
  const dispatch = useAppDispatch();
  const { currentLanguage, availableLanguages, isLoading } = useAppSelector((state) => state.i18n);

  const handleChangeLanguage = async (language: string) => {
    dispatch(setLanguage(language));
    await changeLanguage(language);
  };

  return {
    currentLanguage,
    availableLanguages,
    isLoading,
    changeLanguage: handleChangeLanguage,
  };
};