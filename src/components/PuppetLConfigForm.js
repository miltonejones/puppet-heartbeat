import React from 'react'; 
import { Functoid } from './functoid'
import ChipGroup from './ChipGroup';

import { Box, Tab, Tabs,  TextField, Stack, Typography, Button, Divider } from '@mui/material';

export default function PuppetLConfigForm ({onSave, onCancel, puppetML}) {
  const [steps, setSteps] = React.useState(puppetML?.steps || [])
  const [testName, setTestName] = React.useState('')
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    !!puppetML && puppetML.testName !== testName && (() => {
      setTestName(puppetML.testName);
      setSteps(puppetML.steps)
    })()
  }, [puppetML, testName])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

	const addStep = () => 	setSteps(s => s.concat({edit: true}));
	const onCreate = (step, i) => {
		setSteps(s => s.map((e, k) => k == i ? step : e));
		addStep()
	}
  const onAdd = () => {
    const testObj = {
      testName,
      steps
    }; 
    onSave (testObj)
  }
  const transformed = ((out) => {
    steps.filter(f => !!f.action).map (s => out = out.concat(transform(s)))
    return out;
  })([])
  return <>

    {!steps.length && (<>
      <Stack spacing={2} sx={{maxWidth: 500}}>
      <Typography> Name your test:</Typography>
      <TextField autoFocus 
        placeholder="Enter a name for your test" label="Test Name" 
        value={testName} 
        onChange={e => setTestName(e.target.value)} />
      
      <Box>
        <Button sx={{mr: 1}} variant="outlined" onClick={onCancel}>cancel</Button>
        <Button sx={{mr: 1}}  variant="contained" onClick={addStep}>create</Button>
      </Box>
      </Stack>
    </>)}

    {!!testName && !!steps.length && <Stack>
    <Typography sx={{mt: 1, ml: 2}} variant="h6">
        Tests in  "{testName}"
      </Typography>
      
    {/* <Typography sx={{mb: 1, ml: 2}}  variant="subtitle1">
        {execRunning ? 'Please wait while the test completes...' : 'Click Run to start the test'}
      </Typography> */}
      
    </Stack>}
    <Divider sx={{mb: 2, mt: 2}}/>

    <Tabs value={value} onChange={handleChange}  >
        <Tab label="Steps" />
        <Tab label="PuppetL" />
      </Tabs>

      {value === 0 && <Box mb={1}>
      {steps.map((step,o) => <StepEdit key={o} index={o} step={step} onSave={onCreate}/>)}
    </Box>}

    {value === 1 && <Box mb={1}>
            <fieldset>
      <legend>JSON</legend>
      <pre>
        {JSON.stringify(steps, 0, 2)}
      </pre>
    </fieldset>
    <fieldset>
      <legend>transformed</legend>
      <pre>
        {JSON.stringify(transformed, 0, 2)}
      </pre>
    </fieldset>
    </Box>}


   {!!steps.length &&( <Box mb={12} className="flex">
      <Box sx={{flexGrow: 1}} />
     <Button sx={{mr: 1}} variant="outlined" onClick={onCancel}>cancel</Button>
     <Button sx={{mr: 1}} variant="contained" onClick={onAdd}>add test</Button>
    </Box>)}
          


    </>
}

const actions = [
  'navigate',
	'event',
	'expect'
]

function StepEdit ({ step, onSave, index }) {
	const { edit, action } = step;
	const [type, setType] = React.useState(action)
 
	const Key = Object.keys(Functoid).find(f => Functoid[f].action === type);
	const { Component, Icon } = Functoid[Key] ?? {};
	return (<Box className="flex center underline" sx={{gap: '1rem', p: 1}}>

	<ChipGroup label={!type?'Select action':"Action"} options={actions} setValue={setType} value={type} />

	{!!Component && (<Box className="flex center">
		<Icon sx={{mr: 1}}/>
		<Component {...step} onSave={ v => onSave(v, index) } />
		</Box>)}
		
		
		</Box>
		
	)
}

export const transform = step => {
  let label;
  switch (step.action) {
    case 'navigate':
      return [{...step, label: `Navigate to ${step.URL}`}];
      break;
    case 'event':
      label = !step.value
        ? `${step.event} ${step.actionKey} `
        : `${step.event} ${step.actionKey} to ${step.value}`
      return [
        { 
          "action": "lookup-by-" + step.by,
          "key": step.actionKey 
        },
        {
          label,
          "object": { 
            "key":  step.actionKey, 
            "value": step.value,
          },
          "action": step.event, 
          "value": step.value,
          "photo": true
        }
      ];
      break;
    case 'expect':
      label = !step.fact.value
        ? `TEST: Is "${step.actionKey}" in the document `
        : `TEST: Does "${step.actionKey}.value" equal ${value} `
      return [
        { 
          "action": "lookup-by-" + step.by,
          "key": step.actionKey, 
        },
        {
          label,
          fact: { 
            "key":  step.actionKey, 
            "value": step.fact.value,
          },
          "action": "exists",
          "value": step.fact.value,
          "photo": true
        }
      ];
      break;
    default:
      return [step]
  }
}