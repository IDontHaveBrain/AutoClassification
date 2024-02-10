import React from 'react';
import logo from './logo.svg';
import './App.css';
import SignIn from "./pages/SignIn";
import { RouterProvider } from 'react-router-dom';
import {baseRouters} from "./Routers";
import {Loading} from "./pages/Loading";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Provider} from "react-redux";
import rootStore from "./store/rootStore";

const defaultTheme = createTheme();

function App() {

  return (
      <Provider store={rootStore}>
          <ThemeProvider theme={defaultTheme}>
              <RouterProvider router={baseRouters} fallbackElement={<Loading/>}/>
          </ThemeProvider>
      </Provider>
  );
}

export default App;
