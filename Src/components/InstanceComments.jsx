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
  LinearProgress,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableSortLabel,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Paper, 
  Snackbar
} from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Stack } from '@mui/system';



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




export default function InstancesComments(props) {
  const { runRequest, token, instanceid, showBorder } = props;


  const [rows, setRows] = React.useState(() => []);
  const [rowCount, setRowCount] = useState(0);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [updateResponse, setUpdate] = React.useState('');

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState("");
  const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");

  const [commentObj, setCommentObj] = React.useState({});
  const [curCommentValue, setCurCommentValue] = React.useState("");

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

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
      //console.log(newPage);
      handleRefreshList(false, newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
      handleRefreshList(false, 0, parseInt(event.target.value, 10));
    };

    const handleSnackBarClose = () => {
      setShowSnackBar(false);
      setSnackBarMessage("");
    }

    const handleRefreshList = (force, inPage, inRowsPerPage) => {
      if (force) setRows([]);
      getList('resList', inPage, inRowsPerPage);
    }

    const getList = (componentId, inPage, inRowsPerPage) => {
      addActiveId(componentId);
      setCommentObj({});
      if (!inRowsPerPage) inRowsPerPage=10;
      
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${instanceid}/comments?offset=${inPage*inRowsPerPage}&count=${inRowsPerPage}`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        if (res.data && res.data._embedded && res.data._embedded.comments) {
          setRows(res.data._embedded.comments);
        }
        if (res.message) {
          
        }
        setUpdate('');
        removeActiveId(componentId);
      });
    }

    const getCount = (componentId) => {
      addActiveId(componentId);
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${instanceid}/comments?offset=0&count=1000`,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        //console.log(res);
        if (res.data && res.data._embedded && res.data._embedded.comments) {
          setRowCount(res.data._embedded.comments.length); 
        }
        if (res.message) {
          
        }
        
        setUpdate('');
        removeActiveId(componentId);
      });
    }
  


  const handleSaveEditMode = (componentId) => {
    addActiveId(componentId);
    //console.log('Posting comment:' + curVarValue + ' for instance id: ' + instanceid)
   let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${instanceid}/comments`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
      data: {includeUserIds:false, message:curCommentValue}
      };
    runRequest(req, (res) => {
      //console.log(res);
      
      if (res.message) {
        
      } else {
        setSnackBarMessage(`Sent comment`);
        setSnackBarSeverity('success');
        setShowSnackBar(true);
      }
      
      setCurCommentValue('');
      setUpdate('true');
      removeActiveId(componentId);
    });
  }


  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  
  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        
        handleRefreshList(false, page, rowsPerPage);
    },[]
    );

  useEffect(
    () => {
        if (rows.length>0) getCount('pageContainer');
    },[rows]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE updateResponse changes
  useEffect(
    () => {
        //console.log("useEffect() on updateResponse");
        if (updateResponse != '') {
          //console.log("updateResponse was something")
          handleRefreshList(false, page, rowsPerPage);
        }
    },[updateResponse]
    );

  return (
          <React.Fragment>
            <div className="dialog-content">
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='resList'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin',
              }}>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Author</TableCell>
                      <TableCell align="left">Time</TableCell>
                      <TableCell sx={{ maxWidth: 500, wordWrap: "break-word" }} align="left">Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} hover selected={commentObj.id==row.id} onClick={() => {setCommentObj(row)}}>
                        <TableCell align="left">{row.author}</TableCell>
                        <TableCell align="left">{getDateValue(row.time)}</TableCell>
                        <TableCell sx={{ maxWidth: 500, wordWrap: "break-word" }} align="left">{ row.message }</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
                        colSpan={4}
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
            <div>
            <Box sx={{
                        borderStyle: (activeId.split(',').find((obj) => {return obj==`txtComment`}) && showBorder)?'solid':'none', 
                        borderColor: 'red',
                        borderWidth: 'thin',
                        }}>
                <TextField
                  margin="dense"
                  id="newComment"
                  label="New comment"
                  type="value"
                  fullWidth
                  multiline
                  rows = {4}
                  required
                  variant="standard"
                  value = {curCommentValue}
                  onChange={e => {setCurCommentValue(e.target.value)}}
                />
                </Box>
              <Button variant="outlined" onClick={() => handleSaveEditMode('txtComment')}>Add</Button>
              </div>
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
          </React.Fragment>
  );
}
