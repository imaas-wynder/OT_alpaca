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
  Grid,
  LinearProgress,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  FormControlLabel,
  Select,
  Switch,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableSortLabel,
  TableRow,
  Paper, Snackbar
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RefreshIcon from '@mui/icons-material/Refresh';

import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import ContactMailIcon from '@mui/icons-material/ContactMail';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';


import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import TaskFormView from './TaskFormView';
import TaskFormConfig from './TaskFormConfig';


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




export default function TasksList(props) {

  const { runRequest, token, userName, showBorder, email, inUrlId, inUrlAction, inUrlActionId, urlLoaded, setUrlLoaded } = props;


  const [rows, setRows] = React.useState(() => []);
  const [modelRows, setModelRows] = React.useState(() => []);
  const [rowCount, setRowCount] = useState(0);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedModel, setSelectedModel] = React.useState('');
  const [assignedUser, setAssignedUser] = React.useState('');
  const [delegatedUser, setDelegatedUser] = React.useState('');

  const [customOutcome, setCustomOutcome] = React.useState('');

  const [curTaskId, setCurTaskId] = React.useState('');
  const [updateResponse, setUpdate] = React.useState('');
  const [chkValue, setChecked] = React.useState(false);
  
  const [sortCol, setSortCol] = React.useState('createTime');
  const [sortOrd, setSortOrd] = React.useState('desc');

  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [taskFormConfig, setTaskFormConfig] = React.useState(false);
  const [curTask, setCurTask] = React.useState({});
  const [curTaskConfig, setCurTaskConfig] = React.useState({});
  


  const [openInstanceView, setOpenInstanceView] = React.useState(false);
  
  const [instanceId, setInstanceId] = React.useState("");
  const [instanceDiagram, setInstanceDiagram] = React.useState("");
  const [delegateAction, setDelegateAction] = React.useState(false);
  const [completeAction, setCompleteAction] = React.useState(false);


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
      //console.log(newPage);
      handleRefreshList('resList', newPage, rowsPerPage, sortCol, sortOrd, false);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
      handleRefreshList('resList', 0, parseInt(event.target.value, 10), sortCol, sortOrd, false);
    };
    
    const handleActOnTask = (task_id, inAction, inAssignee, inOutcome, componentId) => {
      addActiveId(componentId);
      let putBody = {};

      if (inAction=='complete') {
        putBody = {
          action:inAction,
          outcome:inOutcome ? inOutcome : "Approved"
        };
      } else {
        putBody = {
          action:inAction,
          assignee:inAssignee
        };
      }

      let req = { 
        method: 'post', 
        url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/tasks/${task_id}`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
        data: putBody
      };
      
        runRequest(req, (res) => {
          
          setUpdate('true');
          removeActiveId(componentId);
        }, `Acted successfully with action ${inAction} on task: ${task_id}`, []);
      
    }

  const handleRefreshList = (componentId, inPage, inRowsPerPage, inSortCol, inSortOrd, force) => {
    if (force) setRows([]);
    addActiveId(componentId);
    if (!inRowsPerPage) inRowsPerPage=10;
    //console.log(`Refresh list with page: ${inPage} and rowsPerPage: ${inRowsPerPage} and assigned: ${assignedUser}`);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/tasks?${(selectedModel=='')?'':`processDefinitionKey=${selectedModel}&`}${((assignedUser == '')?'':((assignedUser=='unassigned')?'unassigned=true&':'assignee=' + assignedUser + '&'))}offset=${inPage*inRowsPerPage}&count=${inRowsPerPage}${inSortCol?'&sort=' + inSortCol + '&order=' + inSortOrd:''}&includeProcessVariables=true`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      if (res.data && res.data._embedded) {
        if (urlLoaded===false && inUrlId && inUrlAction==='viewTask') {
          //if url loading, we need to check if we have the right object
          let result = res.data._embedded.tasks.find((obj) => {return obj.id===inUrlId});
          if (result && result.id) {
            //it is found open the task and set the urlloaded true so that we don't load it again
            if (page!==inPage) setPage(inPage);
            setRows(res.data._embedded.tasks ?? []);
            setUrlLoaded(true);
            handleTaskOpen(result);
            
          } else {
            //not found, are there more pages?
            
            if (res.data._links?.next) {
              //next page
              handleRefreshList('resList', page + 1, rowsPerPage, sortCol, sortOrd, false);
              
            } else {
              //could not be found
              console.log('Could not find the URL object in collection');
              setUrlLoaded(true);
              setRows(res.data._embedded.tasks ?? []);
            }
          }
        } else {
          setRows(res.data._embedded.tasks ?? []);
        }


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

  const getCount = (componentId) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/tasks?${(selectedModel=='')?'':`processDefinitionKey=${selectedModel}&`}${((assignedUser == '')?'':((assignedUser=='unassigned')?'unassigned=true&':'assignee=' + assignedUser + '&'))}offset=0&count=1000`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.tasks) {
        setRowCount(res.data._embedded.tasks.length); 
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
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models?latestVersion=true&offset=0&count=100`, 
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

  const handleSelectChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleCheck = (event) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      setAssignedUser('unassigned');
    } else {
      setAssignedUser('');
    }
    setUpdate('true')
  };

  const getDiagram = (componentId, inInstanceId) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${inInstanceId}/diagram`, 
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


  const handleCloseInstanceView = () => {
    setOpenInstanceView(false);
    setInstanceId('');
    setInstanceDiagram('');
  }

  const handleOpenInstanceView = (instance_id, task_id) => {
      setInstanceId(instance_id);
      setCurTaskId(task_id);
      getDiagram('diagramContainer', instance_id);
      setOpenInstanceView(true);
  }

  const handleDelegate = (task_id) => {
    setCurTaskId(task_id);
    setDelegateAction(true);
  }

  const handleCloseDelegate = () => {
    setDelegatedUser('');
    setCurTaskId('');
    setDelegateAction(false);
  }

  const handleComplete = (task_id) => {
    setCurTaskId(task_id);
    setCompleteAction(true);
  }

  const handleCloseComplete = () => {
    setCustomOutcome('');
    setCurTaskId('');
    setCompleteAction(false);
  }

  const handleUserComplete = () => {
    handleActOnTask(curTaskId, 'complete', '', customOutcome, 'completeBut')
    setCustomOutcome('');
    setCurTaskId('');
    setCompleteAction(false);
  }

  const handleUserDelegate = () => {
    handleActOnTask(curTaskId, 'delegate', delegatedUser, '', 'delegateBut')
    setDelegatedUser('');
    setCurTaskId('');
    setDelegateAction(false);
  }

  const handleTaskOpen = (row) => {
    var tskConfig = row.variables.find((obj) => {return obj.name==='wf_task_config'});
    if (tskConfig) {
      setCurTaskConfig(tskConfig.value);
      setCurTask(row);
      setTaskFormOpen(true);
    } else {
      //not found, open the config form
      setCurTask(row);
      setTaskFormConfig(true);
    }

    
  }

  const handleTaskClose = (result, switchToConfig) => {
    if (!switchToConfig) {
      setCurTaskConfig({});
      setCurTask({});
    }
    if (taskFormOpen) {
      setTaskFormOpen(false);
      if (result) {
        handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);
      }
      if (switchToConfig===true) {
        setTaskFormConfig(true);
      }
    }
    if (taskFormConfig) {
      setTaskFormConfig(false);
      if (result) {
        handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);
      }
      
    }
    
    
  }

  const createSortHandler = (property) => {
    //console.log('Current sort col: ' + sortCol + ' ' + sortOrd)
    //console.log('Sorting ' + property)
    const isAsc = sortCol === property && sortOrd === 'asc';
    setSortOrd(isAsc ? 'desc' : 'asc');
    setSortCol(property);
    handleRefreshList('resList', page, rowsPerPage, property, isAsc ? 'desc' : 'asc', false);
  };


  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }
  // ADD HOOK ALLOWING TO RUN CODE ONCE selectedModel changes
  useEffect(
    () => {
        //console.log("useEffect() on selectedModel");
        if (selectedModel!='' || modelRows.length>0) handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);
    },[selectedModel]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      getModels('drpModels');
    },[]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE updateResponse changes
  useEffect(
    () => {
        if (updateResponse != '') {
          handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, false);
        }
    },[updateResponse]
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
    
    
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minHeight: 55,
  }));

  return (
    <div>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row-reverse" spacing={2}>
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
                      <MenuItem value={''}>{'(none)'}</MenuItem>
                      {modelRows.map((row) => (<MenuItem key={row.key} value={row.key}>{row.name + ' (v.' + row.version + ')'}</MenuItem>))}
                    </Select>
                  </FormControl>
                  </Box>
                  <TextField
                  margin="dense"
                  id="assignedTo"
                  label="Assignee"
                  type="email"
                  variant="standard" 
                  size="small" 
                  value={assignedUser}
                  InputProps={{readOnly: chkValue,}}
                  onChange={e => {setAssignedUser(e.target.value)}}
                  />
                  <FormControlLabel
                  control={
                    <Switch checked={chkValue} onChange={handleCheck} name="unassigned" />
                  }
                  label="Show unassigned" 
                  labelPlacement="start"
                />
          </Stack>
          
        </Box>
        <br/>
        <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='resList'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                
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
                  <TableCell align="left">Assignee</TableCell>
                  <TableCell align="left" sortDirection={sortCol=='name' ? sortOrd : 'asc'}>
                    <TableSortLabel
                      active={sortCol=='name'}
                      direction={sortCol=='name' ? sortOrd : 'asc'}
                      onClick={e => {createSortHandler('name')}}
                    >
                      Name
                      {sortCol == 'name' ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sortDirection={sortCol=='createTime' ? sortOrd : 'asc'}>
                    <TableSortLabel
                      active={sortCol=='createTime'}
                      direction={sortCol=='createTime' ? sortOrd : 'asc'}
                      onClick={e => {createSortHandler('createTime')}}
                    >
                      Create Time
                      {sortCol == 'createTime' ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sortDirection={sortCol=='priority' ? sortOrd : 'asc'}>
                    <TableSortLabel
                      active={sortCol=='priority'}
                      direction={sortCol=='priority' ? sortOrd : 'asc'}
                      onClick={e => {createSortHandler('priority')}}
                    >
                      Priority
                      {sortCol == 'priority' ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left">Suspended</TableCell>
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
                  <TableCell align="left">Owner</TableCell>
                  <TableCell align="left">Claim Time</TableCell>
                  <TableCell align="left">Delegation State</TableCell>
                  {/* <TableCell align="left">Parent Task</TableCell> */}
                  <TableCell align="right">
                    <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList('resList', page, rowsPerPage, sortCol, sortOrd, true); }}>
                        <RefreshIcon />
                      </IconButton>
                    </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.assignee}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.name}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{getDateValue(row.createTime)}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.priority}</TableCell>
                    <TableCell align="left" style={{color: row.suspended?'red':'green',}} onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.suspended?'True' : 'False'}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{getDateValue(row.dueDate)}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.owner}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{getDateValue(row.claimTime)}</TableCell>
                    <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.delegationState}</TableCell>
                    {/* <TableCell align="left" onClick={(event) => handleOpenInstanceView(row.processInstanceId, row.id)}>{row.parentTaskId}</TableCell> */}
                    <TableCell align="left">
                      <Stack direction="row">
                        <IconButton size="small" variant="outlined" color="warning" title="Show instance view" onClick={() => { handleOpenInstanceView(row.processInstanceId, row.id) }}>
                          <AccountTreeIcon />
                        </IconButton>
                          <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='approveBut' + row.id}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                          <IconButton size="small" disabled={row.suspended || chkValue || (row.delegationState=='pending') || (row.assignee==null)} variant="outlined" color="success" title="Approve task" onClick={() => { handleActOnTask(row.id, 'complete', '', 'Approve', 'approveBut' + row.id) }}>
                            <TaskAltIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='rejectBut' + row.id}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                          <IconButton size="small" disabled={row.suspended || chkValue || (row.delegationState=='pending') || (row.assignee==null)} variant="outlined" color="error" title="Reject task" onClick={() => { handleActOnTask(row.id, 'complete', '', 'Reject', 'rejectBut' + row.id) }}>
                            <DoNotDisturbAltIcon />
                          </IconButton>
                        </Box>
                        <IconButton size="small" disabled={row.suspended || chkValue || (row.delegationState=='pending') || (row.assignee==null)} variant="outlined" color="primary" title="Complete task (custom outcome)" onClick={() => { handleComplete(row.id) }}>
                          <FactCheckIcon />
                        </IconButton>
                        <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='claimBut' + row.id}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                          <IconButton size="small" disabled={row.suspended || (row.assignee!=null)} variant="outlined" color="primary" title="Claim task" onClick={() => { handleActOnTask(row.id, 'claim', email, '', 'claimBut' + row.id) }}>
                            <AssignmentTurnedInIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='unclaimBut' + row.id}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                          <IconButton size="small" disabled={row.suspended || chkValue || (row.assignee==null)} variant="outlined" color="primary" title="Unclaim task" onClick={() => { handleActOnTask(row.id, 'unclaim', email, '', 'unclaimBut' + row.id) }}>
                            <AssignmentReturnIcon />
                          </IconButton>
                        </Box>
                        <IconButton size="small" disabled={row.suspended} variant="outlined" color="primary" title="Delegate task" onClick={() => { handleDelegate(row.id) }}>
                          <AssignmentIndIcon />
                        </IconButton>
                        <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='resolveBut' + row.id}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                          <IconButton size="small" disabled={row.suspended || (row.delegationState!='pending')} variant="outlined" color="primary" title="Resolve task" onClick={() => { handleActOnTask(row.id, 'resolve', email, '', 'resolveBut' + row.id) }}>
                            <HowToRegIcon />
                          </IconButton>
                        </Box>
                        <IconButton size="small" disabled={row.suspended || chkValue || (row.assignee==null)} variant="outlined" color= {row.variables.find((obj) => {return obj.name==='wf_task_config'}) ? 'success' : 'secondary'} title={row.variables.find((obj) => {return obj.name==='wf_task_config'}) ? 'Show task form' : 'Create config'} onClick={() => { handleTaskOpen(row) }}>
                          {row.variables.find((obj) => {return obj.name==='wf_task_config'}) ? 
                          <ContactMailIcon/> : 
                          <ContactEmergencyIcon />}
                          
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
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
        <TaskFormView 
          runRequest={runRequest} 
          formOpen={taskFormOpen}
          onActionSuccess={handleTaskClose}
          token={token} 
          showBorder={showBorder} 
          taskConfigObj={curTaskConfig } 
          taskObj={ curTask } 
          userName={userName} 
          email={email}
        />
        <TaskFormConfig 
          runRequest={runRequest} 
          formOpen={taskFormConfig}
          onActionSuccess={handleTaskClose}
          token={token} 
          showBorder={showBorder} 
          taskConfigObj={curTaskConfig } 
          taskObj={ curTask }
        />
        <Dialog
          open={openInstanceView}
          aria-labelledby="ProcessInstanceView"
          fullWidth={true}
          maxWidth='xl' onClose={handleCloseInstanceView}>
          <DialogTitle id="customized-dialog-title">Instance view for task: {curTaskId} of process instance: {instanceId}</DialogTitle>
          <DialogContent>
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
            <Button onClick={() => { handleCloseInstanceView() }} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={delegateAction}
          aria-labelledby="DelegateActionFlow"
          fullWidth={false}
          maxWidth='xl' onClose={handleCloseDelegate}>
          <DialogTitle id="customized-dialog-title">Delegate task</DialogTitle>
          <DialogContent>
            <TextField
                  autoFocus
                  margin="dense"
                  id="delegateTo"
                  label="Delegate to"
                  type="email"
                  variant="standard" 
                  onChange={e => {setDelegatedUser(e.target.value)}}
              />
          </DialogContent>
          <DialogActions>
            <Stack direction="row" spacing={1}>
              <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='delegateBut'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <Button onClick={() => { handleUserDelegate() }} variant="contained" color="primary">
                  Delegate
                </Button>
              </Box>
              <Button onClick={() => { handleCloseDelegate() }} variant="contained" color="primary">
                Cancel
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        <Dialog
          open={completeAction}
          aria-labelledby="CompleteActionFlow"
          fullWidth={false}
          maxWidth='xl' onClose={handleCloseComplete}>
          <DialogTitle id="customized-dialog-title">Complete task - custom outcome</DialogTitle>
          <DialogContent>
            <TextField
                  autoFocus
                  margin="dense"
                  id="outcomeRes"
                  label="Outcome"
                  type="outcome"
                  variant="standard" 
                  value={customOutcome}
                  onChange={e => {setCustomOutcome(e.target.value)}}
              />
          </DialogContent>
          <DialogActions>
            <Stack direction="row" spacing={1}>
              <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='completeBut'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <Button onClick={() => { handleUserComplete() }} variant="contained" color="primary">
                  Complete
                </Button>
              </Box>
              <Button onClick={() => { handleCloseComplete() }} variant="contained" color="primary">
                Cancel
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
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
    </div>
  );
}
