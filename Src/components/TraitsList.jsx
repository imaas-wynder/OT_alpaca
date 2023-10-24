import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';



// MUI components
import { Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
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
import HistoryIcon from '@mui/icons-material/History';


import CustomTablePagination from './CustomTablePagination';
import CustomTraitFilter from './CustomTraitFilter';
import TraitNew from './TraitNew';
import TraitProps from './TraitProps';
import DeleteTrait from './DeleteTrait';
import HistoricDetails from './HistoricDetails';


const headCells = [
  {
    id: 'display_name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Display name',
  },
  {
    id: 'description',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Description',
  },
  {
    id: 'name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Object name',
  },
  {
    id: 'namespace',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Namespace',
  },
  {
    id: 'namespace_prefix',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Prefix',
  },
  {
    id: 'system_name',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'System name',
  },
  {
    id: 'active',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Active',
  }
];




export default function TraitsList(props) {
  const { runRequest, token, showBorder } = props;

  const [activeId, setActiveId] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  const [rowCount, setRowCount] = React.useState(0);
  const [curPage, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortCol, setSortCol] = React.useState('name');
  const [sortOrd, setSortOrd] = React.useState('asc');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [selNamespace, setSelNamespace] = React.useState('');
  const [filterStr, setFilterStr] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);

  const [namespaces, setNamespaces] = useState([]);

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

  const getList = (namespace, inFilter, page, size, inSortCol, inSortOrd, componentId) => {
    addActiveId(componentId);

    page = page + 1;
    if (!size) size=10;
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}${inFilter?`&filter=${inFilter}`:``}${namespace?`&namespace=${namespace}`:``}`, 
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

  const getNamespaces = (componentId) => {
    addActiveId(componentId);

    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/namespaces?page=1&items-per-page=1000`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setNamespaces(res.data._embedded.collection);
        
      }
      removeActiveId(componentId);
    });
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.system_name==row.system_name)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.system_name==row.system_name)?{}:row);
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
  


  const handleCloseNewTrait = (status) => {
    if (status) {
      handleRefreshList();
    }
    setNewOpen(false);
  }

  const handleSetFilter = (inFilterStr, inNamespace) => {
    setFilterStr(inFilterStr);
    setSelNamespace(inNamespace);
    setPage(0); 
    handleRefreshList()
  }

  const handleResetFilter = () => {
    setShowFilter(false); 
    setFilterStr(''); 
    setSelNamespace('');
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
        //console.log(`useEffect with none.`);
        getNamespaces('namespaceComp');
        handleRefreshList();
    },[]
    );

  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        //get folders first
        //console.log ('Getting folders')
        getList(selNamespace, filterStr, curPage, rowsPerPage, sortCol, sortOrd, 'contentsList');
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            
            {showFilter && <CustomTraitFilter onFilterChange={handleSetFilter} onFilterClose={handleResetFilter} namespaces={namespaces}/>}
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
                          
                          {headCells.map((headCell) => (
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
                          ))}
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
                            <IconButton size="small" variant="outlined" color="success" title="Add new trait" onClick={() => {setNewOpen(true)}}>
                              <AddIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.system_name} hover selected={selectedRow.system_name==row.system_name}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.display_name}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.description}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.name}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.namespace}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.namespace_prefix}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.system_name}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.active ? 'True':'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                <IconButton size="small" variant="outlined" color="primary" title="View info" onClick={() => { setPropsOpen(true) }}>
                                  <InfoIcon />
                                </IconButton>
                                <IconButton size="small" variant="outlined" color="success" title="View history" onClick={() => {setHistoryOpen(true)}}>
                                  <HistoryIcon />
                                </IconButton>
                                {row.namespace!='System' && <IconButton size="small" variant="outlined" color="error" title="Delete trait" onClick={() => { setDeleteOpen(true)  }}>
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

                <TraitNew
                  runRequest = {runRequest} 
                  newOpen = {newOpen} 
                  onCreateSuccess = {handleCloseNewTrait} 
                  token = {token} 
                  showBorder = {showBorder} 
                  namespaces = {namespaces}
                />

                <TraitProps
                  runRequest = {runRequest} 
                  newOpen = {propsOpen} 
                  onCreateSuccess = {(result) => {setPropsOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  showBorder = {showBorder} 
                  namespaces = {namespaces} 
                  inObj = {selectedRow} 
                />

                

                <DeleteTrait
                  runRequest = {runRequest} 
                  deleteOpen = {deleteOpen} 
                  onDeleteSuccess = {(result) => {setDeleteOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  inObj = {selectedRow} 
                  showBorder = {showBorder}
                />

                <Dialog
                  open={historyOpen}
                  onClose={() => {setHistoryOpen(false)}}
                  aria-labelledby="history-details"
                  aria-describedby="history-details"
                  maxWidth={'xl'} 
                  fullWidth
                >
                  
                  <DialogContent>
                    <HistoricDetails runRequest = {runRequest} token = {token} showBorder={showBorder} instanceURL = {`cms/trait-definitions/${selectedRow.system_name}`}/>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => {setHistoryOpen(false)}}>Close</Button>
                  </DialogActions>
                </Dialog>
                
                
        </React.Fragment>
  );
}
