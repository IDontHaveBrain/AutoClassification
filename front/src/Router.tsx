import { createBrowserRouter } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import {Layout} from "./pages/Layout";
import {NotFound} from "./pages/NotFound";
import {Home} from "./pages/Home";

export const baseRouters = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ]
  },
  {
    path: "*",
    element: <NotFound />,
  }
])