import React from 'react'; 
import { Flex } from '../Control';
import { Box, TextField, Stack, Typography, IconButton, Chip } from '@mui/material';
import { Lock }  from '@mui/icons-material';

export default function PuppetLFunctoid ({ action, fact, primitiveKey: key, object }) {

  if (!action) return <i />
  const args = {
    sx: {ml: 1, mr: 1, minWidth: 80},
    size: 'small',
    color: 'error' 
  }

  const prefix = <>
    <IconButton><Lock /></IconButton>
    <Typography variant="caption">Import:</Typography> 
  </>

  if (action.indexOf('lookup') === 0) {
      const [label, type] = action.split('-by-')
      return <Flex>
        {prefix}
        <Chip {...args}   variant="outlined" label={label} /> 
        <Typography variant="subtitle1">  <em>{type}</em> [<b>{key}</b>] </Typography> 
        </Flex>
  }
  if  (action === 'exists') { 
    const expecting = !!fact.value 
        ? `to equal "${fact.value}"`
        : 'to be in the document'
    return <Flex>
        {prefix}
        <Chip {...args}   variant="outlined" label="expect" /> 
        <Typography variant="subtitle1"> [<b>{fact.key}</b>] {expecting}</Typography>
        </Flex>
  }
  return <Flex> 
      {prefix} 
      <Chip  {...args}  variant="outlined" label={action} /> 
      <Typography variant="subtitle1">{key || object.key}</Typography>
      </Flex>
     

}