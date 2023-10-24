import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { 
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Paper
} from '@mui/material';

import { visuallyHidden } from '@mui/utils';

import RefreshIcon from '@mui/icons-material/Refresh';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DocumentRenditionNew from './DocumentRenditionNew';
import DeleteRendition from './DeleteRendition';
import DownloadIcon from '@mui/icons-material/Download';
import TextContentDisplay from './TextContentDisplay';
import PreviewIcon from '@mui/icons-material/Preview';
import DocumentView from './DocumentView';
import DocumentNewView from './DocumentNewView';


const headCells = [
  {
    id: 'name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'rendition_type',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Type',
  },
  {
    id: 'mime_type',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Mime Type',
  },
  {
    id: 'content_size',
    sorting: true,
    numeric: true,
    disablePadding: false,
    label: 'Content size',
  }
];




export default function DocumentRenditions(props) {
  const { runRequest, token, showBorder, inObj } = props;

  
  const FormData = require('form-data');

  const [activeId, setActiveId] = useState('');

  const [blobId, setBlobId] = useState('');
  const [rendName, setRendName] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [newViewOpen, setNewViewOpen] = useState(false);
  const [selBlobId, setSelBlobId] = useState('');

  const [jsonValue, setJsonValue] = useState({});

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);

  const [sortCol, setSortCol] = React.useState('renditionType');
  const [sortOrd, setSortOrd] = React.useState('asc');
  const [selectedRow, setSelectedRow] = React.useState({});

  const createSortHandler = (property) => {
    const isAsc = sortCol === property && sortOrd === 'asc';
    setSortOrd(isAsc ? 'desc' : 'asc');
    setSortCol(property);
    handleRefreshList();
  };

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getList = (inSortCol, inSortOrd, componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/contents?items-per-page=100&page=1${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
        
      }
      setUpdatedList(false);
      removeActiveId(componentId);
    }, '', []);
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id==row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id==row.id)?{}:row);
    }
    
  }

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

  const isActiveId = (item) => {
    return activeId.split(',').find((obj) => {return obj==item});
  }
  
  const downloadBlob = (blobId, objName, componentId, isView) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${blobId}/download?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        if (isView) {
          var reader = new FileReader();
          reader.onload = function() {
            try {
              setJsonValue(JSON.parse(reader.result));
            } catch (error) {
              console.log('Not a valid JSON');
              console.log(reader.result);
            }
          }
          reader.readAsText(res.data);
          
        } else {
          // create file link in browser's memory
          const href = URL.createObjectURL(res.data);
                
          // create "a" HTLM element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          link.setAttribute('download', objName); //or any other extension
          document.body.appendChild(link);
          link.click();

          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        }
        
      }
      
      removeActiveId(componentId);
      
    }, '', []);
  }

  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setRows([]);
    setSelectedRow({});

    setUpdatedList(true);
  }

  const handleUpload = (inJson, inName) => {

    const formData = new FormData();
		formData.append(
			'file',
      new Blob([JSON.stringify(inJson, null, 2)], {type: 'application/json'}),
			`${inName}.json`
		);

    let req = { 
      method: 'post', 
      data: formData,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', "Content-Type": "multipart/form-data" } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.entries && res.data.entries[0].blobId) {
        console.log('Uploaded the json file');
        setBlobId(res.data.entries[0].blobId);
        setRendName(inName);
      }

    }, '', []);
   
  };


  const handleCreate = () => {
    addActiveId('blobId');

    let data = {
      name: rendName,
      blob_id: blobId,
      rendition_type: 'viewer_rendition'
    };

    let req = { 
      method: 'post', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/${inObj.type}/${inObj.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        setBlobId('');
        setRendName('');
        setNewViewOpen(false);
        handleRefreshList();
      }
      removeActiveId('blobId');
    }, '', []);
   

  };


  useEffect(() => {
    if (blobId) {
      handleCreate();
    }
  }, [blobId]);


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log(`useEffect with none.`);
        handleRefreshList();
    },[]
    );

  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        //get folders first
        //console.log ('Getting folders')
        getList(sortCol, sortOrd, 'contentsList');
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            
            <Box 
              key="box-left-panel" 
              sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                overflowY: "auto", 
                overflowX: "hidden", 
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
                  },
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='contentsList'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'
                  }}
                  >
                  {<TableContainer component={Paper} sx={{
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
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          
                          {headCells.map((headCell) => (
                            <TableCell
                              key={headCell.id}
                              align={headCell.numeric ? 'right' : 'left'}
                              padding={headCell.disablePadding ? 'none' : 'normal'}
                              sortDirection={sortCol === headCell.id ? sortOrd : false} 
                              sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}} 
                            >
                              {headCell.sorting ? <TableSortLabel
                                active={sortCol === headCell.id}
                                direction={sortCol === headCell.id ? sortOrd : 'asc'}
                                onClick={() => {createSortHandler(headCell.id)}}
                              >
                                {headCell.label}
                                {sortCol === headCell.id ? (
                                  <Box component="span" sx={visuallyHidden}>
                                    {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                  </Box>
                                ) : null}
                              </TableSortLabel> : 
                              headCell.label}
                            </TableCell>
                          ))}
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                                <RefreshIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="success" title="Add new rendition" onClick={() => {setNewOpen(true)}}>
                              <LibraryAddIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="success" title="Add new viewer rendition" onClick={() => {setBlobId(''); setRendName(''); setNewViewOpen(true)}}>
                              <AddPhotoAlternateIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id} hover selected={selectedRow.id==row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.name}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.rendition_type}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.mime_type}</TableCell>
                            <TableCell align="right" onClick={() => {handleSelectRow(row, false)}}>{Number(row.content_size).toLocaleString()}</TableCell>
                            <TableCell align="right" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row-reverse" spacing={0}>
                                <IconButton size="small" variant="outlined" color="error" title="Delete rendition" onClick={() => { setDeleteOpen(true)  }}>
                                  <DisabledByDefaultIcon />
                                </IconButton>
                                <Box sx={{
                                    borderStyle: (activeId.split(',').find((obj) => {return obj=='dwnBlob' + row.id}) && showBorder)?'solid':'none', 
                                    borderColor: 'red',
                                    borderWidth: 'thin'}}>
                                  <IconButton size="small" variant="outlined" color="primary" title="Download rendition" onClick={() => { downloadBlob(row.blob_id, ((row.mime_type=='application/vnd.blazon+json')?(row.name + '.json'):row.name), 'dwnBlob' + row.id, false) }}>
                                    <DownloadIcon />
                                  </IconButton>
                                </Box>
                                {(row.mime_type==='application/vnd.blazon+json')  && 
                                <Box sx={{
                                    borderStyle: (activeId.split(',').find((obj) => {return obj=='viewBlob' + row.id}) && showBorder)?'solid':'none', 
                                    borderColor: 'red',
                                    borderWidth: 'thin'}}>
                                  <IconButton size="small" variant="outlined" color="primary" title="View rendition" onClick={() => { downloadBlob(row.blob_id, ((row.mime_type=='application/vnd.blazon+json')?(row.name + '.json'):row.name), 'viewBlob' + row.id, (row.mime_type==='application/vnd.blazon+json')) }}>
                                    <VisibilityIcon />
                                  </IconButton>
                                </Box>}
                                {(row.mime_type==='application/json' && row.rendition_type==='viewer_rendition') && 
                                <Box >
                                  <IconButton size="small" variant="outlined" color="primary" title="Invoke viewer" onClick={() => { setSelBlobId(row.blob_id); setViewOpen(true); }}>
                                    <PreviewIcon />
                                  </IconButton>
                                </Box>}
                                
                                
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>

                <DocumentRenditionNew
                  runRequest = {runRequest} 
                  newFileOpen = {newOpen} 
                  onCreateSuccess = {(result) => {setNewOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  showBorder = {showBorder} 
                  inObj = {inObj}
                />

                <DeleteRendition
                  runRequest = {runRequest} 
                  deleteOpen = {deleteOpen} 
                  onDeleteSuccess = {(result) => {setDeleteOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  inObj = {inObj} 
                  inRenditionObj = {selectedRow} 
                  showBorder = {showBorder}
                />

                <TextContentDisplay 
                  jsonValue={jsonValue}
                  setJsonValue={setJsonValue} 
                  textValue={''} 
                  setTextValue={()=>{}}
                />

              <Dialog
                open={viewOpen}
                onClose={() => {setViewOpen(false); setSelBlobId('');}}
                aria-labelledby="view-doc"
                aria-describedby="view-doc"
                maxWidth={'90vw'}  
                fullWidth
              >
                
                <DocumentView 
                  runRequest = {runRequest} 
                  docObject={inObj} 
                  inFull={true}  
                  closeAction={() => {setViewOpen(false); setSelBlobId(''); }} 
                  token = {token} 
                  userName = {''} 
                  showBorder={showBorder}
                  inBlobId={selBlobId}
                  inMarkupId={selBlobId}/>
              </Dialog>

              <Dialog
                open={newViewOpen}
                onClose={() => {setNewViewOpen(false); }}
                aria-labelledby="view-doc"
                aria-describedby="view-doc"
                maxWidth={'md'}  
                fullWidth
              >
                
                <DocumentNewView 
                    runRequest = {runRequest} 
                    docObject={inObj} 
                    token = {token} 
                    showBorder={showBorder}
                    outPublicationDone={(publicationJson, renditionName) => { handleUpload(publicationJson, renditionName); }}/>
                
                <DialogActions>
                  <Button onClick={() => {setNewViewOpen(false);}}>Cancel</Button>
                </DialogActions>
              </Dialog>
                
                
        </React.Fragment>
  );
}
