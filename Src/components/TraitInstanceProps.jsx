import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  TextField,
  Paper, 
  Typography,
  Stack
} from '@mui/material';
import VariablesView from './VariablesView';
import DisplayArrayProperty from './DisplayArrayProperty';



export default function TraitInstanceProps(props) {
  const { runRequest, propsOpen, onClose, inTrait, inObj, token, showBorder } = props;

  //trait is a new object with name, definition and properties

  
  const [activeId, setActiveId] = React.useState('');

  const [instanceName, setInstanceName] = React.useState('');
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


  const handlePatch = () => {
    addActiveId('butPatch');

    let properties = {};
    for (let i=0; i<extraProps.length; i++) {
      properties[extraProps[i].name] = (extraProps[i].type=='double' || extraProps[i].type=='integer' || extraProps[i].type=='long') ? Number(extraProps[i].value) : ((extraProps[i].type=='date' && !extraProps[i].value) ? null : extraProps[i].value);
    }
    for (let i=0; i<repProps.length; i++) {
      properties[repProps[i].name] = repProps[i].values;
    }
    

    let data = {
      name: inObj.name,
      traits: {[inTrait.definition]: {[((inTrait.name==='') ? instanceName : inTrait.name)]: properties}}
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
    onClose(false);
  };

  


  const getAttributes = () => {
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${inTrait.definition}?expandAll=true`, 
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
                value: inTrait.properties[res.data.attributes[i].name] ?? getDefaultValue(res.data.attributes[i].data_type) })
          } else {
            repeatingProps.push({name: res.data.attributes[i].name, type: res.data.attributes[i].data_type, displayName: res.data.attributes[i].display_name, values: inTrait.properties[res.data.attributes[i].name] ?? []});
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
 
  const setRepVals = (index, array) => {

    let updatedValue = {name: repProps[index].name, type: repProps[index].type, displayName: repProps[index].displayName , values:array};

    let data = [...repProps];

    data.splice(index,1, updatedValue)
    setRepProps(data);

  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (propsOpen && inTrait.definition) {      
      setInstanceName('');
      setExtraProps([]);
      setRepProps([]);
      getAttributes();
    }
  }, [propsOpen, inObj.id]);

  return (
    
      <React.Fragment>
        <Box sx={{
          flexGrow: 1, bgcolor: 'background.paper',
          maxHeight: '70vh',
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
          
              {inTrait.definition!='' && <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
                <Stack direction="column" spacing={2}>
                  {inTrait.name ? <Typography>Editing trait instance: {inTrait.name} ({inTrait.definition})</Typography> : <Typography>New trait instance</Typography>}
                  {!inTrait.name && <TextField
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
                  />}
                  {extraProps.length>0 && 
                    <Paper elevation={3} sx={{p:2}}>
                      <VariablesView inputFields={extraProps} setInputFields={(props) => {setExtraProps(props);}} canAdd={false} canEdit={false} canRemove={true} showDisplayName={true}/>
                    </Paper> }
                  {repProps.length>0 && <Paper elevation={3} sx={{p:2}}>
                  {repProps.map((prop, index) => (
                    <DisplayArrayProperty arrProperty={prop.values} propType={prop.type} isEdit={true} title={prop.displayName ?? prop.name} setArrProperty={(arr) => {setRepVals(index, arr)}} key={prop.name}/>
                  ))}</Paper>}
                </Stack>              
              </Box>}
          </Box>
        
        <Stack direction={'row-reverse'} spacing={2}>
          <Button onClick={handleClose}>Close</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='butPatch'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handlePatch}>Patch object</Button>
          </Box>
        </Stack>
      </React.Fragment>
    

    
  );
}
