import React, { useContext } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Lấy user từ context

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        textAlign: 'center',
        padding: 4,
      }}
    >
      <Typography variant="h2" gutterBottom>
        Chào mừng đến với Movie Manager
      </Typography>
      <Typography variant="h5" gutterBottom>
        Quản lý phim và lịch chiếu dễ dàng
      </Typography>

      {/* Ẩn nút nếu đã đăng nhập */}
      {!user && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/login')}
          sx={{ mt: 3 }}
        >
          Đăng nhập
        </Button>
      )}
    </Box>
  );
};

export default HomePage;
