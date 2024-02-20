import React from 'react';
import './App.css';
import {RouterProvider} from 'react-router-dom';
import {Loading} from "./pages/default/Loading";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, rootStore} from "./store/rootStore";
import {baseRouter} from "./Routers";

const defaultTheme = createTheme();

function App() {

    return (
        <ThemeProvider theme={defaultTheme}>
            <Provider store={rootStore}>
                <PersistGate persistor={persistor} loading={<Loading/>}>
                    <RouterProvider router={baseRouter} fallbackElement={<Loading/>}/>
                </PersistGate>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
