import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';

import TraitInstanceComp from './TraitInstanceComp';

export default function TraitInstanceNew(props) {
  const { runRequest, newOpen, onCreateSuccess, inObject, token, showBorder } = props;
  

  const [traitObj, setTraitObj] = React.useState({});


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
    onCreateSuccess(false);
  };


  const handleCreate = () => {
    addActiveId('newButton');
    

    let data = {
      name: inObject.name,
      traits: {[traitObj.definition]: {[traitObj.name]: traitObj.properties}}
    }
    
    

    let req = { 
      method: 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObject.category}/${inObject.type}/${inObject.id}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        onCreateSuccess(true);
      } 
      removeActiveId('newButton');

    }, '', []);
   

  };


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      
      setTraitObj({});
    }
    

  }, [newOpen]);

  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Create new trait instance</DialogTitle>
        <DialogContent sx={{
          maxHeight: '60vh',
          mb: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
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
        <TraitInstanceComp runRequest={runRequest} newOpen={newOpen} outTraitFunc={(obj) => {setTraitObj(obj); console.log(obj);}} token={token} showBorder={showBorder} />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleCreate} disabled={!traitObj.name }>Create</Button>
          </Box>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
