import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Collapse } from '@mui/material';
import ChipGroup from '../ChipGroup';

const Expectations = ['toBeInDocument', 'toEqual']
const Bys = ['selector', 'element-id', 'test-id', 'xpath']

export default function ExpectFunctoid ({ edit, fact, by, actionKey: key, onSave }) {
    const [value, setValue] = React.useState('')
    const [Expectation, setExpectation] = React.useState(event)
    const [By, setBy] = React.useState(by)
    const [Key, setKey] = React.useState(key)
    const save = () => {
        const step = {
            action: 'expect', 
            by: By,
            actionKey: Key,
            fact: {
              value,
              actionKey: Key,
            }
        } 
        onSave(step)
    }

    if (!edit) {
        return <Typography variant="subtitle1"><b>expect</b> that <em>{by}</em> [<b>{key}</b>] {!value ? 'is in the document' : `equals ${value}`} </Typography>
    }

    return (<> <Box className="flex center">
        <ChipGroup label="lookup type" options={Bys} value={By} setValue={setBy} />
        {!!By && <ChipGroup label="expect" options={Expectations} value={Expectation} setValue={setExpectation} />}
    </Box>
    
    { !!By && <TextField 
        size="small" 
        sx={{ml: 2}}
        placeholder={`Enter ${By}`} 
        onChange={e => setKey(e.target.value)} 
        value={ Key } />}


    <Collapse orientation="horizontal" in={Expectation==='toEqual' && !!By }>
      <TextField 
          size="small" 
          sx={{ml: 2}}
          placeholder={`Change value`} 
          onChange={e => setValue(e.target.value)} 
          value={ value } />
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