import {AppBarProps, IconButton, styled, Toolbar} from "@mui/material";
import Typography from "@mui/material/Typography";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../store/rootHook";
import Notification from "../component/Notification/Notification";
import SseClient from "../service/SseClient";
import {resetSseClient, setSseClient} from "../store/rootSlice";

interface MyAppBarProps extends AppBarProps {
    open?: boolean;
    menuWidth?: number;
}

interface TopBarProps {
    open: boolean;
    openMenu: () => void;
    width?: number;
    children?: React.ReactNode;
}

const TopBar = ({open, openMenu, width = 240, children}: TopBarProps) => {
    const user = useAppSelector(state => state.userInfo.user);
    const sseClient = useAppSelector(state => state.sse.sseClient);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // if (sseClient) {
        //     return;
        // }
        // const client = new SseClient();
        // dispatch(setSseClient(client));
        // return () => {
        //     sseClient?.disconnect();
        //     dispatch(resetSseClient());
        // }
    }, [sseClient]);

    useEffect(() => {
        const tokenCheck = sessionStorage.getItem('access_token');
        if (!tokenCheck || !user?.email) {
            window.location.href = '/sign-in';
        }
    }, [user]);

    return (
        <AppBar position={"absolute"} open={open} menuWidth={width}>
            <Toolbar sx={{pr: '20px'}}>
                <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={openMenu}
                            sx={{marginRight: '36px', ...(open && {display: 'none'})}}
                >
                    <MenuIcon/>
                </IconButton>
                <Typography component={"h1"} variant={"h6"} color={"inherit"} noWrap sx={{flexGrow: 1}}>
                    {user.name}
                </Typography>
                <Notification/>
            </Toolbar>
        </AppBar>
    )
}

const AppBar = styled(({...otherProps}) => (
    <MuiAppBar {...otherProps} />
))<MyAppBarProps>(({ theme, open, menuWidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: menuWidth,
        width: `calc(100% - ${menuWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export default TopBar;