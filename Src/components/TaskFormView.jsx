import * as React from 'react';
import dayjs from 'dayjs';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Avatar,
  Box,
  TextField,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  DialogTitle,
  FormControl,
  InputLabel,
  CircularProgress,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Snackbar,
  IconButton,
  Alert,
  Typography,
  Stack
} from '@mui/material';

import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UndoIcon from '@mui/icons-material/Undo';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

import SaveIcon from '@mui/icons-material/Save';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { IndeterminateCheckBoxRounded } from '@mui/icons-material';
import ObjectProperties from './ObjectProperties';
import DocumentViewHTML from './DocumentViewHTML';
import DocumentView from './DocumentView';
import Scenario1 from './Scenario1';
import CoreContentView from './CoreContentView';

const DIALOG_HEIGHT = '80vh';
const DIALOG_WIDTH = '90vw';
const MAIN_WIDTH = '68vw';


const getDateValue = (dt) => {
  return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
}


const getLoggedInUserIcon = (name) => {
  const words = name.split(" ");
  let userIcon = "";
  userIcon += words[0].charAt(0);
  if (words.length > 1) userIcon += words[words.length - 1].charAt(0);
  else userIcon += words[0].charAt(1);
  return userIcon.toUpperCase();
};

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: getLoggedInUserIcon(name),
  };
}  

function CommentBox(props) {
  const { author, time, message, runRequest, token, userName, id, instanceId, doneDeleting, ...other } = props;

  const [display, setDisplay] = useState("notdisplayed");

  const handleDeleteComment = () => {
   
    let req = { 
      method: 'delete', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${instanceId}/comments/${id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status===200 || res.status===204) {
        doneDeleting(true);
      }
      
    });
  }

  //for icons on row
  
  const showButton = (e) => {
    e.preventDefault();
    setDisplay("displayed");
  };

  const hideButton = (e) => {
    e.preventDefault();
    setDisplay("notdisplayed");
  };


  return (
    <Box sx={{
      borderStyle: 'solid',
      borderColor: '#F3F2F2',
      borderWidth: 'thin',
      borderRadius: 1,
      backgroundColor: '#F9F9F9'
    }} 
    m={1}
    p={1}     
    onMouseEnter={(e) => showButton(e)}
    onMouseLeave={(e) => hideButton(e)} 
    {...other}
    >
      <Stack direction={'column'}>
        <Stack direction={'row'} justifyContent={'space-between'} alignContent={'center'}>
          <Stack direction={'row'} spacing={1}>
            <Avatar {...stringAvatar(author)} />
            <Stack direction={'column'}>
              <Typography variant='caption' sx={{fontWeight: 'bold'}}>{author}</Typography>
              <Typography variant='caption' sx={{fontStyle: 'italic'}}>{time}</Typography>
            </Stack>
          </Stack>
          
          <Box className={display}>
            {(userName===author) && <IconButton size="small" variant="outlined" color="error" title="Delete" onClick={() => { handleDeleteComment();  }}>
              <DeleteForeverIcon />
            </IconButton>}
          </Box>
        </Stack>
        <Box mt={1}>
          <Typography variant='body2' sx={{whiteSpace: 'pre-line', wordWrap: "break-word" }}>{message}</Typography>
        </Box>
        
      </Stack>
    </Box>
  );
}

function VariableBox(props) {
  const { name, editable, display_name, runRequest, token, taskObj, saveAll, doneSaving } = props;

  const [curVarValue, setCurVarValue] = useState(taskObj.variables.find((obj) => {return obj.name===name})?.value);
  const [curVarType, setCurVartype] = useState(taskObj.variables.find((obj) => {return obj.name===name})?.type);
  const [valid, setValid] = useState(true);


  const [isDirty, setIsDirty] = useState(false);

  const handleSaveValue = () => {
    let curVar = taskObj.variables.find((obj) => {return obj.name===name});
    let putBody = {
      name:curVar.name, type:curVar.type, scope:'local', value:curVarValue
    };
    if (curVarType==='date' && dayjs(curVarValue).isValid()) {
      putBody = {
        name:curVar.name, type:curVar.type, scope:'local', value: dayjs(curVarValue).toISOString() 
      }
    }
    if (curVarType==='integer' || curVarType==='double' || curVarType==='long') {
      putBody = {
        name:curVar.name, type:curVar.type, scope:'local', value: Number(curVarValue) 
      }
    }
    
    let req = { 
      method: 'put', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${taskObj.processInstanceId}/variables/${name}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
      data: putBody
      };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status===200 || res.status===201) {
        setIsDirty(false);
        doneSaving(true);
      }
    });
  }

  const handleChange = (value) => {
    let resultJson = true;
    let valOutput = null;
      
    switch(curVarType) {
      case 'json':
        
        if (value.constructor === Object) {
          valOutput = value;
          resultJson = true;
        } else {
          try { 
            valOutput = JSON.parse(value);
            resultJson = true;
          } catch (error) {
            valOutput = value;
            resultJson = false;
          }
        }
        break;
      default:
        valOutput = value;
        resultJson = true;
        break;
      }
    setCurVarValue(valOutput);
    setValid(resultJson);
    setIsDirty(true);
  }

  const handleUndo = () => {
    
    setCurVarValue(taskObj.variables.find((obj) => {return obj.name===name})?.value);
    setIsDirty(false);
  }

  useEffect(
    () => {
        if (saveAll===true) {
          if (isDirty) {
            handleSaveValue();
          } else {
            doneSaving(false);
          }
          
        }
        
    },[saveAll]
    );


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box key={'variable_' + name} 
      sx={{
        borderStyle: 'solid',
        borderColor: '#F3F2F2',
        borderWidth: 'thin',
        borderRadius: 1,
        backgroundColor: (isDirty ?'#F9D9D9':'#F9F9F9')
      }} 
      m={1}
      p={1}      
      >
        <Stack direction={'column'}>
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant='caption' sx={{fontWeight: 'bold', color: (isDirty ? 'red' : 'inherit')}}>{display_name}</Typography>
            <Stack direction={'row'}>
              {isDirty===true && <IconButton size="small" variant="outlined" color="primary" title="Undo"  
                onClick={() => { handleUndo() }}>
                  <UndoIcon />
              </IconButton>}
              {editable===true && <IconButton size="small" variant="outlined" color="primary" title="Save" 
                disabled={!isDirty} 
                onClick={() => { handleSaveValue() }}>
                  <SaveIcon />
              </IconButton>}
            </Stack>
            
          </Stack>
          {(!curVarType || curVarType==='') && <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word',
                color: 'red'
                }}>
              {`Could not find variable ${name} in the process variables`}
            </Typography>}
          
          {curVarType && <Box mt={1} sx={{
              maxHeight: 250,
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
            {(editable!==true) && 
            <Typography component={'span'} variant='body2' sx={{whiteSpace: 'pre-line', wordWrap: "break-word", fontStyle: (curVarValue==='' ? 'italic' : 'inherit') }}>
              {curVarType==='json' ? 
                <div><pre>{JSON.stringify(curVarValue, null, 2)}</pre></div> : 
                (curVarType==='date' ? getDateValue(curVarValue) : (curVarValue==='' ? '(no value)' : curVarValue) )
                }
            </Typography>}
            {(editable===true) && <React.Fragment>
                {(curVarType==='string' || curVarType==='json') && 
                <TextField
                  margin="dense"
                  label="Value"
                  id="value"
                  required 
                  fullWidth
                  multiline={(curVarType==='json')} 
                  error={(!valid)} 
                  helperText={(!valid) ? 'Not a valid JSON' : ''}
                  variant="standard" 
                  value={(curVarType==='json' && valid===true) ? JSON.stringify(curVarValue, null, 2) : curVarValue}
                  onChange={e => {handleChange(e.target.value)}} 
                  
                  />}
                {(curVarType==='integer' || curVarType==='long' || curVarType==='double') && 
                <TextField
                  margin="dense"
                  label="Value"
                  id="value"
                  required
                  fullWidth
                  type='number'
                  variant="standard" 
                  value={curVarValue}
                  onChange={e => {handleChange(e.target.value)}}
                  />}
                {(curVarType==='boolean') && <Switch checked={curVarValue} onChange={e => {handleChange(e.target.checked)}} name="booleanValue" />}
                {(curVarType==='date') && <DesktopDateTimePicker
                  
                  inputFormat="MM/DD/YYYY hh:mm:ss"
                  value={curVarValue ? dayjs(curVarValue) : null}
                  onChange={e => {handleChange(e)}}
                  renderInput={(params) => <TextField {...params} />}
                />}
            </React.Fragment>
              
            }
            
          </Box>}
          
        </Stack>
      </Box>
    </LocalizationProvider>
    
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`} 
      {...other}
    >
      {value === index && (
        <Box sx={{
          
          maxHeight: `calc(${DIALOG_HEIGHT} - 80px)`,
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


export default function TaskFormView(props) {
  const { runRequest, formOpen, onActionSuccess, token, showBorder, taskConfigObj, taskObj, userName, email } = props; 

  const [message, setMessage] = useState('');
  const [curExecution, setCurExecution] = useState({});
  const [actions, setActions] = useState([]);
  const [selAction, setSelAction] = useState('');
  const [getActions, setGetActions] = useState(false);

  const [mainObject, setMainObject] = useState({});
  const [propsSave, setPropsSave] = useState(false);

  const [varsChanged, setVarsChanged] = useState(false);

  const [comments, setComments] = useState([]);
  const [curComment, setCurComment] = useState('');
  const [getComments, setGetComments] = useState(false);

  const [initLoading, setInitLoading] = useState(true);

  const [curSaveIndex, setCurSaveIndex] = useState(-1);
  
  const [value, setValue] = React.useState(0); //tab panel

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
    document.title = 'Library management';
    onActionSuccess(varsChanged, false);
  };

  const handleExecutionId = (componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/executions?processInstanceId=${taskObj.processInstanceId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {

        res.data._embedded.executions.forEach( item => {
          if (item.parentId) {
            setCurExecution(item);
          }
        })
      } 
      removeActiveId(componentId);
    });
  };

  const getActivityDetails = (activityId, componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow-history/v1/historic-process-instances/${taskObj.processInstanceId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.processDefinitionId) {
        req = { 
          method: 'get', 
          url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models?processDefinitionId=${res.data.processDefinitionId}`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
        };
        runRequest(req, (result) => {
      
          if (result.data && result.data._embedded && result.data._embedded.models) {

              let modelId = result.data._embedded.models[0].id;
              if (!modelId) {
                  setMessage('Model ID could not be found.');
                  setGetActions(true);
                  removeActiveId(componentId);
                  return;
                }
              //get the model
              let req2 = { 
                method: 'get', 
                url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/runtime/models/${modelId}?modelType=json`, 
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*'} 
              };
              runRequest(req2, (res2) => {
                if (res2.data) {
                  let modelDef = res2.data.modelContent;
                  if (modelDef.childShapes) {
                    for (let i=0; i<modelDef.childShapes.length; i++) {
                      if (modelDef.childShapes[i].resourceId===activityId) {
                        //this is the one...
                        if (modelDef.childShapes[i].properties?.possibleoutcomes && modelDef.childShapes[i].properties?.possibleoutcomes!=='') {
                          setActions(modelDef.childShapes[i].properties?.possibleoutcomes.split(','));
                        } else {
                          //no outcomes
                          setActions(['COMPLETE']);
                        }
                      }
                    }
                  }
                }
                
              });

          }
        });


        
      } 
      setGetActions(true);
      removeActiveId(componentId);
    });
  };

  const handleActOnTask = ( inOutcome, componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/tasks/${taskObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
      data: {
        action: 'complete',
        outcome: inOutcome ? inOutcome : "Approved"
      }
    };
    
      runRequest(req, (res) => {
        if (res.status===200 || res.status===201 || res.status===204) {
          document.title = 'Library management';
          onActionSuccess(true, false);
        }
        removeActiveId(componentId);
      }, `Completed successfully the task with outcome ${inOutcome}`, []);
    
  }

  const handleResolve = ( componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/tasks/${taskObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
      data: {
        action: 'resolve',
        assignee: email
      }
    };
    
      runRequest(req, (res) => {
        if (res.status===200 || res.status===201 || res.status===204) {
          document.title = 'Library management';
          onActionSuccess(true, false);
        }
        removeActiveId(componentId);
      }, `Resolved successfully the task`, []);
    
  }

  const getCommentList = (componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${taskObj.processInstanceId}/comments?offset=0&count=1000`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      if (res.data && res.data._embedded && res.data._embedded.comments) {
        setComments(res.data._embedded.comments);
      } else {
        setComments([]);
      }
      setGetComments(true);
      removeActiveId(componentId);
    });
  }

  const handleAddComment = (componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('proc-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances/${taskObj.processInstanceId}/comments`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*','Content-Type': 'application/json' },
      data: {includeUserIds: false, message: curComment}
      };
    runRequest(req, (res) => {
      
      setCurComment('');
      setGetActions(true);
      removeActiveId(componentId);
    });
  }

  const handleVarSaveSuccess = (res, index) => {
    if (curSaveIndex>-1) {
      setCurSaveIndex((index < (taskConfigObj.variables.length-1)) ? (index + 1) : -1);
      
    }
    if (!varsChanged && res) setVarsChanged(true);
  
  }

  const loadMainId = (componentId) => {
    
    let realId = taskConfigObj.object_id;
    if (!taskConfigObj.object_id) {
      setMessage('object_id not found in the configuration object');
      setInitLoading(false);
      return;
    }


    if (taskConfigObj.source==='variable') {
      realId = taskObj.variables.find((obj) => {return obj.name===taskConfigObj.object_id})?.value;
    }

    if (!realId) {
      setMessage(`Variable ${taskConfigObj.object_id} not found in the process instance`);
      setInitLoading(false);
      return;
    }


    
    let req = {};
    switch (taskConfigObj.type) {
      case 'cms_file':
        if (taskConfigObj.display!=='properties' && taskConfigObj.display!=='view') {
          setMessage(`display ${taskConfigObj.display} not accepted for type ${taskConfigObj.type}. See README.md for available combinations.`);
          setInitLoading(false);
          return;
        }
        req = { 
          method: 'get', 
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${realId}`, 
          headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
        };
        break;
      case 'cms_folder':
        if (taskConfigObj.display!=='properties' && taskConfigObj.display!=='view') {
          setMessage(`display ${taskConfigObj.display} not accepted for type ${taskConfigObj.type}. See README.md for available combinations.`);
          setInitLoading(false);
          return;
        }
        req = { 
          method: 'get', 
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/folder/cms_folder/${realId}`, 
          headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
        };
        break;
      case 'cc_workspace':
        if (taskConfigObj.display==='js' || taskConfigObj.display==='iframe') {
          setMainObject({id: realId});
        } else {
          setMessage(`display ${taskConfigObj.display} not accepted for type ${taskConfigObj.type}. See README.md for available combinations.`);
          setInitLoading(false);
        }
        
        return;
      case 'capture_file':
        //get what is needed from capture...
        setMainObject({id: realId}); //remove this and point it to the capture service
        return;
        
      case 'iframe':
        setMainObject({id: realId});
        return;
    
      default:
        setMessage(`Type ${taskConfigObj.type} not recognized. See README.md for available types.`);
        setInitLoading(false);
        return;
    }
    
    addActiveId(componentId);
    runRequest(req, (res) => {
      if (res.status===200 || res.status===201) {
        setMainObject(res.data);
      } else {
        setMessage(`${taskConfigObj.type} with id ${realId} was not found`)
      }
      removeActiveId(componentId);
    });
  }



  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (true) {
      //reset all variables
      setMessage('');
      setCurExecution({});
      setActions([]);
      setComments([]);
      setCurComment('');
      setSelAction('');
      setValue(0);
      setInitLoading(true);
      setCurSaveIndex(-1);
      setVarsChanged(false);

      setGetActions(false);
      setGetComments(false);
      setMainObject({});
      setPropsSave(false);
      handleExecutionId('butActions');

    }
  }, [formOpen]);

  useEffect(() => {
    if (curExecution.activityId) {
      
      setMessage('');
      setCurExecution({});
      getActivityDetails(curExecution.activityId, 'butActions');
    }
  }, [curExecution]);

  useEffect(() => {
    if (getActions) {
      getCommentList('comment_list');
      setGetActions(false);
    }
  }, [getActions]);

  useEffect(() => {
    if (getComments) {
      loadMainId('mainDiv');
      setGetComments(false);
    }
  }, [getComments]);

  useEffect(() => {
    if (mainObject.id) {
      setInitLoading(false);
      
    }
  }, [mainObject]);




  return (
    
      <Dialog open={formOpen} onClose={handleClose} maxWidth={DIALOG_WIDTH} fullWidth>
        <DialogTitle>
          
          <Box>
            <div className="app-general-dialog">
                <IconButton size="small" variant="outlined" color="primary" title="Configuration" 
                    onClick={() => { onActionSuccess(false, true); document.title = 'Library management'; }}
                    className="title-icon">
                    <SettingsSuggestIcon />
                </IconButton>
                
            </div>
            <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj==='mainDiv'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
              <Typography>Task form - {taskObj?.name ?? 'loading...'}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{
          height: DIALOG_HEIGHT,
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
          {message && <Typography 
            variant="button" 
            display="block" 
            gutterBottom 
            sx={{
              wordWrap: 'break-word',
              color: 'red'
              }}>
            {message}
          </Typography>}
          {initLoading && 
          <React.Fragment>
            <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word'
                }}>
              {'Loading...'}
            </Typography>
            <Box sx={{ display: 'flex', width: '100%', height: '100%', alignContent: 'center', alignItems: 'center', justifyContent: 'center', justifyItems: 'center' }}>
              <CircularProgress />
            </Box>
          </React.Fragment>
          }
          {!initLoading && !message && <Stack direction={'row'} spacing={2} >
              <Box sx={{
                minWidth: MAIN_WIDTH,
                display: 'flex',
                flexDirection: 'column'
              }}>
                
                {(taskConfigObj.type==='cms_file' || taskConfigObj.type==='cms_folder') && taskConfigObj.display==='properties' && 
                  <ObjectProperties
                    runRequest = {runRequest} 
                    propsOpen = {true} 
                    onClose = {() => {setPropsSave(false)}} 
                    token = {token} 
                    inObj = {mainObject} 
                    showBorder = {showBorder} 
                    clickedFolder = {() => {}} 
                    navigateToObject = {() => {}} 
                    propsSave = {propsSave} 
                    canUpdate = {() => {}} 
                    mWidth = {'calc(100% - 151px)'}
                />
                }
                {(taskConfigObj.type==='cms_file') && taskConfigObj.display==='view' && 
                  <React.Fragment>
                    {(mainObject.mime_type=='text/html' || mainObject.mime_type=='text/plain' || mainObject.mime_type==='application/json') &&  
                      <Box sx={{
                        height: `calc(${DIALOG_HEIGHT} - 50px)`,
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
                        <DocumentViewHTML runRequest = {runRequest} docObject={mainObject}  closeAction={() => {}} token = {token} showBorder={showBorder}/>
                      </Box>
                      }
                    {(mainObject.mime_type!='text/html' && mainObject.mime_type!='text/plain' && mainObject.mime_type!='application/json') && 
                      <DocumentView runRequest = {runRequest} docObject={mainObject} inFull={false} inRel={true}  closeAction={() => {}} token = {token} userName = {userName} showBorder={showBorder}/>}
                  </React.Fragment>
                }
                {(taskConfigObj.type==='cms_folder') && taskConfigObj.display==='view' && 
                  <Scenario1 
                    runRequest={runRequest} 
                    token={token} 
                    showBorder={showBorder} 
                    selectObject={() => {}} 
                    isSelect={false} 
                    inCategory={'file'} 
                    currentFolder={()=>{}}
                    inFolder={mainObject?.id ?? '' } 
                    limitUp={true}
                    urlLoaded = {true} 
                    setUrlLoaded = {()=>{}}/>
                }
                {(taskConfigObj.type==='cc_workspace') && taskConfigObj.display==='js' && 
                  <React.Fragment>
                    <Typography 
                      variant="button" 
                      display="block" 
                      gutterBottom 
                      sx={{
                        wordWrap: 'break-word',
                        color: 'darkblue',
                        fontStyle: 'italic'
                        }}>
                      {`Load Core Content workspace (js) with id: ${mainObject.id}`}
                    </Typography> 
                    <CoreContentView 
                      nodeId={mainObject.id}
                      ccAuth={{
                        otds_url: taskConfigObj.cc_otdsurl,
                        tenant_id: taskConfigObj.cc_tenantid,
                        client_id: taskConfigObj.cc_clientid,
                        client_secret: taskConfigObj.cc_clientsecret,
                        username: taskConfigObj.cc_username,
                        password: taskConfigObj.cc_password
                      }}
                      ccToken={taskConfigObj.cc_usetoken===true ? token : ""}
                      ccURL={taskConfigObj.cc_url}
                      subscriptionName={taskConfigObj.cc_subscription}
                      ccLocale="en" 
                      runRequest={runRequest}
                    />
                  </React.Fragment>
                  
                }
                {(taskConfigObj.type==='cc_workspace') && taskConfigObj.display==='iframe' && 
                  <React.Fragment>
                    <Typography 
                      variant="button" 
                      display="block" 
                      gutterBottom 
                      sx={{
                        wordWrap: 'break-word',
                        color: 'darkblue',
                        fontStyle: 'italic'
                        }}>
                      {`Load Core Content workspace (iFrame) with id: ${mainObject.id}`}
                    </Typography> 
                    <Box sx={{width: '100%', height: `calc(${DIALOG_HEIGHT} - 50px)`}}>
                      <iframe src={`${taskConfigObj.cc_url}/subscriptions/${taskConfigObj.cc_subscription}/workspaces?nodeid=${mainObject.id}&breadcrumb=false&favorites=false&search=true&backButton=false`} 
                        width="100%" 
                        height="100%" 
                        style={{
                          backgroundColor: "transparent", 
                          border: "0px none transparent",
                          padding: "0px"}}
                        >
                      </iframe>
                    </Box>
                  </React.Fragment>
                  
                }
                {(taskConfigObj.type==='capture_file') && 
                  <Typography 
                    variant="button" 
                    display="block" 
                    gutterBottom 
                    sx={{
                      wordWrap: 'break-word',
                      color: 'red'
                      }}>
                    {`Load Capture file with id: ${mainObject.id}`}
                  </Typography> 
                }
                {(taskConfigObj.type==='iframe') && 
                  <React.Fragment>
                    {/* <Typography 
                      variant="button" 
                      display="block" 
                      gutterBottom 
                      sx={{
                        wordWrap: 'break-word',
                        color: 'red'
                        }}>
                      {`Load iFrame with url: ${mainObject.id}`}
                    </Typography>  */}
                    <Box sx={{width: '100%', height: `calc(${DIALOG_HEIGHT} - 50px)`}}>
                      {/* Example URL for cc: https://corecontent.ot2.opentext.com/subscriptions/contmgmt-centralus/workspaces?nodeid=c1f6abb6-3503-4c35-ab47-ccbb2a017a3b&breadcrumb=true&favorites=false&search=true&backButton=false*/}
                      <iframe src={mainObject.id} 
                        width="100%" 
                        height="100%" 
                        style={{
                          backgroundColor: "transparent", 
                          border: "0px none transparent",
                          padding: "0px"}}
                        >
                      </iframe>
                    </Box>
                    
                  </React.Fragment>
                  
                }
              </Box>
              
            <Box sx={{minWidth: `calc(100% - ${MAIN_WIDTH})`, maxWidth: `calc(100% - ${MAIN_WIDTH})`}}>
              <Box
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tabs
                  orientation="horizontal"
                  variant="scrollable"
                  value={value}
                  onChange={handleChange}
                  aria-label="right tabs"
                  
                >
                  
                  <Tab label="Comments" {...a11yProps(0)}/>
                  <Tab label="Variables" {...a11yProps(1)} />
                </Tabs>
              </Box>
                <TabPanel value={value} index={0}>
                  <Stack direction={'column'}>
                    <Box sx={{
                      m: 1,
                      borderStyle: (activeId.split(',').find((obj) => {return obj==='but_comment'}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin'
                    }}>
                      <TextField
                        id="add-comment"
                        label="New note"
                        multiline
                        fullWidth
                        rows={4}
                        value={curComment} 
                        onChange={(event) => {setCurComment(event.target.value)}}
                        variant="filled" 
                        InputProps={{
                          endAdornment: 
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="save"
                                onClick={() => handleAddComment('but_comment')}
                                onMouseDown={(event) => event.preventDefault()} 
                                disabled={!curComment}
                              >
                                <SaveIcon/>
                              </IconButton>
                            </InputAdornment>,
                        }}
                      />
                    </Box>
                    
                    
                    {comments.map((comment, index) => (
                      <CommentBox 
                        key={'comment_box_' + index}
                        author={comment.author} 
                        time={getDateValue(comment.time)} 
                        message={comment.message}
                        id={comment.id}
                        runRequest={runRequest}
                        token={token}
                        userName={userName}
                        instanceId={taskObj.processInstanceId}
                        doneDeleting={(res) => {setGetActions(true);}}
                      />
                      )
                    )}
                  </Stack>
                  
                </TabPanel>
                <TabPanel value={value} index={1}>
                  {taskConfigObj.variables && taskConfigObj.variables.length>0 && 
                    taskConfigObj.variables.map((variable, index) => (
                      <VariableBox 
                        key={'var_box_' + index}
                        name={variable.name}
                        editable={variable.editable}
                        display_name={variable.display_name==='' ? variable.name : variable.display_name}
                        runRequest={runRequest}
                        token={token}
                        taskObj={taskObj} 
                        saveAll={(curSaveIndex===index)} 
                        doneSaving={(res) => handleVarSaveSuccess(res, index)}
                      />
                    )
                  )
                  }
                  
                </TabPanel>
                
              
            </Box>  
          </Stack>}
        </DialogContent>
        <DialogActions>
          {((taskObj.delegationState!=='pending') && taskConfigObj && taskConfigObj.actions==='selection') &&  
          <React.Fragment>
            <FormControl sx={{ m: 1, minWidth: 460 }} size="small">
              <InputLabel id="outcome-select-label">Select outcome</InputLabel>
              <Select
                labelId="outcome-select-label"
                id="outcome-simple-select"
                value={selAction}
                label="Select outcome"
                onChange={(event) => {setSelAction(event.target.value)}}
              >
                {actions.map((action, index) => (<MenuItem key={'action_' + index} value={action.split(':')[0]}>{action}</MenuItem>))}
              </Select>
            </FormControl>
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==='but_complete'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <Button onClick={() => handleActOnTask(selAction, 'but_complete')} disabled={selAction===''}>{'Complete'}</Button>
            </Box>
          </React.Fragment>}
          {((taskObj.delegationState!=='pending') && taskConfigObj && taskConfigObj.actions!=='selection') && 
          actions.map((action, index) => (
            <Box key={'but_' + index} sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==='but_' + index}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <Button onClick={() => handleActOnTask(action.split(':')[0], 'but_' + index)}>{action.split(':')[0]}</Button>
            </Box>
            
          )
          )}
          {(taskObj.delegationState==='pending') && 
            <Button sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==='but_resolve'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}} 
              onClick={() => handleResolve('but_resolve')}>
                {'Resolve'}
            </Button>}
          <Button sx={{color: 'indigo'}} onClick={() => {setCurSaveIndex(0); if (taskConfigObj.display==='properties') setPropsSave(true);}} disabled={!taskConfigObj.variables || taskConfigObj.variables.length===0}>{'Save data'}</Button>
          <Button sx={{color: 'indigo'}} onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    

    
  );
}
