import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    CircularProgress,
    Chip,
    TablePagination,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage]);

    const fetchUsers = () => {
        setLoading(true);
        axios.get(`http://localhost:8080/api/users/list?page=${page}&size=${rowsPerPage}`)
            .then(response => {
                const data = response.data;
                setUsers(data.content || []);
                console.log('Fetched users:', data.content);
                setTotalUsers(data.totalElements || 0);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                toast.error('Error fetching users: ' + (error.response?.data?.message || error.message));
            })
            .finally(() => setLoading(false));
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEdit = (id) => {
        navigate(`edit/${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            axios.delete(`http://localhost:8080/api/admin/delete/${id}`)
                .then(response => {
                    toast.success(response.data.message || 'User deleted successfully');
                    fetchUsers();
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    toast.error(error.response?.data?.message || 'Error deleting user');
                });
        }
    };

    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'error';
            case 'manager':
                return 'warning';
            case 'customer':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/accounts/user/add')}
                >
                    Add New User
                </Button>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Avatar</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Full Name</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>Address</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.userId} hover>
                                            <TableCell>
                                                <Avatar
                                                    src={user.avatar || '/default-avatar.png'}
                                                    alt={user.fullName}
                                                    sx={{ width: 40, height: 40 }}
                                                />
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>{user.phone || 'N/A'}</TableCell>
                                            <TableCell>{user.address || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleEdit(user.userId)}
                                                        title="Edit"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(user.userId)}
                                                        title="Delete"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                                <Typography variant="body1">No users found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalUsers}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default UserList;
