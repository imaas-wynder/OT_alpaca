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
  Typography,Stack
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from 'prop-types';

import Scenario1 from './Scenario1';

export default function CustomSearchOpen(props) {
  const { runRequest, newFileOpen, onSelectSuccess, token, showBorder, configType, setOutObject, inFolder, setInFolder } = props;

  const [blobId, setBlobId] = React.useState('');

  const [selFile, setSelFile] = React.useState({});

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
    onSelectSuccess(false, {});
  };

  const handleSnackBarClose = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  }

  
  const getPrimaryRendition = (componentId, docObject) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${docObject.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.rendition_type=='primary') {
            //call download file
            setBlobId(item.blob_id);
          }
          });
        
      }
      removeActiveId(componentId);
      
    }, '', []);
  }

  const downloadItem = (componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${blobId}/download?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        var reader = new FileReader();
        reader.onload = function () {
          try {
            let objOut = JSON.parse(reader.result);
            let validFile = false;
            //console.log(objOut);
            if (configType==='search' && objOut?.headCells) {
              validFile=true;
            }
            if (configType==='automation' && objOut.length>0 && objOut[0].runAction) {
              validFile=true;
            }
            if (!validFile) {
              setSnackBarMessage(`The selected file does not appear to be a ${configType} configuration`);
              setSnackBarSeverity('error');
              setShowSnackBar(true);
            } else {
              setOutObject(selFile);
              onSelectSuccess(true, objOut);
            }
          } catch (error) {
            setSnackBarMessage(`The selected file does not appear to be a ${configType} configuration`);
            setSnackBarSeverity('error');
            setShowSnackBar(true);
          }
          
        };
        reader.onerror = function (error) {
          setSnackBarMessage(`The selected file does not appear to be a ${configType} configuration`);
          setSnackBarSeverity('error');
          setShowSnackBar(true);
        };
        
        reader.readAsText(res.data);


        
         
      }
      setBlobId(''); 
      removeActiveId(componentId);
      
    }, '', []);
  }

  const doSelectObject = (object) => {
    if (object.category==='file') {
      if (configType!=='document') {
        getPrimaryRendition('getBlob',object);
      } else {
        setOutObject(object);
        onSelectSuccess(true, object);
      }

      
    }
  }

    // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
    useEffect(
      () => {
          if (blobId!='') {
            downloadItem('getFile');
          }
      },[blobId]
      );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newFileOpen) {
      setBlobId('');
      setActiveId('');
      setSelFile({});
    }
  }, [newFileOpen]);

  

  return (
    
      <Dialog open={newFileOpen} onClose={handleClose} maxWidth={'xl'} fullWidth>
        <DialogTitle>{`Open ${configType} configuration`}</DialogTitle>
        <DialogContent sx={{
          maxHeight: '85vh',
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
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='getBlob'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin',
            }}>
              <Typography 
                variant="button" 
                display="block" 
                gutterBottom 
                sx={{
                  wordWrap: 'break-word',
                  color: selFile.name ? 'green' : 'red'
                  }}>
                {selFile?.category==='file' ? 'Selected file: ' + selFile.name : 'Please select a file below.'}
              </Typography>
          </Box>
          
              
          <Scenario1 
            runRequest={runRequest} 
            token={token} 
            showBorder={showBorder} 
            selectObject={(object, clickedAction) => {setSelFile(object); if (clickedAction===true) doSelectObject(object)}} 
            isSelect={true} 
            inCategory={'file'} 
            currentFolder={(object)=>{setInFolder(object)}}
            inFolder={inFolder?.id ?? '' }
            urlLoaded = {true} 
            setUrlLoaded = {()=>{}}/>

            {blobId && <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='getFile'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin',
              }}>
                <Typography 
                  variant="button" 
                  display="block" 
                  gutterBottom 
                  >
                  {`Got blob id: ${blobId}`}
                </Typography>
            </Box>}
          </Stack>
          
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={() => {doSelectObject(selFile)}} disabled={(selFile?.category!=='file')}>Open</Button>
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
