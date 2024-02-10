import {createBrowserRouter} from "react-router-dom";
import SignIn from "./pages/default/SignIn";
import SignUp from "./pages/default/SignUp";
import {Layout} from "./layouts/Layout";
import {NotFound} from "./pages/default/NotFound";
import {Home} from "./pages/default/Home";
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
            },
            {
                name: "Test Submenu2",
                subMenu: [
                    {
                        name: "Test Submenu3",
                        subMenu: [
                            {
                                name: "Test Submenu4",
                                path: "/test-submenu4",
                            }
                        ]
                    }
                ]
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