import * as React from 'react';
import dayjs from 'dayjs';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import { 
    TextField,
    FormControl,
    FormControlLabel,
    Table,
    TableContainer,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    Paper,
    Select,
    MenuItem,
    Switch,
    Stack,
    IconButton
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
// or for Day.js
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';


export default function AttributesView(props) {
  const { inputFields, setInputFields, isNew, actionOnAttribute, isEdit, isSingle } = props;

  

    const handleAttrChange = (index, inName, inValue) => {
        let data = [...inputFields];
        switch (inName) {
          case 'size':
            data[index][inName] = parseInt(inValue ?? 0);
            break;
          case 'type':
            data[index][inName] = inValue;
            //reset defaultValue
            data[index]['defaultValue'] = '';
            break;
          case 'defaultValue':
            let newfield = {displayName: data[index].displayName, name: data[index].name, type: data[index].type, size: data[index].size, repeating: data[index].repeating, required: data[index].required, unique: data[index].unique, readOnly: data[index].readOnly, searchable: data[index].searchable, sortable: data[index].sortable, id: data[index].id }
            switch (data[index].type) {
              case 'integer':
                newfield.defaultValue = isNaN(Number(inValue))?0:parseInt(inValue) ;
                break;
              case 'double':
                newfield.defaultValue = isNaN(Number(inValue)) ? 0 : Number(inValue) ;
                break;
              case 'bigint':
                newfield.defaultValue = isNaN(Number(inValue))?0:parseInt(inValue) ;
                break;
              case 'date':
                newfield.defaultValue = inValue;
                break;
              case 'boolean':
                newfield.defaultValue = (inValue=='true' || inValue==true);
                break;
              default:
                newfield.defaultValue = inValue;
                break;
            }
            data.splice(index, 1, newfield);
            break;
          default:
            data[index][inName] = inValue;
            break;
        }
        
        setInputFields(data); 
    }

    const addFields = () => {
        let newfield = {displayName: '', name: '', type: 'string', defaultValue: '', size: 256, repeating: false, required: false, unique: false, readOnly: false, searchable: false, sortable: false, id: ''}
    
        setInputFields([...inputFields, newfield])
    }

 

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
      <TableContainer component={Paper} sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overflowY: "auto", 
              overflowX: "auto", 
              "&::-webkit-scrollbar": {
                height: 3,
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
        <Table size="small" aria-label="collapsible table">
          <TableHead>
            <TableRow sx={{backgroundColor:'#e1e1e1'}}>
              <TableCell>Display Name</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Data type</TableCell>
              <TableCell align="left">Size</TableCell>
              <TableCell align="left">Default value</TableCell>
              <TableCell align="left">Repeating</TableCell>
              <TableCell align="left">Required</TableCell>
              <TableCell align="left">Unique</TableCell>
              <TableCell align="left">Read-Only</TableCell>
              <TableCell align="left">Searchable</TableCell>
              <TableCell align="left">Sortable</TableCell>
              <TableCell align="left">
                {isNew && !isSingle && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addFields() }}>
                    <AddIcon />
                </IconButton>}
                {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { actionOnAttribute('new', {displayName: '', name: '', type: 'string', defaultValue: '', size: 256, repeating: false, required: false, unique: false, readOnly: false, searchable: false, sortable: false }) }}>
                    <AddIcon />
                </IconButton>}
              </TableCell>
            </TableRow>
          </TableHead>
          {inputFields && <TableBody>
            {inputFields.map((input, index) => (
              <TableRow hover key={'attribute' + index}>
                <TableCell align="left">
                  {(isNew || isSingle) ? <TextField
                    margin="dense"
                    label="Display name" 
                    id="displayName"
                    required
                    variant="standard" 
                    value={input.displayName} 
                    onChange={e => {handleAttrChange(index, 'displayName', e.target.value)}}
                    /> : input.displayName}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <TextField
                    margin="dense"
                    label="Name" 
                    id="name"
                    required
                    inputProps={{ readOnly: !isNew }}
                    variant="standard" 
                    value={input.name} 
                    onChange={e => {handleAttrChange(index, 'name', e.target.value)}}
                    /> : input.name}
                </TableCell>
                <TableCell align="left">
                  {isNew ?  <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                    <Select
                      id="select-sel-type"
                      value={input.type}
                      onChange={e => {handleAttrChange(index, 'type', e.target.value)}} 
                      inputProps={{ readOnly: !isNew }}
                    >
                      <MenuItem key={'string'} value={'string'}>{'string'}</MenuItem>
                      <MenuItem key={'boolean'} value={'boolean'}>{'boolean'}</MenuItem>
                      <MenuItem key={'datetime'} value={'date'}>{'date'}</MenuItem>
                      <MenuItem key={'double'} value={'double'}>{'double'}</MenuItem>
                      <MenuItem key={'integer'} value={'integer'}>{'integer'}</MenuItem>
                      <MenuItem key={'bigint'} value={'bigint'}>{'bigint'}</MenuItem>
                      <MenuItem key={'id'} value={'id'}>{'id'}</MenuItem>
                    </Select>
                  </FormControl>: input.type}
                </TableCell>
                <TableCell align="left">
                  {((isNew || isSingle) && (input.type=='string')) ? <TextField
                    margin="dense"
                    label="Size" 
                    id="size"
                    type="number"
                    inputProps={{ readOnly: !isNew }}
                    variant="standard" 
                    value={input.size} 
                    onChange={e => {handleAttrChange(index, 'size', e.target.value)}}
                    /> : (input.type=='string') ? input.size : ''}
                  </TableCell>
                <TableCell align="left">
                  {(input.type=='string' || input.type=='id') && <TextField
                  margin="dense"
                  label=""
                  id="value"
                  inputProps={{ readOnly: (isEdit && !isSingle) }}
                  variant="standard" 
                  value={input.defaultValue}
                  onChange={e => {handleAttrChange(index, 'defaultValue', e.target.value)}}
                  />}
                  {(input.type=='integer' || input.type=='double' || input.type=='bigint') && <TextField
                  margin="dense"
                  label=""
                  id="value"
                  type="number"
                  inputProps={{ readOnly: (isEdit && !isSingle) }}
                  variant="standard" 
                  value={input.defaultValue}
                  onChange={e => {handleAttrChange(index, 'defaultValue', e.target.value)}}
                  />}
                  {(input.type=='boolean') && <Switch checked={(input.defaultValue===true)?true:false} onChange={e => {handleAttrChange(index, 'defaultValue', e.target.checked)}} name="booleanValue" disabled={(isEdit && !isSingle)} />}
                  {(input.type=='date') && <DesktopDatePicker
                    label=""
                    inputFormat="MM/DD/YYYY" 
                    readOnly={(isEdit && !isSingle)}
                    value={input.defaultValue ? dayjs(input.defaultValue) : null}
                    onChange={e => {handleAttrChange(index, 'defaultValue', e)}}
                    renderInput={(params) => <TextField {...params} />}
                  />}
                </TableCell>
                <TableCell align="left">
                  {isNew ? <FormControlLabel
                    control={
                      <Switch checked={input.repeating} onChange={(e) => {handleAttrChange(index, 'repeating', e.target.checked)}} name="repeating" size="small"/>
                    }
                  /> : (input.repeating ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControlLabel
                    control={
                      <Switch checked={input.required} onChange={(e) => {handleAttrChange(index, 'required', e.target.checked)}} name="required" size="small"/>
                    }
                  /> : (input.required ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControlLabel
                    control={
                      <Switch checked={input.unique} onChange={(e) => {handleAttrChange(index, 'unique', e.target.checked)}} name="unique" size="small"/>
                    }
                  /> : (input.unique ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControlLabel
                    control={
                      <Switch checked={input.readOnly} onChange={(e) => {handleAttrChange(index, 'readOnly', e.target.checked)}} name="readOnly" size="small"/>
                    }                    
                  /> : (input.readOnly ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControlLabel
                    control={
                      <Switch checked={input.searchable} onChange={(e) => {handleAttrChange(index, 'searchable', e.target.checked)}} name="searchable" size="small"/>
                    }
                  /> : (input.searchable ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControlLabel
                    control={
                      <Switch checked={input.sortable} onChange={(e) => {handleAttrChange(index, 'sortable', e.target.checked)}} name="sortable" size="small"/>
                    }
                  /> : (input.sortable ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  <Stack direction="row">
                    {isNew && !isSingle && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeFields(index) }}>
                        <RemoveIcon />
                    </IconButton>}
                    {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="warning" title="Modify" onClick={() => { actionOnAttribute('edit', inputFields[index]) }}>
                        <EditIcon />
                    </IconButton>}
                    {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { actionOnAttribute('delete', inputFields[index]) }}>
                        <RemoveIcon />
                    </IconButton>}
                    </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
        </Table>
      </TableContainer>
        
    </LocalizationProvider>
  );
}
