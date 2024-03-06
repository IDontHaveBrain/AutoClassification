import { Divider, Tab, Tabs } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  findMenuPath,
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

  const currentMenuPath = getCurrentMenuInfo(MenuItems, location.pathname);

  return (
    <Tabs
      value={location.pathname}
      onChange={handleChange}
      indicatorColor="primary"
      // textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: "1px solid #e8e8e8",
        borderRight: "2px solid #e8e8e8",
      }}
    >
      {currentMenuPath && (
        <Tab
          label={currentMenuPath?.name}
          value={currentMenuPath?.path ?? ""}
        />
      )}
      {subTabMenu?.map((tab, index) => {
        return <Tab key={index} label={tab?.name} value={tab?.path} />;
      })}
      <Divider />
    </Tabs>
  );
};

export default SubTabBar;
