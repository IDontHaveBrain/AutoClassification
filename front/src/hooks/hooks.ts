import { useTranslation as useI18nTranslation } from 'react-i18next';
import { type i18n, type TOptions } from 'i18next';

export interface UseTranslationResult {
  t: (key: string, options?: TOptions) => string;
  ready: boolean;
  i18n: i18n;
  language: string;
}

/**
 * Unified translation hook that can handle all namespaces
 */
export const useTranslation = (namespace?: string): UseTranslationResult => {
  const { t, ready, i18n } = useI18nTranslation(namespace || 'common');

  return {
    t,
    ready,
    i18n,
    language: i18n.language,
  };
};

export default useTranslation;