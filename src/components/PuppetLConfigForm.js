import React from 'react'; 
import { Functoid } from './functoid'
import ChipGroup from './ChipGroup';
import { ReallyButton, SimpleMenu } from './Control';
import { DeleteForever, MoreVert }  from '@mui/icons-material';

import { Box, Tab, Tabs,  TextField, Stack, Typography, Button, Divider } from '@mui/material';

const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function PuppetLConfigForm ({onSave: onFormSave, onCancel: cancelClick, puppetML, getSteps, existingTests}) {
  const [steps, setSteps] = React.useState([])
  const [testName, setTestName] = React.useState('')
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
   
    !!puppetML?.testName 
      && puppetML.testName !== testName 
      && (() => { 
        setTestName(puppetML.testName);
        setSteps(puppetML.steps.map(s => {
          s.ID = s.ID || uniqueId();
          return s;
        }))
    })()
  }, [puppetML, testName])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

	const addStep = () => 	setSteps(s => s.concat({edit: true, ID: uniqueId() }));

  const onDelete = (i) => {
    const out = [];
    steps.map((f, k) => {
      if (k !== i) {
        out.push(f)
      }
    } ) ;
    setSteps(out);
  }

	const onCreate = (step, i) => {
		setSteps(s => s.map((e, k) => k == i ? step : e));
		addStep()
	}

  const onAdd = () => {
    const testObj = {
      suiteID: puppetML?.suiteID,
      testName,
      steps
    }; 
    setSteps([]);
    setTestName(null);
    onFormSave (testObj);
  }
  const onCancel = () => { 
    setSteps([]);
    setTestName(null);
    cancelClick()
  }
  const transformed = ((out) => {
    steps.filter(f => !!f.action).map (s => out = out.concat(transform(s)))
    return out;
  })([])
  return <>

    {!steps.length && (<>
      <Stack spacing={2} sx={{maxWidth: 500, m: 2}}>
      <Typography> Name your test:</Typography>


      <Box className="flex center">

      <TextField autoFocus 
        size="small"
        placeholder="Enter a name for your test" label="Test Name" 
        value={testName} 
        onChange={e => setTestName(e.target.value)} />
      
      <SimpleMenu disabled={!testName} onClick={i => {
        const spec = existingTests[i];
        const tst = getSteps(spec);
        setSteps(tst.slice(0)); 
      }} options={existingTests} label={!testName?'':`Import test for ${testName}`} icon={<MoreVert />} />
      </Box>

      <Box>
        <Button sx={{mr: 1}} variant="outlined" onClick={onCancel}>cancel</Button>
        <Button sx={{mr: 1}}  variant="contained" onClick={addStep}>create</Button>
      </Box>
      </Stack>
    </>)}

    {!!testName && !!steps.length && <Stack sx={{m: 2}}>
    <Typography sx={{mt: 1, ml: 2}} variant="h6">
        Steps in  "{testName}"
      </Typography>
      
   {!!puppetML.suiteID &&( <Typography sx={{mb: 1, ml: 2}}  variant="caption">
        <b>Test ID:</b> {puppetML.suiteID}  
      </Typography>)}
      
    </Stack>}
    <Divider sx={{mb: 2, mt: 2}}/>

    <Tabs sx={{m: 2}} value={value} onChange={handleChange}  >
        <Tab label="Steps" />
        <Tab label="PuppetML" />
        <Tab label="PuppetL" />
      </Tabs>

      {value === 0 && <Box m={2}>
      {steps.map((step, o) => <StepEdit onDelete={onDelete} key={step.ID} index={o} step={step} onSave={onCreate}/>)}
    </Box>}

    {value === 1 && <Box mb={1}>
            <fieldset>
      <legend>JSON</legend>
      <pre>
        {JSON.stringify(steps, 0, 2)}
      </pre>
    </fieldset> 
    </Box>}

    {value === 2 && <Box mb={1}>
            
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
     <Button sx={{mr: 1}} variant="contained" onClick={onAdd}>{!!puppetML?'save':'add'} test</Button>
    </Box>)}
          


    </>
}

 

function StepEdit ({ step, onSave, index, onDelete }) {
	const { edit, action } = step;
	const [type, setType] = React.useState(action)
 
  const actions = Object.keys(Functoid).map(f => Functoid[f].action);
	const Key = Object.keys(Functoid).find(f => Functoid[f].action === type);
	const { Component, Icon } = Functoid[Key] ?? {};
	return (<Box className="flex center underline" sx={{gap: '1rem', p: 1}}>

	<ChipGroup label={!type?'Select action':"Action"} options={actions} setValue={setType} value={type} />

	{!!Component && (<Box className="flex center">
		<Icon sx={{mr: 1}}/>
    <ReallyButton icon={<DeleteForever />} onYes={() => onDelete(index)} />
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
    case 'upload':
        label = `upload ${step.path} using ${step.actionKey}`;
        return [
          { 
            "action": "lookup-by-" + step.by,
            "key": step.actionKey, 
          },
          {
            label,
            action: 'upload',
            path: step.path,
            key: step.actionKey, 
          }
        ];
        break;
    default:
      return [step]
  }
}