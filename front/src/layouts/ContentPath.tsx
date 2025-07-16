import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, type SxProps, Typography } from '@mui/material';
import { type MenuInfo } from 'service/commons/MenuItem';

type Props = {
  path: MenuInfo[];
  sx?: SxProps;
};

const ContentPath = ({ path, sx }: Props) => {
  const { t } = useTranslation('navigation');

  // Helper function to get translation key from menu name
  const getTranslationKey = (menuName: string): string => {
    const keyMap: Record<string, string> = {
      'Home': 'menu.home',
      'Notice': 'menu.notice',
      'Notice Write': 'submenu.noticeWrite',
      'Workspace': 'menu.workspace',
      'Workspace List': 'submenu.workspaceList',
      'Workspace Editor': 'submenu.workspaceEditor',
      'Auto Label': 'submenu.autoLabel',
      'Training': 'submenu.training',
      'Service': 'menu.service',
      'TestClassfiy': 'submenu.testClassify',
      'TestResult': 'submenu.testResult',
      'Classify': 'submenu.classify',
      'Result': 'submenu.result',
    };
    return keyMap[menuName] || menuName;
  };

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={sx}>
      {path.map((menu, _index) => {
        const textStyle = { fontSize: '0.875rem' };
        const translatedName = t(getTranslationKey(menu.name), menu.name);

        if (!menu.path) {
          return (
            <Typography color="textPrimary" sx={textStyle} key={menu.name}>
              {translatedName}
            </Typography>
          );
        } else {
          return (
            <Link
              color="inherit"
              component={RouterLink}
              to={menu.path || ''}
              key={menu.name}
              sx={textStyle}
            >
              {translatedName}
            </Link>
          );
        }
      })}
    </Breadcrumbs>
  );
};

export default ContentPath;
