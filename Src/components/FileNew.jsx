import * as React from 'react';
import dayjs from 'dayjs';

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
  Snackbar,
  IconButton,
  Paper,
  Alert,
  Typography,
  FormControl,
  Tab,
  Tabs,
  Select,
  MenuItem,Stack
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from 'prop-types';

import VariablesView from './VariablesView';
import DisplayArrayProperty from './DisplayArrayProperty';
import TraitInstanceAddMulti from './TraitInstanceAddMulti';

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

export default function FileNew(props) {
  const { runRequest, newFileOpen, onCreateSuccess, parentId, token, showBorder } = props;

  const FormData = require('form-data');
  const [value, setValue] = React.useState(0);
  
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedFileName, setSelectedFileName] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [fileName, setFileName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [newDocType, setNewDocType] = React.useState('cms_file');
  const [savingOperation, setSavingOperation] = React.useState(false);

  const [traits, setTraits] = React.useState([]);

  const [extraProps, setExtraProps] = React.useState([]);
  const [repProps, setRepProps] = React.useState([]);

  const [blobId, setBlobId] = React.useState('');
  const [typeList, setTypeList] = React.useState([]);

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState("");
  const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");

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

  const selectFile = (event) => {
    
    //add code for multi selection
		let curSelectedFile = event.target.files[0];
    //keep the array of all files
    setSelectedFiles(Array.from(event.target.files));

    //set the first element from the array
		setSelectedFile(curSelectedFile);
		setSelectedFileName(curSelectedFile.name);
    
    //set a default name
    setFileName(curSelectedFile.name ?? '');
	}

  
  const handleClose = () => {
    onCreateSuccess(false);
  };

  const handleSnackBarClose = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  }

  const handleUpload = () => {
    addActiveId('newButton');
    if (!savingOperation) {
      setSelectedIndex(0);
      setSavingOperation(true);
    }

    const formData = new FormData();
		formData.append(
			'file',
			selectedFile,
			selectedFile.name,
		);

    let req = { 
      method: 'post', 
      data: formData,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', "Content-Type": "multipart/form-data" } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.entries && res.data.entries[0].blobId) {
        // setSnackBarMessage(`Success - uploaded file to: ${res.data.entries[0].blobId}`);
        // setSnackBarSeverity('success');
        // setShowSnackBar(true);

        setBlobId(res.data.entries[0].blobId);

      }
      removeActiveId('newButton');

    }, '', []);
   

  };

  const replaceStrVal = (inValue) => {
    if (typeof inValue === 'string') {
      let outValue = inValue.replace(/\${name}/g, selectedFileName);
      outValue = outValue.replace(/\${index}/g, selectedIndex.toString());
      outValue = outValue.replace(/\${randstr}/g, Date.now().toString(36));
      return outValue;
    } else {
      return inValue;
    }
    
  }

  const handleCreate = () => {
    addActiveId('blobId');

    let renditions = [];
    renditions.push({name: selectedFileName, blob_id: blobId, rendition_type: "primary"});
    renditions.push({name: "Brava rendition", mime_type: "application/vnd.blazon+json", rendition_type: "secondary"});
    let data = {
      name: replaceStrVal(fileName),
      description: replaceStrVal(description),
      version_label: ["first"],
      parent_folder_id: parentId,
      renditions:renditions
    };
    let properties = {};
    if (newDocType!='cms_file') {
      //add the custom fields
      for (let i=0; i<extraProps.length; i++) {
        properties[extraProps[i].name] = (extraProps[i].type=='double' || extraProps[i].type=='integer' || extraProps[i].type=='long') ? Number(extraProps[i].value) : ((extraProps[i].type=='date' && extraProps[i].value && dayjs(extraProps[i].value).isValid()) ? dayjs(extraProps[i].value).toISOString() : replaceStrVal(extraProps[i].value));
      }
      //add the repeating attributes
      for (let i=0; i<repProps.length; i++) {
        properties[repProps[i].name] = repProps[i].values;
      }
      data.properties = properties;
    }

    //add the traits
    let traitsProps = {}
    for (let i=0; i<traits.length; i++) {
      
      if (traits[i].name) {
        if (!traitsProps[traits[i].definition]) {
          traitsProps[traits[i].definition] = {};
        }
        if (!traitsProps[traits[i].definition][traits[i].name]) {
          traitsProps[traits[i].definition][traits[i].name] = {};
        }
        traitsProps[traits[i].definition][traits[i].name] = traits[i].properties;
      }
    }
    
    if (traits.length>0) {
      data.traits = traitsProps;
    }

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/${newDocType}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {

        setBlobId('');

        let curArr = [...selectedFiles];
        let curIxd = selectedIndex;
        if (curArr.length>1) {
          //if there are other documents in the queue, proceed to the next one
          curArr.splice(0,1);
          setSelectedFiles(curArr);
          setSelectedFile(curArr[0]);
		      setSelectedFileName(curArr[0].name);
          setSelectedIndex(curIxd + 1);
          

        } else {
          //else, exit dialog
          setSelectedFiles([]);
          setSelectedIndex(0);
          setSavingOperation(false);
          onCreateSuccess(true);
        }
        

        
      } else {
        //something went wrong
        setSavingOperation(false);
      }
      removeActiveId('blobId');

    }, '', []);
   

  };

  const getTypes = () => {
    addActiveId('drpType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions?category=file&include-total=true&page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTypeList(res.data._embedded.collection);
        
      } 
      removeActiveId('drpType');

    }, '', []);
   

  };

  const getAttributes = () => {
    if (newDocType=='cms_file') return;
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${newDocType}/attributes-all`,  
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        let outProps = [];
        let repeatingProps = [];
        for (let i=0; i<res.data._embedded.collection.length; i++) {
          if (!res.data._embedded.collection[i].system && !res.data._embedded.collection[i].internal) {
              if (!res.data._embedded.collection[i].repeating) {
              outProps.push(
                {name: res.data._embedded.collection[i].name, 
                  displayName: res.data._embedded.collection[i].display_name, 
                  type: res.data._embedded.collection[i].data_type, 
                  value: getDefaultValue(res.data._embedded.collection[i].data_type) })
            } else {
              repeatingProps.push({name: res.data._embedded.collection[i].name, displayName: res.data._embedded.collection[i].display_name, type: res.data._embedded.collection[i].data_type, values: []});
            }
          }
          
          
        }
        setExtraProps(outProps);
        setRepProps(repeatingProps);
        removeActiveId('attVals');
        //get the required traits also
        getRequiredTraits();
        
      }

    }, '', []);
   

  };


  const getRequiredTraits = () => {
    if (newDocType=='cms_file') return;
    addActiveId('traitTab');


    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${newDocType}/required-traits`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        let outProps = [];
        
        for (let i=0; i<res.data._embedded.collection.length; i++) {
            outProps.push(
              {name: res.data._embedded.collection[i].instance_name, 
              noDelete: true, 
              definition: res.data._embedded.collection[i].trait_name,
              properties: {}})
        }
        setTraits(outProps);

        
      }
      removeActiveId('traitTab');

    }, '', []);
   

  };

  const setRepVals = (index, array) => {

    let updatedValue = {name: repProps[index].name, type: repProps[index].type, displayName: repProps[index].displayName , values:array};

    let data = [...repProps];

    data.splice(index,1, updatedValue)
    setRepProps(data);

  }

  const getDefaultValue = (dataType) => {
    switch (dataType) {
      case 'string':
        return '';
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'date':
        return null;
      default:
        return '';
    }
  }
 

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newFileOpen) {
      setSelectedFile(null);
      setSelectedFiles([]);
      setSelectedIndex(0);
      setSelectedFileName('');
      setFileName('');
      setDescription('');
      setBlobId('');
      setActiveId('');
      setExtraProps([]);
      setRepProps([]);
      setNewDocType('cms_file');
      setTraits([]);
      setValue(0);
      getTypes();
      setSavingOperation(false);
    }
    

  }, [newFileOpen]);

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (blobId) {
      handleCreate();
    }
  }, [blobId]);

  useEffect(() => {
    if (savingOperation && selectedFileName!=='') {
      handleUpload();
    }
  }, [selectedFileName]);

  useEffect(() => {
    if (newDocType!='cms_file') {
      getAttributes();
    }
  }, [newDocType]);



  return (
    
      <Dialog open={newFileOpen} onClose={() => {}} maxWidth={'90vw'} fullWidth >
        <DialogTitle>Create document</DialogTitle>
        <DialogContent className="add-document" sx={{
          height: '70vh',
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
          <Stack direction={'row'} spacing={2}>
            <div>
              <div className="inline"> 
                
                <label htmlFor="files">
                  <Button component="span">Select files...</Button>
                </label>
                <input id="files" type="file" accept="*" className="file-input" onChange={selectFile} multiple={true} />
              </div>
              {selectedFiles.length===0 && <Typography variant="subtitle1" gutterBottom>
                <Box
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    p: 0,
                    m: 0,
                    fontStyle: 'italic',
                    color: 'red',
                    width: '15vw' 
                    }}
                >
                  {'No document selected yet'}
                </Box>
              </Typography>}
              {selectedFiles.map((file, index) => (
                <Typography variant="subtitle1" gutterBottom key={'selFile' + index}>
                  <Box
                      sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      p: 0,
                      m: 0,
                      fontStyle: 'italic',
                      color: 'green',
                      width: '15vw'
                      }}
                  >
                    {file.name}
                  </Box>
                </Typography>
                
              ))}
              
            </div>
            <div>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '75vw' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="Attributes" {...a11yProps(0)} />
                  <Tab label="Traits" {...a11yProps(1)} sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='traitTab'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}/>
                </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Name"
                  type="name"
                  fullWidth
                  required
                  variant="standard" 
                  value={fileName} 
                  onChange={e => {setFileName(e.target.value)}}
                />
                <TextField
                  margin="dense"
                  id="description"
                  label="Description"
                  type="description"
                  fullWidth
                  variant="standard" 
                  value={description} 
                  onChange={e => {setDescription(e.target.value)}}
                />
                <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='drpType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <FormControl variant="standard">
                      <Select
                      id="documentType"
                      value={newDocType}
                      onChange={(event) => {setNewDocType(event.target.value); setExtraProps([]); setRepProps([]);}} 

                    >
                      {typeList.map((item) => (
                        <MenuItem key={item.id} value={item.system_name}>{item.display_name}</MenuItem>
                      ))}
                      
                    </Select>
                  </FormControl>
                </Box>
                {newDocType!='' && newDocType!='cms_file' && <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <Stack direction="column" spacing={2}>
                    {extraProps.length>0 &&  
                      <Paper elevation={3} sx={{p:2}}>
                        <VariablesView inputFields={extraProps} setInputFields={(props) => {setExtraProps(props);}} canAdd={false} canEdit={false} canRemove={true} showDisplayName={true}/>
                      </Paper>}
                    {repProps.length>0 && <Paper elevation={3} sx={{p:2}}>
                    {repProps.map((prop, index) => (
                      <DisplayArrayProperty arrProperty={prop.values} isEdit={true} title={prop.displayName ?? prop.name} propType={prop.type} setArrProperty={(arr) => {setRepVals(index, arr)}} key={prop.name}/>
                    ))}</Paper>}
                  </Stack>  
                </Box>}
                <Typography variant="caption" gutterBottom>{`* On Name, Description and single String attributes you can use placeholders like \$\{name\} - for file name, \$\{index\} - for 0 based file index and \$\{randstr\} for a random string`}</Typography>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <TraitInstanceAddMulti 
                  runRequest={runRequest} 
                  newOpen={true} 
                  pushTraitArray={(traitArray) => setTraits(traitArray)} 
                  token = {token} 
                  showBorder = {showBorder}
                  inTraitArray={traits}/>
              </TabPanel>
              
              
            </div>
          </Stack>
            
          
          {blobId && <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='blobId'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                wordWrap: 'break-word'
                }}>
              Uploaded blob id: {blobId ?? ''}
            </Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{
            borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
            borderColor: 'red',
            borderWidth: 'thin'}}>
              <Button onClick={handleUpload} disabled={!selectedFileName || savingOperation}>Create</Button>
          </Box>
          
        </DialogActions>
        <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={showSnackBar}
              autoHideDuration={5000}
              onClose={handleSnackBarClose}
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackBarClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
          >
            <Alert onClose={handleSnackBarClose} severity={snackBarSeverity}>
              {snackBarMessage}
            </Alert>
          </Snackbar>
      </Dialog>
    

    
  );
}
