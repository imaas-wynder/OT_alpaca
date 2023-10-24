import * as React from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  Typography,
  IconButton, Paper, Stack,
  Card,
  Button,
  CardMedia,
  CardContent
} from '@mui/material';

import { styled } from '@mui/material/styles';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RefreshIcon from '@mui/icons-material/Refresh';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  
}));

const Butt = ({ display, setIndex, refreshAction, curIndex, thArray, refreshDisabled }) => {
  return (
    <div className={display}>
      <IconButton 
        disabled={(curIndex===0)} 
        onClick={() => {if (curIndex>0) setIndex(curIndex-1);}}
        sx={{
          backgroundColor: '#e6e6e6',
          position: "absolute",
          top: "90%",
          left: "20%",
          opacity: "60%",
          transform: "translate(-50%, -50%)"
        }}>
        <ArrowBackIosNewIcon/>
      </IconButton>

      <IconButton 
        onClick={() => {refreshAction('pubRefresh')}} 
        disabled={refreshDisabled}
        sx={{
          backgroundColor: '#e6e6e6',
          position: "absolute",
          top: "90%",
          left: "50%",
          opacity: "60%",
          transform: "translate(-50%, -50%)"
        }}  
      >
        <RefreshIcon/>
      </IconButton>

      <IconButton 
        disabled={(curIndex===(thArray.length-1)) || thArray.length===0} 
        onClick={() => {if (curIndex<thArray.length) setIndex(curIndex+1);}}
        sx={{
          backgroundColor: '#e6e6e6',
          position: "absolute",
          top: "90%",
          left: "80%",
          opacity: "60%",
          transform: "translate(-50%, -50%)"
        }}  
      >
        <ArrowForwardIosIcon/>
      </IconButton>
      
    </div>
  );
};

export default function DocumentViewThumbnail(props) {
  const { runRequest, docObject, token, showBorder } = props;

  const [publicationId, setPublicationId] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [thumbnailArray, setThumbnailArray] = React.useState([]);
  const [thumbIndex, setThumbIndex] = React.useState(0);
  const [thImageUrl, setThImageUrl] = React.useState('');

  const [display, setDisplay] = useState("notdisplayed");

  const showButton = (e) => {
    e.preventDefault();
    setDisplay("displayed");
  };

  const hideButton = (e) => {
    e.preventDefault();
    setDisplay("notdisplayed");
  };


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
  

  const handleLoadImage = (url, componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: url, 
      responseType: 'blob', 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      if (res.status===200) {
        //image = res.data  
        setThImageUrl(URL.createObjectURL(res.data));
      } else {
        setThImageUrl('');
      }
      removeActiveId(componentId);
    }, '', []);
  }

  const handleLoadPublication = (componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${docObject.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      let found = false;
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.rendition_type==='secondary' && item.mime_type==='application/vnd.blazon+json') {
            setPublicationId(item.blob_id);
            found = true;
          }
          });
        
      }
      if (!found) setMessage('No viewer rendition for this document');
      removeActiveId(componentId);
    }, '', []);
  }


  const handlePublicationRefresh = (componentId) => {
    addActiveId(componentId);
    setThImageUrl('');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${publicationId}/download?avs-scan=false`,
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if (res.status && (res.status===200 || res.status===201 || res.status===202)) {
        if (res.data.status=='Complete') {
          //get to the URL
          let tmpJpegArr = [];
          if (res.data._embedded && res.data._embedded['pa:get_publication_artifacts']) {
            let artifactsArr = res.data._embedded['pa:get_publication_artifacts'];
            let foundX = false;
            for (let i=0; i<artifactsArr.length; i++) {
              if (artifactsArr[i].name==='thumbnails') {
                if (artifactsArr[i].available===true) {
                  if (artifactsArr[i]._embedded && artifactsArr[i]._embedded['ac:get_artifact_content'] && artifactsArr[i]._embedded['ac:get_artifact_content']._embedded) {
                    const urlTemplate = artifactsArr[i]._embedded['ac:get_artifact_content']._embedded.urlTemplate;
                    
                    let contentLinks = artifactsArr[i]._embedded['ac:get_artifact_content']._embedded['urn:blazon:page_links'];
                    for (let c=0; c<contentLinks.length; c++) {
                      let curLink = contentLinks[c];
                      for (const key in curLink) {
                        tmpJpegArr.push(urlTemplate.replace(RegExp(`{${key}}`, 'g'), curLink[key]));
                        
                      }
                    }

                    setThumbnailArray(tmpJpegArr);
                    foundX = true;
                  } else {
                    setMessage('Found the thumbnails artifacts node but the ac:get_artifact_content does not exist.')
                  }
                } else {
                  setMessage('Found the thumbnails artifacts node but it is not available.');
                }
              }
            }
            if (!foundX) setMessage('Publication complete but did not find the thumbnails artifacts node.');

          } else {
            //cannot get pdf file
            setMessage('Error while reading the publication URL (/._embedded.pa:get_publication_artifacts[name=thumbnails]._embedded.ac:get_artifact_content)');
          }

        } else {
          if (res.data.status==='Failed') {
            setMessage('There is an error in the Publication. Check the publication file.');
          }
          if (res.data.status==='Pending') {
            setMessage('The viewer rendition is still pending.');
          }
        }
      }
      removeActiveId(componentId);
      

    }, '', []);
    
  }






  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        setPublicationId('');
        setMessage('');
        setThumbnailArray([]);

        handleLoadPublication('pubId');
        // eslint-disable-next-line
    },[]
    );

  useEffect(
    () => {
        if (publicationId) handlePublicationRefresh('pubRefresh');
        // eslint-disable-next-line
      },[publicationId]
    );
  
  
  useEffect(
    () => {
        if (thumbnailArray.length>0) {
          if (thumbIndex===0) {
            handleLoadImage(thumbnailArray[0], 'loadImg');
          } else {
            setThumbIndex(0);
          }
          
        } 
          
        // eslint-disable-next-line
      },[thumbnailArray]
    );

  useEffect(
    () => {
        if (thumbnailArray.length>thumbIndex) handleLoadImage(thumbnailArray[thumbIndex], 'loadImg');
        // eslint-disable-next-line
      },[thumbIndex]
    );

    useEffect(
      () => {
          console.log(thImageUrl);
          // eslint-disable-next-line
        },[thImageUrl]
      );
  
  
  return (
      <React.Fragment>
        <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==`pubRefresh`}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin'}}>
            <Stack direction={'column'} spacing={1}>
              
              { 
                <Card
                  sx={{ minWidth: 200 }}
                  style={{ position: "relative", width: "100%" }}
                >
                  <div
                    onMouseEnter={(e) => showButton(e)}
                    onMouseLeave={(e) => hideButton(e)}
                  >
                    <Paper elevation={4}>
                      <CardMedia
                        style={{
                          marginLeft: "auto",
                          marginRight: "auto",
                          width: "100%",
                          height: "auto",
                          zIndex: "1"
                        }}
                        component="img"
                        height="200"
                        image={thImageUrl==='' ? 'images/NoThumbnail.JPG' : thImageUrl}
                        alt={`Thumbnail page ${thumbIndex+1}/${thumbnailArray.length}`}
                      />
                      <Butt display={display} setIndex={setThumbIndex} refreshAction={handlePublicationRefresh} refreshDisabled={(publicationId==='')} curIndex={thumbIndex} thArray={thumbnailArray}/>
                    </Paper>
                    
                  </div>
                </Card>
              }
              <Box sx={{color: (message==='')?'inherit':'red', justifyItems: 'center', alignSelf: 'center' }}>
                {message==='' && publicationId==='' && thumbnailArray.length===0 && 
                  <Typography variant="body2" color="text.secondary">Loading...</Typography>
                }
                {message && <Typography variant="body2">{message}</Typography>}
                {message==='' && thumbnailArray.length>0 && 
                  <Typography variant="body2" color="text.secondary">{`Page ${thumbIndex+1}/${thumbnailArray.length}`}</Typography>
                }
              </Box>
            </Stack>
            

        </Box>
    </React.Fragment>
  );
}
