import * as React from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import parse from 'html-react-parser';

// MUI components
import {
  Box,
  Typography,
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

export default function DocumentViewHTML(props) {
  const { runRequest, docObject, closeAction, token, showBorder } = props;
  const [blobId, setBlobId] = useState('');
  
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [jsonContent, setJsonContent] = useState({});
  const [mimeType, setMimeType] = useState('');

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
            setMimeType(item.mime_type);
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
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        switch (mimeType) {
          case 'text/html':
            let parser = new DOMParser();
            const emailDoc = parser.parseFromString(res.data, 'text/html');
            const emailBody = emailDoc.getElementsByTagName('body');
            //console.log(emailBody[0].innerHTML);
            setHtmlContent(emailBody[0].innerHTML);
            break;
          case 'text/plain':
            if (res.data.constructor===Object || res.data.constructor===Array) {
              //it's actually a JSON
              setJsonContent(res.data);
            } else {
              setTextContent(res.data);
            }
            
            break;
          case 'application/json':
            setJsonContent(res.data);
            break;
          default:
            break;
        }
        
      }
      setBlobId(''); 
      removeActiveId(componentId);
      
    }, '', []);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log('DocumentViewHTML loaded');
        setHtmlContent('');
        setTextContent('');
        setJsonContent({});
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
  
  
  return (
      <React.Fragment>
        <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==`entireDiv`}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin'}}>
          {<div className="app-general-dialog">
            
            <IconButton className="title-icon" onClick={closeAction}>
              <CloseIcon/>
            </IconButton>
          </div>}
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
          {htmlContent!='' && 
            <Item>
              {parse(htmlContent)}
            </Item>}
          {JSON.stringify(jsonContent)!=='{}' && <div><pre>{JSON.stringify(jsonContent,null,2)}</pre></div>}
          {textContent!='' && <Typography sx={{whiteSpace: 'pre-line'}}>{textContent}</Typography>}
          {htmlContent=='' && textContent=='' && JSON.stringify(jsonContent)==='{}' && 
          <Item>
            Loading...
          </Item>}
      </Box>
    </React.Fragment>
  );
}
