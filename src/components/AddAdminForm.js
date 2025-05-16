import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Box,
    Typography,
    CircularProgress,
    Paper,
    Stack,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Avatar
} from '@mui/material';
import { toast } from 'react-toastify';
import { Save, ArrowBack, PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const roles = ["ADMIN", "USER"];

const AddAdminForm = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        avatar: '',
        role: 'ADMIN'
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setAvatarPreview(base64);
                setUser(prev => ({
                    ...prev,
                    avatar: base64 // gán vào chuỗi base64
                }));
            };
            reader.readAsDataURL(file); // chuyển file -> base64
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        // const formData = new FormData();
        // formData.append('email', user.email);
        // formData.append('password', user.password);
        // formData.append('fullName', user.fullName);
        // formData.append('phone', user.phone);
        // formData.append('address', user.address);
        // formData.append('role', user.role);
        // if (avatarFile) {
        //     formData.append('avatar', avatarFile);
        // }
        // console.log('Form data:', formData);
        // console.log('User data:', user);
        const payload = {
            email: user.email,
            password: user.password,
            fullName: user.fullName,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar, // base64 string
            role: user.role
        };
        setLoading(true);
        axios.post('http://localhost:8080/api/admin/register', payload)
            .then(res => {
                toast.success(res.data.message || 'Thêm người dùng thành công!');
                navigate('/accounts/admins');
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra!');
            })
            .finally(() => setLoading(false));
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
                    Thêm Người Dùng Mới
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar
                                src={avatarPreview || '/default-avatar.png'}
                                sx={{ width: 100, height: 100, mb: 2 }}
                                alt="Avatar"
                            />
                            <label htmlFor="avatar-upload">
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarChange}
                                />
                                <Button component="span" variant="outlined" startIcon={<PhotoCamera />}>
                                    Tải ảnh đại diện
                                </Button>
                            </label>
                        </Box>

                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={user.email}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            value={user.password}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Họ và tên"
                            name="fullName"
                            value={user.fullName}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Số điện thoại"
                            name="phone"
                            value={user.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Địa chỉ"
                            name="address"
                            value={user.address}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Phân quyền"
                            name="role"
                            value={user.role}
                            InputProps={{
                                readOnly: true,
                            }}
                            fullWidth
                        />


                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/accounts/user')}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                disabled={loading}
                            >
                                Thêm
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
};

export default AddAdminForm;
