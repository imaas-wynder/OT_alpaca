import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


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
    Select,
    MenuItem,
    Stack,
    IconButton
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';



export default function RequiredTraitsView(props) {
  const { inputFields, setInputFields, isNew, actionOnTrait, isEdit, isSingle, runRequest, token, showBorder } = props;

  const [traitList, setTraitList] = React.useState([]);
  
  const [activeId, setActiveId] = React.useState('');

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
  

    const handleAttrChange = (index, inName, inValue) => {
        let data = [...inputFields];
        data[index][inName] = inValue;
        setInputFields(data);
    }

    const addFields = () => {
        let newfield = {instance_name: '', trait_name: '', display_name: ''}
        setInputFields([...inputFields, newfield])
    }

    const removeFields = (index) => {
        let data = [...inputFields];
        data.splice(index, 1);
        setInputFields(data);
    }

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
  
      }, '', []);
     
  
    };


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      getTraits();
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
          <TableHead sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='drpTrait'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
            <TableRow sx={{backgroundColor:'#e1e1e1', fontWeight: 'bold'}}>
              <TableCell>Instance Name</TableCell>
              {isNew && <TableCell align="left">Trait</TableCell>}
              <TableCell align="left">System name</TableCell>
              <TableCell align="left">Display name</TableCell>
              <TableCell align="left">
                {isNew && !isSingle && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addFields() }}>
                    <AddIcon />
                </IconButton>}
                {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { actionOnTrait('new', {instance_name: '', trait_name: '', display_name: ''}) }}>
                    <AddIcon />
                </IconButton>}
              </TableCell>
            </TableRow>
          </TableHead>
          {inputFields && <TableBody>
            {inputFields.map((input, index) => (
              <TableRow hover key={'reqTraitsFields' + index}>
                <TableCell align="left">
                  {(isNew || isSingle) ? <TextField
                    margin="dense"
                    label="Instance name" 
                    id="instanceName"
                    required
                    variant="standard" 
                    value={input.instance_name} 
                    onChange={e => {handleAttrChange(index, 'instance_name', e.target.value)}}
                    /> : input.instance_name}
                </TableCell>
                
                {isNew &&  <TableCell align="left">
                  <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                    <Select
                      id="select-sel-type"
                      value={input.trait_name} 
                      onChange={e => {handleAttrChange(index, 'trait_name', e.target.value); handleAttrChange(index, 'display_name', traitList.find((element)=> element.system_name == e.target.value).display_name)}} 
                      inputProps={{ readOnly: !isNew }}
                    >
                      {traitList.map((item) => (
                        <MenuItem key={item.system_name} value={item.system_name}>{item.display_name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>}
                <TableCell align="left">
                  {input.trait_name}
                </TableCell>
                <TableCell align="left">
                  {input.display_name}
                </TableCell>
                <TableCell align="left">
                  <Stack direction="row">
                    {isNew && !isSingle && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeFields(index) }}>
                        <RemoveIcon />
                    </IconButton>}
                    {false && isEdit && !isSingle && <IconButton size="small" variant="outlined" color="warning" title="Modify" onClick={() => { actionOnTrait('edit', inputFields[index]) }}>
                        <EditIcon />
                    </IconButton>}
                    {isEdit && !isSingle && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { actionOnTrait('delete', inputFields[index]) }}>
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
