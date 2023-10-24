import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

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
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteVersion from './DeleteVersion';
import DocumentVersionNew from './DocumentVersionNew';

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';


const headCells = [
  {
    id: 'cur',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: '',
  },
  {
    id: 'version_no',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Number',
  },
  {
    id: 'latest',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Latest',
  },
  {
    id: 'mime_type',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Mime Type',
  },
  {
    id: 'version_label',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Label',
  }
];




export default function DocumentVersions(props) {
  const { runRequest, token, showBorder, inObj, navigateToObject } = props;

  const [activeId, setActiveId] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  const [rowCount, setRowCount] = React.useState(0);
  const [sortCol, setSortCol] = React.useState('version_no');
  const [sortOrd, setSortOrd] = React.useState('desc');
  const [selectedRow, setSelectedRow] = React.useState({});

  const createSortHandler = (property) => {
    const isAsc = sortCol === property && sortOrd === 'asc';
    setSortOrd(isAsc ? 'desc' : 'asc');
    setSortCol(property);
    handleRefreshList();
  };

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getList = (inSortCol, inSortOrd, componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/versions${inSortCol?`?sortby=${inSortCol} ${inSortOrd}`:``}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
        
      }
      setRowCount(res.data._embedded?.collection?.length ?? 0);
      setUpdatedList(false);
      removeActiveId(componentId);
    }, '', []);
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id==row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id==row.id)?{}:row);
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
        getList(sortCol, sortOrd, 'contentsList');
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            
            <Box 
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
                        <TableRow > 
                          
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
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                                <RefreshIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="success" title="Add new version" onClick={() => {setNewOpen(true)}}>
                              <LibraryAddIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id} hover selected={selectedRow.id==row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.id===inObj.id ? <KeyboardDoubleArrowRightIcon/> : ''}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.version_no}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.latest ? 'True' : 'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.mime_type}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.version_label ? row.version_label.join(',') : ''}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                {row.id!==inObj.id && <IconButton size="small" variant="outlined" color="primary" title="View version" onClick={() => { navigateToObject(row) }}>
                                  <VideoLibraryIcon />
                                </IconButton>}
                                {row.id!==inObj.id && <IconButton size="small" variant="outlined" color="error" title="Delete version" onClick={() => { setDeleteOpen(true)  }}>
                                  <DisabledByDefaultIcon />
                                </IconButton>}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>

                <DocumentVersionNew
                  runRequest = {runRequest} 
                  newFileOpen = {newOpen} 
                  onCreateSuccess = {(result) => {setNewOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  showBorder = {showBorder} 
                  inObj = {inObj}
                />

                <DeleteVersion
                  runRequest = {runRequest} 
                  deleteOpen = {deleteOpen} 
                  onDeleteSuccess = {(result) => {setDeleteOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  inObj = {inObj} 
                  inVersionObj = {selectedRow} 
                  showBorder = {showBorder}
                />
                
                
        </React.Fragment>
  );
}
