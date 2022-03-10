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
  IconButton
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
import { PlayCircle, Sync, Settings , Add, Edit }  from '@mui/icons-material';
import JestCard from './JestCard';
import PuppetLConfigForm, { transform } from './PuppetLConfigForm';
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
    console.log('You are disconnected.');
    this.setState({
      connected: false,
      ws: null,
      readyState: client.readyState,
    });
    if (this.state.logout) {
      return console.log('Reconnection will not be attempted');
    }
    this.retryConnection();
  }

  openListener() {
    console.log('You are connected');
    this.setState({ ws: client, connected: true });
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

  sendCommand(id) {
    const { puppetML, createdTests } = this.state;
    const puppetL = createdTests.find(f => f.testName === id); 

    // convert "puppetML" (used only in the browser) to "puppetL"
    puppetL.steps = this.transformSteps(puppetL.steps);

    this.sendMessage({
      action: 'exec',
      data: {
        id,
        puppetL 
      },
    });
    this.setState({ actionText: !1, thumbnail: !1, progress: 0 });
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
      ready
    } = this.state;
    
    const breadcrumbs = [
      <b>Puppet Heartbeat</b>,
      <em>associate-ui</em>
    ]
    const header = <>   
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>
      <Box><Typography variant="h4">associate-ui</Typography></Box>
      <Box pb={2}><Typography variant="subtitle1">This page lists all tests running on the Puppeteer Server</Typography></Box>
      <Divider sx={{mb: 2}} />
    </>

    const execRunning = !!progress && progress < 100;
    const execDisabled = !currentTest || execRunning
    const headerText = !connected
      ? 'Waiting to connect...'
      : 'Select a test to run.';
    const ButtonIcon = execRunning ? Sync : PlayCircle;
    const buttonClass = execRunning ? 'spin' : '';
    const { showCode } = controlCodeDialog(dialogState, this.setState.bind(this))

    if (!createdTests) return <em>waiting...</em>
 console.log ({createdTests})
    const createdTestNames = createdTests.map(t => t.testName);
    const testList = createdTestNames;
    const createdTest = createdTests.find(f => f.testName === currentTest) ?? 
      {testName: null, steps: []}

    const AddIcon = !!createdTest.steps.length ? Edit : Add; 

    return (
      <>
        {header}

        {/* toolbar */}
        <Card className="card-body flex center">
          <Box ml={2}>{headerText}</Box>
          <Box sx={{ flexGrow: 1 }} />
          <TestSelect
            value={currentTest}
            onChange={e => this.setState({currentTest: e})}
            testList={testList}
          />
          <Button sx={{mr: 1}}  onClick={() => this.sendCommand(currentTest)} disabled={execDisabled} 
            variant="contained" color="error"
          >Run <ButtonIcon className={buttonClass} sx={{ml: 1}} /></Button>
          {!execDisabled &&( <IconButton onClick={() => this.setState({showJest: !showJest})} ><Settings/></IconButton>)}
          <IconButton onClick={() => this.setState({showEdit: !showEdit})} sx={{mr: 3}} ><AddIcon/></IconButton>
          <hr />
        </Card>

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
        <Collapse in={showEdit}>
          <Card className="card-body" sx={{p: 2}} >
            <PuppetLConfigForm 
              existingTests={createdTestNames}
              getSteps={ s => createdTests.find(f => f.testName === s).steps }
              puppetML={createdTest}
              onCancel={() => this.setState({showEdit: !showEdit}) }
              onSave={ puppetML => {
                this.addTest(puppetML)
                this.setState({ puppetML, showEdit: !showEdit }); 
              } }/>
          </Card>
        </Collapse>

        {/* test run panel */}
        <Card className="card-body" sx={{ minHeight: 300 }}>
          <Grid container>  

            {/* test panel - header */}
            {!!currentTest && (  <Grid item xs={12}>
              <Stack>
                <Typography sx={{mt: 1, ml: 2}} variant="h6">
                  Test: "{currentTest}"
                </Typography>
                
                <Typography sx={{mb: 1, ml: 2}}  variant="subtitle1">
                  {execRunning ? 'Please wait while the test completes...' : 'Click Run to start the test'}
                </Typography> 
              </Stack>
            </Grid>
            )}

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


          {/* results panel opens when job is almost done */}
          {!!outcomes.length && (
            <Collapse in={progress > 95}>
              <Divider sx={{mt: 4, mb: 4}}>Test Results</Divider>

              <Box className="auto-grid">
                {outcomes.map((outcome, i) => (
                  <SocketCard key={i} {...outcome} showCode={showCode}/>
                ))}
              </Box>
              
            </Collapse>
          )}
        </Card> 

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
 