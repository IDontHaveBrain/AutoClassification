import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('navigation');

  // Helper function to get translation key from menu name
  const getTranslationKey = (menuName: string, isSubMenu: boolean = false): string => {
    const prefix = isSubMenu ? 'submenu' : 'menu';
    const keyMap: Record<string, string> = {
      'Home': `${prefix}.home`,
      'Notice': `${prefix}.notice`,
      'Notice Write': `${prefix}.noticeWrite`,
      'Workspace': `${prefix}.workspace`,
      'Workspace List': `${prefix}.workspaceList`,
      'Workspace Editor': `${prefix}.workspaceEditor`,
      'Auto Label': `${prefix}.autoLabel`,
      'Training': `${prefix}.training`,
      'Service': `${prefix}.service`,
      'TestClassfiy': `${prefix}.testClassify`,
      'TestResult': `${prefix}.testResult`,
      'Classify': `${prefix}.classify`,
      'Result': `${prefix}.result`,
    };
    return keyMap[menuName] || menuName;
  };

  const translatedName = t(getTranslationKey(item.name, level > 1), item.name);

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
        title={!open ? translatedName : ''}
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
            primary={translatedName}
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
