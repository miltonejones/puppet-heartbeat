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
import './style.css';

function GridPage ({ pageIndex  }) {
  return <Layout pageIndex={pageIndex}><TestGrid /></Layout>
}

function TestPage ({ connected, pageIndex, setConnected }) {
  const { suiteID } = useParams();
  return <Layout connected={connected} pageIndex={pageIndex}><SocketSender suiteID={suiteID} setConnected={setConnected}/></Layout>
}


export default function App() {
  const [connected, setConnected] = React.useState(false);
  const args = {
    setConnected,
    connected
  }
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<GridPage {...args} pageIndex={0}/>} />
      <Route path="/test" element={<TestPage {...args} pageIndex={1}   />} /> 
      <Route path="/test/:suiteID" element={<TestPage {...args} pageIndex={1}   />} /> 
    </Routes>
</BrowserRouter>
}




// export default function App() {
//   const [connected, setConnected] = React.useState(false);
//   return <Layout connected={connected}><SocketSender setConnected={setConnected}/></Layout>;
// }
