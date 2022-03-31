import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Divider } from '@mui/material';
import { SaveCancel } from '../Control';


export default function NavigationFunctoid ({ URL, edit, onSave, onCancel }) {
    const [value, setValue] = React.useState(URL)
    const save = () => {
        const step = {
            action: 'navigate',
            URL: value
        }
        onSave(step)
    }

    if (!edit) {
        return <Typography variant="subtitle1"><b>Navigate</b> to <a href={URL} target="_blank">{URL}</a></Typography>
    }

    return <Box sx={{gap: 1}} className="flex center">
        <Typography>Navigate to:</Typography>
        <TextField size="small" 
            autoComplete="off" onChange={e => setValue(e.target.value)} value={ value } />
   
      <SaveCancel disabled={!URL} save={save} cancel={onCancel}/>
    </Box>
}

