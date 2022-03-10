// login creds (TODO: make external)
const C = {
    username: "miltonejonesthelessor@gmail.com",
    password: "sFArvU8pmwUuz4K$",
  };
  
  // initial user navigation
  const rootURL = 'https://associate-dev.theatlastango.com';
  const startPage = rootURL + "/Application?jobId=CHET3-3627CE5D-57B2-EB11";
  
  // element selectors
  const USERNAME_SELECTOR = "input[name=email]";
  const PASSWORD_SELECTOR = "#outlined-adornment-password";
  const LOGIN_BUTTON_SELECTOR = "button[data-testid=sign_in_login_button]";
  const COMPONENT_SELECTOR = "div[data-testid=test-for-ApplicantInformation]";
  const SPLIT_PAGE_SELECTOR = "div[data-testid=test-for-SplitPage]"; 
  
  
  const timeout = 1999;
  
  const clickButtonByXpath = async (page, xpath) => {
    const btnClick = await page.waitForXPath(xpath, { timeout });  
    await page.waitForTimeout(700)
    await btnClick.click() ;
    await page.waitForTimeout(timeout)
  }
  
  const clickButtonByTestId = async (page, testId, suffix = '') => clickButtonByXpath(page, `//*[contains(@data-testid, '${testId}')]`);
  const clickButtonByText = async (page, text) => clickButtonByXpath(page, `(//*[contains(text(), '${text}')])`);
  const clickButtonByHref = async (page, href) => clickButtonByXpath(page, `(//*[@href='${href}'])`);
  
  const openApplicationPage = (where) => ({
    stepLabel: 'Open Sign In Page',
    stepAction: 
  async (page) => {
    await page.goto(where, {
      waitUntil: "networkidle2",
      timeout: 9999,
    }); 
  },
  })
   
  
  
  
  const completeSiteLogin = [
    {
      stepLabel: 'Enter login credentials',
      stepAction: 
  async (page) => {
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(C.username);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(C.password);
  }
    },
    {
      stepLabel: 'Click log in button',
      stepAction: 
  async (page) => { 
    await clickButtonByTestId(page, 'sign_in_login_button');
  }
    },
    {
      stepLabel: 'Wait for page load',
      stepAction: 
  async (page) => { 
    await page.waitForTimeout(4999);  
  }
    }, 
  ]
  
  const signInWithoutJobId = [
    openApplicationPage(rootURL + '/Signin'),
    ...completeSiteLogin 
  ]
  
  const signInWithJobId = [
    openApplicationPage(startPage),
    ...completeSiteLogin 
  ]
  
  const completePersonalInformation = [
    { 
      stepLabel: 'Click edit button',
      stepAction: 
  async (page) => { 
    await clickButtonByTestId(page, 'edit-button-function'); 
  }
    },
    { 
      stepLabel: 'Scroll down some',
      stepAction: 
  async (page) => {
    await page.evaluate( () => {
      window.scrollBy(0, 1500);
    });
  }
    },  
    { 
      stepLabel: 'Click Next button',
      stepAction: 
  async (page) => { 
    await clickButtonByText(page, 'Next');
  }
    },  
    { 
      stepLabel: 'Accept entered address',
      stepAction: 
  async (page) => { 
    await clickButtonByText(page, 'Use This Address');
  }
    },  
  ]
  
  const uploadSpecimenFile = [
    {
      stepLabel: 'Click Icon button',
      stepAction: 
  async (page) => { 
      await clickButtonByTestId(page, 'IconSelectionButton');
    },
  },
      {
      stepLabel: 'Upload file',
      stepAction: 
  async (page) => {
      const fileToUpload = './Handbook.pdf';
      const xpath = "//*[contains(@data-testid, 'file-uploader-element')]";
      const inpUpload = await page.waitForXPath(xpath);
      inpUpload.uploadFile(fileToUpload);
      await page.waitForTimeout(timeout)
    },
  },
      { 
        stepLabel: 'Click Next button',
        stepAction: 
  async (page) => { 
    await clickButtonByText(page, 'Next');
  }
      },  
      
  
  ]
  
  exports.testSuite = [
    {
      testLabel: 'Sign In to Website',
      steps: signInWithoutJobId
    }, 
    {
      testLabel: 'Edit Personal Information',
      steps: [
        ...signInWithJobId,
        ...completePersonalInformation
      ]
    }, 
    {
      testLabel: 'Open Job Preferences',
      steps: [
        ...signInWithoutJobId,
        {
          stepLabel: 'Click Continue Link',
          stepAction: 
  async (page) => {
    await clickButtonByText(page, 'Continue');  
  }
        },
      ]
    }, 
    {
      testLabel: 'Edit Job Preferences (travel)',
      steps: [
        ...signInWithoutJobId,
        
        {
          stepLabel: 'Click Custom Menu',
          stepAction: 
  async (page) => {
    await clickButtonByTestId(page, 'CustomAccountMenu-iconBtn');  
  }
        },
        {
          stepLabel: 'Click Job Preferences',
          stepAction: 
  async (page) => {
    try {
      await clickButtonByHref(page, '/Profile/JobPreference');  
    } catch (err) {
      await page.goto(rootURL + '/Profile/JobPreference', {
        waitUntil: "networkidle2",
        timeout: 9999,
      }); 
    }
  }
        },
        {
          stepLabel: 'Wait for page load',
          stepAction: 
  async (page) => {  
    await page.waitForTimeout(999); 
  }
        },
        { 
          stepLabel: 'Click edit button',
          stepAction: 
  async (page) => { 
    // click edit button twice
    await clickButtonByTestId(page, 'edit-button-function');  
    await page.waitForTimeout(999); 
    await clickButtonByTestId(page, 'edit-button-function'); 
    // then cancel the first one
    await clickButtonByText(page, 'Cancel');
  }
        },
        { 
          stepLabel: 'Change travel setting',
          stepAction: 
  async (page) => { 
    // set travel to a random value
    const distance = Math.round(Math.random() * 8);
    await clickButtonByXpath(page, `(//*[@data-index='${distance}'])`);
  }
        },
        { 
          stepLabel: 'Click update button',
          stepAction: 
  async (page) => {  
    await clickButtonByText(page, 'Update');
  }
        },
      ]
    }, 
    {
      testLabel: 'Edit Job Preferences (work)',
      steps: [
        ...signInWithoutJobId,
       
        {
          stepLabel: 'Click Job Preferences',
          stepAction: 
  async (page) => {
    try {
      await clickButtonByHref(page, '/Profile/JobPreference');  
    } catch (err) {
      await page.goto(rootURL + '/Profile/JobPreference', {
        waitUntil: "networkidle2",
        timeout: 9999,
      }); 
    }
  }
        },
        {
          stepLabel: 'Wait for page load',
          stepAction: 
  async (page) => {  
    await page.waitForTimeout(999); 
  }
        },
        { 
          stepLabel: 'Click edit button',
          stepAction: 
  async (page) => { 
    // click edit button  
    await clickButtonByTestId(page, 'edit-button-function');  
    await page.waitForTimeout(999);  
  }
        },
        { 
          stepLabel: 'Change work setting',
          stepAction: 
  async (page) => { 
    await clickButtonByText(page, 'Yes');
  }
        },
        { 
          stepLabel: 'Change weekend setting',
          stepAction: 
  async (page) => { 
    const xpath = `//*[@aria-label='Are you able to work weekends?']//*[@value='yes']`
    await clickButtonByXpath(page, xpath);
  }
        },
        { 
          stepLabel: 'Change overtime setting',
          stepAction: 
  async (page) => { 
    const xpath = `//*[@aria-label='Are you able to work overtime?']//*[@value='no']`
    await clickButtonByXpath(page, xpath);
  }
        },
        { 
          stepLabel: 'Change shift setting',
          stepAction: 
  async (page) => { 
    const xpath1 = `//input[@name='firstShift']`
    await clickButtonByXpath(page, xpath1);
    const xpath2 = `//input[@name='secondShift']`
    await clickButtonByXpath(page, xpath2);
  }
        }, 
        { 
          stepLabel: 'Click update button',
          stepAction: 
  async (page) => {  
    await clickButtonByText(page, 'Update');
  }
        },
      ]
    }, 
    {
      testLabel: 'Edit Job Preferences (pay)',
      steps: [
        ...signInWithoutJobId,
        
        {
          stepLabel: 'Click Custom Menu',
          stepAction: 
  async (page) => {
    await clickButtonByTestId(page, 'CustomAccountMenu-iconBtn');  
  }
        },
        {
          stepLabel: 'Click Job Preferences',
          stepAction: 
  async (page) => {
    try {
      await clickButtonByHref(page, '/Profile/JobPreference');  
    } catch (err) {
      await page.goto(rootURL + '/Profile/JobPreference', {
        waitUntil: "networkidle2",
        timeout: 9999,
      }); 
    }
  }
        },
        {
          stepLabel: 'Wait for page load',
          stepAction: 
  async (page) => {  
    await page.waitForTimeout(999); 
  }
        },
        { 
          stepLabel: 'Click edit button',
          stepAction: 
  async (page) => { 
    // click edit button three times
    await clickButtonByTestId(page, 'edit-button-function');  
    await page.waitForTimeout(999); 
    await clickButtonByTestId(page, 'edit-button-function'); 
    await page.waitForTimeout(999); 
    await clickButtonByTestId(page, 'edit-button-function'); 
    // then cancel the first and second one
    await clickButtonByText(page, 'Cancel');
    await page.waitForTimeout(999); 
    await clickButtonByText(page, 'Cancel');
  }
        },
        { 
          stepLabel: 'Change pay setting',
          stepAction: 
  async (page) => { 
    // set pay to a random value
    const pay = Math.round(Math.random() * 99).toString();
    // click 3 times to select all text in the input
    await page.click('#standard-basic', { clickCount: 3 });
    await page.keyboard.type(pay);
  }
        },
        { 
          stepLabel: 'Click update button',
          stepAction: 
  async (page) => {  
    await clickButtonByText(page, 'Update');
  }
        },
      ]
    }, 
  //MyInformation
    {
      testLabel: 'Edit My Information',
      steps: [
  
        ...signInWithoutJobId,   
        {
          stepLabel: 'Click My Information',
          stepAction: 
  async (page) => {
    try {
      await page.waitForTimeout(1999); 
      await clickButtonByHref(page, '/Profile/MyInformation');  
    } catch (err) {
      await page.goto(rootURL + '/Profile/MyInformation', {
        waitUntil: "networkidle2",
        timeout: 9999,
      }); 
    }
  } },
  {
      stepLabel: 'Wait for page load',
      stepAction: 
  async (page) => {  
    await page.waitForTimeout(999); 
  }
    },
    { 
      stepLabel: 'Click edit button',
      stepAction: 
  async (page) => { 
  // click edit button  
  await clickButtonByTestId(page, 'edit-button-function');  
  await page.waitForTimeout(999);  
  }
    },
      ]
    },
  
    {
      testLabel: 'Upload Resume',
      steps: [
        ...signInWithJobId,
        ...completePersonalInformation,
        ...uploadSpecimenFile 
      ]
    }, 
    {
      testLabel: 'Submit Application',
      steps: [
        ...signInWithJobId,
        ...completePersonalInformation,
        ...uploadSpecimenFile,
        
        { 
          stepLabel: 'Click Submit button',
          stepAction: 
  async (page) => {
    await clickButtonByTestId(page, 'Application_submitBtn'); 
  }
        },  
        {
          stepLabel: 'Wait for page load',
          stepAction: 
  async (page) => { 
    // just give it a second... 
    await page.waitForTimeout(999); 
  }
        },
      ]
    }, 
  ] 
   