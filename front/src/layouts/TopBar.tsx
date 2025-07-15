import { useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { type AppBarProps, Box,IconButton, styled, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'hooks/useTranslation';
import { useAppSelector } from 'stores/rootHook';

import Notification from 'components/notification/Notification';
import UserInfo from 'components/user/UserInfo';

import { LanguageSwitcher } from '../components/LanguageSwitcher';

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

const TopBar = ({ open, openMenu, width, children: _children }: TopBarProps) => {
    const user = useAppSelector((state) => state.userInfo.user);
    const { t } = useTranslation('navigation');

    useEffect(() => {
        const tokenCheck = sessionStorage.getItem('access_token');
        if (!tokenCheck || !user?.email) {
            window.location.href = '/sign-in';
        }
    }, [user]);

    return (
        <AppBar position={'absolute'} open={open} menuwidth={width}>
            <Toolbar sx={{ pr: '20px' }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={openMenu}
                    sx={{
                        marginRight: '36px',
                        ...(open && { display: 'none' }),
                    }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography
                    component={'h1'}
                    variant={'h6'}
                    color={'inherit'}
                    noWrap
                    sx={{ flexGrow: 1 }}
                >
                    {t('menu.dashboard')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageSwitcher variant="compact" />
                    <UserInfo user={user} />
                    <Notification />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

const AppBar = styled(({ ...otherProps }) => (
    <MuiAppBar {...otherProps} />
))<MyAppBarProps>(({ theme, open, menuwidth: menuwidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: menuwidth,
        width: `calc(100% - ${menuwidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export default TopBar;
