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

export default function CustomSearchSave(props) {
  const { runRequest, newFileOpen, onCreateSuccess, token, showBorder, configObject, configType, inExistingObject, setOutObject, inFolder, setInFolder } = props;

  //configType = search, automation

  const FormData = require('form-data');
   
  const [newDocType, setNewDocType] = React.useState('cms_file')
  const [fileName, setFileName] = React.useState('');
  const [parentId, setParentId] = React.useState('');
  const [parentName, setParentName] = React.useState('');
  const [curFolder, setCurFolder] = React.useState({});

  const [blobId, setBlobId] = React.useState('');

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
    onCreateSuccess(false);
  };

  const handleSnackBarClose = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  }

  const handleUpload = () => {
    addActiveId('newButton');

    const formData = new FormData();
		formData.append(
			'file',
      new Blob([JSON.stringify(configObject, null, 2)], {type: 'text/plain'}),
			`${configType}Config.json`
		);

    let req = { 
      method: 'post', 
      data: formData,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', "Content-Type": "multipart/form-data" } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.entries && res.data.entries[0].blobId) {
        setBlobId(res.data.entries[0].blobId);

      }
      removeActiveId('newButton');

    }, '', []);
   
  };

  const handleCreate = () => {
    addActiveId('blobId');

    let renditions = [];
    renditions.push({name: `${configType}Config.json`, blob_id: blobId, rendition_type: "primary"});
    renditions.push({name: "Brava rendition", mime_type: "application/vnd.blazon+json", rendition_type: "secondary"});
    let data = {};

    if (inExistingObject?.id) {
      //create a new version
      data = {
        name: inExistingObject.name,
        description: inExistingObject.description,
        version_label: ["next"],
        parent_folder_id: inExistingObject.parent_folder_id,
        renditions:renditions
      };
    } else {
      //create a new object
      data = {
        name: fileName,
        description: `Saved ${configType} configuration.`,
        version_label: ["first"],
        parent_folder_id: parentId,
        renditions:renditions
    };

    }

    
    
    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/${newDocType}${(inExistingObject?.id) ? `/${inExistingObject.id}/nextVersion` : ''}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        
        setOutObject(res.data);
        setBlobId('');
        onCreateSuccess(true);
      } 
      removeActiveId('blobId');

    }, '', []);
   

  };

  const doSelectParent = (object) => {
    setCurFolder(object);
    setInFolder(object);
    setParentId(object.id ?? ''); 
    setParentName(object.name ?? '');
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newFileOpen) {
      setFileName('');
      setParentId('');
      setParentName('');
      setCurFolder({});
      setBlobId('');
      setActiveId('');
      setNewDocType('cms_file');
    }
  }, [newFileOpen]);

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (blobId) {
      handleCreate();
    }
  }, [blobId]);


  return (
    
      <Dialog open={newFileOpen} onClose={handleClose} maxWidth={'xl'} fullWidth>
        <DialogTitle>{`Save ${configType} configuration`}</DialogTitle>
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
        {(!inExistingObject?.id) && <Stack direction={'column'} spacing={2}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                type="name"
                fullWidth
                required
                variant="standard" 
                value={fileName} 
                onChange={e => {setFileName(e.target.value)}}
              />
              
              <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word',
                color: parentName ? 'green' : 'red'
                }}>
              {parentName ? 'Selected folder: ' + parentName : 'Please select a folder below.'}
            </Typography>
              <Scenario1 
                runRequest={runRequest} 
                token={token} 
                showBorder={showBorder} 
                selectObject={(object, clickedAction) => {doSelectParent(object); if (clickedAction===true && fileName) handleUpload()}} 
                isSelect={true} 
                inCategory={'folder'} 
                currentFolder={doSelectParent} 
                inFolder={inFolder?.id ?? '' }
                urlLoaded = {true} 
                setUrlLoaded = {()=>{}}
                />
          </Stack>}
          {(inExistingObject?.id) && <Stack direction={'column'} spacing={2}>
            <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word',
                color: 'green'
                }}>
              {`Save as a new version of the file: ${inExistingObject.name} (${inExistingObject.id})?`}
            </Typography>
            
            </Stack>}
          
          {blobId && <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='blobId'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                wordWrap: 'break-word'
                }}>
              Uploaded blob id: {blobId ?? ''}
            </Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleUpload} disabled={(!fileName || !parentId) && !inExistingObject?.id}>Save</Button>
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
