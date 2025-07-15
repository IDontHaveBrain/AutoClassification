import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { I18nProvider } from 'i18n';
import BackGround, { CustomSnackbarProvider } from 'layouts/BackGround';
import { Loading } from 'pages/default/Loading';
import { PersistGate } from 'redux-persist/integration/react';
import { useRouter } from 'Routers';
import { persistor, rootStore } from 'stores/rootStore';

const defaultTheme = createTheme();

/**
 * App-level error boundary for critical errors
 */
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
          <div>Application Error</div>
          <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unknown error occurred'}
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

    return this.props.children;
  }
}

function AppRouter() {
    const router = useRouter();
    
    return (
        <CustomSnackbarProvider maxSnack={3}>
            <RouterProvider
                router={router}
                fallbackElement={<Loading />}
            />
            <BackGround />
        </CustomSnackbarProvider>
    );
}

function App() {
    return (
        <AppErrorBoundary>
            <Suspense fallback={<Loading />}>
                <ThemeProvider theme={defaultTheme}>
                    <Provider store={rootStore}>
                        <PersistGate persistor={persistor} loading={<Loading />}>
                            <I18nProvider>
                                <AppRouter />
                            </I18nProvider>
                        </PersistGate>
                    </Provider>
                </ThemeProvider>
            </Suspense>
        </AppErrorBoundary>
    );
}

export default App;
