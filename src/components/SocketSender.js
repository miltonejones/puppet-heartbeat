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
import { Panel, Flex, Spacer, PreviewBox, ActionsMenu, LilBit } from './Control';
import PuppetLConfigForm, { transform } from './PuppetLConfigForm';
import PreviewCard from './PreviewCard';
import SystemDialog, { componentSystemDialog } from './SystemDialog';
import {saveTestSuite, deleteTestSuite, getTestSuite, getTestSuites, uniqueId} from '../connector/puppetConnector'
 


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
      sessionId: uniqueId(),
      createdTests: [] ,
      // selectedTests: [],
      exceptions: [],
      messages: [],
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

  logSocketMessage (socketData) {
    const { messages } = this.state;
    const { scriptMessage, activeStep} = socketData;
    messages[activeStep] = scriptMessage;
    console.log ({ socketData })
    this.setState({ ...socketData, messages })
  }

  messageListener(msg) {
    const { data } = msg;
    const { actionText } = this.state;
    const json = JSON.parse(data); 
    const { steps, data: socketData } = json;
  
   
    // when a test command is acknowledged, it includes
    // the list of steps in the test. Store them here.
    !!json &&
      !!steps &&
      this.setState({ 
        ...json, 
        steps, 

        // clear exceptions and messages
        exceptions: [],
        messages: [],
        outcomes: []
      });

    // if the data node has a 'message' prop, add the
    // whole node to the state and parse it in the render
    !!json && !!socketData?.message && this.logSocketMessage(socketData);

    // when messages have an "s3Location", add them to the 
    // outcomes array to display when the test is done
    !!socketData?.s3Location &&
      this.setState({
        ...this.state,
        outcomes: this.state.outcomes.concat({...socketData, actionText}),
      });
    
    // not used now but useful later
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
    const { sessionId } = this.state;
    console.log('You are connected');
    this.setState({ ws: client, connected: true });
    setConnected(true);
    this.sendMessage({
      action: 'introduce',
      data: {
        type: 'agent',
        sessionId
      },
    });
  }

  sendMessage(json) {
    console.log('sending message');
    client.readyState === 1 && client.send(JSON.stringify(json));
  }

  /**
   * transform an array of browser "puppetML" steps to "puppetL" for the server
   * @param {*} steps 
   * @returns [puppetL] 
   */
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
    const { suiteID, setTitle, runningTest, editingTest } = this.props;
    getTestSuites().then(req => { 
      const createdTests = req.Items;
      if (!!suiteID) {
        const currentTest = createdTests.find(f => f.suiteID === suiteID).testName; 
        this.setState( { createdTests, currentTest, showEdit: editingTest });
        setTitle && setTitle(currentTest)
        if (!!runningTest) {
          this.sendCommand(currentTest);
        }
        return;
      }
      this.setState( { createdTests, showEdit: editingTest });
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
      messages,
      ready
    } = this.state;

    const { editingTest, runningTest } = this.props;
    const {  systemDialogState, Prompt, Confirm } = componentSystemDialog(
      dialogState, state => this.setState({ dialogState: state })
    )
    const breadcrumbs = [
      <Link to="/">Puppeteer Studio</Link>,
      <Link to="/">Tests</Link>,
      <em>{currentTest || 'Create Test'}</em>
    ]; 

    const header = <Flex align="end">   
        <Box>
          <Breadcrumbs separator="›" sx={{mt: 2, mb: 1}} aria-label="breadcrumb">
            {breadcrumbs}
          </Breadcrumbs> 
        </Box>
      <Spacer />
     
    </Flex>

    const execRunning = !!progress && progress < 100;
    const execDisabled = !currentTest || execRunning; 

    const ButtonIcon = execRunning ? Sync : PlayCircle;
    const buttonClass = execRunning ? 'spin' : ''; 

    if (!createdTests) return <em>waiting...</em>
 
    const createdTestNames = createdTests.map(t => t.testName);
 
    const emptyTest = {testName: null, steps: []};
    const createdTest = createdTests.find(f => f.testName === currentTest) ?? emptyTest;
    const MenuBit = LilBit(['RUN', 'EDIT', 'EXPORT', 'CLONE', 'DELETE']);
    const AddIcon = !!createdTest.steps.length ? Edit : Add;  
    const runCardActions = [
      () => this.sendCommand(currentTest),
      () => this.setState({showEdit: !showEdit}),
      () => alert ('not supported'),
      () => alert ('not supported'),
      async () => {
        const answer = await Confirm ('Are you sure you want to delete this item?');
        alert (answer)
      }
    ]
    const runCardButtons = [
      <ActionsMenu 
        disabledBits={MenuBit.EXPORT + MenuBit.CLONE} 
        onClick={i => runCardActions[i]()} 
        options={['Run', 'Edit', 'Export', 'Clone', 'Delete Test']} />,
      <IconButton href="/"><Close /></IconButton>
    ]

    const testCardButtons = currentTest 
      ? [<Button color="error" variant="outlined">delete</Button>,
         <Button color="error" 
          onClick={() => this.sendCommand(currentTest, createdTest)} 
          variant="contained">run <PlayCircle /></Button>] 
      : [];

    return (
      <>
        {header}
  
        {/* test cms card */}
       
          <PuppetLConfigForm 
              showPanel={showEdit}
              editingTest={editingTest || runningTest}
              existingTests={createdTestNames}
              queryElements={elements}
              execTest={name => this.sendCommand(name)}
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
     

       {!!steps && execRunning && ( <Box style={{position:'absolute', bottom: 40, right: 40}}>
          <PreviewCard  
           message={message}
           thumbnail={thumbnail}
           testName={currentTest}
           progress={progress} />
        </Box>)}

        <Panel on={!showEdit && !preview && !!currentTest}   header={`Test: ${currentTest}`}
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
                {steps?.map((label, index) => {
                  const msg = messages[index];
                  const opt = <Typography variant="caption" color={msg?.error?'error':'primary'}>{msg?.error || msg}</Typography>;
                  const arg = { error: !!msg?.error }
                  return  (
                    <Step key={label}>
                      <StepLabel optional={opt} {...arg}>{label}</StepLabel>
                    </Step>
                  )
                })}
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
                  <SocketCard key={i} {...outcome} />
                ))}
              </Box>
              
            </Collapse> 
          </Card>  
        )}
        <SystemDialog {...systemDialogState} />
      </>
    );
  }
}

export default SocketSender; 
  

const timed = d => new Date(d).toDateString()
