import AssignmentIcon from "@mui/icons-material/Assignment";
import {Context, createContext, ReactNode} from "react";
import {Home} from "pages/default/Home";
import SignIn from "pages/default/SignIn";
import SignUp from "pages/default/SignUp";
import NoticeEditor from "pages/contents/notice/NoticeEditor";
import {NotFound} from "pages/default/NotFound";
import NoticeList from "pages/contents/notice/NoticeList";
import FileDropzone from "component/FileDropzone";
import Classfiy from "../../pages/contents/classfiy/Classfiy";
import WorkspaceList from "../../pages/contents/workspace/WorkspaceList";
import WorkspaceEditor from "pages/contents/workspace/WorkspaceEditor";
import {WorkspaceContext} from "utils/ContextManager";

export interface MenuInfo {
    name: string;
    path?: string;
    invisible?: boolean;
    icon?: ReactNode;
    element?: ReactNode;
    context?: Context<any>;
    subMenu?: MenuInfo[];
    subTabMenu?: MenuInfo[];
}

export const MenuItems: MenuInfo[] = [
    {
        name: "Home",
        path: "/",
        icon: <AssignmentIcon/>,
        element: <Home/>,
        subTabMenu: [
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
        ],
    },
    {
        name: "공지사항",
        path: "/notice",
        element: <NoticeList/>,
        context: createContext({}),
        subMenu: [
            {
                name: "공지사항 작성",
                path: "/notice/write",
                element: <NoticeEditor/>,
                invisible: true,
            },
        ],
    },
    {
        name: "Workspace",
        path: "/workspace",
        element: <WorkspaceList/>,
        context: WorkspaceContext,
        subMenu: [
            {
                name: "Workspace Editor",
                path: "/workspace/editor",
                element: <WorkspaceEditor/>,
                context: WorkspaceContext,
                invisible: true,
            },
        ],
    },
    {
        name: "Service",
        subMenu: [
            {
                name: "Classfiy",
                path: "/classfiy",
                element: <Classfiy/>,
            },
        ],
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
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const findMenuPath = (menus: MenuInfo[], path: string): MenuInfo[] => {
    for (const menu of menus) {
        if (menu.path === path) {
            return [menu];
        }

        if (menu.subMenu) {
            const found = findMenuPath(menu.subMenu, path);
            if (found.length > 0) {
                return [menu, ...found];
            }
        }
    }

    return [];
};

export const findSubTabs = (menus: MenuInfo[], path: string): MenuInfo[] => {
    for (const menu of menus) {
        if (menu.path === path) {
            return menu.subTabMenu ?? [];
        }

        if (menu.subMenu) {
            const found = findSubTabs(menu.subMenu, path);
            if (found.length > 0) {
                return found;
            }
        }
    }

    return [];
};

export const getCurrentMenuInfo = (
    menus: MenuInfo[],
    path: string,
): MenuInfo | undefined => {
    for (const menu of menus) {
        if (menu.path === path) {
            return menu;
        }

        if (menu.subMenu || menu.subTabMenu) {
            const found = getCurrentMenuInfo(menu.subMenu ?? menu.subTabMenu, path);
            if (found) {
                return found;
            }
        }
    }

    return undefined;
};
