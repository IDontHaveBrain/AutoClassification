import { Divider, Tab, Tabs } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  findMenuPath, findSiblingTabs,
  findSubTabs,
  getCurrentMenuInfo,
  MenuInfo,
  MenuItems,
} from "service/commons/MenuItem";

interface SubTabBarProps {
  subTabMenu?: MenuInfo[];
}

const SubTabBar = ({ subTabMenu }: SubTabBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event, newValue: string) => {
    navigate(newValue);
  };

  // Get the current menu and its parent
  const breadcrumbs = findMenuPath(MenuItems, location.pathname);

  // Add root item to subTabMenu
  const rootMenu = breadcrumbs[0];
  const fullSubTabMenu = [rootMenu].concat(rootMenu.subTabMenu || []);

  return (
      <Tabs
          value={location.pathname}
          onChange={handleChange}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: "1px solid #e8e8e8",
            borderRight: "2px solid #e8e8e8",
          }}
      >
        {fullSubTabMenu.map((tab, index) => (
            <Tab key={index} label={tab.name} value={tab.path} />
        ))}
        <Divider />
      </Tabs>
  );
};

export default SubTabBar;
