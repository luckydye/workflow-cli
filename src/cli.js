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

    // timestamp of creation for new higlighting
    static added = 0;
    
    // executable path
    static executable = null;

    // executable parameters
    static parameters = [];

    // execute command
    static execute(args) {
        // initialize arguemnts
        for(let arg of this.arguments) {
            if(arg.load) arg.load();
        }

        if(args.length < 1) {
            this.help();
            return;
        }

        if(this.executable !== null) {
            this.spawnProcess(this.executable, [...this.parameters, ...args.slice(1)]);
        } else {
            this.resolvearguments(args);
        }
    }

    // script loading
    static load(args) {
        
    }

    // resolve command arguments
    static resolvearguments(args) {
        const config = require('./config.js');
        const command = args[0];

        let valid = false;

        for(let arguemnt of this.arguments) {
            if(arguemnt.command) {
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
        }

        if(!valid) {
            log.info("Invalid argument");
            this.help();
        }
    }

    // check if required config params are set
    static async checkConfigParams(command, config) {
        const requiredParams = command.required || [];
        
        for(let param of requiredParams) {
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
    
    // display all available arguments to the console
    static help() {
        const header = `Available arguments${this.command ? ' for ' + this.command : ''}:`;
        log.headline(header);
        
        for(let arg of this.arguments) {
            if(arg.command) {
                let command = arg.command.padEnd(12, " ");
                let desciption = arg.description || "no desciption";
                let isNew = (Date.now() - arg.added) < (1000 * 60 * 60 * 24 * 7 * 2);
                if(arg.alias) {
                    command = command.replace(arg.alias, chalk.underline(arg.alias));
                }
                log.log(` ${command} ${isNew ? chalk.green.bold('new') : '   '} | ${desciption}`);
            }
        }
        log.log();
    }
}

module.exports = class cli extends Command {

    static get Command() {
        return Command;
    }

    static get ShellCommand() {
        return Command;
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
            if(this.arguments.indexOf(cmd) === -1) {
                this.arguments.push(cmd);
            }
        }
    }
}
