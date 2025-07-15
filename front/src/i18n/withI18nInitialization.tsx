import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Loading } from '../pages/default/Loading';
import type { RootState } from '../stores/rootStore';

interface WithI18nInitializationOptions {
  fallbackComponent?: React.ComponentType;
  showLoadingWhileInitializing?: boolean;
  fallbackText?: string;
}

/**
 * Simplified higher-order component that shows loading while i18n is initializing
 */
export const withI18nInitialization = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithI18nInitializationOptions = {},
): React.FC<P> => {
  const {
    fallbackComponent: FallbackComponent = Loading,
    showLoadingWhileInitializing = true,
    fallbackText = 'Initializing translations...',
  } = options;

  const WrappedComponent: React.FC<P> = (props) => {
    const { ready } = useTranslation();
    const i18nState = useSelector((state: RootState) => state.i18n);

    if (!ready || i18nState.isLoading) {
      if (showLoadingWhileInitializing) {
        return <FallbackComponent />;
      }
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.2rem',
            color: '#666',
          }}
        >
          {fallbackText}
        </div>
      );
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withI18nInitialization(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Simplified hook that provides i18n initialization status
 */
export const useI18nInitialization = () => {
  const { ready } = useTranslation();
  const i18nState = useSelector((state: RootState) => state.i18n);

  return {
    isReady: ready && !i18nState.isLoading,
    isLoading: i18nState.isLoading,
    currentLanguage: i18nState.currentLanguage,
  };
};