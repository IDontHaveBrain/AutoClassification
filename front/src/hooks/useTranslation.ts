import { useAppSelector } from '../stores/rootHook';
import { translate } from '../utils/i18nUtils';

export const useTranslation = () => {
  const currentLanguage = useAppSelector((state) => state.i18n.currentLanguage);
  
  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, currentLanguage, params);
  };

  return {
    t,
    language: currentLanguage,
    isRTL: false, // Add RTL support if needed in the future
  };
};

export default useTranslation;