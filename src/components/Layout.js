import React from 'react'; 
import { Frame, Spacer, Flex } from './Control';
import { Box, Divider, Avatar, Typography, TextField , InputAdornment} from '@mui/material';
import { Search }  from '@mui/icons-material';



export default function Layout ({ children, ...props}) {
    return (<>
    
    <Flex className="application-header">
        <Avatar alt="logo" src="/icon.png" sx={{ width: 24, height: 24, mr: 1 }}/>
        <Box className="logo-font bold white" sx={{minWidth: 200}}>
            Puppeteer Studio
        </Box> 
        <Divider variant="inset" orientation="vertical" sx={{ m: 2, height: '65%'}} />
        <TextField
            sx={{mr: 2, ml: 2}}
            classes={{root: 'input-outer'}}
              InputProps={{
              classes: {input: 'input-label'} ,
              startAdornment: (
                <InputAdornment sx={{color: 'beige'}} position="start">
                  <Search />
                </InputAdornment>
              ), 
            }}  
            fullWidth
            size="small" 
            placeholder="Search for tests by name or ARN"
          
        />
        <Flex sx={{minWidth: 200 , color: '#989898'}}>
            <Box className="dot" />
            disconnected
        </Flex>
    </Flex>
    <Frame offset={32} className="application-body">
        {children}
    </Frame>
    <Flex className="application-footer">
      <Spacer />  <Typography variant="caption">Puppeteer Studio. Cut the strings.</Typography>
    </Flex>
    
    </>)
}