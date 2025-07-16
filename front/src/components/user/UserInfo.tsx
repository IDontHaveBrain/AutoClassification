import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box, Divider, IconButton, MenuItem, Popover, Typography } from '@mui/material';
import { type Member, SseType } from 'model/GlobalModel';
import SseManager from 'service/commons/SseManager';
import { useAppDispatch } from 'stores/rootHook';
import { resetUserInfo } from 'stores/rootSlice';

import AuthUtils from 'utils/authUtils';
import { eventBus } from 'utils/eventBus';

interface UserInfoProps {
  user: Member | null | undefined;
}

function UserInfo({ user: initialUser }: UserInfoProps) {
  const [user, setUser] = useState<Member | null | undefined>(initialUser);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { t } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const handleUserUpdate = (updatedUser: Member) => {
      if (user?.id && updatedUser.id === user.id) {
        setUser(prevUser => {
          const newUser = prevUser ? { ...prevUser, ...updatedUser } : updatedUser;
          return newUser;
        });
      }
    };

    eventBus.subscribe(SseType.USER_UPDATE, handleUserUpdate);

    return () => {
      eventBus.unsubscribe(SseType.USER_UPDATE, handleUserUpdate);
    };
  }, [user?.id]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AuthUtils.removeTokens();
    dispatch(resetUserInfo());
    SseManager.getInstance().disconnect();
    handleClose();
    navigate('/sign-in', { replace: true });
  };

  const open = Boolean(anchorEl);

  // 안전한 데이터 디스플레이를 위한 헬퍼 함수들
  const getUserName = (): string => {
    return !user ? t('user.loading', 'Loading...') : user.name?.trim() || t('user.noName', 'No name');
  };

  const getUserEmail = (): string => {
    return !user ? '' : user.email?.trim() || t('user.noEmail', 'No email');
  };

  const getGroupName = (): string | null => {
    if (!user?.memberGroup) return null;
    return user.memberGroup.groupName?.trim() || null;
  };

  if (!user) {
    return (
      <>
        <IconButton color="inherit" onClick={handleClick} disabled>
          <AccountCircleIcon />
        </IconButton>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ minWidth: 200 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" color="text.secondary">
                {t('user.loading', 'Loading...')}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body1">{tAuth('profile.logout')}</Typography>
            </MenuItem>
          </Box>
        </Popover>
      </>
    );
  }

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <AccountCircleIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ minWidth: 200 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{getUserName()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {getUserEmail()}
            </Typography>
            {getGroupName() && (
              <Typography variant="body2" color="text.secondary">
                {t('group')}: {getGroupName()}
              </Typography>
            )}
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body1">{tAuth('profile.logout')}</Typography>
          </MenuItem>
        </Box>
      </Popover>
    </>
  );
}

export default UserInfo;
