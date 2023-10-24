import * as React from 'react';
import { useState } from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import LoginIcon from '@mui/icons-material/Login';

// MUI components
import { 
  Box,
  TextField,
  IconButton,
  Typography,
  Stack
} from '@mui/material';

 

export default function CoreContentView(props) {
  const { nodeId, ccToken, ccURL, subscriptionName, ccLocale, ccAuth, runRequest } = props;

  const [token, setToken] = useState(ccToken ?? '');
  const [message, setMessage] = useState('');
  const [otdsUrl, setOtdsUrl] = useState(ccAuth?.otds_url ?? '');
  const [tenantId, setTenantId] = useState(ccAuth?.tenant_id ?? '');
  const [clientId, setClientId] = useState(ccAuth?.client_id ?? '');
  const [clientSecret, setClientSecret] = useState(ccAuth?.client_secret ?? '');
  const [username, setUserName] = useState(ccAuth?.username ?? '');
  const [password, setPassword] = useState(ccAuth?.password ?? '');
  const [jsState, setJsState] = useState(false);


  const handleGetToken = () => {
    setMessage('');
    
    let req = { 
      method: 'post', 
      url: `${otdsUrl}/otdstenant/${tenantId}/oauth2/token`, 
      headers: { 'Accept': '*/*', 'Content-Type': 'application/x-www-form-urlencoded'},
      data: `username=${username}&password=${encodeURIComponent(password)}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=password&client_data=${encodeURIComponent(`subName=${subscriptionName}`) }` 
    };
    runRequest(req, (res) => {
      
      if (res.status===200 && res.data.access_token) {
        setToken(res.data.access_token);
        console.log('CC token: ' + res.data.access_token);
      } else {
        setMessage(res.message ?? 'Error getting token from Core Content. Please check login information.')
      }
      
    });
  };

  const jsInject = (isForce) => {
    if (!window.csui?.ready || isForce) {
      var m = document.createElement("script");
      m.setAttribute('type','text/javascript');
      m.setAttribute('src', `${ccURL}/widgets?crossOrigin=true&locale=${ccLocale ?? 'en'}`);
      m.setAttribute('id', `cc_view_js`);
      //remote loading
      console.log("Adding js file: " + `${ccURL}/widgets?crossOrigin=true&locale=${ccLocale ?? 'en'}`);
      document.getElementsByTagName("head")[0].appendChild(m);
    }
    
  }

  const jsEject = () => {
    
    let remainingTags = true;
    //window.csui = null; //to force an error and see where it comes from


    while (remainingTags) {
        remainingTags = false;
        const head = document.getElementsByTagName('head')[0];
        for (let i=0; i<head.childNodes.length; i++) {
          //if src starts with a / it means it is local, keep it. Exception ./otwc...
          //if there is no src, we should remove it
          //if the id is 'default_added' then we keep it
          if (head.childNodes[i].nodeName.toLowerCase()==='script') {
              if (head.childNodes[i].src && (head.childNodes[i].src.search(/\/main/)>-1 || head.childNodes[i].id==='default_added') )
              {
              //console.log('Keeping js:');
              
              } else {
                //console.log('Deleting js:');
                remainingTags=true; //to reload the head and check again
                head.removeChild(head.childNodes[i]);
              }
              
          }
        }
    }
     
      //unloading the ones I added
      console.log("Removing js file: cc_view_js");
      
      var elem = document.getElementById("cc_view_js");
      while (elem) {
        elem.parentNode.removeChild(elem);
        elem = document.getElementById("cc_view_js");
      }
      
    
  }

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function componentWait() {
    console.log("Waiting for component to be  ready...");
  
    while (!window.csui) {
      //console.log('Not ready');
      await sleep(500);
    }
    console.log("Component is ready.");

    //console.log('Go to cc init')
    handleCCInit();
    
  }

  const handleCCInit = () => {
    if (!token) return;
    console.log('Start cc');

    window.csui.setLanguage('en');

    window.csui.onReady2(
      ['csui/lib/jquery', 'ot2cm/integration/folderbrowser2/folderbrowser2.widget'],
      function ($, FolderBrowserWidget) {
        console.log('Reached onReady2');
        
        var connection = {
          url: `${ccURL}/api/v1`,
          session: {ticket: "Bearer "+ token}
        };
        var options = {
          connection: connection,
          breadcrumb: false,
          favorites: false,
          start: {id: nodeId},
          elementId: "cc-browser2-content",
          subscriptionURL: `${ccURL}/subscriptions/${subscriptionName}`,
          search: true,
          backButton: false,
          commandsToBlacklist: 'ApplyPolicy,ApplyHold'
        
        };
        var browser = new FolderBrowserWidget(options);
        jsInject(!jsState); //not sure why but the first time it loads I need to load the js file again...
      });
  }

  



  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      console.log('Core content loading.');
      setJsState(window.csui?.ready);
      jsInject();
      if (XMLHttpRequest.prototype._cc_open) {
        //set the XHR function back to the interceptor function
        XMLHttpRequest.prototype.open = XMLHttpRequest.prototype._cc_open;
      }
      

      if (!token && clientId && clientSecret && username && password) {
        console.log('Getting token...');
        handleGetToken();
      }

      return () => {
        console.log('Core Content unloading.');
        jsEject();
        if (XMLHttpRequest.prototype._original_open) {
          //reset the XHR function back to the initial state
          //save the interceptor function for the next time we will need it
          XMLHttpRequest.prototype._cc_open = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = XMLHttpRequest.prototype._original_open;
        }
        
      }
       
    },[]
    );

  useEffect(
    () => {
      if (token) {
        
        componentWait();
      }  
    },[token]
    );

  return (
    <React.Fragment>
        {!token && <React.Fragment>
          <Stack direction={'column'} spacing={1}>
            
            {message && <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word',
                color: 'red'
                }}>
              {message}
            </Typography> }
            {(!ccAuth.otds_url || !ccAuth.tenant_id) && <Stack direction={'row'} spacing={3}  alignItems={'center'}>
              {<TextField
                  margin="dense"
                  id="cc_otdsurl"
                  label="Core Content OTDS URL"
                  type="cc_otdsurl"
                  fullWidth
                  variant="standard" 
                  value={otdsUrl}
                  onChange={e => {setOtdsUrl(e.target.value)}}
                />}
                {
                <TextField
                  margin="dense"
                  id="cc_tenantid"
                  label="Tenant ID"
                  type="cc_tenantid"
                  fullWidth
                  variant="standard" 
                  value={tenantId}
                  onChange={e => {setTenantId(e.target.value)}}
                />}
            </Stack>}
            {(!ccAuth.client_id || !ccAuth.client_secret) && <Stack direction={'row'} spacing={3}  alignItems={'center'}>
            {
                <TextField
                  margin="dense"
                  id="cc_clientid"
                  label="Client ID"
                  type="cc_clientid"
                  fullWidth
                  variant="standard" 
                  value={clientId}
                  onChange={e => {setClientId(e.target.value)}}
                />}
                {
                <TextField
                  margin="dense"
                  id="cc_clientsecret"
                  label="Client Secret"
                  type="password"
                  fullWidth
                  variant="standard" 
                  value={clientSecret}
                  onChange={e => {setClientSecret(e.target.value)}}
                />}
                
            </Stack>}
            {(!ccAuth.username || !ccAuth.password) && <Stack direction={'row'} spacing={3}  alignItems={'center'}>
                {
                <TextField
                  margin="dense"
                  id="cc_username"
                  label="User name"
                  fullWidth
                  variant="standard" 
                  value={username}
                  onChange={e => {setUserName(e.target.value)}}
                />}
                {
                <TextField
                  margin="dense"
                  id="cc_password"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="standard" 
                  value={password}
                  onChange={e => {setPassword(e.target.value)}}
                />}
                
            </Stack>}
            <Stack direction={'row-reverse'} >
              <IconButton
                aria-label="login"
                onClick={() => handleGetToken()}
                disabled={!password || !username || !clientId || !clientSecret}
              >
                <LoginIcon/>
              </IconButton>
            </Stack>
          </Stack>
          
          
          </React.Fragment>}
          
        {/*--token && <div style={{height: '70vh', overflow: 'hidden', border: '1px solid darkgrey', borderRadius: 5, }}>
          <div id="cc-browser2-content"></div>
                </div>--*/}
        {token && 
          <div id="cc-browser2-content" style={{height: '70vh', overflow: 'hidden', border: '1px solid darkgrey', borderRadius: 5, }}>{!window.csui?.ready ? 'Loading JS component...' : ''}</div>
                }
                
    </React.Fragment>
  );
}
