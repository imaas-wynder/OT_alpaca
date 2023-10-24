import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,Stack
} from '@mui/material';


export default function NamespaceNew(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder } = props;
  

  const [prefix, setPrefix] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [name, setName] = React.useState('');


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
      name: name,
      display_name: displayName,
      prefix: prefix
    }
    if (description) data.description=description;

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/namespaces`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.name) {
        onCreateSuccess(true);
      } 
      removeActiveId('newButton');

    }, '', []);
   

  };

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setPrefix('');
      setDisplayName('');
      setName('');
      setDescription('');
    }
    

  }, [newOpen]);

  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Create namespace</DialogTitle>
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
          
          <Stack spacing={2} direction="row">
            
            <TextField
              autoFocus
              margin="dense"
              id="namespace-disp-name"
              label="Display name"
              type="name"
              required
              variant="standard" 
              value={displayName}
              onChange={e => {setDisplayName(e.target.value)}}
            />
            <TextField
              margin="dense"
              id="namespace-name"
              label="Namespace name"
              type="name"
              required
              variant="standard" 
              value={name}
              onChange={e => {setName(e.target.value)}}
            />
            <TextField
              margin="dense"
              id="namespace-prefix"
              label="Prefix"
              type="name"
              required
              variant="standard" 
              value={prefix}
              onChange={e => {setPrefix(e.target.value)}}
            />
            
            
          </Stack>
          <Stack spacing={2} direction="row">
            
            <TextField
              margin="dense"
              id="type-desc"
              label="Description"
              type="name"
              variant="standard" 
              value={description} 
              multiline
              onChange={e => {setDescription(e.target.value)}}
            />
          </Stack>
          
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleCreate} disabled={!name }>Create</Button>
          </Box>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
