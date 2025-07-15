import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Divider, Toolbar } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import ContentPath from 'layouts/ContentPath';
import SubTabBar from 'layouts/SubTabBar';
import { findMenuPath, type MenuInfo, useMenuItems } from 'service/commons/MenuItem';

import LeftBar from './LeftBar';
import TopBar from './TopBar';

export const Layout = () => {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const menu = useMenuItems();
  const [menuwidth] = useState(240);

  const openMenu = () => {
    setOpen(!open);
  };

  const currentMenuPath = findMenuPath(menu, location.pathname);
  const subTabMenu = currentMenuPath
    ?.filter((menu) => menu.path === location.pathname)
    ?.flatMap((menu) => menu.subTabMenu);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar open={open} openMenu={openMenu} width={menuwidth} />
      <LeftBar open={open} openMenu={openMenu} menu={menu} width={menuwidth}>
        Main
      </LeftBar>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.common.white
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
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
    </Box>
  );
};
