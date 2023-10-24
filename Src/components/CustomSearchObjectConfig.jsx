import * as React from 'react';
import { useState } from "react";

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import PropTypes from 'prop-types';

// MUI components
import { 
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  TextField,
  Select,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';


import DataObjectIcon from '@mui/icons-material/DataObject';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CustomSearchColumn from './CustomSearchColumn';
import CustomSearchFilter from './CustomSearchFilter';
import CustomFacetQuery from './CustomFacetQuery';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PageviewIcon from '@mui/icons-material/Pageview';
import SelectFolderDialog from './SelectFolderDialog';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      sx={{width: 1}}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </Box>
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




export default function CustomSearchObjectConfig(props) {
  const { runRequest, token, showBorder, inObj, setSearchObj } = props;

  //searchConfig: category, type, latest, filterArray, headCells, facetFields
  //headCell: id, sorting, type, repeating, disablePadding, label, system, trait, traitInstance, search_name
  //facetField: id, sorting, type, repeating, disablePadding, label, system, trait, traitInstance, search_name
  //queryArray: queryStr, queryName, isTrait, attributeName, isSystem, selTrait, value (ex.: {!key=CREATED_TODAY}cms_any.create_time_dt:[NOW-1DAY TO NOW])
  //filterArray: fiterStr, filterFtStr, isTrait, attributeName, isSystem, selTrait, operator, value, traitName 

  const [activeId, setActiveId] = useState('');
  const [selectedRow, setSelectedRow] = useState({});

  const [curColumn, setCurColumn] = useState({});
  const [curFilter, setCurFilter] = useState({});
  const [curQuery, setCurQuery] = useState({});
  const [curIndex, setCurIndex] = useState(-1);

  const [folderSearchOpen, setFolderSearchOpen] = useState(false);

  const [typeList, setTypeList] = React.useState([]);

  const [value, setValue] = React.useState(0);

  const [isEdit, setIsEdit] = useState(false);


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
    setSelectedRow({});
  };

  const isActiveId = (item) => {
    return activeId.split(',').find((obj) => {return obj==item});
  }

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }
  
  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id==row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id==row.id)?{}:row);
    }
    
  }

  const handleAddValue = (type, value) => {
    //type can be either headCell, facetField or filterArray 
    let updatedValue = {};
    if (inObj[type]) {
      let arrProperty = [...inObj[type], value];
      
      updatedValue = {[type]: arrProperty};
      
    } else {
      //create the new value
      updatedValue = {[type]: [value]};
    }
    setSearchObj(inObj => ({
      ...inObj,
      ...updatedValue
    }));
    
  }

  const handleRemoveValue = (type, index) => {
    //type can be either headCell, facetField or filterArray
    let arrProperty = [...inObj[type]];
    arrProperty.splice(index, 1);
    let updatedValue = {};
    updatedValue = {[type]: arrProperty};
    setSearchObj(inObj => ({
      ...inObj,
      ...updatedValue
    }));
  }

  const handleUpValue = (type, index) => {
    if (index>0) {
      let arrProperty = [...inObj[type]];
      let value = arrProperty[index];
      arrProperty.splice(index-1,0, value)
      arrProperty.splice(index+1, 1);

      let updatedValue = {};
      updatedValue = {[type]: arrProperty};
      setSearchObj(inObj => ({
        ...inObj,
        ...updatedValue
      }));
    }
  }

  const handleDownValue = (type, index) => {
    let arrProperty = [...inObj[type]];
        
    if (index<arrProperty.length) {
      
      let value = arrProperty[index];
      arrProperty.splice(index, 1);
      arrProperty.splice(index+1,0, value);

      let updatedValue = {};
      updatedValue = {[type]: arrProperty};
      setSearchObj(inObj => ({
        ...inObj,
        ...updatedValue
      }));
    }
  }

  const handleChangeValue = (type, index, value) => {
    let arrProperty = [...inObj[type]];
    arrProperty.splice(index, 1, value);

    let updatedValue = {};
    updatedValue = {[type]: arrProperty};
    setSearchObj(inObj => ({
      ...inObj,
      ...updatedValue
    }));

  }

  const handleChangeGeneral = (name, value) => {
    let updatedValue = {};
    if (name==='type') {
      updatedValue = {[name]: value, headCells: [], filterArray: [], facetFields: [], queryArray: []}; //also reset columns and filters
    } else {
      updatedValue = {[name]: value}; 
    }
    
    setSearchObj(inObj => ({
      ...inObj,
      ...updatedValue
    }));
  }

  const getTypes = (inCategory) => {
    addActiveId('drpType');

    let req = { 
      method: 'get',
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/type-definitions?category=${inCategory}&include-total=true&page=1&items-per-page=100`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      
      if (res.data && res.data._embedded) {
        setTypeList(res.data._embedded.collection);
        
      } 
      removeActiveId('drpType');

    }, '', []);
   

  };

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log(`useEffect with none.`);
        
    },[]
    );

  useEffect(
    () => {
        if (inObj.category!='') {
          getTypes(inObj.category);
        }
        
    },[inObj.category]
    );

  return (
      <React.Fragment>
        <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="properties tabs"
              sx={{ borderRight: 1, borderColor: 'divider', minWidth: 150 }}
            >
              <Tab icon={<SettingsSystemDaydreamIcon/>} label="Configuration" {...a11yProps(0)} disabled={isEdit}/>
              <Tab icon={<DataObjectIcon/>} label="Columns" {...a11yProps(1)} disabled={isEdit}/>
              <Tab icon={<EditAttributesIcon/>} label="Filters" {...a11yProps(2)} disabled={isEdit}/>
              {inObj.facetSearch && <Tab icon={<ManageSearchIcon/>} label="Facet fields" {...a11yProps(3)} disabled={isEdit}/>}
              {inObj.facetSearch && <Tab icon={<ManageSearchIcon/>} label="Facet queries" {...a11yProps(4)} disabled={isEdit}/>}
            </Tabs>
            <TabPanel value={value} index={0}>
              <Stack direction="column" spacing={2}>
                <FormControlLabel
                    control={
                      <Switch checked={inObj.ftSearch===true} onChange={(e) => {handleChangeGeneral('ftSearch', e.target.checked); }} name="ftSearch"/>
                    }
                    label="Full text search"/>
                {inObj.ftSearch===true && <TextField
                  
                  margin="dense"
                  id="full-text-search"
                  label="Full text search term"
                  type="search"
                  fullWidth
                  variant="standard" 
                  value={inObj.fullText}
                  onChange={e => {handleChangeGeneral('fullText', e.target.value)}}
                />}
                {inObj.ftSearch===true && <TextField
                  
                  margin="dense"
                  id="alltraits-text-search"
                  label="All traits search term"
                  type="search"
                  fullWidth
                  variant="standard" 
                  value={inObj.allTraits}
                  onChange={e => {handleChangeGeneral('allTraits', e.target.value)}}
                />}
                    
                <Box>
                  <FormControl sx={{ m: 1, width: 1 }} size="small">
                  <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      label="Category"
                      id="category-simple-select"
                      value={inObj.category} 
                      onChange={(event) => {handleChangeGeneral('category', event.target.value); }}
                    >
                      <MenuItem value={''}>{''}</MenuItem>
                      <MenuItem value={'object'}>{'Object'}</MenuItem>
                      <MenuItem value={'file'}>{'File'}</MenuItem>
                      <MenuItem value={'folder'}>{'Folder'}</MenuItem>
                      <MenuItem value={'relation'}>{'Relation'}</MenuItem>
                      <MenuItem value={'any'}>{'Any'}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{
                  borderStyle: (activeId.split(',').find((obj) => {return obj=='drpType'}) && showBorder)?'solid':'none', 
                  borderColor: 'red',
                  borderWidth: 'thin',
                  width: 1}}>
                  <FormControl sx={{ m: 1, width: 1 }} size="small">
                    <InputLabel id="type-label">Type</InputLabel>
                      <Select
                      labelId="type-label"
                      label="Type"
                      id="searchType"
                      value={inObj.type}
                      onChange={(event) => {handleChangeGeneral('type', event.target.value)}} 
                    >
                      {typeList.map((item) => (
                        <MenuItem key={item.id} value={item.system_name}>{`${item.display_name} (${item.system_name})`}</MenuItem>
                      ))}
                      
                    </Select>
                  </FormControl>
                </Box>
                <Stack direction={'row'} spacing={1}>
                  <TextField
                    
                    margin="dense"
                    id="folderid"
                    label="In folder"
                    type="folder"
                    fullWidth
                    variant="standard" 
                    value={inObj.folderId ?? ''}
                    onChange={e => {handleChangeGeneral('folderId', e.target.value)}}
                  />
                  <Box>
                    <IconButton size="small" variant="outlined" color="default" title="Search" onClick={() => { setFolderSearchOpen(true) }}>
                        <PageviewIcon />
                    </IconButton>
                  </Box>
                  
                </Stack>
                
                {inObj.ftSearch && <FormControlLabel
                    control={
                      <Switch checked={inObj.typeStrict===true} onChange={(e) => {handleChangeGeneral('typeStrict', e.target.checked); }} name="typeStrict"/>
                    }
                    label="Return only this type (no subtypes will be returned)"/>}
                {inObj.ftSearch && <FormControlLabel
                    control={
                      <Switch checked={inObj.facetSearch===true} onChange={(e) => {handleChangeGeneral('facetSearch', e.target.checked); }} name="facetSearch"/>
                    }
                    label="Faceted search"/>}
                <FormControlLabel
                    control={
                      <Switch checked={inObj.latest===true} onChange={(e) => {handleChangeGeneral('latest', e.target.checked); }} name="latest"/>
                    }
                    label="Show latest version"/>

              {inObj.ftSearch && <Box sx={{fontStyle:'italic'}}>
                <Typography sx={{fontSize:'12px', whiteSpace: 'pre-line'}}>
                {'Wildcard: ? matches one element, * matches 0 or more\nFuzzy Search: use single term and add ~ at the end and optional the max number of edits allowed. Deafult 2.\n Ex. roam~ will return roams, foam, foams\nEx2. roam~1 will return roams, foam but not foams since it has 2 edits.\nProximity search: looks for terms in specific distance of one another.\nEx. "jakarta apache"~10 will return texts with apache and jakarta within 10 words of each other.'}
              </Typography></Box>}
              </Stack>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <FormControlLabel
                    control={
                      <Switch checked={inObj.compactActions===true} onChange={(e) => {handleChangeGeneral('compactActions', e.target.checked); }} name="compactActions" disabled={isEdit}/>
                    }
                    label="Show simple actions"/>
              {!isEdit && <Box>
                  {<TableContainer component={Paper}>
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            ID
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Type
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Label
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Repeating
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Sorting
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            System
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Trait
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            TraitInstance
                          </TableCell>
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="success" title="Add new column" onClick={() => { setCurColumn({id: '', sorting: false, type: '', repeating: false, disablePadding: false, label: '', system: false, trait: '', traitInstance: '', search_name: ''}); setCurIndex(-1); setIsEdit(true); }}>
                              <AddBoxIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {inObj.headCells.map((row, index) => (
                          <TableRow key={row.id + index} hover selected={selectedRow.id==row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.id}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.type}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.label}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.repeating===true?'True':'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.sorting===true?'True':'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.system===true?'True':'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.trait}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.traitInstance}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                <Box>
                                    <IconButton size="small" variant="outlined" color="default" title="Move up" onClick={() => { handleUpValue('headCells', index) }}>
                                        <KeyboardArrowUpIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <IconButton size="small" variant="outlined" color="default" title="Move down" onClick={() => { handleDownValue('headCells', index) }}>
                                        <KeyboardArrowDownIcon />
                                    </IconButton>
                                </Box>
                                <IconButton size="small" variant="outlined" color="warning" title="Edit column" onClick={() => { setCurColumn(row); setCurIndex(index); setIsEdit(true); }}>
                                  <BorderColorIcon />
                                </IconButton>
                                <Box sx={{
                                  borderStyle: (activeId.split(',').find((obj) => {return obj=='delBut' + row.name}) && showBorder)?'solid':'none', 
                                  borderColor: 'red',
                                  borderWidth: 'thin'
                                  }}>
                                  <IconButton size="small" variant="outlined" color="error" title="Delete column" onClick={() => { handleRemoveValue('headCells', index) }}>
                                    <DeleteForeverIcon />
                                  </IconButton>
                                </Box>
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>}
                {isEdit && 
                  <CustomSearchColumn
                    runRequest = {runRequest} 
                    token = {token} 
                    showBorder={showBorder} 
                    inObj={curColumn} 
                    isEdit={isEdit} 
                    setColumn={(colObj) => {setCurColumn(colObj);}} 
                    inType={inObj.type}
                    onAction={(result) => {if (result===true) {if (curIndex==-1) {handleAddValue('headCells', curColumn)} else  {handleChangeValue('headCells', curIndex, curColumn)}} else {setCurColumn({}); setCurIndex(-1)}; setIsEdit(false);}}
                    onlySearchable={false}
                  />
                }
            </TabPanel>
            <TabPanel value={value} index={2}>
              {!isEdit && <Box>
                  {<TableContainer component={Paper}>
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Filter definition
                          </TableCell>
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="success" title="Add new filter" onClick={() => { setCurFilter({}); setCurIndex(-1); setIsEdit(true); }}>
                              <AddBoxIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {inObj.filterArray.map((row, index) => (
                          <TableRow key={'filterArr' + index} hover>
                            <TableCell align="left" >{inObj.ftSearch ? row.filterFtStr : row.filterStr}</TableCell>
                            <TableCell align="left" >
                              <Stack direction="row" spacing={0}>
                                <IconButton size="small" variant="outlined" color="success" title="Clone filter" onClick={() => { setCurFilter(row); setCurIndex(-1); setIsEdit(true); }}>
                                  <LibraryAddIcon />
                                </IconButton>
                                <IconButton size="small" variant="outlined" color="warning" title="Edit filter" onClick={() => { setCurFilter(row); setCurIndex(index); setIsEdit(true); }}>
                                  <BorderColorIcon />
                                </IconButton>
                                <Box sx={{
                                  borderStyle: (activeId.split(',').find((obj) => {return obj=='delBut' + row.name}) && showBorder)?'solid':'none', 
                                  borderColor: 'red',
                                  borderWidth: 'thin'
                                  }}>
                                  <IconButton size="small" variant="outlined" color="error" title="Delete filter" onClick={() => { handleRemoveValue('filterArray', index) }}>
                                    <DeleteForeverIcon />
                                  </IconButton>
                                </Box>
                                
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>}
                {isEdit && 
                  <CustomSearchFilter
                    runRequest = {runRequest} 
                    token = {token} 
                    showBorder={showBorder} 
                    isEdit={isEdit} 
                    inFilter={curFilter}
                    setFilter={(filterObj) => {if (curIndex==-1) {handleAddValue('filterArray', filterObj)} else {handleChangeValue('filterArray', curIndex, filterObj)}}} 
                    inType={inObj.type} 
                    isFtQuery={inObj.ftSearch}
                    onAction={(result) => {setIsEdit(false); setCurFilter({}); setCurIndex(-1)}}
                  />
                }

            </TabPanel>

            <TabPanel value={value} index={3}>
              {!isEdit && <Box>
                  {<TableContainer component={Paper}>
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Search Name
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Type
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Label
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Repeating
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Sorting
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Trait
                          </TableCell>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            TraitInstance
                          </TableCell>
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="success" title="Add new column facet" onClick={() => { setCurColumn({id: '', sorting: false, type: '', repeating: false, disablePadding: false, label: '', system: false, trait: '', traitInstance: '', search_name: ''}); setCurIndex(-1); setIsEdit(true); }}>
                              <AddBoxIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {inObj.facetFields?.map((row, index) => (
                          <TableRow key={row.id + index} hover selected={selectedRow.id==row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.search_name.replace(/<instance>/g, row.traitInstance)}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.type}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.label}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.repeating===true?'True':'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.sorting===true?'True':'False'}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.trait}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.traitInstance}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                <Box>
                                    <IconButton size="small" variant="outlined" color="default" title="Move up" onClick={() => { handleUpValue('facetFields', index) }}>
                                        <KeyboardArrowUpIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <IconButton size="small" variant="outlined" color="default" title="Move down" onClick={() => { handleDownValue('facetFields', index) }}>
                                        <KeyboardArrowDownIcon />
                                    </IconButton>
                                </Box>
                                <IconButton size="small" variant="outlined" color="warning" title="Edit column" onClick={() => { setCurColumn(row); setCurIndex(index); setIsEdit(true); }}>
                                  <BorderColorIcon />
                                </IconButton>
                                <Box sx={{
                                  borderStyle: (activeId.split(',').find((obj) => {return obj=='delBut' + row.name}) && showBorder)?'solid':'none', 
                                  borderColor: 'red',
                                  borderWidth: 'thin'
                                  }}>
                                  <IconButton size="small" variant="outlined" color="error" title="Delete column" onClick={() => { handleRemoveValue('facetFields', index) }}>
                                    <DeleteForeverIcon />
                                  </IconButton>
                                </Box>
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>}
                {isEdit && 
                  <CustomSearchColumn
                    runRequest = {runRequest} 
                    token = {token} 
                    showBorder={showBorder} 
                    inObj={curColumn} 
                    isEdit={isEdit} 
                    setColumn={(colObj) => {setCurColumn(colObj);}} 
                    inType={inObj.type}
                    onAction={(result) => {if (result===true) {if (curIndex==-1) {handleAddValue('facetFields', curColumn)} else  {handleChangeValue('facetFields', curIndex, curColumn)}} else {setCurColumn({}); setCurIndex(-1)}; setIsEdit(false);}}
                    onlySearchable={true}
                  />
                }
            </TabPanel>

            <TabPanel value={value} index={4}>
              {!isEdit && <Box>
                  {<TableContainer component={Paper}>
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            Facet Queries definition
                          </TableCell>
                          <TableCell align="left" sx={{backgroundColor: '#e1e1e1', fontWeight: 'bold'}}>
                            <IconButton size="small" variant="outlined" color="success" title="Add new query" onClick={() => { setCurQuery({}); setCurIndex(-1); setIsEdit(true); }}>
                              <AddBoxIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {inObj.queryArray?.map((row, index) => (
                          <TableRow key={'queryApp' + index} hover>
                            <TableCell align="left" >
                              {row.queryStr}
                              {(inObj.queryArray.find((obj, curIndex) => {return (obj.key===row.key && curIndex!==index)})) && 
                                <Tooltip title={`Duplicate key`} followCursor>
                                  <PriorityHighIcon size="small" color="warning"/>
                                </Tooltip>
                                }
                                </TableCell>
                            <TableCell align="left" >
                              <Stack direction="row" spacing={0}>
                                
                                <IconButton size="small" variant="outlined" color="success" title="Clone query" onClick={() => { setCurQuery(row); setCurIndex(-1); setIsEdit(true); }}>
                                  <LibraryAddIcon />
                                </IconButton>
                                <IconButton size="small" variant="outlined" color="warning" title="Edit query" onClick={() => { setCurQuery(row); setCurIndex(index); setIsEdit(true); }}>
                                  <BorderColorIcon />
                                </IconButton>
                                <Box sx={{
                                  borderStyle: (activeId.split(',').find((obj) => {return obj=='delBut' + row.name}) && showBorder)?'solid':'none', 
                                  borderColor: 'red',
                                  borderWidth: 'thin'
                                  }}>
                                  <IconButton size="small" variant="outlined" color="error" title="Delete query" onClick={() => { handleRemoveValue('queryArray', index) }}>
                                    <DeleteForeverIcon />
                                  </IconButton>
                                </Box>
                                
                                
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>}
                {isEdit && 
                  <CustomFacetQuery
                    runRequest = {runRequest} 
                    token = {token} 
                    showBorder={showBorder} 
                    isEdit={isEdit} 
                    inQuery={curQuery}
                    setQuery={(queryObj) => {if (curIndex==-1) {handleAddValue('queryArray', queryObj)} else {handleChangeValue('queryArray', curIndex, queryObj)}}} 
                    inType={inObj.type} 
                    onAction={(result) => {setIsEdit(false); setCurQuery({}); setCurIndex(-1)}}
                  />
                }

            </TabPanel>
          </Box>
          <SelectFolderDialog 
            runRequest={runRequest} 
            selectOpen={folderSearchOpen}
            onSelectSuccess={() => setFolderSearchOpen(false)}
            token={token} 
            showBorder={showBorder} 
            setOutFolderId={(id) => {handleChangeGeneral('folderId', id)}} 
            inFolder={inObj.folderId ?? ''}
          />
            
        </React.Fragment>
  );
}
