
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
    
    setSteps (action) { 
      this.tests[this.descriptionText].steps = 
        action(this.tests[this.descriptionText].steps);
    }
  
    expect (fact) {
      const descriptionText = this.descriptionText;
      return {
        toBeInTheDocument: (value) =>  { 
  
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
          }));

          if (exception) {
            throw exception;
          }
          console.log ('%s === %s', fact.value, value);
        },
        toEqual: (value) => { 
          const exception = fact !== value ? `${fact} !== ${value}` : null;
          const label = `TEST: Does '${fact}' = '${value}'`;
          this.setSteps(s => s.concat({
            label,
            descriptionText,
            action: 'equals',
            value, 
            fact
          }));

          if ( exception) {
            throw exception;
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
  
    async act (action) {
      const what = await action();
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

    it (description, action) {
      this.descriptionText = description;
      this.tests[description] = { steps: []};

      try {
        action();
      } catch (err) {
        // TODO: add setException method
        console.log (err);
      } 
    }
  
    loadJest(code) { 
      const screen = this.screen; 
      const fireEvent = this.fireEvent; 
      const expect = this.expect.bind(this);
      const getElementById = this.getElementById.bind(this);
      const act = this.act.bind(this);
      const within = this.within.bind(this);
      const it = this.it.bind(this); 
  
      try {
        eval(code);
      } catch (err) {
         // TODO: add setException method
        console.log (err); 
      } 
    }
  }
  