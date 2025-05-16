import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Collapse
} from '@mui/material';
import {
  AccountCircle,
  Movie as MovieIcon,
  Event as ShowtimeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const drawerWidth = 240;

// Interceptor thêm token vào header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const MainLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const [openAccountMenu, setOpenAccountMenu] = useState(false);



  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/login');
    setAvatarUrl(user?.avatar || '');
    setOpen(!open);
  };

  // Gọi API lấy avatar khi vào trang
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/me'); // Hoặc URL tương ứng của bạn
        setAvatarUrl(response.data.avatar);
        setUsername(response.data.fullName);
      } catch (error) {
        console.error('Lỗi khi lấy avatar:', error);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: '#333',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography sx={{ ml: 2 }}>{username || 'No name'}</Typography>
          <Avatar
            sx={{ ml: 1 }}
            alt={user?.username || 'User'}
            src={avatarUrl}
          />
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer trái */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#2c3e50',
            color: 'white',
          }
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ADMINDek
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: '#34495e' }} />

        <List>
          {/* <ListItem button onClick={() => handleMenuItemClick('/account')}>
            <ListItemIcon><AccountCircle sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Tài khoản" />
          </ListItem>
          <ListItem button onClick={() => handleMenuItemClick('/accounts/add')}>
            <ListItemIcon><AccountCircle sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Tạo tài khoản" />
          </ListItem> */}
          <ListItem button onClick={() => setOpenAccountMenu(!openAccountMenu)}>
            <ListItemIcon>
              <AccountCircle sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Quản lý tài khoản" />
            {/* {openAccountMenu ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />} */}
          </ListItem>

          <Collapse in={openAccountMenu} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button onClick={() => handleMenuItemClick('/accounts/admins')} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <AccountCircle sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Tài khoản Admin" />
              </ListItem>
              <ListItem button onClick={() => handleMenuItemClick('/accounts/user')} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <AccountCircle sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Tài khoản User" />
              </ListItem>
            </List>
          </Collapse>
          <ListItem button onClick={() => handleMenuItemClick('/movies')}>
            <ListItemIcon><MovieIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Movies" />
          </ListItem>
          <ListItem button onClick={() => handleMenuItemClick('/showtimes')}>
            <ListItemIcon><ShowtimeIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Showtimes" />
          </ListItem>
          <ListItem button onClick={() => handleMenuItemClick('/theaters')}>
            <ListItemIcon><ShowtimeIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Theaters" />
          </ListItem>
          <ListItem button onClick={() => handleMenuItemClick('/screens')}>
            <ListItemIcon><ShowtimeIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Screens" />
          </ListItem>
          <ListItem button onClick={() => handleMenuItemClick('/seatPrices')}>
            <ListItemIcon><ShowtimeIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Seat Price" />
          </ListItem>
        </List>

        <Divider sx={{ borderColor: '#34495e' }} />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItem>
      </Drawer>

      {/* Nội dung chính */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#000',
          p: 3,
          mt: 8,
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
