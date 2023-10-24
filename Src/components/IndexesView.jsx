import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

import { useTheme } from '@mui/material/styles';


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
    InputLabel,
    Select,
    MenuItem,
    Switch,
    Stack,
    IconButton,
    OutlinedInput ,
    Chip,
    Box
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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


export default function IndexesView(props) {
  const { inputFields, setInputFields, isNew, actionOnIndex, inAttributes, isEdit, isSingle } = props;

  const [activeId, setActiveId] = React.useState('');
  const theme = useTheme();

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
  
  const handleChange = (event, index) => {
    const {
      target: { value },
    } = event;
    handleAttrChange(index, 'columns', 
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

    const handleAttrChange = (index, inName, inValue) => {
        let data = [...inputFields];
        data[index][inName] = inValue;
        setInputFields(data);
    }

    const addFields = () => {
        let newfield = {name: '', unique: false, columns: []}
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
          <TableHead >
            <TableRow sx={{backgroundColor:'#e1e1e1', fontWeight: 'bold'}}>
              <TableCell>Index Name</TableCell>
              <TableCell align="left">Unique</TableCell>
              <TableCell align="left">Columns</TableCell>
              <TableCell align="left">
                {isNew && !isSingle && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addFields() }}>
                    <AddIcon />
                </IconButton>}
                {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { actionOnIndex('new', {name: '', unique: false, columns: []}) }}>
                    <AddIcon />
                </IconButton>}
              </TableCell>
            </TableRow>
          </TableHead>
          {inputFields && <TableBody>
            {inputFields.map((input, index) => (
              <TableRow hover key={'indexAttributes' + index}>
                <TableCell align="left">
                  {(isNew || isSingle) ? <TextField
                    margin="dense"
                    label="Index name" 
                    id="name"
                    required
                    variant="standard" 
                    value={input.name} 
                    onChange={e => {handleAttrChange(index, 'name', e.target.value)}}
                    /> : input.name}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControlLabel
                      control={
                        <Switch checked={input.unique} onChange={(e) => {handleAttrChange(index, 'unique', e.target.checked)}} name="unique" size="small"/>
                      }
                    disabled={!isNew && !isSingle} /> : (input.unique ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>)}
                </TableCell>
                <TableCell align="left">
                  {(isNew || isSingle) ? <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel id="multi-select-attribute">Columns</InputLabel>
                    <Select
                      labelId="multi-select-attribute-select"
                      id="demo-multiple-chip"
                      multiple
                      value={input.columns}
                      onChange={(e) => handleChange(e, index)}
                      input={<OutlinedInput id="select-multiple-cols" label="Columns" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {inAttributes.map((attribute) => (
                        <MenuItem
                          key={attribute.name}
                          value={attribute.name}
                          style={getStyles(attribute.name, input.columns, theme)}
                        >
                          {attribute.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl> : input.columns.join(',')}
                </TableCell>
                <TableCell align="left">
                  <Stack direction="row">
                    {isNew && !isSingle && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeFields(index) }}>
                        <RemoveIcon />
                    </IconButton>}
                    {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="warning" title="Modify" onClick={() => { actionOnIndex('edit', inputFields[index]) }}>
                        <EditIcon />
                    </IconButton>}
                    {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { actionOnIndex('delete', inputFields[index]) }}>
                        <RemoveIcon />
                    </IconButton>}
                    </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
        </Table>
      </TableContainer>
        

  );
}
