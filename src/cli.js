const chalk = require('chalk');
const config = require('./config');
const log = require('./logging');

class Command {

    // command name
    static command = "";
    // command description
    static description = "";
    // command alias
    static alias = null;
    // command arguments/commands
    static arguments = [];
    // required config parameters for this command
    static required = [];

    // execute command
    static execute(args) {
        if(args.length > 0) {
            this.resolvearguments(args);
        } else {
            this.help();
        }
    }

    // resolve command arguments
    static resolvearguments(args) {
        const config = require('./config.js');
        const command = args[0];

        let valid = false;

        for(let arguemnt of this.arguments) {
            const cmdTest = arguemnt.command === command;
            const aliasTest = arguemnt.alias && arguemnt.alias === command;

            if( cmdTest || aliasTest ) {
                valid = true;
                try {
                    this.checkConfigParams(arguemnt, config).then(() => {
                        return arguemnt.execute(args.slice(1));
                    }).catch(err => {
                        log.error(err);
                    })
                } catch(err) {
                    log.error('Error executing command:', err);
                }
                break;
            }
        }

        if(!valid) {
            log.info("Invalid argument");
            this.help();
        }
    }

    // check if required config params are set
    static async checkConfigParams(command, config) {
        if(command.required) {
            for(let param of command.required) {
                if(!config.get(param)) {
                    const inquirer = require('inquirer');
                    function ask() {
                        return inquirer.prompt([{
                            type: "input",
                            name: 'input',
                            message: `Missing config parameter: ${param}\n>`
                        }]).then(answers => {
                            if(!answers.input) {
                                return ask();
                            } else {
                                config.set(param, answers.input);
                            }
                        });
                    }
                    return ask();
                }
            }
        }
    }
    
    // display all available arguments to the console
    static help() {
        const header = `Available arguments${this.command ? ' for ' + this.command : ''}:`;
        log.headline(header);
        
        for(let arg of this.arguments) {
            let command = arg.command.padEnd(12, " ");
            if(arg.alias) {
                command = command.replace(arg.alias, chalk.underline(arg.alias));
            }
            log.log(` ${command}  |  ${arg.description || "no desciption"}`);
        }
        log.log();
    }

    static spawnProcess(exe, args, root) {
        return new Promise((resolve, reject) => {
            const { spawn } = require("child_process");
            const child = spawn(exe, args, {
                stdio: 'inherit',
                cwd: root ? root : process.cwd(),
                shell: true
            });
            child.on('exit', code => {
                if(code == 0) {
                    resolve(code);
                } else {
                    reject(code);
                }
            });
        }).catch(err => {
            log.error('Command exited with code', err);
        })
    }

    static async contextSelection(title, arr) {
        return new Promise((resolve, reject) => {
            require('inquirer').prompt([{
                type: "list",
                name: 'selection',
                message: title,
                choices: arr
            }]).then(answers => {
                resolve(answers);
            });
        })
    }
}

class ShellCommand extends Command {
    
    static command = "shell";
    static description = "executes shell script";
    
    // executable path
    static executable = "bash";
    // executable parameters
    static parameters = ["echo", "test shell script"];
    
    static execute(args) {
        this.spawnProcess(this.executable, [...this.parameters, ...args]);
    }
}

module.exports = class cli extends Command {

    static get Command() {
        return Command;
    }

    static get ShellCommand() {
        return ShellCommand;
    }

    static get config() {
        return config;
    }

    static arguments = [
        {
            command: 'help',
            description: "displays this",
            execute: this.help.bind(this)
        }
    ]

    static addCommands(...cmds) {
        for(let cmd of cmds) {
            this.arguments.push(cmd);
        }
    }
}
