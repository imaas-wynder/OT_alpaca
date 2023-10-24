import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { 
  Box,
  TextField,
  FormControl,
  Select,
  Paper,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';

import VariablesView from './VariablesView';
import DisplayArrayProperty from './DisplayArrayProperty';
import dayjs from 'dayjs';

export default function TraitInstanceComp(props) {
  const { runRequest, newOpen, outTraitFunc, token, showBorder, inDefinition, inTrait } = props;
  

  const [instanceName, setInstanceName] = React.useState('');
  const [traitDefinition, setTraitDefinition] = React.useState('')

  const [extraProps, setExtraProps] = React.useState([]);
  const [repProps, setRepProps] = React.useState([]);
  const [traitList, setTraitList] = React.useState([]);



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
  

  const handleChangeTrait = () => {
    let properties = {};
    for (let i=0; i<extraProps.length; i++) {
      properties[extraProps[i].name] = (extraProps[i].type=='double' || extraProps[i].type=='integer' || extraProps[i].type=='long') ? Number(extraProps[i].value) : ((extraProps[i].type=='date' && extraProps[i].value && dayjs(extraProps[i].value).isValid()) ? extraProps[i].value.toISOString() : extraProps[i].value);
    }
    for (let i=0; i<repProps.length; i++) {
      properties[repProps[i].name] = repProps[i].values;
    }
    

    let data = {
      name: instanceName,
      definition: traitDefinition,
      properties: properties
    }

    outTraitFunc(data);

  };

  const getTraits = () => {
    addActiveId('drpTrait');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions?include-total=true&page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTraitList(res.data._embedded.collection);
        
        if (inTrait?.definition) {setTraitDefinition(inTrait.definition)};
        if (inTrait?.name) {setInstanceName(inTrait.name)};
      }
      removeActiveId('drpTrait');

    }, '', []);
   

  };

  const getAttributes = () => {
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${traitDefinition}?expandAll=true`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.attributes) {
        let outProps = [];
        let repeatingProps = [];
        for (let i=0; i<res.data.attributes.length; i++) {
          if (!res.data.attributes[i].repeating) {
            outProps.push(
              {name: res.data.attributes[i].name, 
                displayName: res.data.attributes[i].display_name, 
                type: res.data.attributes[i].data_type, 
                value: (inTrait?.properties && inTrait?.properties[res.data.attributes[i].name]) ? inTrait?.properties[res.data.attributes[i].name] : (res.data.attributes[i].default_value ?? getDefaultValue(res.data.attributes[i].data_type)) })
          } else {
            repeatingProps.push({name: res.data.attributes[i].name, type: res.data.attributes[i].data_type, displayName: res.data.attributes[i].display_name, values: (inTrait?.properties && inTrait?.properties[res.data.attributes[i].name]) ? inTrait?.properties[res.data.attributes[i].name] : []});
          }
          
        }
        setExtraProps(outProps);
        setRepProps(repeatingProps);
      }
      removeActiveId('attVals');
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
      case 'double':
        return 0;
      case 'bigint':
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
      
      setInstanceName('');
      setExtraProps([]);
      setRepProps([]);
      setTraitDefinition('');
      if (!inDefinition) {
        getTraits();
      } else {
        setTraitDefinition(inDefinition);
        if (inTrait?.name) {setInstanceName(inTrait.name)};
      }
    }
    

  }, [newOpen]);

  useEffect(() => {
    if (traitDefinition!='') {
      getAttributes();
    }
  }, [traitDefinition]);

  useEffect(() => {
    //console.log(repProps);
    if (instanceName!='') {
      handleChangeTrait();
    }
  }, [repProps, extraProps, instanceName]);


  return (
    
    <React.Fragment>
        <Box sx={{
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
        <Stack spacing={3} sx={{minWidth:500}}>
            <TextField
              autoFocus
              margin="dense"
              id="folder-name"
              label="Trait instance name"
              type="name"
              fullWidth
              required
              variant="standard" 
              value={instanceName}
              onChange={e => {setInstanceName(e.target.value)}}
            />
            
          </Stack>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='drpTrait'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
            {inDefinition ? 
              <Typography>{traitDefinition}</Typography>
            : 
              <FormControl variant="standard">
                <Select
                id="traitDef"
                value={traitDefinition}
                onChange={(event) => {setTraitDefinition(event.target.value); setExtraProps([]); setRepProps([]);}} 

              >
                {traitList.map((item) => (
                  <MenuItem key={item.system_name} value={item.system_name}>{item.display_name}</MenuItem>
                ))}
                
              </Select>
            </FormControl>}
          </Box>
          {traitDefinition!='' && <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
            <Stack direction="column" spacing={2}>
              {extraProps.length>0 &&  
                <Paper elevation={3} sx={{p:2}}>
                  <VariablesView inputFields={extraProps} setInputFields={(props) => {setExtraProps(props);}} canAdd={false} canEdit={false} canRemove={true} showDisplayName={true}/>
                </Paper> }
              {repProps.length>0 && <Paper elevation={3} sx={{p:2}}>
              {repProps.map((prop, index) => (
                <DisplayArrayProperty arrProperty={prop.values} propType={prop.type} isEdit={true} title={prop.displayName ?? prop.name} setArrProperty={(arr) => {setRepVals(index, arr)}} key={prop.name}/>
              ))}</Paper>}
            </Stack>  
          </Box>
          }
          
        </Box>
       
    </React.Fragment>
  );
}
