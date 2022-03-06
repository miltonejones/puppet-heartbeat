import React from 'react';
import {
  Button,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Collapse,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import SocketCard from './SocketCard';
// import StepContent from '@mui/material/StepContent';

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
      connected,
    } = this.state;
    const headerText = !connected
      ? 'Waiting to connect...'
      : 'Select a test to run.';
    return (
      <>
        <Box className="card-body flex">
          <Box ml={2}>{headerText}</Box>
          <Box sx={{ flexGrow: 1 }} />
          {tests?.map((t) => (
            <Button
              variant="contained"
              style={{ margin: 4 }}
              onClick={() => this.sendCommand(t)}
            >
              {t}
            </Button>
          ))}
          <hr />
        </Box>
        <Card className="card-body" sx={{ minHeight: 300 }}>
          <Grid container>
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
                <Typography mt={4} variant="subtitle1">
                  Waiting for first image...
                </Typography>
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
                      style={{ width: 300, height: 168 }}
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
              {message}

              {!!progress && (
                <Box mt={6}>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
            </Grid>
          </Grid>
          {!!outcomes.length && (
            <Collapse in={progress > 95}>
              <Divider>Test Results</Divider>

              <Box className="auto-grid">
                {outcomes.map((outcome, i) => (
                  <SocketCard key={i} {...outcome} />
                ))}
              </Box>
            </Collapse>
          )}
        </Card>
        {/* {JSON.stringify(outcomes)} */}
        {/* <h1>{message}</h1>
        [[{steps}]]
        {JSON.stringify(outcomes)}
        {thumbnail} */}
      </>
    );
  }
}

export default SocketSender;
