import React from 'react';
import SocketSender from './components/SocketSender';
import Layout from './components/Layout'; 
import Box from '@mui/material/Box';
import './style.css';

export default function App() {
  const [connected, setConnected] = React.useState(false);
  return <Layout connected={connected}><SocketSender setConnected={setConnected}/></Layout>;
}
