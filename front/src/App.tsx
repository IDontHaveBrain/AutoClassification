import React from 'react';
import './App.css';
import {RouterProvider} from 'react-router-dom';
import {baseRouters} from "./Routers";
import {Loading} from "./pages/default/Loading";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Provider} from "react-redux";
import BackGround from "./layouts/BackGround";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, rootStore} from "./store/rootStore";

const defaultTheme = createTheme();

function App() {

    return (
        <ThemeProvider theme={defaultTheme}>
            <Provider store={rootStore}>
                <PersistGate persistor={persistor}>
                    <RouterProvider router={baseRouters} fallbackElement={<Loading/>}/>
                    <BackGround/>
                </PersistGate>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
