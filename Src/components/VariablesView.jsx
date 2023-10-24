import * as React from 'react';
import dayjs from 'dayjs';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import { 
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    IconButton,
    Box
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
// or for Day.js
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Stack } from '@mui/system';

export default function VariablesView(props) {
  const { inputFields, setInputFields, canAdd, canRemove, canEdit, showDisplayName, validateJson } = props;

  

    const handleVarChange = (index, inName, inValue) => {
        let data = [...inputFields];
        if (inName=='value' && data[index]['type']=='date' && inValue) {
          //inValue = inValue.toISOString();
          //set it to iso string when it's done. if you set it here you cannot enter data by typing
        }
        data[index][inName] = inValue;


        
        let newfield = {};        

          switch(data[index]['type']) {
            case 'integer':
              if (isNaN(Number(data[index]['value']))) {data[index]['value']='0'}
              newfield = {name: data[index]['name'], type: data[index]['type'], value: Number(data[index]['value']), displayName: data[index]['displayName'] , valid: true}
              break;
            case 'double':
              //console.log(data[index]['value']);
              if (isNaN(Number(data[index]['value']))) 
                {data[index]['value']='0'}
              
                
              newfield = {name: data[index]['name'], type: data[index]['type'], value: data[index]['value'], displayName: data[index]['displayName'], valid: true }
              break;
            case 'long':
              if (isNaN(Number(data[index]['value']))) {data[index]['value']='0'}
              newfield = {name: data[index]['name'], type: data[index]['type'], value: Number(data[index]['value']), displayName: data[index]['displayName'], valid: true }
              break;
            case 'date':
              //if (!dayjs(data[index]['value']).isValid()) {data[index]['value']=dayjs().toISOString()}
              newfield = {name: data[index]['name'], type: data[index]['type'], value: (data[index]['value']==''?null:data[index]['value']), displayName: data[index]['displayName'], valid: true }
              break;
            case 'boolean':
              newfield = {name: data[index]['name'], type: data[index]['type'], value: (data[index]['value']=='true' || data[index]['value']==true), displayName: data[index]['displayName'], valid: true }
              break;
            case 'json':
              let resultJson = true;
              let valOutput = '';
              if (data[index]['value'].constructor === Object) {
                valOutput = data[index]['value'];
                resultJson = true;
              } else {
                try { 
                  valOutput = JSON.parse(data[index]['value']);
                  resultJson = true;
                } catch (error) {
                  valOutput = data[index]['value'];
                  resultJson = false;
                }
              }
              
              newfield = {name: data[index]['name'], type: data[index]['type'], value: (valOutput), displayName: data[index]['displayName'], valid: resultJson }
              break;
            default:
              newfield = {name: data[index]['name'], type: data[index]['type'], value: data[index]['value'], displayName: data[index]['displayName'], valid: true }

          }
        data.splice(index, 1, newfield);
        
        setInputFields(data);
    }

    const addFields = () => {
        let newfield = {name: '', type: 'string', value: '', displayName: '', valid: true }
    
        setInputFields([...inputFields, newfield])
    }

 
    const handleDtChange = (newValue, index) => {
      //console.log('New index: ' + index);
      //console.log(newValue.toISOString());
    };

    const removeFields = (index) => {
        let data = [...inputFields];
        data.splice(index, 1);
        setInputFields(data);
    }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log("useEffect() - occurs ONCE, AFTER the initial render (unless react.strict mode) - variables view");
        if (inputFields.length==0) {
          //setInputFields([{ name: '', type: 'string', value: ''}]);
        }
        
    },[]
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        {inputFields.map((input, index) => {
          return (
            <Stack key={'variable_view' + index} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              {canEdit ? <React.Fragment>
              <TextField
                margin="dense"
                label="Variable name" 
                id="name"
                required
                inputProps={{ readOnly: !canEdit }}
                variant="standard" 
                value={input.name} 
                onChange={e => {handleVarChange(index, 'name', e.target.value)}}
                />
              {showDisplayName && <TextField
                margin="dense"
                label="Display name" 
                id="displayName"
                required
                inputProps={{ readOnly: !canEdit }}
                variant="standard" 
                value={input.displayName} 
                onChange={e => {handleVarChange(index, 'displayName', e.target.value)}}
                />}
              <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                <InputLabel id="select-type">Type</InputLabel>
                <Select
                  labelId="select-type"
                  id="select-sel-type"
                  value={input.type}
                  label="Type"
                  onChange={e => {handleVarChange(index, 'type', e.target.value)}} 
                  inputProps={{ readOnly: !canEdit }}
                >
                  <MenuItem key={'string'} value={'string'}>{'string'}</MenuItem>
                  <MenuItem key={'boolean'} value={'boolean'}>{'boolean'}</MenuItem>
                  <MenuItem key={'datetime'} value={'date'}>{'date'}</MenuItem>
                  <MenuItem key={'double'} value={'double'}>{'double'}</MenuItem>
                  <MenuItem key={'integer'} value={'integer'}>{'integer'}</MenuItem>
                  <MenuItem key={'long'} value={'long'}>{'long'}</MenuItem>
                  <MenuItem key={'json'} value={'json'}>{'json'}</MenuItem>

                </Select>
              </FormControl>
              </React.Fragment> : 
              <React.Fragment>
              <Stack direction={'row'} spacing={1} sx={{mr:2}}>
                {showDisplayName && <Box sx={{fontWeight:'bold'}}>{input.displayName + ' ('}</Box>}
                <Box sx={{}}>{input.name}</Box>
                {showDisplayName && <Box sx={{fontWeight:'bold'}}>{') -'}</Box>}
                <Box sx={{fontStyle:'italic'}}>{input.type + ':'}</Box>
              </Stack>
              </React.Fragment>
              }
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                
                {(input.type!='boolean' && input.type!='date') && <TextField
                  margin="dense"
                  label="Variable value"
                  id="value"
                  required
                  multiline={(input.type==='json')} 
                  maxRows={(input.type==='json')?4:0}
                  error={(!input.valid && validateJson)} 
                  helperText={(!input.valid && validateJson) ? 'Not a valid JSON' : ''}
                  variant="standard" 
                  value={(input.type==='json' && input.valid===true) ? JSON.stringify(input.value) : input.value}
                  onChange={e => {handleVarChange(index, 'value', e.target.value)}}
                  />}
                  {(input.type=='boolean') && <Switch checked={input.value} onChange={e => {handleVarChange(index, 'value', e.target.checked)}} name="booleanValue" />}
                  {(input.type=='date') && <DesktopDatePicker
                    label="Date"
                    inputFormat="MM/DD/YYYY"
                    value={input.value ? dayjs(input.value) : null}
                    onChange={e => {handleVarChange(index, 'value', e)}}
                    renderInput={(params) => <TextField {...params} />}
                  />}
                  {canRemove && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeFields(index) }}>
                      <RemoveIcon />
                  </IconButton>}
              </Stack>
            </Stack>


              
          )
        })}
        {canAdd && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addFields() }}>
            <AddIcon />
        </IconButton>}
    </LocalizationProvider>
  );
}
