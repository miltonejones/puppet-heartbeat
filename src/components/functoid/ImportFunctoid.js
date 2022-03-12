import React from 'react'; 
import JestCard from '../JestCard';
import ChipGroup from '../ChipGroup';
import { Panel, Flex } from '../Control';


import { Box, TextField, Stack, Typography, Button, Card } from '@mui/material';


export default function ImportFunctoid ({ onSave }) {
    const [state, setState] = React.useState({type: ''});
    const options = ['jest', 'cypress', 'java'];
    const { type } = state;

    const save = (datum) => { 
      const { steps } = Object.values(datum)[0] 
      onSave(steps);
      setState({type: null})
    }

    return <>
    
      <Flex sx={{gap: 1, mr: 2}} justify={!!type ? 'end' : 'center'}>     
        <ChipGroup label="from" 
            options={options} 
            value={type} 
            setValue={t => setState(s => ({...s, type: t}))} />
      </Flex>
    
      {/* jest import card */}
      <Panel style={{minWidth: 600}} on={!!type} header="Import Jest Code">
         <Box sx={{width: '100%', p: 1}}>
          <JestCard 
              onCancel={() => setState(s => ({...s, type: null}))}
              onSave={save}/>
         </Box>
      </Panel>

    </>
}



