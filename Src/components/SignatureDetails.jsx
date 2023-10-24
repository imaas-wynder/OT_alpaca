import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


// MUI components
import {
  Box,
  Button,
  Typography,
  Grid,
  Stack,
  Table, 
  InputLabel,
  TableContainer, 
  Paper, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Select,
  MenuItem,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
  IconButton
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import SignersView from './SignersView';

function ValueDisplay(props) {
  const { label, value } = props;

  return (
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
            {label}:
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
              {value}
          </Box>
      </Typography>
    </Stack>
  );
}


  export default function SignatureDetails(props) {
    const {  docObject, runRequest, token, userName, showBorder } = props;
    
    const [signatureDetails, setSignatureDetails] = React.useState({});
    const [documentDetails, setDocumentDetails] = React.useState({});
    const [activeId, setActiveId] = React.useState('');

    const [prepareDocument, setPrepareDocument] = React.useState(false);
    
    const [blobId, setBlobId] = React.useState('');
    const [processDoc, setProcessDoc] = React.useState(false);
    
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [selectedFileName, setSelectedFileName] = React.useState('');

    const [subject, setSubject] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [redirect, setRedirect] = React.useState(``);
    const [who, setWho] = React.useState('');
    const [isSimple, setIsSimple] = React.useState(true);
    const [simpleEmail, setSimpleEmail] = React.useState('');

    const [signersArray, setSignersArray] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState(false);
    const [sendSMS, setSendSMS] = React.useState(false);

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

    const getDocumentContents = (componentId) => {
      addActiveId(componentId);
      setProcessDoc(true);
  
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${docObject.id}/contents`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
  
      runRequest(req, (res) => {
        if (res.data && res.data._embedded) {
          res.data._embedded.collection.forEach( item => {
            if (item.rendition_type=='primary') {
              //call download file
              setBlobId(item.blob_id);
              setSelectedFileName(item.name);
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
          setSelectedFile(res.data);
        }
        setBlobId(''); 
        removeActiveId(componentId);
        
      }, '', []);
    }

    const signCreateDocument = (componentId) => {
      addActiveId(componentId);
  
      var reader = new FileReader();
    
      reader.readAsDataURL(selectedFile);
      reader.onload = function () {
        const regex = /data:.*base64,/
        removeActiveId(componentId);
        signUploadDoc(reader.result.replace(regex,""), 'docUpload');
      };
      reader.onerror = function (error) {
        //console.log('Error: ', error);
        setProcessDoc(false);
        removeActiveId(componentId);
      };
        
      
    }

    const signUploadDoc = (fileBase64, componentId) => { 
      addActiveId(componentId);

      let data = {
        file_from_content: fileBase64,
        file_from_content_name: selectedFileName ? selectedFileName:'Document to sign.pdf'
      }
    
      if (process.env.REACT_APP_SIGNATURE_CALLBACK_URL) {
        data.events_callback_url = process.env.REACT_APP_SIGNATURE_CALLBACK_URL;
      }
    
      if (docObject.id) {
        data.external_id = docObject.id;
      }

      let req = {
        method: 'post',
        url: `/api/forward/signature?url=${encodeURIComponent(`documents/`)}`,
        headers: { 'Accept': '*/*',  "Content-Type": "application/json" },
        data: data
      }


      runRequest(req, (res) => {
        //console.log('Reached output function')
        removeActiveId(componentId);
        if (res.data) {
          if (prepareDocument) {
            if (true) {
              //create signature request
              signCreateRequest(res.data.url, 'signCreate');
              setSelectedFile(null);
                          
            } else {
              //send it to popup to create the signature request there
              setProcessDoc(false);
              setDocumentDetails({
                completed: false
              });
              getDocumentDetails('docLabel');
              let outSigners = [];
              for (let i=0; i<signersArray.length; i++) {
                outSigners.push(signersArray[i].email);
              }

              const signConf = {
                api: 'v1',
                who: who,
                signers: outSigners.join(','),
                close: true,    // Close the popup when done. Default: true
                // or use next:
                next: '',       // Redirect to this URL when done signing
                auth_provider: 'opentext_ot2',
                site: process.env.REACT_APP_SIGNATURE_TENANTID //tenant id

              };


              window.CoreSignature.browser.setConfig({host: process.env.REACT_APP_SIGNATURE_URL});
              window.CoreSignature.browser.openSetupPopupWithDocUUID(res.data.uuid, signConf, {width: 1000, height: 1000});
            }
            
            
          } else {
            signCreateRequest(res.data.url, 'signCreate');
            setSelectedFile(null);
          }
          
        }
      }, '', []);
    } 

    const sendSMSApi = (phone, message) => {
      let req = { 
        method: 'post', 
        url: `/api/notification/sms`, 
        headers: { 'Accept': '*/*',  "Content-Type": "application/json" },
        data: {
              number: phone, 
              message: message
        }
      };
      runRequest(req, (res) => {
        
        
      }, '', []);
    }

    const signCreateRequest = (url, componentId) => { 
      addActiveId(componentId);

      let outSigners = [];

      if (isSimple) {
        outSigners.push({email: simpleEmail, order: 1, needs_to_sign: true});
        outSigners.push({email: process.env.REACT_APP_SIGNATURE_ACCOUNT, order: 2, needs_to_sign: true});
      } else {
        for (let i=0; i<signersArray.length; i++) {
          let curItem = {
            email: signersArray[i].email, 
            full_name: signersArray[i].full_name, 
            order: signersArray[i].order, 
            approve_only: (signersArray[i].approve_only ?? false), 
            needs_to_sign: (signersArray[i].needs_to_sign===true ? true : false),
            notify_only: (signersArray[i].notify_only ?? false),
            in_person: (signersArray[i].in_person ?? false),
          };
          if (signersArray[i].password && signersArray[i].password!=='') {
            curItem.password = signersArray[i].password;
            if (signersArray[i].phone && sendSMS) {
              sendSMSApi(signersArray[i].phone, `Dear ${signersArray[i].full_name}, here is your one time password for signing ${docObject.name}: ${signersArray[i].password}.`)
            }
          }
          if (signersArray[i].gen_link) {
            curItem.embed_url_user_id = signersArray[i].email;
          }
          if (signersArray[i].email===process.env.REACT_APP_SIGNATURE_ACCOUNT) {
            //is this the first signer? (order is minimum?)
            let firstSigner = true;
            for (let s=0; s<signersArray.length; s++) {
              if (signersArray[s].order<signersArray[i].order) {
                firstSigner = false;
              }
            }

            if (firstSigner) {
              curItem.embed_url_user_id = signersArray[i].email;
              curItem.redirect_url = `${(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI)}/?id=${docObject.id}&action=signature`;
            }
            
          }
          outSigners.push(curItem);
        }
      }

      

      let data = {
        document: url,
        message: isSimple ? 'Please sign this document. Follow the link below to see and sign it from <i>any</i> device.' : message,
        subject: isSimple ? 'Simple signature request from the OT2 Library Application' : subject,
        send_reminders: true,
        disable_emails: true,
        who: isSimple ? 'mo' : who,
        signers: outSigners
      }
    
      if (redirect && !isSimple) {
        data.redirect_url = redirect;
      }
    
      if (prepareDocument===true && !isSimple) {
        data.is_being_prepared=true;
      }

      let req = {
        method: 'post',
        url: `/api/forward/signature?url=${encodeURIComponent(`signature-requests/`)}`,
        headers: { 'Accept': '*/*',  "Content-Type": "application/json" },
        data: data
      }


      runRequest(req, (res) => {
        
        if (res.data) {
          removeActiveId(componentId);
          //success!!! - refresh the document
          setProcessDoc(false);
          setDocumentDetails({
            completed: false
          });
          getDocumentDetails('docLabel');
        }
        
      }, 'Successfully sent the document to signature.', []);
    } 

    const getDocumentDetails = (componentId) => {
    
      //get the signature document object
      //setDocumentDetails

      addActiveId(componentId);
      //let url = `${process.env.REACT_APP_SIGN_URL}/api/v1/documents/?external_id='${docObject.id}'`;
      setSignatureDetails({});
    

      let req = {
        method: 'get',
        url: `/api/forward/signature?url=${encodeURIComponent(`documents/`)}&params=${encodeURIComponent(`external_id=${docObject.id}`)}`,
        headers: { 'Accept': '*/*' }
      }


      runRequest(req, (res) => {
        if (res.status && res.status!==200 && res.status!==201) {
          setDocumentDetails({
            completed: true,
            error: true
          })
        } else {
          if (res.data && res.data.count>0) {
            setDocumentDetails({
              id: res.data.results[0].uuid,
              signrequest: res.data.results[0].signrequest?.uuid ?? '',
              pdf: res.data.results[0]?.pdf ?? '',
              status: res.data.results[0].status,
              logPdf: res.data.results[0]?.signing_log?.pdf ?? '',
              completed: true
            })
          } else {
            setDocumentDetails({
              completed: true
            })
          }
        }
       

        removeActiveId(componentId);
      }, '', []);
    }

    const getSignatureDetails = (componentId) => {
    
      //get the signature object
      //setSignatureObject

      addActiveId(componentId);
      //let url = `${process.env.REACT_APP_SIGN_URL}/api/v1/signature-requests/${documentDetails.signrequest}/`;
      
      
      let req = {
        method: 'get',
        url: `/api/forward/signature?url=${encodeURIComponent(`signature-requests/${documentDetails.signrequest}/`)}`,
        headers: { 'Accept': '*/*' }
      }

      runRequest(req, (res) => {
        if (res.data ) {
          setSignatureDetails(res.data);
        }
        removeActiveId(componentId);
      }, '', []);
    }

    const deleteSignatureDocument = (componentId) => {
      addActiveId(componentId);
      

      let req = {
        method: 'delete',
        url: `/api/forward/signature?url=${encodeURIComponent(`documents/${documentDetails.id}/`)}`,
        headers: { 'Accept': '*/*',  "Content-Type": "application/json" },
        data: {force_delete: true}
      }


      runRequest(req, (res) => {
        removeActiveId(componentId);
        setProcessDoc(false);
        setDocumentDetails({
          completed: false
        });
        getDocumentDetails('docLabel');
      }, '', []);
    }

     // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
    useEffect(
      () => {
          if (docObject && docObject.id) {
            setProcessDoc(false);
            setDocumentDetails({
              completed: false
            });
            getDocumentDetails('docLabel');
          }
      },[docObject]
      );
    
    
    useEffect(
      () => {
          if (documentDetails.signrequest) {
            getSignatureDetails('signLabel');
          }
      },[documentDetails]
      );
    
    
    
    useEffect(
      () => {
          if (blobId) downloadItem('blobDiv')
          // eslint-disable-next-line
        },[blobId]
      );  
    
    useEffect(
      () => {
          if (selectedFile) signCreateDocument('resultDiv')
          // eslint-disable-next-line
        },[selectedFile]
      );

    useEffect(() => {
        //console.log('SignatureDetails loaded.');
      }, []);

    const getDateValue = (dt) => {
      return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
    }

    const getWho = (who) => {
      switch (who) {
        case 'm':
          return 'Only me';
        case 'mo':
          return 'Me and others'; 
        case 'o':
          return 'Others';
        default:
          return '';
      }
      
    }

    const getStatus = (status) => {
      switch (status) {
        case 'si':
          return 'Signed';
        case 'co':
          return 'Converting'; 
        case 'ne':
          return 'New';
        case 'se':
          return 'Sent';
        case 'vi':
          return 'Viewed';
        case 'sd':
          return 'Signed and Downloaded';
        case 'ca':
          return 'Cancelled';
        case 'de':
          return 'Declined';
        case 'ec':
          return 'Error converting';
        case 'xp':
          return 'Expired';
        default:
          return '';
      }
      
    }

    const handleDownloadItem = (url, fileName, componentId) => {
      //dwn
      addActiveId(componentId);
    
      let req = { 
        method: 'post', 
        url: `/api/signature/downloaddoc`, 
        data: {docURL: url},
        headers: { 'Accept': '*/*' },
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
          link.setAttribute('download', fileName); //or any other extension
          document.body.appendChild(link);
          link.click();

          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        }
        removeActiveId(componentId);
        
      }, '', []);
     
      
    }

    const handleDwnPdf = () => {
      handleDownloadItem(documentDetails.pdf, 'Signature_document.pdf', 'dwnPdf');
    }

    const handleDwnLog = () => {
      handleDownloadItem(documentDetails.logPdf, 'Signing_Log.pdf', 'dwnLog');
    }

    const handleCancelSignature = () => {
      //TODO: cancel and delete signature and document
    }

      return (
        <React.Fragment>
          {docObject.id?
            <React.Fragment>
              {documentDetails.completed && documentDetails.error && documentDetails.error===true && <Box sx={{fontStyle: 'italic', color: 'red'}}>
                  <Typography variant="button" display="block" gutterBottom>Error. The signature backend is probably not working.</Typography>
                </Box>}
             
              {signatureDetails.signers && documentDetails.pdf && documentDetails.completed && 
              <React.Fragment>
                <Grid container spacing={0.5}>
                  <Grid item xs={6}>
                    <ValueDisplay label="Subject" value={signatureDetails.subject}/>
                    <ValueDisplay label="Message" value={signatureDetails.message}/>
                    <ValueDisplay label="Who" value={getWho(signatureDetails.who)}/>
                    {signatureDetails.redirect_url && <ValueDisplay label="Redirect URL" value={signatureDetails.redirect_url}/>}

                    {signatureDetails.prepare_url && 
                    <Stack direction={'row'} spacing={1} alignItems={'center'}>
                      <Box sx={{fontStyle: 'italic', color: 'red'}}>
                        <Typography variant="button" display="block" gutterBottom>The signature request needs to be prepared:</Typography>
                      </Box>
                      <IconButton size="small" variant="outlined" color="primary" title="Configure" href={signatureDetails.prepare_url + '?auth_provider=opentext_ot2&site=' + process.env.REACT_APP_SIGNATURE_TENANTID + '&otds_username=' + process.env.REACT_APP_SIGNATURE_ACCOUNT + `&redirect_url=${encodeURIComponent(`${(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI)}/?id=${docObject.id}&action=signature`)}`}>
                        <SettingsIcon color="primary"/>
                      </IconButton>
                    </Stack>
                      }
                  </Grid>
                  <Grid item xs={6}>
                    <ValueDisplay label="Status" value={getStatus(documentDetails.status)}/>
                    <Stack direction="row" justifyContent="flex-end">
                     {documentDetails.pdf && 
                      <Box sx={{
                        borderStyle: (activeId.split(',').find((obj) => {return obj==`dwnPdf`}) && showBorder)?'solid':'none', 
                        borderColor: 'red',
                        borderWidth: 'thin'}}>
                          <Button onClick={handleDwnPdf}>Get PDF</Button>
                      </Box>}
                     {documentDetails.logPdf && 
                      <Box sx={{
                        borderStyle: (activeId.split(',').find((obj) => {return obj==`dwnLog`}) && showBorder)?'solid':'none', 
                        borderColor: 'red',
                        borderWidth: 'thin'}}>
                          <Button onClick={handleDwnLog}>Get log</Button>
                      </Box>}
                    </Stack>
                  </Grid>
                </Grid>
                <br/>
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow sx={{backgroundColor:'#e1e1e1'}}>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Email</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Name</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>ORD</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Required</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>In person</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Signed</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Signed On</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Emailed</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Viewed</TableCell>
                        <TableCell align="left" sx={{fontWeight:'bold'}}>Declined</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {signatureDetails.signers.map((row, index) => (
                        <TableRow key={index} hover >
                          <TableCell align="left" >{row.email}</TableCell>
                          <TableCell align="left" >{row.display_name}</TableCell>
                          <TableCell align="right" >{row.order}</TableCell>
                          <TableCell align="right" >{row.needs_to_sign ? 'Yes' : 'No'}</TableCell>
                          <TableCell align="right" >{row.in_person ? 'Yes' : 'No'}</TableCell>
                          <TableCell align="left" >{row.needs_to_sign ? (row.signed?
                            <EditIcon color="success"/>:
                            (row.embed_url ? 
                                <IconButton size="small" variant="outlined" color="primary" title="Sign now" href={row.embed_url + '?hide_login=1&hide_logo=1&hide_title=1'}>
                                  <EditOffIcon color="primary"/>
                                </IconButton>  
                              : 
                                <EditOffIcon color="error"/>
                              )
                            ) : ''
                            }</TableCell>
                          <TableCell align="left" >{row.needs_to_sign ? getDateValue(row.signed_on) : '~'}</TableCell>
                          <TableCell align="left" >{row.needs_to_sign ? (row.emailed?
                            <ContentPasteGoIcon color="success"/>:
                            <ContentPasteOffIcon color="error"/>) : ''
                            }</TableCell>
                          <TableCell align="left" >{row.needs_to_sign ? (row.viewed?
                            <VisibilityIcon color="success"/>:
                            <VisibilityOffIcon color="error"/>) : ''
                            }</TableCell>
                          <TableCell align="left">{row.needs_to_sign ? (row.declined?
                            <Box sx = {{color: 'red'}}>Yes, with message: {row.message}</Box>:
                            'No') : ''
                            }</TableCell>
                          
                          
                        </TableRow>
                      ))}
                    </TableBody>                  
                  </Table>
                </TableContainer>
              </React.Fragment>
              }
              {!documentDetails.id && documentDetails.completed && !documentDetails.error && 
                <React.Fragment>
                  <Stack direction={'row'} spacing={1} justifyContent="space-between">
                    <Box sx={{fontStyle: 'italic'}}>
                      <Typography>No signature request for this document. Click below to start one.</Typography>
                    </Box>
                    <FormGroup>
                      <FormControlLabel control={<Switch checked={isSimple} onChange={e => { setIsSimple(e.target.checked)}} name="isSimple" size="small"/>} label="Simple config" labelPlacement="start" />
                    </FormGroup>
                  </Stack>
                  <Stack direction={'column'} spacing={1}>
                    <Stack direction={'row'} justifyContent='space-between' alignItems={'center'}>
                      {isSimple && 
                        <TextField
                            margin="dense"
                            id="simpleEmail"
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            variant="standard" 
                            value={simpleEmail}
                            onChange={e => {setSimpleEmail(e.target.value)}}
                          />}
                          {isSimple && <Box 
                          sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj==`signBut`}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                            <IconButton size="small" variant="outlined" disabled={processDoc || !simpleEmail} color="black" title="Start simple signature" onClick={() => { getDocumentContents('signBut'); setPrepareDocument(false); }}>
                              <SportsScoreIcon />
                            </IconButton>
                        </Box>}
                    </Stack>
                    {isSimple && <Box sx={{fontStyle:'italic', color: 'grey'}}>
                      <Typography variant="button" display="block" gutterBottom>This is the simplest way to create a signature, it will have a default subject and a default message, will be sent to the email above as first signer and then returned to the signature account owner {process.env.REACT_APP_SIGNATURE_ACCOUNT} for the second signature.</Typography>
                      </Box>}
                    <br/>
                  
                    {!isSimple && <Grid container spacing={1}>
                      <Grid item xs={4} sx={{pr: 1, borderRight: 1, borderColor: 'lightgrey'}}>
                        <TextField
                          margin="dense"
                          id="subject"
                          label="Subject"
                          type="subject"
                          fullWidth
                          required
                          variant="standard" 
                          value={subject}
                          onChange={e => {setSubject(e.target.value)}}
                        />
                        <TextField
                          margin="dense"
                          id="message"
                          label="Message"
                          type="message"
                          fullWidth
                          multiline
                          required
                          variant="standard" 
                          value={message}
                          onChange={e => {setMessage(e.target.value)}}
                        />
                        <TextField
                          margin="dense"
                          id="redirect"
                          label="Redirect URL"
                          type="redirect"
                          fullWidth
                          multiline
                          variant="standard" 
                          value={redirect}
                          onChange={e => {setRedirect(e.target.value)}}
                        />
                        <Box sx={{fontStyle: 'italic'}}>
                          <Typography>For example: {`${(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI)}/?id=${docObject.id}&action=signature`}</Typography>
                        </Box>
                        
                        <FormControl sx={{ m: 1, minWidth: 150 }} variant={"standard"} size="small">
                          <InputLabel id="who-select-label">Who</InputLabel>
                          <Select
                            labelId="who-select-label"
                            label={"Who needs to sign"}
                            id="who-simple-select"
                            value={who}
                            onChange={(e) => setWho(e.target.value)}
                          >
                            <MenuItem value={''}>{''}</MenuItem>
                            <MenuItem value={'mo'}>{'Me and others'}</MenuItem>
                            <MenuItem value={'o'}>{'Others'}</MenuItem>
                            <MenuItem value={'m'}>{'Me'}</MenuItem>
                          </Select>
                      </FormControl>
                      <FormGroup>
                        <FormControlLabel control={<Switch checked={isVisible} onChange={e => { setIsVisible(e.target.checked)}} name="isVisible" size="small"/>} label="Display password" labelPlacement="end" />
                      </FormGroup>
                      <FormGroup>
                        <FormControlLabel control={<Switch checked={sendSMS} onChange={e => { setSendSMS(e.target.checked)}} name="sendSMS" size="small"/>} label="Send password through SMS" labelPlacement="end" />
                      </FormGroup>
                      </Grid>
                      <Grid item xs={8}>
                        <SignersView inputFields={signersArray} setInputFields={setSignersArray} isVisible={isVisible} sendSMS={sendSMS}/>
                      </Grid>
                    </Grid>}

                    {!isSimple && <Box display={'flex'} justifyContent="flex-end" alignItems="flex-end"  sx={{
                      borderStyle: (activeId.split(',').find((obj) => {return obj==`signBut`}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin'}}>
                        <Button disabled={processDoc || !subject || !message || !who || signersArray.length===0} onClick={() => {getDocumentContents('signBut'); setPrepareDocument(false);}}>Start signature process</Button>
                    </Box>}

                    {!isSimple && <Box display={'flex'} justifyContent="flex-end" alignItems="flex-end" 
                      sx={{
                      borderStyle: (activeId.split(',').find((obj) => {return obj==`signButPrep`}) && showBorder)?'solid':'none', 
                      borderColor: 'red',
                      borderWidth: 'thin'}}>
                        <Button disabled={processDoc || !subject || !message || !who || signersArray.length===0} onClick={() => {getDocumentContents('signButPrep'); setPrepareDocument(true);}}>Prepare document</Button>
                    </Box>}

                    
                  </Stack>
                </React.Fragment>
              }
              {processDoc && <React.Fragment>
                {blobId && <Box 
                sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj==`blobDiv`}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                  <ValueDisplay label="Blob id" value={blobId ?? ''}/>
                </Box>}
                {selectedFile && <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj==`resultDiv`}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                  <ValueDisplay label="File" value={'downloaded'}/>
                </Box>}
                {selectedFile && <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj==`docUpload`}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                  <ValueDisplay label="File" value={'uploading'}/>
                </Box>}
                {!blobId && !selectedFile && <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj==`signCreate`}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                  <ValueDisplay label="Signature" value={'creating'}/>
                </Box>}
              </React.Fragment>}
              <br/>
              {(documentDetails.completed && documentDetails.id) && 
                <Stack direction={'row'} spacing={1} alignItems='center'>
                  <Box sx={{
                        borderStyle: (activeId.split(',').find((obj) => {return obj==`delDoc`}) && showBorder)?'solid':'none', 
                        borderColor: 'red',
                        borderWidth: 'thin'}}>
                        <IconButton size="small" variant="outlined" color="error" title="Delete request" onClick={() => { deleteSignatureDocument('delDoc')  }}>
                          <DeleteForeverIcon />
                        </IconButton>
                  </Box>
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj==`docLabel`}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'}}>
                    <ValueDisplay label="Document" value={documentDetails.id ?? ''}/>
                  </Box>
                </Stack>
              }
              {(documentDetails.id) && <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj==`signLabel`}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <Stack direction={'row'} spacing={1} alignItems='center'>
                  <IconButton size="small" variant="outlined" disabled={!signatureDetails.uuid} color="primary" title="Refresh" onClick={() => { setDocumentDetails({completed: false}); getDocumentDetails('docLabel')  }}>
                    <RefreshIcon />
                  </IconButton>
                  <ValueDisplay label="Signature" value={signatureDetails.uuid ?? ''}/>
                </Stack>
                

              </Box>}
              

            </React.Fragment>
          :
            <div>Loading data...</div>
          }
          
        </React.Fragment>
        
      );
  }