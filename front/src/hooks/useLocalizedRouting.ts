import { useCallback, useMemo } from 'react';
import { type NavigateOptions,useLocation, useNavigate } from 'react-router-dom';

import { type LocalizedRoute } from '../types/i18n';

import { useLanguage } from './useLanguage';

/**
 * Custom hook for localized routing functionality
 * Provides navigation helpers that work with localized routes
 */
export const useLocalizedRouting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();

  // Predefined localized routes
  const localizedRoutes: LocalizedRoute[] = useMemo(() => [
    {
      path: '/',
      localizedPaths: {
        ko: '/',
        en: '/',
      },
      component: () => null, // Placeholder
    },
    {
      path: '/workspaces',
      localizedPaths: {
        ko: '/작업공간',
        en: '/workspaces',
      },
      component: () => null,
    },
    {
      path: '/classification',
      localizedPaths: {
        ko: '/분류',
        en: '/classification',
      },
      component: () => null,
    },
    {
      path: '/training',
      localizedPaths: {
        ko: '/학습',
        en: '/training',
      },
      component: () => null,
    },
    {
      path: '/datasets',
      localizedPaths: {
        ko: '/데이터셋',
        en: '/datasets',
      },
      component: () => null,
    },
    {
      path: '/models',
      localizedPaths: {
        ko: '/모델',
        en: '/models',
      },
      component: () => null,
    },
    {
      path: '/notices',
      localizedPaths: {
        ko: '/공지사항',
        en: '/notices',
      },
      component: () => null,
    },
    {
      path: '/settings',
      localizedPaths: {
        ko: '/설정',
        en: '/settings',
      },
      component: () => null,
    },
  ], []);

  // Get localized path for a route
  const getLocalizedPath = useCallback((routePath: string, language?: string): string => {
    const lang = language || currentLanguage;
    const route = localizedRoutes.find(r => r.path === routePath);

    if (!route) {
      return routePath; // Return original path if not found
    }

    return route.localizedPaths[lang] || route.localizedPaths['ko'] || routePath;
  }, [currentLanguage, localizedRoutes]);

  // Navigate to localized route
  const navigateToLocalized = useCallback((routePath: string, options?: NavigateOptions) => {
    const localizedPath = getLocalizedPath(routePath);
    navigate(localizedPath, options);
  }, [navigate, getLocalizedPath]);

  // Get current route info
  const getCurrentRouteInfo = useCallback(() => {
    const currentPath = location.pathname;

    // Find the route that matches the current path
    const matchedRoute = localizedRoutes.find(route => {
      return Object.values(route.localizedPaths).some(path => path === currentPath);
    });

    return {
      originalPath: matchedRoute?.path || currentPath,
      localizedPath: currentPath,
      route: matchedRoute,
    };
  }, [location.pathname, localizedRoutes]);

  // Generate breadcrumb navigation
  const generateBreadcrumbs = useCallback(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string; isActive: boolean }> = [];

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Find the corresponding route
      const route = localizedRoutes.find(r =>
        Object.values(r.localizedPaths).some(path => path === currentPath),
      );

      breadcrumbs.push({
        label: route ? getRouteLabel(route.path) : segment,
        path: currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  }, [location.pathname, localizedRoutes]);

  // Switch language while preserving route
  const switchLanguagePreserveRoute = useCallback((newLanguage: string) => {
    const { originalPath } = getCurrentRouteInfo();
    const newLocalizedPath = getLocalizedPath(originalPath, newLanguage);

    // Don't navigate if the path is the same
    if (newLocalizedPath !== location.pathname) {
      navigate(newLocalizedPath, { replace: true });
    }
  }, [getCurrentRouteInfo, getLocalizedPath, location.pathname, navigate]);

  // Get all available language versions of current route
  const getLanguageVersions = useCallback(() => {
    const { originalPath } = getCurrentRouteInfo();
    const route = localizedRoutes.find(r => r.path === originalPath);

    if (!route) {
      return {};
    }

    return route.localizedPaths;
  }, [getCurrentRouteInfo, localizedRoutes]);

  return {
    getLocalizedPath,
    navigateToLocalized,
    getCurrentRouteInfo,
    generateBreadcrumbs,
    switchLanguagePreserveRoute,
    getLanguageVersions,
    localizedRoutes,
  };
};

// Helper function to get route label for breadcrumbs
function getRouteLabel(routePath: string): string {
  const routeLabels: Record<string, string> = {
    '/': 'Home',
    '/workspaces': 'Workspaces',
    '/classification': 'Classification',
    '/training': 'Training',
    '/datasets': 'Datasets',
    '/models': 'Models',
    '/notices': 'Notices',
    '/settings': 'Settings',
  };

  return routeLabels[routePath] || routePath;
}

/**
 * Hook for getting localized route parameters
 */
export const useLocalizedParams = () => {
  const { currentLanguage } = useLanguage();

  const getLocalizedParam = useCallback((key: string, value: string): string => {
    // This can be extended to handle parameter localization
    // For now, just return the value as is
    return value;
  }, []);

  return {
    currentLanguage,
    getLocalizedParam,
  };
};