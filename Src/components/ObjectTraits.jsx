import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import { Button,
  Box,
  IconButton,
  Typography,
  Stack,
  Paper
} from '@mui/material';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import TraitInstanceCategoryView from './TraitInstanceCategoryView';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import TraitInstanceComp from './TraitInstanceComp';



export default function ObjectTraits(props) {
  const { runRequest, token, showBorder, inObj, isEditMode, setIsEdit, isSoftDeleted } = props;

  const [activeId, setActiveId] = useState('');
  

  const [traitObj, setTraitObj] = React.useState({});
  const [newOpen, setNewOpen] = React.useState(false);

  const [traitCategories, setTraitCategories] = useState([]);
  const [updatedList, setUpdatedList] = useState(false);


  const getList = (componentId) => {
    addActiveId(componentId);
    //do i get the object again?
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/${(isSoftDeleted===true)?`deleted`:`instances/${inObj.category}/${inObj.type}`}/${inObj.id}`, 
      headers: {'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      let categoryArray = [];
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        
        if (res.data.traits) {
          for (const categ in res.data.traits) {
            if (res.data.traits.hasOwnProperty(categ)) {
              //this is the category
              //now get instances
              let instanceArray = [];
              for (const inst in res.data.traits[categ]) {
                if (res.data.traits[categ].hasOwnProperty(inst)) {
                  //this is the instance
                  instanceArray.push({name: inst, definition: categ, properties: res.data.traits[categ][inst]});
                }
              }
              categoryArray.push({definition: categ, displayName: '', instances: instanceArray});
            }
          }
          setTraitCategories(categoryArray);
        } else {
          setTraitCategories([]);
        }
      }
    setUpdatedList(false);
    removeActiveId(componentId);
    }, '', []);
  }

  const handleDelete = (category, componentId) => {
    addActiveId(componentId);

    
    let data = {
      name: inObj.name,
      traits: {[category]: {}}
    }

    let req = { 
      method: 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json'} 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data.id) {
        setUpdatedList(true);
      } 
      removeActiveId(componentId);
    }, '', []);
  };

  const handleCreate = () => {
    addActiveId('newButton');
    

    let data = {
      name: inObj.name,
      traits: {[traitObj.definition]: {[traitObj.name]: traitObj.properties}}
    }
    
    

    let req = { 
      method: 'patch', 
      data: data,
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id) {
        
        setUpdatedList(true);
        setTraitObj({});
        setNewOpen(false);
        setIsEdit(false);
      } 
      removeActiveId('newButton');

    }, '', []);
   

  };

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

  const setCategoryName = (inName, inIndex) => {
    // let tmpCategoryArray = [...traitCategories];
    // let curItem = {definition: traitCategories[inIndex].definition, displayName: inName, instances: traitCategories[inIndex].instances}
    // tmpCategoryArray.splice(inIndex, 1, curItem);
    
    // setTraitCategories(tmpCategoryArray);
    traitCategories[inIndex].displayName = inName;
  }
  
  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setTraitCategories([]);
    
    setUpdatedList(true);
  }

  useEffect(() => {
    if (newOpen) {
      
      setTraitObj({});
    }
    

  }, [newOpen]);

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
        getList('contentsList');
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            {!newOpen && <Box 
              key="box-left-panel" 
              sx={{
                
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='contentsList'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'
                  }}
                  >
                    {!isEditMode && !(isSoftDeleted===true) && <Stack direction={'row-reverse'}>
                      <IconButton size="small" variant="outlined" color="success" title="Add new trait" onClick={() => { setNewOpen(true); setIsEdit(true); }}>
                        <LibraryAddIcon />
                      </IconButton>
                    </Stack>}
                  {traitCategories.map((categoryObj, index) => (
                      <Paper key={'paperCateg' + index} elevation={3} sx={{p:2, mt:2 }}>
                        {!isEditMode && <Stack direction={'row'} spacing={2} justifyContent="space-between" alignItems="center">
                          <Typography>{categoryObj.definition + (categoryObj.displayName ? ` (${categoryObj.displayName})` : '')}</Typography>
                          <Box sx={{
                            borderStyle: (activeId.split(',').find((obj) => {return obj=='delCategory' + categoryObj.definition}) && showBorder)?'solid':'none', 
                            borderColor: 'red',
                            borderWidth: 'thin'
                            }}>
                            <IconButton size="small" variant="outlined" color="error" title="Remove trait category" disabled={(isSoftDeleted===true)} onClick={() => { handleDelete(categoryObj.definition, 'delCategory' + categoryObj.definition);   }}>
                              <DeleteForeverIcon />
                            </IconButton>
                          </Box>
                        </Stack>}
                        <TraitInstanceCategoryView 
                          category={categoryObj.definition} 
                          runRequest={runRequest} 
                          token={token} 
                          showBorder={showBorder} 
                          inTraits={categoryObj.instances} 
                          inObj={inObj} 
                          updateObj={(status) => setUpdatedList(status)} 
                          isEditMode={isEditMode} 
                          setIsEdit={setIsEdit} 
                          setCategoryName={(inName) => setCategoryName(inName, index)}
                          isSoftDeleted={isSoftDeleted}/>
                      </Paper>
                  ))}
                </Box>}
                {newOpen && 
                  <Stack direction={'column'} spacing={2}>
                    <TraitInstanceComp runRequest={runRequest} newOpen={newOpen} outTraitFunc={(obj) => {setTraitObj(obj); }} token={token} showBorder={showBorder} />
                    <Stack direction={'row-reverse'} spacing={2} alignItems="center">
                      <Button onClick={() => {setNewOpen(false); setIsEdit(false);}}>Cancel</Button>
                      <Box sx={{
                        borderStyle: (activeId.split(',').find((obj) => {return obj=='newButton'}) && showBorder)?'solid':'none', 
                        borderColor: 'red',
                        borderWidth: 'thin'}}>
                          <Button onClick={handleCreate} disabled={!traitObj.name }>Create</Button>
                      </Box>
                    </Stack>
                  </Stack>
                }
            
        </React.Fragment>
  );
}
