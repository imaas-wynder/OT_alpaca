import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  TextField,
  Box,
  FormLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  Select,
  Typography,MenuItem,
  Stack
} from '@mui/material';



export default function CustomSearchFilter(props) {
  const { runRequest, token, showBorder, inFilter, setFilter, onAction, isEdit, inType, isFtQuery } = props;

  //filter: string with name operator value

  const [activeId, setActiveId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTrait, setIsTrait] = useState(false);
  const [isSystem, setIsSystem] = useState(false);
  const [objAttributes, setObjAttributes] = useState([]);
  const [traitList, setTraitList] = useState([]);

  const [selTrait, setSelTrait] = useState('');
  const [traitName, setTraitName] = useState('');
  const [selAttribute, setSelAttribute] = useState({});
  const [operator, setOperator] = useState('');
  const [value, setValue] = useState(null);


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


  const handleRadioChange = (event) => {
    switch (event.target.value) {
      case 'attributes':
        setIsTrait(false);
        setIsSystem(false);
        break;
      case 'system':
        setIsTrait(false);
        setIsSystem(true);
        break;
      default:
        setIsTrait(true);
        setIsSystem(false);
        break;
    }
  }


  const handleSelectAttribute = (id) => {
    const selAttr = objAttributes.find((obj) => {return obj.name===id});
    setSelAttribute(selAttr);
    setIsLoading(false);
  }


  const getAttributes = () => {
    
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/${isTrait===true ? 'trait' : 'type'}-definitions/${(isTrait===true) ? selTrait : inType}/attributes${(isTrait===true ? '' : '-all')}`,  
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        //should be only the searchable ones and one array for the system and one for the custom
        setObjAttributes(res.data._embedded.collection);
        setIsLoading(inFilter.filterStr ? true : false);
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
      if (isTrait) {
        if (selTrait) {
          getAttributes();
        } else {
          if (inFilter.selTrait) {
            setSelTrait(inFilter.selTrait);
          }
        }
      }

    }, '', []);
   

  };

  const createFinalFilter = () => {
    //console.log(typeof(value));
    let attName = isTrait ? `traits.${selTrait}.${selAttribute.name}` : selAttribute.name ;
    let quoteStr = (selAttribute.data_type != 'integer' && selAttribute.data_type != 'double' && selAttribute.data_type != 'bigint' && selAttribute.data_type != 'boolean') ? `'` : ``;
    let likeStr = (operator==='like' || operator==='not like') ? ('%25') : '';
    let spaceIn = (operator==='contains'?'':' ');
    let funcInit = (selAttribute.repeating===true && operator==='contains') ? (selAttribute.data_type=='date' ? '(date(' : '(') : (selAttribute.data_type=='date' ? 'date(' : '');
    let funcEnd = (funcInit!=='') ? (selAttribute.data_type=='date' ? '))' : ')') : '';
    let filterStr = `${attName} ${operator}${spaceIn}${funcInit}${quoteStr}${likeStr}${value}${likeStr}${quoteStr}${funcEnd}`;
    let searchName = (isTrait ? selAttribute.search_name.split(',')[0].replace(/<instance>/g, traitName) : selAttribute.search_name.split(',')[0]);
    
    let ftBeforeVal = ((operator==='like' || operator==='not like') ? '*' : ((operator==='gt') ? '{' : ((operator==='ge') ? '[' : ((operator==='lt' || operator==='le') ? '[* TO ' : ''))));
    let ftAfterVal = ((operator==='like' || operator==='not like') ? '*' : ((operator==='gt' || operator==='ge') ? ' TO *]' : ((operator==='lt') ? '}' : ((operator==='le') ? ']' : ''))));
    let filterFtStr = `${(operator==='ne' || operator==='not like') ? '!' : ''}${searchName}:${ftBeforeVal}${value.replace(/ /g, '?')}${ftAfterVal}`;

    setFilter({filterStr: filterStr, filterFtStr: filterFtStr, isTrait: isTrait, attributeName: selAttribute.name, isSystem: isSystem, selTrait: selTrait, operator: operator, value: value, traitName: traitName});
    onAction(true);

    //TODO: filter should be object, not string
  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (inFilter.filterStr && objAttributes.length>0) {
          handleSelectAttribute(inFilter.attributeName);
        }
        
    },[objAttributes]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (isEdit) {
          if (inFilter.filterStr) {
            
            setIsTrait(inFilter.isTrait);
            setIsSystem(inFilter.isSystem);
            if (inFilter.isTrait===true) {
              getTraits();
            } else {
              getAttributes();
            }
            setOperator(inFilter.operator);
            setValue(inFilter.value);
            setTraitName(inFilter.traitName);

          } else {
            
            if (isTrait) {
              getTraits();
            } else {
              getAttributes();
            }
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
      
          if (selTrait!='') {
            getAttributes();
          }
    },[selTrait]
    );

  return (
      <React.Fragment>
          <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
          >
            <Stack direction="column" spacing={2}>
            <FormControl>
              <FormLabel id="column-type">{isLoading ? 'LOADING...' : 'Column type'}</FormLabel>
              <RadioGroup
                row
                aria-labelledby="column-type-group"
                name="column-type-group"
                value={(isTrait?'trait':(isSystem?'system':'attributes'))}
                onChange={handleRadioChange}
              >
                <FormControlLabel value="attributes" control={<Radio />} label="Custom attributes" />
                <FormControlLabel value="system" control={<Radio />} label="System attributes" />
                <FormControlLabel value="trait" control={<Radio />} label="Trait attributes" />
              </RadioGroup>
            </FormControl>
            {isTrait && <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='drpTrait'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <FormControl variant="standard" sx={{minWidth: 300}}>
                    <Select
                    id="traitSelect"
                    value={selTrait} 
                    disabled={isLoading}
                    onChange={(event) => {setSelTrait(event.target.value);}} 
                  >
                    {traitList.map((item) => {
                        return <MenuItem key={item.system_name} value={item.system_name}>{item.display_name}</MenuItem>
                    })
                    }
                  </Select>
                </FormControl>
              </Box>}
            {isTrait && isFtQuery && <Box>
              <TextField
                  autoFocus
                  margin="dense"
                  id="trait-instance-name"
                  label="Trait instance name"
                  type="name"
                  fullWidth
                  variant="standard" 
                  value={traitName}
                  onChange={e => {setTraitName(e.target.value)}}
                />
            </Box>}
            <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <FormControl variant="standard" sx={{minWidth: 300}}>
                    <Select
                    id="attributeName"
                    value={selAttribute.name ?? ''} 
                    disabled={isLoading}
                    onChange={(event) => {handleSelectAttribute(event.target.value);}} 
                  >
                    {objAttributes.map((item) => {
                      if ((item.searchable===true) && (item.system===isSystem)) {
                        return <MenuItem key={item.name} value={item.name}>{`${item.display_name} (${item.data_type}) ${item.repeating===true ? '(r)' : ''}`}</MenuItem>
                      }
                    })
                      
                    }
                    
                  </Select>
                </FormControl>
              </Box>
              
              <FormControl sx={{ m: 1, minWidth: 40 }} size="small">
                <Select
                  labelId="operator-select-label"
                  id="operator-simple-select"
                  value={operator} 
                  disabled={isLoading}
                  onChange={(event) => {setOperator(event.target.value);}}
                >
                  <MenuItem value={''}>{''}</MenuItem>
                  {selAttribute.repeating!==true && selAttribute.data_type==='string' && <MenuItem value={'like'}>{'like'}</MenuItem>}
                  {selAttribute.repeating!==true && selAttribute.data_type==='string' && <MenuItem value={'not like'}>{'not like'}</MenuItem>}
                  {selAttribute.repeating!==true && <MenuItem value={'eq'}>{'=='}</MenuItem>}
                  {selAttribute.repeating!==true && <MenuItem value={'ne'}>{'!='}</MenuItem>}
                  {selAttribute.repeating!==true && selAttribute.data_type!=='string' && selAttribute.data_type!=='boolean' && <MenuItem value={'gt'}>{'>'}</MenuItem>}
                  {selAttribute.repeating!==true && selAttribute.data_type!=='string' && selAttribute.data_type!=='boolean' && <MenuItem value={'ge'}>{'>='}</MenuItem>}
                  {selAttribute.repeating!==true && selAttribute.data_type!=='string' && selAttribute.data_type!=='boolean' && <MenuItem value={'lt'}>{'<'}</MenuItem>}
                  {selAttribute.repeating!==true && selAttribute.data_type!=='string' && selAttribute.data_type!=='boolean' && <MenuItem value={'le'}>{'<='}</MenuItem>}
                  {selAttribute.repeating===true && <MenuItem value={'contains'}>{'contains'}</MenuItem>}
                </Select>
              </FormControl>

              <TextField
                  autoFocus
                  margin="dense"
                  id="filter-value"
                  label="Value"
                  type="name"
                  fullWidth 
                  disabled={isLoading}
                  variant="standard" 
                  value={value ?? ''}
                  onChange={e => {setValue(e.target.value)}}
                />
              {selAttribute.data_type==='date' && <Typography sx={{whiteSpace: 'pre-line'}}>
                {'DATE will be: \nyyyy-mm-dd\nyyyy-mm-ddThh:mm:ss(.sss)\nyyyy-mm-ddThh:mm:ss(.sss)Z\nyyyy-mm-ddThh:mm:ss(.sss)+hhmm\nyyyy-mm-ddThh:mm:ss(.sss)-hhmm\nwhere "Z" means UTC time, "+hhmm" and "-hhmm" is the offset to UTC timezone.'}
              </Typography>}


              
              <Stack direction={'row-reverse'} spacing={2}>
                <Button onClick={() => {onAction(false); }}>Close</Button>
                <Button onClick={() => { createFinalFilter(); }}>Update</Button>
              </Stack>
            </Stack>
            
          </Box>
        </React.Fragment>
  );
}
