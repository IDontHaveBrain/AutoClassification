import React from 'react';
import logo from './logo.svg';
import './App.css';
import SignIn from "./pages/SignIn";
import { RouterProvider } from 'react-router-dom';
import {baseRouters} from "./Routers";
import {Loading} from "./pages/Loading";
import {createTheme, ThemeProvider} from "@mui/material/styles";

const defaultTheme = createTheme();

function App() {

  return (
      <ThemeProvider theme={defaultTheme}>
        <RouterProvider router={baseRouters} fallbackElement={<Loading/>} />
      </ThemeProvider>
  );
}
//   return (
//     <div className="App">
//       <header className="App-header">
//         {/*<img src={logo} className="App-logo" alt="logo" />*/}
//         {/*<p>*/}
//         {/*  Edit <code>src/App.tsx</code> and save to reload.*/}
//         {/*</p>*/}
//         {/*<a*/}
//         {/*  className="App-link"*/}
//         {/*  href="https://reactjs.org"*/}
//         {/*  target="_blank"*/}
//         {/*  rel="noopener noreferrer"*/}
//         {/*>*/}
//         {/*  Learn React*/}
//         {/*</a>*/}
//       </header>
//     </div>
//   );
// }

export default App;
