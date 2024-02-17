import {Divider, DrawerProps, IconButton, List, styled, Toolbar} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {MenuInfo} from "../../Routers";
import RenderMenu from "./renderMenu";

interface MenuBarProps extends DrawerProps {
    drawerWidth?: number;
}

interface LeftBarProps {
    open: boolean;
    openMenu: () => void;
    width?: number;
    menu?: MenuInfo[];
    children?: React.ReactNode;
}

const LeftBar = ({open, openMenu, width = 240, menu, children}: LeftBarProps) => {
    const [openSubMenu, setOpenSubMenu] = useState({});

    const navigate = useNavigate();

    const onClickMenu = (menu: MenuInfo) => {
        if (!(menu?.subMenu?.length) && menu?.path) {
            if (openSubMenu === menu.name) {
                setOpenSubMenu(null);
            } else {
                setOpenSubMenu(menu.name);
            }
        } else if (menu?.path) {
            navigate(menu.path);
        }
    }

    return (
        <MenuBar variant={"permanent"} open={open} drawerWidth={width}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                {children}
                <IconButton onClick={openMenu}>
                    <ChevronLeftIcon/>
                </IconButton>
            </Toolbar>
            <Divider/>
            <List>
                {menu?.map((menu, index) =>
                    <RenderMenu key={index} item={menu} open={open} openSubMenus={openSubMenu} setOpenSubMenus={setOpenSubMenu} />)}
            </List>
        </MenuBar>
    );
}

const MenuBar = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open'
})<MenuBarProps>(({theme, open, drawerWidth}) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(5),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(7),
                },
            }),
        },
    }),
);

export default LeftBar;