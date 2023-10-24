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
  MenuItem,Stack,
  Typography
} from '@mui/material';

import LockPersonIcon from '@mui/icons-material/LockPerson';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import ListIcon from '@mui/icons-material/List';
import PropTypes from 'prop-types';

import AttributesView from './AttributesView';
import ACLDetails from './ACLDetails';
import RequiredTraitsView from './RequiredTraitsView';
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

export default function TypeProps(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder, namespaces, inObj } = props;
  
  const [value, setValue] = React.useState(0);

  const [typeObject, setTypeObject] = React.useState({});

  
  
  const [arrProps, setArrProps] = React.useState([]);
  
  const [typeList, setTypeList] = React.useState([]);
  const [hasInstances, setHasInstances] = React.useState(false);

  const [attributes, setAttributes] = React.useState([]);
  const [attributeAction, setAttributeAction] = React.useState('');
  const [curAttribute, setCurAttribute] = React.useState([]);

  const [reqTraits, setReqTraits] = React.useState([]);
  const [traitAction, setTraitAction] = React.useState('');
  const [curTrait, setCurTrait] = React.useState([]);

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
    setTypeObject({});
    onCreateSuccess(false);
  };


  const handleUpdateValue = (valName, value) => {
    let updatedValue = {};
    updatedValue[valName]=value;
    setTypeObject (typeObject => ({
          ...typeObject,
          ...updatedValue
        }));
  }

  const handleUpdate = () => {
    addActiveId('updButton');
    
    let data = {
      name: typeObject.name,
      display_name: typeObject.display_name
    }
    if (typeObject.description) data.description=typeObject.description;

    let req = { 
      method: 'put', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${typeObject.system_name}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        onCreateSuccess(true);
      }
      removeActiveId('updButton');

    }, 'Successfully updated');
   

  };

  const handleUpdateAttribute = () => {
    addActiveId('updAttButton');
    let data = {};
    let method='';
    let action='';
    
    switch (attributeAction ) {
      case 'delete':
        method='delete';
        action='deleted';
        break;
      case 'edit':
        method='put';
        action='updated';
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
          data.default_value= curAttribute[0].type=='date' ? curAttribute[0].defaultValue : curAttribute[0].defaultValue;
        }
        if (curAttribute[0].type=='string' && curAttribute[0].size) {
          data.size=curAttribute[0].size;
        }
        break;
      case 'new':
        method='post';
        action='added';
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
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${typeObject.system_name}/attributes${attributeAction!='new'?('/' + curAttribute[0].id):''}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if ((res.data && res.data.id) || res.status==204) {
        setAttributeAction('');
        setCurAttribute([]);
        getTypeDetails();
      }
      removeActiveId('updAttButton');
    }, `Successfully ${action} attribute attrName (attrDispName)`, [{name: 'attrName', node: 'name'},{name: 'attrDispName', node: 'display_name'}]);
   

  };

  const handleUpdateTrait = () => {
    addActiveId('updTraitButton');
    let data = {};
    let method='';
    
    switch (traitAction ) {
      case 'delete':
        method='delete';
        break;
      case 'edit':
        method='put';
        data = {
          instance_name: curTrait[0].instance_name,
          display_name: curTrait[0].display_name,
          trait_name: curTrait[0].trait_name
        }
        break;
      case 'new':
        method='post'
        data = {
          instance_name: curTrait[0].instance_name,
          display_name: curTrait[0].display_name,
          trait_name: curTrait[0].trait_name
        }
        break;
      default:
        return;
    }
    


    let req = { 
      method: method, 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${typeObject.system_name}/required-traits${traitAction!='new'?('/' + curTrait[0].id):''}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if ((res.data && res.data.id) || res.status==204) {
        setTraitAction('');
        setCurTrait([]);
        getTypeDetails();
      } 
      removeActiveId('updTraitButton');

    }, '', []);
   

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
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${typeObject.system_name}/index-definitions${indexAction!='new'?('/' + curIndex[0].id):''}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if ((res.data && res.data.id) || res.status==204) {
        setIndexAction('');
        setCurIndex([]);
        getTypeDetails();
      }
      removeActiveId('updIdxButton');
    }, `Successfully ${action} index idxName`, [{name: 'idxName', node: 'name'}]);
   

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

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getTypeDetails = () => {
    addActiveId('getType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${inObj.system_name}?expandAll=true`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      let array = [];
      if (res.data && res.data.name) {
        setTypeObject(res.data);
        let typeAttr = [];
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
          typeAttr.push(curItem);
        }
        setAttributes(typeAttr);

        if (res.data.required_traits) {
          setReqTraits(res.data.required_traits);
        }

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

  const getTypeHasInstance = () => {
    addActiveId('getTypeInstance');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${inObj.system_name}/hasInstance`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data) {
        setHasInstances(res.data.hasInstances);
      }
      removeActiveId('getTypeInstance');

    }, '', []);
   

  };

  const actionOnAttribute = (action, attribute) => {
    let attrArray = [];
    attrArray.push(JSON.parse(JSON.stringify(attribute)));
    setAttributeAction(action);
    setCurAttribute(attrArray);
  }

  const actionOnTrait = (action, trait) => {
    let traitArray = [];
    traitArray.push(JSON.parse(JSON.stringify(trait)));
    setTraitAction(action);
    setCurTrait(traitArray);
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
      setTypeObject({});
      setAttributes([]);
      setReqTraits([]);
      setIndexes([]);
      setAttributeAction('');
      setTraitAction('');
      setIndexAction('');
      setCurAttribute({});
      setCurTrait({});
      setCurIndex({});
      setHasInstances(false);
      getTypeDetails();
      getTypeHasInstance();
      setArrProps([]);
    }
  }, [newOpen]);

  useEffect(() => {
    if (typeObject.category) {
      getTypes(typeObject.category, typeObject.namespace);
    }
  }, [typeObject.category, typeObject.namespace]);

  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Update type</DialogTitle>
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
              <Tab icon={<EditAttributesIcon/>} label="Traits" {...a11yProps(2)} />
              <Tab icon={<ListIcon/>} label="Indexes" {...a11yProps(3)} />
              <Tab icon={<LockPersonIcon/>} label="ACL" {...a11yProps(4)} />
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
                      value={typeObject.namespace ?? ''} 
                      
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
                  id="type-disp-name"
                  label="Display name"
                  type="name"
                  required
                  variant="standard" 
                  value={typeObject.display_name ?? ''}
                  onChange={e => {handleUpdateValue('display_name', e.target.value)}}
                />
                <TextField
                  margin="dense"
                  id="type-name"
                  label="Type name"
                  type="name"
                  required
                  variant="standard" 
                  value={typeObject.name ?? ''}
                  onChange={e => {handleUpdateValue('name', e.target.value)}} 
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  margin="dense"
                  id="type-sys-name"
                  label="System name"
                  type="name"
                  required
                  readOnly
                  variant="standard" 
                  value={typeObject.system_name ?? ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                
                
              </Stack>
              <Stack spacing={2} direction="row">
                <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='drpType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }} disabled>
                    <InputLabel id="select-parent-type">Parent Type</InputLabel>
                      <Select
                      labelId="select-parent-type"
                      label="Parent Type"
                      id="parentType"
                      value={typeObject.parent ?? ''} 
                      
                      onChange={(event) => {handleUpdateValue('parent', event.target.value);}} 

                    >
                      {typeList.map((item) => (
                        <MenuItem key={item.id} value={item.system_name}>{item.display_name}</MenuItem>
                      ))}
                      
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                <FormControl sx={{ m: 1, minWidth: 200 }} variant="standard" disabled>
                    <InputLabel id="select-category">Category</InputLabel>
                    <Select
                      labelId="select-category"
                      id="select-sel-category"
                      value={typeObject.category ?? ''}
                      label="Category"
                      onChange={e => {handleUpdateValue('category', e.target.value)}} 
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
                  type="name"
                  variant="standard" 
                  value={typeObject.description ?? ''}
                  onChange={e => {handleUpdateValue('description', e.target.value)}}
                />
                
              </Stack>
              <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='getTypeInstance'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                color: 'red'}}>
                  {hasInstances && <Typography>This type has active instances.</Typography>}
              </Box>

              <Paper elevation={3} sx={{p:2, mt:2}}>
                <Box >
                  
                    {arrProps.map((item, index) => (
                      
                        <Stack key={'typeProps' + index} direction="row" spacing={2}>
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
                    <Typography  variant="button" display="block" gutterBottom>Required Traits</Typography>
                    {traitAction=='' && 
                      <RequiredTraitsView 
                        inputFields={reqTraits} 
                        setInputFields={(props) => {setReqTraits(props);}} 
                        isNew={false} 
                        isEdit={true} 
                        isSingle={false} 
                        actionOnTrait={actionOnTrait} 
                        runRequest={runRequest} 
                        token={token} 
                        showBorder={showBorder}/>}
                    {(traitAction=='edit' || traitAction=='new') && 
                      <React.Fragment>
                        <RequiredTraitsView 
                          inputFields={curTrait} 
                          setInputFields={(props) => {setCurTrait(props);}} 
                          isNew={traitAction=='new'} 
                          isEdit={traitAction=='edit'} 
                          isSingle={true} 
                          actionOnAttribute={() => {}}
                          runRequest={runRequest} 
                          token={token} 
                          showBorder={showBorder}
                          />
                        <Stack direction="row-reverse" spacing={1}>
                          <Button onClick={() => {setTraitAction(''); setCurTrait([])}}>Cancel</Button>
                          <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='updTraitButton'}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'}}>
                              <Button onClick={handleUpdateTrait} disabled={!curTrait[0].display_name }>{traitAction=='edit'?'Update trait':'Create trait'}</Button>
                          </Box>
                        </Stack>
                      </React.Fragment>}
                    {(traitAction=='delete') && 
                    <React.Fragment>
                      <Typography variant="button" display="block" gutterBottom color="red">Are you sure you want to delete the required trait {curTrait[0].display_name}?</Typography>
                      <Stack direction="row-reverse" spacing={1}>
                        <Button onClick={() => {setTraitAction(''); setCurTrait([])}}>Cancel</Button>
                        <Box sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj=='updTraitButton'}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                            <Button onClick={handleUpdateTrait}>{'Delete trait'}</Button>
                        </Box>
                      </Stack>
                    </React.Fragment>}
                  </Paper> 
              </Stack>  
            </TabPanel>
            <TabPanel value={value} index={3}>
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
            <TabPanel value={value} index={4}>
              <ACLDetails aclid={typeObject.acl_id} runRequest={runRequest} token={token} showBorder={showBorder}/>
            </TabPanel>
        </Box>
          
          
            
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {attributeAction=='' && <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='updButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleUpdate} disabled={!typeObject.name }>Update</Button>
          </Box>}
          
        </DialogActions>
        
      </Dialog>
    

    
  );
}
