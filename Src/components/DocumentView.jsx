import * as React from 'react';
import { useState } from "react";

 
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  Box,
  Typography,
} from '@mui/material';


import "../style/BravaViewer.css";

const VIEWER_ID = "file-viewer-root";


export default function DocumentView(props) {
  const { runRequest, docObject, inFull, inRel, closeAction, token, userName, showBorder, inBlobId, inMarkupId  } = props;

  const [blobId, setBlobId] = useState('');
  const [message, setMessage] = useState('');
  
  const [bravaApi, setBravaApi] = useState(null);
  const [publicationData, setPublicationData] = useState({});

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
  
  
  //========================options for the viewer
  const toolbarAccessible = {
    a11y: true,
    left: [
      { component: 'PreviousPageButton' },
      { component: 'PageSelector' /*, style: { marginLeft: '0.5em' }*/ },
      { component: 'NextPageButton' },
      { component: 'ZoomOutButton' },
      { component: 'ZoomInButton' },
      { component: 'RotateButton' },
      { component: 'PageTextButton' },
      { component: 'ExportButton', format: 'print' },
      { component: 'ExportButton', format: 'pdf' },
      { component: 'ExportButton', format: 'tiff' }
    ],
    center: [],
    right: [{ component: 'CloseButton', size: 18 }]
  };
  const toolbarWithMarkupStuff = {
    left: [
      { component: 'ToggleSidebarButton', side: 'tabContainerWithMarkups' },
      //{ component: 'ExportButton', format: 'print' },
      //{ component: 'ExportButton', format: 'pdf' },
      //{ component: 'ExportButton', format: 'tiff' },
      { component: 'DownloadButton' },
      { component: 'SelectButton' },
      { component: 'PanButton' },
      { component: 'ZoomToRectangleButton' },
      { component: 'SaveButton' },
      { component: 'ZoomInButton' },
      { component: 'ZoomOutButton' },
      { component: 'ZoomExtentsButton' },
      { component: 'ZoomWidthButton' },
      { component: 'RotateButton' }
      //{ component: 'PageTextButton' }
      // { component: 'CustomButton', layoutKey: 'customButton' }
    ],
    center: [{ component: 'TitleText' }],
    right: [
      { component: 'GradientFade', style: { position: 'relative', right: '24px' } },
      //{ component: 'SearchTextInput', style: { right: '8em' }, layoutKey: 'searchOptions' },
      { component: 'PageSelector', style: { marginLeft: '0.5em' } },
      //{ component: 'SearchToggleButton', size: 20 },
      //{ component: 'SettingsButton' },
      //{ component: 'ToggleSidebarButton', side: 'rightTabContainer', closedIcon: 'Metadata' },
      { component: 'CloseButton', size: 18 }
    ]
  };
  
  const searchOptions = [
    'MatchCaseOption',
    'WholeWordOption',
    'Divider',
    'SearchDirectionOption',
    'Divider',
    'IncludeMarkupsOption'
  ];
  
  const tabContainerEmpty = {
    sidebarName: 'tabContainerEmpty',
    primary: 'primary',
    tabs: []
  };
  const tabContainerWithMarkups = {
    sidebarName: 'tabContainerWithMarkups',
    primary: 'primary',
    tabs: [
      { component: 'ThumbnailPane', title: 'tab.thumbnails' },
      { component: 'MarkupPane', title: 'tab.tools', layoutKey: 'markupTools' },
      { component: 'MarkupDetails', title: 'tab.markups' },
      // { component: 'StampPane', title: 'tab.stamp', layoutKey: 'markupTools' },
      // { component: 'RasterPane', title: 'tab.raster', layoutKey: 'markupTools' },
      //{ component: 'StampRasterPane', title: 'tab.stampRaster', layoutKey: 'markupTools' },
      { component: 'TakeoffPane', title: 'tab.takeoff', layoutKey: 'measureTools' },
      { component: 'NavigationPane', title: 'tab.navigation', layoutKey: 'markupFilters' },
      //{ component: 'SearchResultsPane', title: 'tab.searchResults' },
      //{
      //  component: 'BookmarksPane',
      //  title: 'tab.bookmarks',
      //  layoutKey: 'bookmarks'
        // props: {
        //   pids: window.samplePublication ? [window.samplePublication.id] : window.binderPublications.map(m => m.id)
        // }
      //},
      //{ component: 'LayersPane', title: 'tab.layers' }
    ]
  };
  
  const measureTools = [
    {
      title: 'toolPalette.takeoff',
      tools: [
        {
          label: 'measureCalibration',
          tool: 'measureCalibration',
          icon: 'MeasureCalibration'
        },
        {
          label: 'measureLine',
          tool: 'measureLine',
          icon: 'MeasureLine'
        },
        {
          label: 'measurePolyline',
          tool: 'measurePolyline',
          icon: 'MeasurePolyline'
        },
        {
          label: 'measurePolygon',
          tool: 'measurePolygon',
          icon: 'MeasurePolygon'
        },
        {
          label: 'measureRectangle',
          tool: 'measureRectangle',
          icon: 'MeasureRectangle'
        },
        {
          label: 'measureEllipse',
          tool: 'measureEllipse',
          icon: 'MeasureEllipse'
        },
        {
          label: 'measureItemCount',
          tool: 'measureItemCount',
          icon: 'MeasureItemCount'
        }
      ]
    }
  ];
  
  const rightTabContainer = [
    { component: 'MarkupDetails', title: 'tab.markups' },
    // { component: 'MetadataPane', title: 'tab.metadata' },
    { component: 'NavigationPane', title: 'tab.navigation', layoutKey: 'markupFilters' }
  ];
  
  const markupFilters = [
    { component: 'ResetFilter' },
    { component: 'AuthorsFilter' },
    { component: 'TypesFilter' },
    { component: 'KeywordsFilter' }
  ];
  
  const pdfExportActions = [
    { id: 'newFile', message: 'Back to Content Server as a new file' },
    { id: 'newVersion', message: 'Back to Content Server as a new version of the current file' },
    { id: 'newRendition', message: 'Back to Content Server as a rendition of the current version' },
    { id: 'download', default: true, message: 'Download to my browser' }
  ];
  
  const pdfExportDefaults = {
    pageSizeName: '',
    pagesToExport: 'all',
    markupBurnin: 'burn',
    colorConversion: 'original',
    isoConformance: 'none',
    successAction: 'download',
    includeLayers: 'all',
    rotateToOrientation: 'original',
    banner: {
      Watermark: {
        // disabled: true,
        text: 'TOP SECRET',
        size: 72,
        font: 'monospace',
        opacity: 0.25,
        color: '#FF0000',
        italic: true,
        bold: true,
        underline: true
      },
      TopLeft: { text: '', size: 48, font: 'cursive' },
      TopCenter: { text: '', size: 48, font: 'cursive' },
      TopRight: { text: '', size: 48, font: 'cursive' },
      BottomLeft: { text: '', size: 48, font: 'cursive' },
      BottomCenter: { text: '', size: 48, font: 'cursive' },
      BottomRight: { text: '', size: 48, font: 'cursive' },
      LeftTop: { text: '', size: 48, font: 'cursive' },
      LeftCenter: { text: '', size: 48, font: 'cursive' },
      LeftBottom: { text: '', size: 48, font: 'cursive' },
      RightTop: { text: '', size: 48, font: 'cursive' },
      RightCenter: { text: '', size: 48, font: 'cursive' },
      RightBottom: { text: '', size: 48, font: 'cursive' }
    }
  };
  
  const pdfExport = {
    submitButtonLabel: 'publish',
    tabs: [
      {
        title: 'tab.exportGeneral',
        layout: [
          { component: 'FormColumns', fields: ['PageOutput', 'PageSize', 'Orientation', 'Layering', 'OutputIso'] },
          {
            component: 'FieldSet',
            title: 'coloring',
            layout: [
              {
                component: 'FormColumns',
                fields: ['ColorConversion', 'ApplyLineWeights', 'null', 'ForceThinLines']
              }
            ]
          },
          {
            component: 'FieldSet',
            title: 'markup',
            toggle: 'includeMarkups',
            layout: [
              {
                component: 'FormColumns',
                fields: ['BurninMarkups', 'AppendComments', 'MarkupsAsComments', 'AppendReasons']
              }
            ]
          }
        ]
      },
      {
        title: 'tab.exportSecurity',
        layout: [{ component: 'FormSection', fields: ['SecurityPassword', 'PermissionsPassword'] }]
      },
      {
        title: 'tab.exportBannerWatermark',
        layout: [{ component: 'BannerWatermark' }]
      },
      { title: 'tab.exportAction', layout: [{ component: 'FormSection', fields: ['SuccessAction'] }] }
    ]
  };
  
  const tiffExportDefaults = {
    successAction: 'download',
    pagesToExport: 'all',
    colorConversion: 'original',
    compressionType: 'lzw',
    dotsPerInch: 200,
    bitsPerPixel: 'max24bpp',
    rotateToOrientation: 'portrait'
  };
  
  const tiffExportDisabled = [];
  const tiffExportHidden = [];
  
  const tiffExport = {
    submitButtonLabel: 'publish',
    tabs: [
      {
        title: 'tab.exportGeneral',
        layout: [
          { component: 'FormColumns', fields: ['PageOutput', 'Orientation', 'Compression', 'DotsPerInch'] },
          {
            component: 'FieldSet',
            title: 'coloring',
            layout: [
              {
                component: 'FormColumns',
                fields: ['ColorConversion', 'ColorDepth', 'ApplyLineWeights', 'null', 'ForceThinLines']
              }
            ]
          },
          {
            component: 'FieldSet',
            title: 'markup',
            toggle: 'includeMarkups',
            layout: [
              {
                component: 'FormColumns',
                fields: ['BurninMarkups', 'AppendComments', 'MarkupsAsComments', 'AppendReasons']
              }
            ]
          }
        ]
      },
      {
        title: 'tab.exportBannerWatermark',
        layout: [{ component: 'BannerWatermark' }]
      },
      { title: 'tab.exportAction', layout: [{ component: 'FormSection', fields: ['SuccessAction'] }] }
    ]
  };
  
  const printExportDefaults = {
    successAction: 'print',
    pagesToExport: 'all',
    markupBurnin: 'burn',
    colorConversion: 'original',
    isoConformance: 'none',
    includeLayers: 'all',
    rotateToOrientation: 'original'
  };
  
  const printExport = {
    submitButtonLabel: 'print',
    tabs: [
      {
        title: 'tab.exportGeneral',
        layout: [
          {
            component: 'FormColumns',
            fields: ['PageOutput', 'PageSize', 'Orientation']
          },
          {
            component: 'FieldSet',
            title: 'coloring',
            layout: [
              {
                component: 'FormColumns',
                fields: ['ColorConversion', 'ApplyLineWeights', 'null', 'ForceThinLines']
              }
            ]
          },
          {
            component: 'FieldSet',
            title: 'markup',
            toggle: 'includeMarkups',
            layout: [
              {
                component: 'FormColumns',
                fields: ['BurninMarkups', 'AppendComments', 'MarkupsAsComments', 'AppendReasons']
              }
            ]
          }
        ]
      },
      {
        title: 'tab.exportBannerWatermark',
        layout: [{ component: 'BannerWatermark' }]
      }
    ]
  };
  
  const pageOutputOptions = [{ value: 'all' }, { value: 'current' }, { value: 'markup' }, { value: 'designated' }];
  const pageSizeOptions = [
    { value: '', label: 'Original page size' },
    { value: 'Letter', label: 'Letter (8.5 X 11 in)' },
    { value: 'Legal', label: 'Legal (8.5 X 14 in.)' },
    { value: 'Ledger', label: 'Ledger (17 X 11 in.)' },
    { value: 'Tabloid', label: 'Tabloid (11 X 17 in.)' },
    { value: 'Executive', label: 'Executive (7.25 x 10.55 in.)' },
    { value: 'Arch C Size Sheet', label: 'Arch C Size Sheet (24 X 18 in.)' },
    { value: 'Arch D Size Sheet', label: 'Arch D Size Sheet (36 X 24 in.)' },
    { value: 'Arch E Size Sheet', label: 'Arch E Size Sheet (48 X 36 in.)' },
    { value: 'Ansi C Size Sheet', label: 'Ansi C Size Sheet (22 X 17 in.)' },
    { value: 'Ansi D Size Sheet', label: 'Ansi D Size Sheet (34 X 22 in.)' },
    { value: 'Ansi E Size Sheet', label: 'Ansi E Size Sheet (44 X 34 in.)' },
    { value: 'ISO A0 Landscape', label: 'ISO A0 Landscape (1189 X 841 mm)' },
    { value: 'ISO A1 Landscape', label: 'ISO A1 Landscape (841 X 594 mm)' },
    { value: 'ISO A2 Landscape', label: 'ISO A2 Landscape (594 X 420 mm)' },
    { value: 'ISO A3 Landscape', label: 'ISO A3 Landscape (420 X 297 mm)' },
    { value: 'ISO A4 Landscape', label: 'ISO A4 Landscape (297 X 210 mm)' },
    { value: 'ISO A5 Landscape', label: 'ISO A5 Landscape (210 X 148 mm)' },
    { value: 'ISO A6 Landscape', label: 'ISO A6 Landscape (148 X 105 mm)' },
    { value: 'ISO A7 Landscape', label: 'ISO A7 Landscape (105 X 74 mm)' },
    { value: 'ISO A0 Portrait', label: 'ISO A0 Portrait (841 X 1189 mm)' },
    { value: 'ISO A1 Portrait', label: 'ISO A1 Portrait (594 X 841 mm)' },
    { value: 'ISO A2 Portrait', label: 'ISO A2 Portrait (420 X 594 mm)' },
    { value: 'ISO A3 Portrait', label: 'ISO A3 Portrait (297 X 420 mm)' },
    { value: 'ISO A4 Portrait', label: 'ISO A4 Portrait (210 X 297 mm)' },
    { value: 'ISO A5 Portrait', label: 'ISO A5 Portrait (148 X 210 mm)' },
    { value: 'ISO A6 Portrait', label: 'ISO A6 Portrait (105 X 148 mm)' },
    { value: 'ISO A7 Portrait', label: 'ISO A7 Portrait (74 X 105 mm)' },
    { value: 'ISO B0 Landscape', label: 'ISO B0 Landscape (1414 X 1000 mm)' },
    { value: 'ISO B1 Landscape', label: 'ISO B1 Landscape (1000 X 707 mm)' },
    { value: 'ISO B2 Landscape', label: 'ISO B2 Landscape (707 X 500 mm)' },
    { value: 'ISO B3 Landscape', label: 'ISO B3 Landscape (500 X 353 mm)' },
    { value: 'ISO B4 Landscape', label: 'ISO B4 Landscape (353 X 250 mm)' },
    { value: 'ISO B5 Landscape', label: 'ISO B5 Landscape (250 X 176 mm)' },
    { value: 'ISO B6 Landscape', label: 'ISO B6 Landscape (176 X 125 mm)' },
    { value: 'ISO B7 Landscape', label: 'ISO B7 Landscape (125 X 88 mm)' },
    { value: 'ISO B0 Portrait', label: 'ISO B0 Portrait (1000 X 1414 mm)' },
    { value: 'ISO B1 Portrait', label: 'ISO B1 Portrait (707 X 1000 mm)' },
    { value: 'ISO B2 Portrait', label: 'ISO B2 Portrait (500 X 707 mm)' },
    { value: 'ISO B3 Portrait', label: 'ISO B3 Portrait (353 X 500 mm)' },
    { value: 'ISO B4 Portrait', label: 'ISO B4 Portrait (250 X 353 mm)' },
    { value: 'ISO B5 Portrait', label: 'ISO B5 Portrait (176 X 250 mm)' },
    { value: 'ISO B6 Portrait', label: 'ISO B6 Portrait (125 X 176 mm)' },
    { value: 'ISO B7 Portrait', label: 'ISO B7 Portrait (88 X 125 mm)' },
    { value: 'JIS B4', label: 'JIS B4 (364 X 257 mm)' },
    { value: 'JIS B5', label: 'JIS B5 (182 X 257 mm)' }
  ];
  const isoOptions = [
    { label: 'PDF Standard', value: 'none' },
    { label: 'PDF/A-1a compatible', value: 'a1a' },
    { label: 'PDF/A-1b compatible', value: 'a1b' },
    { label: 'PDF/A-2b compatible', value: 'a2b' },
    { label: 'PDF/A-2u compatible', value: 'a2u' },
    { label: 'PDF/A-3a compatible', value: 'a3a' },
    { label: 'PDF/A-3b compatible', value: 'a3b' },
    { label: 'PDF/A-3u compatible', value: 'a3u' },
    { label: 'PDF/E compatible', value: 'e' }
  ];
  const orientationOptions = [
    { value: 'original' },
    { value: 'portrait' },
    { value: 'landscape' },
    { value: 'outputsize' }
  ];
  const layerOptions = [{ value: 'all' }, { value: 'visible' }, { value: 'none' }];
  const coloringOptions = [{ value: 'original' }, { value: 'convertMonochrome' }, { value: 'convertGrayscale' }];
  const fontOptions = [
    { value: 'serif', label: 'Serif' },
    { value: 'sans-serif', label: 'Sans-Serif' },
    { value: 'cursive', label: 'Cursive' },
    { value: 'monospace', label: 'Monospace' }
  ];
  const compressionOptions = [{ value: 'jpg' }, { value: 'lzw' }, { value: 'packbits' }, { value: 'ccitt' }];
  const colorConversionOptions = [{ value: 'original' }, { value: 'convertMonochrome' }, { value: 'convertGrayscale' }];
  const colorDepthOptions = [
    { value: 'force1bpp' },
    { value: 'max4bpp' },
    { value: 'force4bpp' },
    { value: 'max8bpp' },
    { value: 'force8bpp' },
    { value: 'max24bpp' },
    { value: 'force24bpp' }
  ];
  const markupTools = [
    {
      title: 'Tools', //
      tools: [
        {
          label: 'select markup',
          tool: 'select',
          icon: 'Select'
        }
      ]
    },
    {
      title: 'toolPalette.annotations', // "Annotations" are the subset of "markups" used for drawing shapes
      tools: [
        //{
        //  label: 'custom1',
        //  tool: 'text',
        //  className: 'test-markup-button',
        //  props: {
        //    title: '%User Stamp',
        //    text: 'Date: %Date\nTime: %Time\nUser: %User\nRole: %DBString(role)\nStatus: %DBUpdateString(status)'
        //  }
        //},
        { label: 'custom2', tool: 'text', icon: 'Text', props: { text: '%User' } },
        { label: 'text', tool: 'text', icon: 'Text', props: {} },
        { label: 'arrow', tool: 'arrow', icon: 'Arrow', props: {} },
        { label: 'ellipse', tool: 'ellipse', icon: 'Ellipse', props: {} },
        { label: 'arc', tool: 'arc', icon: 'Arc', props: {} },
        { label: 'scratchout', tool: 'scratchout', icon: 'Scratchout', props: {} },
        { label: 'cloudRectangle', tool: 'cloudRectangle', icon: 'CloudRectangle', props: {} },
        { label: 'cloudPolygon', tool: 'cloudPolygon', icon: 'CloudPolygon', props: {} },
        { label: 'openSketch', tool: 'openSketch', icon: 'OpenSketch' },
        { label: 'closedSketch', tool: 'closedSketch', icon: 'ClosedSketch' },
        { label: 'line', tool: 'line', icon: 'Line', props: {} },
        {
          label: 'polyline',
          tool: 'polyline',
          icon: 'Polyline',
          props: { closed: false }
        },
        { label: 'crossout', tool: 'crossout', icon: 'Crossout', props: {} },
        { label: 'rectangle', tool: 'rectangle', icon: 'Rectangle', props: {} },
        {
          label: 'polygon',
          tool: 'polygon',
          icon: 'Polygon',
          props: { closed: true }
        },
        {
          label: 'highlight',
          tool: 'highlight',
          icon: 'Highlight'
        },
        {
          label: 'roundedRectangle',
          tool: 'roundedRectangle',
          icon: 'RoundedRectangle'
        },
        {
          label: 'changemark',
          tool: 'changemark',
          icon: 'Changemark',
          props: { fill: '#f05822dd' } // OpenText "Burnt" color
        },
        {
          label: 'raster',
          tool: 'raster',
          icon: 'Raster'
        },
        {
          label: 'stamp',
          tool: 'stamp',
          icon: 'Stamp'
        }
      ]
    },
    {
      title: 'toolPalette.text', // "text editing" are the subset of "markups" used for marking text content
      tools: [
        {
          label: 'textScratch',
          tool: 'textScratch',
          icon: 'TextScratchout'
        },
        {
          label: 'textUnderline',
          tool: 'textUnderline',
          icon: 'TextUnderline'
        },
        {
          label: 'textStrike',
          tool: 'textStrike',
          icon: 'TextStrikeThrough'
        },
        {
          label: 'textHighlight',
          tool: 'textHighlight',
          icon: 'TextHighlight'
        }
      ]
    },
    {
      title: 'toolPalette.redactions', // "redactions" are the subset of "markups" used for marking text content
      tools: [
        {
          label: 'redactionRectangle',
          tool: 'redactionRectangle',
          icon: 'RedactArea'
        },
        {
          label: 'redactionText',
          tool: 'redactionText',
          icon: 'RedactText'
        },
        {
          label: 'peekRectangle',
          tool: 'peekRectangle',
          icon: 'RedactPeek'
        }
      ]
    }
  ];



  //========================options for the viewer

  const handleLoadBlobId = (componentId) => {
    if (inBlobId) {
      //if we provide a blob id as the input, don't bother getting the default rendition
      setBlobId(inBlobId);
      return;
    }


    addActiveId(componentId);
    let foundRendition = false;

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${docObject.id}/contents`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data._embedded) {
        res.data._embedded.collection.forEach( item => {
          if (item.mime_type=='application/vnd.blazon+json') {
            //call download file
            setBlobId(item.blob_id);
            foundRendition=true;
          }
          });
        
      }
      removeActiveId(componentId);
      if (!foundRendition) {
        setMessage('Viewer rendition not found!');
      }
    }, '', []);
  }

  const loadBravaViewer = (componentId) => {
    addActiveId(componentId);

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/viewer/api/v1/viewers/brava-view-1.x/loader`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };

    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        //console.log(res.data);
        const scriptEl = document.createElement("script");
        scriptEl.appendChild(document.createTextNode(res.data));
        document.getElementsByTagName("head")[0].appendChild(scriptEl);
      }
      removeActiveId(componentId);
    }, '', []);
  };

  const downloadItem = (componentId) => {
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[0]}//css.${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).split('//')[1]}/v2/content/${blobId}/download?avs-scan=false`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        //console.log('Publication found')
        console.log(res.data);

        setPublicationData(res.data);
      }
      setBlobId(''); 
      removeActiveId(componentId);
      
    }, '', []);
  }


  useEffect(
    () => {
        if (blobId) downloadItem('blobDiv')
        // eslint-disable-next-line
      },[blobId]
    );
  

  useEffect(() => {
    //console.log('BravaApi');
    if (publicationData && publicationData.status && publicationData.status!=='Complete') {
      setMessage('Publication status: ' + publicationData.status);
    } else {
      if (publicationData.status==='Complete') {
        setMessage('');
      } else {
        if (publicationData.id && !publicationData.status) {
          setMessage('The JSON does not appear to be a publication file.');
        }
      }
    }
    
    if (bravaApi && publicationData.id) {
            bravaApi.setHttpHeaders({
              Authorization: "Bearer " + token
            });
            //other options 
            
            bravaApi.setScreenBanner(
              "Developer Services Viewer by OpenText | Document Viewed at %Time"
            );
            bravaApi.enableMarkup(true);
            //bravaApi.enableMarkupEvents(true);
            bravaApi.editableMarkupPredicate = () => true;
            bravaApi.commentableMarkupPredicate = () => true;
            bravaApi.visibleToolPropertyPredicate = () => true;
            bravaApi.deletableMarkupPredicate = () => true;
            bravaApi.deletableStampPredicate = () => true;
            bravaApi.editableStampPredicate = () => true;
            bravaApi.addableStampPredicate = () => true;
            bravaApi.visibleCommandPredicate = () => true;
       
            //console.log(window.ViewerAuthority);
          
            bravaApi.setSearchHost((localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL));
            bravaApi.setMarkupHost((localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL));
            bravaApi.setUserName(userName);
            //bravaApi.setTitle(appenv.fileId);
            //bravaApi.setScale("1.0")
            bravaApi.setScreenWatermark("DevEx Viewer");
      
            bravaApi.setLayout({
              onSearchClearSetActiveTab: {
                layoutKey: 'tabContainerWithMarkups',
                title: 'tab.thumbnails'
              },
              onSearchResultsSetActiveTab: {
                layoutKey: 'tabContainerWithMarkups',
                title: 'tab.searchResults'
              },
              topToolbar: 'toolbarWithMarkupStuff',
              toolbarWithMarkupStuff: toolbarWithMarkupStuff,
              mainContainer: [
                { component: 'TabContainer', layoutKey: 'tabContainerWithMarkups' },
                { component: 'PageContainer' }
              ],
              tabContainerWithMarkups: tabContainerWithMarkups,
              tabContainerEmpty: tabContainerEmpty,
              measureTools: measureTools,
              rightTabContainer: rightTabContainer,
              markupTools: markupTools,
              markupFilters: markupFilters,
              searchOptions: searchOptions,
              pdfExport: pdfExport,
              tiffExport: tiffExport,
              printExport: printExport,
              pdfExportActions: pdfExportActions,
              pdfExportDefaults: pdfExportDefaults,
              tiffExportDefaults: tiffExportDefaults,
              printExportDefaults: printExportDefaults,
              tiffExportDisabled: tiffExportDisabled,
              tiffExportHidden: tiffExportHidden,
              exportDialogs: ['pdf', 'tiff', 'print'],
              pageSizeOptions: pageSizeOptions,
              isoOptions: isoOptions,
              orientationOptions: orientationOptions,
              layerOptions: layerOptions,
              coloringOptions: coloringOptions,
              fontOptions: fontOptions,
              compressionOptions: compressionOptions,
              colorConversionOptions: colorConversionOptions,
              colorDepthOptions: colorDepthOptions,
              pageOutputOptions: pageOutputOptions,
              settings: {
                tabs: [
                  {
                    title: 'tab.coloring',
                    component: 'Coloring'
                  },
                  {
                    title: 'tab.measure',
                    component: 'Measure'
                  },
                  {
                    title: 'tab.display',
                    component: 'Display'
                  }
                ]
              }
            })



            bravaApi.addPublication(publicationData, true, inMarkupId ?? null);
            bravaApi.render(VIEWER_ID); 
        }
        // eslint-disable-next-line
  }, [bravaApi, publicationData]);

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log('DocumentView loaded.');
      
        window.addEventListener("bravaReady", function (event) {
          const currentOrigin = window.location.origin;
          if (event.origin && event.origin !== currentOrigin) {
            return;
          }
          if (event.target && event.target.origin === currentOrigin) {
            
            setBravaApi(window[event["detail"]]);
            window.addEventListener(event.detail + '-close', function() {
              //console.log('Close button clicked');
              closeAction();
            });
          }
      });
      loadBravaViewer('entireDiv');
      handleLoadBlobId('entireDiv');
        // eslint-disable-next-line
    },[]
    );

  
  return (
      <Box height="90vh">
        {blobId && 
              <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='blobDiv'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin',
                wordWrap: 'break-word'
                }}>
              BlobId: {blobId}
            </Typography>}
            {message && 
              <Box sx={{color:'red'}}><Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              >
              {message}
            </Typography></Box>}
        <Box sx={{
          borderStyle: (activeId.split(',').find((obj) => {return obj==`entireDiv`}) && showBorder)?'solid':'none', 
          borderColor: 'red',
          borderWidth: 'thin'}}>
            <div className={inFull==true?"viewer-full-div":(inRel==true?"viewer-rel-div":"viewer-div")} id={VIEWER_ID}></div>
        </Box>
            
            
            
            
        </Box>
  );
}
