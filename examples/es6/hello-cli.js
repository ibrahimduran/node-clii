const CLI = require('../../dist');

class ExampleApp extends CLI {
    testCommand() {
        console.log('Hello CLI!');
    }
    
    factoryExampleCommandFactory() {
        this.description = 'Example of command factory.';
        
        return () => {
          console.log('You\'ve just a run a sub command that was added using command factories.');  
        };
    }
}

const app = new ExampleApp();
app.run(process.argv);