import React from 'react';
import {  getTestSuites } from '../connector/puppetConnector';
import { Panel, Flex, Spacer, ActionsMenu, FileUploader } from './Control';
import {  Sync  }  from '@mui/icons-material';
import { 
  Box,
  Checkbox,
  Button,
  IconButton,
  Breadcrumbs,
  Stack,
  Pagination,
  Typography
} from '@mui/material';
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;

/**
 * Render list of tests from the DB
 */
export default function TestGrid () {
  const [state, setState] = React.useState({ selectedTests: [] })
  const { createdTests, selectedTests, page = 1, updateTime = -1}  = state;

  const collectionAge = Math.round((new Date().getTime() - updateTime) / 1000);
   
  const pageChange = (event, value) => {
    setState(s => ({...s, page: value}));
  };

  const populate = React.useCallback (() => {
    getTestSuites()
      .then(res => setState(oldState => ({
        ...oldState, 
        updateTime: new Date().getTime(),
        createdTests: res.Items
      })));
  }, [createdTests]);

  React.useEffect(() => {
    !createdTests && populate();
  }, [createdTests]);

  // menu stuff ---------------------------------------------------------/
  // create a set of bits to make things prettier
  const MenuBit = ((e) => {
    ['EDIT', 'RUN', 'DELETE'].map((n, i) => e[n] = Math.pow(2, i));
    return e;
  })({});

  // bitmap for disabled items in the menu
  let disabledMenuItems = 0;
  if (!selectedTests?.length) disabledMenuItems += MenuBit.DELETE;
  if (selectedTests?.length !== 1) disabledMenuItems += MenuBit.EDIT + MenuBit.RUN;
  
  // array of functions the menu calls
  const openTest = name => alert ('open ' + name + "!!")
  const menuActions = [
    () => openTest ( selectedTests[0] ),  
    () => openTest ( selectedTests[0] ),  
    () => alert ('new test'),
    () => alert ('Deletes not supported yet'),
  ];

  // add/remove test names from the test array
  const selectTest = (testName) => { 
    const { selectedTests: existingTests } = state;
    const exists = existingTests.some(f => f === testName);
    const selectedTests = exists
      ? existingTests.filter(f => f !== testName)
      : existingTests.concat(testName);
      
      setState(s => ({...s, selectedTests}))
  }
    
  // breadcrumbs/header  
  const breadcrumbs = [
    <Link to="/">Puppeteer Studio</Link>, 
    <em>Tests</em>
  ];

  const header = <Flex align="end">   
      <Box>
        <Breadcrumbs separator="›" sx={{mt: 2, mb: 1}} aria-label="breadcrumb">
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
    <Spacer />
  </Flex>

  // buttons for the panel toolbar
  const panelButtons = (collectionAge > 0 
    ? ([
    <Typography color="success" variant="caption">Last updated {collectionAge} secs. ago</Typography>,
    <IconButton onClick={populate}><Sync /></IconButton>,
  ]) 
    : []).concat( [
    
    
    <ActionsMenu onClick={i => {
        const action = menuActions[i];
        action();
      }} 
      disabled={!selectedTests?.length}
      disabledBits={ disabledMenuItems } 
      options={[
      'Edit',  
      'Run',  
      <b style={{color: 'red'}}>Delete selected ({selectedTests?.length})</b> 
    ]} />,
    <Button href="/test" variant="contained" color="warning">create test</Button> ,
  ]);

  const pageCount = Math.ceil(createdTests?.length / PAGE_SIZE);
  const firstPage = (page - 1) * PAGE_SIZE;
  const pageItems = createdTests?.slice(firstPage, firstPage + PAGE_SIZE);

  const panelHeader = <Stack spacing={2}>
    <Typography variant="body1"><b style={{fontSize: '1.4rem'}}>Tests</b> ({createdTests?.length})</Typography>
    <Pagination count={2} page={page} onChange={pageChange} />
  </Stack>


    return <>
    
       {header}
 
      <Panel 
        on={!!createdTests} 
        tools={panelButtons}
        header={panelHeader}>

            {/* test datagrid */}
            <table className="grid" cellspacing="0"> 
            <thead>
              <tr>
                <th>
                  &nbsp;
                </th>
                <th>
                  Name
                </th>
                <th align="right">
                  Steps
                </th>
                <th>
                  Owner
                </th>
                <th>
                  Created
                </th>
                <th>
                  Modified
                </th>
                <th>
                &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems?.map((t) => (<tr key={t.suiteID}>
                <td className="checked" onClick={() => selectTest(t.testName)} >
                  <Checkbox/>
                </td>
                <td className="link"> <Link to={`/test/${t.suiteID}`}>{t.testName}</Link></td>
                <td align="right">{t.steps.length} steps</td>
                <td>community</td>
                <td>{timed(t.created)}</td>
                <td>{timed(t.modified)}</td>
                <td>&nbsp;</td>
              </tr>))}
            </tbody>
            </table>
        </Panel>


    </>
}


const timed = d => new Date(d).toDateString()