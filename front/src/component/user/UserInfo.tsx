import React, { useState } from 'react';
import { IconButton, Popover, Typography, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Member } from 'model/GlobalModel';

interface UserInfoProps {
  user: Member;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

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
