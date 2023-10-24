import * as React from 'react';

// MUI components
import {
  Box,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  TextField,
  Stack
} from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

  


  export default function CustomTraitFilter(props) {
    const {  onFilterChange, onFilterClose, namespaces } = props;
    const [selectedNameOp, setSelectedNameOp] = React.useState('');
    const [nameFilter, setNameFilter] = React.useState('');

    const [selectedNamespace, setSelectedNamespace] = React.useState('');

    const handleSelectNameOpChange = (event) => {
      setSelectedNameOp(event.target.value);
    };

    const handleCreateFilter = (inNameOp, inNameFilter, inNamespace) => {
      let strFilter = '';
      if (inNameOp!='') {
        strFilter = `system_name ${inNameOp} '${inNameFilter.replace(/%/g,'%25')}'`
      }
      onFilterChange(strFilter, inNamespace);
    }

      return (
        <React.Fragment>
          <Stack direction="row">
            <Stack
              direction="column" 
              spacing={2} 
              alignItems="left" 
              key="name-filter-stack" 
              sx={{ bgcolor: 'background.paper', 
                boxShadow: 1,
                borderRadius: 2,
                p: 2,}}
              >
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                key="name-filter-stack"
                >
                <InputLabel id="filter-name-label">System name</InputLabel>
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
              

                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                  <InputLabel id="namespace-label">Namespace</InputLabel>
                  <Select
                    labelId="namespace-label"
                    label="Namespace"
                    id="namespace-simple-select"
                    value={selectedNamespace}
                    onChange={(event) => {setSelectedNamespace(event.target.value); handleCreateFilter(selectedNameOp, nameFilter, event.target.value)}}
                  >
                    <MenuItem key="_blank_" value={''}>{''}</MenuItem>
                    {namespaces.map((row) => (<MenuItem key={row.name} value={row.name}>{row.display_name + ' (' + row.prefix + ')'}</MenuItem>))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
            <Stack 
                direction="row-reverse" 
                spacing={2} 
                alignItems="right" 
                key="button-filter-stack" 
                >
                <Box>
                  <IconButton size="small" variant="outlined" color="success" title="Filter documents" onClick={() => { handleCreateFilter(selectedNameOp, nameFilter, selectedNamespace) }}>
                    <FilterAltIcon />
                  </IconButton> 
                </Box>
                <Box>
                  <IconButton size="small" variant="outlined" color="primary" title="Filter" onClick={() => { onFilterChange(''); onFilterClose() }}>
                    <FilterAltOffIcon />
                  </IconButton>
                </Box>
            </Stack>
            
              
          </Stack>
          <br/>
        </React.Fragment>
      );
  }