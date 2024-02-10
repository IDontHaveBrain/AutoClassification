import {Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {MenuInfo} from "../../Routers";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface RenderMenuProps {
    open: boolean;
    item: MenuInfo;
    openSubMenus: any;
    setOpenSubMenus: any;
    level?: number;
}

const RenderMenu = ({open, item, openSubMenus, setOpenSubMenus, level = 1}: RenderMenuProps) => {
    const isSubMenuOpen = openSubMenus[item.name];
    const navigate = useNavigate();

    const handleOnClickMenuItem = () => {
        if (item.subMenu?.length) {
            const newOpenSubMenusState = {...openSubMenus};
            newOpenSubMenusState[item.name] = !isSubMenuOpen;
            setOpenSubMenus(newOpenSubMenusState);
        }

        if (item?.path) {
            navigate(item.path);
        }
    }

    return (
        <>
            <ListItemButton onClick={handleOnClickMenuItem} style={{paddingLeft: `${level * 16}px`}}>
                <Tooltip title={item.name}>
                    <ListItemIcon style={{marginRight: "-16px"}}>
                        {item.icon ? item.icon : <AssignmentIcon/>}
                    </ListItemIcon>
                </Tooltip>
                <Tooltip title={item.name}>
                    <ListItemText primary={item.name} primaryTypographyProps={{
                        noWrap: true,
                        style: {textOverflow: 'ellipsis', overflow: 'hidden', display: open ? 'block' : 'none'}
                    }}/>
                </Tooltip>
                {item.subMenu?.length && open ? (isSubMenuOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>) : null}
            </ListItemButton>

            {item.subMenu?.length ? (
                <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.subMenu.map((subItem, index) => (
                            <RenderMenu open={open} item={subItem} openSubMenus={openSubMenus}
                                        setOpenSubMenus={setOpenSubMenus} level={level + 1}
                                        key={`${item.name}_sub_${index}`}/>
                        ))}
                    </List>
                </Collapse>
            ) : null}
        </>
    );
}

export default RenderMenu;