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
  Tab,
  Tabs,
  Paper,
  MenuItem,
  FormControlLabel ,
  Switch, Stack,
  FormGroup,  
  Typography
} from '@mui/material';

import LockPersonIcon from '@mui/icons-material/LockPerson';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import ListIcon from '@mui/icons-material/List';
import PropTypes from 'prop-types';

import AttributesView from './AttributesView';
import ACLDetails from './ACLDetails';
import IndexesView from './IndexesView';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      sx={{width: 1}}
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

export default function TraitProps(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder, namespaces, inObj } = props;
  
  const [value, setValue] = React.useState(0);

  const [traitObject, setTraitObject] = React.useState({});

  const [attributes, setAttributes] = React.useState([]);
  const [arrProps, setArrProps] = React.useState([]);
  
  const [hasInstances, setHasInstances] = React.useState(false);

  const [attributeAction, setAttributeAction] = React.useState('');
  const [curAttribute, setCurAttribute] = React.useState([]);
  
  const [indexes, setIndexes] = React.useState([]);
  const [indexAction, setIndexAction] = React.useState('');
  const [curIndex, setCurIndex] = React.useState([]);



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
    setTraitObject({});
    onCreateSuccess(false);
  };


  const handleUpdateValue = (valName, value) => {
    let updatedValue = {};
    updatedValue[valName]=value;
    setTraitObject (traitObject => ({
          ...traitObject,
          ...updatedValue
        }));
  }

  const handleUpdate = () => {
    addActiveId('updButton');
    
    let data = {
      name: traitObject.name,
      display_name: traitObject.display_name,
      active: traitObject.active
    }
    if (traitObject.description) data.description=traitObject.description;

    let req = { 
      method: 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${traitObject.system_name}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.name) {
        onCreateSuccess(true);
      } 
      removeActiveId('updButton');

    }, '', []);
   

  };

  const handleUpdateAttribute = () => {
    addActiveId('updAttButton');
    let data = {};
    let method='';
    
    switch (attributeAction ) {
      case 'delete':
        method='delete';
        break;
      case 'edit':
        method='put';
        data = {
          name: curAttribute[0].name,
          display_name: curAttribute[0].displayName,
          data_type: curAttribute[0].type, 
          repeating: curAttribute[0].repeating, 
          required: curAttribute[0].required, 
          unique: curAttribute[0].unique, 
          read_only: curAttribute[0].readOnly, 
          searchable: curAttribute[0].searchable, 
          sortable: curAttribute[0].sortable
        }
        if (curAttribute[0].defaultValue) {
          data.default_value= curAttribute[0].type=='date' ? curAttribute[0].defaultValue.toISOString() : curAttribute[0].defaultValue;
        }
        if (curAttribute[0].type=='string' && curAttribute[0].size) {
          data.size=curAttribute[0].size;
        }
        break;
      case 'new':
        method='post'
        data = {
          name: curAttribute[0].name,
          display_name: curAttribute[0].displayName,
          data_type: curAttribute[0].type, 
          repeating: curAttribute[0].repeating, 
          required: curAttribute[0].required, 
          unique: curAttribute[0].unique, 
          read_only: curAttribute[0].readOnly, 
          searchable: curAttribute[0].searchable, 
          sortable: curAttribute[0].sortable
        }
        if (curAttribute[0].defaultValue) {
          data.default_value=curAttribute[0].defaultValue;
        }
        if (curAttribute[0].type=='string' && curAttribute[0].size) {
          data.size=curAttribute[0].size;
        }
        break;
      default:
        return;
        break;
    }
    


    let req = { 
      method: method, 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${traitObject.system_name}/attributes${attributeAction!='new'?('/' + curAttribute[0].id):''}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if ((res.data && res.data.id) || res.status==204) {
        setAttributeAction('');
        setCurAttribute([]);
        getTraitDetails();
      } 
      removeActiveId('updAttButton');

    }, '', []);
   

  };


  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getTraitDetails = () => {
    addActiveId('getType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${inObj.system_name}?expandAll=true`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      let array = [];
      if (res.data && res.data.name) {
        setTraitObject(res.data);
        let traitAttr = [];
        for (let i=0; i<res.data.attributes?.length; i++) {
          let curItem = {
            displayName: res.data.attributes[i].display_name, 
            name: res.data.attributes[i].name, 
            type: res.data.attributes[i].data_type, 
            defaultValue: res.data.attributes[i].default_value ?? '', 
            size: res.data.attributes[i].size ?? 256, 
            repeating: res.data.attributes[i].repeating, 
            required: res.data.attributes[i].required, 
            unique: res.data.attributes[i].unique, 
            readOnly: res.data.attributes[i].read_only, 
            searchable: res.data.attributes[i].searchable, 
            sortable: res.data.attributes[i].sortable,
            id: res.data.attributes[i].id };
          traitAttr.push(curItem);
        }
        setAttributes(traitAttr);

        if (res.data.indexes) {
          setIndexes(res.data.indexes);
        }

        array.push({name: 'Created by', value: res.data.created_by.service_account?'system':res.data.created_by.email});
        array.push({name: 'Created', value: getDateValue(res.data.create_time)});
        array.push({name: 'Owner', value: res.data.owner.service_account?'system':res.data.owner.email});
        array.push({name: 'Updated', value: getDateValue(res.data.update_time)});
        array.push({name: 'Updated by', value: res.data.updated_by.service_account?'system':res.data.updated_by.email});
        setArrProps(array);
      } 
      removeActiveId('getType');

    }, '', []);
   

  };

  const getTraitHasInstance = () => {
    addActiveId('getTraitInstance');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${inObj.system_name}/hasInstance`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data) {
        setHasInstances(res.data.hasInstances);
      } 
      removeActiveId('getTraitInstance');

    });
   

  };

  const handleUpdateIndex = () => {
    addActiveId('updIdxButton');
    let data = {};
    let method='';
    let action='';
    
    switch (indexAction ) {
      case 'delete':
        method='delete';
        action='deleted';
        break;
      case 'edit':
        method='put';
        action='updated';
        data = {
          name: curIndex[0].name,
          unique: curIndex[0].unique,
          columns: curIndex[0].columns
        }
        break;
      case 'new':
        method='post';
        action='added';
        data = {
          name: curIndex[0].name,
          unique: curIndex[0].unique,
          columns: curIndex[0].columns
        }
        break;
      default:
        return;
    }
    


    let req = { 
      method: method, 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${traitObject.system_name}/index-definitions${indexAction!='new'?('/' + curIndex[0].id):''}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if ((res.data && res.data.id) || res.status==204) {
        setIndexAction('');
        setCurIndex([]);
        getTraitDetails();
      }
      removeActiveId('updIdxButton');
    }, `Successfully ${action} index idxName`, [{name: 'idxName', node: 'name'}]);
   

  };

  const actionOnAttribute = (action, attribute) => {
    let attrArray = [];
    attrArray.push(JSON.parse(JSON.stringify(attribute)));
    setAttributeAction(action);
    setCurAttribute(attrArray);
  }

  const actionOnIndex = (action, index) => {
    let indexArray = [];
    indexArray.push(JSON.parse(JSON.stringify(index)));
    setIndexAction(action);
    setCurIndex(indexArray);
  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setValue(0);
      setTraitObject({});
      setAttributes([]);
      setIndexes([]);
      setAttributeAction('');
      setCurAttribute({});
      setHasInstances(false);
      getTraitDetails();
      getTraitHasInstance();
      setArrProps([]);
    }
  }, [newOpen]);


  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Update trait</DialogTitle>
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

        <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="properties tabs"
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              
              <Tab icon={<SettingsSystemDaydreamIcon/>} label="System" {...a11yProps(0)} sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='getType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}/>
              <Tab icon={<DataObjectIcon/>} label="Attributes" {...a11yProps(1)} />
              <Tab icon={<ListIcon/>} label="Indexes" {...a11yProps(2)} />
              <Tab icon={<LockPersonIcon/>} label="ACL" {...a11yProps(3)} />
            </Tabs>
            
            <TabPanel value={value} index={0}>
                <Stack spacing={2} direction="row" sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='getType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                <Box >
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }} disabled>
                    <InputLabel id="select-namespace">Namespace</InputLabel>
                      <Select
                      labelId="select-namespace"
                      label="Namespace"
                      id="namespaceDrp"
                      value={traitObject.namespace ?? ''} 
                      
                      onChange={(event) => {handleUpdateValue('namespace', event.target.value);}} 

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
                  id="trait-disp-name"
                  label="Display name"
                  type="name"
                  required
                  variant="standard" 
                  value={traitObject.display_name ?? ''}
                  onChange={e => {handleUpdateValue('display_name', e.target.value)}}
                />
                <TextField
                  margin="dense"
                  id="trait-name"
                  label="Trait name"
                  type="name"
                  required
                  variant="standard" 
                  value={traitObject.name ?? ''}
                  onChange={e => {handleUpdateValue('name', e.target.value)}} 
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  margin="dense"
                  id="trait-sys-name"
                  label="System name"
                  type="name"
                  required
                  variant="standard" 
                  value={traitObject.system_name ?? ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                
                
              </Stack>
              <Stack spacing={2} direction="row" alignItems="center">
                
                <TextField
                  margin="dense"
                  id="trait-desc"
                  label="Description"
                  type="name"
                  variant="standard" 
                  multiline 
                  value={traitObject.description ?? ''}
                  onChange={e => {handleUpdateValue('description', e.target.value)}}
                />
                <FormGroup>
                  <FormControlLabel
                      control={
                        <Switch checked={traitObject.active===true} onChange={(e) => {handleUpdateValue('active', e.target.checked)}} name="active" size="small"/>
                      }
                      label="Active"/>
                </FormGroup>
              </Stack>
              <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='getTraitInstance'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                color: 'red'}}>
                  {hasInstances && <Typography>This trait has active instances.</Typography>}
              </Box>

              <Paper elevation={3} sx={{p:2, mt:2}}>
                <Box >
                  
                    {arrProps.map((item, index) => (
                      
                        <Stack key={'traitPros' + index} direction="row" spacing={2}>
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
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Stack direction="column" spacing={2}>
                  <Paper elevation={3} sx={{p:2}}>
                    <Typography  variant="button" display="block" gutterBottom>Attributes</Typography>
                    {attributeAction=='' && 
                      <AttributesView inputFields={attributes} setInputFields={(props) => {setAttributes(props);}} isNew={false} isEdit={true} isSingle={false} actionOnAttribute={actionOnAttribute}/>}
                    {(attributeAction=='edit' || attributeAction=='new') && 
                      <React.Fragment>
                        <AttributesView inputFields={curAttribute} setInputFields={(props) => {setCurAttribute(props);}} isNew={attributeAction=='new'} isEdit={attributeAction=='edit'} isSingle={true} actionOnAttribute={() => {}}/>
                        <Stack direction="row-reverse" spacing={1}>
                          <Button onClick={() => {setAttributeAction(''); setCurAttribute([])}}>Cancel</Button>
                          <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='updAttButton'}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                              <Button onClick={handleUpdateAttribute} disabled={!curAttribute[0].name }>{attributeAction=='edit'?'Update attribute':'Create attribute'}</Button>
                          </Box>
                        </Stack>
                      </React.Fragment>}
                    {(attributeAction=='delete') && 
                    <React.Fragment>
                      <Typography variant="button" display="block" gutterBottom color="red">Are you sure you want to delete the attribute {curAttribute[0].displayName}?</Typography>
                      <Stack direction="row-reverse" spacing={1}>
                        <Button onClick={() => {setAttributeAction(''); setCurAttribute([])}}>Cancel</Button>
                        <Box sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj=='updAttButton'}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                            <Button onClick={handleUpdateAttribute}>{'Delete attribute'}</Button>
                        </Box>
                      </Stack>
                    </React.Fragment>}
                  </Paper> 
              </Stack>  
            </TabPanel>
            
            <TabPanel value={value} index={2}>
              <Stack direction="column" spacing={2}>
                  <Paper elevation={3} sx={{p:2}}>
                    <Typography  variant="button" display="block" gutterBottom>Indexes</Typography>
                    {indexAction=='' && 
                      <IndexesView 
                        inputFields={indexes} 
                        setInputFields={(props) => {setIndexes(props);}} 
                        isNew={false} 
                        isEdit={true} 
                        isSingle={false} 
                        actionOnIndex={actionOnIndex}
                        inAttributes={attributes}
                        />}
                    {(indexAction=='edit' || indexAction=='new') && 
                      <React.Fragment>
                        <IndexesView 
                          inputFields={curIndex} 
                          setInputFields={(props) => {setCurIndex(props);}} 
                          isNew={indexAction=='new'} 
                          isEdit={indexAction=='edit'} 
                          isSingle={true} 
                          actionOnIndex={() => {}}
                          inAttributes={attributes}
                          />
                        <Stack direction="row-reverse" spacing={1}>
                          <Button onClick={() => {setIndexAction(''); setCurIndex([])}}>Cancel</Button>
                          <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='updIdxButton'}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                              <Button onClick={handleUpdateIndex} disabled={!curIndex[0].name }>{indexAction=='edit'?'Update index':'Create index'}</Button>
                          </Box>
                        </Stack>
                      </React.Fragment>}
                    {(indexAction=='delete') && 
                    <React.Fragment>
                      <Typography variant="button" display="block" gutterBottom color="red">Are you sure you want to delete the index {curIndex[0].name}?</Typography>
                      <Stack direction="row-reverse" spacing={1}>
                        <Button onClick={() => {setIndexAction(''); setCurIndex([])}}>Cancel</Button>
                        <Box sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj=='updIdxButton'}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                            <Button onClick={handleUpdateIndex}>{'Delete index'}</Button>
                        </Box>
                      </Stack>
                    </React.Fragment>}
                  </Paper> 
              </Stack>
            </TabPanel>
            <TabPanel value={value} index={3}>
              <ACLDetails aclid={traitObject.acl_id} runRequest={runRequest} token={token} showBorder={showBorder}/>
            </TabPanel>
        </Box>
          
          
            
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {attributeAction=='' && <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='updButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleUpdate} disabled={!traitObject.name }>Update</Button>
          </Box>}
          
        </DialogActions>
      </Dialog>
    

    
  );
}
