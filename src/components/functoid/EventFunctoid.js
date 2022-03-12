import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Collapse } from '@mui/material';
import ChipGroup from '../ChipGroup';
import { queryTypes } from './functoidConstants';
import { QueryMenu, Flex } from '../Control';

const Events = ['click', 'change', 'blur']; 

export default function EventFunctoid ({ edit, event, by, value, actionKey: key, onSave, queryElements, previewTest }) {
  const [eventValue, setValue] = React.useState(value);
  const [Event, setEvent] = React.useState(event);
  const [By, setBy] = React.useState(by);
  const [Key, setKey] = React.useState(key);
  const save = () => {
    const step = {
      action: 'event',
      event: Event,
      by: By,
      actionKey: Key,
      value: eventValue
    };
    onSave(step);
  };

  if (!edit) {
    return <Typography variant="subtitle1"><b>{event}</b> <em>{by}</em> [<b>{key}</b>] {!value ? '' : <>to "{value}"</>} </Typography>
  }

  return (<> 
  
  <Flex>
    <ChipGroup label="event" options={Events} value={Event} setValue={setEvent} />
    {!!Event && <ChipGroup label="lookup type" options={queryTypes} value={By} setValue={setBy} />}
  </Flex>
    
  {!!Event && !!By && <TextField 
      autoFocus
      size="small" 
      sx={{ml: 2}}
      placeholder={`Enter ${By}`} 
      onChange={e => setKey(e.target.value)} 
      value={ Key } />}


  {!!By && <QueryMenu onClick={v => setKey(v)} queryElements={queryElements} previewTest={previewTest} />}

  <Collapse orientation="horizontal" in={Event==='change' && !!By && !!Key}>
      <TextField 
          autoFocus
          size="small" 
          sx={{ml: 2}}
          placeholder={`Change value`} 
          onChange={e => setValue(e.target.value)} 
          value={ eventValue } />
  </Collapse>


  <Button variant="contained" sx={{ml: 2}} disabled={!(Event && By && Key)} onClick={save}>save</Button>

  </>)
}

 