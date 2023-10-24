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
  TextField,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
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
  CircularProgress,
  Paper
} from '@mui/material';

import { blue } from '@mui/material/colors';

import { 
  TreeView,
  TreeItem 
} from '@mui/lab';
import { treeItemClasses, useTreeItem  } from '@mui/lab/TreeItem';
import clsx from 'clsx';

import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import LabelIcon from '@mui/icons-material/Label';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import FolderIcon from '@mui/icons-material/Folder';
import BackspaceIcon from '@mui/icons-material/Backspace';
import InfoIcon from '@mui/icons-material/Info';

import CustomTablePagination from './CustomTablePagination';
import ActionsComponent from './ActionsComponent';


import ReactMarkdown from 'react-markdown';


const Butt = ({ display, row, runRequest, token, userName, showBorder, isSelect, inCategory, curFolder, outSelectedObject, handleRefreshList, setDisplay, isDialogDisplayed }) => {
  const theme = useTheme();

  
  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      //console.log(`But component loaded for row ${row.id}`);
      
        
    },[]
    );

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


//====section for preventing selection on expand click
const CustomContent = React.forwardRef(function CustomContent(props, ref) {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (event) => {
    handleSelection(event);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <Typography
        onClick={handleSelectionClick}
        component="div"
        className={classes.label}
      >
        {label}
      </Typography>
    </div>
  );
});

CustomContent.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object.isRequired,
  /**
   * className applied to the root element.
   */
  className: PropTypes.string,
  /**
   * The icon to display next to the tree node's label. Either a parent or end icon.
   */
  displayIcon: PropTypes.node,
  /**
   * The icon to display next to the tree node's label. Either an expansion or collapse icon.
   */
  expansionIcon: PropTypes.node,
  /**
   * The icon to display next to the tree node's label.
   */
  icon: PropTypes.node,
  /**
   * The tree node label.
   */
  label: PropTypes.node,
  /**
   * The id of the node.
   */
  nodeId: PropTypes.string.isRequired,
};


//====end section for preventing selection

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    width: `calc(100% - ${theme.spacing(2)})`,
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
      
    },
    '&.Mui-focused' : {
      backgroundColor: `inherit`,
      color: `${theme.palette.text.secondary}`,
      
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
}));

function StyledTreeItem(props) {
  const {
    labelText,
    taxType,
    loading,
    ...other
  } = props;
  const color="#1a73e8"; 
  const bgColor="#e8f0fe";

  return (
    <StyledTreeItemRoot
      ContentComponent={CustomContent} 
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', pr: 0 }}>
          <Box sx={{ mr: 1, position: 'relative', display: 'flex' }}>
            {taxType==='folder' ? <FolderIcon sx={{color: "#f8d775"}} /> : <LabelIcon />}
            {(taxType==='folder' && loading===true) && (
              <CircularProgress
                size={24} 
                thickness={6}
                sx={{
                  color: blue[900],
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
        </Box>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      {...other}
    />
  );
}


StyledTreeItem.propTypes = {
  labelText: PropTypes.string.isRequired,
  taxType: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired
};

function TaxonomyNode(props) {
  const {item, taxType, rootId} = props;

  if (item.children && item.children.length>0) {
    return (
      <StyledTreeItem nodeId={item.id} labelText={item.name} taxType={taxType} loading={item.id===rootId}>
        {item.children.map((child, index) => {return (<TaxonomyNode key={item.id + index} item={child} taxType={taxType} rootId={rootId}/>)})}
      </StyledTreeItem>
    )
  } else {
    return (
      <StyledTreeItem nodeId={item.id} labelText={item.name} taxType={taxType} loading={item.id===rootId}/>
    )
  }
  

}

function TaxonomyNavigator(props) {
  const { taxonomyObject, dynamicLoad, outSelectedRow, inSelected, taxType, rootId } = props;
  
  const handleSelect = (event, nodeIds) => {
    //console.log(event);
    //console.log(nodeIds);
    if (inSelected===nodeIds[0]) {
      outSelectedRow('');
    } else {
      outSelectedRow(nodeIds[0]);
    }
    
  };


  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon  />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      onNodeSelect={handleSelect} 
      selected={inSelected} 
      multiSelect
      sx={{ 
        height: '50vh', 
        flexGrow: 1, 
        maxWidth: 400, 
        overflow: 'hidden', 
        overflowX: 'auto', 
        overflowY: 'auto', 
        display: "flex",
        flexDirection: "column",
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
      }}
    >
      {taxonomyObject && taxonomyObject.length>0 && taxonomyObject.map((item, index) => {return (<TaxonomyNode key={'node_' + index} item={item} taxType={taxType} rootId={rootId}/>)} )}
    </TreeView>
  );
}





export default function TaxonomyBrowse(props) {
  const { runRequest, token, userName, showBorder } = props;

  
  const [markdownText, setMarkdownText] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [taxType, setTaxType] = useState('dynamic');

  const [fileOpen, setFileOpen] = useState(false);
  const [fileJson, setFileJson] = useState({});

  const [rootId, setRootId] = useState('');
  const [subscriptionRoot, setSubscriptionRoot] = useState('');
  
  const [activeId, setActiveId] = useState('');
  const [headCells, setHeadCells] = useState([
    {
      id: 'category',
      sorting: true,
      type: 'string',
      disablePadding: false,
      label: 'Cat',
      repeating: false,
      isJson: false,
      showButtons: false,
      system: true
    },
    {
      id: 'name',
      sorting: true,
      type: 'string',
      disablePadding: false,
      label: 'Object name',
      repeating: false,
      isJson: false,
      showButtons: true,
      system: true
    },
    {
      id: 'type',
      sorting: false,
      type: 'string',
      disablePadding: false,
      label: 'Type',
      repeating: false,
      showButtons: false,
      isJson: false,
      system: true
    },
    
    {
      id: 'update_time',
      sorting: true,
      type: 'date',
      disablePadding: false,
      showButtons: false,
      label: 'Updated on',
      repeating: false,
      isJson: false,
      system: true
    },
    {
      id: 'updated_by',
      sorting: false,
      type: 'string',
      disablePadding: false,
      showButtons: false,
      label: 'Updated by',
      repeating: false,
      isJson: true,
      system: true
    }
  ]);
   

  const [selectedNode, setSelectedNode] = useState('');

  const [typeName, setTypeName] = useState('');
  const [propName, setPropName] = useState('');
  const [relative, setRelative] = useState(true);
  const [filterArray, setFilterArray] = useState([]);
  const [taxArray, setTaxArray] = useState([]);

  
  const [typeList, setTypeList] = React.useState([]);
  const [repProps, setRepProps] = React.useState([]);

  //for table
  const [rows, setRows] = React.useState([]);
  const [updatedList, setUpdatedList] = React.useState(false);
  const [rowCount, setRowCount] = React.useState(0);
  const [curPage, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortCol, setSortCol] = React.useState('name');
  const [sortOrd, setSortOrd] = React.useState('asc');
  const [selectedRow, setSelectedRow] = React.useState({});

  const [display, setDisplay] = useState("notdisplayed");
  const [dialogDisplayed, setDialogDisplayed] = useState(false);



  
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
      case 'number':
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
        if (row.properties && row.properties[headCell.id]) {
          return row.properties[headCell.id].join('\n ');
        } else {
          return '';
        }
    } else {
      if (headCell.system===true) {
        if (headCell.isJson===true) {
          if (row[headCell.id]?.service_account) return 'system';
          if (row[headCell.id]?.email) return row[headCell.id].email;
        } else {
          if (row[headCell.id]) return getFieldValue(row[headCell.id], headCell.type);
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

  const getList = (inCategory, inType, page, size, inSortCol, inSortOrd, inFilterArray, inLatest, componentId) => {
    //this call is to get all type objects according to the search criteria using field level filters
    //console.log(`In parameters: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    addActiveId(componentId);

    let filters = [];
    for (let i=0; i<inFilterArray.length; i++) {
      filters.push(inFilterArray[i]);
    }

    page = page + 1;
    if (!size) size=10;

    //console.log(`Before call: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inCategory}/${inType}?include-total=true&page=${page}&items-per-page=${size}${inSortCol?`&sortby=${inSortCol} ${inSortOrd}`:``}&filter=${inLatest===false?`(latest eq 'true' or latest eq 'false')`:`latest eq 'true'`}${filters.length>0?` and (${filters.join(' or ')})`:``}`, 
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

  const handleRefreshList = () => {
    //console.log(`Page ${page}, total , sortCol , sortOrder `)
    setSelectedRow({});
    setDisplay('');
    setUpdatedList(true);
  }

  

  const checkChildren = (inCurArray, inEntry, inLevel) => {
    //inLevel starts at 1 as 0 is empty
    //inCurArray starts as the top level array
    const eItems = inEntry.split('/');
    
    if (eItems.length>inLevel) {
      const found = inCurArray.find((obj) => {return obj.name === eItems[inLevel]});
      if (!found) {
        //create the rest of the hierarchy
        
        let obj = {}
        for (let i=eItems.length-1; i>(inLevel-1); i--) {
          let tmpItems = eItems.slice(0, i+1);
          if (!obj.id) {
            obj = {id: tmpItems.join('/'), name: eItems[i], children: []}
          } else {
            const tmpObj = {...obj}
            obj = {id: tmpItems.join('/'), name: eItems[i], children: [tmpObj]};
          }
        }
        //console.log('Not found, creating')
        //console.log(obj);
        return obj;
      } else {
        
        const res = checkChildren(found.children, inEntry, inLevel + 1);
        //console.log('Found, result: ')
        //console.log(res);
        if (res.id) {
          //update the current array
          inCurArray[inCurArray.findIndex((obj) => {return obj.name === eItems[inLevel]})].children.push(res);
        } 
        return {};
      }

    } else {
      return {};
    }
  }

  const handleReadFileTaxonomy = (inArray) => {
    let curArray = [];
    for (let i=0; i<inArray.length; i++) {
      //here are the actual rows - now create the taxonomy
      const res = checkChildren(curArray, inArray[i], 1);
      if (res.id) {
        curArray.push(res);
      }
    }
    setTaxArray(curArray);
  }

  const getRootFolderId = (componentId, inFolderId) => {
    if (inFolderId) {
      setRootId(inFolderId);
      return;
    }

    let req = {};

    addActiveId(componentId);
    req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/folder/cms_folder/subscription-root`,  
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
      runRequest(req, (res) => {
        //console.log('Reached output function')
        if (res.data && res.data.id) {
          setTaxArray([]);
          setRootId(res.data.id);
          setSubscriptionRoot(res.data.id);
        }
        removeActiveId(componentId);
      }, '', []);

    
   
  }

  const handleReadFolderTaxonomy = (inFolderId, componentId) => {
    let curArray = [...taxArray];
    addActiveId(componentId);

    //console.log(`Before call: category ${category}, page ${page}, size ${size}, sortCol ${inSortCol}, sortOrd ${inSortOrd}`)
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/folder/cms_folder?include-total=true&page=1&items-per-page=100&sortby=name asc&filter=parent_folder_id eq '${inFolderId}'`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        //create taxonomy
        let fldRes = folderCheckChildren(curArray, inFolderId, res.data._embedded.collection);
        
        if (!fldRes) {
          
          for (let r=0; r<res.data._embedded.collection.length; r++) {
            curArray.push({id: res.data._embedded.collection[r].id, name: res.data._embedded.collection[r].name, children: []});
          }
        }
        
      } 
      setRootId('');
      removeActiveId(componentId);
    }, '', []);


    setTaxArray(curArray);
  }

  const folderCheckChildren = (inCurArray, inFolderId, inRows) => {
    //si daca nu il gaseste, cum se duce mai incolo???
    let found = false;
    for (let i=0; i<inCurArray.length; i++) {
      if (inCurArray[i].id === inFolderId) {
        //found
        let obj = {id: inCurArray[i].id, name: inCurArray[i].name, children: []};
        for (let r=0; r<inRows.length; r++) {
          obj.children.push({id: inRows[r].id, name: inRows[r].name, children: []});
        }
        inCurArray.splice(i, 1, obj);
        found=true;
        return true;
      } else {
        found=folderCheckChildren(inCurArray[i].children, inFolderId, inRows);
        if (found) return true;
      }
    }
    return found; //???
  }


  const handleRefreshTaxonomy = (inCategory, inType, componentId) => {
    
    addActiveId(componentId);
    setSelectedNode('');

    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/${inCategory}/${inType}?include-total=true&page=1&items-per-page=1000`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        
        let curArray = [];
        for (let i=0; i<res.data._embedded.collection.length; i++) {
          
          if (res.data._embedded.collection[i].properties && res.data._embedded.collection[i].properties[propName]) {
            
            
            const taxRows = res.data._embedded.collection[i].properties[propName];
            for (let t=0; t<taxRows.length; t++) {
              
              
              //here are the actual rows - now create the taxonomy
              const res = checkChildren(curArray, taxRows[t], 1);
              if (res.id) {
                curArray.push(res);
              }
            }
          }
        }
        setTaxArray(curArray);
        
      } else {
        setTaxArray([]);
      }
      

      removeActiveId(componentId);
    }, '', []);
  }


  const getFilterArray = (taxonomyArr, inNode) => {
    let outFilters = [`${propName} contains('${inNode}')`];

    for (let i=0; i<taxonomyArr.length; i++) {
      if (taxonomyArr[i].id===`/${inNode.split('/')[1]}`) {
        //this is the main node - moving in
        getAllFilters(taxonomyArr[i].children, inNode, outFilters);
      }
    }
    
    return outFilters;
  }

  const getAllFilters = (inArray, inNode, outFilters) => {
    for (let i=0; i<inArray.length; i++) {
      if (inArray[i].id!==inNode && inArray[i].id.search(inNode)===0) {
        //it is a new filter
        outFilters.push(`${propName} contains('${inArray[i].id}')`);

      }
      //does it have more children?
      if (inArray[i].children.length>0) {
        getAllFilters(inArray[i].children, inNode, outFilters);
      }
    }
    return;
  };

  const getTypes = () => {
    addActiveId('drpType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions?category=file&include-total=true&page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTypeList(res.data._embedded.collection);
        
      } 
      removeActiveId('drpType');

    }, '', []);
   

  };

  const getAttributes = () => {
    if (typeName==='cms_file') {
      setRepProps([]);
    };
    addActiveId('attVals');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions/${typeName}/attributes-all`,  
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        
        let repeatingProps = [];
        for (let i=0; i<res.data._embedded.collection.length; i++) {
          if (!res.data._embedded.collection[i].system && !res.data._embedded.collection[i].internal) {
              if (res.data._embedded.collection[i].repeating && res.data._embedded.collection[i].data_type==='string') {
              repeatingProps.push({name: res.data._embedded.collection[i].name, displayName: res.data._embedded.collection[i].display_name});
            }
          }
        }
        setRepProps(repeatingProps);
        removeActiveId('attVals');
        
      }

    }, '', []);
   

  };

  const selectFile = (event) => {
    
    //add code for multi selection
    let curSelectedFile = event.target.files[0];
    var reader = new FileReader();
        reader.onload = function() {
          try {
            let values = JSON.parse(reader.result);
            if (values.taxonomy) setFileJson(values);
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




  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      getTypes();
      // handleRefreshList(); - from selectNode

      
      fetch('./Taxonomy.md')
      .then(response => response.text())
      .then(text => {setMarkdownText(text); })

    },[]
    );

    useEffect(() => {
      if (typeName!=='') {
        getAttributes();
        handleRefreshList();
      }
    }, [typeName]);

    useEffect(() => {
      if (propName!=='' && taxType==='dynamic') {
        handleRefreshTaxonomy('file', typeName, 'refreshTaxonomy');

      }
    }, [propName]);

    useEffect(() => {
      setSelectedNode('');
      if (propName!=='' && taxType==='dynamic') {
        handleRefreshTaxonomy('file', typeName, 'refreshTaxonomy');

      } else {
        if (taxType==='folder') {
          getRootFolderId('rootLabel', '');
        }
        setTaxArray([]);
      }
      setRows([]);
      setRowCount(0);

    }, [taxType]);


    useEffect(() => {
      if (rootId) {
        handleReadFolderTaxonomy(rootId, 'refreshTaxonomy');
      }

    }, [rootId]);

    useEffect(() => {
      if (subscriptionRoot && selectedNode==='') {
        setFilterArray([`parent_folder_id eq '${subscriptionRoot}'`])
      }
      handleRefreshList();

    }, [subscriptionRoot]);
    

    useEffect(() => {
      let curHeadCells = [
       
        {
          id: 'name',
          sorting: true,
          type: 'string',
          disablePadding: false,
          label: 'Object name',
          repeating: false,
          showButtons: true,
          isJson: false,
          system: true
        },
        {
          id: 'type',
          sorting: false,
          type: 'string',
          disablePadding: false,
          label: 'Type',
          repeating: false,
          showButtons: false,
          isJson: false,
          system: true
        },
        
      ];
      for (let i=0; i<repProps.length; i++) {
        curHeadCells.push({
          id: repProps[i].name,
          sorting: false,
          type: 'string',
          disablePadding: false,
          label: repProps[i].displayName,
          showButtons: false,
          repeating: true,
          isJson: false,
          system: false
        })
      }
      //console.log(curHeadCells);
      setHeadCells(curHeadCells);


    }, [repProps]);



  useEffect(
    () => {
      //console.log(`useEffect with updatedList.`);
      if (updatedList) {
        if (typeName) {
          getList('file', typeName, curPage, rowsPerPage, sortCol, sortOrd, filterArray, true, 'contentsList'); 
        } else {
          setUpdatedList(false);
        }
        
      }
    },[updatedList]
    );

    useEffect(
      () => {
        setFilterArray([]);
        if (selectedNode) {
          if (taxType==='folder') {
            //read folders
            getRootFolderId('rootLabel', selectedNode);
            setFilterArray([`parent_folder_id eq '${selectedNode}'`]);
          } else {
            if (propName) {
              if (relative) {
                //create all filters here
                setFilterArray(getFilterArray(taxArray, selectedNode));
              } else {
                setFilterArray([`${propName} contains('${selectedNode}')`]);
              }
              
            }
          }
          
        } else {
          if (taxType==='folder') {
            if (subscriptionRoot) {
              setFilterArray([`parent_folder_id eq '${subscriptionRoot}'`]);
            } 
          } else {
            if (propName) {
              if (relative) {
                //return all
              } else {
                setFilterArray([`${propName} contains('\\')`]);
              }
            }
          }
        }
        if (taxType!=='folder' || subscriptionRoot) handleRefreshList();
      },[selectedNode]
      );


  return (
      <React.Fragment>
        <Box height={"80vh"} 
          key="box-panel" 
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
            {
              <Box 
              key="left-panel"
              sx={{width: 400,
              maxHeight: '80vh',
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
              
              <FormControl>
                <FormLabel id="tax-type">{'Taxonomy type'}</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="tax-type-group"
                  name="tax-type-group"
                  value={taxType}
                  onChange={(event) => { setTaxType(event.target.value); }}
                >
                  <FormControlLabel value="dynamic" control={<Radio />} label="Dynamic" />
                  <FormControlLabel value="static" control={<Radio />} label="Static" />
                  <FormControlLabel value="folder" control={<Radio />} label="Folder" />
                </RadioGroup>
              </FormControl>
                <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='drpType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <FormControl variant="standard" sx={{width: '100%'}}>
                      <Select
                      id="documentType"
                      value={typeName}
                      onChange={(event) => {setTypeName(event.target.value); }} 
                      
                    >
                      {typeList.map((item) => (
                        <MenuItem key={item.id} value={item.system_name}>{item.display_name}</MenuItem>
                      ))}
                      
                    </Select>
                  </FormControl>
                </Box>
                {taxType!=='folder' && <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='attVals'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin'}}>
                  <FormControl variant="standard" sx={{width: '100%'}}>
                      <Select
                      id="attributeName"
                      value={propName}
                      onChange={(event) => {setPropName(event.target.value); }} 

                    >
                      {repProps.map((item) => (
                        <MenuItem key={item.name} value={item.name}>{item.displayName}</MenuItem>
                      ))}
                      
                    </Select>
                  </FormControl>
                </Box>}
                
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  {taxType!=='folder' ? <FormControlLabel
                      control={
                        <Switch checked={relative===true} onChange={(e) => {setRelative(e.target.checked); }} name="relative"/>
                      }
                      label={relative ? "Relative" : "Absolute"}/> : <Box/>}
                  <Stack direction={'row'} spacing={1}>
                    <IconButton size="small" variant="outlined" color="warning" title={'Unselect'} onClick={() => { setSelectedNode('');  }}>
                      <BackspaceIcon />
                    </IconButton>
                    <Box sx={{
                          borderStyle: (activeId.split(',').find((obj) => {return obj==`refreshTaxonomy`}) && showBorder)?'solid':'none', 
                          borderColor: 'red',
                          borderWidth: 'thin'}}>
                      <IconButton size="small" variant="outlined" color="secondary" title={'Refresh taxonomy'} onClick={() => { if (taxType==='dynamic') { handleRefreshTaxonomy('file', typeName, 'refreshTaxonomy') };  if (taxType==='static') { setFileOpen(true);} if (taxType==='folder') { getRootFolderId('rootLabel', '');}  }}>
                        <AccountTreeIcon />
                      </IconButton>
                    </Box>
                    <IconButton size="small" variant="outlined" color="primary" title={'Help'} onClick={() => { setShowHelp(true);  }}>
                      <InfoIcon />
                    </IconButton>
                  </Stack>
                  
                </Stack>
                
                <TaxonomyNavigator 
                    taxonomyObject={taxArray}
                    dynamicLoad={false}
                    outSelectedRow={(rowId) => {setSelectedNode(rowId)}} 
                    inSelected={selectedNode} 
                    taxType={taxType} 
                    rootId={rootId}
                  />
                <Typography variant="button" display="block">{`Selected node: ${(taxType==='folder' && selectedNode==='') ? 'subscription-root' : selectedNode}`}</Typography>
              </Stack>
              
              
                
                
              </Box>}
            {<TableContainer component={Paper} sx={{
                    maxHeight: "80vh",
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
                  <TableRow sx={{backgroundColor:'#e1e1e1'}}>
                    {headCells.map((headCell) => {
                      
                        return (
                        <TableCell 
                          sx={{fontWeight:'bold', backgroundColor:'#e1e1e1'}}
                          key={headCell.id}
                          align={headCell.type==='number' ? 'right' : 'left'}
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
                      )
                  }
                    
                    )}
                    <TableCell align="left" sx={{fontWeight:'bold', backgroundColor:'#e1e1e1', maxWidth: 30}}>
                      <Stack direction={'row'} sx={{
                        borderStyle: (activeId.split(',').find((obj) => {return obj=='divResults'}) && showBorder)?'solid':'none', 
                        borderColor: 'red',
                        borderWidth: 'thin',
                        }}>
                          
                          <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                              <RefreshIcon />
                          </IconButton>
                          
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                {<TableBody>
                  {rows.length>0 && rows.map((row) => (
                    <TableRow key={row.id} hover selected={selectedRow.id==row.id}>
                      {headCells.map((headCell, pIndex) => (
                        <TableCell 
                          key={pIndex + row.id}
                          align={(headCell.type==='numeric') ? 'right' : 'left'} 
                          onClick={() => {handleSelectRow(row, false)}} 
                          onMouseEnter={(e) => {if (headCell.showButtons===true) showButton(e, row)}}
                          onMouseLeave={(e) => {if (headCell.showButtons===true) hideButton(e, row)}} 
                          sx={{position: (headCell.showButtons===true ? 'relative' : 'inherit'), whiteSpace: 'pre-line', maxWidth: (headCell.showButtons===true ? '30vw' : 'auto')}}
                          >

                            
                              {getDisplayValue(headCell, row)}
                              
                            {(display===row.id) && (headCell.showButtons===true) && <Butt 
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

                      <TableCell align="left" sx={{maxWidth:30}} onClick={() => {handleSelectRow(row, true)}}>
                        
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>}
                <CustomTablePagination
                  page={curPage} 
                  rowsPerPage={rowsPerPage} 
                  count={rowCount}
                  colSpan={8} 
                  onPaginationChange={handleChangePage}
                />
              </Table>
            </TableContainer>}
          </Stack>
                  
        </Box>
        <Dialog
          open={showHelp}
          onClose={() => {setShowHelp(false)}} 
          aria-labelledby="help-taxonomy"
          aria-describedby="help-taxonomy"
          maxWidth={'xl'} 
          fullWidth
        >
          
          <DialogContent sx={{
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
            <ReactMarkdown children={markdownText} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {setShowHelp(false)}}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={fileOpen} onClose={() => {setFileOpen(false);}}>
          <DialogTitle>Load taxonomy</DialogTitle>
          <DialogContent className="add-document">
              
            <div className="inline"> 
                <label htmlFor="files">
                <Button component="span">Select taxonomy json file...</Button>
                </label>
                <input id="files" type="file" accept="*.json" className="file-input" onChange={selectFile} multiple={false} />
            </div>
            {fileJson.taxonomy && <div><pre>{JSON.stringify(fileJson,null,2)}</pre></div>}
              
          </DialogContent>
          <DialogActions>
              <Button onClick={() => { handleReadFileTaxonomy(fileJson.taxonomy); setFileOpen(false); }} variant="contained" color="primary" disabled={!fileJson.taxonomy}>
                  Load
              </Button>
              <Button onClick={() => { setFileOpen(false); }} variant="contained" color="primary">
                  Cancel
              </Button>
          </DialogActions>
      </Dialog>
      
            
        </React.Fragment>
  );
}
