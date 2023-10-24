import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch
} from '@mui/material';

export default function RestoreItem(props) {
  const { runRequest, restoreOpen, onRestoreSuccess, inObj, token, showBorder, recursive } = props;
  


  const [activeId, setActiveId] = React.useState('');
  const [isRecursive, setIsRecursive] = React.useState(false);

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
    onRestoreSuccess(false);
  };


  const handleRestore = () => {
    addActiveId('resButton');
    let req = { 
      method: 'put',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/deleted/${inObj.id}/restore${(inObj.category==='file' && isRecursive===true)?'?all-version=true':''}${(inObj.category==='folder' && isRecursive===true)?'?recursive=true':''}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.status && (res.status === 200 || res.status === 201)) {
        onRestoreSuccess(true);
      }
      removeActiveId('resButton');
    }, '', []);
  };

  useEffect(() => {
    if (restoreOpen) {
      setIsRecursive((recursive===true));
    }
  }, [restoreOpen]);



  return (
    
      <Dialog open={restoreOpen} onClose={handleClose}>
        <DialogTitle>Restore {inObj.category}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore the {inObj.category}: {inObj.name}?
          </DialogContentText>
          {(inObj.category==='file' || inObj.category==='folder') && <FormControlLabel
            control={
              <Switch checked={isRecursive} onChange={(e) => {setIsRecursive(e.target.checked); }} name="isRecursive"/>
            }
            label={(inObj.category==='file')?'All versions':'Recursive'}/>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='resButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleRestore}>Restore</Button>
          </Box>
        </DialogActions>
      </Dialog>
    

    
  );
}
