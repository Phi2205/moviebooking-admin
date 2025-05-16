import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  createTheme,
  ThemeProvider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tv } from "lucide-react";
import {
  Add,
  Edit,
  Delete,
  Search,
  VideoSettings,
  LocationOn,
  EventSeat,
  Movie,
  Theaters
} from '@mui/icons-material';

// Cinema-inspired dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff5252',
    },
    secondary: {
      main: '#ff9100',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
});

const TheaterList = () => {
  const [theaters, setTheaters] = useState([]);
  const [filteredTheaters, setFilteredTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [theaterToDelete, setTheaterToDelete] = useState(null);

  useEffect(() => {
    fetchTheaters();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTheaters(theaters.filter(theater => 
        theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theater.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theater.city.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredTheaters(theaters);
    }
  }, [theaters, searchTerm]);

  const fetchTheaters = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/admin/theaters')
      .then(response => {
        setTheaters(response.data);
        setFilteredTheaters(response.data);
      })
      .catch(error => {
        toast.error('Lỗi khi tải dữ liệu rạp chiếu phim');
      })
      .finally(() => setLoading(false));
  };

  const confirmDelete = (theater) => {
    setTheaterToDelete(theater);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (theaterToDelete) {
      axios.delete(`http://localhost:8080/api/admin/theaters/${theaterToDelete.id}`)
        .then(() => {
          setTheaters(prev => prev.filter(theater => theater.id !== theaterToDelete.id));
          toast.success('Đã xóa rạp chiếu phim thành công');
          setDeleteDialogOpen(false);
        })
        .catch(error => {
          toast.error('Lỗi khi xóa rạp chiếu phim');
        });
    }
  };

  // Stats calculation
  const totalScreens = theaters.reduce((sum, theater) => sum + theater.totalScreens, 0);
  const uniqueCities = new Set(theaters.map(theater => theater.city)).size;

  // Function to generate gradient avatar background color based on theater name
  const getGradientColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #FF5252, #9C27B0)',
      'linear-gradient(135deg, #FF9100, #FF5252)',
      'linear-gradient(135deg, #651FFF, #D500F9)',
      'linear-gradient(135deg, #FF6D00, #FF3D00)',
      'linear-gradient(135deg, #00B0FF, #2979FF)',
      'linear-gradient(135deg, #00E676, #00C853)'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ p: 3, bgcolor: '#121212', minHeight: '100vh' }}>
        {/* Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 4, 
            borderRadius: 3, 
            background: 'linear-gradient(45deg, #FF5252 0%, #FF9100 100%)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
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
                  textShadow: '0 2px 10px rgba(0,0,0,0.25)'
                }}
              >
                <VideoSettings sx={{ mr: 1.5, fontSize: 35 }} />
                Theater Management
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.85)' }}>
                Manage all theaters and screens in one place
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/theaters/add"
              sx={{ 
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.25)',
                color: 'white',
                px: 3,
                '&:hover': { 
                  bgcolor: 'rgba(0,0,0,0.4)',
                }
              }}
            >
              Add New Theater
            </Button>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              bgcolor: '#1e1e1e',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
              '&:hover': {
                transform: 'translateY(-5px)',
                transition: 'transform 0.3s ease'
              }
            }}>
              <Box sx={{ height: 5, bgcolor: '#FF5252' }} />
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 82, 82, 0.9)', 
                    width: 60, 
                    height: 60,
                    boxShadow: '0 4px 14px rgba(255, 82, 82, 0.4)'
                  }}>
                    <Theaters sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{theaters.length}</Typography>
                    <Typography variant="body1" color="text.secondary">Total Theaters</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              bgcolor: '#1e1e1e',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
              '&:hover': {
                transform: 'translateY(-5px)',
                transition: 'transform 0.3s ease'
              }
            }}>
              <Box sx={{ height: 5, bgcolor: '#FF9100' }} />
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 145, 0, 0.9)', 
                    width: 60, 
                    height: 60,
                    boxShadow: '0 4px 14px rgba(255, 145, 0, 0.4)'
                  }}>
                    <LocationOn sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{uniqueCities}</Typography>
                    <Typography variant="body1" color="text.secondary">Cities</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              bgcolor: '#1e1e1e',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
              '&:hover': {
                transform: 'translateY(-5px)',
                transition: 'transform 0.3s ease'
              }
            }}>
              <Box sx={{ height: 5, bgcolor: '#651FFF' }} />
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'rgba(101, 31, 255, 0.9)', 
                    width: 60, 
                    height: 60,
                    boxShadow: '0 4px 14px rgba(101, 31, 255, 0.4)'
                  }}>
                    <EventSeat sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{totalScreens}</Typography>
                    <Typography variant="body1" color="text.secondary">Total Screens</Typography>
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
          bgcolor: '#1e1e1e',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
        }}>
          <Search sx={{ mx: 1.5, color: '#FF9100' }} />
          <TextField
            fullWidth
            placeholder="Search theaters by name, address or city..."
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
            <CircularProgress size={60} thickness={5} sx={{ color: '#FF5252' }} />
            <Typography variant="h6" color="text.secondary" mt={2}>
              Loading data...
            </Typography>
          </Box>
        ) : filteredTheaters.length === 0 ? (
          <Fade in={!loading}>
            <Paper sx={{ 
              p: 5, 
              textAlign: 'center', 
              borderRadius: 3,
              bgcolor: '#1e1e1e',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            }}>
              <Movie sx={{ fontSize: 80, color: '#666', mb: 3 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                No theaters found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please adjust your search or add a new theater
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Fade in={!loading}>
            <TableContainer component={Paper} sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              bgcolor: '#1e1e1e',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255, 82, 82, 0.15)' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>Tên Rạp</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Địa Điểm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Thành Phố</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Màn Hình</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Thao Tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTheaters.map((theater) => (
                    <TableRow 
                      key={theater.id} 
                      sx={{ 
                        '&:hover': { 
                          bgcolor: 'rgba(255, 82, 82, 0.08)',
                          '& .MuiIconButton-root': { opacity: 1 }
                        },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            sx={{ 
                              background: getGradientColor(theater.name),
                              width: 45,
                              height: 45,
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                            }}
                          >
                            {theater.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">{theater.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {theater.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOn fontSize="small" sx={{ color: '#FF9100' }} />
                          <Typography>{theater.address}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={theater.city} 
                          size="small" 
                          sx={{ 
                            fontWeight: 'medium',
                            bgcolor: 'rgba(255, 82, 82, 0.15)',
                            color: '#FF5252',
                            borderRadius: '12px',
                            py: 0.5
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Tv style={{ width: 20, height: 20, color: '#FF9100' }} />
                          <Typography>
                            {theater.totalScreens} {theater.totalScreens === 1 ? 'màn hình' : 'màn hình'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            component={Link} 
                            to={`/theaters/edit/${theater.id}`} 
                            sx={{ 
                              color: '#FF9100',
                              bgcolor: 'rgba(255, 145, 0, 0.1)',
                              opacity: 0.8,
                              '&:hover': { 
                                bgcolor: 'rgba(255, 145, 0, 0.2)',
                                transform: 'scale(1.05)'
                              }
                            }}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => confirmDelete(theater)} 
                            sx={{ 
                              color: '#FF5252',
                              bgcolor: 'rgba(255, 82, 82, 0.1)',
                              opacity: 0.8,
                              '&:hover': { 
                                bgcolor: 'rgba(255, 82, 82, 0.2)',
                                transform: 'scale(1.05)'
                              }
                            }}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}

        {/* Delete Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: '#1e1e1e',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">Confirm Deletion</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the theater "{theaterToDelete?.name}"? This action cannot be undone.
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
              Delete Theater
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          theme="dark"
        />
      </Box>
    </ThemeProvider>
  );
};

export default TheaterList;