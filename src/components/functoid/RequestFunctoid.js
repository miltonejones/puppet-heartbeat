import React from 'react'; 
import { Collapse, TextField, Stack, Typography, Button, Tooltip, IconButton } from '@mui/material';
import { Flex, textBoxProps, ActionsMenu, SimpleMenu, VariableInput, Panel, ReallyButton, Spacer, SaveCancel } from '../Control';
import { Add, DeleteForever, ExpandMore , Edit, Close}  from '@mui/icons-material';
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
        headers: Headers.map(k => ({...k, saved: !0})),
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
    const truncated = <Tooltip title={key}><span>{key?.length > 50 ? `${key?.substr(0, 50)}...` : key}</span></Tooltip>
    
   
    if (!edit) {
        return <Typography variant="subtitle1"><b>{method?.toUpperCase()}</b> <a href={key} target="_blank">{truncated}</a> as [<b>{propName}</b>]</Typography>
    }
    const menuAction = [() => addHeader('content-type', 'application/json'),  () => addHeader('', '') ];
    const disabledOn = Headers.find(f => f.Value === 'application/json') ? 1 : 0;
    const headerMenu = <SimpleMenu onClick={(i) => menuAction[i]()} disabledBits={disabledOn} icon={<Add />} options={['application/json', 'Add header']}  />
    const showBody = canSave && ['post', 'put'].find(f => Method === f);
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
          style={!Headers.length ? {} : {minWidth: 450}}
          placeholder={`Enter URL`} 
          onChange={(n, v) => saveState(n, v)} 
          value={ Key } 
          name={ PropName } 
      />} 

      {canSave && !Headers.length && <Button 
        sx={{ml: 1}} 
        variant="outlined" 
        onClick={() => saveState('showHeaders', !showHeaders)}
      >Headers <ExpandMore className={className} /></Button>}

      <SaveCancel disabled={!canSave} save={save} cancel={ onCancel }/> 
    </Flex>

    <Panel header="Request Headers" tools={[headerMenu]} on={showHeaders || Headers?.length}>
      <Flex sx={{gap: 1, p: 1}} className="underline panel-header">
      <IconButton disabled ><Edit /></IconButton>
        <Typography variant="subtitle2" sx={{ml: 1}} className="half bold">Key</Typography>
        <Typography variant="subtitle2" className="bold">Value</Typography>
      </Flex>
      {Headers.map ((header, o) => <HeaderRow key={o} {...header} save={saveHeader} remove={dropHeader} shownProps={shownProps} />)}
    </Panel>
    
    <Panel header="Request Body" tools={[variableMenu]} on={showBody}>
      <TextField 
        {...textBoxProps}
         placeholder="Payload"
        multiline
        rows={8}
        classes={{ root: 'code-field' }}
        value={Body}
        sx={{m: 1, minWidth: 600}}
        onChange={e => saveState('Body', e.target.value)}
      />
    </Panel>  
   
    {showBody && <SaveCancel button disabled={!canSave} save={save} cancel={ onCancel }>save request</SaveCancel> }
  </Stack>
}

const HeaderRow = ({
  Key,
  Value,
  index,
  save,
  saved,
  remove,
  shownProps
}) => {
  const [edit, setEdit] = React.useState(false);
  const Icon = edit ? Close : Edit;
  const variableMenu = !Key ? <i/> : <ActionsMenu 
      label="variables" 
      options={shownProps} 
      onClick={i => save('PropName', {value: `{{${shownProps[i]}}}`, index})} 
      icon={<Add />} /> ;
  return <Flex sx={{gap: 1, pl: 1, pr: 1}} className="underline">
    <IconButton disabled={!saved} onClick={() => setEdit(!edit)}><Icon /></IconButton>
    <Collapse className={edit?"half":""} sx={{m: edit||!saved?1:0, p: 0, maxHeight: 56}} orientation="horizontal" in={edit || !saved}><VariableInput  
      autoFocus
      noCode
      placeholder={`Add header`} 
      onChange={(n, value) => save(n, {value, index})} 
      value={ Key } 
      name={ Value } 
    /></Collapse>
  {!edit && <Typography className="half">{Key}</Typography>}
  <Typography> {Value || variableMenu} </Typography>
  <Spacer />
  <ReallyButton icon={<DeleteForever />} onYes={() => remove(index)}/>
  </Flex>
}

