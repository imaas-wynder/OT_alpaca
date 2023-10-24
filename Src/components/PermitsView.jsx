import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

// MUI components
import { 
    TextField,
    FormControl,
    Table,
    TableContainer,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    Paper,
    InputLabel,
    OutlinedInput,
    Chip,
    Select,
    MenuItem,
    Stack,
    IconButton,
    Box
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

const permArray = ["browse",
"read_content",
"relate",
"lock",
"write",
"write_content",
"delete",
"change_permission",
"change_owner",
"change_location",
"change_folder_links",
"create_link",
"delete_link",
"add_member",
"delete_member",
"show_members",
"apply_policy",
"remove_policy",
"apply_hold",
"remove_hold",
"version"];

function getStyles(name, columns, theme) {
  return {
    fontWeight:
      columns.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightBold,
  };
}

export default function PermitsView(props) {
  const { inputFields, setInputFields } = props;

  const theme = useTheme();

  const handleChange = (event, index) => {
    const {
      target: { value },
    } = event;
    handleAttrChange(index, 'permissions', 
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
        let newfield = {identity: '', identity_type: '', permissions: []}
    
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
          <TableHead>
            <TableRow sx={{backgroundColor:'#e1e1e1'}}>
              <TableCell sx={{fontWeight:'bold'}}>Identity</TableCell>
              <TableCell align="left" sx={{fontWeight:'bold'}}>Identity Type</TableCell>
              <TableCell align="left" sx={{fontWeight:'bold'}}>Name</TableCell>
              <TableCell align="left" sx={{fontWeight:'bold'}}>Permits</TableCell>
              <TableCell align="left" sx={{fontWeight:'bold'}}>
                {<IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addFields() }}>
                    <AddIcon />
                </IconButton>}
              </TableCell>
            </TableRow>
          </TableHead>
          {inputFields && <TableBody>
            {inputFields.map((input, index) => (
              <TableRow hover key={'permit' + index}>
                <TableCell align="left">
                  {<TextField
                    margin="dense"
                    label="Identity" 
                    id="identity"
                    required
                    variant="standard" 
                    value={input.identity} 
                    onChange={e => {handleAttrChange(index, 'identity', e.target.value)}}
                    />}
                </TableCell>
                <TableCell align="left">
                  {<FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                    <Select
                      id="select-sel-type"
                      value={input.identity_type}
                      onChange={e => {handleAttrChange(index, 'identity_type', e.target.value)}} 
                    >
                      <MenuItem key={'user'} value={'user'}>{'user'}</MenuItem>
                      <MenuItem key={'role'} value={'role'}>{'role'}</MenuItem>
                      <MenuItem key={'user_alias'} value={'user_alias'}>{'user_alias'}</MenuItem>
                      <MenuItem key={'role_alias'} value={'role_alias'}>{'role_alias'}</MenuItem>
                      <MenuItem key={'tenant_group'} value={'tenant_group'}>{'tenant_group'}</MenuItem>
                      <MenuItem key={'subscription_group'} value={'subscription_group'}>{'subscription_group'}</MenuItem>
                      <MenuItem key={'case_role'} value={'case_role'}>{'case_role'}</MenuItem>
                    </Select>
                  </FormControl>}
                </TableCell>
                <TableCell align="left">
                  {input.email ? input.email : (input.group_name ? input.group_name : '')}
                </TableCell>
                <TableCell align="left">
                  <FormControl sx={{ m: 1, minWidth: 300 }}>
                    <InputLabel id="multi-select-attribute">Permits</InputLabel>
                    <Select
                      labelId="multi-select-attribute-select"
                      id="demo-multiple-chip"
                      multiple
                      value={input.permissions}
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
                      {permArray.map((permission) => (
                        <MenuItem
                          key={permission}
                          value={permission}
                          style={getStyles(permission, input.permissions, theme)}
                        >
                          {permission}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>

                <TableCell align="left">
                  <Stack direction="row">
                    {<IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeFields(index) }}>
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
