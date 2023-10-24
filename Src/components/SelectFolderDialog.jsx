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
  DialogTitle,
  Snackbar,
  IconButton,
  Alert,
  Typography,
  Stack
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

import Scenario1 from './Scenario1';

export default function SelectFolderDialog(props) {
  const { runRequest, selectOpen, onSelectSuccess, token, showBorder, setOutFolderId, inFolder } = props;

  const [curFolder, setCurFolder] = React.useState({});
  
  const handleClose = () => {
    onSelectSuccess(false);
  };

  const doSelectParent = () => {
    if (curFolder?.id) {
      setOutFolderId(curFolder.id);
      onSelectSuccess(true);
    }
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (selectOpen) {
      setCurFolder({});
    }
  }, [selectOpen]);


  return (
    
      <Dialog open={selectOpen} onClose={handleClose} maxWidth={'xl'} fullWidth>
        <DialogTitle>Select folder</DialogTitle>
        <DialogContent sx={{
          maxHeight: '80vh',
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
          <Stack direction={'column'} spacing={2}>
              <Typography 
                variant="button" 
                display="block" 
                gutterBottom 
                sx={{
                  wordWrap: 'break-word',
                  color: curFolder.id ? 'green' : 'red'
                  }}>
                {curFolder.id ? 'Selected folder: ' + curFolder.name : 'Please select a folder below.'}
              </Typography>
              <Scenario1 
                runRequest={runRequest} 
                token={token} 
                showBorder={showBorder} 
                selectObject={() => {}} 
                isSelect={true} 
                inCategory={'folder'} 
                currentFolder={(object) => setCurFolder(object)} 
                inFolder={inFolder}
                urlLoaded = {true} 
                setUrlLoaded = {()=>{}}/>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={doSelectParent} disabled={!curFolder.id}>Select</Button>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
