
import  NavigateFunctoid  from './NavigateFunctoid';
import  EventFunctoid  from './EventFunctoid';
import  ExpectFunctoid  from './ExpectFunctoid';
import  UploadFunctoid  from './UploadFunctoid';
import  ImportFunctoid  from './ImportFunctoid';
import  PuppetLFunctoid  from './PuppetLFunctoid';
import  ScriptFunctoid  from './ScriptFunctoid';
import  RequestFunctoid  from './RequestFunctoid';
import { Navigation, Input, Check, Upload, Lock, Terminal, Language }  from '@mui/icons-material';
 
export const Functoid = {
  Navigation: { 
    action: 'navigate',
    Component: NavigateFunctoid,
    Icon: Navigation
  },

  Event: {
    action: 'event',
    Component: EventFunctoid,
    Icon: Input
  },

  Expect: {
    action: 'expect',
    Component: ExpectFunctoid,
    Icon: Check
  },

  Upload: {
    action: 'upload',
    Component: UploadFunctoid,
    Icon: Upload
  },

  Import: {
    action: 'import',
    Component: ImportFunctoid,
    Icon: Lock
  },

  Request: {
    action: 'request',
    Component: RequestFunctoid,
    Icon: Language
  },

  Scriptoid: {
    action: 'script',
    Component: ScriptFunctoid,
    Icon: Terminal
  },

  Imported: { 
    Component: PuppetLFunctoid,
    Icon: Lock
  }
};