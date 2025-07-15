import { type Context, type ReactNode } from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'hooks/useTranslation';
import TestClassfiy from 'pages/contents/freetest/TestClassfiy';
import TestResultList from 'pages/contents/freetest/TestResultList';
import NoticeEditor from 'pages/contents/notice/NoticeEditor';
import NoticeList from 'pages/contents/notice/NoticeList';
import AutoLabel from 'pages/contents/workspace/autolabel/AutoLabel';
import Train from 'pages/contents/workspace/training/Train';
import WorkspaceEditor from 'pages/contents/workspace/WorkspaceEditor';
import { Home } from 'pages/default/Home';
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

/**
 * Hook to get translated menu items
 */
export const useMenuItems = (): MenuInfo[] => {
    const { t } = useTranslation('navigation');

    return [
        {
            name: t('menu.home'),
            path: '/',
            icon: <AssignmentIcon/>,
            element: <Home/>,
            subTabMenu: [
                {
                    name: t('menu.login'),
                    path: '/sign-in',
                    element: <SignIn/>,
                },
                {
                    name: t('menu.register'),
                    path: '/sign-up',
                    element: <SignUp/>,
                },
            ],
        },
        {
            name: t('menu.notice'),
            path: '/notice',
            element: <NoticeList/>,
            context: NoticeContext,
            subMenu: [
                {
                    name: t('submenu.noticeWrite'),
                    path: '/notice/write',
                    element: <NoticeEditor/>,
                    context: NoticeContext,
                    invisible: true,
                },
            ],
        },
        {
            name: t('menu.workspace'),
            context: WorkspaceContext,
            subMenu: [
                {
                    name: t('submenu.workspaceList'),
                    path: '/workspace',
                    element: <WorkspaceList/>,
                    context: WorkspaceContext,
                },
                {
                    name: t('submenu.workspaceEditor'),
                    path: '/workspace/editor',
                    element: <WorkspaceEditor/>,
                    context: WorkspaceContext,
                    invisible: true,
                },
                {
                    name: t('submenu.autoLabel'),
                    path: '/workspace/auto-label',
                    element: <AutoLabel/>,
                },
                {
                    name: t('submenu.training'),
                    path: '/workspace/training',
                    element: <Train/>,
                },
            ],
            subTabMenu: [
                {
                    name: t('submenu.workspaceList'),
                    path: '/workspace',
                    element: <WorkspaceList/>,
                },
                {
                    name: t('submenu.autoLabel'),
                    path: '/workspace/auto-label',
                    element: <AutoLabel/>,
                },
                {
                    name: t('submenu.training'),
                    path: '/workspace/training',
                    element: <Train/>,
                },
            ],
        },
        {
            name: t('menu.service'),
            subMenu: [
                {
                    name: t('submenu.testClassify'),
                    path: '/test/classfiy',
                    element: <TestClassfiy/>,
                },
                {
                    name: t('submenu.testResult'),
                    path: '/test/result',
                    element: <TestResultList/>,
                },
            ],
            subTabMenu: [
                {
                    name: t('submenu.classify'),
                    path: '/test/classfiy',
                    element: <TestClassfiy/>,
                },
                {
                    name: t('submenu.result'),
                    path: '/test/result',
                    element: <TestResultList/>,
                },
            ],
        },
    ];
};


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
