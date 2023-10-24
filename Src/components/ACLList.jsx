import * as React from 'react';
import { useState } from "react";


//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


//import PDFViewer from 'pdf-viewer-reactjs';

// MUI components
import { 
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Paper
} from '@mui/material';

import { visuallyHidden } from '@mui/utils';

import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddIcon from '@mui/icons-material/Add';


import CustomTablePagination from './CustomTablePagination';
import CustomACLFilter from './CustomACLFilter';
import ACLProps from './ACLProps';
import DeleteACL from './DeleteACL';


const headCells = [
  {
    id: 'name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Object name',
    onSelect: true,
  },
  {
    id: 'description',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Description',
    onSelect: true,
  },
  {
    id: 'internal',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Internal',
    onSelect: false,
  },
  {
    id: 'named',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Named',
    onSelect: false,
  }
];




export default function ACLList(props) {
  const { runRequest, token, showBorder, setOutId, isSelect } = props;

  const [activeId, setActiveId] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  const [rowCount, setRowCount] = React.useState(0);
  const [curPage, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortCol, setSortCol] = React.useState('name');
  const [sortOrd, setSortOrd] = React.useState('asc');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [filterStr, setFilterStr] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);

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

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getList = (inFilter, page, size, inSortCol, inSortOrd, componentId) => {
    addActiveId(componentId);

    page = page + 1;
    if (!size) size=10;
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/permissions?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}${inFilter?`&filter=${inFilter}`:``}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
        
      }
      setRowCount(res.data?.total ?? 0);
      setUpdatedList(false);
      removeActiveId(componentId);
    });
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id==row.id)?selectedRow:row);
      setOutId((selectedRow.id==row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id==row.id)?{}:row);
      setOutId((selectedRow.id==row.id)?{}:row);
    }
  }

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

  const isActiveId = (item) => {
    return activeId.split(',').find((obj) => {return obj==item});
  }
  


  const handleCloseNewACL = (status) => {
    if (status) {
      handleRefreshList();
    }
    setNewOpen(false);
  }

  const handleSetFilter = (inFilterStr) => {
    setFilterStr(inFilterStr);
    setPage(0); 
    handleRefreshList()
  }

  const handleResetFilter = () => {
    setShowFilter(false); 
    setFilterStr(''); 
    setPage(0); 
    handleRefreshList()
  }
  

  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setRows([]);
    setSelectedRow({});

    setUpdatedList(true);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        handleRefreshList();
    },[]
    );

  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        //get folders first
        //console.log ('Getting folders')
        getList(filterStr, curPage, rowsPerPage, sortCol, sortOrd, 'contentsList');
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            
            {showFilter && <CustomACLFilter onFilterChange={handleSetFilter} onFilterClose={handleResetFilter}/>}
            <Box height={showFilter?"65vh":"70vh"} 
              key="box-left-panel" 
              sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                overflowY: "auto", 
                overflowX: "hidden", 
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
                  },
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='contentsList'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'
                  }}
                  >
                  {<TableContainer component={Paper} sx={{
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
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          
                          {headCells.map((headCell) => {
                            if ((headCell.onSelect && isSelect) || !isSelect) {

                            
                              return (
                              <TableCell
                                key={headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                                sortDirection={sortCol === headCell.id ? sortOrd : false}
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
                            )
                          }
                          
                          })}
                          <TableCell align="left">
                            {showFilter?(<IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={ handleResetFilter }>
                                <FilterAltOffIcon />
                              </IconButton>):(
                              <IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { setShowFilter(true) }}>
                                <FilterAltIcon />
                              </IconButton>
                            )}
                            <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                                <RefreshIcon />
                            </IconButton>
                            {!isSelect && <IconButton size="small" variant="outlined" color="success" title="Add new ACL" onClick={() => {setNewOpen(true)}}>
                              <AddIcon />
                            </IconButton>}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id} hover selected={selectedRow.id==row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.name}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.description}</TableCell>
                            {!isSelect && <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.internal ? 'True':'False'}</TableCell>}
                            {!isSelect && <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.named ? 'True':'False'}</TableCell>}
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                <IconButton size="small" variant="outlined" color="primary" title="View info" onClick={() => { setPropsOpen(true) }}>
                                  <InfoIcon />
                                </IconButton>
                                {!row.internal && !isSelect && <IconButton size="small" variant="outlined" color="error" title="Delete ACL" onClick={() => { setDeleteOpen(true)  }}>
                                  <DeleteForeverIcon />
                                </IconButton>}
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                      <CustomTablePagination
                        page={curPage} 
                        rowsPerPage={rowsPerPage} 
                        count={rowCount}
                        colSpan={7} 
                        onPaginationChange={handleChangePage}
                      />
                    </Table>
                  </TableContainer>}
                </Box>

                <ACLProps
                  runRequest = {runRequest} 
                  newOpen = {propsOpen} 
                  onCreateSuccess = {(result) => {setPropsOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  showBorder = {showBorder} 
                  inObj = {selectedRow} 
                  isNew = {false}
                />
                <ACLProps
                  runRequest = {runRequest} 
                  newOpen = {newOpen} 
                  onCreateSuccess = {(result) => {setNewOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  showBorder = {showBorder} 
                  inObj = {{name: '', description: '', named: false, permits: []}} 
                  isNew = {true}
                />
                <DeleteACL
                  runRequest = {runRequest} 
                  deleteOpen = {deleteOpen} 
                  onDeleteSuccess = {(result) => {setDeleteOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  inObj = {selectedRow} 
                  showBorder = {showBorder}
                />
                
        </React.Fragment>
  );
}
