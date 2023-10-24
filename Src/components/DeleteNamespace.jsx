import * as React from 'react';


// MUI components
import { Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function DeleteNamespace(props) {
  const { runRequest, deleteOpen, onDeleteSuccess, inObj, token, showBorder } = props;

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
    onDeleteSuccess(false);
  };

  const handleDelete = () => {
    addActiveId('delButton');
    let req = { 
      method: 'delete',
      url: `${inObj._links.self.href}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      //console.log(res);
      if (res.status && res.status==204) {
        onDeleteSuccess(true);
      }
      removeActiveId('delButton');
    }, '', []);
  };

 



  return (
    
      <Dialog open={deleteOpen} onClose={handleClose}>
        <DialogTitle>Delete {inObj.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the namespace: {inObj.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='delButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleDelete}>Delete</Button>
          </Box>
        </DialogActions>
      </Dialog>
    

    
  );
}
