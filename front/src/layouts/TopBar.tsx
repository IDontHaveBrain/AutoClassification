import {AppBarProps, Badge, IconButton, styled, Toolbar} from "@mui/material";
import Typography from "@mui/material/Typography";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {useEffect} from "react";
import {useAppSelector} from "../store/rootHook";

interface MyAppBarProps extends AppBarProps {
    open?: boolean;
    drawerWidth?: number;
}

interface TopBarProps {
    open: boolean;
    openMenu: () => void;
    width?: number;
    children?: React.ReactNode;
}

const TopBar = ({open, openMenu, width = 240, children}: TopBarProps) => {
    const user = useAppSelector(state => state.userInfo.user);

    useEffect(() => {
        const tokenCheck = sessionStorage.getItem('access_token');
        if (!tokenCheck || !user?.email) {
            window.location.href = '/sign-in';
        }
    }, [user]);

    return (
        <AppBar position={"absolute"} open={open} drawerWidth={width}>
            <Toolbar sx={{pr: '20px'}}>
                <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={openMenu}
                            sx={{marginRight: '36px', ...(open && {display: 'none'})}}
                >
                    <MenuIcon/>
                </IconButton>
                <Typography component={"h1"} variant={"h6"} color={"inherit"} noWrap sx={{flexGrow: 1}}>
                    {user.name}
                </Typography>
                <IconButton color="inherit">
                    <Badge badgeContent={4} color="secondary">
                        <NotificationsIcon/>
                    </Badge>
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<MyAppBarProps>(({theme, open, drawerWidth}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export default TopBar;