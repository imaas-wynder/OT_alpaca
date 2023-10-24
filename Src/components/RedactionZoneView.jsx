import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { 
    TextField,
    FormControl,
    FormGroup,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    IconButton,
    Stack,
    Box,
    Typography
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const textFields = [
  {name: 'comment', label: 'Comment', isNumeric: false},
  {name: 'hyperlink', label: 'Hyperlink', isNumeric: false},
  {name: 'lognote', label: 'Log note', isNumeric: false},
  {name: 'left', label: 'Left', isNumeric: true},
  {name: 'top', label: 'Top', isNumeric: true},
  {name: 'right', label: 'Right', isNumeric: true},
  {name: 'bottom', label: 'Bottom', isNumeric: true},
  {name: 'pages', label: 'Pages', isNumeric: false}
]

/**
 * Transform from capture (resolution (res) 300 DPI)
 * Capture sends back: x, y, width (w), height (h)
 * Screen resolution (scr): 96
 * Initial correction: width + 2, height + 2
 * We need the image height (imgh = image height / res * scr)
 * Output:
 * left = x * res / scr
 * top = (imgh - y) * res / scr
 * right = (x + w) * res /scr
 * bottom = (imgh - y - h) * res / scr
 */

export default function RedactionZoneView(props) {
  const { inputScript, outScript } = props;

  /**
   * [
      {
        comment: 'Redact zone', 
        hyperlink: 'developer.opentext.com', 
        lognote: '', 
        left: '258', 
        top: '2043', 
        right: '879', 
        bottom: '1974', 
        pages: '0,1,2-4', 
        isNDC: 'false'
      }
    ]
   */


    const handleVarChange = (index, inName, inValue) => {
        let data = [...inputScript];
        data[index][inName] = inValue;
        
        
        
        outScript(data);
    }


    const addScript = () => {
        let newfield = {
          comment: '', 
          hyperlink: 'developer.opentext.com', 
          lognote: '', 
          left: 0, 
          top: 0, 
          right: 0, 
          bottom: 0, 
          pages: '', 
          isNDC: false
        }
    
        outScript([...inputScript, newfield])
    }

    const removeScript = (index) => {
        let data = [...inputScript];
        data.splice(index, 1);
        outScript(data);
    }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log("useEffect() - occurs ONCE, AFTER the initial render (unless react.strict mode) - variables view");
        
    },[]
    );

  

  return (
    <React.Fragment>
        {inputScript?.map((input, index) => {
          return (
            <Stack key={'script_view' + index} direction={'row'} alignItems={'center'} justifyContent={'space-between'} sx={{p:0.5, borderBottom: 1, borderColor: 'darkblue'}}>
              <Stack direction="row" spacing={2} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeScript(index) }}>
                    <RemoveIcon />
                </IconButton>
                {textFields.map((txt) => {
                    if (!txt.isNumeric) return (
                    <TextField
                      margin="dense"
                      id={txt.name} 
                      key={txt.name} 
                      variant="standard"
                      type={txt.isNumeric ? 'number' : 'text'} 
                      sx={{width: txt.isNumeric ? 50 : 200}} 
                      label={txt.label} 
                      value={input[txt.name]} 
                      onChange={e => {handleVarChange(index, txt.name, e.target.value)}}
                    />)

                  })}
                
              </Stack>
                
             
                
              <Stack direction="row" spacing={2} sx={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  {textFields.map((txt) => {
                    if (txt.isNumeric) return (
                    <TextField
                      margin="dense"
                      id={txt.name} 
                      key={txt.name} 
                      variant="standard"
                      type={txt.isNumeric ? 'number' : 'text'} 
                      sx={{width: txt.isNumeric ? 50 : 200}} 
                      label={txt.label} 
                      value={input[txt.name]} 
                      onChange={e => {handleVarChange(index, txt.name, e.target.value)}}
                    />)

                  })}
                  <FormGroup>
                    <FormControlLabel control={<Switch checked={input?.isNDC} onChange={e => { handleVarChange(index, 'isNDC', e.target.checked) }} name="bold" size="small"/>} label="isNDC" labelPlacement="end" />
                  </FormGroup>
              </Stack>
                
              
            </Stack>

          )
        })}
        {<Box>
          <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addScript() }}>
            <AddIcon />
        </IconButton>
          </Box>}
          <Box sx={{fontStyle:'italic'}}>
            <Typography>{`The values for left, bottom, right and top are based on the units of the document. If the isNDC value is true (the default is false) then values are normalized between 0.0 and 1.0 where a value of 0.2 is the equivalent of 20%.`}</Typography>
          </Box>
          
          <Box sx={{fontStyle:'italic'}}>
            <Typography>{`The value for pages includes a comma-separated list, a range, or a combination of numbers specifying the pages where the redaction zone is to be applied. A blank value implies that the zone is to be applied to all pages of the document. Examples: "", "1", "1,2", "1-4" "1,3-4" (Order is not important).`}</Typography>
          </Box>

    </React.Fragment>
  );
}
