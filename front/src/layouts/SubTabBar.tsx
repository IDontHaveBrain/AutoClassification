import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Divider, Tab, Tabs } from '@mui/material';
import {
  findMenuPath,
  type MenuInfo,
  MenuItems,
} from 'service/commons/MenuItem';

interface SubTabBarProps {
  subTabMenu?: MenuInfo[];
}

const SubTabBar = ({ subTabMenu: _subTabMenu }: SubTabBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event, newValue: string) => {
    navigate(newValue);
  };

  const breadcrumbs = findMenuPath(MenuItems, location.pathname);
  const rootMenu = breadcrumbs[0];
  const fullSubTabMenu = [rootMenu].concat(rootMenu.subTabMenu || []);

  const filteredSubTabMenu = useMemo(() => {
      return fullSubTabMenu.filter(tab => tab.element !== undefined);
  }, [fullSubTabMenu]);

  return (
      <Tabs
          value={location.pathname}
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
            <Tab key={tab.path || tab.name} label={tab.name} value={tab.path} />
        ))}
        <Divider />
      </Tabs>
  );
};

export default SubTabBar;
