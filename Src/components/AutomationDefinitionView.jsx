import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import { useState } from "react";


// MUI components
import { 
    TextField,
    FormControl,
    FormGroup,
    FormControlLabel,
    InputLabel,
    CircularProgress,
    Select,
    MenuItem,
    Switch,
    IconButton,
    Input,
    InputAdornment,
    Stack,
    Box,
    Dialog,
    DialogContent,
    Typography
  } from '@mui/material';
import { blue } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CachedIcon from '@mui/icons-material/Cached';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { HelpCenterOutlined, RotateLeft } from '@mui/icons-material';

import NotStartedIcon from '@mui/icons-material/NotStarted';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from '@mui/icons-material/Flag';
import TextContentDisplay from './TextContentDisplay';


const servicesList = [
  { value: 'capture', label: 'Core Capture' },
  { value: 'riskguard', label: 'Risk Guard' },
  { value: 'css', label: 'Storage Service' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'output', label: 'Output' },
];

export default function AutomationDefinitionView(props) {
  const { runRequest, token, showBorder, inputAutomations, setAutomations, canAdd, canRemove, canEdit, canRetry, outRefreshIndex, inActiveId } = props;

  /**
   * Action definition will have:
   * runAction (one of: capture, riskguard, css, workflow) + future signature
   * runAction can be also output where we can define variables for output and map them from step variables...
   * if a file variable is set as output, it will be downloaded in the browser.
   * 
   * componentName (for workflow: the process model name)
   * 
   * variableMappings (array of variables to be mapped. For capture, riskguard, css, only one variable can be mapped - file, for workflow show the variables view with all the default variables)
   * the value to be mapped can be: (<index> is the step number)
   * ${-1.cms.currentId} - the primary file of the current object. CurrentId can be also a full id.
   * ${<index>.capture.fileId} - the fileId returned by the capture upload service
   * ${<index>.css.blobId} - the blob id returned by the css service
   * ${<index>.<all_services>.json} - the json response
   * ${<index>.workflow.variable} - the value of the specified variable from workflow service
   * ${token} - current token
   * ${userName} - current userName
   * ${currentId} - current id
   * free text (for workflow variables that will need free text)
   * 
   * 
   * For Capture, RG, CSS - if the input is another service's JSON, they will create a file. If the input is a variable from css or capture it will download the file and use that.
   * In order to use an ID from workflow, we need to know from which service is coming from so we will reference is like this:
   * ${<index>.workflow.variable.css} - for css blob_id
   * ${<index>.workflow.variable.capture} - for capture fileId 
   * 
   * execution - execution status: pending, started, success, error
   * result - to store the result of the call
   * fileName - to store the fileName at that step (input)
   */

  
    const [activeId, setActiveId] = useState('');
    const [modelRows, setModelRows] = useState([]);
    const [showHelper, setShowHelper] = useState(false);
    const [curVariable, setCurVariable] = useState({});
    const [displayJSON, setDisplayJSON] = useState({});

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

    const getComponentFromValue = (value, component) => {
      if (!value) return '';
      let trimVal = value.replace(/\${/g, '').replace(/}/g,'');
      switch (component) {
        case 'index':
          return trimVal.split('.')[0];
        case 'service':
          return trimVal.split('.').length>1 ?  trimVal.split('.')[1] : '';
        case 'variable':
          return trimVal.split('.').length>2 ?  trimVal.split('.')[2] : '';
        case 'extra':
          return trimVal.split('.').length>3 ?  trimVal.split('.')[3] : '';
        default:
          return '';
      }
    }

    const createValueFromComponents = (index, service, variable, extra, setToCurVar) => {
      let value = '${' + `${index}${(service)?`.${service}`:''}${(variable)?`.${variable}`:``}${(extra)?`.${extra}`:''}` + '}'
      if (setToCurVar) {
        let updatedValue = {};
        updatedValue = {value: value};
        setCurVariable(curVariable => ({
          ...curVariable,
          ...updatedValue
        }));
      }
      return value;

    }



    const handleVarChange = (index, inName, inValue) => {
        let data = [...inputAutomations];
        data[index][inName] = inValue;
        
        

        if (inName==='runAction') {
          //reset variables in component change
          if ((inValue==='workflow' || inValue==='output')) {
            data[index].variableMappings = [];
            
          } else {
            data[index].variableMappings = [{name: 'file', type: 'file', value: ''}];
          }
          
          data[index].outputVariables = [];
        }
        
        setAutomations(data);

        if (inName==='componentName') {
          //get the variables for the selected model
          getInitialVariables('drpModel' + index, inValue, index);
        }
    }

    const handleVarArrChange = (index, nodeName, varIndex, inName, inValue) => {
      let data = [...inputAutomations];
      
      data[index][nodeName][varIndex][inName] = inValue;
      
      
      setAutomations(data);
    }

    const addVarArr = (index, nodeName) => {
      let newVar = {};
      if (nodeName==='variableMappings') {
        newVar = {name: '', type: '', value: ''};
      } else {
        newVar = {name: ''};
      }
      
      let data = [...inputAutomations];

      
      data[index][nodeName].push(newVar);
      
      
      setAutomations(data);
    }

    const removeVarArr = (index, nodeName, varIndex) => {
      
      let data = [...inputAutomations];
      
      data[index][nodeName].splice(varIndex, 1);
      
      setAutomations(data);
    }


    const addAutomation = () => {
        let newfield = {runAction: '', componentName: '', variableMappings: [] , execution: 'pending', result: {}}
    
        setAutomations([...inputAutomations, newfield])
    }

    const removeAutomation = (index) => {
        let data = [...inputAutomations];
        data.splice(index, 1);
        setAutomations(data);
    }

    const handleUpValue = (index) => {
      if (index>0) {
        let arrProperty = [...inputAutomations];
        let value = arrProperty[index];
        arrProperty.splice(index-1,0, value)
        arrProperty.splice(index+1, 1);
        setAutomations(arrProperty);
  
      }
    }
  
    const handleDownValue = (index) => {
      let arrProperty = [...inputAutomations];
          
      if (index<arrProperty.length) {
        
        let value = arrProperty[index];
        arrProperty.splice(index, 1);
        arrProperty.splice(index+1,0, value);
        setAutomations(arrProperty);
      }
    }

    const getModels = (componentId) => {
      addActiveId(componentId);
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models?latestVersion=true&offset=0&count=100`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        //console.log(res);
        if (res.data && res.data._embedded && res.data._embedded.models) {
          setModelRows(res.data._embedded.models);
        }
        if (res.message) {
          
        }
        removeActiveId(componentId);
      });
    }

    const getInitialVariables = (componentId, modelId, automationIndex) => {
      addActiveId(componentId);
      //get the existing values
      let inArray = inputAutomations[automationIndex].variableMappings;

      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models/${modelId.split('|')[1]}?modelType=json`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        //console.log(res);
        if (res.data && res.data.modelContent) {
          let initModel = res.data.modelContent;
          if (JSON.stringify(initModel)!=='{}') {
              let outArray = [];
                
              if (initModel.properties.dataproperties && initModel.properties.dataproperties.items) {
                initModel.properties.dataproperties.items.forEach( item => {
                  let existingVal = inArray.find((obj) => {return obj.name===item.dataproperty_name});
                    outArray.push(
                    { 
                      name: item.dataproperty_name, 
                      type: (item.dataproperty_type=='int')?'integer':(item.dataproperty_type=='datetime')?'date':item.dataproperty_type, 
                      value: (existingVal?.value) ? existingVal.value  : item.dataproperty_value
                    });

                }) 
              }
              
              let data = [...inputAutomations];
              data[automationIndex].variableMappings = outArray;
              setAutomations(data);
          }
        }
        removeActiveId(componentId);
      });
    }

    const showDetails = (index) => {
      if (inputAutomations[index].result && (JSON.stringify(inputAutomations[index].result)!='{}')) {
        setDisplayJSON(inputAutomations[index].result);
      }
    }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log("useEffect() - occurs ONCE, AFTER the initial render (unless react.strict mode) - variables view");
        getModels('initialDiv');
    },[]
    );

  

  return (
    <React.Fragment>
      {modelRows.length===0 && <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==='initialDiv'}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin'}}>
            Getting models...
            </Box>}
        {inputAutomations?.map((input, index) => {
          return (
            <Stack key={'automation_view_' + index} direction={'row'} alignItems={'center'} justifyContent={'space-between'} sx={{p:0.5, borderBottom: 1, borderColor: 'darkblue'}}>
              <Stack direction={'column'} spacing={1}>

              
                <Stack direction="row" spacing={0.5} sx={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  {canRemove && canEdit && <IconButton size="small" variant="outlined" color="default" title="Move up" onClick={() => { handleUpValue(index) }}>
                      <KeyboardArrowUpIcon />
                  </IconButton>}
                  {canRemove && canEdit && <IconButton size="small" variant="outlined" color="default" title="Move down" onClick={() => { handleDownValue(index) }}>
                      <KeyboardArrowDownIcon />
                  </IconButton>}
                  {canRemove && canEdit && <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeAutomation(index) }}>
                        <RemoveIcon />
                    </IconButton>}

                    <Box sx={{ m: 1, position: 'relative' }}>
                      <IconButton size="small" variant="outlined" color={(input.execution==='pending' || input.execution==='started' || !input.execution) ? 'primary' : input.execution} title={`Execution: ${input.execution}`} onClick={() => { showDetails(index); }}>
                        {(input.execution==='pending') && <NotStartedIcon/>}
                        {(input.execution==='started') && <PlayArrowIcon/>}
                        {(input.execution==='success') && <FlagIcon/>}
                        {(input.execution==='error') && <FlagIcon/>}
                      </IconButton>
                      {(input.execution==='started') && (
                        <CircularProgress
                          size={24} 
                          thickness={6}
                          sx={{
                            color: blue[900],
                            position: 'absolute',
                            top: 5,
                            left: 5,
                            zIndex: 1,
                          }}
                        />
                      )}
                    </Box>

                    {canRetry && input.result && JSON.stringify(input.result)!=='{}' && 
                    <IconButton size="small" variant="outlined" color="warning" title="Refresh step" onClick={() => { outRefreshIndex(index) }}>
                      <RotateLeftIcon />
                    </IconButton>}

                    <Box sx={{
                    borderStyle: (inActiveId.split(',').find((obj) => {return obj==='service_run_' + index}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                      <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                        <InputLabel id="select-run">Run service</InputLabel>
                        <Select
                          labelId="select-run"
                          id="select-sel-run"
                          value={input.runAction}
                          label="Run service"
                          onChange={(e) => {handleVarChange(index, 'runAction', e.target.value)}} 
                          inputProps={{ readOnly: !canEdit }}
                        >
                          {servicesList.map((service) => {
                            return <MenuItem key={service.value} value={service.value}>{service.label}</MenuItem>;
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                  
                  {input.runAction==='workflow' && <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj==='drpModel' + index}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                    <FormControl sx={{ m: 1, minWidth: 250 }} size="small">
                      <InputLabel id="select-model">Model name</InputLabel>
                      <Select
                        labelId="select-model"
                        id="select-sel-model"
                        value={input.componentName}
                        label="Select model"
                        onChange={(e) => {handleVarChange(index, 'componentName', e.target.value)}} 
                        inputProps={{ readOnly: !canEdit }}
                      >
                        {modelRows.map((row) => (<MenuItem key={row.id} value={`${row.key}|${row.id}`}>{row.name + ' (v.' + row.version + ')'}</MenuItem>))}
                      </Select>
                    </FormControl>
                    
                  </Box>}
                  {input.runAction==='workflow' && <IconButton size="small" variant="outlined" color="success" title="Refresh" disabled={!canEdit} onClick={() => { getModels('drpModel' + index) }}>
                      <CachedIcon />
                  </IconButton>}
                </Stack>
                {input.runAction==='workflow' && input.componentName && !(modelRows.find((obj) => {return `${obj?.key}|${obj?.id}`===input?.componentName})) && 
                  <Stack direction={'row'} spacing={0.5} justifyContent={'flex-end'}>
                    <Box sx={{fontStyle: 'italic', fontSize: '10px', color: 'yellowgreen'}}>
                      
                        Selected model: {input.componentName.split('|')[0]}
                      
                    </Box>
                  </Stack>}
                
                {input.runAction==='workflow' && 
                  <Stack direction={'row'} spacing={0.5} justifyContent={'flex-end'} alignItems={'center'}>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={(input.componentAsync===true) ? true : false} onChange={e => { handleVarChange(index, 'componentAsync', e.target.checked)}} name="asyncExec" size="small"/>} label="Async" labelPlacement="end" />
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={(input.componentWait===true) ? true : false} onChange={e => { handleVarChange(index, 'componentWait', e.target.checked); handleVarChange(index, 'componentWaitTime', (e.target.checked ? 5 : 0))}} name="waitExec" size="small"/>} label="Wait for execution" labelPlacement="end" />
                    </FormGroup>
                    {(input.componentWait===true) && (input.timerRun<0 || input.timerRun===undefined ) && <TextField
                      margin="dense"
                      id="waitInterval" 
                      key="waitInterval"
                      variant="standard" 
                      type={'number'} 
                      inputProps={{readOnly: !canEdit}}
                      error={(input?.componentWaitTime<=0)} 
                      helperText={(input?.componentWaitTime<=0) ? 'Wait time needs to be positive otherwise it will be ignored' : ''}
                      sx={{width: 100}} 
                      label="Pause (seconds)" 
                      value={input?.componentWaitTime} 
                      onChange={e => {if (!isNaN(Number(e.target.value))) handleVarChange(index, 'componentWaitTime', e.target.value)}}
                      />}
                      {input.timerRun>=0 && 
                        <Box sx={{fontWeight: 'bold', color: 'green'}}>
                          <TextField
                            margin="dense"
                            id="runningInterval" 
                            key="runningInterval"
                            variant="standard" 
                            type={'number'} 
                            inputProps={{readOnly: true}}
                            sx={{width: 100}} 
                            label="Next run" 
                            value={(input?.componentWaitTime - input.timerRun)} 
                            onChange={e => {}}
                            />
                        </Box>}
                  </Stack>
                  }
                  
                
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {(input.runAction==='workflow' || input.runAction==='output') && canEdit && <Box>
                  <IconButton size="small" variant="outlined" color="success" title="Add new variable" onClick={() => { addVarArr(index, 'variableMappings') }}>
                      <AddCircleOutlineIcon />
                  </IconButton>
                </Box>}
                  
                <Stack direction="column" spacing={1}>
                  {input.variableMappings.map((variable, varIndex) => {
                      return (
                      <Stack key={'variable_' + varIndex} direction={'row'} spacing={0.5} sx={{alignItems: 'center',
                      justifyContent: 'flex-start', borderStyle: 'solid', 
                      borderColor: 'lightblue',
                      borderWidth: 'thin', borderRadius: '10px',
                      pl:1, pr:1}}>
                         <Box sx={{
                          borderStyle: (inActiveId.split(',').find((obj) => {return obj==='file_run_' + index + '_' + varIndex}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                          <TextField
                            margin="dense"
                            label="Variable" 
                            id="varname"
                            required
                            inputProps={{ readOnly: ((variable.type==='file' && input.runAction!=='output') || !canEdit) }}
                            variant="standard" 
                            value={variable.name} 
                            onChange={e => {handleVarArrChange(index, 'variableMappings', varIndex, 'name', e.target.value)}}
                          />
                        </Box>
                        <FormControl sx={{ m: 0, minWidth: 100 }} size="small">
                          <InputLabel id="select-type">Type</InputLabel>
                          <Select
                            labelId="select-type"
                            id="select-sel-type"
                            value={variable.type}
                            label="Type"
                            onChange={e => {handleVarArrChange(index, 'variableMappings', varIndex, 'type', e.target.value)}} 
                            inputProps={{ readOnly: ((variable.type==='file' && input.runAction!=='output')  || !canEdit) }}
                          >
                            <MenuItem key={'string'} value={'string'}>{'string'}</MenuItem>
                            <MenuItem key={'boolean'} value={'boolean'}>{'boolean'}</MenuItem>
                            <MenuItem key={'datetime'} value={'date'}>{'date'}</MenuItem>
                            <MenuItem key={'double'} value={'double'}>{'double'}</MenuItem>
                            <MenuItem key={'integer'} value={'integer'}>{'integer'}</MenuItem>
                            <MenuItem key={'long'} value={'long'}>{'long'}</MenuItem>
                            <MenuItem key={'json'} value={'json'}>{'json'}</MenuItem>
                            {(variable.type==='file' || input.runAction==='output') && <MenuItem key={'file'} value={'file'}>{'file'}</MenuItem>}
                          </Select>
                        </FormControl>
                        <Box sx={{
                          borderStyle: (inActiveId.split(',').find((obj) => {return obj==='value_run_' + index + '_' + varIndex}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                          <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                            <InputLabel htmlFor="outlined-adornment-value">Value</InputLabel>
                            <Input
                              id="outlined-adornment-value" 
                              type="text"
                              value={variable.value} 
                              onChange={e => {handleVarArrChange(index, 'variableMappings', varIndex, 'value', e.target.value)}}
                              inputProps={{ readOnly: !canEdit }}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle input helper" 
                                    disabled={!canEdit}
                                    onClick={() => {setCurVariable({index: index, varIndex: varIndex, value: variable.value, type: variable.type}); setShowHelper(true)}}
                                    onMouseDown={(event) => {event.preventDefault();}}
                                    edge="end"
                                  >
                                    <SettingsEthernetIcon/>
                                  </IconButton>
                                </InputAdornment>
                              }
                              label="Value"
                            />
                          </FormControl>
                        </Box>

                        <Box>
                          <IconButton disabled={((input.runAction!=='workflow' && input.runAction!=='output') || !canEdit)} size="small" variant="outlined" color="error" title="Remove variable" onClick={() => { removeVarArr(index, 'variableMappings', varIndex) }}>
                              <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                      
                      );
                    })}
                </Stack>
                
                 
              </Stack>
            </Stack>


              
          )
        })}
        {canAdd && canEdit && <Box>
          <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addAutomation() }}>
            <AddIcon />
        </IconButton>
          </Box>}
        <Dialog
          open={showHelper}
          onClose={() => {setCurVariable({}); setShowHelper(false)}}
          aria-labelledby="helper-dialog"
          aria-describedby="helper-dialog"
          maxWidth={'md'} 
          fullWidth
        >
          <DialogContent sx={{
              flexGrow: 1,
              maxHeight: '20vh',
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
              <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'} >
                <Typography>{`Current value: ${curVariable.value}`}</Typography>
                <IconButton size="small" variant="outlined" color="success" title="Add value" onClick={() => { handleVarArrChange(curVariable.index, 'variableMappings', curVariable.varIndex, 'value', curVariable.value); setShowHelper(false);}}>
                    <AddTaskIcon />
                </IconButton>
              </Stack>
              <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'} >
                <FormControl sx={{ m: 0, minWidth: 100 }} size="small">
                  <InputLabel id="select-index">Index</InputLabel>
                  <Select
                    labelId="select-index"
                    id="select-sel-index"
                    value={getComponentFromValue(curVariable.value, 'index')}
                    label="Type"
                    onChange={e => {createValueFromComponents(e.target.value, (isNaN(e.target.value)?'':(e.target.value==='-1'?'cms':inputAutomations[Number(e.target.value)].runAction)), '', '', true)}} 
                    inputProps={{ readOnly: false }}
                  >
                    <MenuItem key={'val_999'} value={'-1'}>{'Current session'}</MenuItem>
                    {inputAutomations.map((obj, index) => {
                      if (obj.runAction!=='output' && (index < curVariable.index)) {
                        return (<MenuItem key={'val_' + index} value={index}>{index}</MenuItem>)
                      }
                      })}
                    <MenuItem key={'val_1000'} value={'token'}>{'Current token'}</MenuItem>
                    <MenuItem key={'val_1001'} value={'tenantId'}>{'Current tenant id'}</MenuItem>
                    <MenuItem key={'val_1002'} value={'userName'}>{'Current user'}</MenuItem>
                    <MenuItem key={'val_1003'} value={'currentId'}>{'Current object id'}</MenuItem>
                    <MenuItem key={'val_1004'} value={'currentFileName'}>{'Current file name'}</MenuItem>
                  </Select>
                </FormControl>
                
                {!isNaN(getComponentFromValue(curVariable.value, 'index')) && getComponentFromValue(curVariable.value, 'index')!=='' && 
                <Box>
                  {getComponentFromValue(curVariable.value, 'service')}  
                </Box>}

                {/* {!isNaN(getComponentFromValue(curVariable.value, 'index')) && getComponentFromValue(curVariable.value, 'index')!=='' && 
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                  <InputLabel id="select-service">Service</InputLabel>
                  <Select
                    labelId="select-service"
                    id="select-sel-service"
                    value={getComponentFromValue(curVariable.value, 'service')}
                    label="Service"
                    onChange={(e) => {createValueFromComponents(getComponentFromValue(curVariable.value, 'index'), e.target.value, getComponentFromValue(curVariable.value, 'variable'), getComponentFromValue(curVariable.value, 'extra'), true)}} 
                  >
                    {servicesList.map((service) => {
                      return <MenuItem key={service.value} value={service.value}>{service.label}</MenuItem>;
                    })}
                  </Select>
                </FormControl>} */}
                {!isNaN(getComponentFromValue(curVariable.value, 'index')) && getComponentFromValue(curVariable.value, 'index')!=='' && 
                <Stack direction={'row'} spacing={1} alignItems={'center'} sx={{
                  borderStyle: 'solid', 
                  borderColor: 'lightblue',
                  borderWidth: 'thin', borderRadius: '10px',
                  pl:1, pr:1
                }}>
                  <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                    <InputLabel id="select-variable">Variable</InputLabel>
                    <Select
                      labelId="select-variable"
                      id="select-sel-variable"
                      value={getComponentFromValue(curVariable.value, 'variable')}
                      label="Variable"
                      onChange={(e) => {createValueFromComponents(getComponentFromValue(curVariable.value, 'index'), getComponentFromValue(curVariable.value, 'service'), e.target.value,  getComponentFromValue(curVariable.value, 'extra'), true)}} 
                    >
                      <MenuItem key={'variable_1'} value={'json'}>{'JSON result'}</MenuItem>
                      {getComponentFromValue(curVariable.value, 'service')==='cms' && <MenuItem key={'variable_2'} value={'currentId'}>{'Current object ID'}</MenuItem>}
                      {getComponentFromValue(curVariable.value, 'service')==='capture' && <MenuItem key={'variable_3'} value={'fileId'}>{'Resulting file ID'}</MenuItem>}
                      {getComponentFromValue(curVariable.value, 'service')==='css' && <MenuItem key={'variable_4'} value={'blobId'}>{'Resulting blob ID'}</MenuItem>}
                      {getComponentFromValue(curVariable.value, 'service')!=='workflow' && <MenuItem key={'variable_5'} value={'currentFileName'}>{'Input file name'}</MenuItem>}
                      
                    </Select>
                  </FormControl>
                  {(getComponentFromValue(curVariable.value, 'service')==='cms' || getComponentFromValue(curVariable.value, 'service')==='workflow') && 
                  <Box sx={{fontWeight: 'bold', color: 'primary', p:1}}>
                    OR
                  </Box>}
                  {(getComponentFromValue(curVariable.value, 'service')==='cms' || getComponentFromValue(curVariable.value, 'service')==='workflow') && 
                  <TextField
                    margin="dense"
                    label="Variable (freeform)" 
                    id="varname"
                    required
                    inputProps={{ readOnly: false }}
                    variant="standard" 
                    value={getComponentFromValue(curVariable.value, 'variable')} 
                    onChange={e => {createValueFromComponents(getComponentFromValue(curVariable.value, 'index'), getComponentFromValue(curVariable.value, 'service'), e.target.value,  getComponentFromValue(curVariable.value, 'extra'), true)}}
                    />}
                </Stack>
                }

                
                {!isNaN(getComponentFromValue(curVariable.value, 'index')) && (curVariable.type==='file' || curVariable.type==='json') && getComponentFromValue(curVariable.value, 'service')==='workflow' && 
                <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                  <InputLabel id="select-extra">Extra</InputLabel>
                  <Select
                    labelId="select-extra"
                    id="select-sel-extra"
                    value={getComponentFromValue(curVariable.value, 'extra')}
                    label="Extra"
                    onChange={(e) => {createValueFromComponents(getComponentFromValue(curVariable.value, 'index'), getComponentFromValue(curVariable.value, 'service'), getComponentFromValue(curVariable.value, 'variable'), e.target.value,  true)}} 
                  >
                    {curVariable.type==='file' && <MenuItem key={'extra_1'} value={'css'}>{'css'}</MenuItem>}
                    {curVariable.type==='file' && <MenuItem key={'extra_2'} value={'cms'}>{'cms'}</MenuItem>}
                    {curVariable.type==='file' && <MenuItem key={'extra_3'} value={'capture'}>{'capture'}</MenuItem>}
                    {curVariable.type==='file' && <MenuItem key={'extra_4'} value={'url'}>{'cps url'}</MenuItem>}
                    {curVariable.type==='file' && <MenuItem key={'extra_5'} value={'text'}>{'text contents'}</MenuItem>}
                    <MenuItem key={'extra_6'} value={'tiffDetails'}>{'tiff details from capture'}</MenuItem>
                  </Select>
                </FormControl>}
              </Stack>
                
          </DialogContent>
        </Dialog>
        <TextContentDisplay 
          jsonValue={displayJSON}
          setJsonValue={setDisplayJSON} 
          textValue={''} 
          setTextValue={()=>{}}
        />

    </React.Fragment>
  );
}
