import React from 'react'; 
import { Box, TextField, Stack, Typography, Button, Divider } from '@mui/material';
import { SaveCancel, ActionsMenu } from '../Control';
import { Add  }  from '@mui/icons-material';


export default function NavigationFunctoid ({ URL, variables, edit, onSave, onCancel }) {
    const [value, setValue] = React.useState(URL)
    const save = () => {
        const step = {
            action: 'navigate',
            URL: value
        }
        onSave(step)
    }

    const shownProps =  Array.from(new Set(variables));
    const variableMenu = <ActionsMenu 
        label="variables" 
        options={shownProps} 
        onClick={i => setValue( `${value}{{${shownProps[i]}}}`)} 
        icon={<Add />} /> ;

    if (!edit) {
        return <Typography variant="subtitle1"><b>Navigate</b> to <a href={URL} target="_blank">{URL}</a></Typography>
    }

    return <Box sx={{gap: 1}} className="flex center">
        <Typography>Navigate to:</Typography>
        <TextField size="small" sx={{minWidth: 500}}
            autoComplete="off" onChange={e => setValue(e.target.value)} value={ value } />
        {variableMenu}
      <SaveCancel disabled={!value} save={save} cancel={onCancel}/>
    </Box>
}

