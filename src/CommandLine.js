const Command = require('./Command');

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

    static getCommand(commandName) {
        for(let cmd of this.arguments) {
            if(cmd.command === commandName) {
                return cmd;
            }
        }
    }
}
