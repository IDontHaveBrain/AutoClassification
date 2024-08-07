import {Outlet, useLocation, useNavigation} from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import {Divider, Toolbar,} from "@mui/material";
import React, {useState} from "react";
import TopBar from "./TopBar";
import LeftBar from "./LeftBar";
import {findMenuPath, MenuInfo, MenuItems} from "service/commons/MenuItem";
import ContentPath from "layouts/ContentPath";
import SubTabBar from "layouts/SubTabBar";

export const Layout = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState<MenuInfo[]>(MenuItems);
  const [menuwidth, setMenuwidth] = useState(240);
  const [isEntering, setIsEntering] = useState(true);

  const openMenu = () => {
    setOpen(!open);
  };

  const currentMenuPath = findMenuPath(MenuItems, location.pathname);
  const subTabMenu = currentMenuPath
    ?.filter((menu) => menu.path === location.pathname)
    ?.flatMap((menu) => menu.subTabMenu);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <TopBar open={open} openMenu={openMenu} width={menuwidth} />
      <LeftBar open={open} openMenu={openMenu} menu={menu} width={menuwidth}>
        Main
      </LeftBar>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.common.white
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          // width: "100vw",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <SubTabBar subTabMenu={subTabMenu} />
        <ContentPath sx={{ m: 1 }} path={currentMenuPath} />
        <Divider />
        <Box sx={{ m: 1 }}>
          <Outlet />
        </Box>
      </Box>
      {/*<BackGround />*/}
    </Box>
  );
};
