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
  {name: 'pages', label: 'Pages', isNumeric: false}
]


export default function RedactionPageView(props) {
  const { inputScript, outScript } = props;

  /**
   * [
      {
        comment: 'Redact page', 
        hyperlink: 'developer.opentext.com', 
        lognote: '', 
        pages: '0,1,2-4'
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
          pages: ''
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
              
                <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeScript(index) }}>
                    <RemoveIcon />
                </IconButton>
                {textFields.map((txt) => {
                    return (
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

          )
        })}
        {<Box>
          <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addScript() }}>
            <AddIcon />
          </IconButton>
        </Box>}
          
        <Box sx={{fontStyle:'italic'}}>
          <Typography>{`The value for pages includes a comma-separated list, a range, or a combination of numbers specifying the pages where the redaction zone is to be applied. A blank value implies that the zone is to be applied to all pages of the document. Examples: "", "1", "1,2", "1-4" "1,3-4" (Order is not important).`}</Typography>
        </Box>

    </React.Fragment>
  );
}
