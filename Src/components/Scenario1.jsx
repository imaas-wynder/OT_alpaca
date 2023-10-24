import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

import { useTheme } from '@mui/material/styles';


// MUI components
import { Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton,
  Popover,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Paper,
  Tooltip,
  Divider
} from '@mui/material';

import { CSSTransition, SwitchTransition, Transition, TransitionGroup } from 'react-transition-group';

import { visuallyHidden } from '@mui/utils';

import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InfoIcon from '@mui/icons-material/Info';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import HistoryIcon from '@mui/icons-material/History';

import CustomTablePagination from './CustomTablePagination';
import FolderNew from './FolderNew';
import ObjectProperties from './ObjectProperties';
import FileNew from './FileNew';

import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CustomDocFilter from './CustomDocFilter';
import FolderPaths from './FolderPaths';
import TraitInstanceNew from './TraitInstanceNew';
import SelectRoot from './SelectRoot';
import HistoricDetails from './HistoricDetails';
import ActionsComponent from './ActionsComponent';

const headCells = [
  {
    id: 'category',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Cat',
    onSelect: true,
  },
  {
    id: 'name',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Object name',
    onSelect: true,
  },
  {
    id: 'type',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Type',
    onSelect: true,
  },
  
  {
    id: 'create_time',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Created on',
    onSelect: false,
  },
  {
    id: 'update_time',
    sorting: true,
    numeric: false,
    disablePadding: false,
    label: 'Updated on',
    onSelect: false,
  }
];

const transitions = {
  entering: {
    opacity: 1,
    display: 'block',
    maxWidth: '0',
  },
  entered: {
    opacity: 1,
    display: 'block',
    maxWidth: '700px'
  },
  exiting: {
    opacity: 1,
    display: 'block',
    maxWidth: 0,
  },
  exited: {
    opacity: 1,
    display: 'none',
    maxWidth: 0
  }
};

const Butt = ({ row, runRequest, token, userName, showBorder, isSelect, inCategory, curFolder, outSelectedObject, handleRefreshList, setDisplay, isDialogDisplayed, transitionState }) => {
  const theme = useTheme();

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      //console.log(`But component loaded for row ${row.id}`);
      
        
    },[]
    );


  return (
      
        <Stack direction={'row'} 
          sx={{backgroundColor: '#ffffff',
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            borderTopLeftRadius: theme.spacing(2),
            borderBottomLeftRadius: theme.spacing(2),
            borderColor: '#f1f1f1',
            borderStyle: 'solid',
            borderWidth: 'thin',
            boxShadow: 'inset 1px 1px 3px #999',
            position: "absolute",
            top: "50%",
            left: "90%",
            transform: "translate(0%, -50%)",
            opacity: 1,
            display: "none",
            transition: 'all .7s',
            overflow: 'hidden',
            ...transitions[transitionState]
            
          }}
          onClick={(e) => {e.stopPropagation(); }}>

          <ActionsComponent 
            runRequest={runRequest}
            token={token}
            userName={userName}
            showBorder={showBorder}
            isSelect={isSelect}
            inCategory={inCategory}
            inObject={row}
            inCurFolderId={curFolder.id}
            outCopiedId={() => { }}
            outSelectedObject={outSelectedObject}
            shouldRefresh={handleRefreshList}
            isActions={true} 
            inAction = { '' }
            inActionId = {''} 
            inCompact = {false}
            outCloseAction = {(result) => {setDisplay(''); isDialogDisplayed(false);}}
            isDialogDisplayed = {isDialogDisplayed}
          />
          
        </Stack>
      
  );
};


export default function Scenario1(props) {
  const { runRequest, token, userName, showBorder, selectObject, isSelect, inCategory, currentFolder, inFolder, limitUp, inUrlId, inUrlAction, inUrlActionId, urlLoaded, setUrlLoaded } = props;
 
  
  const [display, setDisplay] = useState("notdisplayed");
  const [dialogDisplayed, setDialogDisplayed] = useState(false);
  
  const [curFolder, setCurFolder] = useState({});
  const [curFolderIdArray, setCurFolderIdArray] = useState([]);
  const [activeId, setActiveId] = useState('');

  const [copiedId, setCopiedId] = useState({});

  const [rootFolder, setRootFolder] = useState('');
  const [rootOpen, setRootOpen] = useState(false);

  const [newOpen, setNewOpen] = useState(false);
  const [isObject, setIsObject] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [propsSave, setPropsSave] = useState(false);
  const [canUpdate, setCanUpdate] = useState(true);

  const [newFileOpen, setNewFileOpen] = useState(false);

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  const [rowCount, setRowCount] = React.useState(0);
  const [curPage, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortCol, setSortCol] = React.useState('name');
  const [sortOrd, setSortOrd] = React.useState('asc');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [filterStr, setFilterStr] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);

  const [curCategory, setCurCategory] = useState('');
  const [curType, setCurType] = useState('');
  const [curLatestVersion, setCurLatestVersion] = useState(true);

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState("");
  const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");

  const handleChangePage = (newPage, newRowsPerPage) => {
    setPage(newPage);
    setRowsPerPage(newRowsPerPage);
    //console.log('Changed page to: ' + newPage);
    handleRefreshList()
  };

  const createSortHandler = (property) => {
    const isAsc = sortCol === property && sortOrd === 'asc';
    setSortOrd(isAsc ? 'desc' : 'asc');
    setSortCol(property);
    handleRefreshList();
  };

  const handleSnackBarClose = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  }

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  //for icons on row
  
  const showButton = (e, row) => {
    e.preventDefault();
    if (!dialogDisplayed) {
      setDialogDisplayed(false);
    }
    setDisplay(row.id);
  };

  const hideButton = (e, row) => {
    if (!dialogDisplayed) {
      e.preventDefault();
      setDisplay('');
    }
  };

  const getList = (category, type, parentId, page, size, inSortCol, inSortOrd, componentId) => {
    //this call is to get all category and type objects that have a certain parent_id - it will not show the objects linke to a folder (linked_parent_ids)
    //console.log(`In parameters: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    addActiveId(componentId);

    page = page + 1;
    if (!size) size=10;
    
    //console.log(`Before call: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${category}/${type}?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}&filter=latest eq 'true' and parent_folder_id='${parentId}'${filterStr}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
        
      }
      setRowCount(res.data.total ?? 0);
      setUpdatedList(false);
      removeActiveId(componentId);
    }, '', []);
  }

  const getFolderContents = (category, type, parentId, page, size, inSortCol, inSortOrd, componentId, latestVersion) => {
    //this call will get all the items in a folder, including linked items
    //console.log(`In parameters: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    addActiveId(componentId);
    let outFilter = '';
    
    if (inCategory==='folder') {
      //input category folder overrides other filtering
      outFilter+=`${outFilter?` and `:``}category eq '${inCategory}'`
    } else {
      if (category) {outFilter+=`${outFilter?` and `:``}category eq '${category}'`};
    }
    if (type) {outFilter+=`${outFilter?` and `:``}type like '${type}%25'`};
    if (filterStr) {outFilter+=(outFilter?` and `:``) + filterStr};
    if (latestVersion) {outFilter+= `${outFilter?` and `:``}latest eq 'true'`};
    if (latestVersion===false) {outFilter+= `${outFilter?` and `:``}(latest eq 'false' or latest eq 'true')`};
    outFilter = outFilter ? '&filter=' + outFilter : '';

    page = page + 1;
    if (!size) size=10;
    
    //console.log(`Before call: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${curFolder.category}/${curFolder.type}/${parentId}/${curFolder.category==='folder' ? 'items' : 'case-node-instance-children'}?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}${outFilter}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        
        if (urlLoaded===false && inUrlId) {
          //if url loading, we need to check if we have the right object
          let result = res.data._embedded.collection.find((obj) => {return obj.id===inUrlId});
          if (result && result.id) {
            //it is found - don't do anything as the ActionsComponent will select it
            if (curPage!=page-1) setPage(page-1);
            setRows(res.data._embedded.collection);
            setRowCount(res.data?.total ?? 0);
            setUpdatedList(false);
          } else {
            //not found, are there more pages?
            let totalRecs = res.data?.total ?? 0;
            if ((page * size) >= totalRecs) {
              //could not be fund
              console.log('Could not find the URL object in collection');
              setRows(res.data._embedded.collection);
              setRowCount(res.data?.total ?? 0);
              setUpdatedList(false);
            } else {
              //next page
              getFolderContents(curCategory, curType, curFolder.id, page, rowsPerPage, sortCol, sortOrd, 'contentsList', curLatestVersion);
            }
          }
        } else {
          setRows(res.data._embedded.collection);
          setRowCount(res.data?.total ?? 0);
          setUpdatedList(false);
        }
        

        
      } else {
        setRows([]);
        setRowCount(0);
        setUpdatedList(false);
      }
      
      
      removeActiveId(componentId);
    }, '', []);
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id==row.id)?selectedRow:row);
      if (inCategory===row.category) {
        selectObject((selectedRow.id==row.id)?selectedRow:row);
      }
    } else {
      setSelectedRow((selectedRow.id==row.id)?{}:row);
      if (inCategory===row.category) {
        selectObject((selectedRow.id==row.id)?{}:row);
      }
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
  

  const getRootFolderId = (componentId, inObjId, inObjType) => {
    
    setCurFolderIdArray([]);
    setRows([]);
    let req = {};

    if (inObjType==='unknown') {
      addActiveId(componentId + '_unknown');
      //get the parent type first
      req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/any/cms_any/${inObjId}`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        //console.log('Reached output function')
        if (res.data && res.data.id) {
         getRootFolderId(componentId, inObjId, res.data.category);

        }       
        removeActiveId(componentId + '_unknown');
      }, '', []);

    } else {
      addActiveId(componentId);
      req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObjType==='case' ? 'case' : 'folder'}/${inObjType==='case' ? 'cms_case' : 'cms_folder'}/${(inObjId) ?? rootFolder}`,  
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        //console.log('Reached output function')
        if (res.data && res.data.id) {
          setCurFolder(res.data);
          if (isSelect) currentFolder(res.data);

          let arrFld = [];
          let curFld = [];
          if (res.data.ancestor_ids && res.data.ancestor_ids[0]) {
            curFld = [...res.data.ancestor_ids[0]];
          }
          curFld.push(res.data.id);
          arrFld.push(curFld);
          //console.log(arrFld);
          setCurFolderIdArray(arrFld);

        }
        setPage(0);
        removeActiveId(componentId);
        handleRefreshList();
      }, '', []);
    }
    
   
  }


  const handleClipboard = (action, inObj, folderid) => {
    addActiveId('butClipboard' + action);

    let req;
    let actName;

    switch (action) {
      case 'move':
        //update parent_id
        req = { 
          method: 'put', 
          data: {id: folderid},
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/parent`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
        };
        actName='Moved';
        break;
      case 'copy':
        //copy object
        req = { 
          method: 'post', 
          data: {id: folderid},
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/copy${inObj.category==='folder'?'?recursive=true':''}`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
        };
        actName='Copied';
        break;
      case 'link':
        //add linked_id
        req = { 
          method: 'post', 
          data: {href: `/instances/folder/cms_folder/${folderid}`},
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/linked-parents`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
        };
        actName='Linked';
        break;
      case 'unlink':
        //remove linked_id
        req = { 
          method: 'delete', 
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/linked-parents/${folderid}`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
        };
        actName='Unlinked';
        break;
      default:
        break;
    }
    
    
    
    runRequest(req, (res) => {
      
      if (res.status && (res.status==200 || res.status==201 || res.status==204)) {
        if (action=='move') {
          setCopiedId({});
        }
        handleRefreshList();
      } 
      removeActiveId('butClipboard' + action);

    }, `${actName} ${inObj.name} succesfully`, []);
   

  };


  const handleCopy = (object) => {
    if (isSelect) return;
    setCopiedId(object);
    if (object?.name) {
      setSnackBarMessage(`Added ${object.name} to clipboard. Navigate to another folder to copy/move/link it.`);
      setSnackBarSeverity('success');
      setShowSnackBar(true);
    }
  }

  const handleCloseNewFolder = (status) => {
    if (status) {
      handleRefreshList();
    }
    setNewOpen(false);
  }

  const handleGetObject = (componentId, inObjId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/any/cms_any/${inObjId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        if (res.data.category==='folder') {
          //show the folder contents
          setRootFolder(res.data.id);
          setUrlLoaded(true);
        } else {
          //navigate to parent folder
          if (res.data.parent_folder_id) {
            setRootFolder(res.data.parent_folder_id);
          } else {
            setRootFolder('subscription-root');
          }
          //select object - not here as handleRefreshList will empty it
          //setSelectedRow(res.data);
          if (inUrlAction) {
            //set the action
            //we neet to setUrlLoaded(true); on the items loaded function
          } else {
            setUrlLoaded(true);
          }
        }
        
        
      } else {
        console.log('Did not find the object');
        setRootFolder('subscription-root');
        setUrlLoaded(true);
      }
      
      removeActiveId(componentId);
      
    }, '', []);
  }

  

  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    //setRows([]);
    setSelectedRow({});
    setDisplay('');
    selectObject({});
    setUpdatedList(true);
  }

  const handleNavigate = (item) => {
    handleSelectRow(item, true);
    //if it's a folder, open it, if it's a file view it, if it's an object view the metadata
    switch (item.category) { 
      
      case 'case':
        getRootFolderId('divResults', item.id, 'case');
        break;
      case 'folder':
        getRootFolderId('divResults', item.id, 'folder');
        break;
      case 'file':
        if (isSelect) return;
        setPropsSave(false);
        setPropsOpen(true);
        break;
      case 'object':
        if (isSelect) return;
        setPropsSave(false);
        setPropsOpen(true);
        break;
      default:
        break;
    }
  }

  const onFilterChange = (inFilterStr, inCategory, inType, inLatestVersion) => {
    setFilterStr(inFilterStr); 
    setCurCategory(inCategory);
    setCurType(inType);
    setCurLatestVersion((inLatestVersion===true));
    setPage(0); 
    handleRefreshList()
  }

  const onSelectObject = (object, type) => {
    switch (type) {
      case 'object':
        setSelectedRow(object); 
        selectObject(object); 
        setPropsSave(false);
        setPropsOpen(true);
        break;
      case 'select':
        setSelectedRow(object); 
        selectObject(object, true); 
        break;
      case 'url':
        setSelectedRow(object); 
        setUrlLoaded(true)
        break;
      default:
        getRootFolderId('divResults', object, 'unknown');
        break;
    }
  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      if (inUrlId && urlLoaded===false) {
        console.log('Need to load the object: ' + inUrlId);
        handleGetObject('inUrlObject', inUrlId);
      } else {
        //console.log('Scenario1 loaded. inFolder: ' + inFolder);
        if (inFolder) {
          setRootFolder(inFolder);
        } else {
          setRootFolder('subscription-root');
        }
      }
      
    },[]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      //console.log('inFolder changed to ' + inFolder);
      
        
    },[inFolder]
    );


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        
    },[rows]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        
    },[activeId]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      //console.log('Root folder changed to: ' + rootFolder);
        if (rootFolder!=='') {
          getRootFolderId('divResults', rootFolder, 'folder');
        }
    },[rootFolder]
  );

  
  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList && curFolder.id) {
        //get folders first
        //console.log ('Getting folders')
        //getList('any', 'cms_any', curFolder.id, curPage, rowsPerPage, sortCol, sortOrd, 'contentsList');
        getFolderContents(curCategory, curType, curFolder.id, curPage, rowsPerPage, sortCol, sortOrd, 'contentsList', curLatestVersion);
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            {!isSelect ? <Stack direction="row" spacing={0} justifyContent="space-between" alignItems="center">
                <Typography 
                variant="button" 
                display="block" 
                gutterBottom 
                sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='divResults'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin',
                  }}>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                  <Box>Current folder: </Box>
               
                    {!(limitUp) && <IconButton size="small" variant="outlined" color="primary" title="Select root" onClick={() => {setRootOpen(true)}}>
                      <MoreHorizIcon />
                    </IconButton>}
                    {curFolderIdArray.length>0 && <FolderPaths runRequest={runRequest} token={token} showBorder={showBorder} inFolderIdArray={curFolderIdArray} parentIdArray={[curFolder.id]} clickedFolder={(folder, type) => {if (!limitUp) getRootFolderId('divResults', folder, type);}}/>}
                    {!(limitUp) && <IconButton size="small" variant="outlined" color="primary" title="View info" onClick={() => {setSelectedRow(curFolder); selectObject(curFolder); if (!isSelect) {setPropsSave(false); setPropsOpen(true);} }}>
                      <InfoIcon />
                    </IconButton>}
                  
                  </Stack>
              </Typography>
              <Stack direction="row" spacing={0}>
                {copiedId.id && 
                  <IconButton size="small" variant="outlined" color="secondary" title={'Clear ' + copiedId.name} onClick={() => {  setCopiedId({}) }}>
                    <ContentPasteOffIcon />
                  </IconButton>}
                {copiedId.id && (copiedId.parent_folder_id!=curFolder.id) && 
                  <React.Fragment> 
                    <Box sx={{
                      borderStyle: (activeId.split(',').find((obj) => {return obj==`butClipboard${'move'}`}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin'}}>
                      <IconButton size="small" variant="outlined" color="secondary" title={'Move ' + copiedId.name + ' here'} onClick={() => {  handleClipboard('move', copiedId, curFolder.id) }}>
                        <ContentPasteGoIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{
                      borderStyle: (activeId.split(',').find((obj) => {return obj==`butClipboard${'copy'}`}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin'}}>
                      <IconButton size="small" variant="outlined" color="secondary" title={'Copy ' + copiedId.name + ' here'} onClick={() => {  handleClipboard('copy', copiedId, curFolder.id) }}>
                        <AssignmentIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{
                      borderStyle: (activeId.split(',').find((obj) => {return obj==`butClipboard${'link'}`}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin'}}>
                      <IconButton size="small" variant="outlined" color="secondary" title={'Link ' + copiedId.name + ' here'} onClick={() => {  handleClipboard('link', copiedId, curFolder.id) }}>
                        <AddLinkIcon />
                      </IconButton>
                    </Box>
                  </React.Fragment>
                  }
              </Stack>
            </Stack> : 
            <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='divResults'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                }}>
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                <Box>Current folder: </Box>
                  {curFolderIdArray.length>0 && <FolderPaths runRequest={runRequest} token={token} showBorder={showBorder} inFolderIdArray={curFolderIdArray} parentIdArray={[curFolder.id]} clickedFolder={(folder, type) => {if (!limitUp) getRootFolderId('divResults', folder, type);}}/>}
                </Stack>
            </Typography>}
            {showFilter && <CustomDocFilter onFilterChange={onFilterChange} onFilterClose={() => setShowFilter(false)} inCategory={inCategory}/>}
            <Box height={showFilter?(isSelect?"50vh" :"65vh"):(isSelect?"60vh":"70vh")} 
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
                      <TableHead >
                        <TableRow sx={{backgroundColor:'#e1e1e1'}}>
                          
                          {headCells.map((headCell) => {
                            if ((headCell.onSelect && isSelect) || !isSelect) {
                              return (
                              <TableCell 
                                sx={{fontWeight:'bold', backgroundColor:'#e1e1e1'}}
                                key={headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                                sortDirection={sortCol === headCell.id ? sortOrd : false}
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
                            )
                          }
                        }
                          
                          )}
                          <TableCell align="left" sx={{fontWeight:'bold', backgroundColor:'#e1e1e1'}}>
                            <Stack direction={'row'} sx={{
                              borderStyle: (activeId.split(',').find((obj) => {return obj=='divResults'}) && showBorder)?'solid':'none', 
                              borderColor: 'red',
                              borderWidth: 'thin',
                              }}>
                                {showFilter?(<IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { setShowFilter(false); setFilterStr(''); setPage(0); handleRefreshList() }}>
                                    <FilterAltOffIcon />
                                  </IconButton>):(
                                  <IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { setShowFilter(true) }}>
                                    <FilterAltIcon />
                                  </IconButton>
                                )}
                                <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                                    <RefreshIcon />
                                </IconButton>
                                <Divider orientation="vertical" flexItem />
                                {!isSelect && <IconButton size="small" variant="outlined" color="success" title="Add new document" onClick={() => {setNewFileOpen(true)}}>
                                  <PostAddIcon />
                                </IconButton>}
                                {!isSelect && <IconButton size="small" variant="outlined" color="success" title="Add new folder" onClick={() => {setIsObject(false); setNewOpen(true)}}>
                                  <CreateNewFolderIcon />
                                </IconButton>}
                                {!isSelect && <IconButton size="small" variant="outlined" color="success" title="Add new object" onClick={() => {setIsObject(true); setNewOpen(true)}}>
                                  <AddIcon />
                                </IconButton>}
                                
                                {curFolder.parent_folder_id && <Divider orientation="vertical" flexItem />}
                                {curFolder.parent_folder_id && (!limitUp || curFolder.id!==inFolder) && <IconButton size="small" variant="outlined" color="primary" title="Up one folder" onClick={() => {  getRootFolderId('divResults', (curFolder.parent_folder_id ?? ''), 'unknown'); }}>
                                  <DriveFolderUploadIcon />
                                </IconButton>}
                            </Stack>
                            
                            
                             
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow 
                            key={row.id} 
                            hover 
                            selected={selectedRow.id==row.id}
                          >
                            <Tooltip title={`Copy ${row.category} to clipboard`} followCursor>
                              <TableCell align="left" onClick={() => {handleCopy(row)}}>{row.category=='file'?<InsertDriveFileIcon sx={{color: "#808080"}}/>:(row.category=='folder'?<FolderIcon sx={{color: "#f8d775"}}/>:(row.category=='case'?<BusinessCenterIcon sx={{color: "#cc6611"}}/>:<EmojiObjectsIcon sx={{color: "#C3B1E1"}}/>))}</TableCell>
                            </Tooltip>
                            <TableCell 
                              align="left" 
                              onClick={() => {handleNavigate(row)}} 
                              sx={{ cursor: 'pointer', position: 'relative' }}
                              onMouseEnter={(e) => showButton(e, row)}
                              onMouseLeave={(e) => hideButton(e, row)}
                            >
                            
                              {row.name + (row.version_no?` (v. ${row.version_no})`:``)}

                              {<Transition in={display===row.id} timeout={0}>
                                {state => (
                                  <Butt 
                                  display={display===row.id ? "displayed" : "notdisplayed"} 
                                  row={row}
                                  runRequest={runRequest} 
                                  token={token} 
                                  userName={userName} 
                                  showBorder={showBorder} 
                                  isSelect={isSelect} 
                                  inCategory={inCategory} 
                                  curFolder={curFolder} 
                                  outSelectedObject={onSelectObject} 
                                  handleRefreshList={handleRefreshList} 
                                  setDisplay={setDisplay}
                                  isDialogDisplayed={setDialogDisplayed} 
                                  transitionState={state}
                                />
                              )}
                                
                              </Transition>}
                              
                            </TableCell>
                            <Tooltip title={row.type} followCursor>
                              <TableCell align="left" 
                              onClick={() => {handleSelectRow(row, false)}} 
                              sx={{
                                
                                maxWidth: 150, 
                                overflow: "hidden", 
                                textOverflow: "ellipsis"
                                }}>{row.type}</TableCell>
                            </Tooltip>
                            {!isSelect && <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>
                              {getDateValue(row.create_time)}
                            </TableCell>}
                            {!isSelect && <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{getDateValue(row.update_time)}</TableCell>}
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true); setDisplay('');}}>
                              <ActionsComponent 
                                runRequest={runRequest}
                                token={token}
                                userName={userName} 
                                showBorder={showBorder}
                                isSelect={isSelect}
                                inCategory={inCategory}
                                inObject={row}
                                inCurFolderId={curFolder.id}
                                outCopiedId={(object) => {handleCopy(object)}}
                                outSelectedObject={onSelectObject}
                                shouldRefresh={handleRefreshList}
                                isActions={true} 
                                inAction = {(inUrlAction && (urlLoaded===false) && (inUrlId===row.id)) ? inUrlAction : '' }
                                inActionId = {inUrlActionId} 
                                inCompact = {true}
                                outCloseAction = {() => {}}
                                isDialogDisplayed={() => {}}
                              />
                            </TableCell>
                            
                          </TableRow>
                        ))}
                      </TableBody>}
                      <CustomTablePagination
                        page={curPage} 
                        rowsPerPage={rowsPerPage} 
                        count={rowCount}
                        colSpan={8} 
                        onPaginationChange={handleChangePage}
                      />
                    </Table>
                  </TableContainer>}
                </Box>
                <Dialog open={propsOpen} onClose={() => setPropsOpen(false)} maxWidth={'xl'} fullWidth>
                  <DialogTitle>Properties - {selectedRow.name} {selectedRow.category==='file' ? ` (v. ${selectedRow.version_no})` : ''}</DialogTitle>
                  <DialogContent sx={{
                    maxHeight: '70vh',
                    mb: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    overflowY: "auto",
                    overflowX: "auto",
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
                    <ObjectProperties
                      runRequest = {runRequest} 
                      propsOpen = {propsOpen} 
                      onClose = {(result) => {setPropsOpen(false); if (result) {setPropsSave(false); handleRefreshList();}}} 
                      token = {token} 
                      inObj = {selectedRow} 
                      showBorder = {showBorder} 
                      clickedFolder = {(folder) => {getRootFolderId('divResults', folder, 'folder'); setPropsOpen(false);}} 
                      navigateToObject = {(object) => {setPropsOpen(false); setSelectedRow(object); selectObject(object); setPropsOpen(true);}} 
                      propsSave = {propsSave} 
                      canUpdate = {(value) => setCanUpdate(value)}
                    />
                
              
                  </DialogContent>
                <DialogActions>
                  <Button onClick={() => {setPropsOpen(false); if (selectedRow.category === 'file') handleRefreshList(); }}>Close</Button>
                  <Button disabled={!canUpdate} onClick={() => {setPropsSave(true);}}>Update</Button>
                </DialogActions>
                
              </Dialog>


                
                <FolderNew
                  runRequest = {runRequest} 
                  newOpen = {newOpen} 
                  onCreateSuccess = {handleCloseNewFolder} 
                  token = {token} 
                  parentId = {curFolder.id} 
                  showBorder = {showBorder} 
                  isObject = {isObject}
                />
                
                <FileNew
                  runRequest = {runRequest} 
                  newFileOpen = {newFileOpen} 
                  onCreateSuccess = {(result) => {setNewFileOpen(false); if (result) handleRefreshList();}} 
                  token = {token} 
                  parentId = {curFolder.id}
                  showBorder = {showBorder}
                />
                <SelectRoot
                  runRequest = {runRequest} 
                  selectRootOpen = {rootOpen} 
                  setSelectRootOpen = {(val) => {setRootOpen(val)}} 
                  token = {token} 
                  inRoot = {rootFolder} 
                  showBorder = {showBorder} 
                  setOutRoot = {(outVal) => setRootFolder(outVal)} 
                />
                
                
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={showSnackBar}
              autoHideDuration={3000}
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
        </React.Fragment>
  );
}
