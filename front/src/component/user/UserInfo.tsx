import React, { useState, useEffect } from 'react';
import { IconButton, Popover, Typography, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Member, SseEvent, SseType } from 'model/GlobalModel';
import { eventBus } from 'layouts/BackGround';

interface UserInfoProps {
  user: Member;
}

const UserInfo: React.FC<UserInfoProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<Member>(initialUser);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleUserUpdate = (updatedUser: Member) => {
      if (updatedUser.id === user.id) {
        setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      }
    };

    eventBus.subscribe(SseType.USER_UPDATE, handleUserUpdate);

    return () => {
      eventBus.unsubscribe(SseType.USER_UPDATE, handleUserUpdate);
    };
  }, [user.id]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body1">Email: {user.email}</Typography>
          {user.memberGroup && (
            <Typography variant="body1">Group: {user.memberGroup.groupName}</Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default UserInfo;
