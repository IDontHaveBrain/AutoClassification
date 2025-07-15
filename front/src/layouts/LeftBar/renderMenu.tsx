import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { type MenuInfo } from 'service/commons/MenuItem';

type MenuState = Record<string, boolean>;

interface RenderMenuProps {
  open: boolean;
  item: MenuInfo;
  openSubMenus: MenuState;
  setOpenSubMenus: React.Dispatch<React.SetStateAction<MenuState>>;
  level?: number;
}

const RenderMenu = ({
  open,
  item,
  openSubMenus,
  setOpenSubMenus,
  level = 1,
}: RenderMenuProps) => {
  const isSubMenuOpen = openSubMenus[item.name];
  const navigate = useNavigate();

  if (item.invisible) return null;

  const handleOnClickMenuItem = () => {
    if (item.subMenu?.length) {
      const newOpenSubMenusState = { ...openSubMenus };
      newOpenSubMenusState[item.name] = !isSubMenuOpen;
      setOpenSubMenus(newOpenSubMenusState);
    }
    if (item.path && item.element) {
      navigate(item.path);
    }
  };

  return (
    <>
      <Tooltip
        title={!open ? item.name : ''}
        placement="right"
        arrow
        enterDelay={500}
        leaveDelay={200}
        disableHoverListener={open}
      >
        <ListItemButton
          onClick={handleOnClickMenuItem}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <ListItemIcon style={{ marginRight: '-16px' }}>
            {item.icon ? item.icon : <AssignmentIcon />}
          </ListItemIcon>
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              noWrap: true,
              style: {
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: open ? 'block' : 'none',
              },
            }}
          />
          {(() => {
            const shouldShowExpandIcon =
              item.subMenu?.length &&
              open &&
              (!item.path || !item.element || item.subMenu.some(subItem => !subItem.invisible));

            if (!shouldShowExpandIcon) {
              return null;
            }

            return isSubMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />;
          })()}
        </ListItemButton>
      </Tooltip>

      {item.subMenu?.length ? (
        <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.subMenu.map((subItem) => (
              <RenderMenu
                open={open}
                item={subItem}
                openSubMenus={openSubMenus}
                setOpenSubMenus={setOpenSubMenus}
                level={level + 1}
                key={subItem.path || `${item.name}_${subItem.name}`}
              />
            ))}
          </List>
        </Collapse>
      ) : null}
    </>
  );
};

export default RenderMenu;
