import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';



// MUI components
import {
  Box,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  TextField,
  Tabs,
  Tab,
  Stack,
  Switch,
  Typography,
  LinearProgress
} from '@mui/material';
import TransformIcon from '@mui/icons-material/Transform';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TextContentDisplay from './TextContentDisplay';



  export default function DocumentNewView(props) {
    const {  runRequest, token, docObject , outPublicationDone } = props;


    const [publication, setPublication] = React.useState({});
    const [publicationId, setPublicationId] = React.useState('');
    const [publicationDone, setPublicationDone] = React.useState(false);

    const [working, setWorking] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [rendition, setRendition] = React.useState({});

    const [publicationView, setPublicationView] = React.useState({});

    const [publicationRefresh, setPublicationRefresh] = React.useState(false);
    const [renditionName, setRenditionName] = React.useState('');


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

    const getPrimaryRendition = (componentId, inObject, isExtra) => {
      addActiveId(componentId);
      
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObject.category}/${inObject.type}/${inObject.id}/contents?items-per-page=100&page=1`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        //console.log(res);
        if (res.data && res.data._embedded && res.data._embedded.collection) {
          let renditions = res.data._embedded.collection;
          for (let i=0; i<renditions.length; i++) {
            if (renditions[i].rendition_type==='primary') {
              setRendition({name: renditions[i].name, blob_id: renditions[i].blob_id, mime_type: (renditions[i].mime_type==='application/json' ? 'text/plain' : renditions[i].mime_type)});
            }
          }

        }
        
        removeActiveId(componentId);
      }, '', []);
    }


    const handleSendToTransform = (componentId) => {
      setErrorMsg('')
      setWorking(true);

      addActiveId(componentId);
      let docsArray = [
        {
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${rendition.blob_id}/download`,
          formatHint: rendition.mime_type,
          filenameHint: rendition.name
        } 
      ]

      let featureArray = [
            {
              feature: {namespace: "opentext.publishing.sources", name: "LoadSources" },
              path: "/documents",
              value: docsArray
            },
            {
              feature:{namespace:"opentext.publishing.execution",name:"SetPublishingTarget",version: "1.x"},
              path:"/publishingTarget",
              value: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${rendition.blob_id}/renditions`
            }
          ]
      


      let data = {
        target: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content`,
        publicationVersion: "1.x",
        policy: {
              namespace:"opentext.publishing.brava",
              name:"SimpleBravaView",
              version:"1.x"
            },
        tags: [
          {
            dev: "sample"
          }
        ],
        featureSettings: featureArray
      }



      let req = { 
        method: 'post',
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/publication/api/v1/publications/`, 
        data: data,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        if (res.status && (res.status===200 || res.status===201 || res.status===202)) {
          setPublicationId(res.data.id);
          setPublication(res.data);
          setWorking(false);
        }
        removeActiveId(componentId)

      }, '', []);

    }

    const handlePublicationRefresh = (componentId) => {
      addActiveId(componentId);

      let req = { 
        method: 'get',
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/publication/api/v1/publications/${publicationId}?embed=page_links`,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        if (res.status && (res.status===200 || res.status===201 || res.status===202)) {
          setPublication(res.data);
          if (res.data.status==='Complete') {
            //done
            setPublicationDone(true);
            outPublicationDone(res.data, renditionName);
          } else {
            if (res.data.status==='Failed') {
              setErrorMsg('There is an error in the Publication. Check the publication file.');
            }
          }
        }
        removeActiveId(componentId);
        setPublicationRefresh(false);

      }, '', []);
      
    }


  useEffect(
    () => {
      if (publicationId) {
        setPublicationRefresh(true);
        setTimeout(() => { handlePublicationRefresh('refreshLabel') }, 2000);
      }
    },[publicationId]
    );

    useEffect(
      () => {
        if (publicationRefresh===false && publicationId && !publicationDone && !errorMsg) {
          //refresh it again
          setPublicationRefresh(true);
          setTimeout(() => { handlePublicationRefresh('refreshLabel') }, 2000);
        }
      },[publicationRefresh]
      );

    
    // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        getPrimaryRendition('entireDiv', docObject, false);

    },[]
    );
   
   

      return (
        <React.Fragment>
          <Box sx={{ width: '100%' }}>
              <Stack
              direction="column" 
              spacing={2} 
              alignItems="left" 
              key="name-filter-stack" 
              sx={{ bgcolor: 'background.paper', 
                boxShadow: 1,
                borderRadius: 2,
                p: 2, mb: 1}}
              >
              
              {(publicationId && !publicationDone && !errorMsg) || working ? <LinearProgress /> : ''}
              {!rendition.name && <Typography>
                Getting primary rendition details...
                </Typography>}

                {rendition?.name && <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center" 
                  key="name-filter-stack"
                  >
                  <Typography variant="subtitle1" gutterBottom>
                      {publicationId?(publicationDone?'Document transformation successfull':(errorMsg?'ERROR':'Document transformation in progress...')):(working?'Creating publication...':'Please enter a rendition name and send it to transformation: ')}  
                  </Typography>
                  {!publicationId && !working && renditionName && <IconButton size="small" variant="outlined" color="success" title="Send to transform" onClick={() => { handleSendToTransform() }}>
                    <TransformIcon />
                  </IconButton> }
                  {publicationDone && <IconButton size="small" variant="outlined" color="success" title="View publication result" onClick={() => { setPublicationView(publication) }}>
                    <DownloadIcon />
                  </IconButton> }
                  <IconButton size="small" variant="outlined" color="warning" title="Refresh" onClick={() => { setPublicationId(''); setWorking(false); setPublicationDone(false); setErrorMsg('');}}>
                    <RefreshIcon />
                  </IconButton>
                  
                </Stack>}  
                {errorMsg && <React.Fragment>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant="subtitle1" color="error" gutterBottom>
                      {errorMsg}  
                    </Typography>
                    <IconButton size="small" variant="outlined" color="primary" title="View publication" onClick={() => { setPublicationView(publication) }}>
                      <VisibilityIcon />
                    </IconButton>
                  </Stack>
                      
                </React.Fragment>}  
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Name"
                  type="name"
                  fullWidth
                  required
                  variant="standard" 
                  value={renditionName} 
                  onChange={e => {setRenditionName(e.target.value)}}
                />
              </Stack>
          </Box>
          
            <TextContentDisplay 
                  jsonValue={publicationView}
                  setJsonValue={setPublicationView} 
                  textValue={''} 
                  setTextValue={()=>{}}
                />
          </React.Fragment>
      );
  }