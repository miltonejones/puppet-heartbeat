import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Divider, IconButton } from '@mui/material';
import { Flex, textBoxProps, VariableInput, Panel, ReallyButton } from '../Control';
import { Add, DeleteForever, ExpandMore }  from '@mui/icons-material';
import ChipGroup from '../ChipGroup';

const Methods = ['get', 'post', 'put', 'delete']

export default function RequestFunctoid ({ 
    actionKey: key, 
    method,
    headers = [],
    propName,
    edit, 
    onSave 
  }) {
    const [state, setState] = React.useState({
        Key: key,
        Method: method,
        PropName: propName,
        Headers: headers,
        showHeaders: false
    });
    const { Key, Method, PropName, Headers = [], showHeaders} = state;
    const saveState = (n, v) => setState(s => ({...s, [n]: v})); 
 
    const save = () => {
        const step = {
            action: 'request',
            actionKey: Key,
            method: Method,
            headers: Headers,
            propName: PropName
        }
        onSave(step)
    }

    const dropHeader = i => {

      saveState('Headers', Headers.filter(header => header.index !== i))
    }

    const saveHeader = (name, options) => {
      const { value, index} = options;
      const prop = name === 'Key' ? name : 'Value';
      saveState('Headers', Headers.map(header => header.index === index ? {...header, [prop]: value} : header))
    }

    const addHeader = () => {
      saveState('Headers', Headers.concat([{ Key: '', Value: '', index: Headers.length }]))
    }

    const canSave = !!Method && !!Key && !!PropName;
    const className = showHeaders ? 'flip up' : 'flip';
    

    if (!edit) {
        return <Typography variant="subtitle1"><b>Request</b> <a href={URL} target="_blank">{key}</a> as [<b>{propName}</b>]</Typography>
    }

    return <Stack>
    <Flex>
        <Typography>Request</Typography>

        <ChipGroup label="method" options={Methods} value={Method} setValue={e => saveState('Method', e)} />

          
        {!!Method && <VariableInput  
            autoFocus
            placeholder={`Enter URL`} 
            onChange={(n, v) => saveState(n, v)} 
            value={ Key } 
            name={ PropName } 
        />} 

        {canSave && <Button sx={{ml: 1}} variant="outlined" onClick={() => saveState('showHeaders', !showHeaders)}
         >Headers <ExpandMore className={className} /></Button>}
 
        <Button disabled={!canSave} variant="contained" sx={{ml: 1}} onClick={save}>save</Button>
    </Flex>
    {/* [{JSON.stringify(Headers)}] */}
    <Panel header="Headers" tools={[<IconButton onClick={addHeader}><Add /></IconButton>]} on={showHeaders || Headers?.length}>
      {Headers.map ((header, o) => <HeaderRow key={o} {...header} save={saveHeader} remove={dropHeader} />)}
    </Panel>
    
    </Stack>
}

const HeaderRow = ({
  Key,
  Value,
  index,
  save,
  remove
}) => {
  return <Flex sx={{gap: 1, m: 1}}>
    <VariableInput  
  autoFocus
  placeholder={`Add header`} 
  onChange={(n, value) => save(n, {value, index})} 
  value={ Key } 
  name={ Value } 
/>
  <Typography>{Key}</Typography>
  <Typography>{Value}</Typography>
  <ReallyButton icon={<DeleteForever />} onYes={() => remove(index)}/>
  </Flex>
}

