import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Collapse } from '@mui/material';
import ChipGroup from '../ChipGroup';

const Events = ['click', 'change', 'blur']
const Bys = ['selector', 'element-id', 'test-id', 'xpath']

export default function EventFunctoid ({ edit, event, by, value, actionKey: key, onSave }) {
    const [eventValue, setValue] = React.useState(value)
    const [Event, setEvent] = React.useState(event)
    const [By, setBy] = React.useState(by)
    const [Key, setKey] = React.useState(key)
    const save = () => {
        const step = {
            action: 'event',
            event: Event,
            by: By,
            actionKey: Key,
            value: eventValue
        } 
        onSave(step)
    }

    if (!edit) {
        return <Typography variant="subtitle1"><b>{event}</b> <em>{by}</em> [<b>{key}</b>] {!value ? '' : <>to "{value}"</>} </Typography>
    }

    return (<> <Box className="flex center">
        <ChipGroup label="event" options={Events} value={Event} setValue={setEvent} />
        {!!Event && <ChipGroup label="lookup type" options={Bys} value={By} setValue={setBy} />}
    </Box>
    
    {!!Event && !!By && <TextField 
        size="small" 
        sx={{ml: 2}}
        placeholder={`Enter ${By}`} 
        onChange={e => setKey(e.target.value)} 
        value={ Key } />}


    <Collapse orientation="horizontal" in={Event==='change' && !!By && !!Key}>
        <TextField 
            size="small" 
            sx={{ml: 2}}
            placeholder={`Change value`} 
            onChange={e => setValue(e.target.value)} 
            value={ eventValue } />
    </Collapse>


    <Button variant="contained" sx={{ml: 2}} disabled={!(Event && By && Key)} onClick={save}>save</Button>

    </>)
}



/**
 * {
 *    by: test-id | element-id | selector, 
 *    key
 *    options,
 *    icon -> Input
 *  },
 * 
 */