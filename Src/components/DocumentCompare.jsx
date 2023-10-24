import * as React from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  Stack,
  Typography,
  IconButton
} from '@mui/material';

import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';

import "../style/BravaViewer.css";
import CustomSearchOpen from './CustomSearchOpen';

const VIEWER_ID = "file-compare-root";


export default function DocumentCompare(props) {
  const { runRequest, token, userName, showBorder  } = props;

  const [docObj, setDocObj] = useState([{},{}]);
  const [publicationData, setPublicationData] = useState([{},{}]);

  const [openSearch, setOpenSearch] = useState(false);
  const [curIndex, setCurIndex] = useState(-1);
  
  const [inFolder, setInFolder] = useState({}); //for keeping the last folder used
  
  const [message, setMessage] = useState('');
  
  const [bravaApi, setBravaApi] = useState(null);
  

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
  
  
  //========================options for the viewer

  const toolbarWithCompareStuff = {
    left: [
      
      { component: 'ZoomInButton' },
      { component: 'ZoomOutButton' },
      { component: 'ZoomExtentsButton' },
      { component: 'ZoomWidthButton' },
      { component: 'RotateButton' }
    ],
    center: [{ component: 'TitleText' }],
    right: [
      
      { component: 'PageSelector', style: { marginLeft: '0.5em' } }
    ]
  };
  
  
  
  const tabContainerEmpty = {
    sidebarName: 'tabContainerEmpty',
    primary: 'primary',
    tabs: []
  };
  


  //========================options for the viewer

  const handleLoadBlobId = (componentId, objectId, objIndex) => {
    addActiveId(componentId);
    
    let foundRendition = false;

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${objectId}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.mime_type=='application/vnd.blazon+json') {
            //call download file
            downloadItem('blobDiv', item.blob_id, objIndex);
            foundRendition=true;
          }
          });
        
      }
      removeActiveId(componentId);
      if (!foundRendition) {
        setMessage('Viewer rendition not found!');
      }
    }, '', []);
  }

  const loadBravaViewer = (componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/viewer/api/v1/viewers/brava-view-1.x/loader`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        //console.log(res.data);
        const scriptEl = document.createElement("script");
        scriptEl.appendChild(document.createTextNode(res.data));
        document.getElementsByTagName("head")[0].appendChild(scriptEl);
      }
      removeActiveId(componentId);
    }, '', []);
  };

  const downloadItem = (componentId, blobId, objIndex) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${blobId}/download?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        //console.log('Publication found')
        if (res.data.status==='Complete') {
          let tempArr = [...publicationData];
          tempArr[objIndex] = res.data;
          setPublicationData(tempArr);
        } else {
          setMessage('Rendition status is ' + (res.data.status ?? 'not found'));
        }
        
      }
      removeActiveId(componentId);
      
    }, '', []);
  }

  const handleSelect = (result, loadObj) => {
    setOpenSearch(false); 
    if (result) { 
      let curArr = [...docObj];
      curArr[curIndex] = loadObj;
      setDocObj(curArr); 
      handleLoadBlobId('blobId', loadObj.id, curIndex)
    }
  }


  useEffect(() => {
    //console.log('BravaApi');
    
    
    if (bravaApi && publicationData.length==2 && publicationData[0].id && publicationData[1].id) {
            bravaApi.setHttpHeaders({
              Authorization: "Bearer " + token
            });
            //other options 
            
            // bravaApi.setScreenBanner(
            //   "Developer Services Viewer by OpenText | Documents Compared at %Time"
            // );
          
            bravaApi.setUserName(userName);
            bravaApi.setScreenWatermark("DevEx Viewer");
      
            bravaApi.setLayout({
              
              topToolbar: 'toolbarWithCompareStuff',
              toolbarWithCompareStuff: toolbarWithCompareStuff,
              mainContainer: [
                { component: 'TabContainer', layoutKey: 'tabContainerEmpty' },
                { component: 'TextCompareContainer' }
              ],
              tabContainerEmpty: tabContainerEmpty
            })

            //bravaApi.clearAllPublications();

            bravaApi.addPublication(publicationData[0]);
            bravaApi.addPublication(publicationData[1]);

            bravaApi.comparePublications(publicationData[0].id, publicationData[1].id, 'text')


            bravaApi.render(VIEWER_ID); 
        }
        // eslint-disable-next-line
  }, [bravaApi, publicationData]);

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log('DocumentView loaded.');
      
        window.addEventListener("bravaReady", function (event) {
          const currentOrigin = window.location.origin;
          if (event.origin && event.origin !== currentOrigin) {
            return;
          }
          if (event.target && event.target.origin === currentOrigin) {
            
            setBravaApi(window[event["detail"]]);
            window.addEventListener(event.detail + '-close', function() {
              //console.log('Close button clicked');
              
            });
          }
      });
      loadBravaViewer('entireDiv');
        // eslint-disable-next-line
    },[]
    );

  
  return (
      <Box height="70vh">
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            {docObj.map((doc, index) => {
              let showMsg = '';
              if (doc.id) {
                showMsg = `Document: ${doc.name} (${doc.version_no}), publication status: ${publicationData[index].status ?? 'unknown'}`
              } else {
                showMsg = 'Please select a document'
              }
                return (
                  <Stack key={`Compare-${index}`} direction={'row'} spacing={1} alignItems={'center'}>
                    <Typography>{showMsg}</Typography>
                    <IconButton size="small" variant="outlined" color="primary" title="Load" 
                        onClick={() => { setOpenSearch(true); setCurIndex(index) }}>
                        <OpenInBrowserIcon />
                    </IconButton>
                  </Stack>
                  
                )
            }
            
            )}
          </Stack>
            {message && 
              <Box sx={{color:'red'}}><Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              >
              {message}
            </Typography></Box>}
        <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==`entireDiv`}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin'}}>
            <div className={"compare-div"} id={VIEWER_ID}></div>
        </Box>
        <CustomSearchOpen
          runRequest = {runRequest} 
          newFileOpen = {openSearch} 
          onSelectSuccess = {(result, loadObj) => {handleSelect(result, loadObj) }} 
          token = {token} 
          showBorder = {showBorder} 
          configType = {'document'} 
          setOutObject = {() => {}}
          inFolder={inFolder} 
          setInFolder={setInFolder}
        />
            
            
            
        </Box>
  );
}
