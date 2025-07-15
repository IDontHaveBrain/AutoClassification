import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Store } from '@reduxjs/toolkit';

import i18n, { initI18n } from './init';
import { Language } from './config';
import { selectLanguage, selectIsInitialized, selectIsLoading, selectError } from '../stores/i18nSlice';

interface I18nContextType {
  language: Language;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  changeLanguage: (language: Language) => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  store: Store;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, store }) => {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  
  const language = useSelector(selectLanguage);
  const isInitialized = useSelector(selectIsInitialized);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await initI18n(store);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsReady(true); // Still set ready to prevent infinite loading
      }
    };

    initializeI18n();
  }, [store]);

  const handleChangeLanguage = async (newLanguage: Language) => {
    try {
      const { changeLanguage } = await import('./init');
      await changeLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  const contextValue: I18nContextType = {
    language,
    isInitialized,
    isLoading,
    error,
    changeLanguage: handleChangeLanguage,
  };

  if (!isReady) {
    return <div>Loading translations...</div>;
  }

  return (
    <I18nContext.Provider value={contextValue}>
      <I18nextProvider i18n={i18n}>
        <I18nErrorBoundary>
          {children}
        </I18nErrorBoundary>
      </I18nextProvider>
    </I18nContext.Provider>
  );
};

export const useI18nContext = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
};

// Error boundary for translation errors
interface I18nErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class I18nErrorBoundary extends React.Component<
  { children: ReactNode },
  I18nErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): I18nErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('I18n Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Translation Error</h2>
          <p>Something went wrong with the translation system.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error Details</summary>
            <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '10px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}