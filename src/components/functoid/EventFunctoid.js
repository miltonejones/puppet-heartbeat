import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Collapse } from '@mui/material';
import ChipGroup from '../ChipGroup';
import { queryTypes } from './functoidConstants';
import { QueryMenu, Flex, textBoxProps, VariableInput } from '../Control';

const Events = ['click', 'change', 'blur', 'focus']; 

export default function EventFunctoid ({ 
  edit, 
  event, 
  by, 
  value, 
  propName,
  actionKey: key, 
  onSave, 
  queryElements, 
  previewTest 
}) {
  const [state, setState] = React.useState({
    eventValue: value,
    Event: event,
    By: by,
    Key: key,
    PropName: propName
  });
  const saveState = (n, v) => setState(s => ({...s, [n]: v})); 
  const { eventValue, Event, By, Key, PropName} = state;
  
  const save = () => {
    const step = {
      action: 'event',
      event: Event,
      by: By,
      actionKey: Key,
      propName: PropName,
      value: eventValue
    };
    onSave(step);
  };

  if (!edit) {
    return <Typography variant="subtitle1"><b>{event}</b> <em>{by}</em> [<b>{propName || key}</b>] {!value ? '' : <>to "{value}"</>} </Typography>
  }

  return (<> 
  
    <Flex>
      <ChipGroup label="event" options={Events} value={Event} setValue={e => saveState('Event', e)} />
      {!!Event && <ChipGroup label="by" options={queryTypes} value={By} setValue={e => saveState('By', e)} />}
    </Flex>
      
    {!!Event && !!By && <VariableInput  
        autoFocus
        placeholder={`Enter ${By}`} 
        onChange={(n, v) => saveState(n, v)} 
        value={ Key } 
        name={ PropName } 
    />} 

    {!!By && <QueryMenu onClick={v => saveState('Key', v)} queryElements={queryElements} previewTest={previewTest} />}

    <Collapse orientation="horizontal" in={Event==='change' && !!By && !!Key}>
      <TextField 
       {...textBoxProps} 
        placeholder={`Change value`} 
        onChange={e => saveState('eventValue', e.target.value)} 
        value={ eventValue } />
    </Collapse>

    <Button variant="contained" sx={{ml: 2}} disabled={!(Event && By && Key)} onClick={save}>save</Button>
  </>)
}