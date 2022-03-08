
export class JestPuppeteerAdapter { 
    tests = {};
  
    screen = {
      queryByTestId: testId => this.getElementById(testId, 'lookup-by-test-id')
    };
  
    fireEvent = {
      change: (object, options) => {
        const ev = { event: 'change', object, options };
        Object.assign(object, options.target || options) 
        this.setSteps(s => s.concat({
          label: `EVENT: Change '${object?.key}' to ${options?.target?.value}`,
          object,
          action: 'change',
          ...options.target
        }))
        return ev;
      },
      click: (object, options) => {
        const ev = { event: 'click', object, options }; 
        this.setSteps(s => s.concat({
          label: `EVENT: Click '${object?.key}'`,
          object,
          action: 'click' 
        }))
        return ev;
      },
      blur: (object, options) => {
        const ev = { event: 'blur', object, options };
        console.log (ev)
        this.setSteps(s => s.concat({
          label: `EVENT: Blur '${object?.key}'`,
          object,
          action: 'blur' 
        }))
        return ev;
      }, 
    }
    
    setSteps (fn) { 
      this.tests[this.descriptionText].steps = 
        fn(this.tests[this.descriptionText].steps);
    }
  
    expect (fact) {
      const descriptionText = this.descriptionText;
      return {
        toBeInTheDocument: (value) =>  {
          console.log ({ descriptionText, toBeInTheDocument: value, fact });
  
          let exception = null;
          let label = '';
  
          if (!fact) {
            exception = `${descriptionText}: fact is not defined`
          }
  
          if (!value) {
            console.log ({ descriptionText, fact }) ;
          }
  
          label = !!value 
            ? `TEST: Does '${fact?.key}.value' equal '${value}'` 
            : `TEST: Does '${fact?.key}' exist`;
  
          if (!!fact && fact.value !== value) {
            exception = `${fact.value} !== ${value}`;
          }
  
          this.setSteps(s => s.concat({
            descriptionText,
            label,
            action: 'exists',
            value,
            exception,
            fact
          }))
  
          if (exception) {
            throw exception;
          }
          console.log ('%s === %s', fact.value, value)
        },
        toEqual: (value) => () => {
          let exception = fact !== value ? `${fact} !== ${value}` : null;
          this.setSteps(s => s.concat({
            descriptionText,
            action: 'equals',
            value, 
            fact
          }))
        if ( exception) {
            throw  exception;
        }
        }
      }
    }
  
    getElementById (elementId, action="lookup-by-element-id") {
      const descriptionText = this.descriptionText;
      this.setSteps(s => s.concat({
        descriptionText,
        action,
        key: elementId,
        elementId
      }))
      console.log ({ elementId });
      return {
        descriptionText,
        key: elementId,
        elementId
      }
    }
  
    async act (fn) {
      const what = await fn();
      console.log ({ what })
      return what;
    }
    
    within (object) {
      return {
        getByRole: agent => { 
          return {
            focus: () => console.log (agent, ' is SO focused!!!'),
            value: 'But I am right here!!',
            object,
            key: agent
          }
        }
      }
    }
  
    loadJest(text) { 
      const screen = this.screen; 
      const fireEvent = this.fireEvent; 
      const expect = this.expect.bind(this);
      const getElementById = this.getElementById.bind(this);
      const act = this.act.bind(this);
      const within = this.within.bind(this);
  
      const it = (description, fn) => { 
        this.descriptionText = description;
        this.tests[description] = { steps: []}
        try {
          fn()
        } catch (err) {
          console.log (err) 
        } 
      }
  
      try {
        eval(text)
      } catch (err) {
        console.log (err) 
      } 
    }
  }
  