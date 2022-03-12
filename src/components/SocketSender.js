import React from 'react';
import {
  Button,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Collapse,
  Divider ,
  Breadcrumbs,
  Alert,
  IconButton,
  Checkbox
} from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import SocketCard from './SocketCard';
import { PlayCircle, Sync, Settings , Add, Edit, Close }  from '@mui/icons-material';
import JestCard from './JestCard';
import { Panel, Flex, Spacer, ActionsMenu, FileUploader } from './Control';
import PuppetLConfigForm, { transform } from './PuppetLConfigForm';
import PreviewCard from './PreviewCard';
import {saveTestSuite, deleteTestSuite, getTestSuite, getTestSuites} from '../connector/puppetConnector'
// import StepContent from '@mui/material/StepContent';

const SOCKET_URI =
  'wss://2zoxhl25v2.execute-api.us-east-1.amazonaws.com/production';

let client = new WebSocket(SOCKET_URI);

const COOKIE_NAME = 'test-name-list'

class SocketSender extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      ws: null,
      data: null,
      ready: false,
      outcomes: [],
      createdTests: [] ,
      selectedTests: [],
      dialogState: {open: false}
    };
    this.openListener = this.openListener.bind(this);
    this.messageListener = this.messageListener.bind(this);
    this.closeListener = this.closeListener.bind(this);
    this.sendCommand = this.sendCommand.bind(this);
  }

  onComplete() {
    alert('DONE!');
  }

  messageListener(msg) {
    const { data } = msg;
    const { actionText } = this.state;
    const json = JSON.parse(data); 
    const { available, steps, data: socketData } = json;
    console.log ({msg})
    // process messages here
    !!json &&
      !!available &&
      this.setState({ ...json, tests: available?.split(',') });
    !!json &&
      !!steps &&
      this.setState({ ...json, outcomes: [], steps: steps?.split(',') });
    !!json && !!socketData?.message && this.setState({ ...socketData });
    !!socketData?.s3Location &&
      this.setState({
        ...this.state,
        outcomes: this.state.outcomes.concat({...socketData, actionText}),
      });
    !!json.complete && this.onComplete();
  }

  closeListener() {
    const { setConnected } = this.props;
    console.log('You are disconnected.');
    this.setState({
      connected: false,
      ws: null,
      readyState: client.readyState,
    });
    setConnected(false);
    if (this.state.logout) {
      return console.log('Reconnection will not be attempted');
    }
    this.retryConnection();
  }

  openListener() {
    const { setConnected } = this.props;
    console.log('You are connected');
    this.setState({ ws: client, connected: true });
    setConnected(true);
    this.sendMessage({
      action: 'introduce',
      data: {
        type: 'agent',
      },
    });
  }

  sendMessage(json) {
    console.log('sending', json);
    client.readyState === 1 && client.send(JSON.stringify(json));
  }

  transformSteps (steps) {
    return ((out) => {
      steps
        .filter(f => !!f.action)
        .map (s => out = out.concat(transform(s)))
      return out;
    })([]);
  }

  sendCommand(id, puppetML = null) {
    const { createdTests } = this.state;
    const puppetL = puppetML || createdTests.find(f => f.testName === id); 
    // send a clone so as not to mutate the original
    const cloneL = { ...puppetL };
    // convert "puppetML" (used only in the browser) to "puppetL"
    cloneL.steps = this.transformSteps(cloneL.steps);

    this.sendMessage({
      action: 'exec',
      data: {
        id,
        puppetL: cloneL
      },
    });
    this.setState({ currentTest: id, actionText: !1, thumbnail: !1, progress: 0, preview: !!puppetML });
  }

  retryConnection() {
    setTimeout(() => {
      console.log('Retrying connection...');
      client = new WebSocket(SOCKET_URI);
      this.mountClient();
    }, 5000);
  }

  componentWillUnmount() {
    console.log('Disconnecting.');
    this.sendMessage({
      action: 'disconnect',
    }); 
  }

  async mountClient() {
    client.addEventListener('open', this.openListener);
    client.addEventListener('message', this.messageListener);
    client.addEventListener('close', this.closeListener); 
  }
  
   componentDidMount() {
      this.mountClient();
      this.populate()
  } 

  addTest (test) {  
    saveTestSuite(test).then (this.populate.bind(this));
  }

  populate () {
    getTestSuites().then(req => { 
      this.setState( { createdTests: req.Items });
    });
  }
  
  selectTest (testName) { 
    const { selectedTests: existingTests } = this.state;
    const exists = existingTests.some(f => f === testName);

    const selectedTests = exists
      ? existingTests.filter(f => f !== testName)
      : existingTests.concat(testName);
 
    this.setState({ selectedTests })
  }

  render() {
    const {
      tests = [],
      message,
      thumbnail,
      steps,
      activeStep = 0,
      progress,
      outcomes,
      connected,
      currentTest,
      actionText,
      dialogState,
      showJest,
      showEdit,
      createdTests,
      selectedTests,
      preview,
      ready
    } = this.state;
    
    const breadcrumbs = [
      <b>Puppeteer Studio</b>,
      <em>associate-ui</em>
    ];

    const connectedText = !connected
      ? <Flex><Box className="dot" /> Disconnected </Flex>
      : <Flex><Box className="dot green" /> Connected </Flex>;

    const header = <Flex align="end">   
        <Box>
          <Breadcrumbs separator="›" sx={{mt: 2, mb: 1}} aria-label="breadcrumb">
            {breadcrumbs}
          </Breadcrumbs>
          <Box sx={{mb: 2}}><Typography variant="h4">associate-ui</Typography></Box>
        </Box>
      <Spacer />
      <Button onClick={() => this.setState({showEdit: !showEdit})}
        sx={{mb: 2}} disabled={showEdit}
       variant="contained" color="warning">create new test</Button>
    </Flex>

    const execRunning = !!progress && progress < 100;
    const execDisabled = !currentTest || execRunning

    const headerText = !connected
      ? 'Disconnected. Please start PuppetStudio on your computer.'
      : <><Box className="dot green" /> Connected. Select a test to run.</>;

    const ButtonIcon = execRunning ? Sync : PlayCircle;
    const buttonClass = execRunning ? 'spin' : '';
    const { showCode } = controlCodeDialog(dialogState, this.setState.bind(this))

    if (!createdTests) return <em>waiting...</em>
 
    const createdTestNames = createdTests.map(t => t.testName);
    const testList = createdTestNames;
    const emptyTest = {testName: null, steps: []};
    const createdTest = createdTests.find(f => f.testName === currentTest) ?? emptyTest;

    const AddIcon = !!createdTest.steps.length ? Edit : Add; 

    // menu stuff
    const MenuBit = ((e) => {
      ['EDIT', 'RUN', 'NEW', 'DELETE'].map((n, i) => e[n] = Math.pow(2, i));
      return e;
    })({});
    let disabledMenuItems = 0;
    if (!selectedTests?.length) disabledMenuItems += MenuBit.DELETE;
    if (selectedTests?.length !== 1) disabledMenuItems += MenuBit.EDIT + MenuBit.RUN;
    const openTest = name => this.setState({ showEdit: !showEdit, currentTest: name })
    const menuActions = [
      () => openTest ( selectedTests[0] ),  
      () => this.sendCommand(selectedTests[0]),
      () => this.setState({ showEdit: !0, currentTest: null }),
      () => alert ('Deletes not supported yet'),
    ];

    return (
      <>
        {header}
 

        <Panel 
          on={!(showEdit || !!steps)} 
          tools={[
            <ActionsMenu onClick={i => {
                const action = menuActions[i];
                action();
              }} 
              disabledBits={ disabledMenuItems } 
              options={[
                  'Edit',  
                  'Run', 
                  'New Test',  
                  <b style={{color: 'red'}}>Delete selected ({selectedTests.length})</b> 
                ]} />
              ]}
              header={`Tests (${createdTests.length})`}>

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
              {createdTests?.map((t) => (<tr key={t.suiteID}>
                <td className="checked" onClick={() => this.selectTest(t.testName)} >
                  <Checkbox/>
                </td>
                <td onClick={e => openTest(t.testName)}
                 className="link"> {t.testName}</td>
                <td align="right">{t.steps.length} steps</td>
                <td>community</td>
                <td>{timed(t.created)}</td>
                <td>{timed(t.modified)}</td>
                <td>&nbsp;</td>
              </tr>))}
            </tbody>
            </table>
        </Panel>



        {/* jest import card */}
        <Collapse in={showJest}>
          <Card className="card-body" sx={{p: 2}} >
            <JestCard 
              onCancel={() => this.setState({showJest: !showJest}) }
              onSave={ puppetL => {
                this.setState({ puppetL, showJest: !showJest }); 
              } }/>
          </Card>
        </Collapse>
 
        {/* test cms card */}
        <Panel header="Test Editor" tools={
          [<Button color="error" variant="outlined">delete</Button>,
          <Button color="error" 
            onClick={() => this.sendCommand(currentTest, createdTest)} 
            variant="contained">run <PlayCircle /></Button>]
        } on={showEdit}>
          <PuppetLConfigForm 
              existingTests={createdTestNames}
              getSteps={ s => createdTests.find(f => f.testName === s).steps }
              puppetML={createdTest}
              onCancel={() => this.setState({showEdit: !showEdit, currentTest: null}) }
              onSave={ puppetML => {
                this.addTest(puppetML)
                this.setState({ puppetML, showEdit: !showEdit, currentTest: null }); 
              } }/>
        </Panel>

       {!!steps && execRunning && ( <Box style={{position:'absolute', bottom: 40, right: 40}}>
          <PreviewCard  
           message={message}
           thumbnail={thumbnail}
           testName={currentTest}
           progress={progress} />
        </Box>)}

        <Panel on={!!steps && !preview} header={`Test: ${currentTest}`}
          tools={[
            <IconButton onClick={() => this.setState({steps: null, outcomes: []})}><Close /></IconButton>
          ]}
        >

        
            <Grid container>

            {/* test panel - preview screen column */}
            <Grid
              item
              className="flex"
              xs={4} 
            >

              {!steps && (
                <Box mt={6} ml={4}>
                  <Typography mt={4} variant="subtitle1">
                    No test is loaded.
                  </Typography>
                </Box>
              )}

              {!!steps && !thumbnail && (
                <Box mt={6} ml={4}>
                  <LinearProgress variant="indeterminate"   />
                  <Typography mt={4} variant="subtitle1">
                    Waiting for first image...
                  </Typography>
                </Box>
              )}
              {!!thumbnail && (
                <Stack mt={6} ml={4} className="preview-stack">
                  <Box className="preview-head">
                    <Box className="dot" />
                    <Box className="dot gold" />
                    <Box className="dot green" />
                    <Typography ml={1} variant="caption">
                      Test Preview
                    </Typography>
                  </Box>
                  <Box className="preview-body">
                    <img
                      style={{ width: 320, height: 192 }}
                      src={'data:image/png;base64,' + thumbnail}
                      alt="thumb"
                    />
                  </Box>
                </Stack>
              )}
            </Grid>

            {/* test panel - progress stepper column  */}
            <Grid item pt={5} xs={4}>
              <Stepper mt={5} activeStep={activeStep} orientation="vertical">
                {steps?.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>

            {/* test panel - progress bar column */}
            <Grid item p={5} xs={4}>
            <Stack mt={4} className="progress-stack">
              <Typography sx={{p: 1}} variant="subtitle1">{message || 'Ready.'}</Typography>
              {!!progress && (
                <Box mt={2} mb={1}>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
            </Stack> 
            </Grid>

            </Grid>
                
  
        </Panel>


        {/* results panel opens when job is almost done */}
        {/* test run panel */}  
         {!!outcomes.length && (
          <Card className="card-body" >
            <Collapse in={progress > 95}>
              <Divider sx={{mt: 4, mb: 4}}>Test Results</Divider>

              <Box className="auto-grid">
                {outcomes.map((outcome, i) => (
                  <SocketCard key={i} {...outcome} showCode={showCode}/>
                ))}
              </Box>
              
            </Collapse> 
          </Card>  
        )}

        <CodeDialog {...dialogState}/>
      </>
    );
  }
}

export default SocketSender;

function TestSelect ({testList, value ,onChange}) {
  if (!testList?.length) return <i />
  return (<>
  <FormControl sx={{ m: 1, minWidth: 120 }}>
    <InputLabel >Available Tests</InputLabel>
    <Select  
      style={{minWidth: 240}}
      size="small"
      value={value}
      label="Age"
      onChange={e => onChange(e.target.value)}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {testList.map(e => <MenuItem value={e} key={e}>{e}</MenuItem>)}
    </Select> 
  </FormControl>
  </>)
}


function CodeDialog ({code, open, onClose}) {
  return <><Dialog  onClose={onClose} open={open}> 
  <DialogTitle>Test Code</DialogTitle>
    <Box p={3}>
      <fieldset className="code-block">
        <legend>copy</legend>
        <Box className="code-block-inner"> <pre>{code}</pre> </Box>
      </fieldset>
    </Box>
  </Dialog></>
}

// can't use a hook, so using a makeshift one
function controlCodeDialog(state, setState) { 
  const showCode = code => {
    setState({
      dialogState:{ 
        open:true,
        code,
        onClose: () => setState({dialogState: {open: false}})
      }
    })
  }
  return { state, showCode }
}
 

const timed = d => new Date(d).toDateString()
