import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Divider, Tab, Tabs } from '@mui/material';
import {
  findMenuPath,
  type MenuInfo,
  useMenuItems,
} from 'hooks/useMenuItems';

interface SubTabBarProps {
  subTabMenu?: MenuInfo[];
}

const SubTabBar = ({ subTabMenu: _subTabMenu }: SubTabBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = useMenuItems();

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const breadcrumbs = findMenuPath(menuItems, location.pathname);
  const rootMenu = breadcrumbs[0];

  // Ensure we use the translated subTabMenu from the menuItems, not the original
  const translatedSubTabMenu = rootMenu?.subTabMenu || [];
  const fullSubTabMenu = [rootMenu].concat(translatedSubTabMenu);

  const filteredSubTabMenu = useMemo(() => {
      return fullSubTabMenu.filter(tab => tab?.element !== undefined);
  }, [fullSubTabMenu]);

  // Find the active tab value - use current path if it exists in tabs, otherwise use first tab
  const activeTabValue = useMemo(() => {
    const currentPathExists = filteredSubTabMenu.some(tab => tab.path === location.pathname);
    return currentPathExists ? location.pathname : filteredSubTabMenu[0]?.path || location.pathname;
  }, [filteredSubTabMenu, location.pathname]);

  return (
      <>
        <Tabs
            value={activeTabValue}
            onChange={handleChange}
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #e8e8e8',
              borderRight: '2px solid #e8e8e8',
            }}
        >
          {filteredSubTabMenu.map((tab) => (
              // tab.name is already translated by useMenuItems hook
              <Tab key={tab.path || tab.name} label={tab.name} value={tab.path} />
          ))}
        </Tabs>
        <Divider />
      </>
  );
};

export default SubTabBar;
