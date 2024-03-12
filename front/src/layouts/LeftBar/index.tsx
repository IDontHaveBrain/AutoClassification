import {
  Divider,
  DrawerProps,
  IconButton,
  List,
  styled,
  Toolbar,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { ReactNode, useState } from "react";
import { MenuInfo } from "service/commons/MenuItem";
import RenderMenu from "layouts/LeftBar/renderMenu";

interface MenuBarProps extends DrawerProps {
  drawerwidth: number;
}

interface LeftBarProps {
  open: boolean;
  openMenu: () => void;
  width: number;
  menu?: MenuInfo[];
  children?: ReactNode;
}

const LeftBar = ({
  open,
  openMenu,
  width = 240,
  menu,
  children,
}: LeftBarProps) => {
  const [openSubMenu, setOpenSubMenu] = useState({});

  return (
    <MenuBar variant={"permanent"} open={open} drawerwidth={width}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        {children}
        <IconButton onClick={openMenu}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menu?.map((menu, index) => (
          <RenderMenu
            key={index}
            item={menu}
            open={open}
            openSubMenus={openSubMenu}
            setOpenSubMenus={setOpenSubMenu}
          />
        ))}
      </List>
    </MenuBar>
  );
};

const MenuBar = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<MenuBarProps>(({ theme, open, drawerwidth }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerwidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(5),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(7),
      },
    }),
  },
}));

export default LeftBar;
