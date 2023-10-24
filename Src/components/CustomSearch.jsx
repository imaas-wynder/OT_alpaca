import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

import { useTheme } from '@mui/material/styles';


//import PDFViewer from 'pdf-viewer-reactjs';

// MUI components
import { Button,
  Box,
  Dialog,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Paper
} from '@mui/material';

import { visuallyHidden } from '@mui/utils';

import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import AddLinkIcon from '@mui/icons-material/AddLink';

import HighlightOffIcon from '@mui/icons-material/HighlightOff';


import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import CustomTablePagination from './CustomTablePagination';

import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import CustomSearchObjectConfig from './CustomSearchObjectConfig';
import CustomSearchSave from './CustomSearchSave';
import CustomSearchOpen from './CustomSearchOpen';
import ActionsComponent from './ActionsComponent';

function FacetList(props) {
  const { facetName, facetSubName, facetLabel, facetRows, outSelectedRow, selectedRow } = props;
  
  
  const [open, setOpen] = React.useState(false);

  const handleListSelect = (value) => {
    if (selectedRow===value) {
      outSelectedRow(facetName, facetSubName, '');
    } else {
      outSelectedRow(facetName, facetSubName, value);
    }
  }

  const handleClick = () => {
    setOpen(!open);
  };


  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', p:0 }}
      component="div" 
      aria-labelledby={"facet-list-" + facetName}
    >
      <ListItemButton onClick={handleClick} sx={{backgroundColor:'#e1e1e1'}}>
        <ListItemText primary={<React.Fragment><Box sx={{fontWeight:'bold'}}>{facetLabel ?? facetName}</Box>{selectedRow && <Box sx={{fontSize:'12px', fontStyle:'italic'}}>{`(${selectedRow})`}</Box>}</React.Fragment>} primaryTypographyProps={{variant:'subtitle2', gutterBottom: false}}/>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
        {Object.keys(facetRows).map((facetRow, index) => {
          if (facetRows[facetRow]>0 || facetName==='facet_queries' || (facetRow===selectedRow)) {
            return (
              <ListItemButton key={facetName + '_' + index} sx={{ pl: 0 }} selected={facetRow===selectedRow} onClick={() => {handleListSelect(facetRow)}}>
                <ListItemIcon sx={{p:0, m:0, minWidth: 30}}>
                  <LocationSearchingIcon fontSize='small'/>
                </ListItemIcon>
                <ListItemText primary={`${facetRow} (${facetRows[facetRow]})`} primaryTypographyProps={{variant:'subtitle2', gutterBottom: false}} sx={{wordWrap: 'break-word'}}/>
              </ListItemButton>
            )
          }
            
          }                  
        )}
        </List>
      </Collapse>
    </List>
  )
}


const Butt = ({ display, row, runRequest, token, userName, showBorder, isSelect, inCategory, curFolder, outSelectedObject, handleRefreshList, setDisplay, isDialogDisplayed }) => {
  const theme = useTheme();

  return (
    <div className={display}>
      <Stack direction={'row'} 
        sx={{backgroundColor: '#ffffff',
          borderTopRightRadius: theme.spacing(2),
          borderBottomRightRadius: theme.spacing(2),
          borderTopLeftRadius: theme.spacing(2),
          borderBottomLeftRadius: theme.spacing(2),
          borderColor: '#f1f1f1',
          borderStyle: 'solid',
          borderWidth: 'thin',
          boxShadow: 'inset 1px 1px 3px #999',
          position: "absolute",
          top: "50%",
          left: "90%",
          opacity: "100%",
          transform: "translate(0%, -50%)" 
        }}
        onClick={(e) => {e.stopPropagation(); }}>

        <ActionsComponent 
          runRequest={runRequest}
          token={token}
          userName={userName}
          showBorder={showBorder}
          isSelect={isSelect}
          inCategory={inCategory}
          inObject={row}
          inCurFolderId={curFolder?.id ?? ''}
          outCopiedId={() => { }}
          outSelectedObject={outSelectedObject}
          shouldRefresh={handleRefreshList}
          isActions={true} 
          inAction = { '' }
          inActionId = {''} 
          inCompact = {false}
          outCloseAction = {(result) => {setDisplay('')}} 
          isDialogDisplayed = {isDialogDisplayed}
        />
        
      </Stack>
      
      
    </div>
  );
};

 


export default function CustomSearch(props) {
  const { runRequest, token, userName, showBorder, searchConfig, setSearchConfig, inUrlSearchId, urlLoaded, setUrlLoaded } = props;

  const [saveSearch, setSaveSearch] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [ftSearchEnabled, setFtSearchEnabled] = useState(false);

  const [facetCollection, setFacetCollection] = useState([]);

  const [searchUrl, setSearchUrl] = useState('');
  const [copied, setCopied] = useState(false);

  
  const [inFolder, setInFolder] = useState({}); //for keeping the last folder used

  const [selectedSearchObject, setSelectedSearchObject] = useState({});
  const [outSearchObject, setOutSearchObject] = useState({});
  

  const [tempConfig, setTempConfig] = useState({});
  //searchConfig: category, type, latest, filterArray, headCells
  //headCell: id, sorting, type, repeating, disablePadding, label, system, trait, traitInstance

  const [editSearch, setEditSearch] = useState(false);
  
  const [activeId, setActiveId] = useState('');

  const [display, setDisplay] = useState("notdisplayed");
  const [dialogDisplayed, setDialogDisplayed] = useState(false);


  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  const [rowCount, setRowCount] = React.useState(0);
  const [curPage, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortCol, setSortCol] = React.useState('name');
  const [sortOrd, setSortOrd] = React.useState('asc');
  const [selectedRow, setSelectedRow] = React.useState({});


  
  const handleChangePage = (newPage, newRowsPerPage) => {
    setPage(newPage);
    setRowsPerPage(newRowsPerPage);
    //console.log('Changed page to: ' + newPage);
    handleRefreshList()
  };

  const createSortHandler = (property) => {
    const isAsc = sortCol === property && sortOrd === 'asc';
    setSortOrd(isAsc ? 'desc' : 'asc');
    setSortCol(property);
    handleRefreshList();
  };

  //for icons on row
  
  const showButton = (e, row) => {
    e.preventDefault();
    if (!dialogDisplayed) {
      setDialogDisplayed(false);
    }
    setDisplay(row.id);

  };

  const hideButton = (e, row) => {
    if (!dialogDisplayed) {
      e.preventDefault();
      setDisplay('');
    }
  };

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getFieldValue = (value, type) => {
    if (!value) return '';
    if (value.constructor===Object) {
      return JSON.stringify(value);
    }
    switch (type) {
      case 'integer':
        return isNaN(value) ? null : Number(value).toLocaleString();
      case 'double':
        return isNaN(value) ? null : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 });
      case 'bigint':
        return isNaN(value) ? null : Number(value).toLocaleString();
      case 'boolean':
        return value===true ? 'True' : 'False';
      case 'date':
        return getDateValue(value);
      default:
        return value;
    }
  }

  const getDisplayValue = (headCell, row) => {
    
    if (headCell.repeating===true) {
      if (headCell.trait) {
        if (row.traits && row.traits[headCell.trait] && row.traits[headCell.trait][headCell.traitInstance] && row.traits[headCell.trait][headCell.traitInstance][headCell.id]) {
          return row.traits[headCell.trait][headCell.traitInstance][headCell.id].join(', ');
        } else {
          return '';
        }
      } else {
        if (row.properties && row.properties[headCell.id]) {
          return row.properties[headCell.id].join(', ');
        } else {
          return '';
        }
      }
    } else {
      if (headCell.system===true) {
        if (row[headCell.id]) return getFieldValue(row[headCell.id], headCell.type);
      } else {
        if (headCell.trait) {
          if (row.traits && row.traits[headCell.trait] && row.traits[headCell.trait][headCell.traitInstance] && row.traits[headCell.trait][headCell.traitInstance][headCell.id]) {
            return getFieldValue(row.traits[headCell.trait][headCell.traitInstance][headCell.id], headCell.type);
          } else {
            return '';
          }
        } else {
          if (row.properties) {
            return getFieldValue(row.properties[headCell.id], headCell.type);
          } else {
            return '';
          }
        }
      }
    }
  }

  const getList = (inCategory, inType, page, size, inSortCol, inSortOrd, inFilterArray, inLatest, inObj,  componentId) => {
    //this call is to get all type objects according to the search criteria using field level filters
    //console.log(`In parameters: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    addActiveId(componentId);

    let filters = [];
    if (inObj.folderId) {
      filters.push(`parent_folder_id eq '${inObj.folderId}'`);
    }
    for (let i=0; i<inFilterArray.length; i++) {
      filters.push(inFilterArray[i].filterStr);
    }

    page = page + 1;
    if (!size) size=10;

    //check sort col if it's trait column
    let headCell = searchConfig.headCells.find((obj) => {return obj.id===inSortCol});
    if (headCell?.trait && headCell?.trait!=='') {
      inSortCol = `traits.${headCell.trait}.${inSortCol}`;
    }
    
    //console.log(`Before call: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inCategory}/${inType}?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}&filter=${inLatest===false?`(latest eq 'true' or latest eq 'false')`:`latest eq 'true'`}${filters.length>0?` and ${filters.join(' and ')}`:``}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
        
      } else {
        setRows([]);
      }
      setRowCount(res.data?.total ?? 0);
      setUpdatedList(false);
      removeActiveId(componentId);
    }, '', []);
  }

  const getSufix = (type) => {
    switch (type) {
      case 'string':
        return '_s';  
      case 'boolean':
        return '_b';
      case 'integer':
        return '_i';
      case 'date':
        return '_dt';   
      case 'long':
        return '_l'; 
      case 'double':
        return '_d'; 
      case 'float':
        return '_fs'; 
      case 'bigint':
        return '_l'; 
    default:
        return '';
    }
  }

  const getFtList = (inCategory, inType, page, size, inSortCol, inSortOrd, inFilterArray, inLatest, inFulltext, inAllTraits, inObj, componentId) => {
    //this call is to get all type objects using fullText search
    //console.log(`In parameters: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    addActiveId(componentId);

    let filters = [];
    if (inFulltext && inFulltext.search(/~/g)!=-1) {
      //do not add ""
      filters.push(`cms_any.all_values:${inFulltext}`);
    } else {
      filters.push(`cms_any.all_values:\"${inFulltext ?? '*'}\"`);
    }

    if (inAllTraits) {
      if (inAllTraits.search(/~/g)!=-1) {
        //do not add ""
        filters.push(`cms_any.all_traits:${inAllTraits}`);
      } else {
        filters.push(`cms_any.all_traits:\"${inAllTraits}\"`);
      }
    }

    
    for (let i=0; i<inFilterArray.length; i++) {
      filters.push(inFilterArray[i].filterFtStr);
    }
    if (inLatest===true) {
      filters.push('cms_any.latest_b:true');
    } else {
      filters.push('(cms_any.latest_b:true OR cms_any.latest_b:false)');
    }

   

    page = page + 1;
    if (!size) size=10;

   
    let ftQuery = {vals: {
      q: [ filters.join(' AND ') ]
    }};

     //check sort col if it's trait column
     let headCell = searchConfig.headCells.find((obj) => {return obj.id===inSortCol});

     if (headCell && headCell.search_name) {
        ftQuery.vals.sort = [`${headCell.search_name.split(',')[0].replace(/<instance>/g, (headCell.traitInstance ?? ''))} ${inSortOrd}`];
     } 

     if (inObj.facetSearch===true) {
        ftQuery.vals.facet = [`true`];
        //get the selected facets
        // let fcQuery = ["{!key=CREATED_TODAY}cms_any.create_time_dt:[NOW-1DAY TO NOW]" ,
        // "{!key=CREATED_THIS_WEEK}cms_any.create_time_dt:[NOW/DAY-7DAY/DAY TO NOW]",
        // "{!key=CREATED_LAST_WEEK}cms_any.create_time_dt:[NOW/DAY-14DAY/DAY TO NOW/DAY-7DAY/DAY]",
        // "{!key=CREATED_THIS_MONTH}cms_any.create_time_dt:[NOW/MONTH TO NOW/MONTH+1MONTHS]",
        // "{!key=CREATED_6_MONTHS}cms_any.create_time_dt:[NOW/MONTH-6MONTHS TO NOW/MONTH+1MONTHS]",
        // "{!key=CREATED_THIS_YEAR}cms_any.create_time_dt:[NOW/YEAR TO NOW]",
        // "{!key=MODIFIED_TODAY}cms_any.update_time_dt:[NOW-1DAY TO NOW]" ,
        // "{!key=MODIFIED_THIS_WEEK}cms_any.update_time_dt:[NOW/DAY-7DAY/DAY TO NOW]",
        // "{!key=MODIFIED_6_MONTHS}cms_any.update_time_dt:[NOW/MONTH-6MONTHS TO NOW/MONTH+1MONTHS]"];

        let fcQuery =[];

        for (let i=0; i<inObj.queryArray?.length; i++) {
          fcQuery.push(inObj.queryArray[i].queryStr);
        }

        let fq = [];
        let fFields = [];

        for (let i=0; i<facetCollection.length; i++) {
          if (facetCollection[i].selectedRow) {
            if (facetCollection[i].name==='facet_queries') {
              let queryDef = fcQuery.find((obj) => {return obj.search(RegExp(`{!key=${facetCollection[i].selectedRow}}`, 'g'))>=0});
              if (queryDef) {
                fq.push(queryDef.replace(RegExp(`{!key=${facetCollection[i].selectedRow}}`, 'g'),''));
              }
            } else {
              fq.push(`${facetCollection[i].name}:${facetCollection[i].selectedRow}`);
            }
          }
        }

        for (let i=0; i<inObj.facetFields?.length; i++) {
          if (inObj.facetFields[i].search_name.split(',').length>1) {
            //cms_any.type_s should not be used for facets, rather the second one cms_any.type_rel_sys
            //might add more rules in here
            if (inObj.facetFields[i].search_name.split(',')[0]==='cms_any.type_s') {
              fFields.push(inObj.facetFields[i].search_name.split(',')[1]);
            } else {
              fFields.push(inObj.facetFields[i].search_name.split(',')[0]);
            }
            
          } else {
            fFields.push(inObj.facetFields[i].search_name.replace(/<instance>/g, inObj.facetFields[i].traitInstance));
          }
          
        }

        ftQuery.vals.fq = [fq.join(' AND ')]; 
        ftQuery.vals["facet.field"] = fFields;
        ftQuery.vals["facet.query"] = fcQuery;

        if (inType) {
          
          ftQuery.vals.type = [inType]; 
          //can also add folder id: ftQuery.vals.folderId (also array)
        } 
        if (inObj.folderId) {
          ftQuery.vals.folderId = [inObj.folderId]; 
        }
     }
    
    //console.log(`Before call: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    let req = { 
      method: 'post', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/ft-query?include-total=true&page=${page}&items-per-page=${size}&fetch-facet-labels=${true}`, 
      data: ftQuery,
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*', 'Content-Type': 'application/json' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
        
      } else {
        setRows([]);
      }
      if (res.data?.facetCounts) {
        let outFacets = [];
        if (res.data.facetCounts.facet_intervals && (JSON.stringify(res.data.facetCounts.facet_intervals) !== '{}')) {
          outFacets.push({
            name: 'facet_intervals', 
            label: 'Intervals', 
            sub_name: 'facet_intervals',
            rows: res.data.facetCounts.facet_intervals, 
            selectedRow: (facetCollection.find((obj) => {return obj.name=='facet_intervals'})?.selectedRow ?? '')});
        }
        if (res.data.facetCounts.facet_queries && (JSON.stringify(res.data.facetCounts.facet_queries) !== '{}')) {
          //want to split the queries into different queries based on the first underscore
          for (var key in res.data.facetCounts.facet_queries) {
            if (res.data.facetCounts.facet_queries.hasOwnProperty(key)) {
              
              if (key.split('_').length>1) {
                //query name is CATEGORY_VALUE
                if (outFacets.find((obj) => {return obj.name==='facet_queries' && obj.sub_name===key.split('_')[0]})) {
                  outFacets[outFacets.findIndex((obj) => {return obj.name==='facet_queries' && obj.sub_name===key.split('_')[0]})].rows[key] = res.data.facetCounts.facet_queries[key];
                } else {
                  outFacets.push({
                    name: 'facet_queries', 
                    label: 'Queries', 
                    sub_name: key.split('_')[0],
                    rows: {[key] : res.data.facetCounts.facet_queries[key]},
                    selectedRow: (facetCollection.find((obj) => {return obj.name=='facet_queries' && obj.sub_name===key.split('_')[0]})?.selectedRow ?? '')
                    });
                }
              } else {
                //normal query, generic category
                if (outFacets.find((obj) => {return obj.name==='facet_queries' && obj.sub_name==='facet_queries'})) {
                  outFacets[outFacets.findIndex((obj) => {return obj.name==='facet_queries' && obj.sub_name==='facet_queries'})].rows[key] = res.data.facetCounts.facet_queries[key];
                } else {
                  outFacets.push({
                    name: 'facet_queries', 
                    label: 'Queries', 
                    sub_name: 'facet_queries',
                    rows: {[key] : res.data.facetCounts.facet_queries[key]},
                    selectedRow: (facetCollection.find((obj) => {return obj.name=='facet_queries' && obj.sub_name==='facet_queries'})?.selectedRow ?? '')
                    });
                }

              }
            }
            
            
          }

          // outFacets.push({
          //   name: 'facet_queries', 
          //   label: 'Queries', 
          //   rows: res.data.facetCounts.facet_queries,
          //   selectedRow: (facetCollection.find((obj) => {return obj.name=='facet_queries'})?.selectedRow ?? '')
          //   });
        }
        if (res.data.facetCounts.facet_fields && (JSON.stringify(res.data.facetCounts.facet_fields) !== '{}')) {
          for (var key in res.data.facetCounts.facet_fields) {
            if (res.data.facetCounts.facet_fields.hasOwnProperty(key)) {
                outFacets.push({
                  name: key, 
                  sub_name: key,
                  label: ((res.data.facetCounts.facet_fields_label && res.data.facetCounts.facet_fields_label[key]) ? res.data.facetCounts.facet_fields_label[key] : key), 
                  rows: res.data.facetCounts.facet_fields[key],
                  selectedRow: (facetCollection.find((obj) => {return obj.name==key})?.selectedRow ?? '')
                });
            }
          }
        }

        
        setFacetCollection(outFacets);
      } else {
        setFacetCollection([]);
      }
      setRowCount(res.data?.total ?? 0);
      setUpdatedList(false);
      removeActiveId(componentId);
    }, '', []);
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id==row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id==row.id)?{}:row);
    }
  }

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

  const getFtSearchStatus = () => {
    addActiveId('butFtSearch');
    
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/configs/ft_search_enabled`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.key && res.data.key==='ft_search_enabled') {
        setFtSearchEnabled(res.data.value==='true'?true:false);
      }
      
      removeActiveId('butFtSearch');
    }, '', []);
  }

  const setFtSearchStatus = () => {
    addActiveId('butFtSearch');
    
    let req = { 
      method: 'put', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/configs/ft_search_enabled`, 
      data: {"key": "ft_search_enabled",
        "value": "true"},
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.key && res.data.key==='ft_search_enabled') {
        setFtSearchEnabled(res.data.value==='true'?true:false);
      }
      
      removeActiveId('butFtSearch');
    }, '', []);
  }

  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setSelectedRow({});
    setDisplay('');
    setUpdatedList(true);
  }

  const handleSelectFacet = (facetName, facetSubName, value) => {
    const outArray = [...facetCollection];

    for (let i=0; i<outArray.length; i++) {
      if (outArray[i].name === facetName && (outArray[i].sub_name === facetSubName || !outArray[i].sub_name)) {
        let item = outArray[i];
        item.selectedRow = value;
        outArray.splice(i,1,item);
      }
    }
    setFacetCollection(outArray);
    //console.log(`Selected ${value} on facet ${facetName}`);
    handleRefreshList();
  }

  const getSearchPrimaryRendition = (componentId, searchId) => {
    addActiveId(componentId);
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/file/cms_file/${searchId}`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data && res.data.id && res.data._links) {
        setSelectedSearchObject(res.data);
        //console.log('Download: ' + res.data._links['urn:eim:linkrel:download-media'].href);
        downloadSearch(res.data._links['urn:eim:linkrel:download-media']?.href, componentId + 'dwn');
        
      }
      removeActiveId(componentId);
      
    }, '', []);

  }

  const downloadSearch = (inUrl, componentId) => {
    if (!inUrl) return;
    addActiveId(componentId);
    
    let req = { 
      method: 'get', 
      url: inUrl, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' },
      responseType: 'blob' 
    };
    runRequest(req, (res) => {
      //console.log('Reached output function')
      if (res.data) {
        var reader = new FileReader();
        reader.onload = function () {
          try {
            let objOut = JSON.parse(reader.result);
            let validFile = false;
            //console.log(objOut);
            if (objOut?.headCells) {
              validFile=true;
            }
            if (!validFile) {
              console.log(`The selected file does not appear to be a valid search configuration`);
            } else {
              
              setSearchConfig(objOut); 
              handleRefreshList()
              setUrlLoaded(true);
              
          
            }
          } catch (error) {
            console.log(`The selected file does not appear to be a valid automation configuration`);
            setUrlLoaded(true);
          }
          
        };
        reader.onerror = function (error) {
          console.log(`The selected file does not appear to be a valid automation configuration`);
          setUrlLoaded(true);
        };
        
        reader.readAsText(res.data);


        
         
      }
      removeActiveId(componentId);
      
    }, '', []);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        
       setUpdatedList(true);
       getFtSearchStatus();
       //setSelectedSearchObject({});
      if (inUrlSearchId && !urlLoaded) {
        getSearchPrimaryRendition('urlLoad', inUrlSearchId);
      }

    },[]
    );

  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        if (searchConfig.category) {
          if (searchConfig.ftSearch===true) {
            getFtList(searchConfig.category, (searchConfig.typeStrict===true ? searchConfig.type : ''), curPage, rowsPerPage, sortCol, sortOrd, searchConfig.filterArray, searchConfig.latest, searchConfig.fullText, searchConfig.allTraits, searchConfig, 'contentsList');
          } 
          else {
            getList(searchConfig.category, searchConfig.type, curPage, rowsPerPage, sortCol, sortOrd, searchConfig.filterArray, searchConfig.latest, searchConfig, 'contentsList');
          }
          
        } else {
          setUpdatedList(false);
        }
        
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
        <Box height={"70vh"} 
          key="box-left-panel" 
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            overflowY: "auto", 
            overflowX: "hidden", 
            "&::-webkit-scrollbar": {
              height: 3,
              width: 3,
              borderRadius: 2
              },
              "&::-webkit-scrollbar-track": {
              backgroundColor: "white"
              },
              "&::-webkit-scrollbar-thumb": {
              backgroundColor: "gray",
              borderRadius: 2
              },
              borderStyle: (activeId.split(',').find((obj) => {return obj=='contentsList'}) && showBorder)?'solid':'none', 
              borderColor: 'red',
              borderWidth: 'thin'
              }}
              >
          <Stack direction={'row'} spacing={1}>
            {searchConfig.facetSearch===true && facetCollection.length>0 && 
              <Box sx={{width: '15vw',
              maxHeight: '70vh',
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overflowY: "auto", 
              overflowX: "hidden", 
              "&::-webkit-scrollbar": {
                height: 3,
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
              <Stack direction={'column'} spacing={1}>
              {facetCollection.map((facet) => {
                return (
                  <FacetList 
                    key={facet.sub_name ?? facet.name} 
                    facetName={facet.name} 
                    facetSubName={facet.sub_name ?? ''} 
                    facetLabel={(facet.sub_name  && facet.sub_name!==facet.name ) ? facet.sub_name : facet.label} 
                    facetRows={facet.rows} 
                    selectedRow={facet.selectedRow} 
                    outSelectedRow={handleSelectFacet}/>
                )}     
              )}
              </Stack>
                
                
              </Box>}
            {<TableContainer component={Paper} sx={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    overflowY: "auto", 
                    overflowX: "auto", 
                    "&::-webkit-scrollbar": {
                      height: 3,
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
              <Table stickyHeader size="small" aria-label="table">
                <TableHead>
                  <TableRow>
                    
                    {searchConfig.headCells && searchConfig.headCells.length>0 && searchConfig.headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={(headCell.type=='integer' || headCell.type=='double' || headCell.type=='bigint') ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={sortCol === headCell.id ? sortOrd : false}
                      >
                        {headCell.sorting ? <TableSortLabel
                          active={sortCol === headCell.id}
                          direction={sortCol === headCell.id ? sortOrd : 'asc'}
                          onClick={() => {createSortHandler(headCell.id)}}
                        >
                          {headCell.label}
                          {sortCol === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {sortOrd === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel> : 
                        headCell.label}
                      </TableCell>
                    ))}
                    <TableCell align="left">
                      <Stack direction={'row'}>
                        <IconButton size="small" variant="outlined" color="primary" title="Show url" 
                          disabled={!(selectedSearchObject.id)} 
                          onClick={()=>{setSearchUrl(`${process.env.REACT_APP_REDIRECT_URI}?action=searchload&searchid=${selectedSearchObject.id}`); setCopied(false);}}
                          >
                            <AddLinkIcon />
                        </IconButton>
                        <IconButton size="small" variant="outlined" color="primary" title="Configure search" onClick={() => { setEditSearch(true); setTempConfig(searchConfig) }}>
                          <SettingsSuggestIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        {<IconButton size="small" variant="outlined" color="primary" title="Save search" disabled={!(selectedSearchObject.id)} onClick={() => { setSaveSearch(true); setOutSearchObject(selectedSearchObject); }}>
                          <SaveIcon />
                        </IconButton>}
                        <IconButton size="small" variant="outlined" color="primary" title="Save search as..." disabled={(searchConfig.headCells.length===0)} onClick={() => { setSaveSearch(true); }}>
                          <SaveAsIcon />
                        </IconButton>
                        <IconButton size="small" variant="outlined" color="primary" title="Open saved search" onClick={() => { setOpenSearch(true); }}>
                          <OpenInBrowserIcon />
                        </IconButton>
                        <IconButton size="small" variant="outlined" color="error" title="Clear configuration" 
                          onClick={() => { setSearchConfig({category: '', type: '', latest: true, filterArray: [], headCells: []});setRows([]); }}>
                          <HighlightOffIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj==`butFtSearch`}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                            <IconButton size="small" variant="outlined" color={ftSearchEnabled ? "secondary" : "error"} title="Activate FullText search on tenant" onClick={() => { setFtSearchStatus() }}>
                              <ManageSearchIcon />
                            </IconButton>
                          </Box>
                        <Divider orientation="vertical" flexItem />
                        <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { setFacetCollection([]); handleRefreshList() }}>
                            <RefreshIcon />
                        </IconButton>
                      </Stack>
                      
                    </TableCell>
                  </TableRow>
                </TableHead>
                {<TableBody>
                  {rows.length>0 && rows.map((row) => (
                    <TableRow key={row.id} hover selected={selectedRow.id==row.id}>
                      {searchConfig.headCells.map((headCell, pIndex) => (
                        <TableCell 
                          key={headCell.id + row.id}
                          align={(headCell.type=='integer' || headCell.type=='double' || headCell.type=='bigint') ? 'right' : 'left'} 
                          onClick={() => {handleSelectRow(row, false)}} 
                          onMouseEnter={(e) => {if (headCell.showActions===true) showButton(e, row)}}
                          onMouseLeave={(e) => {if (headCell.showActions===true) hideButton(e, row)}} 
                          sx={{position: (headCell.showActions===true ? 'relative' : 'inherit'), whiteSpace: 'pre-line'}}
                          >
                            {getDisplayValue(headCell, row)}
                            {(display===row.id) && (headCell.showActions===true) && <Butt 
                                display={display===row.id ? "displayed" : "notdisplayed"} 
                                row={row}
                                runRequest={runRequest} 
                                token={token} 
                                userName={userName} 
                                showBorder={showBorder} 
                                isSelect={false} 
                                inCategory={''} 
                                outSelectedObject={()=>{}} 
                                handleRefreshList={handleRefreshList} 
                                setDisplay={setDisplay} 
                                isDialogDisplayed={setDialogDisplayed}
                              />}
                        </TableCell>
                      ))}

                      <TableCell align="left" onClick={() => {handleSelectRow(row, true)}} sx={{position: 'inherit'}}>
                        <ActionsComponent 
                            runRequest={runRequest}
                            token={token}
                            userName={userName}
                            showBorder={showBorder}
                            isSelect={false}
                            inCategory={''}
                            inObject={row}
                            inCurFolderId={''}
                            outCopiedId={() => {}}
                            outSelectedObject={() => {}}
                            shouldRefresh={handleRefreshList}
                            isActions={true} 
                            inCompact={searchConfig.compactActions ?? false} 
                            outCloseAction={() => {}} 
                            isDialogDisplayed={() => {}}
                          />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>}
                <CustomTablePagination
                  page={curPage} 
                  rowsPerPage={rowsPerPage} 
                  count={rowCount}
                  colSpan={7} 
                  onPaginationChange={handleChangePage}
                />
              </Table>
            </TableContainer>}
          </Stack>
                  
                </Box>
                <CustomSearchSave
                  runRequest = {runRequest} 
                  newFileOpen = {saveSearch} 
                  onCreateSuccess = {(result) => {setSaveSearch(false); }} 
                  token = {token} 
                  showBorder = {showBorder} 
                  configObject = {searchConfig} 
                  configType = {'search'} 
                  inExistingObject = {outSearchObject}
                  setOutObject = {(obj) => {setSelectedSearchObject(obj); setOutSearchObject({})}}
                  inFolder={inFolder} 
                  setInFolder={setInFolder}
                />
                <CustomSearchOpen
                  runRequest = {runRequest} 
                  newFileOpen = {openSearch} 
                  onSelectSuccess = {(result, loadObj) => {setOpenSearch(false); if (result) {setRows([]); setSearchConfig(loadObj); handleRefreshList()} }} 
                  token = {token} 
                  showBorder = {showBorder} 
                  configType = {'search'}
                  setOutObject = {(obj) => {setSelectedSearchObject(obj); setOutSearchObject({})}}
                  inFolder={inFolder} 
                  setInFolder={setInFolder}
                />
                <Dialog
                  open={editSearch}
                  onClose={() => {setEditSearch(false)}}
                  maxWidth={'xl'}  
                  fullWidth
                >
                  <DialogTitle>Search configuration</DialogTitle>
                  <DialogContent sx={{
                    maxHeight: '80vh',
                    mb: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    overflowY: "auto",
                    overflowX: "auto",
                    "&::-webkit-scrollbar": {
                      width: 3,
                      height: 3,
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
                    <CustomSearchObjectConfig runRequest = {runRequest} token = {token} showBorder={showBorder} inObj={tempConfig} setSearchObj={(searchObj) => {setTempConfig(searchObj);}}/>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => {setEditSearch(false); }}>Close</Button>
                    <Button onClick={() => {setEditSearch(false); setRows([]); setSearchConfig(tempConfig); handleRefreshList();}}>Update</Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={searchUrl!==''}
                  onClose={() => {setSearchUrl('')}}
                  maxWidth={'md'}  
                >
                  <DialogTitle>URL to load Search configuration</DialogTitle>
                  <DialogContent>
                    <Typography>{searchUrl}</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button disabled={copied} onClick={() => {navigator.clipboard.writeText(searchUrl); setCopied(true) }}>Copy</Button>
                    <Button onClick={() => {setSearchUrl('') }}>Close</Button>
                  </DialogActions>
                </Dialog>
                
                
            
        </React.Fragment>
  );
}
