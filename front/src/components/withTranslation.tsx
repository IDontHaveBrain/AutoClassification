import { type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

export interface WithTranslationProps {
  t: (key: string, defaultValue?: string) => string;
}

export function withTranslation<P extends object>(
  Component: ComponentType<P & WithTranslationProps>,
  namespace: string = 'common',
) {
  return function WrappedComponent(props: P) {
    const { t: i18nT } = useTranslation(namespace);

    // WithTranslationProps 인터페이스에 맞추기 위한 어댑터 함수
    const t = (key: string, defaultValue?: string): string => {
      return i18nT(key, { defaultValue });
    };

    return <Component {...props} t={t} />;
  };
}