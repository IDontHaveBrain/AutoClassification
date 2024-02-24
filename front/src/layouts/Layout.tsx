import { Outlet, useLocation, useNavigation } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import {
    Card,
    css,
    Divider,
    keyframes,
    makeStyles,
    styled,
    Toolbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import LeftBar from "./LeftBar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import BackGround from "./BackGround";
import { findMenuPath, MenuInfo, MenuItems } from "service/commons/MenuItem";
import ContentPath from "layouts/ContentPath";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export const Layout = () => {
    const navigation = useNavigation();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const [menu, setMenu] = useState<MenuInfo[]>(MenuItems);
    const [menuWidth, setMenuWidth] = useState(240);
    const [isEntering, setIsEntering] = useState(true);

    const openMenu = () => {
        setOpen(!open);
    };

    const currentMenuPath = findMenuPath(MenuItems, location.pathname);

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <TopBar open={open} openMenu={openMenu} width={menuWidth} />
            <LeftBar
                open={open}
                openMenu={openMenu}
                menu={menu}
                width={menuWidth}
            >
                Main
            </LeftBar>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === "light"
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: "100vh",
                    // width: "100vw",
                    overflow: "auto",
                }}
            >
                <Toolbar />
                <Card
                    sx={{ flex: 1, minHeight: "30vh", overflow: "auto", m: 1 }}
                >
                    <ContentPath sx={{ m: 1 }} path={currentMenuPath} />
                    <Divider />
                    <Grid sx={{ m: 1 }}>
                        <Outlet />
                    </Grid>
                </Card>
            </Box>
            <BackGround />
        </Box>
    );
};
