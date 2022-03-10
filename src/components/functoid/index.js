
import  NavigateFunctoid  from './NavigateFunctoid';
import  EventFunctoid  from './EventFunctoid';
import  ExpectFunctoid  from './ExpectFunctoid';
import { Navigation, Input, Check}  from '@mui/icons-material';



/**
 * step {
 *  label: string,
 *  action: string,
 *  object: object,
 *  fact: object
 * }
 * 
 * fact {
 *  key,
 *  value
 * }
 * 
 * macro {
 *  blur,
 *  click,
 *  change {
 *    by: test-id | element-id | selector, 
 *    key
 *    options,
 *    icon -> Input
 *  },
 * 
 *  form: {
 *    changes: [macro]
 *    icon -> DynamicForm
 *  }
 * }
 * 
 * actions [
 *  *navigate: {
 *    URL,
 *    icon -> Navigation
 *  },
 *  lookup {
 *    by: test-id | element-id | selector,
 *    key,
 *    icon -> Code
 *  },
 *  expect {
 *    fact,
 *    value
 *    icon -> Check
 *  },
 *  blur,
 *  click, 
 *  change {
 *    object,
 *    options,
 *    icon -> Start
 *  }
 * ]
 * 
 * https://associate-dev.theatlastango.com/Signin
 * input[name=email]
 * miltonejonesthelessor@gmail.com
 * #outlined-adornment-password
 * sFArvU8pmwUuz4K$
 * sign_in_login_button
 * https://associate-dev.theatlastango.com/Profile/MyInformation
 * edit-button-function
 */

const Functoid = {
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
  }
}

export {
  Functoid
}