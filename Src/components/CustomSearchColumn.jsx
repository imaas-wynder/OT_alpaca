import * as React from 'react';
import { useState } from "react";


//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  TextField,
  Switch,
  Box,
  FormLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  Select, MenuItem,
  Stack
} from '@mui/material';



export default function CustomSearchColumn(props) {
  const { runRequest, token, showBorder, inObj, setColumn, onAction, isEdit, inType, onlySearchable } = props;

  //headCell: id, sorting, type, repeating, disablePadding, label, system, trait, traitInstance

  const [activeId, setActiveId] = useState('');
  const [isTrait, setIsTrait] = useState(false);
  const [objAttributes, setObjAttributes] = useState([]);
  const [traitList, setTraitList] = useState([]);


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

  const isActiveId = (item) => {
    return activeId.split(',').find((obj) => {return obj==item});
  }

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const calcIsTrait = () => {
      setIsTrait(inObj.trait ? true : false);
  }

  const handleRadioChange = (event) => {
    if (event.target.value==='system') {
      handleChangeValue('system', true);
      setIsTrait(false);
    } else {
      if (event.target.value==='custom') {
        handleChangeValue('system', false);
        setIsTrait(false);

      } else {
        handleChangeValue('system', false);
        setIsTrait(true);
      }
    }
  }

  const handleChangeValue = (name, value) => {
    let updatedValue = {};
    updatedValue = {[name]: value};
    setColumn(inObj => ({
      ...inObj,
      ...updatedValue
    }));
  }

  const handleSelectAttribute = (id) => {
    const selAttr = objAttributes.find((obj) => {return obj.name===id});
    handleChangeValue('id', selAttr.name);
    handleChangeValue('sorting', selAttr.sortable);
    handleChangeValue('type', selAttr.data_type);
    handleChangeValue('label', selAttr.display_name);
    handleChangeValue('repeating', selAttr.repeating);
    handleChangeValue('search_name', selAttr.search_name);
  }


  const getAttributes = () => {
    
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/${isTrait===true ? 'trait' : 'type'}-definitions/${(isTrait===true) ? inObj.trait : inType}/attributes${(isTrait===true ? '' : '-all')}`,  
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setObjAttributes(res.data._embedded.collection);
      }
      removeActiveId('attVals');
    }, '', []);
  };

  

  const getTraits = () => {
    addActiveId('drpTrait');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions?page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTraitList(res.data._embedded.collection);
      } 
      removeActiveId('drpTrait');
      setObjAttributes([]);
      if (inObj.trait) {
        getAttributes();
      }

    }, '', []);
   

  };

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log(`useEffect with none.`);
        
    },[]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (isEdit) {
          calcIsTrait();
          if (isTrait) {
            getTraits();
          } else {
            getAttributes();
          }
        }
    },[isEdit]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
          if (isTrait) {
            getTraits();
          } else {
            getAttributes();
          }
    },[isTrait]
    );
  
  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
          if (inObj.trait) {
            getAttributes();
          }
    },[inObj.trait]
    );

  return (
      <React.Fragment>
          <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
          >
            <Stack direction="column" spacing={2}>
            <FormControlLabel
              control={
                <Switch checked={inObj.showActions===true} onChange={(e) => {handleChangeValue('showActions', e.target.checked); }} name="showActions" />
              }
              label="Show menu on this column"/>
            <FormControl>
              <FormLabel id="column-type">Column type</FormLabel>
              <RadioGroup
                row
                aria-labelledby="column-type-group"
                name="column-type-group"
                value={(inObj.system===true)?'system':(isTrait?'trait':'custom')}
                onChange={handleRadioChange}
              >
                <FormControlLabel value="system" control={<Radio />} label="System attributes" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom attributes" />
                <FormControlLabel value="trait" control={<Radio />} label="Trait attributes" />
              </RadioGroup>
            </FormControl>
            {isTrait && <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='drpTrait'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <FormControl variant="standard" sx={{ minWidth: 300 }}>
                    <Select
                    id="traitSelect" 
                    value={inObj.trait}
                    onChange={(event) => {handleChangeValue('trait', event.target.value);}} 
                  >
                    {traitList.map((item) => {
                        return <MenuItem key={item.system_name} value={item.system_name}>{item.display_name}</MenuItem>
                    })
                    }
                  </Select>
                </FormControl>
              </Box>}
              {isTrait && <TextField
                  autoFocus
                  margin="dense"
                  id="trait-instance-name"
                  label="Trait instance name"
                  type="name"
                  fullWidth
                  variant="standard" 
                  value={inObj.traitInstance}
                  onChange={e => {handleChangeValue('traitInstance', e.target.value)}}
                />}
            <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <FormControl variant="standard" sx={{ minWidth: 300 }}>
                    <Select
                    id="attributeName"
                    value={inObj.id}
                    onChange={(event) => {handleSelectAttribute(event.target.value);}} 
                  >
                    {objAttributes.map((item) => {
                      if (!onlySearchable || (onlySearchable===true && item.searchable===true)) {
                        if (inObj.system===item.system) {
                          return <MenuItem key={item.name} value={item.name}>{item.display_name}</MenuItem>
                        }
                      }
                      
                    })
                      
                    }
                    
                  </Select>
                </FormControl>
              </Box>
              
              

              
              <Stack direction={'row-reverse'} spacing={2}>
                <Button onClick={() => {onAction(false); }}>Close</Button>
                <Button onClick={() => {onAction(true); }}>Update</Button>
              </Stack>
            </Stack>
            
          </Box>
        </React.Fragment>
  );
}
