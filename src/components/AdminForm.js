import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
    Avatar,
    IconButton
} from '@mui/material';
import { toast } from 'react-toastify';
import { Save, ArrowBack, PhotoCamera } from '@mui/icons-material';

const roles = ["ADMIN", "USER"];

const AdminForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        avatar: '',
        role: ''
    });
    const [loading, setLoading] = useState(!!id);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/users/${id}`)
                .then(response => {
                    const data = response.data;
                    console.log('Fetched users:', data);
                    setUser({

                        email: data.email || '',
                        password: '', // Password field is typically empty on edit
                        fullName: data.fullName || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        avatar: data.avatar || '',
                        role: data.role || ''
                    });
                    
                    if (data.avatar) {
                        setAvatarPreview(data.avatar);
                    }
                })
                .catch(error => {
                    console.error('Error fetching user:', error);
                    toast.error('Error fetching user: ' + (error.response?.data?.message || error.message));
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            
            // Create a preview of the image
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('email', user.email);
        
        // Only include password if it's provided (for new users) or changed (for existing users)
        if (user.password) {
            formData.append('password', user.password);
        }
        
        formData.append('fullName', user.fullName);
        
        if (user.phone) {
            formData.append('phone', user.phone);
        }
        
        if (user.address) {
            formData.append('address', user.address);
        }
        
        formData.append('role', user.role);
        
        if (avatarFile) {
            formData.append('avatarFile', avatarFile);
        }

        const request = id
            ? axios.put(`http://localhost:8080/api/users/${id}`, formData, {
                headers: { 'Content-Type': 'application/json' }
              })
            : axios.post('http://localhost:8080/api/users', formData, {
                headers: { 'Content-Type': 'application/json' }
              });

        request
            .then(response => {
                toast.success(response.data.message || 'User saved successfully');
                navigate('/accounts/admins');

            })
            .catch(error => {
                console.error('Error saving user:', error);
                toast.error(error.response?.data?.message || 'Error saving user');
            });
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
                    {id ? 'Edit User' : 'Add New User'}
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            {/* Avatar Upload */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={avatarPreview || '/default-avatar.png'}
                                    sx={{ width: 100, height: 100, mb: 2 }}
                                    alt={user.fullName || 'User avatar'}
                                />
                                <label htmlFor="avatar-upload">
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={<PhotoCamera />}
                                        size="small"
                                    >
                                        Upload Avatar
                                    </Button>
                                </label>
                            </Box>
                            
                            
                            <TextField
                                label="Full Name"
                                name="fullName"
                                value={user.fullName}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={user.fullName === ''}
                                helperText={user.fullName === '' ? 'Họ tên không được để trống' : ''}
                            />
                            
                            <TextField
                                label="Phone"
                                name="phone"
                                value={user.phone}
                                onChange={handleChange}
                                fullWidth
                            />
                            
                            <TextField
                                label="Address"
                                name="address"
                                value={user.address}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                            />
                            

                            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate('/accounts/user')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                >
                                    {id ? 'Update' : 'Add'}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default AdminForm;