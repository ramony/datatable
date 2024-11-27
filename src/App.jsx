import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  Snackbar,
  Pagination,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Config from './Config';

const ROWS_PER_PAGE = 100;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const formatters = {
  sizeFormat,
  dateFormat
}

function sizeFormat(size) {
  if (size < 1024) {
    return size + " B";
  } else if (size < Math.pow(1024, 2)) {
    return (size / Math.pow(1024, 1)).toFixed(2) + " KB";
  } else if (size < Math.pow(1024, 3)) {
    return (size / Math.pow(1024, 2)).toFixed(2) + " MB";
  } else {
    return (size / Math.pow(1024, 3)).toFixed(2) + " GB";
  }
}

function dateFormat(ts) {
  const date = new Date(Number(ts));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function App() {
  const [tableData, setTableData] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('desc');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(Config.jsonDataPath)
      .then(response => response.json())
      .then(data => {
        setTableData(data);
        if (data.headers && data.headers.length > 0) {
          setOrderBy(data.headers[data.headers.length - 1].id);
        }
      })
      .catch(error => {
        console.error('Error loading data:', error);
        let data = { headers: [], data: [] };
        setTableData(data);
      });
  }, []);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchText(value);
      setPage(1); // 重置页码
    }, 300),
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSetSearch(value);
  };

  const clearSearch = () => {
    setSearchText('');
    setDebouncedSearchText('');
    setPage(1); // 重置页码
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleCellDoubleClick = (row, header) => {
    if (!header.copyFields) {
      return;
    }
    const text = header.copyFields.map(field => row[field]).join('\\');
    navigator.clipboard.writeText(text).then(() => {
      setSnackbarOpen(true);
    });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const processedData = useMemo(() => {
    if (!tableData) return [];

    let filteredData = [...tableData.data];

    if (debouncedSearchText) {
      const searchLower = debouncedSearchText.toLowerCase();
      const searchFields = tableData.headers.map(h => h.id);

      filteredData = filteredData.filter(row => {
        return searchFields.some(field => {
          const value = String(row[field] || '');
          return value.toLowerCase().includes(searchLower);
        });
      });
    }

    if (orderBy) {
      filteredData.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        const aNum = Number(aValue);
        const bNum = Number(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return order === 'asc' ? aNum - bNum : bNum - aNum;
        }

        return order === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return filteredData;
  }, [tableData, orderBy, order, debouncedSearchText]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [processedData, page]);

  // 总页数
  const totalPages = useMemo(() => {
    return Math.ceil(processedData.length / ROWS_PER_PAGE);
  }, [processedData]);

  // 搜索和分页组件
  const SearchAndPaginationComponent = () => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      mb: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#666', mr: 2 }}>
          共 {processedData.length} 条
        </Typography>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        )}
      </Box>
      <TextField
        size="small"
        variant="outlined"
        placeholder="搜索..."
        value={searchText}
        onChange={handleSearchChange}
        sx={{
          width: '180px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            height: '32px'
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: '1.1rem' }} />
            </InputAdornment>
          ),
          endAdornment: searchText && (
            <InputAdornment position="end">
              <IconButton
                onClick={clearSearch}
                size="small"
                sx={{ padding: '2px' }}
              >
                <ClearIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );

  if (!tableData) return null;

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      pt: 2
    }}>
      <Box sx={{
        width: '90%',
        maxWidth: '1200px',
        padding: 1,
        '& .MuiTableCell-root': {
          padding: '6px 16px',
          fontSize: '0.875rem',
          cursor: 'pointer'
        }
      }}>
        {/* 上方控制栏 */}
        <SearchAndPaginationComponent />

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            backgroundColor: '#fff8f0'
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{
                backgroundColor: '#ffe4cc',
                '& th': {
                  fontWeight: 600,
                  color: '#664400'
                }
              }}>
                {tableData.headers.map((header) => (
                  <TableCell key={header.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => handleRequestSort(header.id)}
                    >
                      {header.label}
                      {orderBy === header.id && (
                        <span style={{ marginLeft: 4 }}>
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#fff4e6' },
                    '&:hover': { backgroundColor: '#ffe4cc' }
                  }}
                >
                  {tableData.headers.map((header) => (
                    <TableCell
                      key={`${rowIndex}-${header.id}`}
                      sx={{
                        color: '#664400',
                        '&:hover': {
                          backgroundColor: '#ffdbbd'
                        }
                      }}
                      onDoubleClick={() => handleCellDoubleClick(row, header)}
                    >
                      {header.format ? formatters[header.format](row[header.id]) : row[header.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={tableData.headers.length}
                    align="center"
                    sx={{ py: 2, color: '#664400' }}
                  >
                    没有找到匹配的数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 下方控制栏 */}
        <SearchAndPaginationComponent />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="已复制到剪贴板"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

export default App; 