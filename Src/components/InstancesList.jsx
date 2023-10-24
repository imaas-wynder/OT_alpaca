import * as React from 'react';
import { Component } from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import PropTypes from 'prop-types';



// MUI components
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  FormControlLabel,
  Stack,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableSortLabel,
  TableRow,
  Paper, CircularProgress, Snackbar
} from '@mui/material';

import { visuallyHidden } from '@mui/utils';

import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';
import CommentIcon from '@mui/icons-material/Comment';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CommitIcon from '@mui/icons-material/Commit';
import RefreshIcon from '@mui/icons-material/Refresh';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';


import InstanceVariables from './InstanceVariables';
import InstancesComments from './InstanceComments';
import InstanceExecution from './InstanceExecution';
import InstanceAddVariables from './InstanceAddVariables';


  //for pagination
  function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>
    );
  }

  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };




export default function InstancesList(props) {
  const { runRequest, token, userName, showBorder } = props;



  const [rows, setRows] = React.useState(() => []);
  const [modelRows, setModelRows] = React.useState(() => []);
  const [rowCount, setRowCount] = useState(0);
  const [sortCol, setSortCol] = React.useState('startTime');
  const [sortOrd, setSortOrd] = React.useState('desc');

  const [selectedModel, setSelectedModel] = React.useState('');
  const [updateResponse, setUpdate] = React.useState('');

  const [openExecutionView, setOpenExecutionView] = React.useState(false);
  const [openNewVarView, setOpenNewVarView] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [openInstanceView, setOpenInstanceView] = React.useState(false);
  const [openVariableView, setOpenVariableView] = React.useState(false);
  const [openCommentsView, setOpenCommentsView] = React.useState(false);
  const [instanceObj, setInstanceObj] = React.useState({});
  const [instanceDiagram, setInstanceDiagram] = React.useState("");

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState("");
  const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");

  const [activeId, setActiveId] = useState('');

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

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;


    const handleSnackBarClose = () => {
      setShowSnackBar(false);
      setSnackBarMessage("");
    }

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
      //console.log('Changed page to: ' + newPage);
      handleRefreshList('resList', newPage, rowsPerPage, sortCol, sortOrd, false);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
      handleRefreshList('resList', 0, parseInt(event.target.value, 10), sortCol, sortOrd, false);
    };

    const createSortHandler = (property) => {
      //console.log('Current sort col: ' + sortCol + ' ' + sortOrd)
      //console.log('Sorting ' + property)
      const isAsc = sortCol === property && sortOrd === 'asc';
      setSortOrd(isAsc ? 'desc' : 'asc');
      setSortCol(property);
      handleRefreshList('resList', page, rowsPerPage, property, (isAsc ? 'desc' : 'asc'), false);
    };


  const handleRefreshList = (componentId, inPage, inRowsPerPage, inSortCol, inSortOrd, force) => {
    if (force) setRows([]);
    addActiveId(componentId);
    setInstanceObj({});
    if (!inRowsPerPage) inRowsPerPage=10;
    //console.log(`Refresh list with page: ${inPage} and rowsPerPage: ${inRowsPerPage}`);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances?${(selectedModel=='')?'':`processDefinitionKey=${selectedModel}&`}offset=${inPage*inRowsPerPage}&count=${inRowsPerPage}${inSortCol?'&sort=' + inSortCol + '&order=' + inSortOrd:''}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      if (res.data && res.data._embedded && res.data._embedded['process-instances']) {
        setRows(res.data._embedded['process-instances']);
      } else {
        setRows([]);
        setRowCount(0);
        if (res.message) {
          
        }
      }
      
      setUpdate('');
      removeActiveId(componentId);
    });
  }

  const getDiagram = (componentId, inObj) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${inObj.id}/diagram`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data) {
        var reader = new FileReader();

        reader.readAsDataURL(res.data);
        reader.onload = function () {
          const regex = /data:.*base64,/
          setInstanceDiagram(reader.result.replace(regex,""));
          removeActiveId(componentId);
        };
        reader.onerror = function (error) {
          setSnackBarMessage(`File reading error: ${error.message}`);
          setSnackBarSeverity('error');
          setShowSnackBar(true);
          //console.log('Error: ', error);
        };
      }
      if (res.message) {
        
      }
    });
  }

  const getCount = (componentId) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances?${(selectedModel=='')?'':`processDefinitionKey=${selectedModel}&`}offset=0&count=1000`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded['process-instances']) {
        setRowCount(res.data._embedded['process-instances'].length); 
      }
      if (res.message) {
        
      }
      
      setUpdate('');
      removeActiveId(componentId);
    });
  }

  const getModels = (componentId) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models?latestVersion=true&offset=0&count=1000`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.models) {
        setModelRows(res.data._embedded.models);
      }
      if (res.message) {
        
      }
      removeActiveId(componentId);
    });
  }

  const handleActivationStatus = (inObj, inAction, inMessage, componentId) => {
    addActiveId(componentId);
    let req = { 
      method: 'put', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${inObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
      data: {
        action:inAction,
        comment:{
          includeUserIds:false,
          message:inMessage ?? 'Instance action: ' + inAction,
          type:'comment'
        }
      }
    };
    runRequest(req, (res) => {
      
      setUpdate('true');
      removeActiveId(componentId);
    }, `Sent action ${inAction} to: ${inObj.id}`, []);
  }

  const handleTerminate = (inObj, componentId) => {
    addActiveId(componentId);
    let req = { 
      method: 'delete', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${inObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      setUpdate('true');
      removeActiveId(componentId);
    }, `Terminated instance: ${inObj.id}`, []);
  }

  const handleSelectChange = (event) => {
    setPage(0);
    setSelectedModel(event.target.value);
  };

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }
  
  // ADD HOOK ALLOWING TO RUN CODE ONCE selectedModel changes
  useEffect(
    () => {
        if (selectedModel!='' || modelRows.length>0) handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);
    },[selectedModel]
    );

   // ADD HOOK ALLOWING TO RUN CODE ONCE updateResponse changes
   useEffect(
    () => {
        if (updateResponse != '') {
          handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);
        }
    },[updateResponse]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        getModels('drpModels');
        
    },[]
    );

  useEffect(
      () => {
          if (rows.length>0) getCount('pageContainer');
      },[rows]
      );

  useEffect(
    () => {
        if (modelRows.length>0) handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);   
      },[modelRows]
    );
    
    

  return (
      <React.Fragment>
            <div align="right">
              <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='drpModels'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
                <FormControl sx={{ m: 1, minWidth: 460 }} size="small">
                  <InputLabel id="model-select-label">Filter by process</InputLabel>
                  <Select
                    labelId="model-select-label"
                    id="model-simple-select"
                    value={selectedModel}
                    label="Filter by process"
                    onChange={handleSelectChange}
                  >
                    <MenuItem key={'0000'} value={''}>{'(none)'}</MenuItem>
                    {modelRows.map((row) => (<MenuItem key={row.id} value={row.key}>{row.name + ' (v.' + row.version + ')'}</MenuItem>))}
                  </Select>
                </FormControl>
              </Box>
            </div>
            <Box sx={{
                      borderStyle: (activeId.split(',').find((obj) => {return obj=='resList'}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin',
                      }}>
              <TableContainer component={Paper} sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                overflowY: "auto", 
                overflowX: "auto", 
                "&::-webkit-scrollbar": {
                  height: 4,
                  width: 4,
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
                <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                      <TableCell align="left">Name</TableCell>
                        <TableCell align="left" sortDirection={sortCol=='processDefinitionKey' ? sortOrd : 'asc'}>
                          <TableSortLabel
                            active={sortCol=='processDefinitionKey'}
                            direction={sortCol=='processDefinitionKey' ? sortOrd : 'asc'}
                            onClick={e => {createSortHandler('processDefinitionKey')}}
                          >
                            Process Definition Name
                            {sortCol == 'processDefinitionKey' ? (
                              <Box component="span" sx={visuallyHidden}>
                                {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="left" sortDirection={sortCol=='startTime' ? sortOrd : 'asc'}>
                          <TableSortLabel
                            active={sortCol=='startTime'}
                            direction={sortCol=='startTime' ? sortOrd : 'asc'}
                            onClick={e => {createSortHandler('startTime')}}
                          >
                            Start Time
                            {sortCol == 'startTime' ? (
                              <Box component="span" sx={visuallyHidden}>
                                {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="left">Start UserId</TableCell> 
                        <TableCell align="left">Suspended</TableCell>
                        <TableCell align="left">Ended</TableCell>
                        <TableCell align="left">Completed</TableCell>
                        <TableCell align="left" sortDirection={sortCol=='dueDate' ? sortOrd : 'asc'}>
                          <TableSortLabel
                            active={sortCol=='dueDate'}
                            direction={sortCol=='dueDate' ? sortOrd : 'asc'}
                            onClick={e => {createSortHandler('dueDate')}}
                          >
                            Due Date
                            {sortCol == 'dueDate' ? (
                              <Box component="span" sx={visuallyHidden}>
                                {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                        
                          <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, true);}}>
                              <RefreshIcon />
                            </IconButton>
                          </TableCell>
                      </TableRow>
                    </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} hover selected={row.id==instanceObj.id}>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{(row.name)?row.name:row.id}</TableCell>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{row.processDefinitionName}</TableCell>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{getDateValue(row.startTime)}</TableCell>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{row.startUserId}</TableCell>
                        <TableCell align="left" style={{color: row.suspended?'red':'green',}} onClick={() => {setInstanceObj(row)}}>{row.suspended?'True' : 'False'}</TableCell>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{row.ended?'True' : 'False'}</TableCell>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{row.completed?'True' : 'False'}</TableCell>
                        <TableCell align="left" onClick={() => {setInstanceObj(row)}}>{getDateValue(row.dueDate)}</TableCell>
                        <TableCell align="left">
                          <Stack direction="row">
                            <IconButton size="small" variant="outlined" color="warning" title="Show instance view" onClick={() => { setInstanceObj(row); setOpenInstanceView(true); getDiagram('diagramContainer', row) }}>
                              <AccountTreeIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="primary" title="Show variables" onClick={() => { setInstanceObj(row); setOpenVariableView(true); }}>
                              <DataObjectIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="warning" title="Add variables" onClick={() => { setInstanceObj(row); setOpenNewVarView(true); }}>
                              <DataSaverOnIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="primary" title="Show comments" onClick={() => { setInstanceObj(row); setOpenCommentsView(true) }}>
                              <CommentIcon />
                            </IconButton>
                            <Box sx={{
                              borderStyle: (activeId.split(',').find((obj) => {return obj==`butSuspend${row.id}`}) && showBorder)?'solid':'none', 
                              borderColor: 'red',
                              borderWidth: 'thin',
                              }}>
                              <IconButton size="small" variant="outlined" color="primary" title={row.suspended?'Activate instance':'Suspend instance'} onClick={() => { setInstanceObj(row); handleActivationStatus(row, (row.suspended==true)?'activate':'suspend', 'UI action on instance', `butSuspend${row.id}`) }}>
                                {(!row.suspended) && <PauseIcon />}
                                {(row.suspended) && <PlayArrowIcon/>}
                              </IconButton>
                            </Box>
                            <Box sx={{
                              borderStyle: (activeId.split(',').find((obj) => {return obj==`butTerminate${row.id}`}) && showBorder)?'solid':'none', 
                              borderColor: 'red',
                              borderWidth: 'thin',
                              }}>
                                <IconButton size="small" variant="outlined" color="error" title="Terminate instance" onClick={() => { handleTerminate(row, `butTerminate${row.id}`) }}>
                                  <StopIcon />
                                </IconButton>
                            </Box>
                            <IconButton size="small" variant="outlined" color="success" title="Trigger active instance execution" onClick={() => { setInstanceObj(row); setOpenExecutionView(true) }}>
                              <CommitIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow >
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                        colSpan={9}
                        count={rowCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        SelectProps={{
                          inputProps: {
                            'aria-label': 'rows per page',
                          },
                          native: true,
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                        sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj=='pageContainer'}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin',
                          }}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
            
            <Dialog
              open={openInstanceView}
              aria-labelledby="ProcessInstanceView"
              fullWidth={true}
              maxWidth='xl' onClose={() => {setInstanceDiagram(''); setOpenInstanceView(false)}}>
              <DialogTitle id="customized-dialog-title">Instance view for instance id: {instanceObj.id}</DialogTitle>
              <DialogContent align="center">
                <Box sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj=='diagramContainer'}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin',
                          }}>
                  {!instanceDiagram && 'Loading....'}
                  {instanceDiagram && <img src={`data:image/png;base64, ${instanceDiagram}`} align="center"/>}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {getDiagram('diagramContainer', instanceObj) }} variant="contained" color="primary">
                  Refresh
                </Button>
                <Button onClick={() => {setInstanceDiagram(''); setOpenInstanceView(false)}} variant="contained" color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={openVariableView}
              aria-labelledby="ProcessVariableView"
              fullWidth={true}
              maxWidth='xl' onClose={() => { setOpenVariableView(false) }}>
              <DialogTitle id="customized-dialog-title">Variable view for {instanceObj.id}</DialogTitle>
              <DialogContent sx={{
                
                flexGrow: 1,
                maxHeight: '80vh',
                mb: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                overflowX: "auto",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: 4,
                  height: 4,
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
                <InstanceVariables instanceid={instanceObj.id} runRequest={runRequest} token={token} showBorder={showBorder}/> 
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenVariableView(false) }} variant="contained" color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={openCommentsView}
              aria-labelledby="ProcessCommentsView"
              fullWidth={true}
              maxWidth='xl' onClose={() => { setOpenCommentsView(false) }}>
              <DialogTitle id="customized-dialog-title">Comments view for {instanceObj.id}</DialogTitle>
              <DialogContent>
                <InstancesComments instanceid={instanceObj.id} runRequest={runRequest} token={token} showBorder={showBorder}/> 
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenCommentsView(false) }} variant="contained" color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            <InstanceExecution runRequest={runRequest}
              executionOpen={openExecutionView} 
              onExecuteSuccess={(res) => {setOpenExecutionView(false); if (res) setUpdate('true')}}
              instanceObj={instanceObj}
              token={token} 
              showBorder={showBorder}/>
            <InstanceAddVariables runRequest={runRequest}
              executionOpen={openNewVarView} 
              onExecuteSuccess={(res) => {setOpenNewVarView(false); if (res) setUpdate('true')}}
              instanceObj={instanceObj}
              token={token} 
              showBorder={showBorder}/>
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={showSnackBar}
              autoHideDuration={5000}
              onClose={handleSnackBarClose}
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackBarClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            >
              <Alert onClose={handleSnackBarClose} severity={snackBarSeverity}>
                {snackBarMessage}
              </Alert>
          </Snackbar>
        </React.Fragment>
  );
}
