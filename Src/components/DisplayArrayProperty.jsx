import * as React from 'react';
import dayjs from 'dayjs';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Stack,
    Switch
} from '@mui/material';

import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
// or for Day.js
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
  


  export default function DisplayArrayProperty(props) {
    const {  title, arrProperty, setArrProperty, isEdit, propType } = props;

    const handleAddValue = () => {
        //let data = [...arrProperty];

        //data.splice(index,1,'value') - replaces the item with a new item
        //data.splice(index,1) - removes the item
        //setArrProperty([...arrProperty, 'newfield']) - adds a new item
        let value = getDefaultValue(propType);

        setArrProperty([...arrProperty, value]);
      }

      const handleRemoveValue = (index) => {
        let data = [...arrProperty];

        data.splice(index, 1);
        //setArrProperty([...arrProperty, 'newfield']) - adds a new item

        setArrProperty(data);
      }

      const handleUpValue = (index) => {
        if (index>0) {
            let data = [...arrProperty];
            //console.log(data);
            let value = data[index];
            data.splice(index-1,0, value)
            data.splice(index+1, 1);
            //setArrProperty([...arrProperty, 'newfield']) - adds a new item
            //console.log(data);
            setArrProperty(data);
        }
      }

      const handleDownValue = (index) => {
        
        let data = [...arrProperty];
            
        if (index<data.length) {
            let value = data[index];
            data.splice(index, 1);
            data.splice(index+1,0, value)
            
            //setArrProperty([...arrProperty, 'newfield']) - adds a new item

            setArrProperty(data);
        }
      }

      const handleChangeValue = (value, index) => {
        let data = [...arrProperty];
        let newVal;

        switch (propType) {
            case 'integer':
              newVal = isNaN(Number(value))?0:parseInt(value) ;
              break;
            case 'double':
                newVal = isNaN(Number(value)) ? 0 : Number(value) ;
              break;
            case 'bigint':
                newVal = isNaN(Number(value))?0:parseInt(value) ;
              break;
            case 'date':
                newVal = value;
              break;
            case 'boolean':
                newVal = (value==='true' || value===true);
              break;
            default:
                newVal = value;
              break;
          }

        data.splice(index,1, newVal)
        //data.splice(index,1) - removes the item
        //setArrProperty([...arrProperty, 'newfield']) - adds a new item

        setArrProperty(data);
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

      useEffect(() => {
        
      }, []);
    

      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <React.Fragment>
            <Typography variant="subtitle1" gutterBottom>
                <Stack direction="row" justifyContent="space-between">
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
                        {title + ` (${propType})`}
                    </Box>
                    {isEdit && <Box>
                        <IconButton size="small" variant="outlined" color="success" title="Add" onClick={() => { handleAddValue() }}>
                            <AddIcon />
                        </IconButton>
                    </Box>}
                </Stack>
            </Typography>
            {arrProperty && arrProperty.length==0 && <Typography variant="subtitle1" gutterBottom>
                <Box
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    fontStyle: 'italic',
                    p: 0,
                    m: 0
                    }}
                >
                    No values were found for this category.
                </Box>
            </Typography>}
            <Stack direction={'column'} spacing={1}>
            {arrProperty && arrProperty.map((value, index) => {
                return (
                    <React.Fragment key={title + index}>
                        {isEdit?
                            <Stack direction="row">

                                {(propType=='string' || propType=='id') && 
                                    <TextField
                                    margin="dense"
                                    id="arrValue" 
                                    type="value"
                                    key="arrValue" 
                                    fullWidth
                                    variant="standard" 
                                    value={value?value:''}
                                    onChange={e => {handleChangeValue(e.target.value, index)}}
                                    />}
                                {(propType=='integer' || propType=='double' || propType=='bigint') && 
                                    <TextField
                                    margin="dense"
                                    label=""
                                    id="value"
                                    type="number"
                                    fullWidth
                                    variant="standard" 
                                    value={value?value:0}
                                    onChange={e => {handleChangeValue(e.target.value, index)}}
                                    />}
                                {(propType=='boolean') && <Switch checked={value} onChange={e => {handleChangeValue(e.target.checked, index)}} name="booleanValue" />}
                                {(propType=='date') && <DesktopDatePicker
                                    label="Date"
                                    inputFormat="MM/DD/YYYY"
                                    value={value ? dayjs(value) : null}
                                    onChange={e => {handleChangeValue(e, index)}}
                                    renderInput={(params) => <TextField {...params} />}
                                    />}

                                


                                <Box>
                                    <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { handleRemoveValue(index) }}>
                                        <RemoveIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <IconButton size="small" variant="outlined" color="default" title="Remove" onClick={() => { handleUpValue(index) }}>
                                        <KeyboardArrowUpIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <IconButton size="small" variant="outlined" color="default" title="Remove" onClick={() => { handleDownValue(index) }}>
                                        <KeyboardArrowDownIcon />
                                    </IconButton>
                                </Box>
                            </Stack>
                        :
                            <Typography variant="subtitle1" gutterBottom>
                                <Box
                                    sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    p: 0,
                                    m: 0
                                    }}
                                >
                                    {value}
                                </Box>
                            </Typography>
                        }
                    </React.Fragment>
                )
            })}</Stack>
        </React.Fragment>
        </LocalizationProvider>
      );
  }