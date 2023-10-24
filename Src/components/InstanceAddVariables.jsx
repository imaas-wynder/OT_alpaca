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

import { NoLuggageOutlined } from '@mui/icons-material';
import VariablesView from './VariablesView';

export default function InstanceAddVariables(props) {
  const { runRequest, executionOpen, onExecuteSuccess, instanceObj, token, showBorder } = props;

  const [extraProps, setExtraProps] = React.useState([]);


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

  
  const handleExecute = (componentId) => {
    addActiveId(componentId);

  
    let variables = [];
    
    for (let i=0; i<extraProps.length; i++) {
      variables.push({encryption: false, scope: 'local', name: extraProps[i].name, type: extraProps[i].type, value: ((extraProps[i].type=='date' && extraProps[i].value && dayjs(extraProps[i].value).isValid()) ? dayjs(extraProps[i].value).toISOString() : extraProps[i].value) });
    }
    
    
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${instanceObj.id}/variables`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'},
      data: variables
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
      setExtraProps([]);
    }
  }, [executionOpen]);






  return (
    
      <Dialog open={executionOpen} onClose={handleClose} maxWidth={'md'} fullWidth>
        <DialogTitle>Add variables for instance id: {instanceObj.id}</DialogTitle>
        <DialogContent className="exec-instance">
          <VariablesView inputFields={extraProps} setInputFields={(props) => {setExtraProps(props);}} canAdd={true} canEdit={true} canRemove={true} showDisplayName={false}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='execButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={() => handleExecute('execButton')} >Inject</Button>
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
