import React, { useContext } from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const AccountPage = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Typography variant="h6">Vui lòng đăng nhập để xem thông tin tài khoản.</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#f5f5f5',
        padding: 4,
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 500, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={user.avatar}
            alt={user.fullName}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            {user.fullName}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Email: {user.email}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Vai trò: {user.role}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Số điện thoại: {user.phone || 'Chưa cập nhật'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Địa chỉ: {user.address || 'Chưa cập nhật'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Ngày tạo: {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AccountPage;