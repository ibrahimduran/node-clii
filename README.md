# node-cli
CLI Framework for developing command-line based applications in NodeJS.

### TODO (v0.2.0)
* [ ] Command arguments and options
* [ ] Event ordering and interupting
* [ ] Command descriptions
* [ ] Automaticily generated help command

### Basic Usage
**IMPORTANT NOTE** _You will need EcmaScript version 6 supported compiler to run this example directly. Otherwise take a look at [Babel](https://babeljs.io/) for working with es6._

1. Install the package named `node-clii` through npm.
2. Create your cli application class and extend it with `node-clii` by requiring the package.
  ```javascript
  const CLI = require('node-clii');
  class MyAwesomeCLI extends CLI {
  }
  ```
  
3. Setup command actions.
  ```javascript
  class MyAwesomeCLI extends CLI {
    helloCommand() {
      console.log('Hello CLI!');
    }
    
    fooBarCommand() {
      console.log('You have just run a sub command!');
    }
  }
  ```
  
4. Create an instance of your class and run it.
  ```javascript
  const myAwesomeApp = new MyAwesomeCLI();
  myAwesomeApp.run(process.argv);
  ```

5. Try running theese commands.
  ```
  $ node filename.js hello
  Hello CLI!
  $ node filename.js foo bar
  You have just run a sub command!
  ```
