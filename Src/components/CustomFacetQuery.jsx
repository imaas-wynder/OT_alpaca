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



export default function CustomFacetQuery(props) {
  const { runRequest, token, showBorder, inQuery, setQuery, onAction, isEdit, inType } = props;

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
  const [qKey, setQKey] = useState('');


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
        setIsLoading(inQuery.queryStr ? true : false);
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
          if (inQuery.selTrait) {
            setSelTrait(inQuery.selTrait);
          }
        }
      }

    }, '', []);
   

  };

  const createFinalQuery = () => {
    
    let searchName = (isTrait ? selAttribute.search_name.split(',')[0].replace(/<instance>/g, traitName) : selAttribute.search_name.split(',')[0]);
 
    let queryStr = `{!key=${qKey}}${searchName}:${value}`

    setQuery({queryStr: queryStr, isTrait: isTrait, attributeName: selAttribute.name, isSystem: isSystem, selTrait: selTrait, traitName: traitName, value: value, key: qKey});
    onAction(true);
  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (inQuery.queryStr && objAttributes.length>0) {
          handleSelectAttribute(inQuery.attributeName);
        }
        
    },[objAttributes]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (isEdit) {
          if (inQuery.queryStr) {
            
            setIsTrait(inQuery.isTrait);
            setIsSystem(inQuery.isSystem);
            if (inQuery.isTrait===true) {
              getTraits();
            } else {
              getAttributes();
            }
            setValue(inQuery.value);
            setQKey(inQuery.key);
            setTraitName(inQuery.traitName);

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
            <Box>
              <TextField
                  autoFocus
                  margin="dense"
                  id="key-name"
                  label="Query key"
                  type="qKey"
                  fullWidth
                  variant="standard" 
                  value={qKey}
                  onChange={e => {setQKey(e.target.value)}}
                />
            </Box>
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
            {isTrait && <Box>
              <TextField
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
                    value={selAttribute?.name ?? ''} 
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
              
              <TextField
                  margin="dense"
                  id="query-value"
                  label="Value"
                  type="name"
                  fullWidth 
                  disabled={isLoading}
                  variant="standard" 
                  value={value ?? ''}
                  onChange={e => {setValue(e.target.value)}}
                />
              
              {selAttribute?.data_type==='date' && <Box sx={{fontStyle:'italic'}}>
                <Typography sx={{fontSize:'12px', whiteSpace: 'pre-line'}}>
                {'Example: \n{!key=CREATED_TODAY}cms_any.create_time_dt:[NOW-1DAY TO NOW]\n{!key=CREATED_THIS_WEEK}cms_any.create_time_dt:[NOW/DAY-7DAY/DAY TO NOW]\n{!key=CREATED_LAST_WEEK}cms_any.create_time_dt:[NOW/DAY-14DAY/DAY TO NOW/DAY-7DAY/DAY]\n{!key=CREATED_THIS_MONTH}cms_any.create_time_dt:[NOW/MONTH TO NOW/MONTH+1MONTHS]\n{!key=CREATED_6_MONTHS}cms_any.create_time_dt:[NOW/MONTH-6MONTHS TO NOW/MONTH+1MONTHS]\n{!key=CREATED_THIS_YEAR}cms_any.create_time_dt:[NOW/YEAR TO NOW]\n{!key=MODIFIED_TODAY}cms_any.update_time_dt:[NOW-1DAY TO NOW]\n{!key=MODIFIED_THIS_WEEK}cms_any.update_time_dt:[NOW/DAY-7DAY/DAY TO NOW]\n{!key=MODIFIED_6_MONTHS}cms_any.update_time_dt:[NOW/MONTH-6MONTHS TO NOW/MONTH+1MONTHS]'}
              </Typography></Box>}
              {selAttribute?.data_type!=='date' && <Box sx={{fontStyle:'italic'}}>
                <Typography sx={{fontSize:'12px', whiteSpace: 'pre-line'}}>
                {'Example: \n{!key=MY_FILES}cms_any.created_by_s:dd64b3c7-250e-4289-9ab5-d4b2ec7942d9\n{!key=SMALL}cms_any.content_size_l:[* TO 15000]\n{!key=MEDIUM}cms_any.content_size_l:{15000 TO 150000]\n{!key=BIG}cms_any.content_size_l:{150001 TO *]\n{!key=APPROVED_BY_TEST}trait_ca_approval.Alex.approver_s:test\n{!key=APPROVED_BY_SOMEONE}trait_ca_approval.Alex.approver_s:*\n{!key=APPROVED_BY_ALEX_OR_TEST}trait_ca_approval.Alex.approver_s:(alex OR test)'}
              </Typography></Box>}
              {selAttribute?.data_type==='date' && <Box sx={{fontStyle:'italic'}}>
                <Typography sx={{fontSize:'12px', whiteSpace: 'pre-line'}}>
                {'DATE will be: \nyyyy-mm-dd\nyyyy-mm-ddThh:mm:ss(.sss)\nyyyy-mm-ddThh:mm:ss(.sss)Z\nyyyy-mm-ddThh:mm:ss(.sss)+hhmm\nyyyy-mm-ddThh:mm:ss(.sss)-hhmm\nwhere "Z" means UTC time, "+hhmm" and "-hhmm" is the offset to UTC timezone.'}
              </Typography></Box>}

              
              <Stack direction={'row-reverse'} spacing={2}>
                <Button onClick={() => {onAction(false); }}>Close</Button>
                <Button onClick={() => { createFinalQuery(); }}>Update</Button>
              </Stack>
            </Stack>
            
          </Box>
        </React.Fragment>
  );
}
