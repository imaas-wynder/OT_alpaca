import * as React from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  Typography,
  Stack,
  Snackbar,
  Alert,
  IconButton, Paper
} from '@mui/material';

import { styled } from '@mui/material/styles';
import "../style/BravaViewer.css";
import CloseIcon from "@mui/icons-material/Close";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  
}));

export default function Capture(props) {
  const { runRequest, docObject, closeAction, token, showBorder, cpMode } = props;
  const [blobId, setBlobId] = useState('');

  const [country, setCountry] = useState('USA');

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState("");
  const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");
  
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedFileName, setSelectedFileName] = React.useState('');

  const [barcodeResult, setBarcodeResult] = React.useState({});

  const [cpPdf, setCpPdf] = React.useState([]);
  const [resultsDone, setResultsDone] = React.useState(false);
  

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
  
  const handleSnackBarClose = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  }

  const handleLoadBlobId = (componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${docObject.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.rendition_type=='primary') {
            //call download file
            setBlobId(item.blob_id);
            setSelectedFileName(item.name);
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
        setSelectedFile(res.data);
      }
      setBlobId(''); 
      removeActiveId(componentId);
      
    }, '', []);
  }

  const cpProcessFile = (componentId) => {
    addActiveId(componentId);


  let contentType = "";
  switch (selectedFileName.split('.')[selectedFileName.split('.').length - 1].toLowerCase()) {
    case 'tif':
      contentType = "image/tiff";
      break;
    case 'tiff':
      contentType = "image/tiff";
      break;
    case 'jpg':
      contentType = "image/jpeg";
      break;
    case 'jpeg':
      contentType = "image/jpeg";
      break;
    case 'pdf':
      contentType = "application/pdf";
      break;
    default:
      setSnackBarMessage('Extension not supported:' + selectedFileName.split('.')[selectedFileName.split('.').length - 1].toLowerCase() + '. Select an image file or pdf');
      setSnackBarSeverity('warning');
      setShowSnackBar(true);
      console.log('Extension not supported:' + selectedFileName.split('.')[selectedFileName.split('.').length - 1].toLowerCase() + '. Select an image file or pdf')
      setResultsDone(true);
      return;
  }

  var reader = new FileReader();

  reader.readAsDataURL(selectedFile);
  reader.onload = function () {
    const regex = /data:.*base64,/
    captureUploadDoc(reader.result.replace(regex,""), contentType);
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
    setResultsDone(true);
  };
    
    
  }

  const captureUploadDoc = (fileBase64, contentType) => { 

    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/files`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*',  "Content-Type": "application/json" },
      data: {
            "data": fileBase64, 
            "contentType": contentType,
            "offset": 0
    }
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        if (cpMode==='barcode') {
          captureBarcode(res.data.id, contentType);
        } else {
          captureFullPageOcr(res.data.id, contentType);
        }
        
      }
      
    }, '', []);
} 

const captureBarcode = (fileId, contentType) => { 
  let req = { 
    method: 'post', 
    url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/services/readbarcodes`, 
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*',  "Content-Type": "application/json" },
    data: {
      "serviceProps":
        [{"name":"Env","value":"D"},
          {"name":"Mode","value":"Normal"},
          {"name":"BarcodeTypes","value":""}],
      "requestItems":
      [{"nodeId":1,
        "values":
               [{"name":"OutputType","value":"Pdf"},
                {"name":"Version","value":"Pdf"},
                {"name":"Compression","value":"None"},
                {"name":"ImageSelection","value":"OriginalImage"}],
        "files":
              [{"name":"TestImage",
                "value":fileId,
                "contentType":contentType}]
          }]
      }
  };
  runRequest(req, (res) => {
    if (res.data?.resultItems) {
      setBarcodeResult(res.data.resultItems);
    } 
    setResultsDone(true);
    
  }, '', []);
} 

const captureFullPageOcr = (fileId, contentType) => { 
  let req = { 
    method: 'post', 
    url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/services/fullpageocr`, 
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*',  "Content-Type": "application/json" },
    data: {
      "serviceProps":
        [{"name":"Env","value":"D"},
          {"name":"OcrEngineName","value":"Advanced"},
          {"name":"AutoRotate","value":"False"},
          {"name":"Country","value":country},
          {"name":"ProcessingMode","value":"VoteOcrAndEText"}],
      "requestItems":
      [{"nodeId":1,
        "values":
               [{"name":"OutputType","value":"Pdf"},
                {"name":"Version","value":"Pdf"},
                {"name":"Compression","value":"None"},
                {"name":"ImageSelection","value":"OriginalImage"}],
        "files":
              [{"name":"TestImage",
                "value":fileId,
                "contentType":contentType}]
          }]
      }
  };
  runRequest(req, (res) => {
    //console.log('Reached output function')
    //console.log(res.data);
    if (res.data?.resultItems?.length>0 && res.data.resultItems[0].files?.length>0) {
      setCpPdf(res.data.resultItems[0].files[0].value);
      captureGetPdf(res.data.resultItems[0].files[0].value);
    } 
    
  }, '', []);
} 

const captureGetPdf = (fileId) => { 

  let req = { 
    method: 'get', 
    url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/files/${fileId}`, 
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
    responseType: 'blob'
  };
  runRequest(req, (res) => {
    //console.log('Reached output function')
    if (res.data) {
      // create file link in browser's memory
      const href = URL.createObjectURL(res.data);

      // create "a" HTLM element with href to file & click
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', 'capture_response.pdf'); //or any other extension
      document.body.appendChild(link);
      link.click();

      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } 
    
    
  }, '', []);
} 





  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log('Capture loaded.')
        setResultsDone(false);
        setBarcodeResult({});
        handleLoadBlobId('entireDiv');
        // eslint-disable-next-line
    },[]
    );

  useEffect(
    () => {
        if (blobId) downloadItem('blobDiv')
        // eslint-disable-next-line
      },[blobId]
    );

  useEffect(
    () => {
        if (selectedFile) cpProcessFile('resultDiv')
        // eslint-disable-next-line
      },[selectedFile]
    );
  
  
  return (
      <React.Fragment>
        <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==`entireDiv`}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin'}}>
          <div className="app-general-dialog">
            
            <IconButton className="title-icon" onClick={closeAction}>
              <CloseIcon/>
            </IconButton>
          </div>
          {blobId && 
              <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='blobDiv'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                wordWrap: 'break-word'
                }}>
              BlobId: {blobId}
            </Typography>}
            <Stack direction="column" spacing={1} sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='resultDiv'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'
                }}>
              {cpPdf && (cpMode!=='barcode') && <Box sx={{fontWeight:'bold'}}>PDF id: {cpPdf}</Box>}
              {resultsDone && <Box sx={{fontWeight:'bold'}}>Processing complete.</Box>}
              {resultsDone && (cpMode==='barcode') && <div><pre>{JSON.stringify(barcodeResult, null, 2) }</pre></div>}
            </Stack>
      </Box>
        <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={showSnackBar}
            autoHideDuration={3000}
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
    </React.Fragment>
  );
}
