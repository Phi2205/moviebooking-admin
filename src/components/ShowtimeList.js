import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Add,
  Edit,
  Delete,
  Search,
  MovieFilter,
  EventSeat,
  AccessTime,
  Movie,
  Theaters,
  CalendarMonth
} from '@mui/icons-material';

const ShowtimeList = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredShowtimes(showtimes.filter(showtime =>
        showtime.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showtime.theaterName.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredShowtimes(showtimes);
    }
  }, [showtimes, searchTerm]);

  const fetchShowtimes = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/admin/showtimes')
      .then(response => {
        setShowtimes(response.data);
        setFilteredShowtimes(response.data);
      })
      .catch(error => {
        toast.error(error.response?.data?.message || 'Error fetching showtimes');
      })
      .finally(() => setLoading(false));
  };

  const confirmDelete = (showtime) => {
    setShowtimeToDelete(showtime);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (showtimeToDelete) {
      axios.delete(`http://localhost:8080/api/admin/showtimes/${showtimeToDelete.id}`)
        .then(() => {
          setShowtimes(prev => prev.filter(showtime => showtime.id !== showtimeToDelete.id));
          toast.success('Showtime deleted successfully');
          setDeleteDialogOpen(false);
        })
        .catch(error => {
          toast.error(error.response?.data?.message || 'Error deleting showtime');
        });
    }
  };

  const getGradientColor = (title) => {
    const colors = [
      'linear-gradient(135deg, #FF9966, #FF5E62)',
      'linear-gradient(135deg, #7F7FD5, #86A8E7, #91EAE4)',
      'linear-gradient(135deg, #43C6AC, #191654)',
      'linear-gradient(135deg, #834d9b, #d04ed6)',
      'linear-gradient(135deg, #4568DC, #B06AB3)',
      'linear-gradient(135deg, #0575E6, #00F260)'
    ];
    const index = title.length % colors.length;
    return colors[index];
  };

  const formatDateTime = (dateTimeString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  // Stats calculation
  const totalMovies = new Set(showtimes.map(showtime => showtime.movieTitle)).size;
  const totalTheaters = new Set(showtimes.map(showtime => showtime.theaterName)).size;
  const upcomingShowtimes = showtimes.filter(showtime => 
    new Date(showtime.startTime) > new Date()
  ).length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 4, 
          borderRadius: 3, 
          background: 'linear-gradient(45deg, #FF5E62 0%, #FF9966 100%)',
          boxShadow: '0 6px 20px rgba(32, 40, 97, 0.23)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          transform: 'translate(30%, -60%)'
        }} />
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          spacing={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="white" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.15)'
              }}
            >
              <MovieFilter sx={{ mr: 1.5, fontSize: 35 }} />
              Showtime Management
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.85)' }}>
              Schedule and manage all movie showtimes in one place
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/showtimes/add"
            sx={{ 
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              px: 3,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.25)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.18)'
              }
            }}
          >
            Add New Showtime
          </Button>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden', 
            boxShadow: '0 8px 20px rgba(32, 40, 97, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 25px rgba(32, 40, 97, 0.2)'
            }
          }}>
            <Box sx={{ height: 7, bgcolor: '#FF5E62' }} />
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 94, 98, 0.9)', 
                  width: 60, 
                  height: 60,
                  boxShadow: '0 4px 14px rgba(255, 94, 98, 0.25)'
                }}>
                  <Movie sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{totalMovies}</Typography>
                  <Typography variant="body1" color="text.secondary">Movies Scheduled</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden', 
            boxShadow: '0 8px 20px rgba(32, 40, 97, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 25px rgba(32, 40, 97, 0.2)'
            }
          }}>
            <Box sx={{ height: 7, bgcolor: '#FF9966' }} />
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 153, 102, 0.9)', 
                  width: 60, 
                  height: 60,
                  boxShadow: '0 4px 14px rgba(255, 153, 102, 0.25)'
                }}>
                  <Theaters sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{totalTheaters}</Typography>
                  <Typography variant="body1" color="text.secondary">Active Theaters</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden', 
            boxShadow: '0 8px 20px rgba(32, 40, 97, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 25px rgba(32, 40, 97, 0.2)'
            }
          }}>
            <Box sx={{ height: 7, bgcolor: '#43C6AC' }} />
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'rgba(67, 198, 172, 0.9)', 
                  width: 60, 
                  height: 60,
                  boxShadow: '0 4px 14px rgba(67, 198, 172, 0.25)'
                }}>
                  <CalendarMonth sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{upcomingShowtimes}</Typography>
                  <Typography variant="body1" color="text.secondary">Upcoming Showtimes</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ 
        p: 1.5, 
        mb: 4, 
        borderRadius: 3, 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 6px 16px rgba(32, 40, 97, 0.1)'
      }}>
        <Search sx={{ mx: 1.5, color: '#FF5E62' }} />
        <TextField
          fullWidth
          placeholder="Search showtimes by movie title or theater name..."
          variant="standard"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ 
            disableUnderline: true,
            sx: { fontSize: '1.1rem' }
          }}
        />
      </Paper>

      {/* Content */}
      {loading ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress size={60} thickness={5} sx={{ color: '#FF5E62' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            Loading showtimes...
          </Typography>
        </Box>
      ) : filteredShowtimes.length === 0 ? (
        <Fade in={!loading}>
          <Paper sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 3,
            boxShadow: '0 6px 16px rgba(32, 40, 97, 0.1)'
          }}>
            <MovieFilter sx={{ fontSize: 80, color: '#9e9e9e', mb: 3 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              No showtimes found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please adjust your search or add new showtimes
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Fade in={!loading}>
          <Paper sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 6px 16px rgba(32, 40, 97, 0.1)'
          }}>
            <List sx={{ p: 0 }}>
              {filteredShowtimes.map((showtime, index) => (
                <React.Fragment key={showtime.id}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 3,
                      transition: 'background-color 0.2s',
                      '&:hover': { 
                        bgcolor: 'rgba(255, 94, 98, 0.05)',
                        '& .MuiButton-root': { opacity: 1 }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: getGradientColor(showtime.movieTitle),
                          width: 50,
                          height: 50,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        {showtime.movieTitle.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                          {showtime.movieTitle}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Theaters sx={{ color: '#FF9966', fontSize: 18 }} />
                                <Typography variant="body2">
                                  <strong>Theater:</strong> {showtime.theaterName}
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <EventSeat sx={{ color: '#4568DC', fontSize: 18 }} />
                                <Typography variant="body2">
                                  <strong>Screen:</strong> {showtime.screenNumber}
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTime sx={{ color: '#43C6AC', fontSize: 18 }} />
                                <Typography variant="body2">
                                  <strong>Start:</strong> {formatDateTime(showtime.startTime)}
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTime sx={{ color: '#FF5E62', fontSize: 18 }} />
                                <Typography variant="body2">
                                  <strong>End:</strong> {formatDateTime(showtime.endTime)}
                                </Typography>
                              </Stack>
                            </Grid>
                          </Grid>
                          
                          {new Date(showtime.startTime) > new Date() && (
                            <Chip 
                              label="Upcoming" 
                              size="small" 
                              sx={{ 
                                mt: 1,
                                fontWeight: 'medium',
                                bgcolor: 'rgba(67, 198, 172, 0.1)',
                                color: '#43C6AC',
                                borderRadius: '12px'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      sx={{ mr: 8 }}
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Edit />}
                          component={Link}
                          to={`/showtimes/edit/${showtime.id}`}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2,
                            bgcolor: 'rgba(37, 117, 252, 0.1)',
                            color: '#2575fc',
                            borderColor: 'rgba(37, 117, 252, 0.3)',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              bgcolor: 'rgba(37, 117, 252, 0.15)',
                              borderColor: '#2575fc',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => confirmDelete(showtime)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2,
                            bgcolor: 'rgba(255, 94, 98, 0.1)',
                            color: '#FF5E62',
                            borderColor: 'rgba(255, 94, 98, 0.3)',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              bgcolor: 'rgba(255, 94, 98, 0.15)',
                              borderColor: '#FF5E62',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredShowtimes.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Fade>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Confirm Deletion</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the showtime for "{showtimeToDelete?.movieTitle}" at {showtimeToDelete?.theaterName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            variant="outlined" 
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained" 
            sx={{ borderRadius: 2 }}
          >
            Delete Showtime
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Box>
  );
};

export default ShowtimeList;