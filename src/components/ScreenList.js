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
  Stack,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Add, Delete, Edit, Search, MeetingRoom, EventSeat, MonetizationOn } from '@mui/icons-material';
import 'react-toastify/dist/ReactToastify.css';

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
  },
});

const ScreenList = () => {
  const [screens, setScreens] = useState([]);
  const [filteredScreens, setFilteredScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState(null);
  // const [editPriceDialogOpen, setEditPriceDialogOpen] = useState(false);
  const [screenToEdit, setScreenToEdit] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    fetchScreens();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredScreens(
        screens.filter(
          (screen) =>
            screen.theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            screen.screenNumber.toString().includes(searchTerm)
        )
      );
    } else {
      setFilteredScreens(screens);
    }
  }, [screens, searchTerm]);

  const fetchScreens = () => {
    setLoading(true);
    axios
      .get('http://localhost:8080/api/admin/screens')
      .then((response) => {
        setScreens(response.data);
        setFilteredScreens(response.data);
      })
      .catch(() => {
        toast.error('Lỗi khi tải danh sách phòng chiếu');
      })
      .finally(() => setLoading(false));
  };

  const confirmDelete = (screen) => {
    setScreenToDelete(screen);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (screenToDelete) {
      axios
        .delete(`http://localhost:8080/api/admin/screens/${screenToDelete.id}`)
        .then(() => {
          setScreens((prev) => prev.filter((s) => s.id !== screenToDelete.id));
          toast.success('Đã xóa phòng chiếu thành công');
          setDeleteDialogOpen(false);
        })
        .catch(() => toast.error('Lỗi khi xóa phòng chiếu'));
    }
  };

  // const openEditPriceDialog = (screen) => {
  //   setScreenToEdit(screen);
  //   setNewPrice(screen.price || '');
  //   setEditPriceDialogOpen(true);
  // };

  const handlePriceSave = () => {
    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    axios
      .put(`http://localhost:8080/api/admin/screens/${screenToEdit.id}/update-price`, { price: parsedPrice })
      .then(() => {
        setScreens((prev) =>
          prev.map((s) => (s.id === screenToEdit.id ? { ...s, price: parsedPrice } : s))
        );
        toast.success('Cập nhật giá thành công');
        // setEditPriceDialogOpen(false);
      })
      .catch(() => toast.error('Lỗi khi cập nhật giá'));
  };

  const totalSeats = screens.reduce((sum, screen) => sum + screen.totalSeats, 0);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ p: 3, bgcolor: '#121212', minHeight: '100vh' }}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(45deg, #ff5252, #ff9100)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" color="white" fontWeight="bold">
                Quản lý phòng chiếu
              </Typography>
              <Typography variant="subtitle1" color="rgba(255,255,255,0.85)">
                Xem và quản lý phòng chiếu cho từng rạp
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/screens/add"
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.3)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)',
                },
              }}
            >
              Thêm phòng chiếu
            </Button>
          </Stack>
        </Paper>

        {/* Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, bgcolor: '#1e1e1e' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#ff5252', width: 56, height: 56 }}>
                    <MeetingRoom />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{screens.length}</Typography>
                    <Typography color="text.secondary">Tổng số phòng chiếu</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, bgcolor: '#1e1e1e' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#ff9100', width: 56, height: 56 }}>
                    <EventSeat />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{totalSeats}</Typography>
                    <Typography color="text.secondary">Tổng số ghế</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <Paper sx={{ p: 1.5, mb: 4, borderRadius: 3, display: 'flex', alignItems: 'center', bgcolor: '#1e1e1e' }}>
          <Search sx={{ mx: 1.5, color: '#ff9100' }} />
          <TextField
            fullWidth
            placeholder="Tìm theo tên rạp hoặc số phòng..."
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '1.1rem' },
            }}
          />
        </Paper>

        {/* Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress size={60} sx={{ color: '#ff5252' }} />
          </Box>
        ) : filteredScreens.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#1e1e1e' }}>
            <MeetingRoom sx={{ fontSize: 80, color: '#444' }} />
            <Typography variant="h5" mt={2}>
              Không tìm thấy phòng chiếu nào
            </Typography>
          </Paper>
        ) : (
          <Fade in={!loading}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, bgcolor: '#1e1e1e' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255, 82, 82, 0.1)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã phòng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rạp chiếu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Số phòng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng ghế</TableCell>

                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredScreens.map((screen) => (
                    <TableRow key={screen.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 145, 0, 0.05)' } }}>
                      <TableCell>{screen.id}</TableCell>
                      <TableCell>{screen.theater?.name || 'N/A'}</TableCell>
                      <TableCell>{screen.screenNumber}</TableCell>
                      <TableCell>{screen.totalSeats}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {/* <IconButton
                            onClick={() => openEditPriceDialog(screen)}
                            sx={{ color: '#4caf50' }}
                            size="small"
                          >
                            <MonetizationOn />
                          </IconButton> */}
                          <IconButton
                            component={Link}
                            to={`/screens/edit/${screen.id}`}
                            sx={{ color: '#ff9100' }}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            component={Link}
                            to={`/screens/${screen.id}/setupSeats`}
                            sx={{ color: '#ff9100' }}
                            size="small"
                          >
                            <EventSeat />
                          </IconButton>
                          <IconButton
                            onClick={() => confirmDelete(screen)}
                            sx={{ color: '#ff5252' }}
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
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc muốn xóa phòng chiếu có mã {screenToDelete?.id}? Hành động này không thể hoàn tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
              Hủy
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Price Dialog
        <Dialog open={editPriceDialogOpen} onClose={() => setEditPriceDialogOpen(false)}>
          <DialogTitle>Chỉnh sửa giá vé</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Giá vé mới"
              type="number"
              fullWidth
              variant="standard"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditPriceDialogOpen(false)} variant="outlined">
              Hủy
            </Button>
            <Button onClick={handlePriceSave} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog> */}

        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </Box>
    </ThemeProvider>
  );
};

export default ScreenList;
