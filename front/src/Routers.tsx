import {createBrowserRouter, RouteObject} from "react-router-dom";
import SignIn from "./pages/default/SignIn";
import SignUp from "./pages/default/SignUp";
import {Layout} from "./layouts/Layout";
import {NotFound} from "./pages/default/NotFound";
import {MenuInfo, MenuItems} from "./service/commons/MenuItem";
import {useState} from "react";

const MenuComponent = ({menu}: {menu: MenuInfo}) => {
    let element = null;
    const [state, setState] = useState();

    if (menu.context) {
        element = (
            <menu.context.Provider value={{state, setState}}>
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

const childRoutes: RouteObject[] = [];
MenuItems.forEach((menu) => {
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
});

const routes: RouteObject[] = [
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
        children: [...childRoutes],
    },
    {
        path: "*",
        element: <NotFound/>,
    },
];

export const baseRouter = createBrowserRouter(routes);
