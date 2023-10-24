import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';



// MUI components
import {
  Box,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Tabs,
  Tab,
  Stack,
  Switch,
  Typography,
  LinearProgress
} from '@mui/material';

import PropTypes from 'prop-types';
import TransformIcon from '@mui/icons-material/Transform';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Scenario1 from './Scenario1';
import TextContentDisplay from './TextContentDisplay';
import RedactionScriptView from './RedactionScriptView';
import WatermarkScriptView from './WatermarkScriptView';
import RedactionZoneView from './RedactionZoneView';
import RedactionPageView from './RedactionPageView';


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

  


  export default function DocumentIVTransform(props) {
    const {  runRequest, token, showBorder, docObject , outPdfRendition } = props;

    const {create} = require('xmlbuilder2');

    
    const [value, setValue] = React.useState(0);

    const [pdfUrl, setPdfUrl] = React.useState('');
    const [publication, setPublication] = React.useState({});
    const [publicationId, setPublicationId] = React.useState('');
    const [working, setWorking] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [rendition, setRendition] = React.useState({});
    const [markupId, setMarkupId] = React.useState('');
    const [lastFolder, setLastFolder] = React.useState('');

    const [embedMarkup, setEmbedMarkup] = React.useState(false);
    const [enableWatermark, setEnableWatermark] = React.useState(false);
    const [redactEmails, setRedactEmails] = React.useState(false);
    const [applyOcr, setApplyOcr] = React.useState(false);
    const [pdfA, setpdfA] = React.useState(false);
    const [reportComments, setReportComments] = React.useState(false);
    const [reportChangemarks, setReportChangemarks] = React.useState(false);
    const [outType, setOutType] = React.useState('pdf');

    const [extraDocs, setExtraDocs] = React.useState([]);
    const [selectView, setSelectView] = React.useState(false);
    const [selFile, setSelFile] = React.useState({});
    const [publicationView, setPublicationView] = React.useState({});

    const [publicationRefresh, setPublicationRefresh] = React.useState(false);

    const [redactionZone, setRedactionZone] = React.useState([]);

    const [redactionPages, setRedactionPages] = React.useState([]);

    const [redactionScript, setRedactionScript] = React.useState([
          {
          comment: 'Remove emails',
          hyperlink: 'developer.opentext.com',
          lognote: 'Attorney Client Privilege situation 502',
          search_strings: [
            {string: '[:email:]', matchWholeWord: false}
          ]
        },
        {
          comment: 'Remove OpenText name', 
          hyperlink: 'developer.opentext.com',
          lognote: 'Attorney Client Privilege situation 502',
          search_strings: [
            {string: 'regex:aiw:O[a-z]{3}T[a-z]{3}', matchWholeWord: false} //a = all, i = case insesitive
          ]
        }
      ]);

    const [bannerScript, setBannerScript] = React.useState([
      {
        min_page: 0,
        max_page: 0,
        watermark_opacity: 0.25,
        watermark_size: 72,
        watermark_font: 'monospace',
        watermark_italic: true,
        watermark_bold: true,
        watermark_underline: true,
        watermark_color: '#FF0000',
        watermark_text: 'Title Secret'
      },
      {
        min_page: 1,
        max_page: 100,
        watermark_opacity: 0.25,
        watermark_size: 72,
        watermark_font: 'monospace',
        watermark_italic: true,
        watermark_bold: true,
        watermark_underline: true,
        watermark_color: '#FF0000',
        watermark_text: 'CPS Secret'
      }
    ])

    const [activeId, setActiveId] = React.useState('');

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

    
      //tab panel change  
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const addDocument = (inBlobId, inFormatHint, inFileNameHint) => {
      let newDocument = {url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${inBlobId}/download`,
      formatHint: inFormatHint,
      filenameHint: inFileNameHint}
  
      setExtraDocs([...extraDocs, newDocument])
    } 

    const removeDocument = (index) => {
      let data = [...extraDocs];
      data.splice(index, 1);
      setExtraDocs(data);
    }
  
    const handleUpValue = (index) => {
      if (index>0) {
        let arrProperty = [...extraDocs];
        let value = arrProperty[index];
        arrProperty.splice(index-1,0, value)
        arrProperty.splice(index+1, 1);
        
        setExtraDocs(arrProperty);
      }
    }
  
    const handleDownValue = ( index) => {
      let arrProperty = [...extraDocs];
          
      if (index<arrProperty.length) {
        
        let value = arrProperty[index];
        arrProperty.splice(index, 1);
        arrProperty.splice(index+1,0, value);
  
        setExtraDocs(arrProperty);
      }
    }
  

    const getPrimaryRendition = (componentId, inObject, isExtra) => {
      addActiveId(componentId);
      
      let req = { 
        method: 'get', 
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inObject.category}/${inObject.type}/${inObject.id}/contents?items-per-page=100&page=1`, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      };
      runRequest(req, (res) => {
        //console.log(res);
        if (res.data && res.data._embedded && res.data._embedded.collection) {
          let renditions = res.data._embedded.collection;
          let bravaBlob = '';
          for (let i=0; i<renditions.length; i++) {
            if (renditions[i].rendition_type==='primary') {
              if (isExtra===true) {
                addDocument(renditions[i].blob_id, (renditions[i].mime_type==='application/json' ? 'text/plain' : renditions[i].mime_type), renditions[i].name);
                setSelectView(false);
              } else {
                setRendition({name: renditions[i].name, blob_id: renditions[i].blob_id, mime_type: (renditions[i].mime_type==='application/json' ? 'text/plain' : renditions[i].mime_type)});
              }
            } else {
              if(renditions[i].mime_type==='application/vnd.blazon+json' && isExtra!==true) {
                //get the file url from the publication file - that is the document id in the markup
                bravaBlob=renditions[i].blob_id;
              }
            }
          }

          if (bravaBlob && isExtra!==true) {
            downloadBlob(bravaBlob, 'bravaRefresh');
          }
          
        }
        
        removeActiveId(componentId);
      }, '', []);
    }

    const downloadBlob = (blobId, componentId) => {
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
          
            var reader = new FileReader();
            reader.onload = function() {
              let publicationData = {};
              try {
                publicationData = JSON.parse(reader.result);
              } catch (error) {
                console.log('Not a valid JSON');
                console.log(reader.result);
              }
              //get the id
              let features = publicationData.featureSettings;
              for (let i=0; i<features.length; i++) {
                if (features[i].path==='/documents') {
                  setMarkupId(features[i].value[0].url);
                }
              }
            }
            reader.readAsText(res.data);
        
          
        }
        
        removeActiveId(componentId);
        
      }, '', []);
    }
  

    const handleSendToTransform = (componentId) => {
      setErrorMsg('')
      setWorking(true);

      addActiveId(componentId);
      let docsArray = [
        {
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${rendition.blob_id}/download`,
          formatHint: rendition.mime_type,
          filenameHint: rendition.name
        }, ...extraDocs 
      ]

      let featureArray = [
            {
              feature: {namespace: "opentext.publishing.sources", name: "LoadSources" },
              path: "/documents",
              value: docsArray
            },
            {
              feature: { namespace: "opentext.publications.execution", name: "DeleteAfterCompletion", version: "1.x"},
              path: "/timeInMilliseconds",
              value: 43200000
            },
            {
              feature:{namespace:"opentext.publishing.execution",name:"SetPublishingTarget",version: "1.x"},
              path:"/publishingTarget",
              value: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${rendition.blob_id}/renditions`
            }
          ]
      
      if (outType==='pdf') {
        featureArray.push({
          feature: { namespace: "opentext.publishing.renditions", name: "ExportPdf", version: "4.x" },
          path: "/requestedVersion",
          value: "1.7"
        });
        featureArray.push(
        {
          feature: { namespace: "opentext.publishing.renditions", name: "ExportPdf", version: "4.x" },
          path: "/isoConformance",
          value: (pdfA ? "a1atag" : "none")
        });
        if (embedMarkup) {
          featureArray.push(
          {
            feature: { namespace: "opentext.publishing.renditions", name: "ExportPdf", version: "4.x" },
            path: "/markupsAsAnnotations",
            value: true
          });
        }
        
      } else {
        featureArray.push({
          feature: { namespace: "opentext.publishing.renditions", name: "ExportTiff", version: "2.x" },
          path: "/dotsPerInch",
          value: 200
        });
        featureArray.push({
          feature: { namespace: "opentext.publishing.renditions", name: "ExportTiff", version: "2.x" },
          path: "/rotateToOrientation/orientation",
          value: "portrait"
        });
      }

      if (reportChangemarks) {
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.reports",name: "ReportChangemarks",version: "1.x"},
            path: "/appendedSummary",
            value: true
          }
        );
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.reports",name: "ReportChangemarks",version: "1.x"},
            path: "/rtfReport",
            value: true
          }
        );
      }

      if (reportComments) {
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.reports",name: "ReportComments",version: "1.x"},
            path: "/appendedSummary",
            value: true
          }
        );
      }

      if (embedMarkup) {
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.execution",name: "FetchMarkup",version: "2.1.x"},
            path: "/sources",
            value: [
                {
                    id: "doc0markups",
                    source: markupId
                }
            ]
          }
        );
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.content", name: "ApplyMarkups", version: "1.x"},
            path: "/markups",
            value: [
                {
                    name: "doc0markups",
                    content: "urn:opentext:markup:fetch:doc0markups"
                }
            ]
          }
        );
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.content", name: "ApplyMarkups", version: "1.x"},
            path: "/toSources",
            value: [
                {
                    source: 0,
                    markupApplications: [
                        {
                            markupName: "doc0markups"
                        }
                    ]
                }
            ]
          }
        );
        featureArray.push(
          {
            feature: {namespace: "opentext.publishing.content", name: "ApplyMarkups", version: "1.x"},
            path: "/requireAppliedEntities",
            value: false
          }
        );
      }

      if (enableWatermark) {
        //create an xml
        const wtXml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('IsoBannersAndWatermarks', { version: '1.0', xmlns: 'http://www.opentext.com/renditions/cdl/banners', "xmlns:xsi":'http://www.w3.org/2001/XMLSchema-instance', "xmlns:schemaLocation": 'http://www.opentext.com/renditions/cdl/banners OTCDLIsoBanners.xsd'})

        for (let w=0; w<bannerScript.length; w++) {
          const wtPageGroup = wtXml.ele('IsoBannersPageGroup', {min_page: bannerScript[w].min_page, max_page: bannerScript[w].max_page})
          .ele('PublishBanners');
          wtPageGroup.ele('Watermark', {opacity: bannerScript[w].watermark_opacity})
          .ele('TextFragment', {
            index: '1', 
            opacity: bannerScript[w].watermark_opacity, 
            size: bannerScript[w].watermark_size, 
            font: bannerScript[w].watermark_font, 
            bold: (bannerScript[w].watermark_bold===true ? 'true' : 'false'),
            italic: (bannerScript[w].watermark_italic===true ? 'true' : 'false'),
            underline: (bannerScript[w].watermark_underline===true ? 'true' : 'false'),
            color: bannerScript[w].watermark_color
          }).txt(bannerScript[w].watermark_text).up().up();
        }


        console.log(wtXml.end({ prettyPrint: true }));
        
        featureArray.push({
          feature: {namespace: "opentext.publishing.content",name: "ApplyBannersWatermarks",version: "1.x"},
          path: "/url",
          value: "data:application/xml;base64," + Buffer.from(wtXml.end({ prettyPrint: true }), "utf8").toString('base64')
        })
      }

      if (redactEmails) {
        //create an xml
        const redXml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('RedactionScript', { version: '1' })

        for (let r=0; r<redactionScript.length; r++) {
          const redCommand = redXml.ele('RedactionCommand', {comment: redactionScript[r].comment, hyperlink: redactionScript[r].hyperlink, lognote: redactionScript[r].lognote});
          for (let s=0; s<redactionScript[r].search_strings.length; s++) {
            let tmpStr = redactionScript[r].search_strings[s].string;
            if (tmpStr.substring(0,5)==='regex') {
              let tmpArr = tmpStr.split(':');
              let tmpPrefix = `${tmpArr[0]}:${tmpArr[1]}:`;

              tmpStr = `${tmpPrefix}(\\'|(?<=[^[:digit:]]))${tmpStr.substring(tmpPrefix.length)}(\\'|(?=[^[:digit:]]))`
            }
            
            redCommand.ele('SearchString', {string: tmpStr, matchWholeWord: (redactionScript[r].search_strings[s].matchWholeWord===true ? 'true' : 'false')}).up();
          }
        }

        for (let z=0; z<redactionZone.length; z++) {
          redXml.ele('RedactionZone', {
            comment: redactionZone[z].comment, 
            hyperlink: redactionZone[z].hyperlink, 
            lognote: redactionZone[z].lognote, 
            left: redactionZone[z].left, 
            top: redactionZone[z].top,  
            right: redactionZone[z].right, 
            bottom: redactionZone[z].bottom, 
            pages: redactionZone[z].pages, 
            isNDC: (redactionZone[z].isNDC===true ? 'true' : 'false')
          } );
        }

        for (let p=0; p<redactionPages.length; p++) {
          redXml.ele('RedactPages', {
            comment: redactionPages[p].comment, 
            hyperlink: redactionPages[p].hyperlink, 
            lognote: redactionPages[p].lognote,
            pages: redactionPages[p].pages
          } );
        }

        

        console.log(redXml.end({ prettyPrint: true }));

        featureArray.push({
          feature: {namespace: "opentext.publishing.content",name: "ApplyRedactionScripts",version: "1.x"},
          path: "/scripts",
          value: [
            { 
              uri: "data:text/xml;base64," + Buffer.from(redXml.end({ prettyPrint: true }), "utf8").toString('base64')
            }
          ]
        })
      }

      if (applyOcr) {
        featureArray.push(
          {
            feature: {namespace: 'opentext.publishing.execution',name: 'ApplyOCR',version: '1.x'},
            path: '',
            value: {
              ignoreErrors: false,
              minConfidenceAllowed: 50,
              overallConfidenceThreshold: 50,
              overallErrorThreshold: 50,
              timeout: 1800
            }
        })
      }


      let data = {
        target: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/tenant/${process.env.REACT_APP_TENANT_ID}/content`,
        publicationVersion: "1.x",
        policy: {
              namespace:"opentext.publishing",
              name:"CouldBeAnything",
              version:"1.x"
            },
        tags: [
          {
            dev: "sample"
          }
        ],
        featureSettings: featureArray
      }



      let req = { 
        method: 'post',
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/publication/api/v1/publications/`, 
        data: data,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        if (res.status && (res.status===200 || res.status===201 || res.status===202)) {
          setPublicationId(res.data.id);
          setPublication(res.data);
          setWorking(false);
        }
        removeActiveId(componentId)

      }, '', []);

    }

    const handlePublicationRefresh = (componentId) => {
      addActiveId(componentId);

      let req = { 
        method: 'get',
        url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/publication/api/v1/publications/${publicationId}`,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        if (res.status && (res.status===200 || res.status===201 || res.status===202)) {
          setPublication(res.data);
          if (res.data.status=='Complete') {
            //get to the URL
            let tmpPdfUrl = '';
            if (res.data._embedded && res.data._embedded['pa:get_publication_artifacts']) {
              let artifactsArr = res.data._embedded['pa:get_publication_artifacts'];
              let foundX = false;
              for (let i=0; i<artifactsArr.length; i++) {
                if (artifactsArr[i].name===outType) {
                  if (artifactsArr[i].available===true) {
                    if (artifactsArr[i]._embedded && artifactsArr[i]._embedded['ac:get_artifact_content']) {
                      tmpPdfUrl = artifactsArr[i]._embedded['ac:get_artifact_content'].urlTemplate;
                      let contentLinks = artifactsArr[i]._embedded['ac:get_artifact_content'].contentLinks;
                      for (let c=0; c<contentLinks.length; c++) {
                        let curLink = contentLinks[c];
                        for (const key in curLink) {
                          tmpPdfUrl = tmpPdfUrl.replace(RegExp(`{${key}}`, 'g'), curLink[key]);
                          
                        }
                      }

                      setPdfUrl(tmpPdfUrl);
                      outPdfRendition(true, tmpPdfUrl);
                      foundX = true;
                    } else {
                      setErrorMsg('Found the ' + outType.toUpperCase() + ' artifacts node but the ac:get_artifact_content does not exist.')
                    }
                  } else {
                    setErrorMsg('Found the ' + outType.toUpperCase() + ' artifacts node but it is not available.');
                  }
                }
              }
              if (!foundX) setErrorMsg('Publication complete but did not find the ' + outType.toUpperCase() + ' artifacts node.');

            } else {
              //cannot get pdf file
              setErrorMsg('Error while reading the publication URL (/._embedded.pa:get_publication_artifacts[name=' + outType + ']._embedded.ac:get_artifact_content)');
            }

          } else {
            if (res.data.status==='Failed') {
              setErrorMsg('There is an error in the Publication. Check the publication file.');
            }
          }
        }
        removeActiveId(componentId);
        setPublicationRefresh(false);

      }, '', []);
      
    }

    const handlePdfDownload = (componentId) => {
      addActiveId(componentId);
      //console.log(pdfUrl);
    
      let req = { 
        method: 'get', 
        url: pdfUrl, 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
        responseType: 'blob' 
      };

      runRequest(req, (res) => {
        //console.log('Reached output function')
        if (res.data) {
          // create file link in browser's memory
          const href = URL.createObjectURL(res.data);
          let extFile = rendition.name.split('.')[rendition.name.split('.').length - 1];
          let fileName = rendition.name;
          
          if (res.headers && res.headers['content-disposition']) {
            let fName = res.headers['content-disposition'].split(';');
            if (fName.length>1) {
              fileName = fName[1].replace(/filename=\"/g, '').replace(/\"/g, '');
            }
          }

          if (res.headers && res.headers['content-type']) {
            let mimeType = res.headers['content-type'];
            switch (mimeType) {
              case 'application/pdf':
                fileName = fileName.replace(RegExp(extFile, 'g'), 'pdf');
                break;
              case 'image/tiff':
                fileName = fileName.replace(RegExp(extFile, 'g'), 'tif');
                break;
              default:
                break;
            }
          }
                
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

  useEffect(
    () => {
      if (publicationId) {
        setPublicationRefresh(true);
        setTimeout(() => { handlePublicationRefresh('refreshLabel') }, 2000);
      }
    },[publicationId]
    );

    useEffect(
      () => {
        if (publicationRefresh===false && publicationId && !pdfUrl && !errorMsg) {
          //refresh it again
          setPublicationRefresh(true);
          setTimeout(() => { handlePublicationRefresh('refreshLabel') }, 2000);
        }
      },[publicationRefresh]
      );

    
    // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        getPrimaryRendition('entireDiv', docObject, false);

    },[]
    );
   
   

      return (
        <React.Fragment>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="General" {...a11yProps(0)} />
                <Tab disabled={!redactEmails} label="Redact text" {...a11yProps(1)} />
                <Tab disabled={!redactEmails} label="Redact zone" {...a11yProps(2)} />
                <Tab disabled={!redactEmails} label="Redact page" {...a11yProps(3)} />
                <Tab disabled={!enableWatermark} label="Watermarks" {...a11yProps(4)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <Stack
              direction="column" 
              spacing={2} 
              alignItems="left" 
              key="name-filter-stack" 
              sx={{ bgcolor: 'background.paper', 
                boxShadow: 1,
                borderRadius: 2,
                p: 2, mb: 1}}
              >
              
              {(publicationId && !pdfUrl && !errorMsg) || working ? <LinearProgress /> : ''}
              {!rendition.name && <Typography>
                Getting primary rendition details...
                </Typography>}

                {rendition?.name && <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center" 
                  key="name-filter-stack"
                  >
                  <Typography variant="subtitle1" gutterBottom>
                      {publicationId?(pdfUrl?'Document transformation successfull':(errorMsg?'ERROR':'Document transformation in progress...')):(working?'Creating publication...':'Please send the document to Transformation: ')}  
                  </Typography>
                  {!publicationId && !working && <IconButton size="small" variant="outlined" color="success" title="Send to transform" onClick={() => { handleSendToTransform() }}>
                    <TransformIcon />
                  </IconButton> }
                  {pdfUrl && <IconButton size="small" variant="outlined" color="success" title="View document" onClick={() => { handlePdfDownload() }}>
                    <DownloadIcon />
                  </IconButton> }
                  <IconButton size="small" variant="outlined" color="warning" title="Refresh" onClick={() => { setPublicationId(''); setWorking(false); setPdfUrl(''); }}>
                    <RefreshIcon />
                  </IconButton>
                  
                </Stack>}  
                {errorMsg && <React.Fragment>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant="subtitle1" color="error" gutterBottom>
                      {errorMsg}  
                    </Typography>
                    <IconButton size="small" variant="outlined" color="primary" title="View publication" onClick={() => { setPublicationView(publication) }}>
                      <VisibilityIcon />
                    </IconButton>
                  </Stack>
                      
                </React.Fragment>}  
              </Stack>
              <Stack
              direction="column" 
              spacing={2} 
              alignItems="left" 
              key="add-docs-stack" 
              sx={{ bgcolor: 'background.paper', 
                boxShadow: 1,
                borderRadius: 2,
                p: 2, mt: 1}}
              >
                <FormControl>
                  <FormLabel id="output type">Generate</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="output type"
                    name="output_type"
                    value={outType}
                    onChange={(event) => setOutType(event.target.value)}
                  >
                    <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                    <FormControlLabel value="tif" control={<Radio />} label="TIF" />
                  </RadioGroup>
                </FormControl>
                
                {outType==='pdf' && <FormGroup>
                    <FormControlLabel control={<Switch checked={pdfA} onChange={e => { setpdfA(e.target.checked)}} name="pdfA" size="small"/>} label="PDF/A" labelPlacement="end" />
                </FormGroup>}
                <FormGroup>
                    <FormControlLabel control={<Switch checked={enableWatermark} onChange={e => { setEnableWatermark(e.target.checked) }} name="enableWatermark" size="small"/>} label="Add watermark" labelPlacement="end" />
                </FormGroup>
                <FormGroup>
                    <FormControlLabel control={<Switch checked={redactEmails} onChange={e => { setRedactEmails(e.target.checked)}} name="redactEmails" size="small"/>} label="Redaction" labelPlacement="end" />
                </FormGroup>
                {/* <FormGroup>
                    <FormControlLabel control={<Switch checked={applyOcr} onChange={e => { setApplyOcr(e.target.checked)}} name="applyOcr" size="small"/>} label="OCR" labelPlacement="end" />
                </FormGroup> */}
                {markupId!=='' && <FormGroup>
                    <FormControlLabel control={<Switch checked={embedMarkup} onChange={e => { setEmbedMarkup(e.target.checked)}} name="embedMarkup" size="small"/>} label="Embed markup" labelPlacement="end" />
                </FormGroup>}
                {embedMarkup && <FormGroup>
                    <FormControlLabel control={<Switch checked={reportChangemarks} onChange={e => { setReportChangemarks(e.target.checked)}} name="embedChangeMarks" size="small"/>} label="Embed changemarks" labelPlacement="end" />
                </FormGroup>}
                {embedMarkup && <FormGroup>
                    <FormControlLabel control={<Switch checked={reportComments} onChange={e => { setReportComments(e.target.checked)}} name="embedComments" size="small"/>} label="Embed comments" labelPlacement="end" />
                </FormGroup>}
                <Box>
                    <IconButton size="small" variant="outlined" color="success" title="Add document" onClick={() => { setSelFile({}); setSelectView(true) }}>
                        <AddCircleOutlineIcon />
                    </IconButton>
                </Box>
                {extraDocs.map((item, index) => (
                  <Stack key={'extraDocs' + index} direction={'row'} spacing={1} alignItems={'center'} justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Document name: {item.filenameHint}
                      </Typography>
                    </Box>
                    <Stack direction={'row'} spacing={0}>
                      <Box>
                        <IconButton size="small" variant="outlined" color="primary" title="Move up" disabled={index===0} onClick={() => { handleUpValue(index) }}>
                            <ArrowCircleUpIcon />
                        </IconButton>
                      </Box>
                      <Box>
                        <IconButton size="small" variant="outlined" color="primary" title="Move down" disabled={index===(extraDocs.length-1)} onClick={() => { handleDownValue(index) }}>
                            <ArrowCircleDownIcon />
                        </IconButton>
                      </Box>
                      <Box>
                        <IconButton size="small" variant="outlined" color="error" title="Remove document" onClick={() => { removeDocument(index) }}>
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Box>
                    </Stack>
                    
                  </Stack>
                  
                ))}
              </Stack>
            </TabPanel>
            <TabPanel value={value} index={1}>
                  <RedactionScriptView 
                    inputScript={redactionScript}
                    outScript={(obj) => setRedactionScript(obj)} />

            </TabPanel>
            <TabPanel value={value} index={2}>
                  <RedactionZoneView 
                    inputScript={redactionZone}
                    outScript={(obj) => setRedactionZone(obj)} />

            </TabPanel>
            <TabPanel value={value} index={3}>
                  <RedactionPageView 
                    inputScript={redactionPages}
                    outScript={(obj) => setRedactionPages(obj)} />

            </TabPanel>
            <TabPanel value={value} index={4}>
                  <WatermarkScriptView 
                    inputScript={bannerScript}
                    outScript={(obj) => setBannerScript(obj)} />

            </TabPanel>
          </Box>
          
            <Dialog open={selectView} onClose={() => {setSelFile({}); setSelectView(false)}} maxWidth={'xl'} fullWidth>
              <DialogTitle>{`Open an extra document`}</DialogTitle>
              <DialogContent sx={{
                maxHeight: '85vh',
                mb: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: 3,
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
                <Stack direction={'column'} spacing={2}>
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj=='renditionDiv'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin',
                    }}>
                      <Typography 
                        variant="button" 
                        display="block" 
                        gutterBottom 
                        sx={{
                          wordWrap: 'break-word',
                          color: selFile.name ? 'green' : 'red'
                          }}>
                        {selFile?.category==='file' ? 'Selected file: ' + selFile.name : 'Please select a file below.'}
                      </Typography>
                  </Box>
                      <Scenario1 
                        runRequest={runRequest} 
                        token={token} 
                        showBorder={showBorder} 
                        selectObject={(object) => setSelFile(object)} 
                        isSelect={true} 
                        inCategory={'file'} 
                        currentFolder={(folder)=>{setLastFolder(folder.id)}} 
                        inFolder={lastFolder}
                        urlLoaded = {true} 
                        setUrlLoaded = {()=>{}}/>
                  </Stack>
                  
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => {setSelFile({}); setSelectView(false)}}>Cancel</Button>
                  <Box>
                      <Button onClick={() => {getPrimaryRendition('renditionDiv', selFile, true);}} disabled={(selFile?.category!=='file')}>Open</Button>
                  </Box>
                </DialogActions>
            </Dialog>
            <TextContentDisplay 
                  jsonValue={publicationView}
                  setJsonValue={setPublicationView} 
                  textValue={''} 
                  setTextValue={()=>{}}
                />
          </React.Fragment>
      );
  }