import React, { Component, type ReactNode, Suspense, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { initI18n } from 'i18n/init';
import { I18nProvider } from 'i18n/provider';
import BackGround, { CustomSnackbarProvider } from 'layouts/BackGround';
import { Loading } from 'pages/default/Loading';
import { PersistGate } from 'redux-persist/integration/react';
import { baseRouter } from 'Routers';
import { persistor, rootStore } from 'stores/rootStore';

import { withTranslation, type WithTranslationProps } from 'components/withTranslation';

const defaultTheme = createTheme();

interface AppErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class AppErrorBoundary extends Component<
    { children: ReactNode } & WithTranslationProps,
    AppErrorBoundaryState
> {
    constructor(props: { children: ReactNode } & WithTranslationProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('App Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const { t } = this.props;
            return (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <h1>{t('somethingWentWrong', 'Something went wrong')}</h1>
                    <p>{t('unexpectedError', 'An unexpected error occurred')}</p>
                    <details style={{ marginTop: '20px', maxWidth: '600px' }}>
                        <summary>{t('errorDetails', 'Error Details')}</summary>
                        <pre style={{
                            textAlign: 'left',
                            whiteSpace: 'pre-wrap',
                            background: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto',
                        }}>
                            {this.state.error?.message || t('api.unknownError', 'Unknown error')}
                            {this.state.error?.stack && `\n\nStack trace:\n${  this.state.error.stack}`}
                        </pre>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        {t('reload', 'Reload')}
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const TranslationLoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    }}>
        <Loading />
    </div>
);

const TranslatedAppErrorBoundary = withTranslation(AppErrorBoundary);

const AppInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isI18nInitialized, setIsI18nInitialized] = useState(false);
    const [initError, setInitError] = useState<Error | null>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                await initI18n();
                setIsI18nInitialized(true);
            } catch (error) {
                console.error('Failed to initialize i18n:', error);
                setInitError(error instanceof Error ? error : new Error('Unknown error'));
                // Still set as initialized to prevent infinite loading
                setIsI18nInitialized(true);
            }
        };

        initialize();
    }, []);

    if (!isI18nInitialized) {
        return <TranslationLoadingFallback />;
    }

    if (initError) {
        // I18n initialization failed, but proceeding with app startup
    }

    return <>{children}</>;
};

function App() {
    return (
        <Provider store={rootStore}>
            <PersistGate persistor={persistor} loading={<Loading />}>
                <AppInitializer>
                    <I18nProvider>
                        <TranslatedAppErrorBoundary>
                            <Suspense fallback={<TranslationLoadingFallback />}>
                                <ThemeProvider theme={defaultTheme}>
                                    <CustomSnackbarProvider maxSnack={3}>
                                        <RouterProvider router={baseRouter} />
                                        <BackGround />
                                    </CustomSnackbarProvider>
                                </ThemeProvider>
                            </Suspense>
                        </TranslatedAppErrorBoundary>
                    </I18nProvider>
                </AppInitializer>
            </PersistGate>
        </Provider>
    );
}

export default App;