const CLI = require('../../dist');

class ExampleApp extends CLI {
    testCommand() {
        console.log('Hello CLI!');
    }
}

const app = new ExampleApp();
app.run(process.argv);