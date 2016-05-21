import Helper from "./Helper";
import CommandContainer from "./CommandContainer";
import Command from "./Command";

/**
 * Main class for developing command-line based applications.
 */
class CLI {
	/**
	 * Get commands and other options of cli application from parent class.
	 */
	constructor() {
		this._commands = new CommandContainer();
		this._events = {
			'cli:run': {},
			'cli:parse-arguments': {},

			'command:add': {},
			'command:execute': {},
			'command:not-found': [],
		};

		if (!(this.constructor.prototype instanceof CLI))
			throw new Error('You can create application object from CLI class!');

		this._findCommandActions()
			.map(actionName => (
				actionName.replace(/(.*)Command$/, '$1')
			))
			.forEach(actionName => {
				this.addCommand(actionName, this[actionName + 'Command']);
			});

		this._findCommandFactories()
			.map(factoryName => (
				factoryName.replace(/(.*)CommandFactory$/, '$1')
			))
			.forEach(factoryName => {
				this.addFactory(factoryName, this[factoryName + 'CommandFactory']);
			});

	}

	/**
	 * Initiate the CLI application and execute commands.
	 * 
	 * @param {string|string[]} args - Command line arguments.
	 * @fires CLI#events: cli:start
	 */
	run(args) {
		this._runEvent('cli:run', () => {
			const input = Helper.convertArgsToInput(args)
				, command = this._commands.findOne(input);

			if (command === null)
				return this._runEvent('command:not-found', input);

			this._runEvent('command:execute', () => {
				command.execute();
			}, command);
		});
	}

	/**
	 * Bind events to the CLI application.
	 * 
	 * @param {string} [eventOrder] - Execution order of the event. This can be 
	 * 'after' or 'before'. 'before' events can return false to stop execution 
	 * of the current job. Not needed while binding instant events (not found, 
	 * failed etc.).
	 * @param {string} eventName - Name of the event that given method will be bound.
	 * @param {function} eventMethod - Method to run when the event fires.
	 */
	on() {
		let eventOrder, eventName, eventMethod, arg_i = 0;

		eventOrder = arguments.length > 2 ? arguments[arg_i++] : false && ++i;
		eventName = arguments[arg_i++];
		eventMethod = arguments[arg_i++];

		if (!(eventName in this._events)) return;

		if (eventOrder !== false && this._events[eventName].constructor !== Array) {
			if (eventOrder !== 'before' && eventOrder !== 'after') return;

			if (!('before' in this._events[eventName])) this._events[eventName].before = [];
			if (!('after' in this._events[eventName])) this._events[eventName].after = [];

			this._events[eventName][eventOrder].push(eventMethod);
		}
		else if (this._events[eventName].constructor === Array) {
			this._events[eventName].push(eventMethod);
		}
	}

	/**
	 * Adds new command to the command container.
	 * 
	 * @param {string|string[]} input - Command input to execute in cli.
	 * @param {function} [method] - Method that will be run when the command executed.
	 * @param {Command} [command] - Command object to add.
	 * @fires CLI#events: command:add
	 */
	addCommand(input, method) {
		this.addFactory(input, () => (method));
	}

	/**
	 * Adds new command to the command container using the given command
	 * factory. Command factories are used for accessing the command object 
	 * while defining a command action.
	 * 
	 * @param {string|string[]} input - Input to run the command.
	 * @param {function} factory - Factory method that returns command action as
	 * function.
	 * @fires CLI#events: command:add
	 */
	addFactory(input, factory) {
		let command = new Command()
			, method = null;

		try {
			command.method = factory.call(command);
		} catch (err) {
			throw err;
		}

		this._runEvent('command:add', () => {
			this._commands.addCommand(input, command);
		}, command);
	}

	/**
	 * Finds the command action declarations from the parent class.
	 */
	_findCommandActions() {
		return Object
			.getOwnPropertyNames(this.constructor.prototype)
			.filter(prop => (
				typeof (this[prop]) === 'function' && prop.match(/(.*)Command$/) !== null
			))
			|| [];
	}

	/**
	 * Finds the command factory declarations from the parent class.
	 */
	_findCommandFactories() {
		return Object
			.getOwnPropertyNames(this.constructor.prototype)
			.filter(prop => (
				typeof (this[prop]) === 'function' && prop.match(new RegExp('(.*)CommandFactory$')) !== null
			))
			|| [];
	}

	/**
	 * Runs the bound methods to the given event.
	 * 
	 * @param {string} eventName - Name of the event that will run.
	 * @param {function} [callback] - Callback function to run after the events
	 * fired. 'before' type events can interrupt this process by returning
	 * false.
	 * @param {...*} args - Parameters that will passed to the events.
	 */
	_runEvent() {
		let name = arguments[0]
			, event = null
			, args = [];

		if (typeof (arguments[1]) == 'function') {
			event = arguments[1];
			args = Array.prototype.slice.call(arguments, 2);
		} else {
			event = null;
			args = Array.prototype.slice.call(arguments, 1);
		}

		if (!(name in this._events))
			throw new Error(`Event '${name}' not listed in the event container!`);

		if (event === null) {
			this._events[name].every(
				event => event.apply(this, args) !== false
			);
			return;
		}

		if (this._events[name].constructor === Array) {
			this._events[name].forEach(
				boundEvent => 
				boundEvent.apply(this, args)
			);
		} else {
			const isInterrupted = this._events[name].before.every(
				boundEvent => boundEvent.apply(this, args)
			);
			
			if (!('before' in this._events[name]) || !isInterrupted) {
				event.call(this);

				if ('after' in this._events[name])
					this._events[name].after.forEach(
						event => event.apply(this, args)
					);
			}
		}
	}
}

module.exports = CLI;