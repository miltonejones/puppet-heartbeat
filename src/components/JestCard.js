import React from 'react';
import { specimenText } from './Specimen';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { TextField, Stack, Typography, Button, Divider } from '@mui/material';
import { JestPuppeteerAdapter } from '../JestPuppeteerAdapter'
 

const jest = new JestPuppeteerAdapter();
 
 

export default function JestCard ({ onSave, onCancel }) {
  const [puppetSteps, setPuppetSteps] = React.useState(null);

  // load jest JS if none is present
  if (!puppetSteps) {
    return <JestForm onClick={js => {
       jest.loadJest(js);
       setPuppetSteps(jest.tests);
    }} onCancel={onCancel}/>
  }
 
  // display imported steps
  return <> 
    <Typography variant="h4">Imported Tests</Typography>

    {Object.keys(puppetSteps).map(key => <>

      <Divider textAlign="left" style={{textTransform: 'capitalize', margin: 12}}>{key}</Divider>

      <Stepper key={key} mt={5} activeStep={-1} orientation="vertical">
        {puppetSteps[key].steps
        .filter(f => !!f.label)
        .map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

    </>) } 
    
    <Button sx={{mr: 1}} variant="outlined" onClick={() => {
      setPuppetSteps(null);
      onCancel && onCancel()
    }}>clear</Button>
    
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
      multiline
      fullWidth 
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


