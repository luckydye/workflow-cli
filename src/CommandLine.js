const Command = require('./Command');
const Interface = require('./Interface');
const log = require('./Logger');

module.exports = class CommandLine extends Command {

    static arguments = [
        {
            command: 'help',
            description: "displays this",
            execute: this.help.bind(this)
        }
    ]

    static addCommands(...cmds) {
        for(let cmd of cmds) {
            if(this.arguments.indexOf(cmd) === -1) {
                this.arguments.push(cmd);
            }
        }
    }
}
