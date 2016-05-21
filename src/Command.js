/**
 * This is the base class for Command objects. Commands object contain the basis
 * of the command including input options and command action.
 */
export default class Command {
	/**
	 * Define defaults for command object.
	 */
	construct(method) {
		this._method = method || (() => { });
		this._text = '';
		this._description = '';
		this.arguments = [];
	}

	/**
	 * Executes the command.
	 */
	execute() {
		return this._method.apply(this);
	}

	get description() {
		return this._description;
	}

	set description(description) {
		this._description = String(description);
	}

	set text(text) {
		this._text = text;
	}

	get text() {
		return this._text;
	}

	set method(method) {
		this._method = method;
	}
}