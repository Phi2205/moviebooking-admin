// SeatPriceList.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Fade,
  Paper,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
  alpha,
  Chip,
  AppBar,
  Toolbar,
  Container,
  CircularProgress
} from '@mui/material';
import {
  Edit, Delete, Search, MonetizationOn, Monitor, EventSeat, Add
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#0a0a0a', paper: '#111' },
    error: { main: '#f44336' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 }
  },
  shape: { borderRadius: 8 }
});

const SeatPriceList = () => {
  const [seatPrices, setSeatPrices] = useState([]);
  const [filteredSeatPrices, setFilteredSeatPrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seatPriceToDelete, setSeatPriceToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeatPrices();
  }, []);

  const fetchSeatPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/admin/seatprices');
      const result = await response.json();
      const prices = result.data || [];
      setSeatPrices(prices);
      setFilteredSeatPrices(prices);
    } catch (error) {
      toast.error('Không thể tải dữ liệu giá ghế.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredSeatPrices(seatPrices);
      return;
    }
    const filtered = seatPrices.filter((item) =>
      item.seatType?.toLowerCase().includes(value.toLowerCase()) ||
      getSeatTypeName(item.seatTypeId).toLowerCase().includes(value.toLowerCase()) ||
      item.screenId?.toString().includes(value)
    );
    setFilteredSeatPrices(filtered);
  };

  const confirmDelete = (seatPrice) => {
    console.log('Confirm delete:', seatPrice);
    setSeatPriceToDelete(seatPrice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Deleting:', seatPriceToDelete);
    try {
      await fetch(`http://localhost:8080/api/admin/seatprices/${seatPriceToDelete.seatPriceId}`, {
        method: 'DELETE',
      });
      toast.success('Đã xóa thành công.');
      setDeleteDialogOpen(false);
      fetchSeatPrices();
    } catch (error) {
      toast.error('Xóa không thành công.');
    }
  };

  const getSeatTypeName = (id) => {
    switch (id) {
      case 1: return 'Ghế thường';
      case 2: return 'Ghế VIP';
      case 3: return 'Ghế đôi';
      default: return 'Không xác định';
    }
  };

  const getSeatTypeColor = (id) => {
    switch (id) {
      case 1: return 'info';
      case 2: return 'secondary';
      case 3: return 'success';
      default: return 'default';
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" color="transparent" elevation={1}>
          <Toolbar>
            <EventSeat sx={{ mr: 1.5 }} color="primary" />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Quản lý giá ghế</Typography>
            <Button
              component={Link}
              to="/seatPrices/add"
              variant="contained"
              startIcon={<Add />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Thêm mới
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo loại ghế, Screen ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#151515',
                borderRadius: 2
              }
            }}
          />

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
            </Box>
          ) : filteredSeatPrices.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#1a1a1a' }}>
              <Typography>Không tìm thấy kết quả phù hợp.</Typography>
            </Paper>
          ) : (
            <Fade in timeout={500}>
              <Paper sx={{ borderRadius: 2, p: 0, overflow: 'hidden', bgcolor: '#151515' }}>
                <List>
                  {filteredSeatPrices.map((seat, index) => (
                    <React.Fragment key={seat.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          '&:hover': { backgroundColor: '#202020' },
                        }}
                        alignItems="flex-start"
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Chip label={getSeatTypeName(seat.seatTypeId)} color={getSeatTypeColor(seat.seatTypeId)} size="small" />
                              <Chip
                                label={seat.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                variant="outlined"
                                color={seat.isActive ? 'success' : 'error'}
                                size="small"
                              />
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <Monitor fontSize="small" sx={{ mr: 1 }} />
                                Phòng chiếu: {seat.screen?.screenNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                <EventSeat fontSize="small" sx={{ mr: 1 }} />
                                Rạp: {seat.screen?.theater?.name}
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 1, color: 'warning.main', fontWeight: 500 }}>
                                <MonetizationOn fontSize="small" sx={{ mr: 1 }} />
                                {seat.price?.toLocaleString()} VND
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Button
                              aria-label="Sửa"
                              component={Link}
                              to={`/seatPrices/edit/${seat.seatPriceId}`}
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<Edit />}
                            >
                              Sửa
                            </Button>
                            <Button
                              aria-label="Xóa"
                              onClick={() => confirmDelete(seat)}
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                            >
                              Xóa
                            </Button>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredSeatPrices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Fade>
          )}

          {/* Delete dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Xóa giá ghế</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Bạn có chắc chắn muốn xóa giá cho loại ghế{' '}
                <strong>{getSeatTypeName(seatPriceToDelete?.seatTypeId)}</strong>?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleDeleteConfirm} variant="contained" color="error">Xóa</Button>
            </DialogActions>
          </Dialog>

          <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default SeatPriceList;
