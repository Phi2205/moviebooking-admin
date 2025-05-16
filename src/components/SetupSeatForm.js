import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

import { Refresh } from '@mui/icons-material';

import { Save, ArrowBack, Add, ContentCopy } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const SeatSetupForm = () => {
  const { id: screenId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [seats, setSeats] = useState([]);
  const [selectedSeatType, setSelectedSeatType] = useState('available');
  const [initialSeats, setInitialSeats] = useState([]);
  const [showtimeList, setShowtimeList] = useState([]);

  // For template selection
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');

  // For zone selection
  const [zoneSelectionMode, setZoneSelectionMode] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [selectionType, setSelectionType] = useState('select'); // 'select' or 'paint'
  const [seatTypes, setSeatTypes] = useState({
    available: { price: 0, enabled: false },
    vip: { price: 0, enabled: false },
    couple: { price: 0, enabled: false },
  });
  const [seatTypesTemp, setSeatTypesTemp] = useState({
    available: { price: 0, enabled: false },
    vip: { price: 0, enabled: false },
    couple: { price: 0, enabled: false },
  });


  const seatColors = {
    available: '#4caf50',
    vip: '#ff9800',
    couple: '#ab47bc',
    supcouple: '#ab47bc',
    unavailable: '#e0e0e0',
  };

  const seatTypeMap = {
    available: 1,
    vip: 2,
    couple: 3,
    supcouple: 5,
    unavailable: 4,
  };
  const updateSeatType = (type, key, value) => {
    setSeatTypes(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      }
    }));
  };

  // Predefined templates
  const templates = {
    default: {
      name: "Default Empty",
      generate: (rowCount, colCount) => Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => 'available')
      )
    },
    standard: {
      name: "Standard Theater",
      generate: (rowCount, colCount) => {
        const template = Array.from({ length: rowCount }, () =>
          Array.from({ length: colCount }, () => 'available')
        );

        // VIP section in the middle
        const vipStartRow = Math.floor(rowCount / 3);
        const vipEndRow = Math.floor(2 * rowCount / 3);
        for (let i = vipStartRow; i <= vipEndRow; i++) {
          for (let j = 1; j < colCount - 1; j++) {
            template[i][j] = 'vip';
          }
        }

        return template;
      }
    },
    premium: {
      name: "Premium Theater",
      generate: (rowCount, colCount) => {
        const template = Array.from({ length: rowCount }, () =>
          Array.from({ length: colCount }, () => 'available')
        );

        // VIP section at the back
        const vipStartRow = Math.floor(rowCount / 2);
        for (let i = vipStartRow; i < rowCount; i++) {
          for (let j = 0; j < colCount; j++) {
            template[i][j] = 'vip';
          }
        }

        // Couple seats at the back corners
        if (rowCount > 2 && colCount > 3) {
          template[rowCount - 1][0] = 'couple';
          template[rowCount - 1][1] = 'supcouple';
          template[rowCount - 1][colCount - 2] = 'couple';
          template[rowCount - 1][colCount - 1] = 'supcouple';
        }

        return template;
      }
    },
    intimate: {
      name: "Intimate Theater",
      generate: (rowCount, colCount) => {
        const template = Array.from({ length: rowCount }, () =>
          Array.from({ length: colCount }, () => 'available')
        );

        // Center aisle
        const centerCol = Math.floor(colCount / 2);
        for (let i = 0; i < rowCount; i++) {
          template[i][centerCol] = 'unavailable';
        }

        // Couple seats at the back
        const backRow = rowCount - 1;
        for (let j = 0; j < colCount - 1; j += 2) {
          if (j !== centerCol && j + 1 !== centerCol) {
            template[backRow][j] = 'couple';
            template[backRow][j + 1] = 'supcouple';
          }
        }

        return template;
      }
    }
  };

  const isSeatsChanged = () => {
    const seatList = getSeatList();
    console.log('Initial Seats:', initialSeats);
    console.log('Current Seats:', seatList);
    if (seatTypes !== seatTypesTemp) {
      return true;
    }
    if (initialSeats.length !== seatList.length) {
      console.log('Number of seats changed:', initialSeats.length, seatList.length);
      return true;
    }
    for (let i = 0; i < initialSeats.length; i++) {
      if (
        initialSeats[i].row !== seatList[i].row ||
        initialSeats[i].column !== seatList[i].column ||
        initialSeats[i].seatTypeId !== seatList[i].seatTypeId
      ) {
        console.log('Seat changed:', initialSeats[i], seatList[i]);
        return true;
      }
    }
    return false;
  };


  // useEffect(() => {
  //   const fetchSeatPrices = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:8080/api/admin/seatprices/screen/${screenId}`);
  //       if (!response.ok) throw new Error('Lỗi khi tải giá ghế');

  //       const seatPriceData = await response.json();

  //       // setSeatTypesTemp(seatPriceData.seatTypes);
  //       seatTypes['available'].price = seatPriceData.seatTypes.available.price;
  //       seatTypes['vip'].price = seatPriceData.seatTypes.vip.price;     
  //       seatTypes['couple'].price = seatPriceData.seatTypes.couple.price;

  //       console.log("seatTypes từ API:", seatPriceData.seatTypes);
  //       setPrice(seats);

  //     } catch (error) {
  //       console.error('Lỗi khi tải giá ghế:', error);
  //       alert('Không thể tải giá ghế. Vui lòng thử lại sau.');
  //     }
  //   };
  //   fetchSeatPrices();
  // }, [screenId]);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        try {
          const response = await fetch(`http://localhost:8080/api/admin/seatprices/screen/${screenId}`);
          if (!response.ok) throw new Error('Lỗi khi tải giá ghế');

          const seatPriceData = await response.json();

          setSeatTypesTemp(seatPriceData.seatTypes);
          seatTypes['available'].price = seatPriceData.seatTypes.available.price;
          seatTypes['vip'].price = seatPriceData.seatTypes.vip.price;
          seatTypes['couple'].price = seatPriceData.seatTypes.couple.price;

          console.log("seatTypes từ API:", seatPriceData.seatTypes);

        } catch (error) {
          console.error('Lỗi khi tải giá ghế:', error);
          alert('Không thể tải giá ghế. Vui lòng thử lại sau.');
        }
        const response = await fetch(`http://localhost:8080/api/admin/screens/${screenId}/seats`);
        if (!response.ok) throw new Error('Lỗi khi tải danh sách ghế');
        const data = await response.json();

        const maxRow = Math.max(...data.map((seat) => seat.row.charCodeAt(0) - 65 + 1));
        let maxCol = Math.max(...data.map((seat) => seat.column)); // chú ý để `let`, không phải `const`

        // Khởi tạo newSeats ban đầu
        const newSeats = Array.from({ length: maxRow }, () =>
          Array.from({ length: maxCol }, () => 'unavailable')
        );

        // Map dữ liệu từ API vào newSeats
        data.forEach(({ row, column, seatTypeId }) => {
          const rowIndex = row.charCodeAt(0) - 65;
          const colIndex = column - 1;
          const type = Object.keys(seatTypeMap).find((key) => seatTypeMap[key] === seatTypeId);
          if (type) newSeats[rowIndex][colIndex] = type;
        });

        // Check nếu cột cuối có ghế couple -> thêm 1 cột vào tất cả hàng
        let needAddCol = false;
        for (let i = 0; i < maxRow; i++) {
          if (newSeats[i][maxCol - 1] === 'couple') {
            needAddCol = true;
            break;
          }
        }
        if (needAddCol) {
          maxCol += 1; // update maxCol
          for (let i = 0; i < maxRow; i++) {
            newSeats[i].push('unavailable'); // thêm ghế unavailable vào cuối mỗi hàng
          }
        }

        // Tiếp theo: gán supcouple cho ghế bên cạnh ghế couple
        for (let i = 0; i < maxRow; i++) {
          for (let j = 0; j < maxCol; j++) {
            if (newSeats[i][j] === 'couple') {
              newSeats[i][j + 1] = 'supcouple';
            }
          }
        }

        // Clean nếu cần
        let cleanedSeats = [...newSeats];
        const isFirstRowUnavailable = cleanedSeats[0]?.every(cell => cell === 'unavailable');
        if (isFirstRowUnavailable) cleanedSeats = cleanedSeats.slice(1);
        const isFirstColUnavailable = cleanedSeats.every(row => row[0] === 'unavailable');
        if (isFirstColUnavailable) cleanedSeats = cleanedSeats.map(row => row.slice(1));


        // const responseSeatPrice = await fetch(`http://localhost:8080/api/admin/seatprices/screen/${screenId}`);
        // if (!responseSeatPrice.ok) throw new Error('Lỗi khi tải giá ghế');
        // const seatPriceData = await responseSeatPrice.json();
        // setSeatTypes(seatPriceData.seatTypes);
        // console.log("seatTypes:", seatTypes);
        setRows(cleanedSeats.length);
        setCols(cleanedSeats[0]?.length || 0);
        setSeats(cleanedSeats);
        setInitialSeats(data);

        setPrice(newSeats);


      } catch (error) {
        console.error('Lỗi tải dữ liệu ghế:', error);
        const fallback = Array.from({ length: 5 }, () =>
          Array.from({ length: 8 }, () => 'available')
        );

        setSeats(fallback);
      }
    };

    const fetchShowtimes = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/showtimes`);
        if (!response.ok) throw new Error('Lỗi khi tải danh sách suất chiếu');
        const data = await response.json();
        setShowtimeList(data);
        console.log('showtimeList 1:', showtimeList);
      } catch (error) {
        console.error('Lỗi tải danh sách showtime:', error);
      }
    };

    fetchSeats();
    fetchShowtimes();

  }, [screenId]);


  const updateRows = (newRowCount) => {
    setRows(newRowCount);
    setSeats((prevSeats) => {
      const updated = [...prevSeats];
      while (updated.length < newRowCount) {
        updated.push(Array.from({ length: cols }, () => 'available'));
      }
      if (updated.length > newRowCount) {
        updated.splice(newRowCount);
      }
      return updated;
    });
  };

  const updateCols = (newColCount) => {
    setCols(newColCount);
    setSeats((prevSeats) =>
      prevSeats.map((row) => {
        const newRow = [...row];
        while (newRow.length < newColCount) {
          newRow.push('available');
        }
        if (newRow.length > newColCount) {
          newRow.splice(newColCount);
        }
        if (newRow[newColCount - 1] === 'couple') {
          newRow[newColCount - 1] = 'available';
        }

        return newRow;
      })
    );
  };

  const handleSeatTypeSelect = (type) => {
    setSelectedSeatType(type);
  };

  const setPrice = (seatE) => {
    console.log('SeatE:', seatE);
    seatTypes['available'].enabled = false;
    seatTypes['vip'].enabled = false;
    seatTypes['couple'].enabled = false;
    for (let i = 0; i < seatE.length; i++) {
      for (let j = 0; j < seatE[i].length; j++) {
        if (seatE[i][j] === 'couple') {
          updateSeatType("couple", "enabled", true);
        } else if (seatE[i][j] === 'vip') {
          updateSeatType("vip", "enabled", true);

        } else if (seatE[i][j] === 'available') {
          updateSeatType("available", "enabled", true);
        }
        console.log('seatTypes:', seatE[i][j]);
      }
    }
    console.log('reload');
    console.log('seatTypes:', seatTypes);
  }

  const handleSeatClick = (rowIndex, colIndex) => {
    if (zoneSelectionMode) {
      // In zone selection mode, we're either setting the start or end point
      if (!startCell) {
        setStartCell({ row: rowIndex, col: colIndex });
      } else if (!endCell) {
        setEndCell({ row: rowIndex, col: colIndex });
        // Once we have both points, apply the selected seat type to the entire zone
        applySeatTypeToZone(startCell, { row: rowIndex, col: colIndex });
        // Reset the selection process
        setStartCell(null);
        setEndCell(null);
      }
    } else {
      // Regular single seat selection mode
      const newSeats = [...seats.map((r) => [...r])];

      if (selectedSeatType === 'couple') {
        if (
          colIndex < cols - 1 &&
          newSeats[rowIndex][colIndex + 1] !== 'supcouple' &&
          newSeats[rowIndex][colIndex + 1] !== 'couple' &&
          newSeats[rowIndex][colIndex] !== 'supcouple'
        ) {
          newSeats[rowIndex][colIndex] = 'couple';
          newSeats[rowIndex][colIndex + 1] = 'supcouple';
        } else {
          alert('Ghế đôi phải chọn 2 ghế trống liền kề!');
        }
      } else {
        if (newSeats[rowIndex][colIndex] === 'couple') {
          newSeats[rowIndex][colIndex] = selectedSeatType;
          newSeats[rowIndex][colIndex + 1] = selectedSeatType;
        } else if (newSeats[rowIndex][colIndex] === 'supcouple') {
          newSeats[rowIndex][colIndex] = selectedSeatType;
          newSeats[rowIndex][colIndex - 1] = selectedSeatType;
        } else {
          newSeats[rowIndex][colIndex] = selectedSeatType;
        }
      }

      setSeats(newSeats);
      setPrice(newSeats);
    }

    console.log('seatTypes:', seatTypes);
  };

  // Apply the selected seat type to a zone defined by start and end points
  const applySeatTypeToZone = (start, end) => {
    const newSeats = [...seats.map((r) => [...r])];

    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    // Apply the selected seat type to all seats in the zone
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        if (selectedSeatType === 'couple') {
          // For couple seats, we need to handle them specially
          if (j < cols - 1 &&
            // j % 2 === 0 && // Only start couple seats at even column indexes
            newSeats[i][j] !== 'supcouple' &&
            newSeats[i][j + 1] !== 'couple') {
            newSeats[i][j] = 'couple';
            newSeats[i][j + 1] = 'supcouple';
          }
        } else {
          // For other seat types
          if (newSeats[i][j] === 'couple') {
            newSeats[i][j] = selectedSeatType;
            if (j < cols - 1 && newSeats[i][j + 1] === 'supcouple') {
              newSeats[i][j + 1] = selectedSeatType;
            }
          } else if (newSeats[i][j] === 'supcouple') {
            newSeats[i][j] = selectedSeatType;
            if (j > 0 && newSeats[i][j - 1] === 'couple') {
              newSeats[i][j - 1] = selectedSeatType;
            }
          } else {
            newSeats[i][j] = selectedSeatType;
          }
        }
      }
    }
    setPrice(newSeats);
    setSeats(newSeats);
  };

  const getSeatList = () => {
    const seatList = [];
    seats.forEach((rowSeats, rowIndex) => {
      rowSeats.forEach((seatType, colIndex) => {
        const seatTypeId = seatTypeMap[seatType];
        if ([1, 2, 3].includes(seatTypeId)) {
          const rowLetter = String.fromCharCode(65 + rowIndex);
          seatList.push({
            screenId: screenId,
            row: rowLetter,
            column: colIndex + 1,
            seatTypeId: seatTypeId,
          });
        }
      });
    });
    return seatList;
  };

  const handleSubmit = async () => {
    for (let i = 0; i < showtimeList.length; i++) {
      if (showtimeList[i].screenId == screenId) {
        alert('Không thể thay đổi ghế khi có suất chiếu đã được tạo!');
        return;
      }
    }
    if (!isSeatsChanged()) {
      alert('Không có thay đổi, không cần lưu.');
      navigate('/screens');
      return;
    }
    if (window.confirm('Bạn có chắc muốn lưu cấu hình ghế này không?')) {
      const seatList = getSeatList(); // seatList: danh sách các ghế
      const payload = {
        rows,
        cols,
        listSeats: seatList
      };
      console.log('Payload:', payload); // Kiểm tra payload trước khi gửi
      try {
        const response = await fetch(`http://localhost:8080/api/admin/screens/${screenId}/setupSeats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload), // Gửi payload đầy đủ
        });

        if (!response.ok) throw new Error('Lưu ghế thất bại');
        const seatTypeRes = await fetch(`http://localhost:8080/api/admin/seatprices/screen/${screenId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ seatTypes }),
        });
        console.log('seatType:', seatTypes);
        if (!seatTypeRes.ok) throw new Error('Lưu loại ghế thất bại');

        alert('Lưu cấu hình và loại ghế thành công!');
        navigate('/screens');
      } catch (error) {
        console.error('Error submitting seats:', error);
        alert('Có lỗi xảy ra khi lưu ghế!');
      }
    }
  };

  // Open the template selection dialog
  const openTemplateDialog = () => {
    setTemplateDialogOpen(true);
  };

  // Close the template selection dialog
  const closeTemplateDialog = () => {
    setTemplateDialogOpen(false);
  };

  // Apply the selected template
  const applyTemplate = () => {
    if (templates[selectedTemplate]) {
      const newSeats = templates[selectedTemplate].generate(rows, cols);
      setSeats(newSeats);
      closeTemplateDialog();
    }
  };

  // Toggle zone selection mode
  const toggleZoneSelectionMode = () => {
    setZoneSelectionMode(prevMode => !prevMode);
    // Reset selection points when toggling
    setStartCell(null);
    setEndCell(null);
  };

  // Render cell with appropriate styling based on selection state
  const renderSeatCell = (seat, rowIndex, colIndex) => {
    let isSelected = false;
    let isInSelection = false;

    // Check if this cell is the start point of zone selection
    if (startCell && startCell.row === rowIndex && startCell.col === colIndex) {
      isSelected = true;
    }

    // Check if this cell is within the selected zone (when we have both start and end points)
    if (startCell && endCell) {
      const minRow = Math.min(startCell.row, endCell.row);
      const maxRow = Math.max(startCell.row, endCell.row);
      const minCol = Math.min(startCell.col, endCell.col);
      const maxCol = Math.max(startCell.col, endCell.col);

      if (rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol) {
        isInSelection = true;
      }
    }

    return (
      <Button
        variant="contained"
        sx={{
          width: 40,
          height: 40,
          bgcolor: seatColors[seat],
          '&:hover': {
            bgcolor: seatColors[seat],
            opacity: 0.8,
          },
          border: isSelected ? '3px solid #1976d2' :
            isInSelection ? '2px dashed #1976d2' :
              '1px solid white',
          px: seat === 'couple' ? 2 : 0,
          position: 'relative',
        }}
        onClick={() => handleSeatClick(rowIndex, colIndex)}
      >
        {String.fromCharCode(65 + rowIndex)}
        {colIndex + 1}
      </Button>
    );
  };



  return (
    <Box sx={{ p: 4, bgcolor: '#121212', color: '#fff' }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1e1e1e', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" mb={2} color="primary">
          Setup Seats for Screen ID {screenId}
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant={selectedSeatType === 'available' ? 'contained' : 'outlined'}
            onClick={() => handleSeatTypeSelect('available')}
            color="primary"
          >
            Ghế Thường
          </Button>
          <Button
            variant={selectedSeatType === 'vip' ? 'contained' : 'outlined'}
            onClick={() => handleSeatTypeSelect('vip')}
            color="secondary"
          >
            Ghế VIP
          </Button>
          <Button
            variant={selectedSeatType === 'couple' ? 'contained' : 'outlined'}
            onClick={() => handleSeatTypeSelect('couple')}
            color="info"
          >
            Ghế Couple
          </Button>
          <Button
            variant={selectedSeatType === 'unavailable' ? 'contained' : 'outlined'}
            onClick={() => handleSeatTypeSelect('unavailable')}
            color="error"
          >
            Không Có Ghế
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} mb={3} alignItems="center">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ContentCopy />}
            onClick={openTemplateDialog}
          >
            Chọn Template
          </Button>

          <Button
            variant={zoneSelectionMode ? "contained" : "outlined"}
            color={zoneSelectionMode ? "success" : "primary"}
            onClick={toggleZoneSelectionMode}
          >
            {zoneSelectionMode ? "Đang Chọn Vùng" : "Chọn Vùng"}
          </Button>

          {zoneSelectionMode && (
            <Typography variant="body2" color="#fff">
              {!startCell
                ? "Chọn điểm bắt đầu"
                : !endCell
                  ? "Chọn điểm kết thúc"
                  : "Đang áp dụng..."}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={4} alignItems="center" mb={3}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Typography fontWeight="bold" color="#e0e0e0">Hàng (Rows):</Typography>
            <Button variant="outlined" sx={{ minWidth: 40, fontSize: 20 }} onClick={() => updateRows(Math.max(1, rows - 1))}>−</Button>
            <Typography variant="h6" width={30} textAlign="center" color="#e0e0e0">{rows}</Typography>
            <Button variant="outlined" sx={{ minWidth: 40, fontSize: 20 }} onClick={() => updateRows(rows + 1)}>＋</Button>
          </Stack>

          <Stack spacing={1} direction="row" alignItems="center">
            <Typography fontWeight="bold" color="#e0e0e0">Cột (Cols):</Typography>
            <Button variant="outlined" sx={{ minWidth: 40, fontSize: 20 }} onClick={() => updateCols(Math.max(1, cols - 1))}>−</Button>
            <Typography variant="h6" width={30} textAlign="center" color="#e0e0e0">{cols}</Typography>
            <Button variant="outlined" sx={{ minWidth: 40, fontSize: 20 }} onClick={() => updateCols(cols + 1)}>＋</Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} mb={3}>
          <FormControl>
            <InputLabel sx={{ color: "#aaa" }}>Rows</InputLabel>
            <OutlinedInput
              type="number"
              value={rows}
              onChange={(e) => updateRows(Number(e.target.value))}
              label="Rows"
              sx={{
                color: "#fff",
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#777'
                }
              }}
            />
          </FormControl>
          <FormControl>
            <InputLabel sx={{ color: "#aaa" }}>Columns</InputLabel>
            <OutlinedInput
              type="number"
              value={cols}
              onChange={(e) => updateCols(Number(e.target.value))}
              label="Columns"
              sx={{
                color: "#fff",
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#777'
                }
              }}
            />
          </FormControl>
        </Stack>

        <Grid container direction="column" spacing={1}>
          {seats.map((row, rowIndex) => (
            <Grid key={rowIndex} container item spacing={1} justifyContent="center">
              {row.map((seat, colIndex) => (
                <Grid item key={colIndex}>
                  {renderSeatCell(seat, rowIndex, colIndex)}
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
        <Box mt={2} />
        <Stack direction="row" spacing={3} mb={3} alignItems="center">
          {['available', 'vip', 'couple'].map(type => (
            seatTypes[type].enabled && (  // Chỉ render form khi 'enabled' là true
              <Stack key={type} spacing={1} alignItems="flex-start">
                <FormControl>
                  <InputLabel sx={{ color: "#aaa" }}>
                    Giá {type === 'available' ? 'Thường' : type === 'vip' ? 'VIP' : 'Couple'}
                  </InputLabel>
                  <OutlinedInput
                    type="number"
                    value={seatTypes[type].price}
                    onChange={(e) => updateSeatType(type, 'price', e.target.value)}
                    label={`Giá ${type}`}
                    startAdornment={<Typography sx={{ mr: 1, color: '#aaa' }}>₫</Typography>}
                    sx={{
                      color: "#fff",
                      width: 140,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#555'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#777'
                      }
                    }}
                    disabled={!seatTypes[type].enabled}  // Disable input when 'enabled' is false
                  />
                </FormControl>
              </Stack>
            )
          ))}
        </Stack>
        <IconButton
          onClick={() => setPrice(seats)}
          color="secondary"
          size="small"
          sx={{ bgcolor: "#333", "&:hover": { bgcolor: "#444" } }}
        >
          <Refresh fontSize="small" />
        </IconButton>


        <Stack direction="row" justifyContent="space-between" mt={4}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/screens')} color="primary">
            Back
          </Button>
          <Button variant="contained" color="primary" endIcon={<Save />} onClick={handleSubmit}>
            Save Configuration
          </Button>
        </Stack>


      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#1e1e1e', color: '#fff' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
          Legend
        </Typography>
        <Stack direction="row" spacing={4}>
          {Object.entries(seatColors).map(([status, color]) => (
            <Stack direction="row" alignItems="center" spacing={1} key={status}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: color,
                  borderRadius: 0.5,
                  border: '1px solid #555',
                }}
              />
              <Typography variant="body2" color="#e0e0e0">{status}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* Template Selection Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={closeTemplateDialog}
        PaperProps={{
          style: {
            backgroundColor: '#1e1e1e',
            color: '#fff'
          }
        }}
      >
        <DialogTitle color="primary">Chọn Template Ghế</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#aaa" sx={{ mb: 2 }}>
            Lựa chọn template sẽ thay đổi cấu hình hiện tại của bạn.
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ color: "#aaa" }}>Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              label="Template"
              sx={{
                color: "#fff",
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#777'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3f51b5'
                }
              }}
            >
              {Object.entries(templates).map(([key, template]) => (
                <MenuItem
                  key={key}
                  value={key}
                  sx={{
                    color: "#333",
                    "&:hover": {
                      backgroundColor: "#333",
                      color: "#fff",  // <-- thêm dấu #
                    },
                  }}
                >{template.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="#e0e0e0">Chi tiết template:</Typography>
            {selectedTemplate === 'default' && (
              <Typography variant="body2" color="#bbb">
                Tất cả ghế là ghế thường, không có ghế VIP hay ghế đôi.
              </Typography>
            )}
            {selectedTemplate === 'standard' && (
              <Typography variant="body2" color="#bbb">
                Phần giữa rạp là ghế VIP, xung quanh là ghế thường, không có ghế đôi.
              </Typography>
            )}
            {selectedTemplate === 'premium' && (
              <Typography variant="body2" color="#bbb">
                Nửa sau của rạp là ghế VIP, phía trước là ghế thường. Có ghế đôi ở góc cuối cùng.
              </Typography>
            )}
            {selectedTemplate === 'intimate' && (
              <Typography variant="body2" color="#bbb">
                Có lối đi ở giữa rạp. Hàng cuối chủ yếu là ghế đôi, các hàng còn lại là ghế thường.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTemplateDialog} sx={{ color: "#aaa" }}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={applyTemplate}>Áp Dụng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatSetupForm;