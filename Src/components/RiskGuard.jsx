import * as React from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  Typography,
  Stack,
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

export default function RiskGuard(props) {
  const { runRequest, docObject, closeAction, token, showBorder } = props;
  const [blobId, setBlobId] = useState('');

  const FormData = require('form-data');
  
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedFileName, setSelectedFileName] = React.useState('');

  const [rgResults, setRgResults] = React.useState([]);
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
  

  const handleLoadBlobId = (componentId) => {
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

  const rgProcessFile = (componentId) => {
    addActiveId(componentId);

    const formData = new FormData();
		formData.append(
			'File',
			selectedFile,
			selectedFileName,
		);
    
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/mtm-riskguard/api/v1/process`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*',  "Content-Type": "multipart/form-data" },
      data: formData
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        getRgValuesFromJson(res.data);
      }
      removeActiveId(componentId);
      
    }, '', []);
  }

  const getRgValuesFromJson = (inJsonStr) => {
    //console.log(inJsonStr);
    let outArray = [];
    if (!inJsonStr.results) {
      setResultsDone(true);
      return;
    }

    if (inJsonStr.results?.tme?.result?.Results?.ncategorizer) {
      outArray.push('---------PSI--------');
      inJsonStr.results.tme.result.Results.ncategorizer[0].KnowledgeBase.forEach(kb => {
        kb.Categories.Category.forEach(cat => {
          if (cat.Weight> 40) {
            outArray.push(cat.Name[0] + ': ' + cat.Weight);
          }
        })
        
      })
    }

    if (inJsonStr.results.tme && inJsonStr.results.tme.result) {
      outArray.push('---------PII--------')
      inJsonStr.results.tme.result.Results.nfinder[0].nfExtract[0].ExtractedTerm.forEach(extractedTerm => {

          if (extractedTerm.ConfidenceScore > 40) {
            if (extractedTerm.nfinderNormalized) {
              outArray.push(extractedTerm.CartridgeID + ': ' + extractedTerm.nfinderNormalized);
            }
            else if (extractedTerm.MainTerm.value) {
              outArray.push(extractedTerm.CartridgeID + ': ' + extractedTerm.MainTerm.value);
            }
          }
    
          if (extractedTerm.ClientNormalized) {
            outArray.push(extractedTerm.CartridgeID + ': ' + extractedTerm.ClientNormalized);
          }
        
      })
    }

    if (inJsonStr.results.ia && inJsonStr.results.ia.result) {
      outArray.push('---------IMAGE/VIDEO ANALYSIS--------')
      for (const key in inJsonStr.results.ia.result.Result) {
        outArray.push(key + ': ' + inJsonStr.results.ia.result.Result[key]);
      }

    }

   
    setRgResults(outArray);
    setResultsDone(true);
  }



  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      //console.log('RiskGuard loaded.');
        setResultsDone(false);
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
        if (selectedFile) rgProcessFile('resultDiv')
        // eslint-disable-next-line
      },[selectedFile]
    );
  
  
  return (
      <React.Fragment>
        <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==`entireDiv`}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin',
          flexGrow: 1, bgcolor: 'background.paper',
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
        }}
          >
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
              <Box sx={{fontWeight:'bold'}}>Results:</Box>
              {resultsDone && rgResults.length==0 && 'Processing complete, no entities found.'}
              {rgResults.map((item, index) => (
                <React.Fragment key={'rgResults' + index} >
                  <Typography fontSize="10pt" component='span'>{item}</Typography>
                  <br/>
                </React.Fragment>
              ))}
            </Stack>
      </Box>
    </React.Fragment>
  );
}
