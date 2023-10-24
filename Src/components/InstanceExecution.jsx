import * as React from 'react';
import dayjs from 'dayjs';


//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  IconButton,
  Alert,
  Typography,
  FormControl,
  FormControlLabel ,
  Select,
  MenuItem,
  Switch, Stack,
  FormGroup  
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

import { NoLuggageOutlined } from '@mui/icons-material';
import VariablesView from './VariablesView';

export default function InstanceExecution(props) {
  const { runRequest, executionOpen, onExecuteSuccess, instanceObj, token, showBorder } = props;

  const [extraProps, setExtraProps] = React.useState([]);
  const [executionId, setExecutionId] = React.useState('');
  const [curExecution, setCurExecution] = React.useState({});
  const [showCurExec, setShowCurExec] = React.useState(false);
  const [activity, setActivity] = React.useState({});


  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState("");
  const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");

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
  

  
  const handleClose = () => {
    onExecuteSuccess(false);
  };

  const handleSnackBarClose = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  }

  

  const handleExecutionId = (componentId) => {
    addActiveId(componentId);

  
    // let properties = {};
    // if (newDocType!='cms_file') {
    //   for (let i=0; i<extraProps.length; i++) {
    //     properties[extraProps[i].name] = extraProps[i].value;
    //   }
    //   data.properties = properties;
    // }

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/executions?processInstanceId=${instanceObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {

        res.data._embedded.executions.forEach( item => {
          if (item.parentId) {
            setExecutionId(item.id);
            setCurExecution(item);
          }
        })
      } else {
        if (res.message) {
          
        } else {
          //console.log(res);
          setSnackBarMessage(`Error, check console`);
          setSnackBarSeverity('error');
          setShowSnackBar(true);
        }
      }
      removeActiveId(componentId);
    });
  };

  const getActivityDetails = (activityId, componentId) => {
    addActiveId(componentId);
    setActivity({});

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow-history/v1/historic-process-instances/${instanceObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.processDefinitionId) {
        req = { 
          method: 'get', 
          url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models?processDefinitionId=${res.data.processDefinitionId}`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
        };
        runRequest(req, (result) => {
      
          if (result.data && result.data._embedded && result.data._embedded.models) {

              let modelId = result.data._embedded.models[0].id;
              if (!modelId) return;
              //get the model
              let req2 = { 
                method: 'get', 
                url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models/${modelId}?modelType=json`, 
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
              };
              runRequest(req2, (res2) => {
                if (res2.data) {
                  let modelDef = res2.data.modelContent;
                  if (modelDef.childShapes) {
                    for (let i=0; i<modelDef.childShapes.length; i++) {
                      if (modelDef.childShapes[i].resourceId===activityId) {
                        //this is the one...
                        setActivity(modelDef.childShapes[i]);
                      }
                    }
                  }
                }
                
              });

          }
        });


        
      } 
      removeActiveId(componentId);
    });
  };

  const handleExecute = (componentId) => {
    addActiveId(componentId);

  
    let variables = [];
    let data = {};
    
    for (let i=0; i<extraProps.length; i++) {
      variables.push({encryption: false, scope: 'local', name: extraProps[i].name, type: extraProps[i].type, value: ((extraProps[i].type=='date' && extraProps[i].value && dayjs(extraProps[i].value).isValid()) ? dayjs(extraProps[i].value).toISOString() : extraProps[i].value) });
    }
    if (variables) {
      data = {
        action:'trigger',
        variables:variables
      };
    } else {
      data = {action:'trigger'}
    }
    
    let req = { 
      method: 'put', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/executions/${executionId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'},
      data: data
    };
    runRequest(req, (res) => {
        if (res.message) {
          
        } else {
          onExecuteSuccess(true);
        }
      removeActiveId(componentId);
    });
  };

  
 

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (executionOpen) {
      setActiveId('');
      setExecutionId('');
      setExtraProps([]);
      setActivity({});
      handleExecutionId('execId');
    }
  }, [executionOpen]);






  return (
    
      <Dialog open={executionOpen} onClose={handleClose} maxWidth={'md'} fullWidth>
        <DialogTitle>Run execution for instance id: {instanceObj.id}</DialogTitle>
        <DialogContent className="exec-instance">
          <Stack direction={'column'} spacing={1}>
            <Stack direction={'row'} justifyContent={'space-between'} alignContent='center'>
              <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='execId'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                {`Execution ID: ${executionId}`}
              </Box>
              <Stack direction={'row'} spacing={1}>
                {!showCurExec && <IconButton size="small" variant="outlined" color="primary" title="Show current execution" onClick={() => { setShowCurExec(true) }}>
                  <VisibilityIcon />
                </IconButton>}
                {showCurExec && <IconButton size="small" variant="outlined" color="warning" title="Hide current execution" onClick={() => { setShowCurExec(false) }}>
                  <VisibilityOffIcon />
                </IconButton>}
                <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='activityName'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <IconButton size="small" variant="outlined" color="primary" title="Get activity details from model" onClick={() => { getActivityDetails(curExecution.activityId, 'activityName') }}>
                    <LocalActivityIcon />
                  </IconButton>
                </Box>
              </Stack>
              
            </Stack>
            {showCurExec && <div><pre>{JSON.stringify(curExecution,null,2)}</pre></div>}
            {activity.resourceId && 
              <Typography>{`Activity Type: ${activity.stencil?.id}; Name: ${activity.properties?.name}`}</Typography>}
          </Stack>
          <VariablesView inputFields={extraProps} setInputFields={(props) => {setExtraProps(props);}} canAdd={true} canEdit={true} canRemove={true} showDisplayName={false}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='execButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button disabled={!executionId} onClick={() => handleExecute('execButton')} >Execute</Button>
          </Box>
          
        </DialogActions>
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
      </Dialog>
    

    
  );
}
