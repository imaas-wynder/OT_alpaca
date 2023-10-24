import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import {
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableSortLabel,
  TableHead,
  TableRow,
  Paper,
  Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import RefreshIcon from '@mui/icons-material/Refresh';

import { visuallyHidden } from '@mui/utils';
import CustomTablePaginationNoCount from './CustomTablePaginationNoCount';
import CustomHistoricFilter from './CustomHistoricFilter';

const headCells = [
  {
    id: 'action_name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Action name',
  },
  {
    id: 'object_category',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Category',
  },
  {
    id: 'event_source',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Event source',
  },
  
  {
    id: 'event_user',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'User id',
  },
  {
    id: 'event_status',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'create_time',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Created on',
  },
  {
    id: 'update_time',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Updated on',
  }
];

function padTo2Digits (num) {
  return num.toString().padStart(2, '0');
}

function getTimeFromMs (ms) {
  if (!ms || ms==0 || ms=='') return ' ';
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);


seconds = seconds % 60;
// if seconds are greater than 30, round minutes up (optional)
//minutes = seconds >= 30 ? minutes + 1 : minutes;
minutes = minutes % 60;
return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(minutes)}`;

}

function getDateValue (dt) {
  if (!dt) return ' ';
  return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
}



function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">{row.action_name}</TableCell>
        <TableCell align="left">{row.object_category}</TableCell>
        <TableCell align="left">{row.event_source}</TableCell>
        <TableCell align="left">{row.event_user}</TableCell>
        <TableCell align="left">{row.event_status}</TableCell>
        <TableCell align="left">{getDateValue(row.create_time)}</TableCell>
        <TableCell align="left">{getDateValue(row.update_time)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Paper elevation={6}>
              <Box sx={{ margin: 3 }}>
                <Typography
                  sx={{ flex: '1 1 100%' }}
                  variant="subtitle1"
                  id="tableTitle"
                  component="div"
                >
                  Payload ({row.payload?.type ? row.payload.type : 'none'})
                </Typography>
                {row.payload?.type==='json' ? <div><pre>{JSON.stringify(JSON.parse(row.payload.value),null,2)}</pre></div> : row.payload?.value}
              </Box>
            </Paper>
              
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
  


export default function HistoricDetails(props) {
  const {instanceURL, runRequest, token, showBorder} = props;

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  
  const [prevLink, setPrevLink] = React.useState('');
  const [nextLink, setNextLink] = React.useState('');

  const [curPage, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortCol, setSortCol] = React.useState('');
  const [sortOrd, setSortOrd] = React.useState('');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [filterStr, setFilterStr] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);
  const [refreshComplete, setRefreshComplete] = React.useState(false);

  const [activeId, setActiveId] = React.useState('');

  const addActiveId = (item) => {
    let array = activeId.split(',');
    if (!array.find((obj) => {return obj==item})) {
      array.push(item);
      setActiveId(array.join(','));
    }
  }

  const removeActiveId = (item) => {
    let tmpActId = activeId;
    let array = [];
    for (let i=0; i<tmpActId.split(',').length; i++) {
      if (tmpActId.split(',')[i]!=item) {
        array.push(tmpActId.split(',')[i]);
      }
    }
    setActiveId(array.join(','));
  }

  const handleChangePage = (newPage, newRowsPerPage) => {
    setPage(newPage);
    setRowsPerPage(newRowsPerPage);
    //console.log('Changed page to: ' + newPage);
    handleRefreshList()
  };

  const createSortHandler = (property) => {
    const isAsc = sortCol === property && sortOrd === 'asc';
    setSortOrd(isAsc ? 'desc' : 'asc');
    setSortCol(property);
    handleRefreshList();
  };

  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setRows([]);
    setPrevLink('');
    setNextLink('');

    setUpdatedList(true);
  }

  const getDetails = (page, size, inSortCol, inSortOrd, componentId) => {
    page = page + 1;
    if (!size) size=10;

    setRefreshComplete(false);
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/${instanceURL}/history?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}${filterStr?'&filter=' + filterStr:''}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection); 
        
      }
      setPrevLink(res.data?._links?.previous ? 'yes' : '');
      setNextLink(res.data?._links?.next ? 'yes' : '');
      setUpdatedList(false);
      removeActiveId(componentId);
    });
    
  }

  const onFilterChange = (inFilterStr) => {
    setFilterStr(inFilterStr); 
    setPage(0); 
    handleRefreshList()
  }

  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        
        getDetails(curPage, rowsPerPage, sortCol, sortOrd, 'resList');
      }
    },[updatedList]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (!refreshComplete) setRefreshComplete(true);
    },[rows]
    );

    useEffect(
      () => {
        //console.log(`useEffect with updatedList.`);
        if (instanceURL!=='') {
          
          getDetails(curPage, rowsPerPage, sortCol, sortOrd, 'resList');
        }
      },[instanceURL]
      );

  return (
          <React.Fragment>
            <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='resList'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
            {(refreshComplete==false) ? 'Loading...' : ''}</Box>
            {showFilter && <CustomHistoricFilter onFilterChange={onFilterChange} onFilterClose={() => setShowFilter(false)}/>}
            <TableContainer component={Paper} sx={{
                          maxHeight: "80vh",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          overflowY: "auto", 
                          overflowX: "auto", 
                          "&::-webkit-scrollbar": {
                            height: 3,
                            width: 3,
                            borderRadius: 2
                            },
                            "&::-webkit-scrollbar-track": {
                            backgroundColor: "white"
                            },
                            "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "gray",
                            borderRadius: 2
                            }
                            }}>
              <Table stickyHeader size="small" aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                      {showFilter?(<IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { setShowFilter(false); setFilterStr(''); setPage(0); handleRefreshList() }}>
                          <FilterAltOffIcon />
                        </IconButton>):(
                        <IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { setShowFilter(true) }}>
                          <FilterAltIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                          <RefreshIcon />
                      </IconButton>
                    </TableCell>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={sortCol === headCell.id ? sortOrd : false} 
                        sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}
                      >
                        {headCell.sorting ? <TableSortLabel
                          active={sortCol === headCell.id}
                          direction={sortCol === headCell.id ? sortOrd : 'asc'}
                          onClick={() => {createSortHandler(headCell.id)}}
                        >
                          {headCell.label}
                          {sortCol === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel> : 
                        headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {rows && <TableBody>
                  {rows.map((row) => (
                    <Row key={row.id} row={row}/>
                  ))}
                </TableBody>}
                <CustomTablePaginationNoCount 
                    page={curPage} 
                    rowsPerPage={rowsPerPage} 
                    prevLink={prevLink} 
                    nextLink={nextLink}
                    colSpan={7} 
                    onPaginationChange={handleChangePage} 
                    curCount={rows.length}
                  />
              </Table>
            </TableContainer>
          </React.Fragment>
  );
}
