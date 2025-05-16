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
    FormControl
} from '@mui/material';
import { toast } from 'react-toastify';
import { Save, ArrowBack } from '@mui/icons-material';

const cities = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre",
    "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng",
    "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
    "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An",
    "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình",
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
    "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh",
    "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TheaterForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [theater, setTheater] = useState({
        name: '',
        address: '',
        city: ''
    });
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/admin/theaters/${id}`)
                .then(response => {
                    const data = response.data;
                    setTheater({
                        name: data.name || '',
                        address: data.address || '',
                        city: data.city || ''
                    });
                })
                .catch(error => {
                    console.error('Error fetching theater:', error);
                    toast.error('Error fetching theater: ' + (error.response?.data?.message || error.message));
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTheater(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const theaterToSubmit = {
            name: theater.name,
            address: theater.address,
            city: theater.city
        };

        const request = id
            ? axios.put(`http://localhost:8080/api/admin/theaters/${id}`, theaterToSubmit)
            : axios.post('http://localhost:8080/api/admin/theaters', theaterToSubmit);

        request
            .then(response => {
                toast.success(response.data.message || 'Theater saved successfully');
                navigate('/theaters');
            })
            .catch(error => {
                console.error('Error saving theater:', error);
                toast.error(error.response?.data?.message || 'Error saving theater');
            });
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
                    {id ? 'Edit Theater' : 'Add New Theater'}
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Name"
                                name="name"
                                value={theater.name}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Address"
                                name="address"
                                value={theater.address}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <FormControl fullWidth required>
                                <InputLabel id="city-label">City</InputLabel>
                                <Select
                                    labelId="city-label"
                                    name="city"
                                    value={theater.city}
                                    onChange={handleChange}
                                    label="City"
                                >
                                    {cities.map((city) => (
                                        <MenuItem key={city} value={city}>
                                            {city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate('/theaters')}
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

export default TheaterForm;
