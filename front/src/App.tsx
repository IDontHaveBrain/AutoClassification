import { RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, rootStore } from "stores/rootStore";
import { Loading } from "pages/default/Loading";
import { baseRouter } from "Routers";
import BackGround from "layouts/BackGround";
import React from "react";
import { SnackbarProvider } from "notistack";

const defaultTheme = createTheme();

function App() {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Provider store={rootStore}>
                <PersistGate persistor={persistor} loading={<Loading />}>
                    <SnackbarProvider maxSnack={3}>
                        <RouterProvider
                            router={baseRouter}
                            fallbackElement={<Loading />}
                        />
                        <BackGround />
                    </SnackbarProvider>
                </PersistGate>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
