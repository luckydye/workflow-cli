const chalk = require('chalk');
const log = require('./Logger');

module.exports = class Command {

    // command name
    static command = "";

    // command description
    static description = "";

    // command description
    static usage = "";

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

    // script loading
    static load(args) {
        
    }

    // execute command
    static execute(args) {
        // initialize arguemnts
        for(let arg of this.arguments) {
            if(arg.load) arg.load(args);
        }

        if(this.executable !== null) {
            this.spawnProcess(this.executable, [...this.parameters, ...args.slice(1)]);
        } else {
            if(args.length < 1) {
                this.help();
                return;
            } else {
                this.resolvearguments(args);
            }
        }
    }

    // resolve command arguments
    static resolvearguments(args) {
        const config = require('./Config.js');
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
            log.error("Invalid argument");
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
                        message: `Enter value for config paramter: ${param}\n>`
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
        return this.spawnChildProcess(exe, args, {
            stdio: 'inherit',
            cwd: root ? root : process.cwd(),
            shell: true
        });
    }

    static spawnChildProcess(exe, args, options = {
        stdio: 'pipe'
    }) {
        return new Promise((resolve, reject) => {
            const { spawn } = require("child_process");
            const child = spawn(exe, args, options);
            let data = [];
            if(child.stdout) {
                child.stdout.on('data', part => {
                    data.push(part.toString());
                })
            }
            child.on('exit', code => {
                if(code != 0) {
                    reject(code);
                } else {
                    resolve(data);
                }
            });
        }).catch(err => {
            log.error('Command exited with code', err);
        })
    }
    
    // display all available arguments to the console
    static help() {
        log.headline(`Available arguments${this.command ? ' for ' + this.command : ''}:`);
        const columnWidth = 15;
        log.list(this.arguments.filter(arg => arg.command).map(arg => {
            let isNew = (Date.now() - arg.added) < (1000 * 60 * 60 * 24 * 7 * 2);
            return [
                arg.command.padEnd(columnWidth, ' ').replace(arg.alias, chalk.underline(arg.alias)),
                (arg.usage ? arg.usage : '').padEnd(columnWidth, ' '),
                (isNew ? chalk.green.bold('new') : '   ') + '  ',
                arg.description || "no desciption"
            ]
        }));
    }
    
}
