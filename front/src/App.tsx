import React from 'react';
import logo from './logo.svg';
import './App.css';
import SignIn from "./pages/default/SignIn";
import {RouterProvider} from 'react-router-dom';
import {baseRouters} from "./Routers";
import {Loading} from "./pages/default/Loading";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Provider} from "react-redux";
import rootStore from "./store/rootStore";
import BackGround from "./layouts/BackGround";

const defaultTheme = createTheme();

function App() {

    return (
        <ThemeProvider theme={defaultTheme}>
            <Provider store={rootStore}>
                <RouterProvider router={baseRouters} fallbackElement={<Loading/>}/>
                <BackGround/>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
