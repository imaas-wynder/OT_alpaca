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
  Tab,
  Tabs,
  Paper,
  FormControlLabel ,
  Switch, Stack,
  FormGroup,  
  Typography
} from '@mui/material';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import PropTypes from 'prop-types';
import PermitsView from './PermitsView';

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
        <Box sx={{ p: 3 }} >
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

export default function ACLProps(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder, inObj , isNew } = props;
  
  const [value, setValue] = React.useState(0);

  const [aclObject, setAclObject] = React.useState({});

  const [permits, setPermits] = React.useState([]);
  
  //const [hasInstances, setHasInstances] = React.useState(false);


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
    setAclObject({});
    onCreateSuccess(false);
  };

  const handleUpdateValue = (valName, value) => {
    let updatedValue = {};
    updatedValue[valName]=value;
    setAclObject (aclObject => ({
          ...aclObject,
          ...updatedValue
        }));
  }

  const handleUpdate = () => {
    addActiveId('updButton');
    
    let data = {
      name: aclObject.name,
      named: aclObject.named,
      permits: permits
    }
    if (aclObject.description) data.description=aclObject.description;

    let req = { 
      method: isNew ? 'post' : 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/permissions${isNew ? '' : `/${aclObject.id}`}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.name) {
        onCreateSuccess(true);
      } 
      removeActiveId('updButton');

    }, '', []);
   

  };



  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setValue(0);
      setPermits(inObj.permits);
      setAclObject(inObj);
    }
  }, [newOpen]);


  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Update ACL</DialogTitle>
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

        <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
          >
            <Tabs
              orientation="vertical"
              variant="fullWidth"
              value={value} 
              onChange={handleChange}
              aria-label="properties tabs"
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              
              <Tab icon={<SettingsSystemDaydreamIcon/>} label="System" {...a11yProps(0)} sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='getType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}/>
              <Tab icon={<DataObjectIcon/>} label="Permits" {...a11yProps(1)} />
            </Tabs>
            
            <TabPanel value={value} index={0}>
                <Stack spacing={2} direction="column" sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='getType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                
                <TextField
                  autoFocus
                  margin="dense"
                  id="acl-name"
                  label="ACL name"
                  type="name"
                  required
                  fullWidth
                  variant="standard" 
                  value={aclObject.name ?? ''}
                  onChange={e => {handleUpdateValue('name', e.target.value)}}
                />
                <TextField
                  margin="dense"
                  id="acl-desc"
                  label="Description"
                  type="description"
                  variant="standard" 
                  fullWidth
                  value={aclObject.description ?? ''}
                  onChange={e => {handleUpdateValue('description', e.target.value)}} 
                />
                <FormGroup>
                  <FormControlLabel
                      control={
                        <Switch checked={aclObject.named===true} onChange={(e) => {handleUpdateValue('named', e.target.checked)}} name="named" size="small"/>
                      }
                      label="Named"/>
                </FormGroup>
              </Stack>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Stack direction="column" spacing={2}>
                  <Paper elevation={3} sx={{p:2}}>
                    <Typography  variant="button" display="block" gutterBottom>Permits</Typography>
                    <PermitsView  
                      inputFields={permits} 
                      setInputFields={(props) => {setPermits(props);}} 
                    />
                  </Paper> 
              </Stack>  
            </TabPanel>
            
        </Box>
          
          
            
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {<Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='updButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleUpdate} disabled={!aclObject.name }>Update</Button>
          </Box>}
          
        </DialogActions>
        
      </Dialog>
    

    
  );
}
