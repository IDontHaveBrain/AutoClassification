import React, { Component, ReactNode, Suspense } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BackGround, { CustomSnackbarProvider } from 'layouts/BackGround';
import { Loading } from 'pages/default/Loading';
import { PersistGate } from 'redux-persist/integration/react';
import { baseRouter } from 'Routers';
import { persistor, rootStore } from 'stores/rootStore';
import { I18nProvider } from 'i18n/provider';

const defaultTheme = createTheme();

// App Error Boundary Component
interface AppErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class AppErrorBoundary extends Component<
    { children: ReactNode },
    AppErrorBoundaryState
> {
    constructor(props: { children: ReactNode }) {
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
            return (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <h1>Something went wrong</h1>
                    <p>The application encountered an unexpected error.</p>
                    <details style={{ marginTop: '20px', maxWidth: '600px' }}>
                        <summary>Error Details</summary>
                        <pre style={{ 
                            textAlign: 'left', 
                            whiteSpace: 'pre-wrap',
                            background: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto'
                        }}>
                            {this.state.error?.message || 'Unknown error'}
                            {this.state.error?.stack && '\n\nStack trace:\n' + this.state.error.stack}
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
                            cursor: 'pointer'
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Loading fallback component for Suspense
const TranslationLoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
    }}>
        <Loading />
    </div>
);

function App() {
    return (
        <AppErrorBoundary>
            <Suspense fallback={<TranslationLoadingFallback />}>
                <ThemeProvider theme={defaultTheme}>
                    <Provider store={rootStore}>
                        <PersistGate persistor={persistor} loading={<Loading />}>
                            <I18nProvider store={rootStore}>
                                <CustomSnackbarProvider maxSnack={3}>
                                    <RouterProvider
                                        router={baseRouter}
                                        fallbackElement={<Loading />}
                                    />
                                    <BackGround />
                                </CustomSnackbarProvider>
                            </I18nProvider>
                        </PersistGate>
                    </Provider>
                </ThemeProvider>
            </Suspense>
        </AppErrorBoundary>
    );
}

export default App;
