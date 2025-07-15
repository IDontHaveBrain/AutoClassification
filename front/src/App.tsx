import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BackGround, { CustomSnackbarProvider } from 'layouts/BackGround';
import { Loading } from 'pages/default/Loading';
import { PersistGate } from 'redux-persist/integration/react';
import { baseRouter } from 'Routers';
import { persistor, rootStore } from 'stores/rootStore';

const defaultTheme = createTheme();

function App() {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Provider store={rootStore}>
                <PersistGate persistor={persistor} loading={<Loading />}>
                    <CustomSnackbarProvider maxSnack={3}>
                        <RouterProvider
                            router={baseRouter}
                            fallbackElement={<Loading />}
                        />
                        <BackGround />
                    </CustomSnackbarProvider>
                </PersistGate>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
