import {Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {useNavigate} from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {MenuInfo} from "service/commons/MenuItem";


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

    if (item.invisible) return null;

    const handleOnClickMenuItem = () => {
        if (item.path && item.element) {
            navigate(item.path);
        }
        else if (item.subMenu?.length) {
            const newOpenSubMenusState = {...openSubMenus};
            newOpenSubMenusState[item.name] = !isSubMenuOpen;
            setOpenSubMenus(newOpenSubMenusState);
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
                {item.subMenu?.length && open && !(item.path && item.element) ?
                    (isSubMenuOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>) : null}
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