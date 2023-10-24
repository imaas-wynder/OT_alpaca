import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// MUI components
import { 
  Box,
  IconButton,Stack
} from '@mui/material';

import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import TraitInstanceComp from './TraitInstanceComp';

export default function TraitInstanceAddMulti(props) {
  const { runRequest, newOpen, pushTraitArray, token, showBorder, inTraitArray } = props;
  

  const [traitArray, setTraitArray] = React.useState([]);



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
  
  const addNewTrait = () => {
    
    setTraitArray([...traitArray, {noDelete: false}]);
  }

  const removeTrait = (index) => {
    let data = [...traitArray];
    data.splice(index, 1);
    setTraitArray(data);
  }

  const handleChangeValue = (value, index) => {
    if (!value.name) return;
    if (!value.definition) return;
    value.noDelete = (traitArray[index].noDelete===true);

    let data = [...traitArray];

    data.splice(index,1, value)
    setTraitArray(data);
  }




  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(() => {
    if (newOpen) {
      
      setTraitArray(inTraitArray ? inTraitArray : []);
    }
    
  }, [newOpen]);

  useEffect(() => {
    pushTraitArray(traitArray);
  }, [traitArray]);

  return (
    <React.Fragment>
        <Box sx={{
          mb: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
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
          <Stack direction={'row-reverse'} spacing={1}>
            <Box>
              <IconButton size="small" variant="outlined" color="success" title="Add new trait" onClick={() => { addNewTrait() }}>
                <LibraryAddIcon />
              </IconButton>
            </Box>
          </Stack>
          <Stack direction={'column'} spacing={2}>
            {traitArray && traitArray.map((trait, index) => (
                <Stack key={'traitMulti' + index} direction={'row'} spacing={1}>
                  <Box>
                    <IconButton disabled={(trait.noDelete===true)} size="small" variant="outlined" color="error" title="Remove trait" onClick={() => { removeTrait(index) }}>
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                  <TraitInstanceComp 
                    runRequest={runRequest} 
                    newOpen={true} 
                    outTraitFunc={(obj) => { handleChangeValue(obj, index) }} 
                    token={token} 
                    showBorder={showBorder} 
                    inDefinition={((trait.noDelete===true) && trait.definition) ? trait.definition : ''}
                    inTrait={trait} />
                </Stack>
            ))}
            

          </Stack>
          
        </Box>
      
    </React.Fragment>

    
  );
}
