import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Collapse } from '@mui/material';
import ChipGroup from '../ChipGroup';
import { FileUploader } from '../Control';
import { queryTypes } from './functoidConstants';


export default function UploadFunctoid ({ edit, path, by, actionKey: key, onSave }) {
    const [value, setValue] = React.useState('')
    const [Path, setPath] = React.useState(path)
    const [By, setBy] = React.useState(by)
    const [Key, setKey] = React.useState(key)
    const save = () => {
        const step = {
            action: 'upload', 
            by: By,
            actionKey: Key,
            path: Path
        } 
        onSave(step)
    }

    if (!edit) {
        return <Typography variant="subtitle1"><b>upload</b> <u>{path}</u> using <em>{by}</em> [<b>{key}</b>] </Typography>
    }

    return (<> <Box className="flex center">
        <ChipGroup label="lookup type" options={queryTypes} value={By} setValue={setBy} /> 
    </Box>
    
    { !!By && <TextField 
        size="small" 
        sx={{ml: 2}}
        placeholder={`Enter ${By}`} 
        onChange={e => setKey(e.target.value)} 
        value={ Key } />}


    <Collapse orientation="horizontal" in={!!Key && !!By}>
        <Box sx={{ml: 2}}>
            <FileUploader uploadComplete={setPath} />
        </Box>
    </Collapse>


    <Button variant="contained" sx={{ml: 2}} disabled={!(Path && By && Key)} onClick={save}>save</Button>

    </>)
}
