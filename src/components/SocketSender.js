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
import { Link } from "react-router-dom";
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
import { Panel, Flex, Spacer, PreviewBox } from './Control';
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
      // selectedTests: [],
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

    this.setState({ 
      currentTest: id, 
      actionText: !1, 
      thumbnail: !1, 
      progress: 0,  
      preview: !!puppetML });
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
    const { suiteID } = this.props;
    getTestSuites().then(req => { 
      const createdTests = req.Items;
      if (!!suiteID) {
        const currentTest = createdTests.find(f => f.suiteID === suiteID).testName; 
        this.setState( { createdTests, currentTest, showEdit: false });
        return;
      }
      this.setState( { createdTests, showEdit: true });
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
      preview,
      elements,
      ready
    } = this.state;
    
    const breadcrumbs = [
      <Link to="/">Puppeteer Studio</Link>,
      <Link to="/">Tests</Link>,
      <em>{currentTest || 'Create Test'}</em>
    ];

    const connectedText = !connected
      ? <Flex><Box className="dot" /> Disconnected </Flex>
      : <Flex><Box className="dot green" /> Connected </Flex>;

    const header = <Flex align="end">   
        <Box>
          <Breadcrumbs separator="›" sx={{mt: 2, mb: 1}} aria-label="breadcrumb">
            {breadcrumbs}
          </Breadcrumbs> 
        </Box>
      <Spacer />
     
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

    const runCardButtons = [
      <Button color="error" 
      onClick={() => this.sendCommand(currentTest)} 
      variant="contained">run <PlayCircle /></Button>,
      <IconButton  
      onClick={() => this.setState({showEdit:!showEdit})} 
      > <Edit /></IconButton>,
      <IconButton href="/"><Close /></IconButton>
    ]

    const testCardButtons = currentTest ? [<Button color="error" variant="outlined">delete</Button>,
    <Button color="error" 
      onClick={() => this.sendCommand(currentTest, createdTest)} 
      variant="contained">run <PlayCircle /></Button>] : [];

    return (
      <>
        {header}
  
        {/* test cms card */}
        <Panel header="Test Editor" tools={testCardButtons} on={showEdit}>
          <PuppetLConfigForm 
              existingTests={createdTestNames}
              queryElements={elements}
              previewTest={(name, items) => {
                const queryTest = { testName: name, steps: items.concat({ action: 'query' }) };
                this.sendCommand(name, queryTest)
              }} 
              getSteps={ s => createdTests.find(f => f.testName === s).steps }
              puppetML={createdTest}
              onCancel={() => this.setState({showEdit: !showEdit }) }
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

        <Panel on={!showEdit && !preview && !!currentTest} header={`Test: ${currentTest}`}
          tools={runCardButtons}
        >        
          <Grid container>

            {/* test panel - preview screen column */}
            <Grid item  xs={4}  >
              <Flex>
                <PreviewBox animation={ !!steps ? 'wave' : false } thumbnail={thumbnail} />
              </Flex>
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
