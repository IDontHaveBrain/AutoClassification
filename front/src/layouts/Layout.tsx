import {Outlet, Link, useNavigation} from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import {AppBarProps, IconButton, MenuItem, styled, Toolbar} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import {useState} from "react";
import Typography from "@mui/material/Typography";
import TopBar from "./TopBar";
import LeftBar from "./LeftBar";
import {MenuItems, MenuInfo} from "../Routers";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

export const Layout = () => {
  const navigation = useNavigation();
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState<MenuInfo[]>(MenuItems);
  // const width = 240;

  const openMenu = () => {
    setOpen(!open);
  }

  return (
      <Box sx={{display: 'flex'}}>
        <CssBaseline/>
        <TopBar open={open} openMenu={openMenu}/>
        <LeftBar open={open} openMenu={openMenu} menu={menu}>
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
          <Container maxWidth="lg" sx={{mt: 3, mb: 3, ml: 3, mr: 3 }}>
            <Grid container spacing={3}>
              <Outlet/>
            </Grid>
          </Container>
        </Box>

        {/*<div style={{ position: "fixed", top: 0, right: 0 }}>*/}
        {/*  {navigation.state !== "idle" && <p>Navigation in progress...</p>}*/}
        {/*</div>*/}

        {/*<nav>*/}
        {/*  <ul>*/}
        {/*    <li>*/}
        {/*      <Link to="/">Home</Link>*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <Link to="/sign-in">SignIn</Link>*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <Link to="/sign-up">SignUp</Link>*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <Link to="/404">404</Link>*/}
        {/*    </li>*/}
        {/*  </ul>*/}
        {/*</nav>*/}
      </Box>
  );
}