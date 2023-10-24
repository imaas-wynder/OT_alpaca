import './style/App.scss';
// import react libraries including those providing capabilities related to state management
import * as React from 'react';

import { useState } from "react";
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// import react libraries providing capabilities related to authentication using PKCE mechanism
import { AuthContext, AuthProvider, TAuthConfig, TRefreshTokenExpiredEvent } from "react-oauth2-code-pkce";
import jwtDecode from 'jwt-decode';

//FOR SENDING REST CALLS
import axios  from 'axios';
import http from 'http';
import https from 'https';

import { ErrorBoundary } from "react-error-boundary";



// MUI components
import { Button,
    Box,
    Backdrop,
    Stack,
    FormGroup,
    FormControlLabel,
    Switch,
    CircularProgress,
    LinearProgress,
    IconButton,
    Drawer,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tab,
    Snackbar,
    Alert,
    Tabs,
    TextField,
    Typography,
    Menu, MenuItem
  } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import PropTypes from 'prop-types';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { pink } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// components
import Scenario1 from './components/Scenario1';
import CallsList from './components/CallsList';
import InstancesList from './components/InstancesList';
import TypesList from './components/TypesList';
import NamespaceList from './components/NamespaceList';
import TraitsList from './components/TraitsList';
import CustomSearch from './components/CustomSearch';
import ACLList from './components/ACLList';
import DocumentCompare from './components/DocumentCompare';
import TaxonomyBrowse from './components/TaxonomyBrowse';
import TasksList from './components/TasksList';
import RecycleBin from './components/RecycleBin';



//Sample address: http://localhost:5000/?id=55&action=view
const queryParams = new URLSearchParams(window.location.search);
const urlObjectId = queryParams.get('id');
if (urlObjectId) {
  console.log('URL parameter object id: ' + urlObjectId);
}

const urlAction = queryParams.get('action');
if (urlAction) {
    console.log('URL parameter action: ' + urlAction);
    //action can be view, download, signature, automationload, automationrun, searchload
}


const urlActionId = queryParams.get('actionid');
if (urlActionId) {
    console.log('URL parameter action id: ' + urlActionId);
}



const urlSearchId = queryParams.get('searchid');
if (urlSearchId) {
    console.log('URL parameter search: ' + urlSearchId);
}

//check for login errors
const urlError = queryParams.get('error');
if (urlError) {
  console.log('URL error: ' + urlError);
}

const urlErrorDescription = decodeURIComponent(queryParams.get('error_description'));
if (urlErrorDescription) {
  console.log('URL error: ' + urlErrorDescription);
}

//end parameters

const stateVar = 'library_app_state';


function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography component="span">{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

// create authentication service connected to CPS (note use of env variables)

const authConfig = {
    clientId: localStorage.getItem('lib-appclientid') ?? process.env.REACT_APP_CLIENT_ID,
    authorizationEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + '/oauth2/auth',
    tokenEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + '/oauth2/token',
    logoutEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + '/oauth2/logout',
    redirectUri: localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI,
    scope: 'openid',
    onRefreshTokenExpire: (event) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login('library_app_state'),
    extraAuthParameters: {authhandler: process.env.REACT_APP_AUTH_HANDLER},
    autoLogin: false,
    clearURL: true,
    storage: 'session'
};

// create a react app
function App() { 
    // init auth service
    const {tokenData, token, login, logOut, idToken, idTokenData, error, loginInProgress} = React.useContext(AuthContext);

    //create custom instance of AXIOS  - since other JS API could interfere...
    const myAxios = axios.create({
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        timeout: 10000,
      });
    // add state variables

    const [firstLoad, setFirstLoad] = React.useState(true);
    
    const [value, setValue] = React.useState(urlAction==='searchload' ? 6 : 0);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [callArray, setCallArray] = React.useState([]);
    const [numberOfCalls, setNumberOfCalls] = React.useState(0);
    const [groups, setGroups] = React.useState([]);

    const [ignoreAuth, setIgnoreAuth] = React.useState(false);

    const [urlLoaded, setUrlLoaded] = React.useState(false);

    const [currentCall, setCurrentCall] = React.useState({});
    
    const [pause, setPause] = React.useState(Number(localStorage.getItem('lib-pause') ?? 0));
    const [showBorder, setShowBorder] = React.useState(localStorage.getItem('lib-show-border') === 'true');
    const [saveOutput, setSaveOutput] = React.useState(localStorage.getItem('lib-save-data') === 'true');
    const [debugPanel, setDebugPanel] = React.useState(localStorage.getItem('lib-debug-panel') === 'true');

    const [limitNr, setLimitNr] = React.useState(((isNaN(Number(process.env.REACT_APP_CALL_NUMBER)) ? 0 : Number(process.env.REACT_APP_CALL_NUMBER))));

    const [showExport, setShowExport] = React.useState(false);
    const [expVariable, setExpVariable] = React.useState(false);
    const [expVariableName, setExpVariableName] = React.useState('access_token');
    const [expClientId, setExpClientId] = React.useState('');
    const [expClientSecret, setExpClientSecret] = React.useState('');
    const [expPassword, setExpPassword] = React.useState('');
    const [expAuth, setExpAuth] = React.useState(true);

    
    const [showGroups, setShowGroups] = React.useState(false);
    const [showRecycleBin, setShowRecycleBin] = React.useState(false);
    
    const [showSnackBar, setShowSnackBar] = React.useState(false);
    const [snackBarMessage, setSnackBarMessage] = React.useState("");
    const [snackBarSeverity, setSnackBarSeverity] = React.useState("success");

    const [showBackdrop, setBackdrop] = useState(false);

    const [appDetailsOpen, setAppDetailsOpen] = useState(false);
    const [appClientId, setAppClientId] = React.useState(localStorage.getItem('lib-appclientid') ?? process.env.REACT_APP_CLIENT_ID);
    const [baseUrl, setBaseUrl] = useState(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL);
    const [redirectUrl, setRedirectUrl] = useState(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI);
    const [appTenantId, setAppTenantId] = React.useState(localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID);

    //for saved search - to store the search configuration in the app
    const [searchConfig, setSearchConfig] = useState({category: '', type: '', latest: true, filterArray: [], headCells: []});


    const handleSnackBarClose = () => {
        setShowSnackBar(false);
        setSnackBarMessage("");
      }
    
    // create login and logout methods
    const doLogin = () => {
        //authConfig.extraAuthParameters = {};
        console.log(authConfig.extraAuthParameters);
        login(stateVar);
    }; 
    const doLoginWithAuthId = () => {

        //authConfig.extraAuthParameters = {authhandler: process.env.REACT_APP_AUTH_HANDLER};
        console.log(authConfig.extraAuthParameters);
        login(stateVar);
    }; 



    const setNewApp = () => {
        localStorage.setItem('lib-appclientid', appClientId);
        localStorage.setItem('lib-apptenantid', appTenantId);
        localStorage.setItem('lib-appbaseurl', baseUrl);
        localStorage.setItem('lib-appredirecturl', redirectUrl);
        
        //reload app
        window.location.reload(true);
    }
    
    // Promise that resolves when the acces_token is refreshed.
    let tokenRefreshPromise = undefined;

    // Count the number of pending requests that are waiting for a token refresh
    let tokenRefreshWaitCount = 0;

    // refresh the token if 401 
    myAxios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const config = error?.config;
    
            if (error?.response?.status === 401 && !config?.sent) {
                config.sent = true;
                tokenRefreshWaitCount++;
    
                    if (tokenRefreshWaitCount === 1) {
                        // Only create a new tokenRefreshPromise for the first 401 after the previous refresh.
                        //tokenRefreshPromise = ...; //add code here for the manual fetch of the access_token from refresh_token
                    }
                    // Wait for the refreshed token before retrying.
                    // await tokenRefreshPromise.then((authTokens) => {
                    //     if (authTokens.access_token) {
                    //         config.headers = {
                    //             ...config.headers,
                    //             Authorization: `Bearer ${authTokens.access_token}`,
                    //         };
                    //     }
                    // });
                    //the new library is supposed to refresh the token before it expires, so this is commented out
                
                tokenRefreshWaitCount--;
    
        
                
                console.log(`Rerun request with status ${error?.response?.status}`)
                return myAxios(config);
                }
            
            return Promise.reject(error);
        }
    );



    const getGroups = () => { 
        try {
            let grpData = jwtDecode(idToken).grp.map(function (group) { 
                const fullGroupName = JSON.stringify(group);
                return (fullGroupName.substring(1, fullGroupName.indexOf('@')));
            });
            setGroups(grpData);
        } catch (error) {
            //cannot get groups
            console.log('Cannot read the groups from the token.');
        }
        
    }

    //tab panel change  
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleClickLogout = () => {
        logoutWithIdTokenHint(true, idToken); 
        setAnchorEl(null);
    }

    const handleNewCall = (call) => {

        let curArray = [...callArray];
        curArray.push(call);
        if (curArray.length>limitNr && limitNr>0) {
            curArray.splice(0, (curArray.length - limitNr));
        }
        setCallArray(curArray);
        setNumberOfCalls(numberOfCalls + 1);
        
    }

    const handleEditCall = (index, inExpanded) => {
        let curArray = [...callArray];
        let item = curArray[index];
        item.expanded = inExpanded;
        curArray.splice(index, 1, item);
        setCallArray(curArray);
        
    }

    const goToHomePage = () => {
        //ADD code to go to home page
    }
    
    const getLoggedInUserIcon = (name) => {
        const words = name.split(" ");
        let userIcon = "";
        userIcon += words[0].charAt(0);
        if (words.length > 1) userIcon += words[words.length - 1].charAt(0);
        else userIcon += words[0].charAt(1);
        return userIcon;
      };
    
    function stringToColor(string) {
        let hash = 0;
        let i;
      
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
          hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
      
        let color = '#';
      
        for (i = 0; i < 3; i += 1) {
          const value = (hash >> (i * 8)) & 0xff;
          color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */
      
        return color;
      }
      
      function stringAvatar(name) {
        if (!name) name='Anonymous'; 
        name=name.split("@")[0];

        return {
          sx: {
            bgcolor: stringToColor(name),
          },
          children: getLoggedInUserIcon(name),
        };
      }  

    // create method to for logout
    const logoutWithIdTokenHint = (shouldEndSession, idToken) => {
        logOut(stateVar);
        window.location.replace(
            (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + 
            '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + 
            '/oauth2/logout?id_token_hint=' + 
            encodeURIComponent(idToken) + 
            '&post_logout_redirect_uri=' + encodeURIComponent(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI)
        );
    }

    const debugWait = (req, processRes, successMessage, replaceVals) => {
        setTimeout(() => { runRequest(req, processRes, successMessage, replaceVals) }, pause);
    }

    // function to be used across components to log all calls
    /*usage: 
        req - Axios request, 
        processRes - function to process the response, 
        successMessage - message to show in the snackbar when the outcome is success. If you need to add any variables to the success message from the response, add variables in the success message
        replaceVals - array with objects to replace the variables in the response. Each object needs a name property and a node property
    example:

    let req = { 
      method: 'post', 
      data: {name: 'abc', description: 'def'},
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`} 
    };
    runRequest(req, (res) => {
            if (res.status==204) {
                //do something
            }
        }, 
        `Successfully created index idxName`, 
        [{name: 'idxName', node: 'name'}]);
    */

    const runRequest = (req, processRes, successMessage, replaceVals) => {
        setBackdrop(true);
        //console.log(localStorage.getItem('lib-appbaseurl'));
        //console.log(req.url);
        let shortUrl = req.url.replace(/^[a-z]{4,5}\:\/{2}[^/]+(\/.*)/, '$1')
	    //console.log("\nCall Sent\n"+req.method+"\n"+shortUrl)
        let status = '';
        let finalRes;

        // const original_open = XMLHttpRequest.prototype.open;

        // XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        //   console.log('Prototype url: ' + url);
        //   return original_open.call(this, method, url, ...rest);
        // };
        
        
        myAxios(req)
            .then(res => {
                //console.log("SUCCESS"); 
                status = 'SUCCESS';
                processRes(res);
                if (req.responseType!=='blob') {
                    finalRes=res.data;
                }
                //console.log(successMessage);
                if (successMessage) {
                    let outMessage=successMessage;
                    if (replaceVals && replaceVals.length>0) {
                        for (let i=0; i<replaceVals.length;i++) {
                            outMessage = outMessage.replace(RegExp(replaceVals[i].name,'g'), res.data[replaceVals[i].node] ?? '');
                        }
                    }
                    //console.log(outMessage);
                    setSnackBarMessage(`${outMessage}`);
                    setSnackBarSeverity('success');
                    setShowSnackBar(true);
                }
                
                      
            })
            .catch(err => { 
                console.log("ERROR running the call");
			    console.log(err);
                status = 'ERROR';
                if (err.response?.status && err.response?.status==401) {
                    if (!ignoreAuth) {
                        logOut(stateVar);
                        doLogin();
                    }
                    //code
                  }
                var errObj = {
                    status:(err.response && err.response.status)?err.response.status:-1,
                    message: (err.response && err.response.data && err.response.data.details)?getMessages(err.response.data):(err.message??'Error, please check the console log.')
                }
                //console.log(getMessages(err.response.data).split('|'));
                finalRes=err.response?.data ?? '';
                processRes(errObj);
                setSnackBarMessage(`${err.response?.data ? getMessages(err.response?.data) : (err.message??'Error, please check the console log.')}|Code: ${err.response?.status ? err.response?.status?.toString() : (err.code??'ERR')}`);
                setSnackBarSeverity('error');
                setShowSnackBar(true);
             })
            .finally(() => {
                let outService = '';
                let newUrl = '';
                outService = req.url.replace(/^[a-z]{4,5}\:\/{2}/, '').split('.')[0]==='css' ? 'css' : shortUrl.split('/')[1].split('-')[0];
                if (outService==='api') {
                    //this goes to the backend
                    if (shortUrl.split('/').length>=4) {
                        if (shortUrl.split('/')[2]==='forward') {
                            //this is a forward call
                            outService=shortUrl.split('/')[3].split('?')[0];
                            //build the end url
                            let parSvc = (shortUrl.split('?').length > 1) ? shortUrl.split('?')[1].split('&') : [];
                            
                            for (let p=0; p<parSvc.length; p++) {
                                if (parSvc[p].split('=')[0]==='url') {
                                    newUrl = '/signature/api/v1/' + decodeURIComponent(parSvc[p].split('=')[1]) + newUrl;
                                }
                                if (parSvc[p].split('=')[0]==='params') {
                                    newUrl = newUrl + '?' + decodeURIComponent(parSvc[p].split('=')[1]);
                                }
                            }
                        }
                    }    
                } 
                if (newUrl!='') {
                    shortUrl=newUrl;
                }
                
                const outCall = {
                    origUrl: req.url,
                    expanded: false,
                    method: req.method,
                    url: shortUrl.split('?')[0],
                    service: outService,
                    data: req.headers["Content-Type"]=='multipart/form-data' ? 'file-content' : (req.data ?? 'none'),
                    status: status,
                    header: req.headers,
                    params: (shortUrl.split('?').length>1)?shortUrl.split('?')[1]:'' 
                }
                if (finalRes && (saveOutput || status==='ERROR')) {
                    outCall.response=finalRes;
                }
                setCurrentCall(outCall);
                setBackdrop(false);
              })
      }
    
    const getMessages = (object) => {
        //console.log(object);
        if (!object) return '';
        let output = '';
        if (object.constructor===Array) {
            for (let i=0; i<object.length; i++) {
                output += getMessages(object[i]);
            }
        }
        if (object.constructor===Object) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var val = object[key];
                    
                    if (key=='message' || key=='details') {
                        if (val.constructor===Object) {
                            output += getMessages(val);
                        } else {
                            output += val + '|';} 
                        }
                    else {
                        output += getMessages(val);
                    }
                    
                    
                }
            }
        }
        if (object.constructor===String) {
            if (object.search('ERROR')==0) {
                output += object + '|';
            }
        }
        //console.log(output);
        return output;
    }
      
    const checkService = () => {
        let req = { 
            method: 'get', 
            url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/service`, 
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
        };
        runRequest(req, (res) => {});
 
    }

    const displayScriptTags = () => {
        const head = document.getElementsByTagName('head')[0];

        for (let i=0; i<head.childNodes.length; i++) {
          
          if (head.childNodes[i].nodeName.toLowerCase()==='script') {
           
            console.log(head.childNodes[i]);
    
          }
            
          
        }
    }


    const getCSSURL = () => {
        let curUrl = (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL);
        return curUrl.split('//')[0] + '//css.' + curUrl.split('//')[1];
    }

    const selectFile = (event) => {
    
      //add code for multi selection
      let curSelectedFile = event.target.files[0];
      var reader = new FileReader();
          reader.onload = function() {
            try {
              let values = JSON.parse(reader.result);
              if (values.client_public_id) setAppClientId(values.client_public_id);
              if (values.tenant_id) setAppTenantId(values.tenant_id);
            } catch (error) {
              console.log('Not a valid JSON');
              console.log(reader.result);
            }
          }
          reader.onerror = function (error) {
            console.log('Error: ', error);
          };
          if (curSelectedFile) reader.readAsText(curSelectedFile);
    }

    const selectConfidentialFile = (event) => {
    
        //add code for multi selection
        let curSelectedFile = event.target.files[0];
        var reader = new FileReader();
            reader.onload = function() {
              try {
                let values = JSON.parse(reader.result);
                if (values.client_id) setExpClientId(values.client_id);
                if (values.client_secret) setExpClientSecret(values.client_secret);
              } catch (error) {
                console.log('Not a valid JSON');
                console.log(reader.result);
              }
            }
            reader.onerror = function (error) {
              console.log('Error: ', error);
            };
            if (curSelectedFile) reader.readAsText(curSelectedFile);
      }

    const exportCallArray = () => {
        let postOut = {
            info: {
                name: 'OT LibraryApp Export', 
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            }
        }
        let itemCollection = [];
        let variable_collection = [];

        if (expAuth) {
          itemCollection.push(
            {
              name: "get-access-token",
              event: [{listen: "test",
                  script: {
                    exec: [
                      `pm.collectionVariables.set(\"${expVariableName}\", pm.response.json().access_token);`
                    ],
                    type: "text/javascript"
                  }}],
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    name: "Content-Type",
                    type: "text",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: `{\n    \"client_id\": \"{{la_client_id}}\",\n    \"client_secret\": \"{{la_client_secret}}\",\n    \"grant_type\": \"password\",\n    \"username\": \"{{la_username}}\",\n    \"password\": \"{{la_password}}\"\n}`
                },
                url: {
                  raw: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/tenants/{{la_tenant}}/oauth2/token`,
                  protocol: 'https',
                  host: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).replace(/^[a-z]{4,5}\:\/{2}/, '').split('.'),
                  path: [
                    "tenants",
                    "{{la_tenant}}",
                    "oauth2",
                    "token"
                  ]
                }
              }
            }
          )
          
        }

        for (let i=0; i<callArray.length;i++) {
            
            let headers = [];
            for ( var key in callArray[i].header ) {
                if (callArray[i].header.hasOwnProperty(key)) {
                    headers.push({
                        key: key, 
                        value: (key==='Authorization' ? `Bearer ${expVariable ? `{{${expVariableName}}}` : token}` : callArray[i].header[key]), 
                        type: 'text'
                    })
                }
            }
            let query = [];
            if (callArray[i].params) {
                for ( let p=0; p<callArray[i].params.split('&').length; p++ ) {
                    query.push({
                        key: callArray[i].params.split('&')[p].split('=')[0],
                        value: callArray[i].params.split('&')[p].split('=')[1]
                    })
                }
            }
            
            let body = {};
            if (callArray[i].header["Content-Type"]==='multipart/form-data') {
                body.mode = 'formdata';
                body.formdata = [
                    {
                        "key": (callArray[i].service==='css'? "file" :"File"),
                        "contentType": "",
                        "type": "file",
                        "src": ""
                    }
                ];
                body.options = {raw: {language: 'json'}}

            } else {
                if (callArray[i].data==='none') {
                    body.mode = 'none';
                } else {
                    body.mode = 'raw';
                    body.raw = JSON.stringify(callArray[i].data, null, 2).replace(/\\n/g, "\\n")
                                                                .replace(/\\'/g, "\\'")
                                                                .replace(/\\"/g, '\\"')
                                                                .replace(/\\&/g, "\\&")
                                                                .replace(/\\r/g, "\\r")
                                                                .replace(/\\t/g, "\\t")
                                                                .replace(/\\b/g, "\\b")
                                                                .replace(/\\f/g, "\\f");;
                    body.options = {raw: {language: 'json'}}
                }
                
            }

            let curItem = {
                name: `CPS ${callArray[i].service} ${callArray[i].method} - index: ${i}`,
                request: {
                    method: callArray[i].method.toUpperCase(),
                    header: headers,
                    body: body,
                    url: {
                        raw: `${callArray[i].service==='css' ? getCSSURL() : (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}${callArray[i].url}${callArray[i].params ? `?${callArray[i].params}` : ``}`,
                        protocol: 'https',
                        host: (callArray[i].service==='css' ? getCSSURL() : (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)).replace(/^[a-z]{4,5}:\/{2}/, '').split('.'),
                        path: callArray[i].url.split('.'),
                        query: query
                    }
                }
            
            };

            itemCollection.push(curItem);
        }

        postOut.item = itemCollection;
        if (expAuth && expVariable) {
            variable_collection.push({key: expVariableName, value: ''});
            variable_collection.push({key: 'la_client_id', value: expClientId});
            variable_collection.push({key: 'la_client_secret', value: expClientSecret});
            variable_collection.push({key: 'la_username', value: idTokenData?.name}); 
            variable_collection.push({key: 'la_password', value: expPassword});
            variable_collection.push({key: 'la_tenant', value: process.env.REACT_APP_TENANT_ID});
            postOut.variable = variable_collection;
        }


        let fContent = new Blob([JSON.stringify(postOut, null, 2)], {type: 'text/plain'});
        // create file link in browser's memory
        const href = URL.createObjectURL(fContent);
        // create "a" HTLM element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', 'collectionExport.json'); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        setShowExport(false);
    }


     // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
    useEffect(
        () => {
          console.log(`Token changed`); 
        if (token && firstLoad && !urlError) {
            //console.log(idTokenData);
            console.log("Start app - checking service status");
            checkService();
            getGroups();
            if (urlAction==='viewTask' && urlObjectId && !urlLoaded) {
                setValue(1);
            }
            setFirstLoad(false);
        } else {
          console.log(token ? 'New token received' : 'No token yet');  
        }
        
        },[token]
    );

    useEffect(
        () => {

        if (JSON.stringify(currentCall)!=='{}') {
            if (currentCall.response && (currentCall.response instanceof Blob)) {
                let fr = new FileReader();
                fr.onload = function() {
                    try {
                        currentCall.response=(JSON.parse(fr.result));
                    } catch (error) {
                        currentCall.response={errorBlob: fr.result};
                    }
                    
                    handleNewCall(currentCall);
                };
                fr.readAsText(currentCall.response);
            } else {
                handleNewCall(currentCall);
            }
        }
        
        },[currentCall]
    );

    

    useEffect(() => {
        localStorage.setItem('lib-debug-panel', debugPanel);
      }, [debugPanel]);

    useEffect(() => {
        localStorage.setItem('lib-save-data', saveOutput);
      }, [saveOutput]);
    
    useEffect(() => {
        localStorage.setItem('lib-show-border', showBorder);
      }, [showBorder]);

    useEffect(() => {
        localStorage.setItem('lib-pause', pause);
      }, [pause]);



    // display app
    return (
        <div className="App">
            {(!loginInProgress && token) && 
            <header className="page-header">
                <div className="logo">
                    <Button variant="icon" onClick={() => setDebugPanel(!debugPanel)}>
                        <MoreVertIcon/>
                    </Button>
                    {numberOfCalls && <Typography variant="button" display="block" noWrap sx={{ color: 'white' }}>({numberOfCalls})</Typography>}
                    </div>
                    <div  className="header-title">
                        <img
                        src="./images/Opentext_LibraryApplication.svg"
                        alt="Opentext Library Application"
                        />{" "}
                        <img
                        src="./images/powered_by.svg"
                        alt="Powered by OpenText Developer Cloud"
                        style={{ "paddingLeft": "8px", "paddingTop": "8px" }}
                        />
                    </div>
                    {showBackdrop && <Stack direction="row" sx={{display: 'flex',
                        height: '100%',
                        p: 0,
                        alignItems: 'center',
                        justifyContent: 'flex-start',}}>
                            <ScreenshotMonitorIcon />
                            <Box sx={{
                            width: '30%'
                            }}>
                                <LinearProgress color="success"/>
                            </Box>
                            <CloudSyncIcon />
                    </Stack>}
                    
                    
                    
                    <div className={debugPanel ? "header-menu-debug" : "header-menu"}>
                    <Button
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                    >
                        <Avatar {...stringAvatar(idTokenData?.name)} />
                    </Button>
                    <Menu
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => {setShowRecycleBin(true); setAnchorEl(null);}}>Recycle Bin</MenuItem>
                        <MenuItem onClick={handleClickLogout}>Logout {idTokenData?.name && idTokenData.name.split("@")[0]}</MenuItem>
                        <MenuItem onClick={() => {setIgnoreAuth(!ignoreAuth)}}>{ignoreAuth ? 'Ignore 401 error' : 'Logout on 401 error'}</MenuItem>
                        <MenuItem onClick={() => {setShowGroups(true); setAnchorEl(null);}}>{`Groups`}</MenuItem>
                        <MenuItem onClick={() => {displayScriptTags(); setAnchorEl(null);}}>{`Head <script>`}</MenuItem>
                        
                    </Menu>
                </div>
            </header>}
            
            {(!error && token && !loginInProgress) && 
                <div className="page-content">
                {/* {<div><pre>{JSON.stringify(tokenData,null,2)}</pre></div>} */}
                {/* {<div><pre>{JSON.stringify(idTokenData,null,2)}</pre></div>} */}
                {/* {<div>{`Token: ${token}`}</div>} */}
                  <Box sx={{ width: debugPanel?'75vw':'100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Library browse" {...a11yProps(0)} />
                        <Tab label="Workflow tasks" {...a11yProps(1)} />
                        <Tab label="Namespaces" {...a11yProps(2)} />
                        <Tab label="Types" {...a11yProps(3)} />
                        <Tab label="Traits" {...a11yProps(4)} />
                        <Tab label="ACL" {...a11yProps(5)} />
                        <Tab label="Custom Search" {...a11yProps(6)} />
                        <Tab label="Document Compare" {...a11yProps(7)} />
                        <Tab label="Taxonomy Browse" {...a11yProps(8)} />
                      </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                        <Scenario1 
                            runRequest={debugWait} 
                            token={token} 
                            userName={idTokenData?.name} 
                            showBorder={showBorder} 
                            selectObject={()=>{}} 
                            isSelect={false} 
                            currentFolder={()=>{}}
                            inUrlId = {urlAction!=='viewTask' ? urlObjectId : ''}
                            inUrlAction = {urlAction!=='viewTask' ? urlAction : ''}
                            inUrlActionId = {urlActionId}
                            urlLoaded = {urlLoaded} 
                            setUrlLoaded = {setUrlLoaded}/>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <TasksList 
                            runRequest={debugWait} 
                            token={token} 
                            userName={idTokenData?.name} 
                            showBorder={showBorder} 
                            email={idTokenData?.email}
                            inUrlId = {urlAction==='viewTask' ? urlObjectId : ''}
                            inUrlAction = {urlAction==='viewTask' ? urlAction : ''}
                            inUrlActionId = {urlActionId}
                            urlLoaded = {urlLoaded} 
                            setUrlLoaded = {setUrlLoaded}/>
                        {/* <InstancesList runRequest={debugWait} token={authService.getAuthTokens().access_token} userName={authService.getUser().name.split("@")[0]} showBorder={showBorder}/> */}
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <NamespaceList runRequest={debugWait} token={token} userName={idTokenData?.name && idTokenData.name.split("@")[0]} showBorder={showBorder}/>
                    </TabPanel>
                    <TabPanel value={value} index={3}>
                        <TypesList runRequest={debugWait} token={token} userName={idTokenData?.name && idTokenData.name.split("@")[0]} showBorder={showBorder}/>
                    </TabPanel>
                    <TabPanel value={value} index={4}>
                        <TraitsList runRequest={debugWait} token={token} userName={idTokenData?.name && idTokenData.name.split("@")[0]} showBorder={showBorder}/>
                    </TabPanel>
                    <TabPanel value={value} index={5}>
                        <ACLList 
                            runRequest={debugWait} 
                            token={token} 
                            userName={idTokenData?.name && idTokenData.name.split("@")[0]} 
                            showBorder={showBorder}
                            isSelect={false}
                            setOutId={()=>{}}/>
                    </TabPanel>
                    <TabPanel value={value} index={6}>
                        <CustomSearch 
                            runRequest={debugWait} 
                            token={token} 
                            userName={idTokenData?.name && idTokenData.name.split("@")[0]} 
                            showBorder={showBorder}
                            searchConfig={searchConfig} 
                            setSearchConfig = {(obj) => setSearchConfig(obj)}
                            inUrlSearchId = {urlSearchId}
                            urlLoaded = {urlLoaded} 
                            setUrlLoaded = {setUrlLoaded}
                            />
                    </TabPanel>
                    <TabPanel value={value} index={7}>
                        <DocumentCompare 
                            runRequest={debugWait} 
                            token={token} 
                            userName={idTokenData?.name && idTokenData.name.split("@")[0]} 
                            showBorder={showBorder}/>
                    </TabPanel>
                    <TabPanel value={value} index={8}>
                        <TaxonomyBrowse 
                            runRequest={debugWait} 
                            token={token} 
                            userName={idTokenData?.name && idTokenData.name.split("@")[0]} 
                            showBorder={showBorder}
                            />
                    </TabPanel>
                  </Box>
                    
                  </div>}
                  {(!loginInProgress && token) && <Drawer
                    anchor={'right'} 
                    variant='persistent' 
                    open={debugPanel}
                    onClose={() => {}}
                >
                    <Box>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" p={2}>
                            <TextField
                                margin="dense"
                                id="interval" 
                                key="interval"
                                variant="standard" 
                                type={'number'}
                                sx={{width: 70}} 
                                label="Pause (ms)" 
                                value={pause} 
                                onChange={e => {if (!isNaN(Number(e.target.value))) setPause(e.target.value)}}
                                />
                            <TextField
                                margin="dense"
                                id="lastcalls" 
                                key="lastcalls"
                                variant="standard" 
                                type={'number'}
                                sx={{width: 40}} 
                                label="Limit" 
                                value={limitNr} 
                                onChange={e => {if (!isNaN(Number(e.target.value))) setLimitNr(e.target.value)}}
                                />
                            <FormGroup>
                                <FormControlLabel control={<Switch checked={showBorder} onChange={e => { setShowBorder(e.target.checked) }} name="showBorder" size="small"/>} label="Border" labelPlacement="top" />
                            </FormGroup>
                            <FormGroup>
                                <FormControlLabel control={<Switch checked={saveOutput} onChange={e => { setSaveOutput(e.target.checked) }} name="saveOutput" size="small"/>} label="Data" labelPlacement="top"/>
                            </FormGroup>
                            <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { setCallArray([]) }}>
                                <RefreshIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="primary" title="Export to Postman collection" onClick={() => { setShowExport(true) }}>
                                <SystemUpdateAltIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box height="90%" width="25vw" sx={{
                        padding:1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        overflowY: "auto", 
                        overflowX: "hidden", 
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
                          }
                        }}>
                        
                        <CallsList callsArray = {callArray} />
                    </Box>
                    
                </Drawer>}
                  <Dialog
                    open={(!token && !loginInProgress)} onClose={() => {}}>
                    <DialogTitle>Login</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You are not logged in. Click below to start the login process.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { doLogin() }} variant="contained" color="primary">
                            Login
                        </Button>
                        {process.env.REACT_APP_AUTH_HANDLER && process.env.REACT_APP_AUTH_NAME && 
                            <Button onClick={() => { doLoginWithAuthId(); }} variant="contained" color="primary">
                                {`Login with ${process.env.REACT_APP_AUTH_NAME}`}
                            </Button>
                        }
                        <Button onClick={() => { setAppDetailsOpen(true) }} variant="contained" color="primary">
                            Settings
                        </Button>
                    </DialogActions> 
                </Dialog>
                <Dialog
                    open={showExport} onClose={() => {setShowExport(false)}}>
                    <DialogTitle>Export to Postman</DialogTitle>
                    <DialogContent className="add-document">
                      <Stack direction={'column'} spacing={1}>
                        {expVariable && expAuth && <div className="inline"> 
                            <label htmlFor="files">
                                <Button component="span">Select confidential json file...</Button>
                            </label>
                            <input id="files" type="file" accept="*.json" className="file-input" onChange={selectConfidentialFile} multiple={false} />
                        </div>}
                        <FormGroup>
                            <FormControlLabel control={<Switch checked={expVariable} onChange={e => { setExpVariable(e.target.checked) }} name="expVar" size="small"/>} label="Export auth token as variable" labelPlacement="end" />
                        </FormGroup>
                        {expVariable && <TextField
                          margin="dense"
                          id="varname" 
                          key="varname"
                          variant="standard" 
                          type={'text'}
                          fullWidth
                          label="Variable name" 
                          value={expVariableName} 
                          onChange={e => { setExpVariableName(e.target.value)}}
                          />}
                          <FormGroup>
                              <FormControlLabel control={<Switch checked={expAuth} onChange={e => { setExpAuth(e.target.checked) }} name="expAuth" size="small"/>} label="Export authentication call" labelPlacement="end" />
                          </FormGroup>
                          {expAuth && expVariable && <TextField
                          margin="dense"
                          id="client_id" 
                          key="client_id"
                          variant="standard" 
                          type={'text'}
                          fullWidth
                          label="Client id" 
                          value={expClientId} 
                          onChange={e => { setExpClientId(e.target.value)}}
                          />}
                          {expAuth && expVariable && <TextField
                          margin="dense"
                          id="client_secret" 
                          key="client_secret"
                          variant="standard" 
                          type={'password'}
                          fullWidth
                          label="Client secret" 
                          value={expClientSecret} 
                          onChange={e => { setExpClientSecret(e.target.value)}}
                          />}
                          {expAuth && expVariable && <TextField
                          margin="dense"
                          id="password" 
                          key="password"
                          variant="standard" 
                          type={'password'}
                          fullWidth
                          label="Password" 
                          value={expPassword} 
                          onChange={e => { setExpPassword(e.target.value)}}
                          />}
                      </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { exportCallArray() }} variant="contained" color="primary">
                            Export
                        </Button>
                        <Button onClick={() => { setShowExport(false) }} variant="contained" color="primary">
                            Close
                        </Button>
                    </DialogActions> 
                </Dialog>
                <Dialog
                    open={appDetailsOpen} onClose={() => {setAppDetailsOpen(false);}}>
                    <DialogTitle>Application details</DialogTitle>
                    <DialogContent className="add-document">
                        <DialogContentText>
                            Please set the following details:
                        </DialogContentText>
                        <div className="inline"> 
                            <label htmlFor="files">
                            <Button component="span">Select public json file...</Button>
                            </label>
                            <input id="files" type="file" accept="*.json" className="file-input" onChange={selectFile} multiple={false} />
                        </div>
                        
                        <TextField
                            autoFocus
                            margin="dense"
                            id="appTenantId"
                            label="Tenant ID"
                            type="id"
                            fullWidth
                            required
                            variant="standard" 
                            value={appTenantId}
                            onChange={e => {setAppTenantId(e.target.value)}}
                        />
                        <TextField
                            margin="dense"
                            id="appClientId"
                            label="Client ID"
                            type="id"
                            fullWidth
                            required
                            variant="standard" 
                            value={appClientId}
                            onChange={e => {setAppClientId(e.target.value)}}
                        />
                        <TextField
                            margin="dense"
                            id="baseUrl"
                            label="Base URL"
                            type="url"
                            fullWidth
                            required
                            variant="standard" 
                            value={baseUrl}
                            onChange={e => {setBaseUrl(e.target.value)}}
                        />
                        <TextField
                            margin="dense"
                            id="redirecturl"
                            label="Redirect URL"
                            type="url"
                            fullWidth
                            required
                            variant="standard" 
                            value={redirectUrl}
                            onChange={e => {setRedirectUrl(e.target.value)}}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setAppClientId(process.env.REACT_APP_CLIENT_ID); setAppTenantId(process.env.REACT_APP_TENANT_ID); setBaseUrl(process.env.REACT_APP_BASE_URL); setRedirectUrl(process.env.REACT_APP_REDIRECT_URI) }} variant="contained" color="primary">
                            Reload
                        </Button>
                        <Button disabled={!appClientId || !appTenantId || !baseUrl || !redirectUrl} onClick={() => { setNewApp(); }} variant="contained" color="primary">
                            Update
                        </Button>
                        <Button onClick={() => { setAppDetailsOpen(false); }} variant="contained" color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={(((error!=='') && (error!==null)) || ((urlError!=='') && (urlError!==null)) || loginInProgress)} onClose={() => {}}>
                    <DialogTitle>{(!urlError && !error) ? 'Loading application...' : 'Login error'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{color: ((urlError || error)?'red':'-moz-initial')}}>
                            {(!urlError && !error) && 'Authenticating...'}
                            {(urlError) ? urlErrorDescription : (error ? error : '')}
                            
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { logOut(stateVar); }} variant="contained" color="primary">
                            Logout
                        </Button>
                        <Button onClick={() => { logOut(stateVar); doLogin(); }} variant="contained" color="primary">
                            Reset
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={showGroups} onClose={() => {setShowGroups(false)}}>
                    <DialogTitle>Groups</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                          {groups.join(',')}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        
                        <Button onClick={() => { setShowGroups(false) }} variant="contained" color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {(!loginInProgress && token) && <Dialog maxWidth={'xl'} fullWidth 
                    open={showRecycleBin} onClose={() => {setShowRecycleBin(false)}}>
                    <DialogTitle>Recycle Bin</DialogTitle>
                    <DialogContent>
                        <RecycleBin runRequest={debugWait} token={token} userName={idTokenData?.name && idTokenData.name.split("@")[0]} showBorder={showBorder}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setShowRecycleBin(false) }} variant="contained" color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>}
            
                <Backdrop style={{ zIndex: 9999 }} open={false}>
                    <CircularProgress color="inherit" />
                </Backdrop>

            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={showSnackBar}
              autoHideDuration={5000}
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
                {snackBarMessage.split('|').map((text, index) => (
                    <Typography display="block" key={'alert'+index}>{text}</Typography>
                ))}
              
            </Alert>
          </Snackbar>
            
        </div>
    );
}

// add error boundary for the token decode
function fallbackRender({ appError, resetErrorBoundary, login, logOut }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    
  
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: "red" }}>{appError.message}</pre>
        <Button onClick={() => { logOut(stateVar); login(stateVar); }} variant="contained" color="primary">
            Reset login
        </Button>
      </div>
    );
  }

// add auth provider around app
function WrappedSecuredApp() { 
  const {tokenData, token, login, logOut, idToken, error} = React.useContext(AuthContext);
    console.log('App init - wrapping authService');
    // if (error) {
    //   console.log(error);
    //   login(stateVar);
    // }
    
    return (
        <ErrorBoundary
            fallbackRender={(error, resetErrorBoundary) => fallbackRender(error, resetErrorBoundary, login, logOut)}
            onReset={(details) => {
                // Reset the state of your app so the error doesn't happen again
            }}
            >
          <AuthProvider authConfig={authConfig} >
              <App />
          </AuthProvider>
        </ErrorBoundary>
        
    );
}

export default WrappedSecuredApp;