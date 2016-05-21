import Command from "./Command";
import Helper from "./Helper";

/**
 * Class for storing the commands.
 */
export default class CommandContainer {
	/**
	 * Sets defaults for the command container.
	 */
	constructor(namespace = '') {
		this._commands = {};
	}

	/**
	 * Stores new command to the container.
	 * @param {string|string[]} input - Input to run command.
	 * @param {function|Commanıd} method - Command object or function that will run
	 * when the command executed.
	 * @param {string} description - Command description.
	 */
	addCommand(input, method, description = '') {
		input = Helper.parseInput(input);

		let command = new Command()
			, commandNamespace = input.namespace
			, commandText = input.command
			, commandAction;

		if (Object.prototype.toString.call(method) !== '[object Command]') {
			command = method;
		} else {
			command.description = description;
			command.text = commandText;
			command.method = method;
		}

		commandNamespace.push('__commands');
		commandNamespace.push(commandText);
		commandNamespace = commandNamespace.reverse().reduce((p, c) => {
			let x = {};
			x[c] = p;
			return x;
		}, command);

		this._commands = this._pushNamespaceToCommands(this._commands, commandNamespace);
	}

	/**
	 * Finds all commands from the given namespace.
	 * 
	 * @param {string|string[]} namespace - Namespace of the commands.
	 */
	findAll(namespace) {
		if (Object.prototype.toString.call(namespace) !== '[object Array]')
			namespace = namespace.split(' ');

		let tempCommands = this._commands;

		namespace.every(ns => {
			tempCommands = tempCommands[ns];

			return tempCommands !== undefined;
		});

		if (tempCommands === undefined || tempCommands.__commands === undefined || tempCommands.__commands.length === 0)
			return [];

		return tempCommands.__commands;
	}

	/**
	 * Finds one command from the given namespace.
	 * 
	 * @param {string} [input] - Input of the command (`?namespace` `command_text`).
	 * @param {string} namespace - Namespace of the command.
	 * @param {string} text - Text of the command.
	 * @return {Command}
	 */
	findOne() {
		let namespace
			, command;
			
		if(arguments.length === 1) {
			const input = Helper.parseInput(arguments[0]);
			namespace 	= input.namespace,
			command 		= input.command;
		} else {
			namespace = arguments[0];
			command 	= arguments[1];
		}
		
		const commands = this.findAll(namespace);

		if (commands[command] !== undefined)
			return commands[command];
		else
			return null;
	}

	/**
	 * Pushes new namespace and merges the command container.
	 */
	_pushNamespaceToCommands() {
		var extended = {};
		var i = 0;
		var length = arguments.length;

		// Merge the object into the extended object
		var merge = function (obj) {
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					// If deep merge and property is an object, merge properties
					if (Object.prototype.toString.call(obj[prop]) === '[object Object]' && obj[prop].constructor.name !== 'Command') {
						extended[prop] = this._pushNamespaceToCommands(extended[prop], obj[prop]);
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