import React from 'react';
import { 
  Pagination,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogContentText,
  Stack, 
  TextField,
  DialogTitle
} from '@mui/material';

import { TextBox } from './Control';


const SystemDialog = ({open, title, onYes, onNo, onClose, defaultValue='', message, prompt}) => {
    const [value, setValue] = React.useState(null);
    const whenYes = () => {
      if (prompt) {
        return onYes(value) 
      }
      onYes(true)
    }
    return (<><Dialog
      classes={{root: 'modal', paper: 'modal'}}
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
     {!!title && (<DialogTitle classes={{paper: "dialog-header", root: "dialog-header"}} sx={{mb: 1, pb: 0}} id="alert-dialog-title">
        {title}
      </DialogTitle>)}
      <DialogContent>
        <Stack>
          <DialogContentText sx={{mb: 1}} id="alert-dialog-description">
          {message}
          </DialogContentText>
          {!!prompt && <TextBox value={value || defaultValue} onEnter={onYes} onChange={setValue} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button sx={{mb: 2, mr: 2}} onClick={onNo}>Cancel</Button>
        <Button sx={{mb: 2, mr: 2}} variant="contained" onClick={whenYes}  
        >okay</Button> 
      </DialogActions>
    </Dialog></>)
  }
  
  
export default SystemDialog;

// makes it workable for components as well
export function componentSystemDialog (systemDialogState, stateSetter) {

    const Prompt = (message, defaultValue, title) => new Promise(yes => {
        stateSetter({
          open: true,
          message,
          defaultValue,
          title,
          onYes: v => {
            yes(v);
            stateSetter({open: false})
          },
          onNo: () => {
            yes(false)
            stateSetter({open: false})
          },
          prompt: true,
          onClose: () => stateSetter({ open: false }),
        });
      });
   
      const Confirm = (message, title) => new Promise(yes => {
        stateSetter({
          open: true,
          message, 
          title,
          onYes: v => {
            yes(v);
            stateSetter({open: false})
          },
          onNo: () => {
            yes(false)
            stateSetter({open: false})
          }, 
          onClose: () => stateSetter({ open: false }),
        });
      });
    
      return { systemDialogState, Prompt, Confirm };

}

export function useSystemDialog() {
    const [systemDialogState, setState] = React.useState({ open: false }); 
    return componentSystemDialog(systemDialogState, setState); 
}