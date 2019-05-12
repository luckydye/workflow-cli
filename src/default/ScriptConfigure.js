const Command = require('../Command');
const log = require('../Logger');
const Config = require('../Config');

module.exports = class ScriptConfigure extends Command {

    static command = 'config';
    static alias = 'c';
    static description = 'modify config';

    static arguments = [
        {
            command: "set",
            usage: "<key> <value>",
            description: "set config parameter",
            execute: (args) => this.set(...args)
        },
        {
            command: "show",
            description: "display config",
            execute: (args) => this.show()
        }
    ]

    static set(key, value) {
        Config.set(key, value);
    }

    static show() {
        log.log(Config.list());
    }

}
