import React from 'react'; 
import { Functoid } from './functoid'
import ChipGroup from './ChipGroup';
import CreateTestForm from './CreateTestForm';
import { ReallyButton, SimpleMenu, Spacer, Flex, Panel, ActionsMenu, LilBit } from './Control';
import { DeleteForever, MoreVert, Add, Edit , Close }  from '@mui/icons-material';

import { Box, IconButton, Tab, Tabs, TextField, Stack, Typography, Autocomplete, Button, Divider } from '@mui/material';

const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function PuppetLConfigForm ({
  onSave: onFormSave, 
  onCancel: cancelClick, 
  previewTest, 
  execTest,
  puppetML, 
  getSteps, 
  existingTests,
  queryElements,
  editingTest,
  showPanel
}) {
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

  // add a blank step to the end of the array
	const addStep = () => 	setSteps(s => s.filter(e => !e.edit).concat( {edit: true, ID: uniqueId() } ));

  const onDelete = (i) => {
    const out = [];
    steps.map((f, k) => {
      if (k !== i) {
        out.push(f)
      }
    } ) ;
    setSteps(out);
  }

  const editStep = p => { 
		setSteps(s => s.map((e, k) => k !== p ? e : {...e, edit: !e.edit}));
  }

	const onCreate = (step, i, imported) => {
    if (imported) {
      // alert (JSON.stringify(step, 0, 2))
      setSteps(s => s
        .concat(step.map(s => ({...s, imported})))
        .filter(f => !f.edit));
      addStep()
      return 
    }
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

  const variables = steps
      ?.filter(s => !!s.actionKey)
      .map(s => s.actionKey);

  const Menu = LilBit(['RUN', 'PREVIEW', 'EDIT', 'CLOSE']);
  const menuActions = [
    () => execTest (testName),
    () => previewTest(testName, steps),
    () => onCancel(),
    () => onCancel()
  ];

  const panelButtons = [
    <ActionsMenu 
      onClick={o => menuActions[o]()} 
      options={['Run', 'Preview', 'Edit', 'Close']} 
      disabledBits={ Menu.EDIT } />,
    <IconButton onClick={onCancel}><Close /></IconButton>
  ];

  const importTest = name => {
    const addedSteps = getSteps(name);
    setSteps (s => s.filter(e => !e.edit).concat(addedSteps))
  };

  const testList = existingTests.map(e => ({label: e}));
  const autoComplete = <Autocomplete 
      sx={{ width: 500, mt: 1 }}
      size="small" 
      disablePortal
      onChange={(e, n) => importTest (n.label)}   
      id="combo-box-demo"
      options={testList} 
      renderInput={(params) => <TextField {...params} label="Import steps from another test" />}
    />

  const panelHeader = <>
    <Stack>
      <Typography variant="h6">
        Steps in  "{testName}"
      </Typography>
      {autoComplete}
    </Stack>
  </>

  const createFormProps = {
    existingTests,
    getSteps, 
    setSteps,
    testName,
    setTestName,
    addStep
  };

  return <>

    {!steps.length && !editingTest && ( <CreateTestForm {...createFormProps} />)}


    <Panel on={showPanel && !!testName} header={panelHeader} tools={panelButtons}>

      {!!steps.length && ( 
        <Tabs sx={{m: 2}} value={value} onChange={handleChange}  >
          <Tab label="Steps" />
          <Tab label="PuppetML" />
          <Tab label="PuppetL" />
        </Tabs>)}

        {value === 0 && (
        <Box m={2}>
          {steps.map((step, o) => <StepEdit 
            queryElements={queryElements} 
            previewTest={() => previewTest(testName, steps)}
            onDelete={onDelete} 
            key={step.ID} 
            index={o} 
            step={step} 
            editStep={p => editStep(p)}
            variables={variables}
            onSave={onCreate}/>)}
        </Box>)}

        {value === 1 && (
        <Box m={1}>
          <fieldset>
            <legend>browser puppetML</legend>
            <pre>
              {JSON.stringify(steps, 0, 2)}
            </pre>
          </fieldset> 
        </Box>)}

        {value === 2 && (
        <Box m={1}>   
          <fieldset>
            <legend>primitive puppetL</legend>
            <pre>
              {JSON.stringify(transformed, 0, 2)}
            </pre>
          </fieldset>
        </Box>
      )}
      
    {!!steps.length &&( <Box mb={12} className="flex">
        <Spacer /> 
        <Button sx={{mr: 1}} variant="outlined" onClick={onCancel}>cancel</Button>
        <Button sx={{mr: 1}} variant="contained" onClick={onAdd}>{!!puppetML?'save':'add'} test</Button>
      </Box>)}
    </Panel>
  </>
}
 
function StepEdit ({ 
  // step object being evaluated
  step, 
  // method to call when step is saved
  onSave, 
  // ordinal of the step in the step array
  index, 
  // elements returned from the query service
  queryElements, 
  // method to call the query service
  previewTest, 
  // method to call when step is deleted
  onDelete,
  // any variables declared by previous steps
  variables,
  editStep
}) {

	const { edit, action, imported } = step;
	const [type, setType] = React.useState(action)
 
  const visibleFunctoids = Object.keys(Functoid)
    .filter(f => !!Functoid[f].action);

  const actions = visibleFunctoids
    .map(f => Functoid[f].action);

  const icons = visibleFunctoids
    .map(f => {
      const Ico = Functoid[f].Icon;
      return <Ico sx={{pl: 1}} />
    });

	const Key = Object.keys(Functoid).find(f => Functoid[f].action === type);
 
	const { Component, Icon, action: functoidAction } = Functoid[Key] ?? (!!imported ? Functoid.Imported : {});

  const componentProps = {
    ...step,
    variables,
    previewTest,
    primitiveKey: step.key,
    queryElements,
    onSave: q => onSave(q, index, Key === 'Import')
  }

	return (
    <Stack>
      <Box className="flex center underline" sx={{gap: '1rem', p: 1}}>

        {!imported && <ChipGroup icons={icons} label={!type?'Select action':"Action"} options={actions} setValue={setType} value={type} />}

        {!!Component && (
        <Flex className="no-wrap" sx={{width: '100%'}}>
          {!imported && !!functoidAction && <>
            <Icon sx={{mr: 1}}/> 
            <ReallyButton icon={<DeleteForever />} onYes={() => onDelete(index)} />
           {!step.edit && <IconButton  onClick={() => { 
                editStep && editStep(index) 
              }} >
              <Edit />
            </IconButton>}
          </>}
          <Component {...componentProps}   /> 
        </Flex>)} 
      </Box> 
    </Stack>
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