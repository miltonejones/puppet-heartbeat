import React from 'react'; 
import { Chip, Collapse, Box, IconButton,Typography } from '@mui/material';
import { Close }  from '@mui/icons-material';


export default function ChipGroup ({label = 'Choose', options, value, setValue}) {

    return <Box className="flex center">
      <Collapse  orientation="horizontal" in={!!value }>
      <IconButton onClick={() => setValue(null)}><Close /></IconButton>
        </Collapse>
     <Typography variant="caption">{label}:</Typography>
      {options.map((option, i) => <Collapse key={i} orientation="horizontal" in={!value || value===option}>
        <Chip  
          size="small"
          onClick={() => setValue(option)} 
          variant={value === option ? 'filled' : 'outlined'}
          color={value === option ? 'success' : 'primary'}
          sx={{ml: 1, minWidth: value === option ? 80 : 0}} 
          label={option} />
        </Collapse>)}
    </Box>

}