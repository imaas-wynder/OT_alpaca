import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import { 
    TextField,
    IconButton,
    Box,
    FormGroup,
    FormControlLabel,
    Switch
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';

import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';

import InsertLinkIcon from '@mui/icons-material/InsertLink';
import MailLockIcon from '@mui/icons-material/MailLock';

import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import { Stack } from '@mui/system';

export default function SignersView(props) {
  const { inputFields, setInputFields, isVisible, sendSMS } = props;

  

    const handleVarChange = (index, inName, inValue) => {
        let data = [...inputFields];
        
        data[index][inName] = inValue;
        
        setInputFields(data);
    }

    const addFields = () => {
        let newfield = {email: '', full_name: '', password: '', phone: '', approve_only: false, needs_to_sign: true, notify_only: false, in_person: false, gen_link: false, order: 0 }
    
        setInputFields([...inputFields, newfield])
    }


    const removeFields = (index) => {
        let data = [...inputFields];
        data.splice(index, 1);
        setInputFields(data);
    }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log("useEffect() - occurs ONCE, AFTER the initial render (unless react.strict mode) - variables view");
        if (inputFields.length==0) {
          setInputFields([{email: '', full_name: '', password: '', phone: '', approve_only: false, needs_to_sign: true, notify_only: false, in_person: false, gen_link: false, order: 0 }]);
        }
        
    },[]
    );

  return (
    <React.Fragment>
        {inputFields.map((input, index) => {
          return (
            <Stack key={'signers_view' + index} direction={'row'} alignItems={'center'} justifyContent={'space-between'} spacing={1}>
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <TextField
                  margin="dense"
                  label="Email" 
                  id="email"
                  sx={{width: 300}} 
                  required
                  variant="standard" 
                  value={input.email} 
                  onChange={e => {handleVarChange(index, 'email', e.target.value)}}
                  />
                <TextField
                  margin="dense"
                  label="Full name" 
                  id="fullname"
                  sx={{width: 300}} 
                  required
                  variant="standard" 
                  value={input.full_name} 
                  onChange={e => {handleVarChange(index, 'full_name', e.target.value)}}
                  />
                  <Stack direction={'column'} spacing={1}>
                    <TextField
                    margin="dense"
                    label="Password" 
                    id="password"
                    sx={{width: 200}} 
                    type={isVisible?"text":"password"}
                    variant="standard" 
                    value={input.password} 
                    onChange={e => {handleVarChange(index, 'password', e.target.value)}}
                    />
                    {sendSMS && input.password && <TextField
                    margin="dense"
                    label="Phone number" 
                    id="phone"
                    sx={{width: 200}} 
                    variant="standard" 
                    value={input.phone} 
                    onChange={e => {handleVarChange(index, 'phone', e.target.value)}}
                    />}
                    
                  </Stack>
                
                <TextField
                  margin="dense"
                  label="Order" 
                  id="order"
                  required
                  sx={{width: 50}} 
                  variant="standard" 
                  type="number"
                  value={input.order} 
                  onChange={e => {handleVarChange(index, 'order', Number(e.target.value))}}
                  />
              </Stack>
              <Stack direction={'row'} spacing={0.5} alignItems={'center'}>
                {!input.notify_only && (input.approve_only ? 
                  <IconButton size="small" variant="outlined" color="success" title="Approve only" onClick={() => handleVarChange(index, 'approve_only', false)}>
                    <DoneAllIcon />
                  </IconButton> : 
                  <IconButton size="small" variant="outlined" color="error" title="Approve only" onClick={() => {handleVarChange(index, 'approve_only', true); handleVarChange(index, 'needs_to_sign', true); handleVarChange(index, 'notify_only', false); }}>
                    <RemoveDoneIcon />
                  </IconButton>)}
                  {!input.notify_only && (input.needs_to_sign ? 
                  <IconButton size="small" variant="outlined" color="success" title="Needs to sign" onClick={() => {handleVarChange(index, 'needs_to_sign', false);handleVarChange(index, 'in_person', false); handleVarChange(index, 'approve_only', false) }}>
                    <EditIcon />
                  </IconButton> : 
                  <IconButton size="small" variant="outlined" color="error" title="Needs to sign" onClick={() => {handleVarChange(index, 'needs_to_sign', true);  handleVarChange(index, 'notify_only', false)}}>
                    <EditOffIcon />
                  </IconButton>)}

                  
                  {input.needs_to_sign && 
                  (input.in_person ? 
                    <IconButton size="small" variant="outlined" color="success" title="In person" onClick={() => {handleVarChange(index, 'in_person', false); }}>
                      <PersonIcon />
                    </IconButton> : 
                    <IconButton size="small" variant="outlined" color="error" title="Through email" onClick={() => { handleVarChange(index, 'in_person', true)}}>
                      <PersonOffIcon />
                    </IconButton>)
                  }
                  {input.needs_to_sign && 
                  (input.gen_link ? 
                    <IconButton size="small" variant="outlined" color="secondary" title="Generate signing link" onClick={() => {handleVarChange(index, 'gen_link', false); }}>
                      <InsertLinkIcon />
                    </IconButton> : 
                    <IconButton size="small" variant="outlined" color="primary" title="Email validation" onClick={() => { handleVarChange(index, 'gen_link', true)}}>
                      <MailLockIcon />
                    </IconButton>)}
                  {!input.needs_to_sign && !input.approve_only && 
                  (input.notify_only ? 
                    <IconButton size="small" variant="outlined" color="success" title="Notify only" onClick={() => {handleVarChange(index, 'notify_only', false); }}>
                      <NotificationsIcon />
                    </IconButton> : 
                    <IconButton size="small" variant="outlined" color="error" title="Notify only" onClick={() => { handleVarChange(index, 'notify_only', true); handleVarChange(index, 'approve_only', false); handleVarChange(index, 'needs_to_sign', false);}}>
                      <NotificationsOffIcon />
                    </IconButton>)
                  }
              </Stack>
                
                  
                  
                <Box>
                  <IconButton size="small" variant="outlined" color="error" title="Remove signer" onClick={() => { removeFields(index) }}>
                      <RemoveIcon />
                  </IconButton>
                </Box>
              </Stack>
          )
        })}
        {<IconButton size="small" variant="outlined" color="success" title="Add signer" onClick={() => { addFields() }}>
            <AddIcon />
        </IconButton>}
    </React.Fragment>
  );
}
