/**
 * CLI Framework for developing command-line
 * based applications easily.
 */
class CLI {
	/**
	 * CLI constructor
	 * Parse extended class that contains methods for cli application.
	 */
	constructor() {
		this._commands = {};
		this._events = {
			'cli:start': {},
			'cli:parse-arguments': {},

			'command:execute': {},
			'command:not-found': [],
			'command:action-not-found': []
		};

		this._findCommandActions()
			.map(actionName => (
				actionName.replace(new RegExp('(.*)Command'), '$1')
			))
			.forEach(actionName => {
				this.addCommand(actionName, this[actionName + 'Command']);
			});
	}

	/**
	 * Initiate the CLI application and parse command line arguments.
	 * @param {string|string[]} args - Command line arguments.
	 * @fires CLI#events: cli:start
	 */
	run(args) {
		this._runEvent('cli:start', function () {
			let command;

			this._runEvent('cli:parse-arguments', function () {
				command = this._parseArguments(args);
			}.bind(this));

			if (command === null)
				return this._runEvent('command:not-found');
			else if (!('__action' in command))
				this._runEvent('command:action-not-found');

			this._runEvent('command:execute', (() => {
				command.__action.call(this);
			}).bind(this), command);
		}.bind(this));
	}

	/**
	 * Bind events to the CLI application.
	 * @param {string} eventOrder - Execution order of the event. This can be 'after' or 'before', before events can return false to stop execution of the current job. Not needed while binding instant events (not found, failed etc.).
	 * @param {string} eventName - Name of the event that given method will be bound.
	 * @param {function} eventMethod - Main method for the command.
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
	 * @param {string|string[]} input - Command input to execute in cli.
	 * @param {function} method - Method that will be run when the command executed.
	 */
	addCommand(input, method) {
		if (input.constructor !== Array)
			input = input.split(new RegExp('(?=[A-Z ])')).map(x => x.toLowerCase());

		let baseCommand = input.shift();
		let subCommands = input;

		if (subCommands.length > 0) {
			let subCommandObject = subCommands.reverse().reduce((p, c) => {
				let x = {};
				x[c] = p;
				return x;
			}, {
					'__action': method
				});

			this._commands[baseCommand] = this._extendCommand(true, this._commands[baseCommand], subCommandObject);
		} else {
			this._commands[baseCommand] = {
				'__action': method
			};
		}
	}

	/**
	 * @param {string[]} args - Arguments data to parse.
	 * @fires CLI#events: command:not-found
	 */
	_parseArguments(args) {
		args = args.slice(2);

		let command = null;

		args.every(argument => {
			let commandContainer = command == null ? this._commands : command;

			if (typeof (commandContainer[argument]) != 'undefined') {
				command = commandContainer[argument];
				return true;
			} else {
				command = null;
				return false;
			}
		});

		return command;
	}

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

		if (!(name in this._events)) {
			throw new Error(`Event '${name}' not listed in the event container!`);
		}

		if (event === null) {
			this._events[name].every(event => event.apply(this, args) !== false);
			return;
		}

		if (this._events[name].constructor === Array) {
			this._events[name].forEach(boundEvent => boundEvent.apply(this, args));
		} else {
			if (!('before' in this._events[name]) || this._events[name].before.every(boundEvent => boundEvent.apply(this, args))) {
				event();

				if ('after' in this._events[name]) {
					this._events[name].after.forEach(event => event.apply(this, args));
				}
			}
		}
	}

	/**
	 * Search properties of base class for command actions.
	 * @callback callback - Runs while looping command actions that are found in the base class.
	 */
	_findCommandActions(callback) {
		return Object
			.getOwnPropertyNames(this.constructor.prototype)
			.filter(prop => (
				typeof (this[prop]) === 'function' && prop.match(new RegExp('(.*)Command')) !== null
			))
			|| [];
	}

	/**
	 * Extend base or sub commands with another sub commands.
	 */
	_extendCommand() {
		var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
			deep = arguments[0];
			i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					// If deep merge and property is an object, merge properties
					if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = this._extendCommand(true, extended[prop], obj[prop]);
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
    };

    // Loop through each object and conduct a merge
    for (; i < length; i++) {
			var obj = arguments[i];
			merge.bind(this, obj)();
    }

    return extended;
	}
}

module.exports = CLI;