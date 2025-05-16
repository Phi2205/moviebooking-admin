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

const SeatPriceForm = () => {
    const { id } = useParams(); // id của seatPrice nếu đang edit
    const navigate = useNavigate();

    const [seatPrice, setSeatPrice] = useState({
        screenId: '',
        seatTypeId: '',
        price: ''
    });
    const seatTypes = [
        { id: 1, name: 'Ghế Thường' },
        { id: 2, name: 'Ghế VIP' },
        { id: 3, name: 'Ghế Couple' }
    ];

    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        // Fetch danh sách screens và seat types
        axios.get('http://localhost:8080/api/admin/screens')
            .then(res => setScreens(res.data))
            .catch(() => toast.error('Không thể tải danh sách phòng chiếu.'));

        // axios.get('http://localhost:8080/api/admin/seat-types')
        //     .then(res => setSeatTypes(res.data))
        //     .catch(() => toast.error('Không thể tải danh sách loại ghế.'));

        if (id) {
            axios.get(`http://localhost:8080/api/admin/seatprices/${id}`)
                .then(res => {
                    const data = res.data;
                    console.log(data);
                    setSeatPrice({
                        screenId: data.screen?.id || '',
                        seatTypeId: parseInt(data.seatTypeId, 10) || 0,
                        price: data.price?.toString() || ''
                    });
                })
                .catch(err => {
                    toast.error('Lỗi khi tải thông tin giá ghế.');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSeatPrice(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!seatPrice.screenId || !seatPrice.seatTypeId) {
            toast.error('Vui lòng chọn đầy đủ phòng chiếu và loại ghế.');
            return;
        }

        const parsedPrice = parseFloat(seatPrice.price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            toast.error('Giá vé phải là số lớn hơn 0.');
            return;
        }

        const dataToSubmit = {
            screenId: seatPrice.screenId,
            seatTypeId: seatPrice.seatTypeId,
            price: parsedPrice
        };
        console.log("dataToSubmit", dataToSubmit);
        const request = id
            ? axios.put(`http://localhost:8080/api/admin/seatprices/${id}`, dataToSubmit)
            : axios.post(`http://localhost:8080/api/admin/seatprices`, dataToSubmit);

        request
            .then(res => {
                toast.success(res.data.message || 'Lưu thành công');
                navigate('/seatPrices');
            })
            .catch(err => {
                console.error(err);
                toast.error(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
            });
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
                    {id ? 'Cập nhật giá ghế' : 'Thêm giá ghế mới'}
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
                                label="Phòng chiếu"
                                name="screenId"
                                value={seatPrice.screenId}
                                onChange={handleChange}
                                fullWidth
                                required
                            >
                                {screens.map(screen => (
                                    <MenuItem key={screen.id} value={screen.id}>
                                        {screen.screenNumber} - {screen.theater?.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Loại ghế"
                                name="seatTypeId"
                                value={seatPrice.seatTypeId}
                                onChange={(e) =>
                                    setSeatPrice({
                                        ...seatPrice,
                                        seatTypeId: parseInt(e.target.value, 10), // Ép kiểu chuỗi thành số nguyên
                                    })
                                }
                                fullWidth
                                required
                            >
                                {seatTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}

                            </TextField>

                            <TextField
                                label="Giá vé"
                                name="price"
                                type="number"
                                inputProps={{ min: 1000 }}
                                value={seatPrice.price}
                                onChange={handleChange}
                                fullWidth
                                required
                            />

                            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate('/seatPrices')}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                >
                                    {id ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default SeatPriceForm;
