import * as React from 'react';
import { useState } from "react";


//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FolderIcon from '@mui/icons-material/Folder';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';


import CustomTablePagination from './CustomTablePagination';
import ObjectProperties from './ObjectProperties';
import RestoreItem from './RestoreItem';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteItem from './DeleteItem';

const headCells = [
  {
    id: 'category',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Cat',
    onSelect: true,
  },
  {
    id: 'name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Object name',
    onSelect: true,
  },
  {
    id: 'type',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Type',
    onSelect: true,
  },
  
  {
    id: 'create_time',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Created on',
    onSelect: false,
  },
  {
    id: 'update_time',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Updated on',
    onSelect: false,
  }
];



export default function RecycleBin(props) {
  const { runRequest, token, showBorder } = props;

  const [activeId, setActiveId] = useState('');

  const [propsOpen, setPropsOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
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

  const getList = (page, size, inSortCol, inSortOrd, componentId) => {
    addActiveId(componentId);

    page = page + 1;
    if (!size) size=10;
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/deleted?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
      } else {
        setRows([]);
      }
      setRowCount(res.data?.total ?? 0);
      setUpdatedList(false);
      removeActiveId(componentId);
    }, '', []);
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id===row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id===row.id)?{}:row);
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


  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setRows([]);
    setSelectedRow({});

    setUpdatedList(true);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log(`useEffect with none.`);
        handleRefreshList();
    },[]
    );
  
  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        //get folders first
        //console.log ('Getting folders')
        getList(curPage, rowsPerPage, sortCol, sortOrd, 'contentsList');
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            <Box height={"70vh"} 
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
                        <TableRow sx={{backgroundColor:'#e1e1e1'}}>
                          
                          {headCells.map((headCell) => (
                            <TableCell
                              sx={{fontWeight:'bold', backgroundColor:'#e1e1e1'}}
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
                          ))}
                          <TableCell sx={{fontWeight:'bold', backgroundColor:'#e1e1e1'}} align="left">
                            <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                                <RefreshIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id} hover selected={selectedRow.id===row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.category=='file'?<InsertDriveFileIcon sx={{color: "#808080"}}/>:(row.category=='folder'?<FolderIcon sx={{color: "#f8d775"}}/>:(row.category=='case'?<BusinessCenterIcon sx={{color: "#cc6611"}}/>:<EmojiObjectsIcon sx={{color: "#C3B1E1"}}/>))}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.name + (row.version_no?` (v. ${row.version_no})`:``)}</TableCell>
                            <Tooltip title={row.type} followCursor>
                              <TableCell align="left" 
                              onClick={() => {handleSelectRow(row, false)}} 
                              sx={{
                                
                                maxWidth: 150, 
                                overflow: "hidden", 
                                textOverflow: "ellipsis"
                                }}>{row.type}</TableCell>
                            </Tooltip>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>
                              {getDateValue(row.create_time)}
                            </TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{getDateValue(row.update_time)}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                <IconButton size="small" variant="outlined" color="primary" title="View info" onClick={() => { setPropsOpen(true) }}>
                                  <InfoIcon />
                                </IconButton>
                                <IconButton size="small" variant="outlined" color="success" title="Restore" onClick={() => { setRestoreOpen(true);  }}>
                                  <RestoreFromTrashIcon />
                                </IconButton>
                                <IconButton size="small" variant="outlined" color="error" title="Delete object" onClick={() => { setDeleteOpen(true); }}>
                                  <DeleteForeverIcon />
                                </IconButton>
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
                <Dialog open={propsOpen} onClose={() => setPropsOpen(false)} maxWidth={'xl'} fullWidth>
                  <DialogTitle>Properties - {selectedRow.name} {selectedRow.category==='file' ? ` (v. ${selectedRow.version_no})` : ''}</DialogTitle>
                  <DialogContent sx={{
                    maxHeight: '70vh',
                    mb: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    overflowY: "auto",
                    overflowX: "auto",
                    "&::-webkit-scrollbar": {
                      width: 3,
                      height: 3,
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
                    <ObjectProperties
                      runRequest = {runRequest} 
                      propsOpen = {propsOpen} 
                      onClose = {(result) => {setPropsOpen(false); if (result) { handleRefreshList();}}} 
                      token = {token} 
                      inObj = {selectedRow} 
                      showBorder = {showBorder} 
                      clickedFolder = {() => {}} 
                      navigateToObject = {() => {}} 
                      propsSave = {false} 
                      canUpdate = {() => {}}
                      isSoftDeleted = {true}
                    />
                
              
                  </DialogContent>
                <DialogActions>
                  <Button onClick={() => {setPropsOpen(false); }}>Close</Button>
                </DialogActions>
                
              </Dialog>
              <RestoreItem
                runRequest = {runRequest} 
                restoreOpen = {restoreOpen} 
                onRestoreSuccess = {(result) => {setRestoreOpen(false); if (result) handleRefreshList();}} 
                token = {token} 
                inObj = {selectedRow} 
                showBorder = {showBorder} 
                recursive = {false}
              />
              <DeleteItem
                runRequest = {runRequest} 
                deleteOpen = {deleteOpen} 
                onDeleteSuccess = {(result) => {setDeleteOpen(false); if (result) handleRefreshList();}} 
                token = {token} 
                inObj = {selectedRow} 
                showBorder = {showBorder} 
                recursive = {false}
                softDelete = {false}
              />
                
        </React.Fragment>
  );
}
