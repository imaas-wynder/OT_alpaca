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
  FormControlLabel ,
  Switch, 
  FormGroup  
} from '@mui/material';

export default function DeleteType(props) {
  const { runRequest, deleteOpen, onDeleteSuccess, inObj, token, showBorder } = props;
  

  const [forceDelete, setForceDelete] = React.useState(false);

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
    setForceDelete(false);
    onDeleteSuccess(false);
  };


  const handleDelete = () => {
    addActiveId('delButton');
    let req = { 
      method: 'delete',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${inObj.system_name}?force-delete-all-instances=${forceDelete ? 'true':'false'}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.status && res.status==204) {
        setForceDelete(false);
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
            Are you sure you want to delete the {inObj.category} type: {inObj.name}?
          </DialogContentText>
          <FormGroup>
            <FormControlLabel control={<Switch checked={forceDelete} onChange={e => {setForceDelete(e.target.checked)}} name="forceDelete" />} label="Force delete all object instances" />
          </FormGroup>
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
