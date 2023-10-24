import * as React from 'react';
import { useState } from "react";
import Tiff from 'tiff.js';
import ReactMarkdown from 'react-markdown';
 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Collapse,
  Stack,
  IconButton, Paper, Tabs, Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogTitle,
} from '@mui/material';

import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import AddLinkIcon from '@mui/icons-material/AddLink';
import BoltIcon from '@mui/icons-material/Bolt';
import CloseIcon from "@mui/icons-material/Close";
import AutomationDefinitionView from './AutomationDefinitionView';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import CustomSearchSave from './CustomSearchSave';
import CustomSearchOpen from './CustomSearchOpen';




  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography component="span">{children}</Typography>
          </Box>
        )}
      </div>
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

  function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    
    const getDateValue = (dt) => {
      return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
    }

    const getDisplayValue = (inType, inValue) => {
      
      switch (inType){
        case 'boolean':
          return inValue?'True':'False';
        case 'json':
          return 'JSON...'
        case 'datetime':
          return getDateValue(inValue);
        default:
          return inValue;
      }
    }

    return (
      <React.Fragment>
        <TableRow hover>
          <TableCell align="left">
            <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'}>
              <Box>
                {row.name}
              </Box>
              {row.type==='json' && <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>}
            </Stack>
            
            
          </TableCell>
          <TableCell align="left">{row.type}</TableCell>
          <TableCell align="left" sx={{ wordWrap: "break-word" }}>{getDisplayValue(row.type, row.value)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Paper elevation={6}>
                <div><pre>{row.type==='json' ? JSON.stringify(row.value, null, 2) : '' }</pre></div>
              </Paper>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }


export default function AutomationDialog(props) {
  const { runRequest, docObject, token, showBorder, userName, automationOpen, setAutomationOpen, inAction, inActionId, setAutomationLoaded } = props;

  const [automationActions, setAutomationActions] = useState([]);
  const [urlStarted, setUrlStarted] = useState(false);
  const [automationUrl, setAutomationUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [executionRunning, setExecutionRunning] = useState(false);
  const [outVariables, setOutVariables] = useState([]);
  const [calcVariables, setCalcVariables] = useState([]);

  const [curFileName, setCurFileName] = useState('');
  const [inFolder, setInFolder] = useState({}); //for keeping the last folder used

  
  const [saveSearch, setSaveSearch] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const [waitTimer, setWaitTimer] = useState(-1); //for refreshing the workflow instance
  const [wfInstanceId, setWfInstanceId] = useState(''); //for keeping the instance id to refresh
  
  const [value, setValue] = React.useState(0);

  const [stepExecution, setStepExecution] = useState(''); //set it to pending, started, success, error to signal that we need to check next step or interrupt
  const [curExecutionId, setCurExecutionId] = useState(-1); //set it to the current execution


  const FormData = require('form-data');
  
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedFileName, setSelectedFileName] = React.useState('');
  const [selectedMimeType, setSelectedMimeType] = React.useState(''); //new css does not send back the content-disposition header but it gives the content-type

  const [selectedAutomationObject, setSelectedAutomationObject] = useState({});
  const [outAutomationObject, setOutAutomationObject] = useState({});


  const [markdownText, setMarkdownText] = useState('');
  

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
  
  //--------------------------------calls to get files (capture, cms, css)-----------------------------------------

  const cmsGetObject = (componentId, objectId, varIndex, downloadFile, inCategory, inType) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inCategory ? inCategory : `any`}/${inType ? inType : `cms_any`}/${objectId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        if (!inCategory) {
          cmsGetObject(componentId, objectId, varIndex, downloadFile, res.data.category, res.data.type);
        } else {
          if (downloadFile===true) {
            if (inCategory==='file') {
              cmsGetFile(componentId, objectId, true, inCategory, inType);
            } else {
              //it is the JSON of the current object
              setSelectedFile(new Blob([JSON.stringify(res.data, null, 2)], {type: 'text/plain'}));
              setSelectedFileName('cms_response.json');
              setSelectedMimeType('text/plain');
            }
            
          } else {
            //set variable result for the varIndex
            let data=[...calcVariables];
            
            switch (data[varIndex].type) {
              case 'json':
                  data.splice(varIndex,1,{encryption: false, scope: 'local', name: calcVariables[varIndex].name, type: calcVariables[varIndex].type, value: res.data});
                break;
              case 'string':
                  data[varIndex].value=JSON.stringify(res.data);
                break;
              default:
                handleVarChange(curExecutionId, 'result', {error: 'CMS result cannot be cast into variable type ' + data[varIndex].type + ' for variable ' + data[varIndex].name});
                setStepExecution('error');
                break;
            }
            
            setCalcVariables(data);
          }
          

        }
        
        
      } else {
        if (!inCategory) {
          handleVarChange(curExecutionId, 'result', {error: 'CMS object_id not found.' + objectId});
        } else {
          handleVarChange(curExecutionId, 'result', {error: `CMS did not return a result for /${inCategory}/${inType}/${objectId}`});
        }
        
        setStepExecution('error');
      }

      removeActiveId(componentId);
    }, '', []);
  }

  const cmsGetFile = (componentId, objectId, downloadObj, inCategory, inType) => {
    addActiveId(componentId);

    let url = '';
    if (!inCategory || inCategory==='file') {
      url = `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${objectId}/contents`;
    } else {
      url = `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inCategory}/${inType}/${objectId}`;
    }

    let req = { 
      method: 'get', 
      url: url, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.rendition_type==='primary') {
            //call download file - item.blob_id, item.name
            if (downloadObj===true) {
              downloadItem(componentId.replace(/value/g, 'file'), item.blob_id, item.name, '');
            } else {
              setCurFileName(item.name);
            }
          }
          });
        
      } else {
        if (res.data && res.data.id) {
          //it is the JSON of the current object
          if (downloadObj===true) {
            setSelectedFile(new Blob([JSON.stringify(res.data, null, 2)], {type: 'text/plain'}));
            setSelectedFileName('cms_response.json');
            setSelectedMimeType('text/plain');
          } else {
            setCurFileName((res.data.name ?? 'untitled') + '.' + inCategory);
          }
        } else {
          handleVarChange(curExecutionId, 'result', {error: 'CMS did not return any contents nodes or object information'});
          setStepExecution('error');
        }
        
      }

      removeActiveId(componentId);
    }, '', []);
  }

  const downloadItem = (componentId, blobId, fileName, fileUrl) => {
    addActiveId(componentId);
    
    //console.log('Reached download with id: ' + blobId);
    let req = { 
      method: 'get', 
      url: (fileUrl==='') ? `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${blobId}/download?avs-scan=false` : fileUrl, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        setSelectedFile(res.data);
        if (!fileName || fileName==='tempfile') {
          if (res.headers && res.headers['content-disposition']) {
            let fName = res.headers['content-disposition'].split(';');
            if (fName.length>1) {
              fileName = fName[1].replace(/filename=\"/g, '').replace(/\"/g, '');
            }
          }
          
        }
        
        setSelectedFileName((fileName==='') ? 'tempfile' : fileName); 
        setSelectedMimeType((res.headers && res.headers['content-type']) ? res.headers['content-type'] : 'text/plain');
      } else {
        handleVarChange(curExecutionId, 'result', {error: 'CSS did not return any document.'});
        setStepExecution('error');
      }

      removeActiveId(componentId);
      
    }, '', []);
  }

  const captureGetFile = (componentId, fileId) => { 
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/files/${fileId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob'
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        setSelectedFile(res.data);
        setSelectedFileName(`capture_result.${fileId.substring(fileId.length - 3).toLowerCase()}`);
        switch (fileId.substring(fileId.length - 3).toLowerCase()) {
          case 'tif':
            setSelectedMimeType('image/tiff');
            break;
          case 'jpg':
            setSelectedMimeType('image/jpeg');
            break;
          case 'pdf':
            setSelectedMimeType('application/pdf');
            break;
          case 'dat':
            setSelectedMimeType('text/plain');
            break;
          default:
            setSelectedMimeType('text/plain');
            break;
        }
        
      } else {
        handleVarChange(curExecutionId, 'result', {error: 'Capture did not return any document.'});
        setStepExecution('error');
      }
      
      removeActiveId(componentId);
    }, '', []);
  } 

    //get the file from the server
    const captureGetTiffDetails = (componentId, fileId, varIndex, downloadFile) => { 
      if (fileId.substring(fileId.length - 3)!=='TIF') {
        handleVarChange(curExecutionId, 'result', {error: 'Input file is not a TIFF result. ' + fileId});
        setStepExecution('error');
        return;
      }
      addActiveId(componentId);
        let req = { 
          method: 'get', 
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/files/${fileId}`, 
          headers: {
              "Authorization": `Bearer ${token}`
          },
          responseType: 'arraybuffer'
        }
        
        runRequest(req, (res) => {
          if (res.data) {
            var arrayBuffer = res.data;
            Tiff.initialize({TOTAL_MEMORY: 16777216 * 10});
            var image = new Tiff({ buffer: arrayBuffer });
            //get the tif resolution. image.getField(282) = xResolution, image.getField(283) = yResolution
            //the xResolution and yResolution come back in IEEE-754 floating-point number data type so we need to convert it into HEX first and then use a buffer to read the decimal
            //console.log(image.getField(282) + ' x ' +  image.getField(283) + ', unit: ' + image.getField(296) + ', compression: ' + image.getField(259));
            var dpiRes = 300;
            if (image.getField(282)===image.getField(283) && image.getField(282)>0) {
              var initNum = image.getField(282);
              var buf = Buffer.from(initNum.toString(16), "hex");
              dpiRes = buf.readFloatBE(0);
            }
            var outInfo = {resolution: dpiRes, height: image.height(), width: image.width()};
            if (downloadFile===true) {
              setSelectedFile(new Blob([JSON.stringify(outInfo, null, 2)], {type: 'text/plain'}));
              setSelectedFileName(`tiff_info.json`);
            } else {
              //put it back into variable
              //set variable result for the varIndex
              let data=[...calcVariables];
              
              switch (data[varIndex].type) {
                case 'json':
                    data.splice(varIndex,1,{encryption: false, scope: 'local', name: calcVariables[varIndex].name, type: calcVariables[varIndex].type, value: outInfo});
                  break;
                case 'string':
                    data[varIndex].value=JSON.stringify(outInfo);
                  break;
                default:
                  handleVarChange(curExecutionId, 'result', {error: 'JSON output cannot be cast into variable type ' + data[varIndex].type + ' for variable ' + data[varIndex].name});
                  setStepExecution('error');
                  break;
              }
              
              setCalcVariables(data);

            }
            
            
          } else {
            handleVarChange(curExecutionId, 'result', {error: 'Capture did not return a document for id.' + fileId});
            setStepExecution('error');
          }
          removeActiveId(componentId);
            
        }, 
        ``, 
        []);
    } 

  //--------------------------------calls to set files (capture, riskguard, css)-----------------------------------------

  const cpProcessFile = (componentId) => {
    //addActiveId(componentId);
    

        let contentType = "";
        if (selectedFileName==='tempfile') {
          if (selectedMimeType) {
            contentType = selectedMimeType;
          } else {
            console.log('Could not determine content type.');
            handleVarChange(curExecutionId, 'result', {error: 'Could not determine content type.', fileName: selectedFileName, mimeType: selectedMimeType});
            setStepExecution('error');
            return;
          }
        } else {
          switch (selectedFileName.split('.')[selectedFileName.split('.').length - 1].toLowerCase()) {
            case 'tif':
              contentType = "image/tiff";
              break;
            case 'tiff':
              contentType = "image/tiff";
              break;
            case 'jpg':
              contentType = "image/jpeg";
              break;
            case 'jpeg':
              contentType = "image/jpeg";
              break;
            case 'pdf':
              contentType = "application/pdf";
              break;
            default:
              console.log('Extension not supported:' + selectedFileName.split('.')[selectedFileName.split('.').length - 1].toLowerCase() + '. Select an image file or pdf');
              handleVarChange(curExecutionId, 'result', {error: 'Extension not supported:' + selectedFileName.split('.')[selectedFileName.split('.').length - 1].toLowerCase() + '. Select an image file or pdf'});
              setStepExecution('error');
              return;
          }
        }
        

        var reader = new FileReader();

        reader.readAsDataURL(selectedFile);
        reader.onload = function () {
          const regex = /data:.*base64,/
          captureUploadDoc(componentId, reader.result.replace(regex,""), contentType);
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
          handleVarChange(curExecutionId, 'result', {error: error});
          setStepExecution('error');
        };
        
    }

  const captureUploadDoc = (componentId, fileBase64, contentType) => { 
    addActiveId(componentId);
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/capture/cp-rest/v2/session/files`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*',  "Content-Type": "application/json" },
      data: {
            "data": fileBase64, 
            "contentType": contentType,
            "offset": 0
      }
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.status && (res.status===200 || res.status===201)) {
        //save json
        handleVarChange(curExecutionId, 'result', res.data);
        handleVarChange(curExecutionId, 'fileName', selectedFileName);
        setStepExecution('success');
      } else {
        handleVarChange(curExecutionId, 'result', {error: 'Capture upload did not work.'});
        setStepExecution('error');
      }
      removeActiveId(componentId);
    }, '', []);
  } 

  const rgProcessFile = (componentId) => {
    addActiveId(componentId);

    const formData = new FormData();
		formData.append(
			'File',
			selectedFile,
			selectedFileName,
		);
    
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/mtm-riskguard/api/v1/process`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*',  "Content-Type": "multipart/form-data" },
      data: formData
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.status && (res.status===200 || res.status===201)) {
        //save json
        handleVarChange(curExecutionId, 'result', res.data);
        handleVarChange(curExecutionId, 'fileName', selectedFileName);
        setStepExecution('success');
      } else {
        handleVarChange(curExecutionId, 'result', {error: 'RiskGuard returned error.'});
        setStepExecution('error');
      }
      removeActiveId(componentId);
      
    }, '', []);
  }

  const cssProcessFile = (componentId) => {
    addActiveId(componentId);

    const formData = new FormData();
		formData.append(
			'file',
			selectedFile,
			selectedFileName
		);

    let req = { 
      method: 'post', 
      data: formData,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', "Content-Type": "multipart/form-data" } 
    };
    runRequest(req, (res) => {
      
      if (res.status && (res.status===200 || res.status===201)) {
        //save json
        handleVarChange(curExecutionId, 'result', res.data);
        handleVarChange(curExecutionId, 'fileName', selectedFileName);
        setStepExecution('success');
      } else {
        handleVarChange(curExecutionId, 'result', {error: 'CSS upload returned error'});
        setStepExecution('error');
      }
      removeActiveId(componentId);

    }, '', []);
   

  };


  //--------------------------------calls for other services (workflow, output)------------------------------------

  
  const getVariables = () => {
    //code to resolve the variables
    let autoVariables = automationActions[curExecutionId].variableMappings;
    let variables = [];

    for (let i=0; i<autoVariables.length; i++) {
        let varVal = autoVariables[i].value;
        let outVal = '';
        //extract the variable part ${}
        varVal = varVal.match(/\${[\w,\W]+}/g);
        if (!varVal) {
          //no variable part, value is literal
          outVal = autoVariables[i].value;
        } else {
          //get the variable parts
          
          varVal=varVal[0]; //for now we just take care of the first occurence
          varVal=varVal.replace(/\${/g, '').replace(/}/g,'');
          
          switch (varVal.split('.')[0]) {
            case 'token':
              outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), token);
              break;
            case 'tenantId':
              outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), process.env.REACT_APP_TENANT_ID);
              break;
            case 'userName':
              outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), userName);
              break;
            case 'currentId':
              outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), docObject.id);
              break;
            case 'currentFileName':
              outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), curFileName);
              break;
            default:
              if (isNaN(varVal.split('.')[0])) {
                console.log(`Variable could not be decoded: ${varVal}`);
                handleVarChange(curExecutionId, 'result', {error: `Variable could not be decoded: ${varVal}`});
                setStepExecution('error');
              } else {
                let actStep = parseInt(varVal.split('.')[0]);
                let actService = varVal.split('.').length>1 ?  varVal.split('.')[1] : '';
                let actVariable = varVal.split('.').length>2 ?  varVal.split('.')[2] : '';
                let actExtra = varVal.split('.').length>3 ?  varVal.split('.')[3] : '';
                let stepRes = {};

                //console.log(actStep + ' - ' + actService + ' - ' + actVariable);

                switch (actService) {
                  
                  case 'cms':
                    switch (actVariable) {
                      case 'currentId':
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), docObject.id);
                        break;
                      case 'json':
                        //it is a JSON
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), JSON.stringify(docObject));
                        break;
                      case 'currentFileName':
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), curFileName);
                        break;                                  
                      default:
                        //this is a variable so need to run cms and get the result
                        //but this is async so we need to wait for it - setting outVal to ${pending}
                        outVal = '${pending}|cmsGetObject|' + actVariable + '|' + i;
                        break;
                    }
                    break;
                  case 'css':
                    //get the step value
                    stepRes = automationActions[actStep].result;
                    if (actVariable==='blobId') {
                      outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), stepRes.entries[0].blobId);
                    } else {
                      if (actVariable==='currentFileName') {
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), (automationActions[actStep].fileName ?? 'none'));
                      } else {
                        //it is a JSON
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), JSON.stringify(stepRes));
                      }
                    }
                    break;
                  case 'riskguard':
                    //get the step value
                    stepRes = automationActions[actStep].result;
                    if (actVariable==='currentFileName') {
                      outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), (automationActions[actStep].fileName ?? 'none'));
                    } else {
                      //it is a JSON
                      outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), JSON.stringify(stepRes));
                    }
                    break;
                  case 'capture':
                    //get the step value
                    stepRes = automationActions[actStep].result;
                    switch (actVariable) {
                      case 'fileId':
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), stepRes.id);
                        break;
                      case 'currentFileName':
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), (automationActions[actStep].fileName ?? 'none'));
                        break;
                      default:
                        //it is a JSON
                        outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), JSON.stringify(stepRes));
                        break;
                    }

                    break;
                  case 'workflow':
                    //get the step value
                    stepRes = automationActions[actStep].result;    
                    if (actVariable==='json') {
                      //it is a JSON
                      outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), JSON.stringify(stepRes));
                    } else {
                      //get the variable
                      let wfVars = stepRes.variables;
                      if (!wfVars) {
                        console.log(`No variables returned by the workflow service.`);
                        handleVarChange(curExecutionId, 'result', {error: `No variables returned by the workflow service.`});
                        setStepExecution('error');
                        return [];
                      }
                      for (let w=0; w<wfVars.length; w++) {
                        if (wfVars[w].name===actVariable) {
                          if (wfVars[w].value != null) {
                            switch (wfVars[w].type) {
                              case 'json':
                                outVal = wfVars[w].value;
                                break;
                              case 'date':
                                outVal = wfVars[w].value;
                              default:
                                console.log(wfVars[w].value);
                                console.log(wfVars[w].value.toString());
                                if (actExtra==='tiffDetails') {
                                  //this is a variable so need to run capture and get the result
                                  //but this is async so we need to wait for it - setting outVal to ${pending}
                                  outVal = '${pending}|captureGetTiff|' + wfVars[w].value.toString() + '|' + i;
                                  break;
                                } else {
                                  outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), wfVars[w].value.toString());
                                }
                                
                                break;
                            }
                            
                          } else {
                            outVal = autoVariables[i].value.replace(RegExp(`\\\${${varVal}}`,'g'), '');
                          }
                          
                        }
                      }
                    }
                    
                    break;
                  default:
                    console.log(`Service unrecognized for file input: ${actService}`);
                    handleVarChange(curExecutionId, 'result', {error: `Service unrecognized for file input: ${actService}`});
                    setStepExecution('error');
                    break;
                }
              }
              break;
          }
      }

      switch (autoVariables[i].type) {
        case 'string':
          variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: outVal});
          break;
        case 'date':
          if (outVal!='' && !dayjs(outVal).isValid) {
            console.log(`Date variable bad format. ${autoVariables[i].name}`);
            handleVarChange(curExecutionId, 'result', {error: `Date variable bad format. ${autoVariables[i].name}`});
            setStepExecution('error');
            return [];
          }
          variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: (outVal===''?null:dayjs(outVal).toISOString())});
          break;
        case 'json':
          if (outVal.constructor===Object) {
            //it is already a JSON
            variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: outVal});
          } else {
            if (outVal.split('|')[0]==='${pending}') {
              variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: outVal});
            } else {
              try {
                variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: JSON.parse(outVal)});
              } catch (error) {
                console.log(`JSON variable bad format. ${autoVariables[i].name}`);
                handleVarChange(curExecutionId, 'result', {error: `JSON variable bad format.`, varName: autoVariables[i].name, varValue: outVal});
                setStepExecution('error');
                return [];
              }
            }
          }
          
          
          break;
        case 'boolean':
          variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: (outVal==='true' ? true : false)});
          break;
        case 'integer':
          if (isNaN(Number(outVal))) {
            console.log(`Integer variable bad format. ${autoVariables[i].name}`);
            handleVarChange(curExecutionId, 'result', {error: `Integer variable bad format. ${autoVariables[i].name}`});
            setStepExecution('error');
            return [];
          } else {
            variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: parseInt(outVal)});
          }
          break;
        case 'double':
          if (isNaN(Number(outVal))) {
            console.log(`Double variable bad format. ${autoVariables[i].name}`);
            handleVarChange(curExecutionId, 'result', {error: `Double variable bad format. ${autoVariables[i].name}`});
            setStepExecution('error');
            return [];
          } else {
            variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: Number(outVal)});
          }
          break;
        case 'long':
          if (isNaN(Number(outVal))) {
            console.log(`Long variable bad format. ${autoVariables[i].name}`);
            handleVarChange(curExecutionId, 'result', {error: `Long variable bad format. ${autoVariables[i].name}`});
            setStepExecution('error');
            return [];
          } else {
            variables.push({encryption: false, scope: 'local', name: autoVariables[i].name, type: autoVariables[i].type, value: Number(outVal)});
          }
          break;
        default:
          break;
      }

    }
    
    return variables;
  }

  const handleInitModel = (componentId) => {
    //code to initiate the process
    let autoVariables = automationActions[curExecutionId].variableMappings;
    let processDefKey = automationActions[curExecutionId].componentName.split('|')[0];
    let instanceName = 'automation (' + Date.now().toString(36) + ') - ' + (selectedAutomationObject?.name ? selectedAutomationObject.name : 'unsaved') + ' - ' + componentId;
    let variables = calcVariables;
    let payloadData = {processDefinitionKey: processDefKey, name:instanceName, variables:variables};

    if (automationActions[curExecutionId].componentAsync && automationActions[curExecutionId].componentAsync===true) {
      payloadData.async = true;
    }

    if (autoVariables.length>0 && variables.length==0) {
      //error
      return;
    }



    addActiveId(componentId);
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow/v1/process-instances`, 
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      data: payloadData
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status && (res.status===200 || res.status===201)) {
        //success
        //does it need to wait for completion?

        if (automationActions[curExecutionId].componentWait && (automationActions[curExecutionId].componentWait===true) && automationActions[curExecutionId].componentWaitTime && (Number(automationActions[curExecutionId].componentWaitTime)>0)) {
          setWfInstanceId(res.data.id);
          setWaitTimer(0);
        } else {
          handleVarChange(curExecutionId, 'result', res.data);
          handleVarChange(curExecutionId, 'fileName', 'workflow');
          setStepExecution('success');
          handleVarChange(curExecutionId, 'timerRun', -1);
          setWaitTimer(-1);
        }
      } else {
        //error
        handleVarChange(curExecutionId, 'result', {error: `Could not start the process instance`, data: res});
        setStepExecution('error');
      }        
      removeActiveId(componentId);
      
    }, '', []);

  }

  const handleRefreshInstance = (componentId) => {
    //code to get the instance details
    
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/workflow-history/v1/historic-process-instances/${wfInstanceId}?includeProcessVariables=true`, 
      headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status && (res.status===200 || res.status===201)) {
        //success
        //did it end?
        if (res.data?.endTime) {
          //ended
          setWaitTimer(-1);
          handleVarChange(curExecutionId, 'timerRun', -1);
          handleVarChange(curExecutionId, 'result', res.data);
          handleVarChange(curExecutionId, 'fileName', 'workflow');
          setStepExecution('success');
        } else {
          //did not end
          setWaitTimer(0);
        }

      } else {
        //error
        handleVarChange(curExecutionId, 'result', {error: `Could not get the instance details. ID: ${wfInstanceId}`, data: res});
        setStepExecution('error');
      }        
      removeActiveId(componentId);
      
    }, '', []);

  }

  const handleOutput = () => {
    let variables = calcVariables;
    setOutVariables(variables);
    handleVarChange(curExecutionId, 'result', {success: `Succesfully finished Output step: 200 and 201`});
    setStepExecution('success');
    getActualFile(); //to get the file if it exists
  }
 
//------------------------------Automation logic-----------------------------------------------------------------

  const handleExecuteAutomation = () => {
    handleResetExecution(true);
    //start the first automation
    getNextAutomation();
  }

  const handleResetExecution = (newState) => {
    setExecutionRunning(newState);
    //reset status for all steps
    let data = [...automationActions];
    for (let i=0; i<data.length; i++) {
      data[i].execution='pending';
      data[i].result={};
      data[i].fileName='';
    }
    setOutVariables([]);
    setCalcVariables([]);
    setAutomationActions(data);
    setStepExecution('');
    setWaitTimer(-1);
    setWfInstanceId('');
    if (!newState) setValue(0);
  }

  const handleRetryExecution = (newIndex) => {
    setExecutionRunning(true);
    //reset status for specific step
    let data = [...automationActions];
    data[newIndex].execution='pending';
    data[newIndex].result={};
    data[newIndex].fileName='';
    setOutVariables([]);
    setCalcVariables([]);
    setAutomationActions(data);
    setStepExecution('');
    getNextAutomation();
  }

  const handleVarChange = (index, inName, inValue) => {
    let data = [...automationActions];
    if (!data || !data[index]) return; 
    data[index][inName] = inValue;
    setAutomationActions(data);
}

  const getNextAutomation = () => {
    let nextAutomation = false;
    for (let i=0; i<automationActions.length; i++) {
      if (automationActions[i].execution==='pending' && !nextAutomation) {
        //start execution
        nextAutomation = true;
        setCurExecutionId(i);
        setStepExecution('pending');
        setCalcVariables([]);
        setSelectedFile(null);

      }
    }

    if (!nextAutomation) {
      //no actions left, everything went according to plan
      setExecutionRunning(false);
    }

  }

  const preRunAutomation = () => {
    //if we need to do something here
    setStepExecution('started');
  }

  const runAutomation = () => {
    let nextAutomation = automationActions[curExecutionId];
    
    //console.log(nextAutomation);

    switch (nextAutomation.runAction) {
        case 'capture':
        //get the file needed for capture
          getActualFile();
        break;
        case 'riskguard':
        //get the file needed for riskguard
          getActualFile();
        break;
        case 'css':
        //get the file needed for css
          getActualFile();
        break;
        case 'workflow':
        //start the workflow
        //first get the variables
          setCalcVariables(getVariables());
          //handleInitModel('service_run_' + curExecutionId);
        break;
        case 'output':
          //create the output variable array and download any file variable to the browser
          //do the variables
          //check whether there are any variables to calculate 
          let autoVariables = automationActions[curExecutionId].variableMappings;
          let calcNeeded = false;
          for (let a=0; a<autoVariables.length; a++) {
            if (autoVariables[a].type!=='file') {
              calcNeeded=true;
            }
          }
          if (calcNeeded) {
            setCalcVariables(getVariables());
          } else {
            handleOutput();
          }
          
          //handleOutput
        break;
                    
    
      default:
        break;
    }


  }

  const getActualFile = () => {
    //console.log('Acting')
    let autoVariables = automationActions[curExecutionId].variableMappings;
    for (let i=0; i<autoVariables.length; i++) {
      if (autoVariables[i].type==='file') {
        let varVal = autoVariables[i].value;
        //extract the variable part ${}
        varVal = varVal.match(/\${[\w,\W]+}/g);

        if (!varVal) {
          //no variable part, because it is a file resource, we will assume the default cms file object type
          cmsGetFile('value_run_' + curExecutionId + '_' + i, varVal, true);
        } else {
          //get the variable parts
          varVal=varVal[0];
          varVal=varVal.replace(/\${/g, '').replace(/}/g,'');
          switch (varVal.split('.')[0]) {
            case 'token':
              console.log('Encountered token where a file ID was needed.');
              handleVarChange(curExecutionId, 'result', {error: 'Encountered token where a file ID was needed.'});
              setStepExecution('error');
              break;
            case 'userName':
              console.log('Encountered userName where a file ID was needed.');
              handleVarChange(curExecutionId, 'result', {error: 'Encountered userName where a file ID was needed.'});
              setStepExecution('error');
              break;
            case 'currentFileName':
              console.log('Encountered currentFileName where a file ID was needed.');
              handleVarChange(curExecutionId, 'result', {error: 'Encountered currentFileName where a file ID was needed.'});
              setStepExecution('error');
              break;  
            case 'currentId':
              cmsGetFile('value_run_' + curExecutionId + '_' + i, docObject.id, true, docObject.category, docObject.type);
              break;
            default:
              if (isNaN(varVal.split('.')[0])) {
                console.log(`Variable could not be decoded: ${varVal}`);
                handleVarChange(curExecutionId, 'result', {error: `Variable could not be decoded: ${varVal}`});
                setStepExecution('error');
              } else {
                let actStep = parseInt(varVal.split('.')[0]);
                let actService = varVal.split('.').length>1 ?  varVal.split('.')[1] : '';
                let actVariable = varVal.split('.').length>2 ?  varVal.split('.')[2] : '';
                let actExtra = varVal.split('.').length>3 ?  varVal.split('.')[3] : '';
                let stepRes = {};
               

                switch (actService) {
                  
                  case 'cms':
                    if (actVariable==='currentId') {
                      cmsGetFile('value_run_' + curExecutionId + '_' + i, docObject.id, true, docObject.category, docObject.type);
                    } else {
                      if (actVariable==='json') {
                        //it is the JSON of the current object
                        setSelectedFile(new Blob([JSON.stringify(docObject, null, 2)], {type: 'text/plain'}));
                        setSelectedFileName('cms_response.json');
                        setSelectedMimeType('text/plain');
                      } else {
                        //it is an object id - check what object it is
                        cmsGetObject('value_run_' + curExecutionId + '_' + i, actVariable, 0, true, '', '');
                      }
                      
                    }
                    break;
                  case 'css':
                    //get the step value
                    stepRes = automationActions[actStep].result;
                    console.log('Getting the css object');
                    if (actVariable==='blobId') {
                      console.log('Blob Id: ' + stepRes.entries[0].blobId);
                      //if we have the download link, better to get that instead
                      if (stepRes.entries.length===1) {
                        let dwnURL = stepRes.entries[0]._links.download.href;
                        downloadItem('file_run_' + curExecutionId + '_' + i, '', 'tempfile', dwnURL);
                      } else {
                        downloadItem('file_run_' + curExecutionId + '_' + i, stepRes.entries[0].blobId, 'tempfile', '');
                      }
                      
                    } else {
                      //it is a JSON
                      setSelectedFile(new Blob([JSON.stringify(stepRes, null, 2)], {type: 'text/plain'}));
                      setSelectedFileName('css_response.json');
                      setSelectedMimeType('text/plain');
                    }
                    break;
                  case 'riskguard':
                    //get the step value
                    stepRes = automationActions[actStep].result;
                    //it is a JSON
                    setSelectedFile(new Blob([JSON.stringify(stepRes, null, 2)], {type: 'text/plain'}));
                    setSelectedFileName('riskguard_response.json');
                    setSelectedMimeType('text/plain');
                    break;
                  case 'capture':
                    //get the step value
                    stepRes = automationActions[actStep].result;
                    if (actVariable==='fileId') {
                      captureGetFile('file_run_' + curExecutionId + '_' + i, stepRes.id);
                    } else {
                      //it is a JSON
                      setSelectedFile(new Blob([JSON.stringify(stepRes, null, 2)], {type: 'text/plain'}));
                      setSelectedFileName('capture_response.json');
                      setSelectedMimeType('text/plain');
                    }
                    break;
                  case 'workflow':
                    //get the step value
                    stepRes = automationActions[actStep].result;    
                    //get the variable
                    let wfVars = stepRes.variables;
                    if (!wfVars) {
                      console.log(`No variables returned by the workflow service.`);
                      handleVarChange(curExecutionId, 'result', {error: `No variables returned by the workflow service.`});
                      setStepExecution('error');
                      return;
                    }
                    let resVarFound = false;
                    for (let w=0; w<wfVars.length; w++) {
                      if (wfVars[w].name===actVariable) {
                        resVarFound=true;
                        switch (actExtra) {
                          case 'css':
                            //console.log('Blob Id: ' + wfVars[w].value);
                            downloadItem('file_run_' + curExecutionId + '_' + i, wfVars[w].value, 'tempfile', '');
                            break;
                          case 'url':
                            //console.log('URL: ' + wfVars[w].value);
                            if (!wfVars[w].value) {
                              console.log(`Variable ${actVariable} does not contain a URL.`);
                              handleVarChange(curExecutionId, 'result', {error: `Variable ${actVariable} does not contain a URL.`});
                              setStepExecution('error');
                              return;
                            } else {
                              downloadItem('file_run_' + curExecutionId + '_' + i, '', 'tempfile', wfVars[w].value);
                            }
                            
                            break;
                          case 'cms':
                            cmsGetFile('value_run_' + curExecutionId + '_' + i, wfVars[w].value, true);
                            break;
                          case 'capture':
                            captureGetFile('file_run_' + curExecutionId + '_' + i, wfVars[w].value);
                            break;
                          case 'tiffDetails':
                            captureGetTiffDetails('file_run_' + curExecutionId + '_' + i, wfVars[w].value, 0, true);
                            break;
                          case 'text':
                            switch (wfVars[w].type) {
                              case 'json':
                                setSelectedFile(new Blob([JSON.stringify(wfVars[w].value, null, 2)], {type: 'text/plain'}));
                                break;
                              case 'string':
                                setSelectedFile(new Blob([wfVars[w].value], {type: 'text/plain'}));
                                break;
                              case 'boolean':
                                setSelectedFile(new Blob([wfVars[w].value ? 'true' : 'false'], {type: 'text/plain'}));
                                break;
                              case 'date':
                                setSelectedFile(new Blob([dayjs(wfVars[w].value).isValid ? dayjs(wfVars[w].value).toISOString : ''], {type: 'text/plain'}));
                                break;
                              default:
                                setSelectedFile(new Blob([wfVars[w].value.toString()], {type: 'text/plain'}));
                                break;
                            }
                            
                            
                            setSelectedFileName(wfVars[w].name + '_value.' + (wfVars[w].type==='json'?'json':'txt'));
                            setSelectedMimeType('text/plain');
                            break;
                          default:
                            console.log(`No options specified for the wf variable (css, cms, url or capture). ${actExtra}`);
                            handleVarChange(curExecutionId, 'result', {error: `No options specified for the wf variable (css, cms, url or capture). ${actExtra}`});
                            setStepExecution('error');
                            return;
                        }
                      }
                    }
                    if (!resVarFound) {
                      console.log(`Variable ${actVariable} was not found in the execution result ${curExecutionId}.`);
                      handleVarChange(curExecutionId, 'result', {error: `Variable ${actVariable} was not found in the execution result ${curExecutionId}.`});
                      setStepExecution('error');  
                    }
                    break;
                  default:
                    console.log(`Service unrecognized for file input: ${actService}`);
                    handleVarChange(curExecutionId, 'result', {error: `Service unrecognized for file input: ${actService}`});
                    setStepExecution('error');
                    break;
                }
              }
              break;
          }
        }
      }
    }
    

  }

  const handleWaitTimer = (existingTime) => {
    setWaitTimer(existingTime + 1);
  }

  const getAutomationPrimaryRendition = (componentId, automationId) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${automationId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id && res.data._links) {
        setSelectedAutomationObject(res.data);
        //console.log('Download: ' + res.data._links['urn:eim:linkrel:download-media'].href);
        downloadAutomation(res.data._links['urn:eim:linkrel:download-media']?.href, componentId + 'dwn');
        
      }
      removeActiveId(componentId);
      
    }, '', []);

  }

  const downloadAutomation = (inUrl, componentId) => {
    if (!inUrl) return;
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: inUrl, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        var reader = new FileReader();
        reader.onload = function () {
          try {
            let objOut = JSON.parse(reader.result);
            let validFile = false;
            //console.log(objOut);
            if (objOut.length>0 && objOut[0].runAction) {
              validFile=true;
            }
            if (!validFile) {
              console.log(`The selected file does not appear to be a valid automation configuration`);
            } else {
              setAutomationActions(objOut);
              if (inAction!=='automationrun') {
                setAutomationLoaded(true);
              }
              
          
            }
          } catch (error) {
            console.log(`The selected file does not appear to be a valid automation configuration`);
            setAutomationLoaded(true);
          }
          
        };
        reader.onerror = function (error) {
          console.log(`The selected file does not appear to be a valid automation configuration`);
          setAutomationLoaded(true);
        };
        
        reader.readAsText(res.data);


        
         
      }
      removeActiveId(componentId);
      
    }, '', []);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {

        // eslint-disable-next-line
    },[]
    );

    useEffect(
      () => {
        if (inAction==='automationrun' && automationActions.length>0 && !urlStarted) {
          console.log('Running step 2')
          //second step run the automation
          setUrlStarted(true);
          handleExecuteAutomation();
          setAutomationLoaded(true);
        }
          // eslint-disable-next-line
      },[automationActions]
      );
     

  useEffect(
    () => {
      //timer was updated, check the execution
      if (waitTimer>=0) {
        handleVarChange(curExecutionId, 'timerRun', waitTimer);
        //it is a timer that runs
        let waitNeeded = Number(automationActions[curExecutionId].componentWaitTime);
        if (waitTimer===waitNeeded) {
          //execute
          handleRefreshInstance('service_run_' + curExecutionId);
        } else {
          //increment
          setTimeout(() => { handleWaitTimer(waitTimer) }, 1000);
        }
      }
        
        // eslint-disable-next-line
    },[waitTimer]
    );

  useEffect(
    () => {
      //check if there is any pending
      let variables = calcVariables;
      let nextAutomation = automationActions[curExecutionId];
      let stillPending = false;
      if (variables.length>0) {
        //some variables have been calculated
        for (let i=0; i<variables.length; i++) {
          if ((variables[i].type==='string' || variables[i].type==='json') && variables[i].value.constructor!==Object) {
            if (variables[i].value.split('|')[0]==='${pending}') {
              let tmpVar = variables[i].value;
              //'${pending}|cmsGetObject|' + actVariable + '|' + i;
              if (tmpVar.split('|').length<4) {
                //error
                handleVarChange(curExecutionId, 'result', {error: `Variable structure not good: ${tmpVar}`});
                setStepExecution('error');
              } else {
                switch (tmpVar.split('|')[1]) {
                  case 'cmsGetObject':
                    cmsGetObject('value_run_' + curExecutionId + '_' + tmpVar.split('|')[3], tmpVar.split('|')[2], parseInt(tmpVar.split('|')[3]), false, '', '');
                    break;
                  case 'captureGetTiff':
                    captureGetTiffDetails('value_run_' + curExecutionId + '_' + tmpVar.split('|')[3], tmpVar.split('|')[2], parseInt(tmpVar.split('|')[3]), false);
                    break;
                  default:
                    handleVarChange(curExecutionId, 'result', {error: `Variable execution not found: ${tmpVar}`});
                    setStepExecution('error');
                    break;
                }

              }
              
              stillPending=true;
            }
           
          }
        }

        if (!stillPending) {
          //execute action
          switch (nextAutomation.runAction) {
            case 'workflow':
              //start the workflow
              handleInitModel('service_run_' + curExecutionId);
              break;
            case 'output':
              handleOutput();
            break;
            default:
              break;
          }
        }
      }
        
        // eslint-disable-next-line
    },[calcVariables]
    );    

  useEffect(
    () => {
      if (!executionRunning) return;
      //when a step execution is updated
      switch (stepExecution) {
        case 'pending':
          //start the action!!
          preRunAutomation();
          break;
        case 'started':
          //do the dew
          runAutomation();
          break;
        case 'success':
          //get next action
          getNextAutomation();
          break;
        case 'error':
          //update and stop
          setExecutionRunning(false);
          break;
    
        default:
          return;
      }
      handleVarChange(curExecutionId, 'execution', stepExecution);

    },[stepExecution]
    );

  useEffect(
    () => {
      if (automationOpen) {
        setExecutionRunning(false);
        setCurExecutionId(-1);
        cmsGetFile('curFileName', docObject.id, false, docObject.category, docObject.type);

        
        fetch('./Automation.md')
        .then(response => response.text())
        .then(text => {setMarkdownText(text); })

        //console.log(inAction + ' - ' + inActionId);
        if ((inAction==='automationload' || inAction==='automationrun') && inActionId) {
          //first load the automation
          getAutomationPrimaryRendition('automationUrlLoad', inActionId);

        }
      }
    },[automationOpen]
    );

    useEffect(
      () => {
        if (!executionRunning && outVariables.length>0) {
          setValue(2);
        }
      },[executionRunning]
      );

  useEffect(
    () => {
      let nextAutomation = automationActions[curExecutionId];
        if (selectedFile) {
          //do what is needed based on the automation
          switch (nextAutomation.runAction) {
            case 'capture':
              //run capture with the selectedFile
              cpProcessFile('service_run_' + curExecutionId)
            break;
            case 'riskguard':
              //run riskguard with the selectedFile
              rgProcessFile('service_run_' + curExecutionId);
            break;
            case 'css':
              //run css with the selectedFile
              cssProcessFile('service_run_' + curExecutionId);
            break;
            case 'output':
            //create the output variable array and download any file variable to the browser
              // create file link in browser's memory
              const href = URL.createObjectURL(selectedFile);
              // create "a" HTLM element with href to file & click
              const link = document.createElement('a');
              link.href = href;
              link.setAttribute('download', selectedFileName); //or any other extension
              document.body.appendChild(link);
              link.click();

              // clean up "a" element & remove ObjectURL
              document.body.removeChild(link);
              URL.revokeObjectURL(href);
            break;
            default:
              console.log('Received a file creation event but nothing to do with it. runAction is: ' + nextAutomation.runAction);
              break;
          }

        }
        // eslint-disable-next-line
      },[selectedFile]
    );
  
  
  return (
      <React.Fragment>
        <Dialog
          open={automationOpen}
          onClose={() => {setAutomationOpen(false)}}
          aria-labelledby="automation-dialog"
          aria-describedby="automation-dialog"
          maxWidth={'xl'} 
          fullWidth
        >
          <DialogTitle>
            <Box>
              <div className="app-general-dialog">
                  <IconButton size="small" variant="outlined" color="error" title="Clear configuration" 
                      onClick={() => { setAutomationActions([]); setSelectedAutomationObject({}) }}
                      className="title-icon">
                      <HighlightOffIcon />
                  </IconButton>
                  <IconButton size="small" variant="outlined" color="primary" title="Load" 
                      onClick={() => { setOpenSearch(true) }}
                      className="title-icon">
                      <OpenInBrowserIcon />
                  </IconButton>
                  
                  <IconButton size="small" variant="outlined" color="primary" title="Save as..." 
                      disabled={(automationActions.length===0)} 
                      onClick={() => { setSaveSearch(true); }}
                      className="title-icon">
                      <SaveAsIcon />
                  </IconButton>
                  <IconButton size="small" variant="outlined" color="primary" title="Save" 
                    disabled={!(selectedAutomationObject.id)} 
                    onClick={() => { setSaveSearch(true); setOutAutomationObject(selectedAutomationObject); }}
                    className="title-icon">
                      <SaveIcon />
                  </IconButton>
                  <IconButton size="small" variant="outlined" color="primary" title="Show url (execute)" 
                    disabled={!(selectedAutomationObject.id)} 
                    onClick={()=>{setAutomationUrl(`${process.env.REACT_APP_REDIRECT_URI}?id=${docObject.id}&action=automationrun&actionid=${selectedAutomationObject.id}`); setCopied(false);}}
                    className="title-icon">
                      <BoltIcon />
                  </IconButton>
                  <IconButton size="small" variant="outlined" color="primary" title="Show url (load)" 
                    disabled={!(selectedAutomationObject.id)} 
                    onClick={()=>{setAutomationUrl(`${process.env.REACT_APP_REDIRECT_URI}?id=${docObject.id}&action=automationload&actionid=${selectedAutomationObject.id}`); setCopied(false);}}
                    className="title-icon">
                      <AddLinkIcon />
                  </IconButton>
              </div>
              <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj==='curFileName'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                <Typography>{`Current object: ${docObject.name} (${docObject.id})${(curFileName!=='')?`. FileName: ${curFileName}`:''}. Current user: ${userName}`}</Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{
              flexGrow: 1,
              maxHeight: '70vh',
              mb: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overflowX: "auto",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: 3,
                height: 3,
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
            
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Definition" {...a11yProps(0)} />
                <Tab label="Instructions" {...a11yProps(1)} />
                {outVariables.length>0 && <Tab label="Results" {...a11yProps(2)} />}
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <AutomationDefinitionView 
                runRequest={runRequest}
                token={token}
                showBorder={showBorder}
                inputAutomations = {automationActions}
                setAutomations = {(array) => setAutomationActions(array)}
                canAdd
                canRemove
                canEdit={!executionRunning && (outVariables.length===0)} 
                canRetry={!executionRunning} 
                outRefreshIndex={(index) => {handleRetryExecution(index)}}
                inActiveId={activeId}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <ReactMarkdown children={markdownText} />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow sx={{backgroundColor:'#e1e1e1'}}>
                      <TableCell sx={{fontWeight:'bold', minWidth:150}}>Name</TableCell>
                      <TableCell align="left" sx={{fontWeight:'bold'}}>Type</TableCell>
                      <TableCell sx={{ wordWrap: "break-word" , fontWeight:'bold'}} align="left">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {outVariables.map((row, index) => (
                      <Row key={'variable_idx_' + index} row={row} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {handleExecuteAutomation()}}>Execute</Button>
            <Button onClick={() => {handleResetExecution(false)}}>Reset</Button>
            <Button onClick={() => {setAutomationOpen(false)}}>Close</Button>
          </DialogActions>
        </Dialog>

        <CustomSearchSave
          runRequest = {runRequest} 
          newFileOpen = {saveSearch} 
          onCreateSuccess = {(result) => {setSaveSearch(false); }} 
          token = {token} 
          showBorder = {showBorder} 
          configObject = {automationActions} 
          configType = {'automation'}
          inExistingObject = {outAutomationObject}
          setOutObject = {(obj) => {setSelectedAutomationObject(obj); setOutAutomationObject({})}} 
          inFolder={inFolder} 
          setInFolder={setInFolder}
        />
        <CustomSearchOpen
          runRequest = {runRequest} 
          newFileOpen = {openSearch} 
          onSelectSuccess = {(result, loadObj) => {setOpenSearch(false); if (result) { setAutomationActions(loadObj); } }} 
          token = {token} 
          showBorder = {showBorder} 
          configType = {'automation'}
          setOutObject = {(obj) => {setSelectedAutomationObject(obj); setOutAutomationObject({})}}
          inFolder={inFolder} 
          setInFolder={setInFolder}
        />
        <Dialog
          open={automationUrl!==''}
          onClose={() => {setAutomationUrl('')}}
          maxWidth={'md'}  
        >
          <DialogTitle>URL to load Automation configuration</DialogTitle>
          <DialogContent>
            <Typography>{automationUrl}</Typography>
          </DialogContent>
          <DialogActions>
            <Button disabled={copied} onClick={() => {navigator.clipboard.writeText(automationUrl); setCopied(true);}}>Copy</Button>
            <Button onClick={() => {setAutomationUrl('') }}>Close</Button>
          </DialogActions>
        </Dialog>
        
    </React.Fragment>
  );
}
 