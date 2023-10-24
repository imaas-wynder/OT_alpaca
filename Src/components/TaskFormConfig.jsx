import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Autocomplete,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  IconButton,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  TableContainer,
  Paper,
  Alert,
  Typography,
  Stack
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';

const conf_types = [
  {"value": "cms_file", "name": "File in CMS service"},
  {"value": "cms_folder", "name": "Folder in CMS service"},
  {"value": "cc_workspace", "name": "Workspace in Core Content"},
  {"value": "capture_file", "name": "File in Capture service"},
  {"value": "iframe", "name": "iFrame - id is URL"}
]

const conf_source = [
  {"value": "inline", "name": "The id is in the config"},
  {"value": "variable", "name": "The id is in a process variable"}
]

const conf_actions = [
  {"value": "buttons", "name": "All outcomes as buttons"},
  {"value": "selection", "name": "Selection box with outcomes"}
]



export default function TaskFormConfig(props) {
  const { runRequest, formOpen, onActionSuccess, token, showBorder, taskObj, taskConfigObj } = props;

  const [configObj, setConfigObj] = useState(taskConfigObj?.object_id ? taskConfigObj : {
    object_id: '',
    type: '',
    display: '',
    cc_usetoken: true,
    source: '',
    variables: [],
    actions: ''
  });
  const [activeId, setActiveId] = useState('');

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


  const handleClose = () => {
    onActionSuccess(false, false);
  };


  
  const handleAddVariable = (value) => {
    
    let updatedValue = {};
    let arrProperty = [...configObj.variables, value];
    updatedValue = {variables: arrProperty};
    
    setConfigObj(configObj => ({
      ...configObj,
      ...updatedValue
    }));
    
  }

  const handleRemoveVariable = (index) => {
    
    let arrProperty = [...configObj.variables];
    arrProperty.splice(index, 1);
    let updatedValue = {};
    updatedValue = {variables: arrProperty};
    setConfigObj(configObj => ({
      ...configObj,
      ...updatedValue
    }));
  }

  const handleUpVariable = (index) => {
    if (index>0) {
      let arrProperty = [...configObj.variables];
      let value = arrProperty[index];
      arrProperty.splice(index-1,0, value)
      arrProperty.splice(index+1, 1);

      let updatedValue = {};
      updatedValue = {variables: arrProperty};
      setConfigObj(configObj => ({
        ...configObj,
        ...updatedValue
      }));
    }
  }

  const handleDownVariable = (index) => {
    let arrProperty = [...configObj.variables];
        
    if (index<arrProperty.length) {
      
      let value = arrProperty[index];
      arrProperty.splice(index, 1);
      arrProperty.splice(index+1,0, value);

      let updatedValue = {};
      updatedValue = {variables: arrProperty};
      setConfigObj(configObj => ({
        ...configObj,
        ...updatedValue
      }));
    }
  }

  const handleChangeValue = (index, value) => {
    let arrProperty = [...configObj.variables];
    arrProperty.splice(index, 1, value);

    let updatedValue = {};
    updatedValue = {variables: arrProperty};
    setConfigObj(configObj => ({
      ...configObj,
      ...updatedValue
    }));

  }

  const handleChangeGeneral = (name, value) => {
    let updatedValue = {};

    updatedValue = {[name]: value}; 
    
    setConfigObj(configObj => ({
      ...configObj,
      ...updatedValue
    }));
  }

  const handleSaveValue = () => {
    addActiveId('butSave');
    let curVar = taskObj.variables.find((obj) => {return obj.name==='wf_task_config'});
    let reqBody = {name: 'wf_task_config', type: 'json', scope: 'local', value: configObj};
    let req = {};
    if (curVar && curVar.name) {
      req = { 
        method: 'put', 
        url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${taskObj.processInstanceId}/variables/wf_task_config`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
        data: reqBody
        };
    } else {
      req = { 
        method: 'post', 
        url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${taskObj.processInstanceId}/variables`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
        data: [reqBody]
        };
    }

    
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status===200 || res.status===201) {
        onActionSuccess(true, false);
      }
      removeActiveId('butSave');
    });
  }

  const getCCVals = () => {
    handleChangeGeneral('cc_url', process.env.REACT_APP_CC_URL ?? '');
    handleChangeGeneral('cc_subscription', process.env.REACT_APP_CC_SUBSCRIPTION ?? '');
  }

  const handlePopulate = (checkBox) => {
    if (checkBox===false) {
      handleChangeGeneral('cc_otdsurl', process.env.REACT_APP_CC_OTDS_URL ?? '');
      handleChangeGeneral('cc_tenantid', process.env.REACT_APP_CC_TENANT_ID ?? '');
      handleChangeGeneral('cc_clientid', process.env.REACT_APP_CC_CLIENT_ID ?? '');
      handleChangeGeneral('cc_clientsecret', process.env.REACT_APP_CC_CLIENT_SECRET ?? '');
      handleChangeGeneral('cc_username', process.env.REACT_APP_CC_USERNAME ?? '');
      handleChangeGeneral('cc_password', process.env.REACT_APP_CC_PASSWORD ?? '');
    }
  }



  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (formOpen) {
      //reset all variables
      setConfigObj(taskConfigObj?.object_id ? taskConfigObj : {
        object_id: '',
        type: '',
        display: '',
        source: '',
        variables: [],
        actions: ''
      })
    }
  }, [formOpen]);


  return (
    
      <Dialog open={formOpen} onClose={handleClose} maxWidth={'xl'} fullWidth>
        <DialogTitle>Task config - {taskObj?.name ?? 'loading...'}</DialogTitle>
        <DialogContent sx={{
          maxHeight: '80vh',
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
          <Stack direction={'row'} spacing={1}>
            <Stack direction={'column'} spacing={1} sx={{width: '30%'}}>
              <TextField
                margin="dense"
                id="object_id"
                label="Object ID"
                type="object_id"
                fullWidth
                variant="standard" 
                value={configObj.object_id}
                onChange={e => {handleChangeGeneral('object_id', e.target.value)}}
              />
              <Box >
                <FormControl sx={{ width: 1 }} size="small">
                  <InputLabel id="type-label">Type</InputLabel>
                    <Select
                    labelId="type-label"
                    label="Type"
                    id="confType"
                    value={configObj.type}
                    onChange={(event) => {handleChangeGeneral('type', event.target.value); if (event.target.value==='cc_workspace') getCCVals() ;}} 
                  >
                    {conf_types.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{`${item.name}`}</MenuItem>
                    ))}
                    
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl sx={{ width: 1 }} size="small">
                <InputLabel id="display-label">Display</InputLabel>
                  <Select
                    labelId="display-label"
                    label="Display"
                    id="display-simple-select"
                    value={configObj.display} 
                    onChange={(event) => {handleChangeGeneral('display', event.target.value); }}
                  >
                    <MenuItem value={''}>{'none'}</MenuItem>
                    {(configObj.type==='cms_file' || configObj.type==='cms_folder') && <MenuItem value={'properties'}>{'Object properties'}</MenuItem>}
                    {(configObj.type==='cms_file' || configObj.type==='cms_folder') && <MenuItem value={'view'}>{(configObj.type==='cms_file' ? 'Viewer' : 'Folder contents')}</MenuItem>}
                    {(configObj.type==='cc_workspace') && <MenuItem value={'iframe'}>{'iFrame'}</MenuItem>}
                    {(configObj.type==='cc_workspace') && <MenuItem value={'js'}>{'JavaScript'}</MenuItem>}
                  </Select>
                </FormControl>
              </Box>
              {configObj.type==='cc_workspace' && <Stack direction={'column'} spacing={1} pl={2}>
                <TextField
                  margin="dense"
                  id="cc_url"
                  label="Core Content URL"
                  type="cc_url"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_url ?? ''}
                  onChange={e => {handleChangeGeneral('cc_url', e.target.value)}}
                />
                <TextField
                  margin="dense"
                  id="cc_sub"
                  label="Subscription Name"
                  type="cc_sub"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_subscription ?? ''}
                  onChange={e => {handleChangeGeneral('cc_subscription', e.target.value)}}
                />
                {configObj.display==='js' && <FormControlLabel
                  control={
                    <Switch checked={configObj.cc_usetoken===true} onChange={(e) => { handleChangeGeneral ('cc_usetoken', e.target.checked); handlePopulate(e.target.checked); }} name="usetoken"/>
                  }
                  label="Use current app token"/>}
                {configObj.display==='js' && !configObj.cc_usetoken && 
                <TextField
                  margin="dense"
                  id="cc_otdsurl"
                  label="Core Content OTDS URL"
                  type="cc_otdsurl"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_otdsurl ?? ''}
                  onChange={e => {handleChangeGeneral('cc_otdsurl', e.target.value)}}
                />}
                {configObj.display==='js' && !configObj.cc_usetoken && 
                <TextField
                  margin="dense"
                  id="cc_tenantid"
                  label="Tenant ID"
                  type="cc_tenantid"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_tenantid ?? ''}
                  onChange={e => {handleChangeGeneral('cc_tenantid', e.target.value)}}
                />}
                {configObj.display==='js' && !configObj.cc_usetoken && 
                <TextField
                  margin="dense"
                  id="cc_clientid"
                  label="Client ID"
                  type="cc_clientid"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_clientid ?? ''}
                  onChange={e => {handleChangeGeneral('cc_clientid', e.target.value)}}
                />}
                {configObj.display==='js' && !configObj.cc_usetoken && 
                <TextField
                  margin="dense"
                  id="cc_clientsecret"
                  label="Client Secret"
                  type="password"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_clientsecret ?? ''}
                  onChange={e => {handleChangeGeneral('cc_clientsecret', e.target.value)}}
                />}
                {configObj.display==='js' && !configObj.cc_usetoken && 
                <TextField
                  margin="dense"
                  id="cc_username"
                  label="User name"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_username ?? ''}
                  onChange={e => {handleChangeGeneral('cc_username', e.target.value)}}
                />}
                {configObj.display==='js' && !configObj.cc_usetoken && 
                <TextField
                  margin="dense"
                  id="cc_password"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="standard" 
                  value={configObj.cc_password ?? ''}
                  onChange={e => {handleChangeGeneral('cc_password', e.target.value)}}
                />}

              </Stack>}
              <Box >
                <FormControl sx={{ width: 1 }} size="small">
                  <InputLabel id="source-label">Source</InputLabel>
                    <Select
                    labelId="source-label"
                    label="Source"
                    id="source-select"
                    value={configObj.source}
                    onChange={(event) => {handleChangeGeneral('source', event.target.value)}} 
                  >
                    {conf_source.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{`${item.name}`}</MenuItem>
                    ))}
                    
                  </Select>
                </FormControl>
              </Box>
              <Box >
                <FormControl sx={{ width: 1 }} size="small">
                  <InputLabel id="outcome-label">Outcomes</InputLabel>
                    <Select
                    labelId="outcome-label"
                    label="Possible outcomes"
                    id="outcome-select"
                    value={configObj.actions}
                    onChange={(event) => {handleChangeGeneral('actions', event.target.value)}} 
                  >
                    {conf_actions.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{`${item.name}`}</MenuItem>
                    ))}
                    
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <TableContainer component={Paper}>
                <Table size="small" aria-label="variables table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>Name</TableCell>
                      <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>Editable</TableCell>
                      <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>Display Name</TableCell>
                      <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                        <IconButton size="small" variant="outlined" color="success" title="Add new variable" 
                          onClick={() => { handleAddVariable({name: '', editable: false, display_name: ''}) }}>
                          <AddBoxIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configObj.variables.map((row, index) => (
                      <TableRow key={'variable_row-' + index} hover selected={false}>
                        <TableCell align="left" onClick={() => {}} sx={{minWidth: 250}}>
                          <Autocomplete
                            id="var_name"
                            freeSolo
                            value={row.name}
                            inputValue={row.name}
                            onChange={(e, newValue) => {handleChangeValue (index, {name: newValue ?? '', editable: row.editable, display_name: row.display_name} )}}
                            onInputChange={(e, newValue) => {handleChangeValue (index, {name: newValue ?? '', editable: row.editable, display_name: row.display_name} )}}
                            options={taskObj?.variables?.length>0 ? taskObj?.variables?.map((option) => option.name) : ['(none)']}
                            renderInput={(params) => <TextField {...params} label="Name" variant="standard" fullWidth/>}
                          />
                          
                        </TableCell>
                        <TableCell align="left" onClick={() => {}}>
                          <FormControlLabel
                            control={
                              <Switch checked={row.editable===true} onChange={(e) => { handleChangeValue (index, {name: row.name, editable: e.target.checked, display_name: row.display_name} ) }} name="editable"/>
                            }
                            label="Editable"/>
                        </TableCell>

                        <TableCell align="left" onClick={() => {}}>
                          <TextField
                            margin="dense"
                            id="var_disp"
                            label="Display"
                            type="var_disp"
                            fullWidth
                            variant="standard" 
                            value={row.display_name}
                            onChange={e => {handleChangeValue (index, {name: row.name, editable: row.editable, display_name: e.target.value} )}}
                          />
                        </TableCell>
                        <TableCell align="left" onClick={() => {}}>
                          <Stack direction="row" spacing={0}>
                            <Box>
                                <IconButton size="small" variant="outlined" color="default" title="Move up" onClick={() => { handleUpVariable(index) }}>
                                    <KeyboardArrowUpIcon />
                                </IconButton>
                            </Box>
                            <Box>
                                <IconButton size="small" variant="outlined" color="default" title="Move down" onClick={() => { handleDownVariable(index) }}>
                                    <KeyboardArrowDownIcon />
                                </IconButton>
                            </Box>
                            <Box>
                              <IconButton size="small" variant="outlined" color="error" title="Delete" onClick={() => { handleRemoveVariable(index) }}>
                                <DeleteForeverIcon />
                              </IconButton>
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='butSave'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
            <Button onClick={handleSaveValue}>Save</Button>
          </Box>
          <Button onClick={handleClose}>Cancel</Button>
          
          
        </DialogActions>
      </Dialog>
    

    
  );
}
