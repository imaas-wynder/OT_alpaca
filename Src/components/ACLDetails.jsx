import * as React from 'react';
import { useState } from "react";
 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import {
  Alert,
  Box,
  IconButton,
  Typography,
  Paper, 
  FormGroup,
  FormControlLabel,
  Switch
} from '@mui/material';

import { Stack } from '@mui/system';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ACLList from './ACLList';





export default function ACLDetails(props) {
  const { runRequest, token, aclid, inObj, showBorder, setIsEdit, onUpdate, isSoftDeleted } = props;


  const [aclObj, setAclObj] = React.useState({});
  const [aclChange, setACLChange] = React.useState(false);
  const [curPerm, setCurPerm] = React.useState([]);
  const [newACL, setNewACL] = React.useState({});

  const [recursive, setRecursive] = React.useState(false);
  const [force, setForce] = React.useState(false);
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

  

    const handleRefreshList = (force) => {
      if (force) {
        setAclObj({});
        setCurPerm([]);
      }
      getList('resBox');
    }

    const getList = (componentId) => {
      addActiveId(componentId);
      
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/permissions/${aclid}`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        if (res.data && res.data.id) {
          setAclObj(res.data);
        }
        
        removeActiveId(componentId);
        getCurPerm('permBox');
      }, '', []);
    }

    const getCurPerm = (componentId) => {
      
      if (!inObj) return;
      if (isSoftDeleted===true) return;

      addActiveId(componentId);
      
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/permissions`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        
        if (res.data) {
          setCurPerm(res.data.permissions ?? ['None']);
        }
        removeActiveId(componentId);
      }, '', []);
    }

    const setNewPerm = (componentId) => {
      if (!inObj) return;
      addActiveId(componentId);
      
      let req = { 
        method: 'put', 
        data: {id: newACL.id},
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObj.category}/${inObj.type}/${inObj.id}/acl${inObj.category==='folder'?`?recursive=${recursive}&force=${force}`:''}`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        if (res.data && res.data.id) {
          setACLChange(false);
          setIsEdit(false);
          onUpdate(true);
        }
        removeActiveId(componentId);
      }, '', []);
    }

 

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  
  
    useEffect(
      () => {
        if (aclid) {
           handleRefreshList(false);
        }
         
      },[aclid]
      );

  return (
          <React.Fragment>
            <div className="dialog-content">
            <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='resBox'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin',
              }}>
                {!aclChange && <Stack key={'header_area'} direction='row' spacing={2} justifyContent='space-between'>
                  <Stack direction='column' spacing={2}>
                    <Stack key={'name_acl'} direction="row" spacing={2}>
                      <Typography variant="subtitle1" >
                        <Box
                            sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            p: 0,
                            m: 0,
                            fontWeight: 'bold'
                            }}
                        >
                            {'Name'}:
                            </Box>
                        </Typography>
                        <Typography variant="subtitle1" >
                          <Box 
                              sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              p: 0,
                              m: 0
                              }}
                          >
                              {aclObj.name}
                          </Box>
                      </Typography>
                    </Stack>
                    <Stack key={'desc_acl'} direction="row" spacing={2}>
                      <Typography variant="subtitle1" >
                        <Box
                            sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            p: 0,
                            m: 0,
                            fontWeight: 'bold'
                            }}
                        >
                            {'Description'}:
                            </Box>
                        </Typography>
                        <Typography variant="subtitle1" >
                          <Box 
                              sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              p: 0,
                              m: 0
                              }}
                          >
                              {aclObj.description}
                          </Box>
                      </Typography>
                    </Stack>
                  </Stack>
                  {inObj && !(isSoftDeleted===true) && <Box>
                    <IconButton size="small" variant="outlined" color="primary" title="Change permissions" onClick={() => { setACLChange(true); setIsEdit(true); setNewACL({}); }}>
                      <ManageAccountsIcon />
                    </IconButton>
                  </Box>}
                  
                </Stack>}
 
                {aclChange && <Stack  key={'header_area_edit'} direction='row' spacing={2} justifyContent='space-between'>
                  <Stack direction={'column'} spacing={2}>

                    {newACL.name ? 'Selected ACL: ' + newACL.name : 'Please select a new ACL from the list.'}
                    <Stack direction={'row'} spacing={2}>
                      {inObj.category==='folder' && <FormGroup>
                        <FormControlLabel
                            control={
                              <Switch checked={recursive===true} onChange={(e) => {setRecursive(e.target.checked)}} name="recursive" size="small"/>
                            }
                            label="Recursive"/>
                      </FormGroup>}
                      {inObj.category==='folder' && <FormGroup>
                        <FormControlLabel
                            control={
                              <Switch checked={force===true} onChange={(e) => {setForce(e.target.checked)}} name="force" size="small"/>
                            }
                            label="Force"/>
                      </FormGroup>}
                    </Stack>
                    
                  </Stack>
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='updatePerm'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin',
                    }}>
                    <IconButton size="small" variant="outlined" color="success" title="Apply" disabled={!newACL.name} onClick={() => { setNewPerm('updatePerm') }}>
                      < AdminPanelSettingsIcon/>
                    </IconButton>
                    <IconButton size="small" variant="outlined" color="error" title="Cancel" onClick={() => { setACLChange(false); setIsEdit(false); }}>
                      <PersonOffIcon />
                    </IconButton>
                  </Box>
                </Stack>
                
                
                }
                
                {aclObj.permits && !aclChange && 
                  <Box >
                    {aclObj.permits.map((item, index) => (
                      <Paper key={'acl_obj' + index} elevation={3} sx={{p:2, mt:2}}>
                      <Stack direction="column" spacing={1}>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="subtitle1" >
                            <Box
                                sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                p: 0,
                                m: 0,
                                fontWeight: 'bold'
                                }}
                            >
                                {item.identity_type}:
                                </Box>
                            </Typography>
                            <Typography variant="subtitle1" >
                              <Box 
                                  sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  p: 0,
                                  m: 0
                                  }}
                              >
                                  {item.email ? item.email : (item.group_name ? item.group_name : (item.role_name ? item.role_name : (item.display_name ? item.display_name : '')))}
                              </Box>
                          </Typography>
                          <Typography variant="subtitle1" >
                              <Box 
                                  sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  p: 0,
                                  m: 0
                                  }}
                              >
                                  {` - ${item.identity}`}
                              </Box>
                          </Typography>
                        </Stack>
                        <Box>
                          <Typography variant="subtitle1" >
                            <Box
                                sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                p: 0,
                                m: 0,
                                fontWeight: 'bold'
                                }}
                            >
                                Permits:
                                </Box>
                            </Typography>
                            {item.permissions.join(', ')}
                        </Box>
                      </Stack>
                      </Paper>
                      ))}
                    </Box>}
            </Box>
            {inObj && !aclChange && !(isSoftDeleted===true) && <Box sx={{
              borderStyle: (activeId.split(',').find((obj) => {return obj=='permBox'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin',
              }}>
                {curPerm.length==0 && <Paper key={'cur_perm'} elevation={3} sx={{p:2, mt:2}}>
                    <Typography variant="subtitle1" >
                      <Box
                          sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          p: 0,
                          m: 0,
                          fontWeight: 'bold'
                          }}
                      >
                          {'Getting current permissions on this object'}
                          </Box>
                    </Typography>
                  </Paper>}
                {curPerm.length>0 && <Paper key={'cur_perm'} elevation={3} sx={{p:2, mt:2}}>
                  <Typography variant="subtitle1" >
                    <Box
                        sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        p: 0,
                        m: 0,
                        fontWeight: 'bold'
                        }}
                    >
                        {'Current permissions on this object'}:
                        </Box>
                  </Typography>
                  <Typography variant="subtitle1" >
                    <Box
                        sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        p: 0,
                        m: 0
                        }}
                    >
                        {curPerm.join(', ')}
                        </Box>
                  </Typography>
                </Paper>}
            </Box>}
            {aclChange && <ACLList 
              runRequest={runRequest} 
              token={token} 
              showBorder={showBorder}
              isSelect={true}
              setOutId={(obj)=>{setNewACL(obj)}}/>}
            
              
            </div>
          </React.Fragment>
  );
}
