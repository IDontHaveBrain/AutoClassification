import React, { useEffect, useRef,useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { clearError, setError, setLanguage, setLoading } from '../stores/i18nSlice';
import { useAppDispatch, useAppSelector } from '../stores/rootHook';
import { languageDetection } from '../utils/i18nUtils';

import i18n, { initializeI18n, isI18nInitialized } from './config';

interface I18nProviderProps {
  children: React.ReactNode;
}

type InitializationState = 'idle' | 'initializing' | 'ready' | 'error';

/**
 * I18n Provider component that initializes and manages i18n state
 * Should wrap the entire application
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { currentLanguage, availableLanguages } = useAppSelector((state) => state.i18n);
  const [initState, setInitState] = useState<InitializationState>('idle');
  const [initError, setInitError] = useState<string | null>(null);
  const initializationRef = useRef<Promise<void> | null>(null);

  // DEBUG: Log Redux store state in I18nProvider
  console.info('🔍 I18nProvider - Redux store state:', {
    currentLanguage,
    availableLanguages,
    availableLanguagesLength: availableLanguages?.length,
    initState,
  });

  useEffect(() => {
    const performInitialization = () => {
      // Prevent multiple simultaneous initializations
      if (initializationRef.current) {
        return initializationRef.current;
      }

      setInitState('initializing');
      dispatch(setLoading(true));
      dispatch(clearError());

      const initPromise = (async () => {
        try {
          // Step 1: Initialize i18n core
          if (!isI18nInitialized()) {
            await initializeI18n();
          }

          // Step 2: Determine target language
          let targetLanguage = currentLanguage;
          if (!targetLanguage) {
            targetLanguage = languageDetection.getBestLanguageMatch(availableLanguages);
            dispatch(setLanguage(targetLanguage));
          }

          // Step 3: Load target language resources
          await i18n.changeLanguage(targetLanguage);

          // Step 4: Wait for all required namespaces to be loaded
          const requiredNamespaces = ['common', 'auth', 'navigation'];
          await Promise.all(
            requiredNamespaces.map(ns => i18n.loadNamespaces(ns)),
          );

          // Step 5: Verify i18n is ready
          if (!i18n.hasResourceBundle(targetLanguage, 'common')) {
            throw new Error(`Failed to load required translations for language: ${targetLanguage}`);
          }

          // Step 6: Update HTML attributes
          document.documentElement.lang = i18n.language;
          document.documentElement.dir = languageDetection.isRTL(i18n.language) ? 'rtl' : 'ltr';

          setInitState('ready');
          setInitError(null);
          console.info('i18n Provider: Initialization completed successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('i18n Provider: Initialization failed:', errorMessage);
          setInitError(errorMessage);
          dispatch(setError(errorMessage));

          // Fallback initialization
          try {
            await i18n.changeLanguage('ko');
            dispatch(setLanguage('ko'));

            // Try to load at least common namespace
            await i18n.loadNamespaces('common');

            if (i18n.hasResourceBundle('ko', 'common')) {
              setInitState('ready');
              setInitError(null);
              console.info('i18n Provider: Fallback initialization successful');
            } else {
              throw new Error('Fallback initialization failed');
            }
          } catch (fallbackError) {
            setInitState('error');
            setInitError(`Critical failure: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
          }
        } finally {
          dispatch(setLoading(false));
          initializationRef.current = null;
        }
      })();

      initializationRef.current = initPromise;
      return initPromise;
    };

    performInitialization();
  }, [dispatch, currentLanguage, availableLanguages]);

  // Listen for i18n language changes and sync with Redux
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== currentLanguage) {
        dispatch(setLanguage(lng));

        // Store language preference
        languageDetection.storeLanguage(lng);

        // Update HTML attributes
        document.documentElement.lang = lng;
        document.documentElement.dir = languageDetection.isRTL(lng) ? 'rtl' : 'ltr';
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [dispatch, currentLanguage]);

  // Render loading state
  if (initState === 'initializing') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666',
          gap: '16px',
        }}
      >
        <div>Initializing translations...</div>
        <div style={{ fontSize: '0.9rem', color: '#999' }}>
          Loading language resources and namespaces
        </div>
      </div>
    );
  }

  // Render error state
  if (initState === 'error') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#d32f2f',
          gap: '16px',
        }}
      >
        <div>Failed to initialize translations</div>
        <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', maxWidth: '400px' }}>
          {initError}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Render ready state
  if (initState === 'ready') {
    return (
      <I18nextProvider i18n={i18n}>
        <I18nReadyWrapper>
          {children}
        </I18nReadyWrapper>
      </I18nextProvider>
    );
  }

  // Fallback (should not reach here)
  return null;
};

/**
 * Wrapper component that ensures i18n is ready before rendering children
 */
const I18nReadyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Double-check that i18n is actually ready
    const checkReady = () => {
      const isInitialized = isI18nInitialized();
      const hasResources = i18n.hasResourceBundle(i18n.language, 'common');
      const isTranslationReady = ready;

      const allReady = isInitialized && hasResources && isTranslationReady;

      setIsReady(prevReady => {
        if (allReady && !prevReady) {
          return true;
        } else if (!allReady && prevReady) {
          return false;
        }
        return prevReady;
      });
    };

    checkReady();

    // Listen for i18n events
    const handleResourcesLoaded = () => checkReady();
    const handleLanguageChanged = () => checkReady();

    i18n.on('loaded', handleResourcesLoaded);
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('loaded', handleResourcesLoaded);
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [ready]); // Removed isReady from dependencies to prevent infinite loop

  if (!isReady) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1rem',
          color: '#666',
        }}
      >
        Preparing application...
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Higher-order component for adding i18n support to components
 */
export const withI18n = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <I18nProvider>
        <Component {...props} />
      </I18nProvider>
    );
  };

  WrappedComponent.displayName = `withI18n(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Hook to check if i18n is ready
 */
export const useI18nReady = () => {
  const { ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkReady = () => {
      const isInitialized = isI18nInitialized();
      const hasResources = i18n.hasResourceBundle(i18n.language, 'common');
      const isTranslationReady = ready;

      setIsReady(isInitialized && hasResources && isTranslationReady);
    };

    checkReady();

    const handleResourcesLoaded = () => checkReady();
    const handleLanguageChanged = () => checkReady();

    i18n.on('loaded', handleResourcesLoaded);
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('loaded', handleResourcesLoaded);
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [ready]);

  return isReady;
};