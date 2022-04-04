import React from 'react'; 
import { Panel, ActionsMenu, Flex, Spacer, ReallyButton } from '../Control';
import { Box, 
  FormControlLabel,
  TextField,  
  Typography, 
  Button, 
  Grid, 
  Alert, 
  Chip, 
  Switch ,
  Divider
} from '@mui/material';
import { Add, DeleteForever, Terminal }  from '@mui/icons-material';


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


export default function ScriptFunctoid ({ 
  variables, 
  value = createSampleCode(0), 
  label = 'Execute this suave new script', 
  properties = [], 
  cyscript, 
  edit, 
  onSave  ,
  onCancel
}) {
  const [state, setState] = React.useState({
    Value:  value, 
    Label: label, 
    cypressJS: false,
    Cyscript: cyscript,
    Properties: properties
  });
  
  const { Label, Properties, Value, error, cypressJS, Cyscript } = state;

  const save = () => {
    const step = {
        action: 'script',
        value: Value,
        cyscript: Cyscript,
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
    const field = cypressJS ? 'Cyscript' : 'Value';
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
    return <Flex>
      <Typography variant="subtitle1"><b>execute script</b>  "<u className="link" onClick={() => alert(value)}>{label}</u>" </Typography>
      <Chip {...puppetProps} />
      {!!cyscript && <Chip {...cypressProps} />}
    </Flex>
  }

  const cypressSwitch = <Switch 
    checked={cypressJS}  
    onChange={e => setState(s => ({...s, cypressJS: !cypressJS, Cyscript: s.Cyscript || createCypressCode(0) })) } />;

  return (<>
  <Grid container spacing={2}>
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
       <FormControlLabel sx={{ ml: 1}} control={cypressSwitch} label="Cypress" />
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
   



      <Grid item xs={12}>
        <TextField
          classes={{input: 'coder', root: 'coder', outlined: 'coder'}}
          fullWidth 
          autoComplete="off"
          multiline
          rows={5}
          size="small"
          value={cypressJS ? Cyscript : Value} 
          onChange={e => setCode(e.target.value) }
          />
      </Grid>
      {!!error && <Grid item xs={12}>
        <Alert severity="error">{error}</Alert>
        </Grid>}

        <Grid item xs={12}>
          <Button disabled={!!error} onClick={save} variant="contained">save script</Button>
        <Button disabled={!!error} sx={{ml: 1}} variant="outlined" onClick={onCancel}>Cancel</Button>
        </Grid>

  </Grid>
  </>)

}