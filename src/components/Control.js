import React from 'react'; 
import { Chip, Collapse, Box, IconButton, Typography } from '@mui/material';
import { Close, Check }  from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';



function SimpleMenu ({icon, label, options, disabled, onClick}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  return <>
     <Box sx={{ml: 2}} className="flex center">
     {label}
      <IconButton
      disabled={disabled}
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {icon}
      </IconButton>
     </Box>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {options.map ((opt, i) => <MenuItem key={i} onClick={() => {
          onClick(i)
          handleClose()
        }}>{opt}</MenuItem>)}
         
      </Menu>
  </>
}


function ReallyButton ({ icon, onYes }) {
    const [on, setOn] = React.useState(false);
    return <Box className="flex center">
        <Collapse orientation="horizontal" in={on}>
     <Box className="flex center">
          really?
            <IconButton sx={{mr: 1}}  onClick={() => {
              setOn(!1);
              onYes()
            }}>
                <Check />
            </IconButton>
            <IconButton onClick={() => setOn(!1)} sx={{mr: 1}}>
                <Close />
            </IconButton>
    </Box>
        </Collapse>
        <Collapse orientation="horizontal" in={!on}>
            <IconButton onClick={() => setOn(!0)}>
                {icon}
            </IconButton>
        </Collapse>
    </Box>
}

export {
  ReallyButton,
  SimpleMenu
}