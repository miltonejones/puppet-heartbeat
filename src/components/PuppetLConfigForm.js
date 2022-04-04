import React from 'react'; 
import { Functoid } from './functoid'
import ChipGroup from './ChipGroup';
import CreateTestForm from './CreateTestForm';
import { ReallyButton, SimpleMenu, Spacer, Flex, Panel, ActionsMenu, LilBit } from './Control';
import { DeleteForever, MoreVert, Add, Edit, Lock , Close }  from '@mui/icons-material';
import JsonContent from './JsonColor';
import { Alert, Box, IconButton, Tab, Tabs, TextField, Stack, Typography, Autocomplete, Button, Chip } from '@mui/material';

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
  Prompt,
  showPanel
}) {
  const [dirty, setDirty] = React.useState(false)
  const [steps, setSteps] = React.useState([])
  const [testName, setTestName] = React.useState('')
  const [value, setValue] = React.useState(0);
  const [editMode, setEditMode] = React.useState(0);

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
	const addStep = () => {	
    setSteps(s => s.filter(e => !e.edit).concat( {edit: true, ID: uniqueId() } ))
    setDirty(true);
  };

  const onDelete = (i) => {
    const out = [];
    steps.map((f, k) => {
      if (f.ID !== i) {
        out.push(f)
      }
    } ) ;

    setDirty(true);
    setSteps(out);
  }

  const editStep = p => { 
		setSteps(s => s.map((e, k) => e.ID !== p ? e : {...e, edit: !e.edit}));
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
		setSteps(s => s.map((e, k) => e.ID === i ? step : e));
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
    setDirty(false);
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
      .map(s => s.propName || s.actionKey);

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
    // give each added step its own ID
    const addedSteps = getSteps(name)
            .map(s => ({...s, ID: uniqueId()})); 
    setSteps (s => s
          .filter(e => !e.edit)
          .concat(addedSteps))
  };

  const testList = existingTests.map(e => ({
      label: e.testName, 
      length: e.steps.length,
      module: !e.steps.find(f => f.action === 'navigate')
    })).sort((a,b)=>a.label>b.label?1:-1);
  const elementRender = (props, option) => (
    <Stack {...props} sx={{pl:1}} className={option.head?"underline gray":"underline menu-item"}>
      <Typography className={option.head?'bold':''}variant="subtitle1">{option.label}</Typography>
      {!option.head && <Typography variant="caption">{option.length} steps {option.module && <em> - Module</em>}</Typography>}
    </Stack>
  );
  const autoComplete = <Autocomplete 
      sx={{ width: 500, mt: 1 }}
      size="small" 
      disablePortal
      onChange={(e, n) => importTest (n.label)}   
      id="combo-box-demo"
      options={[
        { label: 'Modules', head: 1 },
        ...testList.filter(f => f.module),
        { label: 'Tests', head: 1 },
        ...testList.filter(f => !f.module)
      ]} 
      renderOption={elementRender}
      renderInput={(params) => <TextField {...params} label="Import steps from another test" />}
    />

  const panelHeader = <>
    <Stack>
      <Typography variant="h6">
        Steps in  <u className="link" onClick={async () => {
          const name = await Prompt('Enter a new name for' + testName, testName, 'Change name')
          setTestName(name || testName)
        }}>"{testName}"</u>
      </Typography>
      {autoComplete}
    </Stack>
  </>

  const createFormProps = {
    existingTests: existingTests.map(f => f.testName),
    getSteps, 
    setSteps,
    testName,
    setTestName,
    addStep
  };

  const moveNode = (index, advance) => { 
    const node = steps[index] 
    setSteps([
      ...steps.slice(0, index + advance).filter(o=>o.ID!==node.ID), 
      node, 
      ...steps.slice(index + advance).filter(o=>o.ID!==node.ID)
    ]); 
  }

  const duplicateNode = (node, index) => {  
    const dupeNode =  { 
      ...node,  
      edit: !0, 
      ID: uniqueId(), 
      propName: null, 
      actionKey: null,
      value: null  
    };
    setSteps([
      ...steps.slice(0, index + 1), 
     dupeNode, 
      ...steps.slice(index + 1)
    ]); 
  }

  return <>

    {!steps.length && !editingTest && ( <CreateTestForm {...createFormProps} />)}


    <Panel on={showPanel && !!testName} header={panelHeader} tools={panelButtons}>
      {!!dirty && <Alert severity="warning">You must click Save for your changes to take effect.</Alert>}
      {!!steps.length && ( 
        <Tabs sx={{m: 2}} value={value} onChange={handleChange}  >
          <Tab label="Steps" />
          <Tab label="PuppetML" />
          <Tab label="PuppetL" />
        </Tabs>)}

        {value === 0 && (
        <Box m={2}>
          {steps.map((step, o) => <StepRow 
            queryElements={queryElements} 
            previewTest={() => previewTest(testName, steps)}
            editStep={p => editStep(p)}
            variables={variables}

            onDelete={onDelete} 
            onSave={onCreate}
            duplicateNode={duplicateNode}
            moveNode={moveNode}

            lastStep={o > (steps.length - 3)}
            key={step.ID} 
            index={o} 
            step={step} 
            
            />)}
        </Box>)}

        {value === 1 && (
        <Box m={1}>
          <fieldset>
            <legend>browser puppetML <IconButton onClick={() => setEditMode(!editMode)}><Edit /></IconButton></legend>
            <JsonContent setValue={v => {
              setSteps(v);
              setEditMode(false);
            }} editMode={editMode} >
              {JSON.stringify(steps, 0, 2)}
            </JsonContent>
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


function StepRow (props) {
  const [edit, setEdit] = React.useState(false)
  const { action, label, steps } = props.step;  
  const args = {
    sx: {ml: 1, mr: 1, minWidth: 96},
    size: 'small',
    color: 'info' ,
    label: 'module'
  }
  const prefix = <>
  <IconButton><Lock /></IconButton>
  <Typography variant="caption">Import:</Typography> 
</>
  if (action === 'module') {
    return <>
    <Flex className="underline" sx={{ p: 1}}>
      {prefix}
      <Chip {...args} />
      <Typography>{label}</Typography>
      <Button variant="contained" onClick={() => setEdit(!edit)}>Customize</Button>
    </Flex>

    {/* trying to add step-modules, not working so good */}
    {edit && steps.map((step, o) => <StepEdit 
            {...props}
            key={step.ID} 
            index={o} 
            step={step}  />)}
    </>
  }
  return <StepEdit {...props} />
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
  // method to copy the current step
  duplicateNode,
  // method to move the current step
  moveNode,
  // method to toggle edit mode on current step
  editStep,
  lastStep
}) {

	const { edit, action, imported, ID } = step;
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
    onSave: q => onSave(q, ID, Key === 'Import'),
    onCancel: _ => editStep(ID)
  }

  // menu stuff
  const Move = LilBit(['UP', 'DOWN']);
  let moveDisabled = 0;
  if (index < 1) moveDisabled += Move.UP;
  if (lastStep) moveDisabled += Move.DOWN;
  const options = ['move up', 'move down', 'duplicate'];
  const methods = [
    () => moveNode (index, -1),
    () => moveNode (index, 2),
    () => duplicateNode(step, index)
  ]
	return (
    <Stack>
      <Box className="flex center underline" sx={{gap: '1rem', p: 1}}>

        {!imported && <ChipGroup icons={icons} label={!type?'Select action':"Action"} options={actions} setValue={setType} value={type} />}

        {!!Component && (
        <Flex className="no-wrap" sx={{width: '100%'}}>
          {!imported && !!functoidAction && <>
            <Icon sx={{mr: 1}}/> 
            <ReallyButton icon={<DeleteForever />} onYes={() => onDelete(ID)} />
             {!step.edit && <IconButton  onClick={() => { 
                editStep && editStep(ID) 
              }} >
              <Edit />
            </IconButton>}
          </>}
          <Component {...componentProps}   /> 
          {!step.edit && <>
            <Spacer />
            <SimpleMenu disabledBits={moveDisabled} onClick={i => methods[i]()} options={options} icon={<MoreVert />} />
          </>}
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
        ? `${step.event} ${step.propName || step.actionKey} `
        : `${step.event} ${step.propName || step.actionKey} to ${step.value}`
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
        ? `TEST: Is "${step.propName || step.actionKey}" in the document `
        : `TEST: Does "${step.propName || step.actionKey}.value" equal ${value} `
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
        label = `upload ${step.path} using ${step.propName || step.actionKey}`;
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
      return [{...step, key: step.key || step.actionKey}]
  }
}