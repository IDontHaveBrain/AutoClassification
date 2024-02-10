import {
    Divider,
    DrawerProps,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon, ListItemText, Menu,
    MenuItem,
    MenuList,
    styled,
    Toolbar
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {MenuInfo} from "../Routers";
import {useNavigate} from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {useState} from "react";

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
    const [menuList, setMenuList] = useState<MenuInfo[]>(menu);
    const [openMenuList, setOpenMenuList] = useState<MenuInfo[]>();
    const navigate = useNavigate();

    const movePage = (path: string) => {
        navigate(path);
    }

    const onClickMenu = (menu: MenuInfo) => {
        if (menu?.subMenu?.length) {
            if (openMenuList.some(openMenu => openMenu.name === menu.name)) {
                setOpenMenuList(openMenuList.filter(openMenu => openMenu.name !== menu.name));
            } else {
                setOpenMenuList([...openMenuList, menu]);
            }
        } else if (menu?.path) {
            movePage(menu.path);
        }
    }

    const menuRender = () => {

        // return (
        //
        // );
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
            <List component="nav">
                <List component={"nav"}>
                    {menu?.map((item, index) => (
                        <ListItemButton key={index} onClick={() => onClickMenu(item)}>
                            <ListItemIcon>{item.icon ? item.icon : <AssignmentIcon/>}</ListItemIcon>
                            <ListItemText primary={item.name}/>
                        </ListItemButton>
                    ))}
                </List>
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
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

export default LeftBar;