import React from 'react'; 
import { Panel, ActionsMenu, Flex, Spacer, SaveCancel, ReallyButton } from '../Control';
import { Box, 
  FormControlLabel,
  TextField,  
  Typography, 
  Button, 
  Grid, 
  Alert, 
  Chip, 
  Switch ,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Add, DeleteForever, Terminal }  from '@mui/icons-material';

const ScriptType = {
  PUPPET: 0,
  CYPRESS: 1,
  JQUERY: 2
}


const createSampleCode = args => {
  const argNames = [];
  for (let i=0; i++ < args ; argNames.push(`arg${i}`));
  const suffix = !!argNames.length ? `, ${argNames.join(', ')}` : ''
  const action = !!argNames.length ? `\n  await page.click(arg1);` : ''
  return `async (page${suffix}) => {
  // TODO: overwrite sample code
  await page.waitForTimeout(100);${action}
}`;
}; 

const createCypressCode = args => {
  const argNames = [];
  for (let i=0; i++ < args ; argNames.push(`arg${i}`));
  const suffix = !!argNames.length ? `, ${argNames.join(', ')}` : ''
  const action = !!argNames.length ? `\n  cy.get(arg1).click();` : ''
  return `(cy${suffix}) => {
  // TODO: overwrite sample code
  cy.wait(100);${action}
}`;
}; 

const createJQueryCode = args => {
  const argNames = [];
  for (let i=0; i++ < args ; argNames.push(`arg${i}`));
  const suffix = !!argNames.length ? `, ${argNames.join(', ')}` : ''
  const action = !!argNames.length ? `\n  $(arg1).trigger("click");` : ''
  return `async (page${suffix}) => {
  // TODO: overwrite sample code
  await page.waitForTimeout(100);${action}
}`;
}; 


export default function ScriptFunctoid ({ 
  variables, 
  value = createSampleCode(0), 
  label = 'Execute this suave new script', 
  properties = [], 
  cyscript, 
  jqscript, 
  edit, 
  onSave  ,
  onCancel
}) {
  const [state, setState] = React.useState({
    Value:  value, 
    Label: label, 
    scriptType: ScriptType.PUPPET, 
    Cyscript: cyscript,
    Jqscript: jqscript,
    Properties: properties
  });
  
  const { Label, Properties, Value, error, scriptType, Jqscript, Cyscript } = state;

  const handleChange = (event, type) => {
    const empty = [createSampleCode(0), createCypressCode(0), createJQueryCode(0)]
    const field = ['Value', 'Cyscript', 'Jqscript'][type];  
    const value = state[field];
    const code = value || empty[type]
    setState(s => ({...s, scriptType: type, [field]: code }));
  };

  const save = () => {
    const step = {
        action: 'script',
        value: Value,
        cyscript: Cyscript,
        jqscript: Jqscript,
        properties: Properties,
        label: Label
    }
    onSave(step)
}

  const addProp = name => {
    const newProps = Properties.concat(name); 
    setState(s => ({
      ...s, 
      Properties: newProps, 
      Value: createSampleCode(newProps.length)
    }))
  }
  
  const dropProp = name => {
    const newProps = Properties.filter(f => f !== name); 
    setState(s => ({
      ...s, 
      Properties: newProps, 
      Value: createSampleCode(newProps.length)
    }))
  }
  
  const shownProps =  Array.from(new Set(variables))
          .filter(v => Properties.every(x => x !== v));

  const setCode = v => { 
    const field = ['Value', 'Cyscript', 'Jqscript'][scriptType];  
    try {
      setState(s => ({...s, [field]: v, error: null}))
      eval(v);
    } catch (error) {
      setState(s => ({...s, error: error.message}))
    }
  }

  if (!edit) {
    const puppetProps = {
      icon: <Terminal />,
      size: 'small',
      variant: 'contained',
      color: 'error',
      sx: {ml: 2},
      label: 'Puppeteer',
      onClick: () => alert(value)
    }
    const cypressProps = {
      ...puppetProps,
      label: 'Cypress',
      color: 'info',
      onClick: () => alert(cyscript)
    }
    const jqueryProps = {
      ...puppetProps,
      label: 'JQuery',
      color: 'success',
      onClick: () => alert(jqscript)
    }
    return <Flex>
      <Typography variant="subtitle1"><b>execute script</b>  "<u className="link" onClick={() => alert(value)}>{label}</u>" </Typography>
      <Chip {...puppetProps} />
      {!!cyscript && <Chip {...cypressProps} />}
      {!!jqscript && <Chip {...jqueryProps} />}
    </Flex>
  }
 
  return (<>
  <Grid container spacing={2}  sx={{maxWidth: 768}}>
    <Grid item xs={8}>
      <TextField
        autoComplete="off"
        fullWidth 
        size="small"
        value={Label} 
        onChange={e => setState(s => ({...s, Label: e.target.value})) }
        />
    </Grid>
     <Grid item xs={4}>
       <Flex>
           {!!shownProps.length &&  <ActionsMenu label="arguments" options={shownProps} onClick={i => addProp(shownProps[i])} icon={<Add />} /> }
     
       </Flex>
    </Grid>


    <Panel on={Properties.length} sx={{minWidth: 600, ml: 2}} header="Arguments">
    {Properties.map(arg => (<Grid key={arg} item xs={12}>
      <Flex className="underline" sx={{ p: 1}}>
          
          <Typography variant="caption" sx={{mr: 2}}>argument:</Typography>

         <Box  className="no-wrap"  >
         {arg}
         </Box>
          <Spacer />
          <ReallyButton icon={<DeleteForever />} onYes={() => dropProp(arg)} />
          </Flex>
      </Grid>))}

    </Panel>
   
      <Tabs value={scriptType} onChange={handleChange}  >
        <Tab label="Puppeteer" />
        <Tab label="Cypress" />
        <Tab label="JQuery" />
      </Tabs>


      <Grid item xs={12}>
        <TextField
          classes={{ root: 'code-field mono' }} 
          fullWidth 
          autoComplete="off"
          multiline 
          rows={10}
          size="small"
          value={[Value, Cyscript, Jqscript][scriptType]} 
          onChange={e => setCode(e.target.value) }
          />
      </Grid>
      {!!error && <Grid item xs={12}>
        <Alert severity="error">{error}</Alert>
        </Grid>}

        <Grid item xs={12}>


        <Divider sx={{width: '100%' , m: 1}} />
        <Flex>
          <Spacer />
          <SaveCancel button disabled={!!error} save={save} cancel={onCancel} variant="contained">save script</SaveCancel> 
  
        </Flex>
        </Grid>

  </Grid>
  </>)

}