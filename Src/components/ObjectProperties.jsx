import * as React from 'react';
import dayjs from 'dayjs';

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
  Paper, 
  Tab,
  Tabs,
  IconButton,
  Typography,
  Stack
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import SourceIcon from '@mui/icons-material/Source';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import PropTypes from 'prop-types';

import VariablesView from './VariablesView';
import DisplayArrayProperty from './DisplayArrayProperty';
import ACLDetails from './ACLDetails';
import FolderPaths from './FolderPaths';
import DocumentVersions from './DocumentVersions';
import DocumentRenditions from './DocumentRenditions';
import ObjectTraits from './ObjectTraits';
import DocumentViewThumbnail from './DocumentViewThumbnail';

function TabPanel(props) {
  const { children, value, index, mWidth, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      sx={{
        width: mWidth ?? '100%'
      }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export default function ObjectProperties(props) {
  const { runRequest, propsOpen, onClose, inObj, token, showBorder, clickedFolder, navigateToObject, propsSave, canUpdate, mWidth, isSoftDeleted } = props;
  const [value, setValue] = React.useState(0);
  const [curObj, setCurObj] = React.useState({});
  const [arrProps, setArrProps] = React.useState([]);
  const [activeId, setActiveId] = React.useState('');

  const [isEditMode, setIsEdit] = React.useState(false);

  const [fileName, setFileName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [extraProps, setExtraProps] = React.useState([]);
  const [repProps, setRepProps] = React.useState([]);

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


  //tab panel change  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePatch = () => {
    addActiveId('butPatch');

    
    let data = {
      name: fileName
    };

    if (inObj.category=='file') data.description = description;

    let properties = {};
    if (inObj.type!='cms_file' && inObj.type!='cms_folder') {
      for (let i=0; i<extraProps.length; i++) {
        properties[extraProps[i].name] = (extraProps[i].type=='double' || extraProps[i].type=='integer' || extraProps[i].type=='long') ? Number(extraProps[i].value) : ((extraProps[i].type=='date' && extraProps[i].value && dayjs(extraProps[i].value).isValid()) ? dayjs(extraProps[i].value).toISOString() : extraProps[i].value);
      }
      for (let i=0; i<repProps.length; i++) {
        properties[repProps[i].name] = repProps[i].values;
      }
      data.properties = properties;
    }

    let req = { 
      method: 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        onClose(true);
      } 
      removeActiveId('butPatch');

    }, '', []);

  };

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  
  const handleClose = () => {
    setValue(0);
    onClose(inObj.category == 'file' ? true : false);
  };

  const handleGet = () => {
    addActiveId('propsList');
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/${(isSoftDeleted===true)?'deleted':`instances/${inObj.category}/${inObj.type}`}/${inObj.id}`, 
      headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      let array = [];
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        setCurObj(res.data);
        setFileName(res.data.name);
        setDescription(res.data.description ?? '');
        array.push({name: 'Category', value: res.data.category});
        array.push({name: 'Type', value: res.data.type});
        array.push({name: '----------------', value: ''});
        array.push({name: 'Created by', value: res.data.created_by.service_account?'system':res.data.created_by.email});
        array.push({name: 'Created', value: getDateValue(res.data.create_time)});
        array.push({name: 'Owner', value: res.data.owner.service_account?'system':res.data.owner.email});
        array.push({name: 'Updated', value: getDateValue(res.data.update_time)});
        array.push({name: 'Updated by', value: res.data.updated_by.service_account?'system':res.data.updated_by.email});
        if (inObj.category=='file') {
          array.push({name: '----------------', value: ''});
          array.push({name: 'Version no', value: res.data.version_no});
          array.push({name: 'Mime type', value: res.data.mime_type});
          array.push({name: 'Content size', value: res.data.content_size});
          if (res.data.lock_time) {
            array.push({name: '----------------', value: ''});
            array.push({name: 'Locked at', value: getDateValue(res.data.lock_time) });
            array.push({name: 'Locked by', value: res.data.lock_owner.email});
          }
        }
        setArrProps(array);
      } 
      removeActiveId('propsList');
    }, '', []);
   

  };

  const actOnFile = (action) => {
    addActiveId('actOn' + action);
    let req = {};

    switch (action) {
      case 'lock':
        req = { 
          method: 'put', 
          date: {},
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/lock`, 
          headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
        };
        break;
      case 'unlock':
        req = { 
          method: 'delete', 
          date: {},
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/lock`, 
          headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
        };
        break;
      default:
        removeActiveId('actOn' + action);
        return;
    }

    
    runRequest(req, (res) => {
      let array = [];
      //console.log('Reached output function')
      if (res.status && res.status==200) {
        handleGet();
      } 
      removeActiveId('actOn' + action);
    }, '', []);
   

  };


  const getAttributes = () => {
    if (inObj.type=='cms_file' || inObj.type=='cms_folder') return;
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${inObj.type}/attributes-all`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        let outProps = [];
        let repeatingProps = [];
        for (let i=0; i<res.data._embedded.collection.length; i++) {
          if (!res.data._embedded.collection[i].system && !res.data._embedded.collection[i].internal) {
            if (!res.data._embedded.collection[i].repeating) {
              outProps.push(
                {name: res.data._embedded.collection[i].name, 
                  displayName: res.data._embedded.collection[i].display_name, 
                  type: res.data._embedded.collection[i].data_type, 
                  value: curObj.properties[res.data._embedded.collection[i].name] ?? getDefaultValue(res.data._embedded.collection[i].data_type) })
            } else {
              repeatingProps.push({name: res.data._embedded.collection[i].name, type: res.data._embedded.collection[i].data_type, displayName: res.data._embedded.collection[i].display_name, values: curObj.properties[res.data._embedded.collection[i].name] ?? []});
            }
          }
          
        }
        setExtraProps(outProps);
        setRepProps(repeatingProps);
        
      } 
      removeActiveId('attVals');

    }, '', []);
   

  };
  

  const getDefaultValue = (dataType) => {
    switch (dataType) {
      case 'string':
        return '';
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'date':
        return null;
      default:
        return '';
    }
  }
 
  const setRepVals = (index, array) => {

    let updatedValue = {name: repProps[index].name, type: repProps[index].type, displayName: repProps[index].displayName , values:array};

    let data = [...repProps];

    data.splice(index,1, updatedValue)
    setRepProps(data);

  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (propsOpen && inObj.id) {
      setValue(0);
      setArrProps([]);
      setCurObj({});
      setExtraProps([]);
      setRepProps([]);
      setFileName('');
      setDescription('');
      handleGet();
    }
  }, [propsOpen, inObj.id]);


  useEffect(() => {
    if (curObj.id) {
      getAttributes();
    }
  }, [curObj]);

  
  useEffect(() => {
    //console.log('ObjectProperties loaded.');
  }, []);

  
  useEffect(() => {
    canUpdate(!isEditMode);
  }, [isEditMode]);

  
  useEffect(() => {
    if (propsSave===true) {
      handlePatch();
    }
  }, [propsSave]);




  return (
    
      
          <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="properties tabs"
              sx={{ borderRight: 1, borderColor: 'divider', minWidth: 150 }}
            >
              <Tab icon={<CodeIcon/>} label="Attributes" {...a11yProps(0)} disabled={isEditMode} sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='butPatch'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'
              }}/>
              <Tab icon={<SettingsSystemDaydreamIcon/>} label="System" {...a11yProps(1)} sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='propsList'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}} disabled={isEditMode}/>
              <Tab icon={<EditAttributesIcon/>} label="Traits" {...a11yProps(2)} disabled={isEditMode}/>
              <Tab icon={<LockPersonIcon/>} label="ACL" {...a11yProps(3)} disabled={isEditMode}/>
              <Tab icon={<DataObjectIcon/>} label="JSON" {...a11yProps(4)} disabled={isEditMode}/>
              {inObj.parent_folder_id && <Tab icon={<SourceIcon/>} label="Folders" {...a11yProps(5)} disabled={isEditMode}/>}
              {inObj.category=='file' && <Tab icon={<AutoAwesomeMotionIcon/>} label="Versions" {...a11yProps(6)} disabled={isEditMode || (isSoftDeleted===true)}/>}
              {inObj.category=='file' && <Tab icon={<PhotoSizeSelectLargeIcon/>} label="Renditions" {...a11yProps(7)} disabled={isEditMode || (isSoftDeleted===true)}/>}
            </Tabs>
            
            <TabPanel value={value} index={0}>
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
              {inObj.category == 'file' && <TextField
                margin="dense"
                id="description"
                label="Description"
                type="description"
                fullWidth
                variant="standard" 
                value={description} 
                onChange={e => {setDescription(e.target.value)}}
              />}
              {inObj.type!='' && inObj.type!='cms_file' && inObj.type!='cms_folder' && <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
                <Stack direction="column" spacing={2}>
                  {extraProps.length>0 && 
                    <Paper elevation={3} sx={{p:2}}>
                      <VariablesView inputFields={extraProps} setInputFields={(props) => {setExtraProps(props);}} canAdd={false} canEdit={false} canRemove={true} showDisplayName={true}/>
                    </Paper>}
                  {repProps.length>0 && <Paper elevation={3} sx={{p:2}}>
                  {repProps.map((prop, index) => (
                    <DisplayArrayProperty arrProperty={prop.values} propType={prop.type} isEdit={true} title={prop.displayName ?? prop.name} setArrProperty={(arr) => {setRepVals(index, arr)}} key={prop.name}/>
                  ))}</Paper>}
                </Stack>              
              </Box>}
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Stack direction={'row'} spacing={2}>
                <Paper elevation={3} sx={{p:2, mt:2}}>
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='propsList'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                    
                      {arrProps.map((item, index) => (
                        
                          <Stack key={'arrPropertiesObject' + index} direction="row" spacing={2}>
                            <Typography variant="subtitle1" >
                              <Box
                                  sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  p: 0,
                                  m: 0,
                                  fontWeight: 'bold'
                                  }}
                              >
                                  {item.name}:
                                  </Box>
                              </Typography>
                              <Typography variant="subtitle1" >
                                <Box 
                                    sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    p: 0,
                                    m: 0
                                    }}
                                >
                                    {item.value}
                                </Box>
                            </Typography>
                          </Stack>
                      ))}
                  </Box>
                </Paper>
                {inObj.category==='file' && !(isSoftDeleted===true) && !curObj.lock_time && 
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='actOnlock'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                    <IconButton size="small" variant="outlined" color="success" title="Check out" onClick={() => { actOnFile('lock') }}>
                      <LockOpenIcon />
                    </IconButton>
                  </Box>
                }
                {inObj.category==='file' && !(isSoftDeleted===true) && curObj.lock_time && 
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='actOnunlock'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                    <IconButton size="small" variant="outlined" color="warning" title="Cancel check out" onClick={() => { actOnFile('unlock') }}>
                      <LockIcon />
                    </IconButton>
                  </Box>
                }
                {inObj.category==='file' && !(isSoftDeleted===true) &&  
                  <DocumentViewThumbnail runRequest={runRequest} docObject={curObj} token={token} showBorder={showBorder} />
                }
              </Stack>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <ObjectTraits inObj={curObj} runRequest={runRequest} token={token} showBorder={showBorder} isEditMode={isEditMode} setIsEdit={setIsEdit} isSoftDeleted={isSoftDeleted}/>
            </TabPanel>
            <TabPanel value={value} index={3}>
              <ACLDetails aclid={curObj.acl_id} runRequest={runRequest} token={token} showBorder={showBorder} inObj={inObj} setIsEdit={setIsEdit} onUpdate={(status)=>{handleGet();}} isSoftDeleted={isSoftDeleted}/>
            </TabPanel>
            <TabPanel value={value} index={4} mWidth={mWidth}>
              <Paper elevation={4} sx={{width: '100%'}}>
                <Box sx={{
                    maxHeight: '62vh',
                    mb: 0, 
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flexGrow: 1,
                    flexShrink: 1,
                    overflow: "auto",
                    overflowY: "auto",
                    overflowX: "auto",
                    "&::-webkit-scrollbar": {
                      width: 3,
                      height: 3,
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
                  <div><pre>{JSON.stringify(curObj,null,2)}</pre></div>
                </Box>
              </Paper>
              
              
            </TabPanel>
            <TabPanel value={value} index={5}>
              <Paper elevation={3} sx={{p:2, mt:2}}>
                <Typography variant="button" 
                  display="block" 
                  sx={{p:1, backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>Parent folder path</Typography>
                <FolderPaths runRequest={runRequest} token={token} showBorder={showBorder} inFolderIdArray={curObj.ancestor_ids} parentIdArray={[curObj.parent_folder_id]} clickedFolder={clickedFolder}/>
              </Paper>
              {curObj.linked_parent_folder_ids?.length>0 && <Paper elevation={3} sx={{p:2, mt:2}}>
                <Typography variant="button" 
                  display="block" 
                  sx={{p:1, backgroundColor: '#e1e1e1', fontWeight: 'bold'}} >Linked folder path(s)</Typography>
                <FolderPaths runRequest={runRequest} token={token} showBorder={showBorder} inFolderIdArray={curObj.linked_ancestor_ids} parentIdArray={curObj.linked_parent_folder_ids} clickedFolder={clickedFolder}/>
              </Paper>}
            </TabPanel>
            <TabPanel value={value} index={6}>
              <DocumentVersions inObj={curObj} runRequest={runRequest} token={token} showBorder={showBorder} navigateToObject={navigateToObject}/>
            </TabPanel>
            <TabPanel value={value} index={7}>
              <DocumentRenditions inObj={curObj} runRequest={runRequest} token={token} showBorder={showBorder}/>
            </TabPanel>
          </Box>
          
  );
}
