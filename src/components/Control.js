import React from 'react'; 
import { 
  Chip, 
  Card, 
  Stack, 
  Collapse, 
  LinearProgress, 
  Skeleton, 
  Dialog,
  DialogTitle,
  IconButton, 
  Button, 
  TextField,
  Typography, 
  InputAdornment,
  Tooltip,
  Box } from '@mui/material';
import { Close, Check, ExpandMore, Sync, Search, Save,
  Edit, MoreVert, DriveFileRenameOutline  }  from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';




function CodeDialog ({code, open, onClose}) {
  return <><Dialog  onClose={onClose} open={open}> 
  <DialogTitle>Test Code</DialogTitle>
    <Box p={3}>
      <fieldset className="code-block">
        <legend>copy</legend>
        <Box className="code-block-inner"> <pre>{code}</pre> </Box>
      </fieldset>
    </Box>
  </Dialog></>
}

// component class version
function controlCodeDialog(state, setState) { 
  const showCode = code => {
    setState({
      dialogState:{ 
        open:true,
        code,
        onClose: () => setState({dialogState: {open: false}})
      }
    })
  }
  return { state, showCode }
}

// component function version
function useCodeDialog () {
  const [codeDialogState, setCodeDialogState] = React.useState({ open: false});
  return controlCodeDialog(codeDialogState, setCodeDialogState);
}
 


function Panel ({header, on, tools, children, wait = false, sx, ...props}) {
  const style = {mb: 1, mt: 3, ...sx}
  if (wait && !on) {
    return <LinearProgress sx={style}  />
  }
  return <Collapse in={on}><Card sx={style} { ...props}>
      <Stack className="panel-content">
        <Flex className="panel-header" 
        ><Typography sx={{ mt: 1, ml: 2, mb: 1}} variant="h6">
        {header}</Typography><Spacer />{tools
        ?.map((e,q) => (<Box mr={2} key={q}>{e}</Box>))} </Flex>
        <Box className="panel-body" >{children}</Box>
      </Stack>
  </Card></Collapse>
}


// create an named bitwise object 
const LilBit = (names) => ((e) => {
  names.map((n, i) => e[n] = Math.pow(2, i));
  return e;
})({});


function ActionsMenu ({label = 'Actions', ...props}) {
  const [up, setUp] = React.useState(false);
  const className = up ? 'flip up' : 'flip';
  return <SimpleMenu 
    {...props} 
    onClose={setUp}
    button={Button} 
    icon={<>{label} <ExpandMore className={className} /></>} />
}

function QueryMenu ({ queryElements, previewTest, onClick, ...props}) {
  
    if (!queryElements?.length) {
      return <IconButton onClick={previewTest}>
        <Search />
      </IconButton>
    }

    return <SimpleMenu 
      icon={<MoreVert />}
      onClick={i => onClick(queryElements[i])}
      options={queryElements}  />
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
     <Box className="flex center">
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
        {options.map ((opt, i) => (
        <MenuItem key={opt} onClick={() => {
          onClick(i)
          handleClose()
        }} 
        disabled={!!(disabledBits & Math.pow(2, i))}>
          {opt}
        </MenuItem>))}
         
      </Menu>
  </>
}


function ReallyButton ({ icon, onYes }) {
    const [on, setOn] = React.useState(false);
    return <Box className="flex center">
        <Collapse orientation="horizontal" in={on}>
     <Box className="flex center">
        <Chip label="Really?" size="small" color="error" />
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



function PreviewBox ({ thumbnail, animation = false }) {
  const args = {
    style: { width: '320px', height: '192px' },
    width: 320,
    height: 192,
    variant: 'rectangular',
    src: 'data:image/png;base64,' + thumbnail,
    alt: 'thumbnail',
    animation 
  }
  const message = !!animation 
    ? 'Waiting for first image...' 
    : 'Click Run to execute test.';
  const content = !!thumbnail ? <img {...args} /> : <Skeleton {...args} />
  return (                
  <Stack mt={6} ml={4} className="preview-stack">
    <Box className="preview-head">
      <Box className="dot" />
      <Box className="dot gold" />
      <Box className="dot green" />
      <Typography ml={1} variant="caption">
        Test Preview
      </Typography>
    </Box>
    <Box className="preview-body">
     {content}
    </Box>
    {!thumbnail && <Typography m={1} variant="caption">
      {message}
    </Typography>}
  </Stack>)
}


function VariableInput ({ onChange, value, name, noCode, ...props }) {
  const [on, setOn] = React.useState(false);
  const Icon = on ? Save : DriveFileRenameOutline;
  const  InputProps={
    endAdornment: <InputAdornment position="end">
        <Tooltip title="Enter a friendly variable name">
      <IconButton onClick={() => setOn(!on)}><Icon /></IconButton></Tooltip>
    </InputAdornment>,
  }

  return <>
    <Collapse orientation="horizontal" in={!on}>
      <TextField 
        {...textBoxProps}
        {...props}
        autoFocus
        label="variable value"
        value={value}
        InputProps={InputProps}
        onChange={e => onChange('Key', e.target.value)}
      />
    </Collapse>
    <Collapse orientation="horizontal" in={on}>
      <TextField 
        {...textBoxProps}
        {...props}
        label="variable name"
        placeholder="Variable name"
        autoFocus
        value={name}
        InputProps={InputProps}
        onBlur={() => !noCode && onChange('PropName', camelize(name))}
        onChange={e => onChange('PropName', e.target.value)}
      />
    </Collapse>
  </>
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export const TextBox = ({onChange, onEnter, ...props}) => {
  const [value, setValue] = React.useState(props.value);
  const change = e => {
    setValue(e.target.value);
    onChange(e.target.value);
  }
  return (<TextField   
    size="small"
    autoFocus
    {...props} 
    value={value}
    onKeyUp={(e) => e.keyCode === 13 && onEnter(value)}
    onChange={change}
    />)
}


export const textBoxProps = {
  autoComplete: "off", 
  size: "small", 
  sx: { ml: 2, mt: 0.75}
}

export {
  ActionsMenu,
  VariableInput,
  Flex,
  Frame,
  Panel,
  QueryMenu,
  ReallyButton,
  SimpleMenu,
  Spacer,
  PreviewBox,
  FileUploader,
  LilBit,
  CodeDialog,
  controlCodeDialog, 
  useCodeDialog
}