import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Divider, IconButton } from '@mui/material';
import { Flex, textBoxProps, ActionsMenu, SimpleMenu, VariableInput, Panel, ReallyButton, SaveCancel } from '../Control';
import { Add, DeleteForever, ExpandMore }  from '@mui/icons-material';
import ChipGroup from '../ChipGroup';

const Methods = ['get', 'post', 'put', 'delete'];

export default function RequestFunctoid ({ 
    actionKey: key, 
    method,
    body,
    headers = [],
    propName,
    variables, 
    edit, 
    onSave ,
    onCancel
  }) {

    const [state, setState] = React.useState({
      Key: key,
      Method: method,
      PropName: propName,
      Body: body,
      Headers: headers,
      showHeaders: false
    });

    const { Key, Body, Method, PropName, Headers = [], showHeaders} = state;
    const saveState = (n, v) => setState(s => ({...s, [n]: v})); 

    const save = () => {
      const step = {
        action: 'request',
        actionKey: Key,
        method: Method,
        body: Body,
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

    const addHeader = (Key, Value) => {
      saveState('Headers', Headers.concat([{ Key, Value, index: Headers.length }]))
    }

    const addBlankHeader = () => {
      addHeader('', '')
    }

    const canSave = !!Method && !!Key && !!PropName;
    const className = showHeaders ? 'flip up' : 'flip';
    const shownProps =  Array.from(new Set(variables))
    const truncated = key?.length > 50 ? `${key.substr(0, 50)}...` : key

    if (!edit) {
        return <Typography variant="subtitle1"><b>{method?.toUpperCase()}</b> <a href={key} target="_blank">{truncated}</a> as [<b>{propName}</b>]</Typography>
    }
    const menuAction = [() => addHeader('content-type', 'application/json'),  () => addHeader('', '') ];
    const disabledOn = Headers.find(f => f.Value === 'application/json') ? 1 : 0;
    const headerMenu = <SimpleMenu onClick={(i) => menuAction[i]()} disabledBits={disabledOn} icon={<Add />} options={['application/json', 'Add header']}  />

    const variableMenu = !Key ? <i/> : <ActionsMenu 
      label="variables" 
      options={shownProps} 
      onClick={i => saveState('Body', `{{${shownProps[i]}}}`)} 
      icon={<Add />} /> ;
    return <Stack>
    <Flex>
      <Typography sx={{mr: 1}} >request</Typography>

      <ChipGroup label="method" options={Methods} value={Method} setValue={e => saveState('Method', e)} />

      {!!Method && <VariableInput  
          autoFocus
          placeholder={`Enter URL`} 
          onChange={(n, v) => saveState(n, v)} 
          value={ Key } 
          name={ PropName } 
      />} 

      {canSave && <Button 
        sx={{ml: 1}} 
        variant="outlined" 
        onClick={() => saveState('showHeaders', !showHeaders)}
      >Headers <ExpandMore className={className} /></Button>}

      <SaveCancel disabled={!canSave} save={save} cancel={ onCancel }/> 
    </Flex>

    <Panel header="Request Headers" tools={[headerMenu]} on={showHeaders || Headers?.length}>
      {Headers.map ((header, o) => <HeaderRow key={o} {...header} save={saveHeader} remove={dropHeader} shownProps={shownProps} />)}
    </Panel>
    
    <Panel header="Request Body" tools={[variableMenu]} on={canSave && ['post', 'put'].find(f => Method === f)}>
      <TextField 
        {...textBoxProps}
         placeholder="Payload"
        multiline
        rows={6}
        value={Body}
        sx={{m: 1, minWidth: 600}}
        onChange={e => saveState('Body', e.target.value)}
      />
    </Panel>  
  </Stack>
}

const HeaderRow = ({
  Key,
  Value,
  index,
  save,
  remove,
  shownProps
}) => {
  const variableMenu = !Key ? <i/> : <ActionsMenu 
      label="variables" 
      options={shownProps} 
      onClick={i => save('PropName', {value: `{{${shownProps[i]}}}`, index})} 
      icon={<Add />} /> ;
  return <Flex sx={{gap: 1, m: 1}}>
    <VariableInput  
  autoFocus
  noCode
  placeholder={`Add header`} 
  onChange={(n, value) => save(n, {value, index})} 
  value={ Key } 
  name={ Value } 
/>
  <Typography>{Key}</Typography>
  <Typography> {Value || variableMenu} </Typography>
  <ReallyButton icon={<DeleteForever />} onYes={() => remove(index)}/>
  </Flex>
}

