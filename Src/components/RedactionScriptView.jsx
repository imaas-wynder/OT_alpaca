import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import { useState } from "react";

import { useTheme } from '@mui/material/styles';


// MUI components
import { 
    TextField,
    FormControl,
    FormGroup,
    FormControlLabel,
    InputLabel,
    CircularProgress,
    Select,
    MenuItem,
    Switch,
    IconButton,
    Input,
    InputAdornment,
    Stack,
    OutlinedInput ,
    Chip,
    Box,
    Dialog,
    DialogContent,
    Typography
  } from '@mui/material';
import { blue } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CachedIcon from '@mui/icons-material/Cached';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { HelpCenterOutlined, RotateLeft } from '@mui/icons-material';

import NotStartedIcon from '@mui/icons-material/NotStarted';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from '@mui/icons-material/Flag';
import TextContentDisplay from './TextContentDisplay';

//characters not good: & " ' < > (Instead you must use: &amp; &quot; &apos; &lt; &gt;)


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, columns, theme) {
  return {
    fontWeight:
      columns.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightBold,
  };
}

const searchStringMode = [
  { value: 'none', label: 'Simple search' },
  { value: 'phrase', label: 'Multiple words search' },
  { value: 'anyof', label: 'Any word' },
  { value: 'macro', label: 'Predefined patterns' },
  { value: 'regex', label: 'RegEx search' },
]

const searchOptions = [
  {value: 'w', label: 'Whole word'},
  {value: 'i', label: 'Case insensitive'},
  {value: 'a', label: 'All results'},
  {value: 'p', label: 'Search from position'},
  {value: 'f', label: 'Search forward'},
  {value: 's', label: 'Sub expression index'}, //only for regex and needs to be followed by an integer
  {value: 'm', label: 'Macro definition'}

]

const macrosList = [
  { value: 'usphone', label: 'US Phone' },
  { value: 'ssn', label: 'SSN' },
  { value: 'ocr_ssn', label: 'SSN (from OCR)' },
  { value: 'ssn_noprefix', label: 'SSN (without prefix)' },
  { value: 'ssn_reveal4', label: 'SSN (leaves last 4 digits)' },
  { value: 'email', label: 'Email' },
  { value: 'usmoney', label: 'US Currency' },
  { value: 'dob', label: 'Date of birth' },
  { value: 'creditcard', label: 'Credit card' },
];

export default function RedactionScriptView(props) {
  const { inputScript, outScript } = props;

  const theme = useTheme();
  const [showHelper, setShowHelper] = useState(false);
  const [curVariable, setCurVariable] = useState({});

  /**
   * [
          {
          comment: 'Remove emails',
          hyperlink: 'developer.opentext.com',
          lognote: 'Attorney Client Privilege situation 502',
          search_strings: [
            {string: 'Informative Graphics', matchWholeWord: false},
            {string: 'Corp.', matchWholeWord: true},
            {string: '[:email:]', matchWholeWord: false}
          ]
        },
        {
          comment: 'Remove OpenText name',
          hyperlink: 'developer.opentext.com',
          lognote: 'Attorney Client Privilege situation 502',
          search_strings: [
            {string: 'regex:ai:(\\\'|(?<=[^[:digit:]]))O[a-z]{3}T[a-z]{3}(\\\'|(?=[^[:digit:]]))', matchWholeWord: false} //a = all, i = case insesitive
          ]
        }
      ]
   */

    const getComponentFromValue = (value, component) => {
      if (value===undefined) return '';
      
      let trimVal = value; //if needed, replace things: .replace(/\${/g, '').replace(/}/g,'');
      let strMode = '';

      switch (trimVal.split(':')[0]) {
        case '[':
          strMode='macro';
          break;
        case 'regex':
          strMode='regex';
          break;
        case 'macro':
          strMode='macro';
          break;
        case 'anyof':
          strMode='anyof';
          break;
        case 'phrase':
          strMode='phrase';
          break;
        default:
          strMode='none';
          break;
      }
     

      switch (component) {
        case 'mode':
          return strMode;
        case 'options':
          return (strMode==='macro' || strMode==='none') ? '' : (trimVal.split(':').length>1 ?  trimVal.split(':')[1] : '');
        case 'string':
          if (strMode==='macro') {
            return trimVal.replace(/\[\:/g,'').replace(/\:\]/g, '')
          } else {
            if (strMode==='none') {
              return trimVal;
            } else {
              if (trimVal.split(':').length>2) {
                let newArr = trimVal.split(':');
                newArr.splice(0,2);
                return newArr.join(':')

              } else {
                return '';
              }
            }
          }
          
        default:
          return '';
      }
    }

    const createValueFromComponents = (mode, options, inString, setToCurVar) => {
      let value = '';
      // & " ' < > (Instead you must use: &amp; &quot; &apos; &lt; &gt;)
      let fString = inString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

      switch (mode) {
       
        case 'macro':
          value = `[:${fString}:]`;
          break;
        case 'none':
          value = fString;
          break;
        default:
          value = `${mode}:${options}:${(mode==='regex')?`${fString}`:`${fString}`}`
          break;
      }

       
      if (setToCurVar) {
        let updatedValue = {};
        updatedValue = {string: value};
        setCurVariable(curVariable => ({
          ...curVariable,
          ...updatedValue
        }));
      }
      return value;
    }
  

    const handleVarChange = (index, inName, inValue) => {
        let data = [...inputScript];
        data[index][inName] = inValue;
        
        
        
        outScript(data);
    }

    const handleVarArrChange = (index, varIndex, inName, inValue) => {
      let data = [...inputScript];
      
      data[index]['search_strings'][varIndex][inName] = inValue;

      outScript(data);
    }

    const addVarArr = (index) => {
      let newVar = {};
      newVar = {string: '', matchWholeWord: false};
      
      let data = [...inputScript];

      
      data[index]['search_strings'].push(newVar);
      
      
      outScript(data);
    }

    const removeVarArr = (index, varIndex) => {
      
      let data = [...inputScript];
      
      data[index]['search_strings'].splice(varIndex, 1);
      
      outScript(data);
    }


    const addScript = () => {
        let newfield = {comment: '', hyperlink: 'developer.opentext.com', search_strings: [] , lognote: 'Redacted based on REACT UI'}
    
        outScript([...inputScript, newfield])
    }

    const removeScript = (index) => {
        let data = [...inputScript];
        data.splice(index, 1);
        outScript(data);
    }

    const handleChange = (event) => {
      const {
        target: { value },
      } = event;
      createValueFromComponents(getComponentFromValue(curVariable.string, 'mode'), (typeof value === 'string' ? value : value.join('')), getComponentFromValue(curVariable.string, 'string'), true);
    };


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log("useEffect() - occurs ONCE, AFTER the initial render (unless react.strict mode) - variables view");
        
    },[]
    );

  

  return (
    <React.Fragment>
        {inputScript?.map((input, index) => {
          return (
            <Stack key={'script_view' + index} direction={'row'} alignItems={'center'} justifyContent={'space-between'} sx={{p:0.5, borderBottom: 1, borderColor: 'darkblue'}}>
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeScript(index) }}>
                    <RemoveIcon />
                </IconButton>
                <TextField
                    margin="dense"
                    id="comment" 
                    key="comment"
                    variant="standard" 
                    sx={{width: 200}} 
                    label="Comment" 
                    value={input?.comment} 
                    onChange={e => {handleVarChange(index, 'comment', e.target.value)}}
                  />
                <TextField
                    margin="dense"
                    id="hyperlink" 
                    key="hyperlink"
                    variant="standard" 
                    sx={{width: 200}} 
                    label="Hyperlink" 
                    value={input?.hyperlink} 
                    onChange={e => {handleVarChange(index, 'hyperlink', e.target.value)}}
                  />

              </Stack>
                
                
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {<Box>
                  <IconButton size="small" variant="outlined" color="success" title="Add new search string" onClick={() => { addVarArr(index) }}>
                      <AddCircleOutlineIcon />
                  </IconButton>
                </Box>}
                  
                <Stack direction="column" spacing={1}>
                  {input.search_strings.map((search_str, varIndex) => {
                      return (
                      <Stack key={'search_string_' + varIndex} direction={'row'} spacing={0.5} sx={{alignItems: 'center',
                      justifyContent: 'flex-start', borderStyle: 'solid', 
                      borderColor: 'lightblue',
                      borderWidth: 'thin', borderRadius: '10px',
                      pl:1, pr:1}}>
                        <FormGroup>
                          <FormControlLabel control={<Switch checked={(search_str.matchWholeWord===true) ? true : false} onChange={e => { handleVarArrChange(index, varIndex, 'matchWholeWord', e.target.checked)}} name="matchWord" size="small"/>} label="Match whole word" labelPlacement="end" />
                        </FormGroup>
                        
                        <Box>
                          <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                            <InputLabel htmlFor="outlined-adornment-value">String</InputLabel>
                            <Input
                              id="outlined-adornment-value" 
                              type="text"
                              value={search_str.string} 
                              onChange={e => {handleVarArrChange(index, varIndex, 'string', e.target.value)}}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle input helper" 
                                    onClick={() => {setCurVariable({index: index, varIndex: varIndex, string: search_str.string}); setShowHelper(true)}}
                                    onMouseDown={(event) => {event.preventDefault();}}
                                    edge="end"
                                  >
                                    <SettingsEthernetIcon/>
                                  </IconButton>
                                </InputAdornment>
                              }
                              label="String"
                            />
                          </FormControl>
                        </Box>

                        <Box>
                          <IconButton size="small" variant="outlined" color="error" title="Remove search string" onClick={() => { removeVarArr(index, varIndex) }}>
                              <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                      
                      );
                    })}
                </Stack>
                
                 
              </Stack>
            </Stack>


              
          )
        })}
        {<Box>
          <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addScript() }}>
            <AddIcon />
        </IconButton>
          </Box>}
        <Dialog
          open={showHelper}
          onClose={() => {setCurVariable({}); setShowHelper(false)}}
          aria-labelledby="helper-dialog"
          aria-describedby="helper-dialog"
          maxWidth={'md'} 
          fullWidth
        >
          <DialogContent sx={{
              flexGrow: 1,
              maxHeight: '20vh',
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
              <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'} >
                <Typography>{`Current string: ${curVariable.string}`}</Typography>
                <IconButton size="small" variant="outlined" color="success" title="Add string" onClick={() => { handleVarArrChange(curVariable.index, curVariable.varIndex, 'string', curVariable.string); setShowHelper(false);}}>
                    <AddTaskIcon />
                </IconButton>
              </Stack>
              <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'} >
                <FormControl sx={{ m: 0, minWidth: 100 }} size="small">
                  <InputLabel id="select-mode">Mode</InputLabel>
                  <Select
                    labelId="select-mode-label"
                    id="select-sel-mode"
                    value={getComponentFromValue(curVariable.string, 'mode')}
                    label="Mode"
                    onChange={e => {createValueFromComponents(e.target.value, '', '', true)}} 
                    inputProps={{ readOnly: false }}
                  >
                    {searchStringMode.map((obj, index) => {
                        return (<MenuItem key={'mode_' + index} value={obj.value}>{obj.label}</MenuItem>)
                      })}
                  </Select>
                </FormControl>
                {getComponentFromValue(curVariable.string, 'mode')!=='macro' && getComponentFromValue(curVariable.string, 'mode')!=='none' && 
                <FormControl sx={{ m: 1, width: 300 }}>
                  <InputLabel id="multi-select-options">Options</InputLabel>
                  <Select
                    labelId="multi-select-options-select"
                    id="demo-multiple-chip"
                    multiple
                    value={getComponentFromValue(curVariable.string, 'options').split('')}
                    onChange={(e) => handleChange(e)}
                    input={<OutlinedInput id="select-multiple-cols" label="Options" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {searchOptions.map((opt) => (
                      <MenuItem
                        key={opt.value}
                        value={opt.value}
                        style={getStyles(opt.value, getComponentFromValue(curVariable.string, 'options').split(''), theme)}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>}
                {(getComponentFromValue(curVariable.string, 'mode')==='macro') ? 
                  <FormControl sx={{ m: 0, minWidth: 100 }} size="small">
                    <InputLabel id="select-macro">Macro</InputLabel>
                    <Select
                      labelId="select-macro-label"
                      id="select-sel-macro"
                      value={getComponentFromValue(curVariable.string, 'string')}
                      label="Macro"
                      onChange={e => {createValueFromComponents(getComponentFromValue(curVariable.string, 'mode'), getComponentFromValue(curVariable.string, 'options'), e.target.value, true)}} 
                      inputProps={{ readOnly: false }}
                    >
                      {macrosList.map((obj, index) => {
                          return (<MenuItem key={'macro_' + index} value={obj.value}>{obj.label}</MenuItem>)
                        })}
                    </Select>
                  </FormControl>
                  : 
                  <TextField
                    margin="dense"
                    label="String (freeform)" 
                    id="varstring"
                    required
                    inputProps={{ readOnly: false }}
                    variant="standard" 
                    value={getComponentFromValue(curVariable.string, 'string')} 
                    onChange={e => {createValueFromComponents(getComponentFromValue(curVariable.string, 'mode'), getComponentFromValue(curVariable.string, 'options'), e.target.value,  true)}}
                    />}
                 
              </Stack>
            
          </DialogContent>
        </Dialog>

    </React.Fragment>
  );
}
