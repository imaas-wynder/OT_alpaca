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
  CircularProgress,
  Typography,
  Stack
} from '@mui/material';

export default function DeleteRendition(props) {
  const { runRequest, deleteOpen, onDeleteSuccess, inObj, inRenditionObj, token, showBorder } = props;

  const [activeId, setActiveId] = React.useState('');
  const [publicationId, setPublicationId] = React.useState('');

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
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/contents/${inRenditionObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.status && res.status==204) {
        onDeleteSuccess(true);
      }
      removeActiveId('delButton');
    }, '', []);
  };

  const handleDeletePublication = () => {
    addActiveId('delPubButton');
    let req = { 
      method: 'delete',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/publication/api/v1/publications/${publicationId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.status && res.status==204) {
        
      }
      removeActiveId('delPubButton');
    }, `Successfully deleted the publication ${publicationId}`, []);
  };

 
  const downloadBlob = (componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${inRenditionObj.blob_id}/download?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        var reader = new FileReader();
          reader.onload = function() {
            try {
              const jsonVar = JSON.parse(reader.result);
              if (jsonVar.id && jsonVar.status!=='') {
                setPublicationId(jsonVar.id);
              }
            } catch (error) {
              console.log('Not a valid JSON');
              console.log(reader.result);
            }
          }
          reader.readAsText(res.data);
      }
      
      removeActiveId(componentId);
      
    }, '', []);
  }

  
  useEffect(() => {
    console.log(`Got to the load part, object mime: ${inRenditionObj.mime_type}`);
    if (deleteOpen) {
      setPublicationId('');
    }
    if (deleteOpen && (inRenditionObj.mime_type==='application/json') && (inRenditionObj.rendition_type==='viewer_rendition')) {
      downloadBlob('dwnBlob');
    }
  }, [deleteOpen]);



  return (
    
      <Dialog open={deleteOpen} onClose={handleClose}>
        <DialogTitle>Delete version</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the rendition: {inRenditionObj.name} from {inObj.name}?
          </DialogContentText>
          {(inRenditionObj.mime_type==='application/json') && (inRenditionObj.rendition_type==='viewer_rendition') && !publicationId && 
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='dwnBlob'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
                <Stack direction={'row'} spacing={1}>
                <CircularProgress
                          size={24} 
                          thickness={6}
                        />
                  <Typography>Getting JSON file details...</Typography>
                </Stack>
              
            </Box>
            }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {publicationId && <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='delPubButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleDeletePublication}>{`Delete publication`}</Button>
          </Box>}
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
