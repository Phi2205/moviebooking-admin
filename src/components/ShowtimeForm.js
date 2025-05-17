import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Box,
    Typography,
    Autocomplete,
    CircularProgress,
    Paper,
    Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ShowtimeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState({
        movieId: '',
        screenId: '',
        startTime: '',
        endTime: ''
    });

    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [screens, setScreens] = useState([]);
    const [selectedTheater, setSelectedTheater] = useState(null);

    const [loadingMovies, setLoadingMovies] = useState(true);
    const [loadingTheaters, setLoadingTheaters] = useState(true);
    const [loadingScreens, setLoadingScreens] = useState(false);
    const [loadingShowtime, setLoadingShowtime] = useState(!!id);
    const [allShowtimes, setAllShowtimes] = useState([]);
    const [seatTypes, setSeatTypes] = useState({
        available: { price: 0, enabled: false },
        vip: { price: 0, enabled: false },
        couple: { price: 0, enabled: false },
    });

    useEffect(() => {
        axios.get('http://localhost:8080/api/admin/movies')
            .then(res => setMovies(res.data.data || []))
            .catch(err => toast.error('Error fetching movies'))
            .finally(() => setLoadingMovies(false));

        axios.get('http://localhost:8080/api/admin/theaters')
            .then(res => setTheaters(res.data || []))
            .catch(err => toast.error('Error fetching theaters'))
            .finally(() => setLoadingTheaters(false));
        axios.get('http://localhost:8080/api/admin/showtimes')
            .then(res => setAllShowtimes(res.data || [])) // bạn cần có setAllShowtimes
            .catch(err => toast.error('Error fetching all showtimes'));

        if (id) {
            axios.get(`http://localhost:8080/api/admin/showtimes/${id}`)
                .then(res => {
                    const data = res.data;
                    setShowtime({
                        movieId: data.movieId || '',
                        screenId: data.screenId || '',
                        startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
                        endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ''
                    });

                    if (data.screenId) {
                        axios.get(`http://localhost:8080/api/admin/screens/${data.screenId}`)
                            .then(screenRes => {
                                const screen = screenRes.data;
                                setSelectedTheater(screen.theater);
                                if (screen.theater) {
                                    setLoadingScreens(true);
                                    axios.get(`http://localhost:8080/api/admin/screens/theater/${screen.theater.id}`)
                                        .then(res => setScreens(res.data || []))
                                        .catch(err => toast.error('Error fetching screens'))
                                        .finally(() => setLoadingScreens(false));
                                }
                            });
                    }
                })
                .catch(err => toast.error('Error fetching showtime'))
                .finally(() => setLoadingShowtime(false));
        }
    }, [id]);

    useEffect(() => {
        if (selectedTheater && !id) {
            setLoadingScreens(true);
            axios.get(`http://localhost:8080/api/admin/screens/theater/${selectedTheater.id}`)
                .then(res => setScreens(res.data || []))
                .catch(err => toast.error('Error fetching screens'))
                .finally(() => setLoadingScreens(false));
        } else if (!selectedTheater) {
            setScreens([]);
            setShowtime(prev => ({ ...prev, screenId: '' }));
        }
    }, [selectedTheater, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShowtime(prev => ({ ...prev, [name]: value }));
    };

    const isReleased = () => {
        const currentDate = new Date();
        const startTime = new Date(showtime.startTime);
        console.log(currentDate);
        console.log(showtime.startTime);
        if (startTime <= currentDate) {
            alert('Showtime cannot be in the past');
            return true;
        }
        return false;
    }

    const isShowtimeConflict = () => {
        for (let i = 0; i < allShowtimes.length; i++) {
            const existingShowtime = allShowtimes[i];
            if (existingShowtime.screenId === showtime.screenId) {
                const existingStartTime = new Date(existingShowtime.startTime);
                const existingEndTime = new Date(existingShowtime.endTime);
                const newStartTime = new Date(showtime.startTime);
                const newEndTime = new Date(showtime.endTime);

                if (
                    (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
                    (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
                    (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
                ) {
                    alert('Showtime conflicts with an existing showtime');
                    return true;
                }
            }
        }
        return false;


    }
    const isReadyScreen = () => {
        axios.get(`http://localhost:8080/api/admin/seatprices/screen/${showtime.screenId}`)
            .then(res => setSeatTypes(res.data || []))
            .catch(err => toast.error('Error fetching seat prices'));
        console.log(seatTypes);
        return true;
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isReadyScreen()) {
            return;
        }

        const showtimeToSubmit = {
            ...showtime,
            startTime: new Date(showtime.startTime).toISOString()
        };
        if (isReleased()) {
            return;
        }
        if (isShowtimeConflict()) {
            return;
        }

        const request = id
            ? axios.put(`http://localhost:8080/api/admin/showtimes/${id}`, showtimeToSubmit)
            : axios.post('http://localhost:8080/api/admin/showtimes', showtimeToSubmit);

        request
            .then(res => {
                toast.success(res.data.message || 'Showtime saved successfully');
                navigate('/showtimes');
            })
            .catch(err => toast.error(err.response?.data?.message || 'Error saving showtime'));
    };

    const isLoading = loadingMovies || loadingTheaters || loadingShowtime;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
                    {id ? 'Edit Showtime' : 'Add New Showtime'}
                </Typography>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Autocomplete
                                options={movies}
                                getOptionLabel={(option) => option.title || ''}
                                value={movies.find(m => m.id === showtime.movieId) || null}
                                onChange={(e, newValue) => {
                                    setShowtime(prev => ({ ...prev, movieId: newValue?.id || '' }));
                                }}
                                renderInput={(params) => <TextField {...params} label="Movie" required />}
                            />

                            <Autocomplete
                                options={theaters}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedTheater}
                                onChange={(e, newValue) => setSelectedTheater(newValue)}
                                renderInput={(params) => <TextField {...params} label="Theater" required />}
                            />

                            <Autocomplete
                                options={screens}
                                getOptionLabel={(option) => `${option.screenNumber}`}
                                value={screens.find(s => s.id === showtime.screenId) || null}
                                onChange={(e, newValue) => {
                                    setShowtime(prev => ({ ...prev, screenId: newValue?.id || '' }));
                                }}
                                renderInput={(params) => <TextField {...params} label="Screen" required />}
                                disabled={loadingScreens || !selectedTheater}
                            />

                            <TextField
                                label="Start Time"
                                name="startTime"
                                type="datetime-local"
                                value={showtime.startTime}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                required
                            />

                            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => navigate('/showtimes')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isLoading || loadingScreens}
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

export default ShowtimeForm;
