import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { 
    TextField,
    FormControl,
    FormGroup,
    FormControlLabel,
    Typography,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    IconButton,
    Stack,
    Box,
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

//characters not good: & " ' < > (Instead you must use: &amp; &quot; &apos; &lt; &gt;)



const watermarkFont = [
  { value: 'monospace', label: 'Monospace' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'cursive', label: 'Cursive' },
]

const watermarkColor = [
  {value: '#FF0000', label: 'Red'},
  {value: '#FF66FF', label: 'Pink'},
  {value: '##3333CC', label: 'Blue'},
  {value: '#FFFF00', label: 'Yellow'},
  {value: '##00FF00', label: 'Green'},
  {value: '##660066', label: 'Purple'},
  {value: '#000000', label: 'Black'},
  {value: '#FFFFFF', label: 'White'},


]


export default function WatermarkScriptView(props) {
  const { inputScript, outScript } = props;

  /**
   * [
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
    ]
   */


    const handleVarChange = (index, inName, inValue) => {
        let data = [...inputScript];
        data[index][inName] = inValue;
        
        
        
        outScript(data);
    }


    const addScript = () => {
        let newfield = {
          min_page: 0, 
          max_page: 0,
          watermark_opacity: 0.25,
          watermark_size: 72,
          watermark_font: 'monospace',
          watermark_italic: true,
          watermark_bold: true,
          watermark_underline: true,
          watermark_color: '#FF0000',
          watermark_text: ''}
    
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
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                <IconButton size="small" variant="outlined" color="error" title="Remove" onClick={() => { removeScript(index) }}>
                    <RemoveIcon />
                </IconButton>
                <TextField
                    margin="dense"
                    id="min_page" 
                    key="min_page"
                    variant="standard"
                    type={'number'} 
                    sx={{width: 50}} 
                    label="From" 
                    value={input?.min_page} 
                    onChange={e => {handleVarChange(index, 'min_page', e.target.value)}}
                  />
                <TextField
                    margin="dense"
                    id="max_page" 
                    key="max_page"
                    variant="standard"
                    type={'number'} 
                    sx={{width: 50}} 
                    label="To" 
                    value={input?.max_page} 
                    onChange={e => {handleVarChange(index, 'max_page', e.target.value)}}
                  />
                <TextField
                    margin="dense"
                    id="opacity" 
                    key="opacity"
                    variant="standard"
                    type={'number'} 
                    sx={{width: 50}} 
                    label="Opacity" 
                    value={input?.watermark_opacity} 
                    onChange={e => {handleVarChange(index, 'watermark_opacity', e.target.value)}}
                  />
                
              </Stack>
                
              <Stack direction={"column"} spacing={1}>
                <Stack direction="row" spacing={0.5} sx={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  
                  <FormControl sx={{ m: 0, minWidth: 100 }} size="small">
                    <InputLabel id="select-font">Font</InputLabel>
                    <Select
                      labelId="select-font-label"
                      id="select-sel-font"
                      value={input?.watermark_font}
                      label="Font"
                      onChange={e => {handleVarChange(index, 'watermark_font', e.target.value)}} 
                      inputProps={{ readOnly: false }}
                    >
                      {watermarkFont.map((obj, index) => {
                          return (<MenuItem key={'font_' + index} value={obj.value}>{obj.label}</MenuItem>)
                        })}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 0, minWidth: 100 }} size="small">
                    <InputLabel id="select-color">Color</InputLabel>
                    <Select
                      labelId="select-color-label"
                      id="select-sel-color"
                      value={input?.watermark_color}
                      label="Color"
                      onChange={e => {handleVarChange(index, 'watermark_color', e.target.value)}} 
                      inputProps={{ readOnly: false }}
                    >
                      {watermarkColor.map((obj, index) => {
                          return (<MenuItem key={'color_' + index} value={obj.value}>{obj.label}</MenuItem>)
                        })}
                    </Select>
                  </FormControl>
                  
                  
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  <TextField
                    margin="dense"
                    id="size" 
                    key="size"
                    variant="standard"
                    type={'number'} 
                    sx={{width: 50}} 
                    label="Size" 
                    value={input?.watermark_size} 
                    onChange={e => {handleVarChange(index, 'watermark_size', e.target.value)}}
                  />
                  <FormGroup>
                    <FormControlLabel control={<Switch checked={input?.watermark_bold} onChange={e => { handleVarChange(index, 'watermark_bold', e.target.checked) }} name="bold" size="small"/>} label="Bold" labelPlacement="end" />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel control={<Switch checked={input?.watermark_italic} onChange={e => { handleVarChange(index, 'watermark_italic', e.target.checked) }} name="italic" size="small"/>} label="Italic" labelPlacement="end" />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel control={<Switch checked={input?.watermark_underline} onChange={e => { handleVarChange(index, 'watermark_underline', e.target.checked) }} name="bold" size="small"/>} label="Underline" labelPlacement="end" />
                  </FormGroup>
              </Stack>
              <TextField
                    margin="dense"
                    id="size" 
                    key="size"
                    variant="standard"
                    sx={{width: 350}} 
                    label="Text" 
                    value={input?.watermark_text} 
                    onChange={e => {handleVarChange(index, 'watermark_text', e.target.value)}}
                  />
            </Stack>

          ) 
        })}
        {<Box>
          <IconButton size="small" variant="outlined" color="success" title="Add new" onClick={() => { addScript() }}>
            <AddIcon />
        </IconButton>
          </Box>}
          <Box sx={{fontStyle:'italic'}}>
            <Typography>{`You can use substitution variables like this *Confidential %Date %Time* *Expires on %SysDatePlusDays(3)* *Total pages %TotalPages* *Current page %Page*`}</Typography>
          </Box>
    </React.Fragment>
  );
}
