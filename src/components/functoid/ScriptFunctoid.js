import React from 'react'; 
import { Panel,  SimpleMenu, Flex, Spacer, ReallyButton } from '../Control';
import { Box,TextField, Stack, Typography, Button, Grid, Alert, Chip } from '@mui/material';
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


export default function ScriptFunctoid ({ 
  variables, 
  value = createSampleCode(0), 
  label = 'Execute this suave new script', 
  properties = [], 
  edit, 
  onSave 
}) {
  const [state, setState] = React.useState({
    Value:  value, 
    Label: label, 
    Properties: properties
  });
  
  const { Label, Properties, Value, error } = state;

  const save = () => {
    const step = {
        action: 'script',
        value: Value,
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
    try {
      setState(s => ({...s, Value: v, error: null}))
      eval(v);
    } catch (error) {
      setState(s => ({...s, error: error.message}))
    }
  }

  if (!edit) {
    return <Flex>
      <Typography variant="subtitle1"><b>execute script</b>  "<u className="link" onClick={() => alert(value)}>{label}</u>" </Typography>
      <Chip icon={<Terminal />} size="small" variant="contained" color="error" onClick={() => alert(value)} sx={{ml: 2}} label="View Script" />
    </Flex>
}

  return (<>
  <Grid container spacing={2}>
    <Grid item xs={shownProps.length ? 10 : 12}>
      <TextField
        fullWidth 
        size="small"
        value={Label} 
        onChange={e => setState(s => ({...s, Label: e.target.value})) }
        />
    </Grid>
   {!!shownProps.length && <Grid item xs={2}>
      <SimpleMenu options={shownProps} onClick={i => addProp(shownProps[i])} icon={<Add />} />
    </Grid>}


    {Properties.map(arg => (<Grid key={arg} item xs={12}>
      <Flex className="underline" sx={{ pb: 1}}>
          
          <Typography variant="caption" sx={{mr: 2}}>argument:</Typography>

         <Box  className="no-wrap"  >
         {arg}
         </Box>
          <Spacer />
          <ReallyButton icon={<DeleteForever />} onYes={() => dropProp(arg)} />
          </Flex>
      </Grid>))}

      <Grid item xs={12}>
        <TextField
        classes={{input: 'coder', root: 'coder', outlined: 'coder'}}
          fullWidth 
          multiline
          rows={5}
          size="small"
          value={Value} 
          onChange={e => setCode(e.target.value) }
          />
      </Grid>
      {!!error && <Grid item xs={12}>
        <Alert severity="error">{error}</Alert>
        </Grid>}

        <Grid item xs={12}>
          <Button disabled={!!error} onClick={save} variant="contained">save script</Button>
        </Grid>

  </Grid>
  </>)

}