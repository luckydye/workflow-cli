const cli = require('../cli.js');
const config = require('../config.js');

module.exports = class Configure extends cli.Command {

    static command = 'config';
    static alias = 'c';
    static description = 'modify config';

    static arguments = [
        {
            command: "set",
            description: "<key> <value> set config parameter",
            execute: (args) => this.set(...args)
        },
        {
            command: "show",
            description: "display config",
            execute: (args) => this.show()
        }
    ]

    static set(key, value) {
        config.set(key, value);
    }

    static show() {
        const configObject = {};
        for(let key in config) {
            if(typeof config[key] != "function") {
                configObject[key] = config[key];
            }
        }
        cli.log(configObject);
    }

}