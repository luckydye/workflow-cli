const chalk = require('chalk');

let lastlog = "";

function formatPrefix(str, loglevel) {
    let prefix = lastlog == loglevel ? '' : str;
    prefix = prefix.padEnd(5, " ");
    lastlog = loglevel;
    return prefix;
}

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

    static prefix = "";

    static log(...str) {
        if(this.prefix) {
            let prefix = formatPrefix(this.prefix, 0);
            console.log(prefix, ...str);
        } else {
            lastlog = 0;
            console.log(...str);
        }
    }

    static error(...str) {
        let prefix = formatPrefix('Error', 1);
        console.error(chalk.bgWhite.red(prefix), ...str);
    }

    static info(...str) {
        let prefix = formatPrefix('Info', 2);
        console.log(chalk.bgWhite.black(prefix), ...str);
    }

    static warn(...str) {
        let prefix = formatPrefix('Warning', 3);
        console.log(chalk.bgBlack.yellow(prefix), ...str);
    }

    static headline(str) {
        lastlog = 0;
        console.log(chalk.black.bgWhite('\n', str.padEnd(52, " ")), "\n");
    }

    static updateLine(logType, str, linecount = 1) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0, process.stdout.rows - (linecount+1));
        this[logType](str);
    }

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
                        this.error(err);
                    })
                } catch(err) {
                    this.error('Error executing command:', err);
                }
                break;
            }
        }

        if(!valid) {
            this.info("Invalid argument");
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
        this.headline(header);
        
        for(let arg of this.arguments) {
            let command = arg.command.padEnd(12, " ");
            if(arg.alias) {
                command = command.replace(arg.alias, chalk.underline(arg.alias));
            }
            this.log(` ${command}  |  ${arg.description || "no desciption"}`);
        }
        this.log();
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
            this.error('Command exited with code', err);
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
