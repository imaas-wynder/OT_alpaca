import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


//import PDFViewer from 'pdf-viewer-reactjs';

// MUI components
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';


import BorderColorIcon from '@mui/icons-material/BorderColor';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import TraitInstanceProps from './TraitInstanceProps';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';



export default function TraitInstanceCategoryView(props) {
  const { runRequest, token, showBorder, inObj, inTraits, category, updateObj, isEditMode, setIsEdit, setCategoryName, isSoftDeleted } = props;
//inTraits will be an array of trait instance objects (name, category, properties)
  const [activeId, setActiveId] = useState('');
  const [selectedRow, setSelectedRow] = useState({});

  const [headCells, setHeadCells] = useState([]);

  const [editMode, setEditMode] = useState(false);

  
  const getList = (componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/trait-definitions/${category}?expandAll=true`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data.attributes) {
        setHeadCells(res.data.attributes);
        setCategoryName(res.data.display_name);
      }
      removeActiveId(componentId);
    }, '', []);
  }

  const handleDelete = (instanceName, componentId) => {
    addActiveId(componentId);

    
    let data = {
      name: inObj.name,
      traits: {[category]: {[instanceName]: {}}}
    }

    let req = { 
      method: 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        updateObj(true); 
        setSelectedRow({});
      } 
      removeActiveId(componentId);
    }, '', []);
  };

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.name==row.name)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.name==row.name)?{}:row);
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

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }
  
  const resolveValue = (propertyObj, value) => {
    if (propertyObj.repeating) {
      return value ? value.join(', ') : '';
    } else {
      switch (propertyObj.data_type) {
        case 'string':
          return value;
          break;
        case 'integer':
          return value.toString();
          break;
        case 'bigint':
          return value.toString();
          break;
        case 'double':
          return value.toString();
          break;
        case 'boolean':
          return (value===true?'True':'False');
          break;
        case 'date':
          return getDateValue(value);
          break;
                                    
        default:
          break;
      }
    }
    
  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log(`useEffect with none.`);
        getList('contentsList');
    },[]
    );


  return (
      <React.Fragment>

            {(!isEditMode && !editMode) && <Box 
              key="box-left-panel" 
              sx={{
                
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='contentsList'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'
                  }}
                  >
                  {<TableContainer component={Paper}>
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                              key={'instname'}
                              align={'left'}
                              padding={'normal'}
                              sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}
                            >
                              Instance name
                            </TableCell>
                          {headCells.map((headCell) => (
                            <TableCell
                              key={headCell.name}
                              align={'left'}
                              padding={'normal'} 
                              sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}
                            >
                              {headCell.display_name}
                            </TableCell>
                          ))}
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="success" title="Add new trait" disabled={(isSoftDeleted===true)} onClick={() => { setSelectedRow({name: '', definition: category, properties: {}}); setEditMode(true); setIsEdit(true); }}>
                              <LibraryAddIcon />
                            </IconButton>
                            
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {inTraits.map((row) => (
                          <TableRow key={row.name} hover selected={selectedRow.name==row.name}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.name}</TableCell>
                            {headCells.map((headCell, index) => (
                              <TableCell 
                                key={row.name + 'detail' + index}
                                align={'left'}
                                onClick={() => {handleSelectRow(row, false)}}
                              >
                                {resolveValue(headCell, row.properties[headCell.name])}
                              </TableCell>
                            ))}
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                <IconButton size="small" variant="outlined" color="warning" title="Edit trait instance" disabled={(isSoftDeleted===true)} onClick={() => { setEditMode(true); setIsEdit(true); }}>
                                  <BorderColorIcon />
                                </IconButton>
                                <Box sx={{
                                  borderStyle: (activeId.split(',').find((obj) => {return obj=='delBut' + row.name}) && showBorder)?'solid':'none', 
                                  borderColor: 'red',
                                  borderWidth: 'thin'
                                  }}>
                                  <IconButton size="small" variant="outlined" color="error" title="Delete trait instance" disabled={(isSoftDeleted===true)} onClick={() => { handleDelete(row.name, 'delBut' + row.name) }}>
                                    <DeleteForeverIcon />
                                  </IconButton>
                                </Box>
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>}

                {editMode && <Box>
                  <TraitInstanceProps 
                    runRequest={runRequest} 
                    token={token} 
                    showBorder={showBorder}
                    propsOpen={editMode} 
                    onClose={(status) => {setEditMode(false); updateObj(status); setSelectedRow({}); setIsEdit(false);}} 
                    inTrait={selectedRow}
                    inObj={inObj}/>
                </Box>}

        
        </React.Fragment>
  );
}
