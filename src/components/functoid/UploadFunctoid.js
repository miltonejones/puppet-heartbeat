import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Collapse } from '@mui/material';
import ChipGroup from '../ChipGroup';
import { FileUploader, VariableInput } from '../Control';
import { queryTypes } from './functoidConstants';
import { QueryMenu, textBoxProps } from '../Control';


export default function UploadFunctoid ({ 
    edit, 
    path, 
    by, 
    actionKey: key, 
    onSave, 
    queryElements, 
    previewTest ,
    propName
}) {
    const [value, setValue] = React.useState('')
    const [Path, setPath] = React.useState(path);
    const [By, setBy] = React.useState(by);
    const [Key, setKey] = React.useState(key);
    const [PropName, setPropName] = React.useState(propName);
    const save = () => {
        const step = {
            action: 'upload', 
            by: By,
            actionKey: Key,
            path: Path,
            propName: PropName
            
        } 
        onSave(step)
    }

    if (!edit) {
        return <Typography variant="subtitle1"><b>upload</b> <u>{path}</u> using <em>{by}</em> [<b>{propName || key}</b>] </Typography>
    }

    return (<> <Box className="flex center">
        <ChipGroup label="by" options={queryTypes} value={By} setValue={setBy} /> 
    </Box>
    
    { !!By && <VariableInput 
      {...textBoxProps} 
      placeholder={`Enter ${By}`} 
      onChange={(n, v) => {
          if (n === 'Key') return setKey(v)
          setPropName(v)
      }} 
      name={ PropName }
      value={ Key } />}

  {!!By && <QueryMenu onClick={v => setKey(v)} queryElements={queryElements} previewTest={previewTest} />}

  <Collapse orientation="horizontal" in={!!Key && !!By}>
    <Box sx={{ml: 2}}>
        <FileUploader uploadComplete={setPath} />
    </Box>
  </Collapse>

  <Button variant="contained" sx={{ml: 2}} disabled={!(Path && By && Key)} onClick={save}>save</Button>
</>)
}
