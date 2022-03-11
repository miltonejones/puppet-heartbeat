import React from 'react'; 
import { Frame, Spacer, Flex } from './Control';
import { Box, Divider, Typography, TextField } from '@mui/material';



export default function Layout ({ children, ...props}) {
    return (<>
    
    <Flex className="application-header">
        <Box className="logo-font bold white" sx={{minWidth: 200}}>
            Puppeteer Studio
        </Box> 
        <Divider variant="inset" orientation="vertical" sx={{ m: 2, height: '65%'}} />
        <TextField
            sx={{mr: 2, ml: 2}}
            classes={{root: 'input-outer'}}
              InputProps={{ classes: {input: 'input-label'} }}  
            fullWidth
            size="small" 
            placeholder="Search for tests by name or ARN"
        />
        <Box sx={{minWidth: 200}}>right menu</Box>
    </Flex>
    <Frame offset={32} className="application-body">
        {children}
    </Frame>
    <Flex className="application-footer">
      <Spacer />  <Typography variant="caption">Puppeteer Studio. Cut the strings.</Typography>
    </Flex>
    
    </>)
}