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
  Typography
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

export default function DocumentRenditionNew(props) {
  const { runRequest, newFileOpen, onCreateSuccess, inObj, token, showBorder } = props;

  const FormData = require('form-data');
  
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedFileName, setSelectedFileName] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [renditionType, setRenditionType] = React.useState('secondary');

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
  
  const selectFile = (event) => {
		let curSelectedFile = event.target.files[0];

		setSelectedFile(curSelectedFile);
		setSelectedFileName(curSelectedFile.name);
    setFileName(curSelectedFile.name);
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
			selectedFile,
			selectedFile.name,
		);

    let req = { 
      method: 'post', 
      data: formData,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', "Content-Type": "multipart/form-data" } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.entries && res.data.entries[0].blobId) {
        setSnackBarMessage(`Success - uploaded file to: ${res.data.entries[0].blobId}`);
        setSnackBarSeverity('success');
        setShowSnackBar(true);

        setBlobId(res.data.entries[0].blobId);

      }
      removeActiveId('newButton');

    }, '', []);
  };

  const handleCreate = () => {
    addActiveId('blobId');

    let data = {
      name: fileName,
      blob_id: blobId,
      rendition_type: renditionType
    };

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/${inObj.type}/${inObj.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        setBlobId('');
        onCreateSuccess(true);
      }
      removeActiveId('blobId');
    }, '', []);
   

  };


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newFileOpen) {
      setSelectedFile(null);
      setSelectedFileName('');
      setFileName('');
      setBlobId('');
      setActiveId('');
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
        <DialogTitle>Upload new rendition</DialogTitle>
        <DialogContent className="add-document" sx={{
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
        <div>
            <div className="inline">
            
              <label htmlFor="files">
                <Button component="span">Select files...</Button>
              </label>
              <input id="files" type="file" accept="*" className="file-input" onChange={selectFile} />
            </div>
            <Typography variant="subtitle1" gutterBottom>
              <Box
                  sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  p: 0,
                  m: 0,
                  fontStyle: 'italic'
                  }}
              >
                {selectedFileName==''?'No document selected yet':'Selected document: ' + selectedFileName}
              </Box>
            </Typography>
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
            <TextField
              margin="dense"
              id="label"
              label="Rendition type"
              type="description"
              fullWidth 
              variant="standard" 
              value={renditionType} 
              onChange={e => {}}
            />
          </div>
          
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
              <Button onClick={handleUpload} disabled={!selectedFileName }>Upload</Button>
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
