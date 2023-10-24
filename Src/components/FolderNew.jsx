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
  FormControl,
  Select,
  Paper,
  MenuItem,
  Tab,
  Tabs,
  Typography,Stack
} from '@mui/material';
import PropTypes from 'prop-types';
import VariablesView from './VariablesView';
import DisplayArrayProperty from './DisplayArrayProperty';
import TraitInstanceAddMulti from './TraitInstanceAddMulti';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{width: 1}}
      {...other}
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

export default function FolderNew(props) {
  const { runRequest, newOpen, onCreateSuccess, parentId, token, showBorder, isObject } = props;
  
  const [value, setValue] = React.useState(0);

  const [traits, setTraits] = React.useState([]);

  const [folderName, setFolderName] = React.useState('');
  const [newFolderType, setNewFolderType] = React.useState((isObject===true)? 'cms_object':'cms_folder')

  const [extraProps, setExtraProps] = React.useState([]);
  const [repProps, setRepProps] = React.useState([]);
  const [typeList, setTypeList] = React.useState([]);



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
  
  //tab panel change  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  const handleClose = () => {
    onCreateSuccess(false);
  };


  const handleCreate = () => {
    addActiveId('newButton');
    let data = {
      name: folderName,
      parent_folder_id: parentId
    }
    let properties={};
    if (newFolderType!=='cms_folder' && newFolderType!=='cms_object') {
      //add the custom fields
      for (let i=0; i<extraProps.length; i++) {
        properties[extraProps[i].name] = (extraProps[i].type=='double' || extraProps[i].type=='integer' || extraProps[i].type=='long') ? Number(extraProps[i].value) : ((extraProps[i].type=='date' && extraProps[i].value && dayjs(extraProps[i].value).isValid()) ? dayjs(extraProps[i].value).toISOString() : extraProps[i].value);
      }
      //add the repeating attributes
      for (let i=0; i<repProps.length; i++) {
        properties[repProps[i].name] = repProps[i].values;
      }
      
      data.properties = properties;
    }
    
    //add the traits
    let traitsProps = {}
    for (let i=0; i<traits.length; i++) {
      
      if (traits[i].name) {
        if (!traitsProps[traits[i].definition]) {
          traitsProps[traits[i].definition] = {};
        }
        if (!traitsProps[traits[i].definition][traits[i].name]) {
          traitsProps[traits[i].definition][traits[i].name] = {};
        }
        traitsProps[traits[i].definition][traits[i].name] = traits[i].properties;
      }
    }
    
    if (traits.length>0) {
      data.traits = traitsProps;
    }

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${(isObject===true)?'object':'folder'}/${newFolderType}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        onCreateSuccess(true);
      } 
      removeActiveId('newButton');

    }, '', []);
   

  };

  const getTypes = () => {
    addActiveId('drpType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions?category=${(isObject===true)?'object':'folder'}&include-total=true&page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTypeList(res.data._embedded.collection);
        
      } 
      removeActiveId('drpType');

    }, '', []);
   

  };

  const getAttributes = () => {
    if (newFolderType==='cms_folder' || newFolderType==='cms_object') return;
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${newFolderType}/attributes-all`, 
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
                  value: getDefaultValue(res.data._embedded.collection[i].data_type) })
            } else {
              repeatingProps.push({name: res.data._embedded.collection[i].name, type: res.data._embedded.collection[i].data_type, displayName: res.data._embedded.collection[i].display_name, values: []});
            }
          }
          
          
        }
        setExtraProps(outProps);
        setRepProps(repeatingProps);
        //get the required traits also
        getRequiredTraits();
        
      } 
      removeActiveId('attVals');

    }, '', []);
   

  };

  const getRequiredTraits = () => {
    if (newFolderType==='cms_folder' || newFolderType==='cms_object') return;
    addActiveId('traitTab');


    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${newFolderType}/required-traits`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        let outProps = [];
        
        for (let i=0; i<res.data._embedded.collection.length; i++) {
            outProps.push(
              {name: res.data._embedded.collection[i].instance_name, 
              noDelete: true, 
              definition: res.data._embedded.collection[i].trait_name,
              properties: {}})
        }
        setTraits(outProps);

        
      } 
      removeActiveId('traitTab');

    }, '', []);
   

  };

  const setRepVals = (index, array) => {

    let updatedValue = {name: repProps[index].name, type: repProps[index].type, displayName: repProps[index].displayName , values:array};

    let data = [...repProps];

    data.splice(index,1, updatedValue)
    setRepProps(data);

  }

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

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setValue(0);
      setFolderName('');
      setExtraProps([]);
      setRepProps([]);
      setTraits([]);
      setNewFolderType((isObject===true)? 'cms_object':'cms_folder');
      getTypes();
    }
    

  }, [newOpen]);

  useEffect(() => {
    if (newFolderType!=='cms_folder' && newFolderType!=='cms_object') {
      getAttributes();
    }
  }, [newFolderType]);

  useEffect(() => {
    //console.log(repProps);
  }, [repProps]);


  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Create {(isObject===true) ? 'object' : 'folder'}</DialogTitle>
        <DialogContent sx={{
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
        
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label={(isObject===true) ? 'Object data' : 'Folder data'} {...a11yProps(0)} />
                
                <Tab label="Traits" {...a11yProps(1)} sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='traitTab'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}/>
                
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <Stack spacing={3} sx={{minWidth:500}}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="folder-name"
                  label={(isObject===true) ? 'Object name' : 'Folder name'}
                  type="name"
                  fullWidth
                  required
                  variant="standard" 
                  value={folderName}
                  onChange={e => {setFolderName(e.target.value)}}
                />
                <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='drpType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <FormControl variant="standard">
                      <Select
                      id="folderType"
                      value={newFolderType}
                      onChange={(event) => {setNewFolderType(event.target.value); setExtraProps([]); setRepProps([]);}} 

                    >
                      {typeList.map((item) => (
                        <MenuItem key={item.id} value={item.system_name}>{item.display_name}</MenuItem>
                      ))}
                      
                    </Select>
                  </FormControl>
                </Box>
                {newFolderType!='' && newFolderType!='cms_folder' && newFolderType!='cms_object' && 
                  <Box sx={{
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
                      <DisplayArrayProperty arrProperty={prop.values} isEdit={true} propType={prop.type} title={prop.displayName ?? prop.name} setArrProperty={(arr) => {setRepVals(index, arr)}} key={prop.name}/>
                    ))}</Paper>}
                  </Stack>  
                </Box>
                }
              </Stack>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TraitInstanceAddMulti 
                runRequest={runRequest} 
                newOpen={true} 
                pushTraitArray={(traitArray) => setTraits(traitArray)} 
                token = {token} 
                showBorder = {showBorder} 
                inTraitArray={traits}/>
            </TabPanel>
            
            
           
          
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleCreate} disabled={!folderName }>Create</Button>
          </Box>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
