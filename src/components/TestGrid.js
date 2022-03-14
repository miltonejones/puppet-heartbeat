import React from 'react';
import {  getTestSuites, deleteTestSuite} from '../connector/puppetConnector';
import { Panel, Flex, Spacer, ActionsMenu, FileUploader, LilBit } from './Control';
import SystemDialog, { useSystemDialog } from './SystemDialog';

import {  Sync, Widgets, ExpandMore  }  from '@mui/icons-material';
import { 
  Box,
  Checkbox,
  Button,
  IconButton,
  Breadcrumbs,
  Stack,
  Pagination,
  Typography,
  TextField
} from '@mui/material';
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;
 
/** 
 *  Render list of tests from the DB
 */
export default function TestGrid () {
  const { systemDialogState, Prompt, Confirm } = useSystemDialog();
  const [state, setState] = React.useState({ selectedTests: [] });
  const { 
    sortKey = 'testName',
    sortOffset = 1,
    createdTests, 
    selectedTests, 
    page = 1, 
    updateTime = -1,
    testFilter = ''
  }  = state; 

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
  const MenuBit = LilBit(['EDIT', 'RUN', 'DELETE']); 

  // bitmap for disabled items in the menu
  let disabledMenuItems = 0;
  if (!selectedTests?.length) disabledMenuItems += MenuBit.DELETE;
  if (selectedTests?.length !== 1) disabledMenuItems += MenuBit.EDIT + MenuBit.RUN;
  
  // array of functions the menu calls
  const openTest = name => alert ('open ' + name + "!!")
  const menuActions = [
    () => window.location.replace(`/edit/${ createdTests.find(f => f.testName === selectedTests[0]).suiteID }`),   
    () => window.location.replace(`/exec/${ createdTests.find(f => f.testName === selectedTests[0]).suiteID }`),   
    async () => {
      const answer = await Confirm ('Are you sure you want to delete the selected items?', 'Confirm Delete');
      !!answer && Promise.all(
        selectedTests
          .map(s => deleteTestSuite( createdTests.find(f => f.testName === s).suiteID  ))
        ).then(populate)

     // alert (answer.toString());
    },
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

  if (!createdTests) return <i />

  const filteredTests = createdTests.filter(f => !testFilter || f.testName.toLowerCase().indexOf(testFilter.toLowerCase()) > -1);
  const pageCount = Math.ceil(filteredTests?.length / PAGE_SIZE);
  const firstPage = (page - 1) * PAGE_SIZE;
  const pageItems = filteredTests
      .map(f => ({...f, stepCount: f.steps.length}))
      .sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortOffset)
      .slice(firstPage, firstPage + PAGE_SIZE);
  const filterBox = <TextField 
                      sx={{mr: 4, width: 400}}
                      size="small"
                      value={testFilter}
                      onChange={e => setState(s => ({...s, testFilter: e.target.value}))}
                      label="filter tests by name" />

  const panelHeader = <Stack spacing={2}>
    <Typography variant="body1"><b style={{fontSize: '1.4rem'}}>Tests</b> ({filteredTests?.length})</Typography>
    <Flex>
      {filterBox}
      {pageCount > 1 && <Pagination count={pageCount} page={page} onChange={pageChange} />}
    </Flex>
  </Stack>


    return <>
    
       {header}
 
      <Panel 
        wait
        on={!!createdTests} 
        tools={panelButtons}
        header={panelHeader}>

            {/* test datagrid */}
            <table className="grid" cellspacing="0"> 
            <TestHead setKey={(key) => setState(s => ({...s, sortOffset: -s.sortOffset, sortKey: key}))} sortKey={sortKey} />
            <tbody>
              {pageItems?.map((t) => (<TestRow selectTest={selectTest} key={t.suiteID} testInstance={t} />))}
            </tbody>
            </table>
        </Panel>

      <SystemDialog {...systemDialogState}  />
    </>
}

const TestHead = ({ setKey, sortKey}) => {
  const fields = [
    {
      label: 'Name',
      id: 'testName'
    },
    {
      label: 'Steps',
      id: 'stepCount'
    },
    {
      label: 'Owner', 
    },
    {
      label: 'Created',
      id: 'created'
    },
    {
      label: 'Modified',
      id: 'modified'
    }
  ];

  return <thead>
      <tr>
        <th>
          &nbsp;
        </th>
       {fields.map(field => <th onClick={() => !!field.id && setKey(field.id)} key={field.label}>
         <Flex> {field.label} {sortKey === field.id && <ExpandMore />}</Flex>
        </th>)} 
        <th>
        &nbsp;
        </th>
      </tr>
    </thead>
}

const TestRow = ({ testInstance, selectTest }) => {
  const hasNavigationStep = testInstance.steps.some(f => f.action === 'navigate')
  return <tr>
    <td className="checked" onClick={() => selectTest(testInstance.testName)} >
      <Checkbox/>
    </td>
    <td className="link"> 
      <Flex>
        {!hasNavigationStep && <Widgets sx={{mr: 1}} />}
        <Link to={`/edit/${testInstance.suiteID}`}>{testInstance.testName}</Link>
      </Flex>
    </td>
    <td align="right">{testInstance.steps.length} steps</td>
    <td>community</td>
    <td>{timed(testInstance.created)}</td>
    <td>{timed(testInstance.modified)}</td>
    <td>&nbsp;</td>
  </tr>
}


const timed = d => new Date(d).toDateString()