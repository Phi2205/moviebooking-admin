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
    MenuItem
} from '@mui/material';
import { toast } from 'react-toastify';
import { Save, ArrowBack } from '@mui/icons-material';

const ScreenForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [screen, setScreen] = useState({
        screenNumber: '',
        totalSeats: '',
        theaterId: ''
    });

    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        // Fetch all theaters to populate dropdown
        axios.get('http://localhost:8080/api/admin/theaters')
            .then(res => setTheaters(res.data))
            .catch(err => {
                console.error('Error fetching theaters:', err);
                toast.error('Failed to load theaters.');
            });

        if (id) {
            axios.get(`http://localhost:8080/api/admin/screens/${id}`)
                .then(res => {
                    const data = res.data;
                    setScreen({
                        screenNumber: data.screenNumber?.toString() || '',
                        totalSeats: data.totalSeats?.toString() || '',
                        theaterId: data.theater?.id || ''
                    });
                })
                .catch(err => {
                    console.error('Error fetching screen:', err);
                    toast.error('Failed to load screen: ' + (err.response?.data?.message || err.message));
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setScreen(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const screenNumber = screen.screenNumber.trim();


        const totalSeats = parseInt(screen.totalSeats, 10);

        // if (isNaN(totalSeats) || totalSeats < 1) {
        //     toast.error('Total seats must be a valid number greater than 0.');
        //     return;
        // }
        console.log('totalSeats:', totalSeats);
        if (!screen.theaterId) {
            toast.error('Please select a theater.');
            return;
        }

        const screenToSubmit = {
            theaterId: screen.theaterId,
            screenNumber,
            totalSeats: isNaN(Number(totalSeats)) ? 0 : Number(totalSeats)
        };
        console.log('totalSeats:', totalSeats);
        console.log('Submitting screen:', screenToSubmit);
        const request = id
            ? axios.put(`http://localhost:8080/api/admin/screens/${id}`, screenToSubmit)
            : axios.post(`http://localhost:8080/api/admin/screens`, screenToSubmit);

        request
            .then(res => {
                toast.success(res.data.message || 'Screen saved successfully');
                navigate('/screens');
            })
            .catch(err => {
                console.error('Error saving screen:', err);
                toast.error(err.response?.data?.message || 'Error saving screen');
            });
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
                    {id ? 'Edit Screen' : 'Add New Screen'}
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                label="Theater"
                                name="theaterId"
                                value={screen.theaterId}
                                onChange={handleChange}
                                fullWidth
                                required
                            >
                                {theaters.map(theater => (
                                    <MenuItem key={theater.id} value={theater.id}>
                                        {theater.name} - {theater.city}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Screen Number"
                                name="screenNumber"
                                type="text"
                                value={screen.screenNumber}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            {/* 
                            <TextField
                                label="Total Seats"
                                name="totalSeats"
                                type="number"
                                value={screen.totalSeats}
                                onChange={handleChange}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                            /> */}

                            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate('/screens')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                    onClick={handleSubmit}
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

export default ScreenForm;
