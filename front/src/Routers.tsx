import { useState } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { type MenuInfo } from 'hooks/useMenuItems';
import { Layout } from 'layouts/Layout';
import TestClassfiy from 'pages/contents/freetest/TestClassfiy';
import TestResultList from 'pages/contents/freetest/TestResultList';
import NoticeEditor from 'pages/contents/notice/NoticeEditor';
import NoticeList from 'pages/contents/notice/NoticeList';
import AutoLabel from 'pages/contents/workspace/autolabel/AutoLabel';
import Train from 'pages/contents/workspace/training/Train';
import WorkspaceEditor from 'pages/contents/workspace/WorkspaceEditor';
import WorkspaceList from 'pages/contents/workspace/WorkspaceList';
// Import the component elements directly for static route generation
import Home from 'pages/default/Home';
import { NotFound } from 'pages/default/NotFound';
import SignIn from 'pages/default/SignIn';
import SignUp from 'pages/default/SignUp';

import { NoticeContext, WorkspaceContext } from 'utils/ContextManager';

const MenuComponent = ({ menu }: {menu: MenuInfo}) => {
    let element = null;
    const [state, setState] = useState<unknown>();

    const resetState = () => {
        setState(undefined);
    };

    if (menu.context) {
        element = (
            <menu.context.Provider value={{ state, setState, resetState }}>
                {menu.element}
            </menu.context.Provider>
        );
    } else {
        element = <>{menu.element}</>;
    }

    return element;
};

const createRouteFromMenu = (menu: MenuInfo): RouteObject => {
    return {
        path: menu.path,
        element: <MenuComponent menu={menu} />,
    };
};

// Static route generation for compatibility with React Router
// Menu items now use internationalization through the useMenuItems hook in Layout and SubTabBar
const staticMenuItems: MenuInfo[] = [
    {
        name: 'Home', // This will be translated in components that use useMenuItems
        path: '/',
        element: <Home/>,
        subTabMenu: [
            {
                name: 'Sign In',
                path: '/sign-in',
                element: <SignIn/>,
            },
            {
                name: 'Sign Up',
                path: '/sign-up',
                element: <SignUp/>,
            },
        ],
    },
    {
        name: 'Notice',
        path: '/notice',
        element: <NoticeList/>,
        context: NoticeContext,
        subMenu: [
            {
                name: 'Notice Write',
                path: '/notice/write',
                element: <NoticeEditor/>,
                context: NoticeContext,
                invisible: true,
            },
        ],
    },
    {
        name: 'Workspace',
        context: WorkspaceContext,
        subMenu: [
            {
                name: 'Workspace List',
                path: '/workspace',
                element: <WorkspaceList/>,
                context: WorkspaceContext,
            },
            {
                name: 'Workspace Editor',
                path: '/workspace/editor',
                element: <WorkspaceEditor/>,
                context: WorkspaceContext,
                invisible: true,
            },
            {
                name: 'Auto Label',
                path: '/workspace/auto-label',
                element: <AutoLabel/>,
            },
            {
                name: 'Training',
                path: '/workspace/training',
                element: <Train/>,
            },
        ],
        subTabMenu: [
            {
                name: 'Workspace List',
                path: '/workspace',
                element: <WorkspaceList/>,
            },
            {
                name: 'Auto Label',
                path: '/workspace/auto-label',
                element: <AutoLabel/>,
            },
            {
                name: 'Training',
                path: '/workspace/training',
                element: <Train/>,
            },
        ],
    },
    {
        name: 'Service',
        subMenu: [
            {
                name: 'TestClassfiy',
                path: '/test/classfiy',
                element: <TestClassfiy/>,
            },
            {
                name: 'TestResult',
                path: '/test/result',
                element: <TestResultList/>,
            },
        ],
        subTabMenu: [
            {
                name: 'Classify',
                path: '/test/classfiy',
                element: <TestClassfiy/>,
            },
            {
                name: 'Result',
                path: '/test/result',
                element: <TestResultList/>,
            },
        ],
    },
];

const generateChildRoutes = (menuItems: MenuInfo[]): RouteObject[] => {
    const childRoutes: RouteObject[] = [];

    menuItems.forEach((menu) => {
        if (menu.path && menu.element) {
            childRoutes.push(createRouteFromMenu(menu));
        }
        if (menu.subMenu) {
            menu.subMenu.forEach((subMenu) => {
                if (subMenu.path && subMenu.element) {
                    childRoutes.push(createRouteFromMenu(subMenu));
                }
            });
        }
        if (menu.subTabMenu) {
            menu.subTabMenu.forEach((subMenu) => {
                if (subMenu.path && subMenu.element) {
                    childRoutes.push(createRouteFromMenu(subMenu));
                }
            });
        }
    });

    return childRoutes;
};

const childRoutes = generateChildRoutes(staticMenuItems);

const routes: RouteObject[] = [
    {
        path: '/sign-in',
        element: <SignIn/>,
    },
    {
        path: '/sign-up',
        element: <SignUp/>,
    },
    {
        path: '/',
        element: <Layout/>,
        children: [...childRoutes],
    },
    {
        path: '*',
        element: <NotFound/>,
    },
];

export const baseRouter = createBrowserRouter(routes);
