import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  IconButton,
  TextField,
  Stack
} from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

  


  export default function CustomHistoricFilter(props) {
    const {  onFilterChange, onFilterClose } = props;
    
    const [actionName, setActionName] = React.useState('');
    const [eventSource, setEventSource] = React.useState('');
    const [userId, setUserId] = React.useState('');
    const [status, setStatus] = React.useState('');
    

    const handleCreateFilter = () => {
      let strFilter = '';
      if (actionName!='') {
        strFilter += `${strFilter!==''?' and ':''}action_name eq '${actionName}'`
      }
      if (eventSource!='') {
        strFilter += `${strFilter!==''?' and ':''}event_source eq '${eventSource}'`
      }
      if (userId!='') {
        strFilter += `${strFilter!==''?' and ':''}event_user eq '${userId}'`
      }
      if (status!='') {
        strFilter += `${strFilter!==''?' and ':''}event_status eq '${status}'`
      }
      
      onFilterChange(strFilter);
    }

    

      return (
        <React.Fragment>
          <Stack
            direction="column" 
            spacing={2} 
            alignItems="left" 
            key="name-filter-stack" 
            sx={{ bgcolor: 'background.paper', 
              boxShadow: 1,
              borderRadius: 2,
              p: 2,}}
            >
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center" 
              key="name-filter-stack"
              >
              
              <TextField
                  margin="dense"
                  id="actionName" 
                  key="actionName"
                  variant="standard" 
                  size="small" 
                  label="Name" 
                  value={actionName} 
                  onChange={e => {setActionName(e.target.value)}}
                  />
              <TextField
                  margin="dense"
                  id="eventSource" 
                  key="eventSource"
                  variant="standard" 
                  size="small" 
                  label="Event Source" 
                  value={eventSource} 
                  onChange={e => {setEventSource(e.target.value)}}
                  />
              <TextField
                  margin="dense"
                  id="userId" 
                  key="userId"
                  variant="standard" 
                  size="small" 
                  label="User id" 
                  value={userId} 
                  onChange={e => {setUserId(e.target.value)}}
                  />
              <TextField
                  margin="dense"
                  id="status" 
                  key="status"
                  variant="standard" 
                  size="small" 
                  label="Status" 
                  value={status} 
                  onChange={e => {setStatus(e.target.value)}}
                  />
            </Stack>    
            
              <Stack 
                direction="row-reverse" 
                spacing={2} 
                alignItems="right" 
                key="button-filter-stack" 
                >
                <IconButton size="small" variant="outlined" color="success" title="Filter documents" onClick={() => { handleCreateFilter(); }}>
                  <FilterAltIcon />
                </IconButton> 
                <IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { onFilterChange(''); onFilterClose() }}>
                  <FilterAltOffIcon />
                </IconButton>
              </Stack>
            </Stack>
            <br/>
          </React.Fragment>
      );
  }