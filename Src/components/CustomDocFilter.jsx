import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import {
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  Switch,
  FormControlLabel,
  Select,
  TextField,
  Stack
} from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

  


  export default function CustomDocFilter(props) {
    const {  onFilterChange, onFilterClose, inCategory } = props;
    const [selectedNameOp, setSelectedNameOp] = React.useState('');
    const [nameFilter, setNameFilter] = React.useState('');

    const [selectedCategory, setSelectedCategory] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('');
    const [latestVersion, setLatestVersion] = React.useState(true);

    const handleSelectNameOpChange = (event) => {
      setSelectedNameOp(event.target.value);
    };

    const handleCreateFilter = (inLatestVersion, inCategory, inType) => {
      let strFilter = '';
      if (selectedNameOp!='') {
        strFilter += `name ${selectedNameOp} '${nameFilter.replace(/%/g,'%25')}'`
      }
      onFilterChange(strFilter, inCategory, inType, inLatestVersion);
    }

    

      return (
        <React.Fragment>
          
            <Stack 
              direction="row" 
              justifyContent={"space-between"} 
              alignItems={"center"} 
              key="name-filter-stack" 
              sx={{ bgcolor: 'background.paper', 
                boxShadow: 1,
                borderRadius: 2,
                p: 2,}}>
              
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center" 
              key="name-filter-stack"
              >
              <InputLabel id="filter-name-label">Object name</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 40 }} size="small">
                <Select
                  labelId="model-select-label"
                  id="model-simple-select"
                  value={selectedNameOp}
                  onChange={handleSelectNameOpChange}
                >
                  <MenuItem value={''}>{''}</MenuItem>
                  <MenuItem value={'like'}>{'like (use %)'}</MenuItem>
                  <MenuItem value={'eq'}>{'=='}</MenuItem>
                  <MenuItem value={'ne'}>{'!='}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                  margin="dense"
                  id="nameFilter" 
                  key="nameFilter"
                  variant="standard" 
                  size="small" 
                  label="" 
                  value={nameFilter} 
                  onChange={e => {setNameFilter(e.target.value)}}
                  />
              {!inCategory && <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    label="Category"
                    id="category-simple-select"
                    value={selectedCategory}
                    onChange={(event) => {setSelectedCategory(event.target.value); handleCreateFilter(latestVersion, event.target.value, selectedType)}}
                  >
                    <MenuItem value={''}>{''}</MenuItem>
                    <MenuItem value={'object'}>{'Object'}</MenuItem>
                    <MenuItem value={'file'}>{'File'}</MenuItem>
                    <MenuItem value={'folder'}>{'Folder'}</MenuItem>
                    <MenuItem value={'relation'}>{'Relation'}</MenuItem>
                    <MenuItem value={'any'}>{'Any'}</MenuItem>
                  </Select>
                </FormControl>}
                {!inCategory && <TextField
                  margin="dense"
                  id="typeBegins" 
                  key="typeBegins"
                  variant="standard" 
                  size="small" 
                  label="Type" 
                  value={selectedType} 
                  onChange={e => {setSelectedType(e.target.value)}}
                  />}
                  <FormControlLabel
                    control={
                      <Switch checked={latestVersion===true} onChange={(e) => {setLatestVersion(e.target.checked); handleCreateFilter(e.target.checked, selectedCategory, selectedType)}} name="latest"/>
                    }
                    label="Show latest version"/>
            </Stack>    
            
              <Stack 
                direction="row-reverse" 
                spacing={2} 
                alignItems="right" 
                key="button-filter-stack" 
                >
                <IconButton size="small" variant="outlined" color="success" title="Filter documents" onClick={() => { handleCreateFilter(latestVersion, selectedCategory, selectedType); }}>
                  <FilterAltIcon />
                </IconButton> 
                <IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { onFilterChange('','','',true); onFilterClose() }}>
                  <FilterAltOffIcon />
                </IconButton>
              </Stack>
              
            </Stack>
            
            <br/>
          </React.Fragment>
      );
  }