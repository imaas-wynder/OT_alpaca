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
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
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

export default function NamespaceProps(props) {
  const { runRequest, newOpen, onCreateSuccess, token, showBorder, inObj } = props;
  
  const [nmObject, setNmObject] = React.useState({});
  const [arrProps, setArrProps] = React.useState([]);

  const [value, setValue] = React.useState(0);


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
    setNmObject({});
    onCreateSuccess(false);
  };


  const handleUpdateValue = (valName, value) => {
    let updatedValue = {};
    updatedValue[valName]=value;
    setNmObject (nmObject => ({
          ...nmObject,
          ...updatedValue
        }));
  }

  const handleUpdate = () => {
    addActiveId('updButton');
    
    let data = {
      name: nmObject.name,
      display_name: nmObject.display_name,
      prefix: nmObject.prefix,
      active: nmObject.active
    }
    if (nmObject.description) data.description=nmObject.description;

    let req = { 
      method: 'patch', 
      data: data,
      url: `${inObj._links.self.href}`, 
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

  const getNamespaceDetails = () => {
    setNmObject(inObj);
      let array = [];
      
        
      array.push({name: 'Created by', value: inObj.created_by});
      array.push({name: 'Created', value: getDateValue(inObj.create_time)});
      array.push({name: 'Updated', value: getDateValue(inObj.update_time)});
      array.push({name: 'Updated by', value: inObj.updated_by});
      setArrProps(array);
  };

  

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      setValue(0);
      setArrProps([]);
      getNamespaceDetails();
      
    }
  }, [newOpen]);

  return (
    
      <Dialog open={newOpen} onClose={handleClose} maxWidth={'xl'} fullWidth >
        <DialogTitle>Update namespace</DialogTitle>
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
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="properties tabs"
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              
              <Tab icon={<SettingsSystemDaydreamIcon/>} label="System" {...a11yProps(0)} sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='getType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}/>              
            </Tabs>
            
            <TabPanel value={value} index={0}>
                <Stack spacing={2} direction="row" sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='getType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                
                <TextField
                  autoFocus
                  margin="dense"
                  id="namespace-disp-name"
                  label="Display name"
                  type="name"
                  required
                  variant="standard" 
                  value={nmObject.display_name ?? ''}
                  onChange={e => {handleUpdateValue('display_name', e.target.value)}}
                />
                <TextField
                  margin="dense"
                  id="namespace-name"
                  label="Name"
                  type="name"
                  required
                  variant="standard" 
                  value={nmObject.name ?? ''}
                  onChange={e => {handleUpdateValue('name', e.target.value)}} 
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  margin="dense"
                  id="namespace-prefix"
                  label="Prefix"
                  type="name"
                  required
                  variant="standard" 
                  value={nmObject.prefix ?? ''}
                  onChange={e => {handleUpdateValue('prefix', e.target.value)}}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                
                
              </Stack>
              <Stack spacing={2} direction="row" alignItems="center">
                
                <TextField
                  margin="dense"
                  id="namespace-desc"
                  label="Description"
                  type="name" 
                  multiline
                  variant="standard" 
                  value={nmObject.description ?? ''}
                  onChange={e => {handleUpdateValue('description', e.target.value)}}
                />
                <FormGroup>
                  <FormControlLabel
                      control={
                        <Switch checked={nmObject.active===true} onChange={(e) => {handleUpdateValue('active', e.target.checked)}} name="active" size="small"/>
                      }
                      label="Active"/>
                </FormGroup>
              </Stack>
              
              <Paper elevation={3} sx={{p:2, mt:2}}>
                <Box >
                  
                    {arrProps.map((item, index) => (
                      
                        <Stack key={'namespace_props' + index} direction="row" spacing={2}>
                          <Typography variant="subtitle1" >
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
                                {item.name}:
                                </Box>
                            </Typography>
                            <Typography variant="subtitle1" >
                              <Box 
                                  sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  p: 0,
                                  m: 0
                                  }}
                              >
                                  {item.value}
                              </Box>
                          </Typography>
                        </Stack>
                      
                    ))}

                  
                  
                </Box>
              </Paper>
            </TabPanel>
            
        </Box>
          
          
            
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='updButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleUpdate} disabled={!nmObject.name }>Update</Button>
          </Box>
          
        </DialogActions>
      </Dialog>
    

    
  );
}
