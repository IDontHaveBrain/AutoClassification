import { AppBarProps, IconButton, styled, Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
import MuiAppBar from "@mui/material/AppBar";
import { useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAppDispatch, useAppSelector } from "stores/rootHook";
import Notification from "component/notification/Notification";

interface MyAppBarProps extends AppBarProps {
    open: boolean;
    menuwidth: number;
}

interface TopBarProps {
    open: boolean;
    openMenu: () => void;
    width: number;
    children?: React.ReactNode;
}

const TopBar = ({ open, openMenu, width, children }: TopBarProps) => {
    const user = useAppSelector((state) => state.userInfo.user);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const tokenCheck = sessionStorage.getItem("access_token");
        if (!tokenCheck || !user?.email) {
            window.location.href = "/sign-in";
        }
    }, [user]);

    return (
        <AppBar position={"absolute"} open={open} menuwidth={width}>
            <Toolbar sx={{ pr: "20px" }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={openMenu}
                    sx={{
                        marginRight: "36px",
                        ...(open && { display: "none" }),
                    }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography
                    component={"h1"}
                    variant={"h6"}
                    color={"inherit"}
                    noWrap
                    sx={{ flexGrow: 1 }}
                >
                    {user.name}
                </Typography>
                <Notification />
            </Toolbar>
        </AppBar>
    );
};

const AppBar = styled(({ ...otherProps }) => (
    <MuiAppBar {...otherProps} />
))<MyAppBarProps>(({ theme, open, menuwidth: menuwidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: menuwidth,
        width: `calc(100% - ${menuwidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export default TopBar;
