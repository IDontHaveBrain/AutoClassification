import {Outlet, useNavigation} from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import {Toolbar} from "@mui/material";
import React, {useState} from "react";
import TopBar from "./TopBar";
import LeftBar from "./LeftBar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import BackGround from "./BackGround";
import {MenuInfo, MenuItems} from "../service/commons/MenuItem";

export const Layout = () => {
    const navigation = useNavigation();
    const [open, setOpen] = useState(true);
    const [menu, setMenu] = useState<MenuInfo[]>(MenuItems);
    const [menuWidth, setMenuWidth] = useState(240);

    const openMenu = () => {
        setOpen(!open);
    }

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <TopBar open={open} openMenu={openMenu} width={menuWidth}/>
            <LeftBar open={open} openMenu={openMenu} menu={menu} width={menuWidth}>
                Main
            </LeftBar>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar/>
                <Container maxWidth="lg" sx={{mt: 3, mb: 3, ml: 3, mr: 3}}>
                    <Grid container spacing={3}>
                        <Outlet/>
                    </Grid>
                </Container>
            </Box>
            <BackGround/>
        </Box>
    );
}