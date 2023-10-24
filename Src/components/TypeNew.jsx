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
  InputLabel,
  FormControl,
  Select,
  Paper,
  MenuItem,Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';


import DataObjectIcon from '@mui/icons-material/DataObject';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import ListIcon from '@mui/icons-material/List';

import AttributesView from './AttributesView';
import RequiredTraitsView from './RequiredTraitsView';
import IndexesView from './IndexesView';
import PropTypes from 'prop-types';



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


export default function TypeNew(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder, namespaces } = props;
  
  const [value, setValue] = React.useState(0);

  const [namespace, setNamespace] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [parent, setParent] = React.useState('');

  const [attributes, setAttributes] = React.useState([]);
  const [traits, setTraits] = React.useState([]);
  const [indexes, setIndexes] = React.useState([]);
  
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
    let attVals = [];
    for (let i=0; i<attributes.length; i++) {
      let curItem = {name: attributes[i].name, display_name: attributes[i].displayName, data_type: attributes[i].type, repeating: attributes[i].repeating, required: attributes[i].required, unique: attributes[i].unique, read_only: attributes[i].readOnly, searchable: attributes[i].searchable, sortable: attributes[i].sortable}
      if (attributes[i].defaultValue) {
        curItem.default_value= attributes[i].type=='date' ? attributes[i].defaultValue.toISOString() : attributes[i].defaultValue;
      }
      if (attributes[i].type=='string' && attributes[i].size) {
        curItem.size=attributes[i].size;
      }
      attVals.push(curItem);
    }

    let data = {
      name: name,
      display_name: displayName,
      namespace: namespace,
      attributes: attVals
    }

    if (parent) data.parent=parent;
    if (description) data.description=description;

    if (traits.length>0) data.required_traits=traits;

    if (indexes.length>0) data.indexes=indexes;

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${category}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {

        onCreateSuccess(true);
      } 
      removeActiveId('newButton');

    }, '', []);
   

  };

  const getTypes = (category, namespace) => {
    addActiveId('drpType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions?category=${category}&namespace=${namespace}&include-total=true&page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTypeList(res.data._embedded.collection);
        
      } else {
          setTypeList([]);
      }
      removeActiveId('drpType');

    }, '', []);
   

  };

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setNamespace('');
      setDisplayName('');
      setName('');
      setCategory('');
      setDescription('');
      setParent('');
      setValue(0);
      setIndexes([]);
      setTraits([]);
      setAttributes([]);
      getTypes(category, namespace);
    }
    

  }, [newOpen]);

  useEffect(() => {
    getTypes(category, namespace);
  }, [category, namespace]);

  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Create type</DialogTitle>
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
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                orientation="horizontal"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="properties tabs"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                
                
                <Tab icon={<DataObjectIcon/>} label="Attributes" {...a11yProps(0)} />
                <Tab icon={<EditAttributesIcon/>} label="Required Traits" {...a11yProps(1)} />
                <Tab icon={<ListIcon/>} label="Indexes" {...a11yProps(2)} />
              </Tabs>
            </Box>
                <Stack spacing={2} direction="row">
                  <Box >
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                      <InputLabel id="select-namespace">Namespace</InputLabel>
                        <Select
                        labelId="select-namespace"
                        label="Namespace"
                        id="namespaceDrp"
                        value={namespace} 
                        
                        onChange={(event) => {setNamespace(event.target.value);}} 

                      >
                        {namespaces.map((item) => (
                          <MenuItem key={item.name} value={item.name}>{item.display_name + ' (' + item.prefix + ')'}</MenuItem>
                        ))}
                        
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="type-disp-name"
                    label="Display name"
                    type="name"
                    required
                    variant="standard" 
                    value={displayName}
                    onChange={e => {setDisplayName(e.target.value)}}
                  />
                  <TextField
                    margin="dense"
                    id="type-name"
                    label="Type name"
                    type="name"
                    required
                    variant="standard" 
                    value={name}
                    onChange={e => {setName(e.target.value)}}
                  />
                  
                  
                </Stack>
                <Stack spacing={2} direction="row">
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='drpType'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                      <InputLabel id="select-parent-type">Parent Type</InputLabel>
                        <Select
                        labelId="select-parent-type"
                        label="Parent Type"
                        id="parentType"
                        value={parent} 
                        
                        onChange={(event) => {setParent(event.target.value);}} 

                      >
                        {typeList.map((item) => (
                          <MenuItem key={item.id} value={item.system_name}>{item.display_name}</MenuItem>
                        ))}
                        
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                  <FormControl sx={{ m: 1, minWidth: 200 }} variant="standard">
                      <InputLabel id="select-category">Category</InputLabel>
                      <Select
                        labelId="select-category"
                        id="select-sel-category"
                        value={category}
                        label="Category"
                        onChange={e => {setCategory(e.target.value)}} 
                      >
                        <MenuItem key={'file'} value={'file'}>{'file'}</MenuItem>
                        <MenuItem key={'folder'} value={'folder'}>{'folder'}</MenuItem>
                        <MenuItem key={'object'} value={'object'}>{'object'}</MenuItem>
                        <MenuItem key={'relation'} value={'relation'}>{'relation'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    margin="dense"
                    id="type-desc"
                    label="Description"
                    type="description"
                    multiline
                    variant="standard" 
                    value={description}
                    onChange={e => {setDescription(e.target.value)}}
                  />
                </Stack>
          
            
            <TabPanel value={value} index={0}>
              <Stack direction="column" spacing={2}>
                <Paper elevation={3} sx={{p:2}}>
                  <AttributesView inputFields={attributes} setInputFields={(props) => {setAttributes(props);}} isNew={true} isEdit={false} actionOnAttribute={() => {}}/>
                </Paper> 
              </Stack>  
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Stack direction="column" spacing={2}>
                <Paper elevation={3} sx={{p:2}}>
                  <RequiredTraitsView 
                    inputFields={traits} 
                    setInputFields={(props) => {setTraits(props);}} 
                    isNew={true} 
                    isEdit={false} 
                    actionOnTrait={() => {}}
                    runRequest={runRequest} 
                    token={token} 
                    showBorder={showBorder}
                    />
                </Paper> 
              </Stack>  
            </TabPanel>
            <TabPanel value={value} index={2}>
              <Stack direction="column" spacing={2}>
                <Paper elevation={3} sx={{p:2}}>
                  <IndexesView  
                    inputFields={indexes} 
                    setInputFields={(props) => {setIndexes(props);}} 
                    isNew={true} 
                    isEdit={false} 
                    actionOnIndex={() => {}}
                    inAttributes={attributes}
                    />
                </Paper> 
              </Stack>  
            </TabPanel>
          </Box>
            

            
          
            
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleCreate} disabled={!name }>Create</Button>
          </Box>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
