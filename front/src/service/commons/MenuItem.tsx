import { type Context, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TestClassfiy from 'pages/contents/freetest/TestClassfiy';
import TestResultList from 'pages/contents/freetest/TestResultList';
import NoticeEditor from 'pages/contents/notice/NoticeEditor';
import NoticeList from 'pages/contents/notice/NoticeList';
import AutoLabel from 'pages/contents/workspace/autolabel/AutoLabel';
import Train from 'pages/contents/workspace/training/Train';
import WorkspaceEditor from 'pages/contents/workspace/WorkspaceEditor';
import Home from 'pages/default/Home';
import SignIn from 'pages/default/SignIn';
import SignUp from 'pages/default/SignUp';

import { type ContextType,NoticeContext, WorkspaceContext } from 'utils/ContextManager';

import WorkspaceList from '../../pages/contents/workspace/WorkspaceList';

export interface MenuInfo {
    name: string;
    path?: string;
    invisible?: boolean;
    icon?: ReactNode;
    element?: ReactNode;
    context?: Context<ContextType<unknown> | null>;
    subMenu?: MenuInfo[];
    subTabMenu?: MenuInfo[];
}

export const useMenuItems = (): MenuInfo[] => {
    const { t: tNavigation } = useTranslation('navigation');
    const { t: tCommon } = useTranslation('common');

    return [
        {
            name: tNavigation('menu.home'),
            path: '/',
            icon: <AssignmentIcon/>,
            element: <Home/>,
            subTabMenu: [
                {
                    name: tCommon('signIn'),
                    path: '/sign-in',
                    element: <SignIn/>,
                },
                {
                    name: tCommon('signUp'),
                    path: '/sign-up',
                    element: <SignUp/>,
                },
            ],
        },
        {
            name: tNavigation('menu.notice'),
            path: '/notice',
            element: <NoticeList/>,
            context: NoticeContext,
            subMenu: [
                {
                    name: tNavigation('submenu.noticeWrite'),
                    path: '/notice/write',
                    element: <NoticeEditor/>,
                    context: NoticeContext,
                    invisible: true,
                },
            ],
        },
        {
            name: tNavigation('menu.workspace'),
            context: WorkspaceContext,
            subMenu: [
                {
                    name: tNavigation('submenu.workspaceList'),
                    path: '/workspace',
                    element: <WorkspaceList/>,
                    context: WorkspaceContext,
                },
                {
                    name: tNavigation('submenu.workspaceEditor'),
                    path: '/workspace/editor',
                    element: <WorkspaceEditor/>,
                    context: WorkspaceContext,
                    invisible: true,
                },
                {
                    name: tNavigation('submenu.autoLabel'),
                    path: '/workspace/auto-label',
                    element: <AutoLabel/>,
                },
                {
                    name: tNavigation('submenu.training'),
                    path: '/workspace/training',
                    element: <Train/>,
                },
            ],
            subTabMenu: [
                {
                    name: tNavigation('submenu.workspaceList'),
                    path: '/workspace',
                    element: <WorkspaceList/>,
                },
                {
                    name: tNavigation('submenu.autoLabel'),
                    path: '/workspace/auto-label',
                    element: <AutoLabel/>,
                },
                {
                    name: tNavigation('submenu.training'),
                    path: '/workspace/training',
                    element: <Train/>,
                },
            ],
        },
        {
            name: tNavigation('menu.service'),
            subMenu: [
                {
                    name: tNavigation('submenu.testClassify'),
                    path: '/test/classfiy',
                    element: <TestClassfiy/>,
                },
                {
                    name: tNavigation('submenu.testResult'),
                    path: '/test/result',
                    element: <TestResultList/>,
                },
            ],
            subTabMenu: [
                {
                    name: tNavigation('submenu.classify'),
                    path: '/test/classfiy',
                    element: <TestClassfiy/>,
                },
                {
                    name: tNavigation('submenu.result'),
                    path: '/test/result',
                    element: <TestResultList/>,
                },
            ],
        },
    ];
};

// 레거시 정적 MenuItems 배열 - 사용 중단됨, useMenuItems 훅 사용 권장
// @deprecated 다국어 지원을 위해 useMenuItems 훅을 사용하세요
export const MenuItems: MenuInfo[] = [];

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

        if (menu.subTabMenu) {
            const found = findMenuPath(menu.subTabMenu, path);
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

        if (menu.subMenu) {
            const found = getCurrentMenuInfo(menu.subMenu, path);
            if (found) {
                return found;
            }
        }

        if (menu.subTabMenu) {
            const found = getCurrentMenuInfo(menu.subTabMenu, path);
            if (found) {
                return found;
            }
        }
    }

    return undefined;
};

export const findSiblingTabs = (menus: MenuInfo[], path: string): MenuInfo[] => {
    for (const menu of menus) {
        if (menu.subMenu && menu.subMenu.find(subMenu => subMenu.path === path)) {
            return menu.subMenu;
        }

        if (menu.subMenu) {
            const found = findSiblingTabs(menu.subMenu, path);
            if (found.length > 0) {
                return found;
            }
        }
    }

    return [];
};
