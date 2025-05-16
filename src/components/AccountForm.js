import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AccountForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    avatar: '',
    role: 'ADMIN',
    providerId: null,
    uid: null,
    idToken: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:8080/api/auth/register', form)
      .then(() => {
        toast.success('Tài khoản đã được tạo thành công!');
        navigate('/account');
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
      });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Tạo tài khoản mới
      </Typography>
        <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/account')}
            >
            Cancel
        </Button>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          required
          margin="normal"
          value={form.email}
          onChange={handleChange}
          autoComplete="new-email"
        />
        <TextField
          fullWidth
          label="Mật khẩu"
          name="password"
          type="password"
          required
          margin="normal"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <TextField
          fullWidth
          label="Họ tên"
          name="fullName"
          required
          margin="normal"
          value={form.fullName}
          onChange={handleChange}
          autoComplete="off"
        />
        <TextField
          fullWidth
          label="Số điện thoại"
          name="phone"
          required
          margin="normal"
          value={form.phone}
          onChange={handleChange}
          autoComplete="off"
        />
        <TextField
          fullWidth
          label="Địa chỉ"
          name="address"
          required
          margin="normal"
          value={form.address}
          onChange={handleChange}
          autoComplete="off"
        />
        <TextField
          fullWidth
          label="Avatar URL"
          name="avatar"
          margin="normal"
          value={form.avatar}
          onChange={handleChange}
          autoComplete="off"
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit" fullWidth>
            TẠO TÀI KHOẢN
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default AccountForm;
