import React from 'react';
import {
  Button,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Collapse,
  Divider 
} from '@mui/material';
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
import { PlayCircle, Sync }  from '@mui/icons-material'; 

const SOCKET_URI =
  'wss://2zoxhl25v2.execute-api.us-east-1.amazonaws.com/production';

let client = new WebSocket(SOCKET_URI);

class SocketSender extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      ws: null,
      data: null,
      showTextbox: true,
      outcomes: [],
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
    const json = JSON.parse(data);
    // if (!(json?.available || json?.message)) return console.log(json);
    const { available, steps, data: socketData } = json;

    // console.log({ json });
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
        outcomes: this.state.outcomes.concat(socketData),
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
    client.send(JSON.stringify(json));
  }

  sendCommand(id) {
    this.sendMessage({
      action: 'exec',
      data: {
        id,
      },
    });
    this.setState({ clicked: 1, complete: !1, downloadIndex: 0 });
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

  mountClient() {
    client.addEventListener('open', this.openListener);
    client.addEventListener('message', this.messageListener);
    client.addEventListener('close', this.closeListener);
  }
  componentDidMount() {
    this.mountClient();
  }

  render() {
    const {
      tests,
      message,
      thumbnail,
      steps,
      activeStep = 0,
      progress,
      outcomes,
      connected,currentTest
    } = this.state;
    const execRunning = !!progress && progress < 100;
    const execDisabled = !currentTest || execRunning
    const headerText = !connected
      ? 'Waiting to connect...'
      : 'Select a test to run.';
    const ButtonIcon = execRunning ? Sync : PlayCircle;
    const buttonClass = execRunning ? 'spin' : '';
    return (
      <>

        {/* card header */}
        <Card className="card-body flex">
          <Box ml={2}>{headerText}</Box>
          <Box sx={{ flexGrow: 1 }} />
          <TestSelect
            value={currentTest}
            onChange={e => this.setState({currentTest: e})}
            testList={tests}
          />
          <Button 
            onClick={() => this.sendCommand(currentTest)} disabled={execDisabled} 
            sx={{mr: 3}} variant="contained" color="error"
          >Run <ButtonIcon className={buttonClass} sx={{ml: 1}} /></Button>
          <hr />
        </Card>

        {/* card body */}
        <Card className="card-body" sx={{ minHeight: 300 }}>
          <Grid container>
            {!!currentTest &&(  
            <Grid item xs={12}>
              <Stack>
                <Typography sx={{mt: 1, ml: 2}} variant="h6">
                    Test: "{currentTest}"
                  </Typography>
                  
                <Typography sx={{mb: 1, ml: 2}}  variant="caption">
                    {execRunning ? 'Please wait while the test completes...' : 'Click Run to start the test'}
                  </Typography>
              </Stack>
            </Grid>)}
            <Grid
              item
              className="flex center middle"
              xs={5}
              sx={{ textAlign: 'center' }}
            >
              {!steps && (
                <Typography mt={4} variant="subtitle1">
                  No test is loaded.
                </Typography>
              )}
              {!!steps && !thumbnail && (
                  <Box mt={6}>
                    <LinearProgress variant="indeterminate"   />
                    <Typography mt={4} variant="subtitle1">
                      Waiting for first image...
                    </Typography>
                  </Box>
              )}
              {!!thumbnail && (
                <Stack mt={4} className="preview-stack">
                  <Box className="preview-head">
                    <Box className="dot" />
                    <Box className="dot green" />
                    <Box className="dot gold" />
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
            <Grid item pt={5} xs={2}>
              <Stepper mt={5} activeStep={activeStep} orientation="vertical">
                {steps?.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
            <Grid item p={5} xs={5}>
             <Stack mt={4} className="progress-stack">
              <Typography sx={{p: 1}} variant="subtitle1">{message || 'Ready.'}</Typography>

              {!!progress && (
                <Box mt={2}>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
             </Stack>
            </Grid>
          </Grid>

          {/* test result thumbnail cards */}
          {!!outcomes.length && (
            <Collapse in={progress > 95}>
              <Divider sx={{mt: 4, mb: 4}}>Test Results</Divider>
              <Box className="auto-grid">
                {outcomes.map((outcome, i) => (
                  <SocketCard key={i} {...outcome} />
                ))}
              </Box>
            </Collapse>
          )}
        </Card> 
      </>
    );
  }
}

export default SocketSender;

function TestSelect ({testList, value ,onChange}) {
  if (!testList) return <i />
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
