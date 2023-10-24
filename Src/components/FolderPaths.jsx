import * as React from 'react';
import { useState } from "react";
 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import {
  Box, Stack
} from '@mui/material';






export default function FolderPaths(props) {
  const { runRequest, token, inFolderIdArray, showBorder, clickedFolder, parentIdArray } = props;


  const [folderNameArray, setFolderNameArray] = React.useState([]);
  const [folderIdArray, setFolderIdArray] = React.useState([]);

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

  const checkParentIds = () => {
    //if one of the linked folder id's is the root folder, it will not show up in the folderArray so we need to add it
    let isFound = false;
    let outArray = [...inFolderIdArray];
    for (let i=0; i<parentIdArray.length; i++) {
      isFound = false;
      if (!parentIdArray[i]) isFound = true;
      for (let j=0; j<inFolderIdArray.length; j++) {
        if (parentIdArray[i]===inFolderIdArray[j][inFolderIdArray[j].length-1]) {
          //found
          isFound=true;
        }
      }
      if (!isFound) {
        outArray.push([parentIdArray[i]]);
      }
    }
    setFolderIdArray(outArray);
  }

  

    const handleRefreshList = (force) => {
      if (force) {
        setFolderNameArray([]);
        setFolderIdArray([]);
      } 
      checkParentIds();
    }

    const getList = (componentId) => {
      addActiveId(componentId);
      let allIds = [];

      for (let i=0; i<folderIdArray.length; i++) {
        folderIdArray[i].forEach(element => {
          allIds.push(`'${element}'`);
        });
      }


      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/any/cms_any?filter=id=(${allIds.join(',')})&page=1&tems-per-page=1000`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        if (res.data && res.data._embedded) {
          setFolderNameArray(res.data._embedded.collection);
        }
        removeActiveId(componentId);
      }, '', []);
    }

    const handleClickedFolder = (folder) => {
      //this is the folder id
      
      let item = folderNameArray[folderNameArray.map(e => e.id).indexOf(folder)];
      clickedFolder(folder, (item?.category ? item.category : 'folder'));
    }
 

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  
  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        if (inFolderIdArray.length>0 || parentIdArray?.length>0) {
          //console.log(folderIdArray);
          handleRefreshList(false);
        }
    },[inFolderIdArray]
    );

    useEffect(
      () => {
          if (folderIdArray.length>0) {
            getList('resList');
          }
      },[folderIdArray]
      );

    

  return (
          <React.Fragment>
            <div className="dialog-content">
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='resList'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin',
              }}>
                {folderNameArray.length>0 ? <Stack key={'list'} direction="column" spacing={2}>
                {folderIdArray.map((folderList, index) => (
                  <Stack key={'folder' + index} direction="row" spacing={0.5}>
                    {folderList.map((folder, index) => (
                      <Stack key={'stack_name' + index} direction="row" spacing={0.5}>
                        <Box>
                          {'/'}
                        </Box>
                        <Box key={'name' + index} onClick={() => {handleClickedFolder(folder) }} sx={{ cursor: 'pointer' }}>
                          {folderNameArray[folderNameArray.map(e => e.id).indexOf(folder)] ? folderNameArray[folderNameArray.map(e => e.id).indexOf(folder)]?.name : 'unknown'}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                ))}
                </Stack>:'Loading...'}
                
            </Box>
            
            </div>
          </React.Fragment>
  );
}
