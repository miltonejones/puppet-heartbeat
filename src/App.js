import React from 'react';
import SocketSender from './components/SocketSender';
import TestGrid from './components/TestGrid'; 
import Layout from './components/Layout'; 
import Box from '@mui/material/Box';
import { 
  BrowserRouter,  
  Routes, 
  Route,
  useNavigate ,
  useParams
} from "react-router-dom";
import {Helmet} from "react-helmet";
import './style.css';

function GridPage ({ pageIndex  }) {
  return <Layout pageIndex={pageIndex}><TestGrid /></Layout>
}

function TestPage ({ connected, pageIndex, setConnected , setTitle, editingTest, runningTest}) {
  const { suiteID } = useParams();
  return <Layout connected={connected} pageIndex={pageIndex}
    ><SocketSender 
      runningTest={runningTest}
      editingTest={editingTest} 
      setTitle={setTitle}
      suiteID={suiteID} 
      setConnected={setConnected}
      /></Layout>
}


export default function App() {
  const [state, setState] = React.useState({ connected: false, title: 'Puppeteer Studio' });
  const { connected, title } = state;
  const args = {
    setConnected: f => setState(s => ({...s, connected: f})),
    setTitle: f =>  setState(s => ({...s, title: `Puppeteer Studio - ${f}`})),
    connected
  }
  return <>
   <Helmet>
        <title>{title}</title>
   </Helmet>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<GridPage {...args} pageIndex={0}/>} />
    <Route path="/test" element={<TestPage {...args} pageIndex={1}   />} /> 
    <Route path="/test/:suiteID" element={<TestPage {...args} pageIndex={1}   />} /> 
    <Route path="/edit/:suiteID" element={<TestPage editingTest {...args} pageIndex={1}   />} /> 
    <Route path="/exec/:suiteID" element={<TestPage runningTest {...args} pageIndex={1}   />} /> 
  </Routes>
</BrowserRouter></>
} 