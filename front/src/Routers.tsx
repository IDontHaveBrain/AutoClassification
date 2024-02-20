import {createBrowserRouter, RouteObject} from "react-router-dom";
import SignIn from "./pages/default/SignIn";
import SignUp from "./pages/default/SignUp";
import {Layout} from "./layouts/Layout";
import {NotFound} from "./pages/default/NotFound";
import {MenuInfo, MenuItems} from "./service/commons/MenuItem";

const createRouteFromMenu = (menu: MenuInfo): RouteObject => {
    return {
        path: menu.path || '/',
        element: menu.element
    };
};

const childRoutes: RouteObject[] = MenuItems.map(menu => createRouteFromMenu(menu));

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
        children: [
            ...childRoutes
        ]
    },
    {
        path: "*",
        element: <NotFound/>,
    }
];

export const baseRouter = createBrowserRouter(routes);