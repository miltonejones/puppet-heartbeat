import React from 'react'; 
import { Functoid } from './functoid'
import ChipGroup from './ChipGroup';
import { ReallyButton, SimpleMenu, Spacer, Flex, Panel } from './Control';
import { DeleteForever, MoreVert, Add, Edit , Close }  from '@mui/icons-material';
import { saveTestSuite, uniqueId } from '../connector/puppetConnector'

import { 
    Box, 
    Autocomplete, 
    TextField, 
    Stack, 
    Typography, 
    Collapse,
    Chip, 
    Button, 
    Switch } from '@mui/material';


export default function CreateTestForm ({  
    existingTests,
    getSteps, 
    setSteps,
    testName,
    setTestName,
    addStep
    }) { 
    const [state, setState] = React.useState({ 
        basedOn: null, 
        startOn: true 
    });
    const { basedOn, testBase, startOn, startURL, description } = state;
    const testList = existingTests.map(e => ({label: e}))
    const sx = {width: '60vw', m: 2};
    
    const  saveTest = async () => {
      let addedSteps = [];
      if (startURL && startOn) { 
        addedSteps = addedSteps.concat([{
          URL: startURL,
          action: 'navigate'
        }]);
      }
      if (testBase && basedOn) {
        const moreSteps = getSteps(testBase);
        addedSteps = addedSteps.concat(moreSteps);
      }

      const test = {
        testName,
        description,
        steps: addedSteps
        .filter(f => !f.edit)
        .concat({edit: true, ID: uniqueId() } )
      }
      const suiteID = await saveTestSuite(test);
      window.location.href = `/edit/${suiteID}` 
    }

    return <>
     <Panel on={true} header="Test Information" sx={{maxWidth: '60vw'}}>

     <Stack  sx={sx}>
       
     <Typography variant="subtitle1">Name your test</Typography>
        <Typography variant="caption">Enter a name that describes the purpose of your test.</Typography>
       
        <Flex sx={{mt: 1, mb: 2}}>
          <TextField 
            sx={{width: 700}}
            autoFocus  
            size="small"
            autoComplete="off"
            placeholder="Enter a name for your test" 
            label="name of the test" 
            value={testName} 
            onChange={e => setTestName(e.target.value)} />
        </Flex>
  
        {/* start URL option */}
        <Box sx={{ mb: 2}}>
          <Flex>
            <Switch
              disabled={basedOn}
              checked={startOn}
              onChange={e => setState(s => ({...s, startOn: e.target.checked}))}
              inputProps={{ 'aria-label': 'controlled' }}
              />
            <Typography variant="subtitle1">Start URL</Typography>
          </Flex> 
          <Typography variant="caption">Add the URL your test will start with.</Typography>
          <Collapse in={startOn}>
            <Flex sx={{mt: 1}}>
              <TextField 
                disabled={basedOn}
                autoComplete="off"
                sx={{width: 700}} 
                size="small"
                placeholder="Enter a starting URL for your test" 
                label="address the test will start with" 
                value={startURL} 
                onChange={e => setState(s => ({ ...s, startURL: e.target.value }))} />
            </Flex>
        </Collapse>
        </Box>


        <Typography variant="subtitle1">Description (optional)</Typography>
        <Typography variant="caption">Add a short description to explain the test to your future self.</Typography>
       
        <Flex sx={{mt: 1, mb: 2}}>
          <TextField 
            sx={{width: 700}} 
            multiline
            rows={3}
            size="small"
            autoComplete="off"
            placeholder="Enter a test description" 
            label="describe me" 
            value={description}  
            onChange={e => setState(s => ({...s, description: e.target.checked}))}
             />
        </Flex>


        {/* import test option */}
        <Flex>
          <Switch
            disabled={startOn}
            checked={basedOn}
            onChange={e => setState(s => ({...s, basedOn: e.target.checked}))}
            inputProps={{ 'aria-label': 'controlled' }}
            />
          <Typography variant="subtitle1">Import Steps</Typography>
        </Flex> 
        <Typography variant="caption">Add steps from another test in the library.</Typography>
        <Collapse in={basedOn}>
          <Flex sx={{mt: 1, mb: 2}}>
              <Autocomplete
                  disabled={startOn}
                  sx={{width: 700}}
                  size="small" 
                  disablePortal
                  onChange={(e, n) => setState(s => ({ ...s, testBase: n.label }))}   
                  id="combo-box-demo"
                  options={testList} 
                  renderInput={(params) => <TextField {...params} label="Import Steps" />}
                  />
          </Flex> 
       </Collapse>


      </Stack>

     </Panel>
      <Flex sx={sx}>
          <Spacer />
        <Box sx={{mr: 1}}>
          <Button sx={{mr: 1}} variant="outlined" href="/">cancel</Button>
          <Button sx={{mr: 1}} disabled={!testName} variant="contained" onClick={saveTest}>create test</Button>
        </Box>
      </Flex>
    </>
}