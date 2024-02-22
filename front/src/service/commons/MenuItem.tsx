import AssignmentIcon from "@mui/icons-material/Assignment";
import { ReactNode } from "react";
import { Home } from "../../pages/default/Home";
import SignIn from "../../pages/default/SignIn";
import SignUp from "../../pages/default/SignUp";
import NoticeEditor from "../../pages/contents/notice/NoticeEditor";
import { NotFound } from "../../pages/default/NotFound";

export interface MenuInfo {
    name: string;
    path?: string;
    icon?: ReactNode;
    element?: ReactNode;
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
        name: "공지사항",
        path: "/notice",
        element: <NoticeEditor/>
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
