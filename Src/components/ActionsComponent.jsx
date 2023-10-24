import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import { Button,
  Box,
  Divider,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TableCell,
  Tooltip
} from '@mui/material';


import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InfoIcon from '@mui/icons-material/Info';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RecyclingIcon from '@mui/icons-material/Recycling';
import DownloadIcon from '@mui/icons-material/Download';
import PolicyIcon from '@mui/icons-material/Policy';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import VerifiedIcon from '@mui/icons-material/Verified';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TransformIcon from '@mui/icons-material/Transform';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import HistoryIcon from '@mui/icons-material/History';


//components
import ObjectProperties from './ObjectProperties';
import DeleteItem from './DeleteItem';
import DocumentViewHTML from './DocumentViewHTML';
import DocumentView from './DocumentView';
import RiskGuard from './RiskGuard';
import Capture from './Capture';
import SignatureDetails from './SignatureDetails';
import AutomationDialog from './AutomationDialog';
import DocumentIVTransform from './DocumentIVTransform';
import TraitInstanceNew from './TraitInstanceNew';
import HistoricDetails from './HistoricDetails';


const actions = [
  { icon: <DriveFileMoveIcon color="primary" />, name: 'Copy' },
  { icon: <FolderIcon color="primary" />, name: 'Save' },
  { icon: <ContentPasteIcon color="primary" />, name: 'Print' },
  { icon: <EmojiObjectsIcon color="primary" />, name: 'Share' },
];


export default function ActionsComponent(props) {
  const { runRequest, token, userName, showBorder, isSelect, inCategory, inObject, inCurFolderId, outCopiedId, outSelectedObject, shouldRefresh, isActions, inCompact, inAction, inActionId, outCloseAction, isDialogDisplayed } = props;
  
  /**
   * runRequest: function to run the API calls
   * token: current Auth Token
   * userName: the logged in user
   * showBorder: if we should highlight the UI component that is making a call
   * isSelect: is the object list used in a selection dialog?
   * inCategory: if the list is used in a selection dialog, what category of objects are accepted
   * inObject: the object JSON for which the component is displayed
   * inCurFolderId: the Current Folder Id in which we are
   * outCopiedId: function to output the ObjectId for which a user has clicked on the icon
   * outSelectedObject: function to output the selected object id (from the properties dialog). First argument is the object, second is a string either object or id depending on what is the nature of the first arcument
   * shouldRefresh: function to call if any component needs to refresh the current list
   * isActions: if true it returns a fragment object that displays the actions icons, false returns a TableCell wrapped in a ToolTip with the object icon and the Copy action
   * inCompact: if true show a SpeedDial with buttons on left
   * inAction: action to run if set
   * outCloseAction: function that is called every time a dialog is closed (to make the hover component disappear)
   * isDialogDisplayed: function to prevent unloading the component if a dialog is open
   */
  
  const [activeId, setActiveId] = useState('');
  

  const [propsOpen, setPropsOpen] = useState(false);
  const [automationLoaded, setAutomationLoaded] = useState(false);
  const [propsSave, setPropsSave] = useState(false);
  const [canUpdate, setCanUpdate] = useState(true);

  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recursive, setRecursive] = useState(false); 
  const [softDelete, setSoftDelete] = useState(false);

  const [automationOpen, setAutomationOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [rgOpen, setRgOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [cpOpen, setCpOpen] = useState(false);
  const [barOpen, setBarOpen] = useState(false);
  const [transformOpen, setTransformOpen] = useState(false);

  const [blobId, setBlobId] = useState('');
  const [dwnName, setDwnName] = useState('');

  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newTraitOpen, setNewTraitOpen] = useState(false);


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

  const getPrimaryRendition = (componentId, docObject) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${docObject.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.rendition_type=='primary') {
            //call download file
            setBlobId(item.blob_id);
            setDwnName(item.name);
          }
          });
        
      }
      removeActiveId(componentId);
      
    }, '', []);
  }

  const downloadItem = (componentId) => {
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
        // create file link in browser's memory
        const href = URL.createObjectURL(res.data);
              
        // create "a" HTLM element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', dwnName); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        isDialogDisplayed(false);
        outCloseAction(true);
      }
      setBlobId(''); 
      setDwnName('');
      removeActiveId(componentId);
      
    }, '', []);
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
          outCopiedId({});
        }
        shouldRefresh();
      } 
      removeActiveId('butClipboard' + action);

    }, `${actName} ${inObj.name} succesfully`, []);
   

  };


  const handleCopy = (object) => {
    if (isSelect) return;
    outCopiedId(object);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        
        
    },[]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      if (inAction) {
        switch (inAction) {
          case 'view':
            setViewOpen(true);
            outSelectedObject(inObject, 'url');
            break;
          case 'signature':
            setSignOpen(true);
            outSelectedObject(inObject, 'url');
            break;
          case 'download':
            getPrimaryRendition(`dwnButton${inObject.id}`, inObject);
            outSelectedObject(inObject, 'url');
            break;
          case 'automationload':
            setAutomationOpen(true);
            //wait to load and then set the out selected object
            break;
          case 'automationrun':
            setAutomationOpen(true);
            //wait to load
            break;
          default:
            break;
        }
      }
        
        
    },[inAction]
    );

    useEffect(
      () => {
        if (automationLoaded===true) {
          outSelectedObject(inObject, 'url');          
        }
        
          
      },[automationLoaded]
      );
  


    // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (blobId!='') {
          downloadItem('dwnBlob');
        }
    },[blobId]
    );


  return (
      <React.Fragment>
        {!isActions && <Tooltip title={`Copy ${inObject.category} to clipboard`} followCursor>
          <TableCell align="left" onClick={() => {handleCopy(inObject)}}>{inObject.category=='file'?<InsertDriveFileIcon color="primary"/>:(inObject.category=='folder'?<FolderIcon color="primary"/>:<EmojiObjectsIcon color="primary"/>)}</TableCell>
        </Tooltip>}
        {isActions && isSelect &&  
            (inCategory===inObject.category) && <IconButton size="small" variant="outlined" color="primary" title="Select" onClick={(e) => { outSelectedObject(inObject, 'select');  }}>
              <VerifiedIcon />
            </IconButton>
        }
        {isActions && !isSelect && 
          <Stack direction="row" spacing={0}>
            <IconButton size="small" variant="outlined" color="primary" title="View info" onClick={(e) => {setPropsSave(false); setPropsOpen(true); isDialogDisplayed(true); }}>
              <InfoIcon />
            </IconButton>
            {/* The copy action can be activated here */}
            {false && <IconButton size="small" variant="outlined" color="secondary" title="Copy" onClick={() => { handleCopy(inObject)}}>
              <ContentPasteIcon />
            </IconButton>}
            {(inObject.parent_folder_id===inCurFolderId || inCurFolderId==='') ?
              <IconButton size="small" variant="outlined" color="error" title="Delete object" onClick={() => { setDeleteOpen(true); setRecursive(false); setSoftDelete(false); isDialogDisplayed(true); }}>
                <DeleteForeverIcon />
              </IconButton>
              : 
              <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==`butClipboard${'unlink'}`}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
                <IconButton size="small" variant="outlined" color="error" title="Unlink object" onClick={() => { handleClipboard('unlink', inObject, inCurFolderId)  }}>
                  <LinkOffIcon />
                </IconButton>
              </Box>
              }
            {true && <IconButton size="small" variant="outlined" color="error" title="Send to recycle bin" onClick={() => { setDeleteOpen(true); setRecursive(false); setSoftDelete(true); isDialogDisplayed(true);  }}>
                <RecyclingIcon />
              </IconButton>
              }
            {inObject.category=='file' && 
            <Box sx={{
              borderStyle: ((activeId.split(',').find((obj) => {return obj==`dwnButton${inObject.id}`}) || activeId.split(',').find((obj) => {return obj==`dwnBlob`})) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <IconButton 
                size="small" variant="outlined" color={blobId ? "warning" : "primary"} title={blobId ? "BlobId got" : "Download document"} 
                onClick={(e) => { getPrimaryRendition(`dwnButton${inObject.id}`, inObject); isDialogDisplayed(true);  }}>
                <DownloadIcon />
              </IconButton>
            </Box>}
            {inObject.category=='file' && 
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==`viewButton${inObject.id}`}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <IconButton size="small" variant="outlined" color="primary" title="View document" onClick={(e) => { setViewOpen(true); isDialogDisplayed(true);  }}>
                <VisibilityIcon />
              </IconButton>
            </Box>}
            {inCompact!==true && <Divider orientation="vertical" flexItem />}
            {inObject.category=='file' && inCompact!==true && 
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==`rgButton${inObject.id}`}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <IconButton size="small" variant="outlined" color="primary" title="Get Risk Data" onClick={(e) => { setRgOpen(true); isDialogDisplayed(true);  }}>
                <PolicyIcon />
              </IconButton>
            </Box>}
            {inObject.category=='file' && inCompact!==true && 
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==`cpButton${inObject.id}`}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <IconButton size="small" variant="outlined" color="primary" title="Get OCR Data" onClick={(e) => { setCpOpen(true); isDialogDisplayed(true);  }}>
                <DocumentScannerIcon />
              </IconButton>
            </Box>}
            {inObject.category=='file' && inCompact!==true && 
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==`barButton${inObject.id}`}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <IconButton size="small" variant="outlined" color="primary" title="Get Barcode Data" onClick={(e) => { setBarOpen(true); isDialogDisplayed(true);  }}>
                <QrCode2Icon />
              </IconButton>
            </Box>}
            {inObject.category=='file' && inCompact!==true && process.env.REACT_APP_USE_SIGNATURE==='true' && 
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj==`signButton${inObject.id}`}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'}}>
              <IconButton size="small" variant="outlined" color="primary" title="Signature..." onClick={(e) => {setSignOpen(true) ; isDialogDisplayed(true); }}>
                <HistoryEduIcon />
              </IconButton>
            </Box>}
            {inCompact!==true && inObject.category=='file' &&
              <IconButton size="small" variant="outlined" color="primary" title="Transformation..." onClick={(e) => {   setTransformOpen(true); isDialogDisplayed(true); }}>
                <TransformIcon  />
              </IconButton>}
            {inCompact!==true && 
              <IconButton size="small" variant="outlined" color="primary" title="Automation..." onClick={(e) => { setAutomationOpen(true); isDialogDisplayed(true); }}>
                <PrecisionManufacturingIcon  />
              </IconButton>}
            {(inObject.category=='folder' || inObject.category=='case') && 
              <IconButton size="small" variant="outlined" color="primary" title={`Open ${inObject.category}`} onClick={(e) => {   outSelectedObject(inObject.id, 'id') }}>
                <DriveFileMoveIcon  />
              </IconButton>}
            {inCompact!==true && !isSelect && <Divider orientation="vertical" flexItem />}
            {inCompact!==true && !isSelect && <IconButton size="small" variant="outlined" color="success" title="Add new trait to selected object" onClick={() => {setNewTraitOpen(true); isDialogDisplayed(true);}}>
              <PlaylistAddCircleIcon />
            </IconButton>}
            {inCompact!==true && !isSelect && <IconButton size="small" variant="outlined" color="success" title="View history" onClick={() => {setHistoryOpen(true); isDialogDisplayed(true);}}>
              <HistoryIcon />
            </IconButton>}
            
          </Stack>
        }

          <Dialog open={propsOpen} onClose={() => {setPropsOpen(false); outCloseAction(true);}} maxWidth={'xl'} fullWidth>
              <DialogTitle>Properties - {inObject.name} {inObject.category==='file' ? ` (v. ${inObject.version_no})` : ''}</DialogTitle>
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
                  onClose = {(result) => {setPropsOpen(false); if (result) {setPropsSave(false); shouldRefresh();}; outCloseAction(true);}} 
                  token = {token} 
                  inObj = {inObject} 
                  showBorder = {showBorder} 
                  clickedFolder = {(folder) => {outSelectedObject(folder, 'id'); setPropsOpen(false);}} 
                  navigateToObject = {(object) => {setPropsOpen(false); outSelectedObject(object, 'object');}} 
                  propsSave = {propsSave}  
                  canUpdate = {(value) => setCanUpdate(value)} 
                  mWidth = {'calc(100% - 151px)'}
                />
             
          
              </DialogContent>
            <DialogActions>
              <Button onClick={() => {setPropsOpen(false); if (inObject.category === 'file') shouldRefresh(); outCloseAction(true);}}>Close</Button>
              <Button disabled={!canUpdate} onClick={() => {setPropsSave(true); }}>Update</Button>
            </DialogActions>
            
          </Dialog>
          <DeleteItem
            runRequest = {runRequest} 
            deleteOpen = {deleteOpen} 
            onDeleteSuccess = {(result) => {setDeleteOpen(false); if (result) shouldRefresh(); outCloseAction(true);}} 
            token = {token} 
            inObj = {inObject} 
            showBorder = {showBorder} 
            recursive = {recursive}
            softDelete = {softDelete}
          />
          <Dialog
            open={rgOpen}
            onClose={() => {setRgOpen(false); outCloseAction(true);}}
            aria-labelledby="risk-guard-doc"
            aria-describedby="risk-guard-doc"
            maxWidth={'md'} 
            fullWidth
          >
            <RiskGuard runRequest = {runRequest} docObject={inObject}  closeAction={() => {setRgOpen(false); outCloseAction(true);}} token = {token} showBorder={showBorder}/>
          </Dialog>
          <Dialog
            open={signOpen}
            onClose={() => {setSignOpen(false); outCloseAction(true);}}
            aria-labelledby="signature-doc"
            aria-describedby="signature-doc"
            maxWidth={'90vw'} 
            fullWidth
          >
            <DialogContent>
              <SignatureDetails runRequest = {runRequest} docObject={inObject}  token = {token} showBorder={showBorder}/>
            </DialogContent>
            <DialogActions>
              <Button target={'_blank'} href={'https://sign.core.opentext.com/api/v1/docs/#section/Preparing-a-Document'}>Info</Button>
              <Button onClick={() => {setSignOpen(false); outCloseAction(true);}}>Close</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={cpOpen}
            onClose={() => {setCpOpen(false); outCloseAction(true);}}
            aria-labelledby="capture-doc"
            aria-describedby="capture-doc"
            maxWidth={'md'} 
            fullWidth
          >
            <Capture runRequest = {runRequest} docObject={inObject}  closeAction={() => {setCpOpen(false); outCloseAction(true);}} token = {token} showBorder={showBorder} cpMode={'ocr'}/>
          </Dialog>
          <Dialog
            open={barOpen}
            onClose={() => {setBarOpen(false); outCloseAction(true);}}
            aria-labelledby="capture-barcode"
            aria-describedby="capture-barcode"
            maxWidth={'md'} 
            fullWidth
          >
            <Capture runRequest = {runRequest} docObject={inObject}  closeAction={() => {setBarOpen(false); outCloseAction(true);}} token = {token} showBorder={showBorder} cpMode={'barcode'}/>
          </Dialog>        
          <Dialog
            open={viewOpen}
            onClose={() => {setViewOpen(false); outCloseAction(true);}}
            aria-labelledby="view-doc"
            aria-describedby="view-doc"
            maxWidth={'90vw'}  
            fullWidth
          >
            {(inObject.mime_type=='text/html' || inObject.mime_type=='text/plain' || inObject.mime_type==='application/json') &&  
            <DialogContent sx={{display: "flex",
                        flexDirection: "column",
                        height: "90vh",
                        overflow: "hidden",
                        overflowY: "auto", 
                        overflowX: "auto", 
                        "&::-webkit-scrollbar": {
                        height: 4,
                        width: 4,
                        borderRadius: 2
                        },
                        "&::-webkit-scrollbar-track": {
                        backgroundColor: "white"
                        },
                        "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "gray",
                        borderRadius: 2
                        }}}>
                
                <DocumentViewHTML runRequest = {runRequest} docObject={inObject}  closeAction={() => {setViewOpen(false); outCloseAction(true);}} token = {token} showBorder={showBorder}/>
            </DialogContent>}
               {(inObject.mime_type!='text/html' && inObject.mime_type!='text/plain' && inObject.mime_type!='application/json') && 
                <DocumentView runRequest = {runRequest} docObject={inObject} inFull={true}  closeAction={() => {setViewOpen(false); outCloseAction(true);}} token = {token} userName = {userName} showBorder={showBorder}/>}
          </Dialog>
          <AutomationDialog 
            runRequest={runRequest}
            docObject={inObject}
            token={token}
            showBorder={showBorder}
            automationOpen={automationOpen}
            setAutomationOpen={(result) => {setAutomationOpen(result); outCloseAction(true);}} 
            userName={userName}
            inAction={inAction}
            inActionId={inActionId} 
            setAutomationLoaded={setAutomationLoaded}
          />
          <Dialog
            open={transformOpen}
            onClose={() => {setTransformOpen(false); outCloseAction(true);}}
            aria-labelledby="transform-doc"
            aria-describedby="transform-doc"
            maxWidth={'xl'} 
            fullWidth
          >
            <DialogContent>
              <DocumentIVTransform 
                runRequest={runRequest}
                token={token}
                showBorder={showBorder}
                docObject={inObject}
                outPdfRendition={(status, docUrl) => {}}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {setTransformOpen(false); outCloseAction(true);}}>Close</Button>
            </DialogActions>
          </Dialog>
          <TraitInstanceNew
            runRequest = {runRequest} 
            newOpen = {newTraitOpen} 
            onCreateSuccess = {() => {setNewTraitOpen(false); outCloseAction(true);}} 
            token = {token} 
            inObject = {inObject} 
            showBorder = {showBorder}
          />
          <Dialog
            open={historyOpen}
            onClose={() => {setHistoryOpen(false); outCloseAction(true);}} 
            aria-labelledby="history-details"
            aria-describedby="history-details"
            maxWidth={'xl'} 
            fullWidth
          >
            
            <DialogContent>
              <HistoricDetails runRequest = {runRequest} token = {token} showBorder={showBorder} instanceURL = {`cms/instances/${inObject.category}/${inObject.type}/${inObject.id}`}/>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {setHistoryOpen(false); outCloseAction(true);}}>Close</Button>
            </DialogActions>
          </Dialog>
      </React.Fragment>
  );
}
