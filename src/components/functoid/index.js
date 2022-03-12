
import  NavigateFunctoid  from './NavigateFunctoid';
import  EventFunctoid  from './EventFunctoid';
import  ExpectFunctoid  from './ExpectFunctoid';
import  UploadFunctoid  from './UploadFunctoid';
import { Navigation, Input, Check, Upload }  from '@mui/icons-material';
 
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
  }
};