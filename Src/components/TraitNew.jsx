import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  FormControl,
  Select,
  Paper,
  MenuItem,
  Tab, Tabs,Stack,
  Typography
} from '@mui/material';

import DataObjectIcon from '@mui/icons-material/DataObject';
import ListIcon from '@mui/icons-material/List';

import AttributesView from './AttributesView';
import IndexesView from './IndexesView';
import PropTypes from 'prop-types';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{width: 1}}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TraitNew(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder, namespaces } = props;
  
  const [value, setValue] = React.useState(0);

  const [namespace, setNamespace] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [name, setName] = React.useState('');

  const [attributes, setAttributes] = React.useState([]);
  const [indexes, setIndexes] = React.useState([]);
  
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
  
  //tab panel change  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  const handleClose = () => {
    onCreateSuccess(false);
  };


  const handleCreate = () => {
    addActiveId('newButton');
    let attVals = [];
    for (let i=0; i<attributes.length; i++) {
      let curItem = {name: attributes[i].name, display_name: attributes[i].displayName, data_type: attributes[i].type, repeating: attributes[i].repeating, required: attributes[i].required, unique: attributes[i].unique, read_only: attributes[i].readOnly, searchable: attributes[i].searchable, sortable: attributes[i].sortable}
      if (attributes[i].defaultValue) {
        curItem.default_value= attributes[i].type=='date' ? attributes[i].defaultValue.toISOString() : attributes[i].defaultValue;
      }
      if (attributes[i].type=='string' && attributes[i].size) {
        curItem.size=attributes[i].size;
      }
      attVals.push(curItem);
    }

    let data = {
      name: name,
      display_name: displayName,
      namespace: namespace,
      attributes: attVals
    }

    if (description) data.description=description;

    if (indexes.length>0) data.indexes=indexes;

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.name) {
        onCreateSuccess(true); 
      } 
      removeActiveId('newButton');

    }, '', []);
   

  };


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setNamespace('');
      setDisplayName('');
      setName('');
      setDescription('');
      setAttributes([]);
      setIndexes([]);
      setValue(0);
    }
  }, [newOpen]);

  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Create trait</DialogTitle>
        <DialogContent sx={{
          maxHeight: '60vh',
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
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                orientation="horizontal"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="properties tabs"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                
                
                <Tab icon={<DataObjectIcon/>} label="Attributes" {...a11yProps(0)} />
                <Tab icon={<ListIcon/>} label="Indexes" {...a11yProps(1)} />
              </Tabs>
            </Box>
          
          <Stack spacing={2} direction="row">
            <Box >
              <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="select-namespace">Namespace</InputLabel>
                  <Select
                  labelId="select-namespace"
                  label="Namespace"
                  id="namespaceDrp"
                  value={namespace} 
                  
                  onChange={(event) => {setNamespace(event.target.value);}} 

                >
                  {namespaces.map((item) => (
                    <MenuItem key={item.name} value={item.name}>{item.display_name + ' (' + item.prefix + ')'}</MenuItem>
                  ))}
                  
                </Select>
              </FormControl>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              id="trait-disp-name"
              label="Display name"
              type="name"
              required
              variant="standard" 
              value={displayName}
              onChange={e => {setDisplayName(e.target.value)}}
            />
            <TextField
              margin="dense"
              id="trait-name"
              label="Trait name"
              type="name"
              required
              variant="standard" 
              value={name}
              onChange={e => {setName(e.target.value)}}
            />
            
            
          </Stack>
          <Stack spacing={2} direction="row">
            <TextField
              margin="dense"
              id="trait-desc"
              label="Description" 
              multiline 
              type="name"
              variant="standard" 
              value={description}
              onChange={e => {setDescription(e.target.value)}}
            />
          </Stack>
          
            
            <TabPanel value={value} index={0}>
              <Stack direction="column" spacing={2}>
                <Paper elevation={3} sx={{p:2}}>
                <AttributesView inputFields={attributes} setInputFields={(props) => {setAttributes(props);}} isNew={true} isEdit={false} actionOnAttribute={() => {}}/>
                </Paper> 
              </Stack>  
            </TabPanel>
            
            <TabPanel value={value} index={1}>
              <Stack direction="column" spacing={2}>
                <Paper elevation={3} sx={{p:2}}>
                  <IndexesView  
                    inputFields={indexes} 
                    setInputFields={(props) => {setIndexes(props);}} 
                    isNew={true} 
                    isEdit={false} 
                    actionOnIndex={() => {}}
                    inAttributes={attributes}
                    />
                </Paper> 
              </Stack>  
            </TabPanel>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleCreate} disabled={!name }>Create</Button>
          </Box>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
