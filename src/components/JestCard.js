import React from 'react';
import { specimenText } from './Specimen';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Box, Tab, Tabs,  TextField, Stack, Typography, Button, Divider } from '@mui/material';
import { JestPuppeteerAdapter } from '../JestPuppeteerAdapter'
 

const jest = new JestPuppeteerAdapter();
 
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function JestCard ({ onSave, onCancel }) {
  const [puppetSteps, setPuppetSteps] = React.useState(null);
  const [editMode, setEditMode] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // load jest JS if none is present
  if (!puppetSteps || editMode) {
    return <JestForm onClick={js => {
       jest.loadJest(js);
       setPuppetSteps(jest.tests);
       setEditMode(false)
    }} onCancel={onCancel}/>
  }
 
  // display imported steps
  return <> 
    <Typography sx={{mt: 1, ml: 2}} variant="h6">Imported Tests</Typography>
   
    {Object.keys(puppetSteps).map(key => <>

      <Divider textAlign="left" style={{textTransform: 'capitalize', margin: 12}}>{key}</Divider>
      <Tabs value={value} onChange={handleChange}  >
        <Tab label="Steps" />
        <Tab label="PuppetL" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Stepper key={key} mt={5} activeStep={-1} orientation="vertical">
          {puppetSteps[key].steps
          .filter(f => !!f.label)
          .map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <pre>{JSON.stringify(puppetSteps, 0, 2)}</pre>
      </TabPanel>
    </>) } 
    
    <Button sx={{mr: 1}} variant="outlined" onClick={() => {
      setPuppetSteps(null);
      onCancel && onCancel()
    }}>clear</Button>

    <Button sx={{mr: 1}} variant="outlined" onClick={() => {
      setEditMode(s => !s); 
    }}>edit</Button>
    {editMode.toString()}
    <Button variant="contained" onClick={() => { 
      onSave && onSave(puppetSteps)
    }}>save</Button>
  </>
}


function JestForm ( { onClick, onCancel } ) {
  const [value, setValue] = React.useState('')
  return <>
  <Stack mb={2}>
    <Typography mb={2}>Type or paste your Jest test code here:</Typography>
    <TextField
    sx={{maxWidth: 580}}
      multiline 
      rows={10}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  </Stack>
    <Button sx={{mr: 1}} variant="outlined" onClick={() => { 
      onCancel && onCancel()
    }}>cancel</Button>
    
    <Button variant="contained" onClick={() => onClick && onClick(value)}>import</Button>
  </>
}


