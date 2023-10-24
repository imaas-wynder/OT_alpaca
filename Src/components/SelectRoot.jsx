import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  FormControlLabel ,
  Stack  
} from '@mui/material';

export default function SelectRoot(props) {
  const { runRequest, selectRootOpen, setSelectRootOpen, setOutRoot, inRoot, token, showBorder } = props;
  

  const [activeId, setActiveId] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [rootFolder, setRootFolder] = React.useState('');

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
  
  const handleClose = () => {
    setSelectRootOpen(false);
  };

  const handleRadioChange = (event) => {
    switch (event.target.value) {
      case 'subscription-root':
        setRootFolder('subscription-root')
        break;
      case 'tenant-root':
        setRootFolder('tenant-root')
        break;
      default:
        setRootFolder('');
        break;
    }
  }


  const handleGetRoots = () => {
    addActiveId('getRoots');
    let req = { 
      method: 'get', 
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/instances/folder/cms_folder?include-total=true&items-per-page=100&filter=parent_folder_id is null`, 
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
    };
    runRequest(req, (res) => {
      if (res.data && res.data._embedded && res.data._embedded.collection) {
        setRows(res.data._embedded.collection);
      }
      removeActiveId('getRoots');
    }, '', []);
  };

  useEffect(() => {
    setRootFolder(inRoot);
  }, [inRoot]);
 
  useEffect(() => {
    if (rootFolder!=='subscription-root' && rootFolder!=='tenant-root') {
      handleGetRoots();
    }
  }, [rootFolder]);



  return (
    
      <Dialog open={selectRootOpen} onClose={handleClose}>
        <DialogTitle>Select root</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select root folder.
          </DialogContentText>
          <Stack direction={'column'} spacing={1}>
            <FormControl>
              <FormLabel id="root-type">Root</FormLabel>
              <RadioGroup
                row
                aria-labelledby="root-type-group"
                name="root-type-group"
                value={(rootFolder!=='subscription-root' && rootFolder!=='tenant-root')?'other':rootFolder}
                onChange={handleRadioChange}
              >
                <FormControlLabel value="subscription-root" control={<Radio />} label="subscription-root" />
                <FormControlLabel value="tenant-root" control={<Radio />} label="tenant-root" />
                <FormControlLabel value="other" control={<Radio />} label="other (select)" />
              </RadioGroup>
            </FormControl>
            <Box sx={{
                borderStyle: (activeId.split(',').find((obj) => {return obj=='getRoots'}) && showBorder)?'solid':'none', 
                borderColor: 'red',
                borderWidth: 'thin'}}>
                <FormControl variant="standard" sx={{minWidth: 300}}>
                    <Select
                    id="rootCustom"
                    value={rootFolder}
                    onChange={(event) => {setRootFolder(event.target.value);}} 
                  >
                    {rows.map((item) => {
                      return <MenuItem key={item.id} value={item.id}>{`${item.name} (${item.id})`}</MenuItem>
                      })
                    }
                  </Select>
                </FormControl>
              </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={rootFolder===''} onClick={() => {setOutRoot(rootFolder); handleClose();}}>Select</Button>
        </DialogActions>
      </Dialog>
  );
}
