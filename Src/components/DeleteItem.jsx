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
  Switch,
  IconButton,
  Alert 
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

export default function DeleteItem(props) {
  const { runRequest, deleteOpen, onDeleteSuccess, inObj, token, showBorder, recursive, softDelete } = props;
  


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
    onDeleteSuccess(false);
  };


  const handleDelete = () => {
    addActiveId('delButton');
    let req = { 
      method: 'delete',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}${(inObj.category==='file' && isRecursive===true)?'/all':''}${(inObj.category==='folder' && isRecursive===true)?'?recursive=true':''}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if (res.status && res.status == 204) {
        onDeleteSuccess(true);
      }
      removeActiveId('delButton');
    }, '', []);
  };

  const handleRecycle = () => {
    addActiveId('delButton');
    let req = { 
      method: 'put',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/delete${(inObj.category==='file' && isRecursive===true)?'?all-version=true':''}${(inObj.category==='folder' && isRecursive===true)?'?recursive=true':''}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if (res.status && res.status == 204) {
        onDeleteSuccess(true);
      }
      removeActiveId('delButton');
    }, '', []);
  };

  useEffect(() => {
    //console.log('DeleteItem loaded.');
    if (deleteOpen) {
      setIsRecursive((recursive===true));
    }
  }, [deleteOpen]);



  return (
    
      <Dialog open={deleteOpen} onClose={handleClose}>
        <DialogTitle>Delete {inObj.category}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {(softDelete===true) ? 'recycle' : 'permanently delete'} the {inObj.category}: {inObj.name}?
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
            borderStyle: (activeId.split(',').find((obj) => {return obj=='delButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              {(softDelete===true) ? 
              <Button onClick={handleRecycle}>Recycle</Button>
              :
              <Button onClick={handleDelete}>Delete</Button>}
          </Box>
        </DialogActions>
      </Dialog>
    

    
  );
}
