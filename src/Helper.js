/**
 * This class contains some basic helper methods for CLI applications.
 */
export default class Helper {
    /**
     * Parses input data and returns information about input.
     * @param {string} input - Input data to parse.
     * @return {{command: String, namespace: String}}
     */
    static parseInput(input) {
        if (Object.prototype.toString.call(input) !== '[object Array]')
            input = input.split(new RegExp('(?=[A-Z ])')).map(x => x.toLowerCase().trim());

        return {
            command: input.pop(),
            namespace: input
        };
    }

    /**
     * Converts given process arguments to input data.
     * @param {string|string[]} args - Arguments source to convert input data.
     * @return {string}
     */
    static convertArgsToInput(args) {
        if (Object.prototype.toString.call(args) !== '[object Array]')
            return args.slice(2).join(' ');
        
        return args;
    }
}