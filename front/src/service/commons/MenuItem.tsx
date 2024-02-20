import AssignmentIcon from "@mui/icons-material/Assignment";
import {Home} from "../../pages/default/Home";
import SignIn from "../../pages/default/SignIn";
import SignUp from "../../pages/default/SignUp";
import TextEditor from "../../component/TextEditor/TextEditor";
import {NotFound} from "../../pages/default/NotFound";

export interface MenuInfo {
    name: string;
    path?: string;
    icon?: React.ReactNode;
    element?: React.ReactNode;
    subMenu?: MenuInfo[];
}

export const MenuItems: MenuInfo[] = [
    {
        name: "Home",
        path: "/",
        icon: <AssignmentIcon/>,
        element: <Home/>,
    },
    {
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn/>,
    },
    {
        name: "Sign Up",
        path: "/sign-up",
        element: <SignUp/>,
    },
    {
        name: "My Page",
        subMenu: [
            {
                name: "Not Found",
                path: "/not-found",
                element: <NotFound/>,
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
