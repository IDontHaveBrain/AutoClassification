import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { type AppBarProps, Box,IconButton, styled, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import { UserApi } from 'service/commons/ApiClient';
import { useAppDispatch,useAppSelector } from 'stores/rootHook';
import { setUserInfo } from 'stores/rootSlice';

import LanguageSwitcher from 'components/LanguageSwitcher/LanguageSwitcher';
import Notification from 'components/notification/Notification';
import UserInfo from 'components/user/UserInfo';
import AuthUtils from 'utils/authUtils';
import { URLS } from 'utils/constant';

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
    const userInfo = useAppSelector((state) => state.userInfo);
    const dispatch = useAppDispatch();
    const { t: tCommon } = useTranslation('common');
    const { t: tNavigation } = useTranslation('navigation');
    const navigate = useNavigate();
    const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

    useEffect(() => {
        const checkAndFetchUserInfo = async () => {
            const validToken = AuthUtils.getValidAccessToken();

            if (!validToken) {
                navigate('/sign-in', { replace: true });
                return;
            }

            // Check if user data exists (has name and email)
            const hasUserData = user?.name && user?.email && user.name.trim() !== '' && user.email.trim() !== '';

            if (!hasUserData && !isLoadingUserInfo) {
                setIsLoadingUserInfo(true);

                try {
                    // Check if token will expire soon
                    if (AuthUtils.willTokenExpireSoon(validToken, 5)) {
                        // Token expiring soon - handled by auth utils
                    }

                    const response = await UserApi.get(URLS.API.MEMBER.ME);

                    if (response.data) {
                        // Update Redux store with current user info and existing tokens
                        dispatch(setUserInfo({
                            access_token: userInfo.access_token,
                            refresh_token: userInfo.refresh_token,
                            expires_in: 0, // Will be set by token expiration
                            user: response.data,
                        }));
                    }
                } catch (error: unknown) {
                    // Handle different types of authentication errors
                    const errorObj = error as Error & { response?: { status: number } };
                    if (errorObj.name === 'AuthenticationError') {
                        // ApiInterceptorProvider will handle the redirect
                    } else if (errorObj.response?.status === 401) {
                        // ApiInterceptorProvider will handle the redirect
                    } else if (errorObj.response?.status === 403) {
                        // Authorization failed
                    }

                    // Don't redirect here - let ApiInterceptorProvider handle authentication errors
                    // This prevents double redirects and allows proper error flow
                } finally {
                    setIsLoadingUserInfo(false);
                }
            }
        };

        checkAndFetchUserInfo();
    }, [navigate, user, userInfo.access_token, userInfo.refresh_token, dispatch, isLoadingUserInfo]);

    return (
        <AppBar position={'absolute'} open={open} menuwidth={width}>
            <Toolbar sx={{ pr: '20px' }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label={tCommon('open')}
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
                    {tNavigation('menu.dashboard')}
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

const AppBar = styled(({ open, menuwidth, ...otherProps }) => (
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
