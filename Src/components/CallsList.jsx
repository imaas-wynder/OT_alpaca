import * as React from 'react';
import { useState, useRef, useEffect } from "react";


import { styled, createTheme, ThemeProvider } from '@mui/material/styles';


// MUI components
import { Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import TextContentDisplay from './TextContentDisplay';

//app-resource-analytics
//#212f80
//app-resource-capture
//#4f3690
//app-resource-manage
//#7e929f
//app-resource-process
//#00b8ba
//app-resource-search
//#2e3c98
//app-resource-secure
//#e4af0d
//app-resource-store
//#0ab8ea
//app-resource-view
//#8dca4d

const getSvg = (type) => {
  switch (type) {
    case 'cms':
      return 'app-resource-store'
    case 'css':
      return 'app-resource-secure'
    case 'workflow':
      return 'app-resource-process'
    case 'mtm':
      return 'app-resource-analytics'
    case 'viewer':
      return 'app-resource-view'
    case 'publication':
      return 'app-resource-view'
    case 'capture':
      return 'app-resource-capture'
    case 'signature':
      return 'app-resource-signature'
    default:
      return 'app-resource-manage'
  }
}

const getServiceUrl = (type) => {
  switch (type) {
    case 'cms':
      return 'https://developer.opentext.com/imservices/products/contentmetadataservice'
    case 'css':
      return 'https://developer.opentext.com/imservices/products/contentstorageservice'
    case 'workflow':
      return 'https://developer.opentext.com/imservices/products/workflowservice'
    case 'decision':
      return 'https://developer.opentext.com/imservices/products/decisionservice'
    case 'mtm':
      return 'https://developer.opentext.com/imservices/products/riskguardservice'
    case 'viewer':
      return 'https://developer.opentext.com/imservices/products/viewingtransformationservices'
    case 'publication':
      return 'https://developer.opentext.com/imservices/products/viewingtransformationservices'
    case 'capture':
      return 'https://developer.opentext.com/imservices/products/captureservice'
    case 'signature':
      return 'https://developer.opentext.com/coresaas/products/coresignature'
    default:
      return 'https://developer.opentext.com/imservices/products'
  }
}


const getMethodColor = (method) => {
  switch (method.toLowerCase()) {
    case 'get':
      return '#078eb3'
    case 'post':
      return '#006353'
    case 'put':
      return '#eeaf11'
    case 'patch':
      return '#8dc53e'
    case 'delete':
      return '#f05922'
    default:
      return '#078eb3'
  }
}


const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const CardContentNoPadding = styled(CardContent)(`
  padding: 0.5;
  &:last-child {
    padding-bottom: 0;
  }
`);

const theme = createTheme({
  palette: {
    cms: '#0ab8ea',
    css: '#e4af0d',
    workflow: '#00b8ba',
    mtm: '#212f80',
    viewer: '#8dca4d',
    publication: '#8dca4d',
    capture: '#4f3690',
    signature: '#2e3c98'
  }
});

function CallDisplay(props) {
  const { call, showResponse } = props; //setExpaded at the level of the array does not work very nice
  const [expanded, setExpanded] = React.useState(false);
  

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ minWidth: 275, borderBottom: 8, borderColor: call.service }}>
          <CardContentNoPadding>
            <Stack direction="column" spacing={0.5}>
              <Box sx={{
                width: '32px',
                display: 'inline-block',
                height: '13px',
                lineHeight: '13px',
                borderRadius: '3px',
                fontSize: '7px',
                color: 'white',
                textTransform: 'uppercase',
                textAlign: 'center',
                fontWeight: 'bold',
                verticalAlign: 'middle',
                marginRight: '6px',
                marginTop: '2px',
                backgroundColor:  getMethodColor(call.method)
              }}>
                {(call.method=='delete')?'del':call.method}
              </Box>
              
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {call.response?<IconButton size="small" variant="outlined" color="primary" title="Response" onClick={() => { showResponse(call.response) }}>
                    <img src={`/images/${getSvg(call.service)}.svg`}   
                        height="32"
                        width="32"
                        alt="code"/>
                  </IconButton>:
                    <img src={`/images/${getSvg(call.service)}.svg`}   
                    height="32"
                    width="32"
                    alt="code"/>
                  }
                  

                  <Typography variant="h5" color={call.service} component="div">
                    {call.service}
                  </Typography>
                </Stack>
                <IconButton size="small" variant="outlined" title="Documentation" target='_blank' href={getServiceUrl(call.service)}>
                    <LinkIcon sx={{color: call.service}}/>
                  </IconButton>
              </Stack>
              
              
              <Typography sx={{ fontSize: 12 }} color="text.secondary">
                {call.url}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color={(call.status=="SUCCESS")?"success.main":"error.main"}>
                {call.status}
              </Typography>
              <ExpandMore
                expand={expanded}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </Stack>
          </CardContentNoPadding>
          
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              {call.params && <Typography fontSize="8pt" fontWeight="bold">Params:</Typography>}
                {call.params && <Typography fontSize="8pt" component='span'>
                  {call.params.split('&').map((param) => (
                    <React.Fragment key={param} >
                      <Typography fontSize="6pt" component='span'>{param}</Typography>
                      <br/>
                    </React.Fragment>
                  ))}
                </Typography>}
              <Typography fontSize="8pt" fontWeight="bold">Data:</Typography>
              <Typography fontSize="8pt" component='span'>
                <div><pre>{JSON.stringify(call.data,null,2)}</pre></div>
              </Typography>
              <Typography fontSize="8pt" fontWeight="bold">Headers:</Typography>
              <Typography fontSize="8pt" component='span'>
                <div><pre>{JSON.stringify(call.header,null,2)}</pre></div>
              </Typography>
            </CardContent>
          </Collapse>
        </Card>
    </ThemeProvider>
    )
}

export default function CallsList (props) {
  const { callsArray, setCallValue } = props;
  const [response, SetResponse] = useState({});
  
  const bottom = useRef(null)
  
  const scrollToBottom = () => {
    bottom.current.scrollIntoView({ behavior: "smooth" })
  }
  
  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //if needed
        //console.log('Calls updated')
        scrollToBottom()
    },[props.callsArray.length]
    );

  
    

  return (
      <React.Fragment>
            {callsArray && <React.Fragment>
              <Stack
                direction="column" 
                spacing={2} 
                key="call-array-stack" 
              >
                {callsArray.map(
                  (call, index) => (
                    <CallDisplay key={'callDisplay' + index} call={call} showResponse={(resp) => {SetResponse(resp); }} />
                  )
                )}
              </Stack>
              <div ref={bottom}></div>
              <TextContentDisplay 
                  jsonValue={response}
                  setJsonValue={SetResponse} 
                  textValue={''} 
                  setTextValue={()=>{}}
                />
            </React.Fragment>
            }
            
      </React.Fragment>
  );
}
