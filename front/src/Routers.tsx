import { useState } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Layout } from 'layouts/Layout';
import { NotFound } from 'pages/default/NotFound';
import SignIn from 'pages/default/SignIn';
import SignUp from 'pages/default/SignUp';
import { type MenuInfo, useMenuItems } from 'service/commons/MenuItem';

const MenuComponent = ({ menu }: {menu: MenuInfo}) => {
    let element = null;
    const [state, setState] = useState();

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

const createChildRoutes = (menuItems: MenuInfo[]): RouteObject[] => {
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

const createRoutes = (menuItems: MenuInfo[]): RouteObject[] => {
    const childRoutes = createChildRoutes(menuItems);
    
    return [
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
};

export const useRouter = () => {
    const menuItems = useMenuItems();
    const routes = createRoutes(menuItems);
    return createBrowserRouter(routes);
};
