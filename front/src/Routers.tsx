import {createBrowserRouter} from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import {Layout} from "./layouts/Layout";
import {NotFound} from "./pages/NotFound";
import {Home} from "./pages/Home";
import AssignmentIcon from "@mui/icons-material/Assignment";

export interface MenuInfo {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  subMenu?: MenuInfo[];
}

export const MenuItems: MenuInfo[] = [
  {
    name: "Home", path: "/", icon: <AssignmentIcon/>
  },
  {
    name: "Sign In",
    path: "/sign-in",
  },
  {
    name: "Sign Up",
    path: "/sign-up",
  },
  {
    name: "My Page",
    subMenu: [
      {
        name: "Not Found",
        path: "/not-found",
      }
    ]
  }
];

export const baseRouters = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn/>,
  },
  {
    path: "/sign-up",
    element: <SignUp/>,
  },
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        index: true,
        element: <Home/>,
      },
    ]
  },
  {
    path: "*",
    element: <NotFound/>,
  }
])