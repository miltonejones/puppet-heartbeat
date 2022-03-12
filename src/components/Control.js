import React from 'react'; 
import { Chip, Card, Stack, Collapse, IconButton, Button, Typography, Box } from '@mui/material';
import { Close, Check, ExpandMore }  from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


function Panel ({header, on, tools, children, ...props}) {
  return <Collapse in={on}><Card sx={{mb: 1, mt: 1}} { ...props}>
      <Stack className="panel-content">
        <Flex className="panel-header" 
        ><Typography sx={{ mt: 1, ml: 2, mb: 1}} variant="h6">
        {header}</Typography><Spacer />{tools
        ?.map((e,q) => (<Box mr={2} key={q}>{e}</Box>))} </Flex>
        <Box className="panel-body" >{children}</Box>
      </Stack>
  </Card></Collapse>
}


function ActionsMenu (props) {
  const [up, setUp] = React.useState(false);
  const className = up ? 'flip up' : 'flip';
  return <SimpleMenu 
    {...props} 
    onClose={setUp}
    button={Button} 
    icon={<>Actions <ExpandMore className={className} /></>} />
}


function SimpleMenu ({ options, disabledBits, disabled, onClick, onClose, label, icon, button, ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    onClose && onClose(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    onClose && onClose(false);
  };

  const Control = button || IconButton;

  return <>
     <Box sx={{ml: 2}} className="flex center">
     {label}
      <Control
        disabled={disabled} 
        onClick={handleClick}
        variant="outlined"
      >
        {icon}
      </Control>
     </Box>
      <Menu 
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose} 
      >
        {options.map ((opt, i) => <MenuItem key={opt} onClick={() => {
          onClick(i)
          handleClose()
        }} disabled={!!(disabledBits & Math.pow(2, i))}>{opt}</MenuItem>)}
         
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

function Frame({ offset = 0, children, style, ...props }) {
  const [height, setHeight] = React.useState(null);
  const ref = React.createRef();
  React.useEffect(() => {
    const { offsetTop } = ref.current;
    console.log ({offsetTop, height})
    !!offsetTop && setHeight(`calc(100vh - ${offsetTop}px - ${offset}px)`);
  }, [ref]);
  return ( 
      <Cw {...props} style={{ ...style,  height }} ref={ref}>
        {children}
      </Cw> 
  );
}

const Flex = ({
    align: alignItems = 'center', 
    justify: justifyContent,
    children, 
    ...props}) => {
  const style = {
    display: 'flex',
    alignItems ,
    justifyContent,
    ...props.style
  }
  return <Box style={style} {...props}>{children}</Box>
} 
const Spacer = () => <Box sx={{flexGrow: 1}} />

const Cw = React.forwardRef(({ children, ...props }, ref) => (
  <Box ref={ref} {...props}>
    {children}
  </Box>
));

const UPLOAD_URL = "https://habprc9pj4.execute-api.us-east-1.amazonaws.com/tests";

const submitForm = (file) => {
  const formData = new FormData(); 
  formData.append("body", file);

  return new Promise (yes => {
    fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'file-name': file.name 
      },
    })
    .then(response => response.json())
    .then(data => {
      yes(data)
    })
    .catch(error => {
      yes(error)
    })
  })


};


const FileUploader = ({uploadComplete}) => {
  const fileInput = React.useRef(null);
  const [file, setFile] = React.useState(null)

  const handleFileInput = async (e) => {
      // handle validations
      const res = await submitForm(e.target.files[0]);
      uploadComplete && uploadComplete(res);
      setFile(res);
  }

  if (file) {
    return <u onClick={() => setFile(null)}>{file}</u>
  }

  return (
      <div className="file-uploader">
          <input ref={fileInput} type="file" style={{display: 'none'}} onChange={handleFileInput} />
          <Button variant="contained" onClick={e => fileInput.current && fileInput.current.click()} 
              className="btn btn-primary">upload file</Button>
      </div>
  )
}



// 

export {
  ActionsMenu,
  Flex,
  Frame,
  Panel,
  ReallyButton,
  SimpleMenu,
  Spacer,
  FileUploader
}