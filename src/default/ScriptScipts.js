const cli = require('../cli.js');
const config = require('../config.js');
const fs = require('fs');

function initScripts() {
    const scripts = config.get('scripts') || {};

    for(let key in scripts) {
        if(fs.existsSync(scripts[key])) {
            const script = require(scripts[key]);
            const command = {
                command: script.command,
                alias: script.alias,
                description: script.description || scripts[key],
                execute: (args) => {
                    if(script.execute) {
                        script.execute(args);
                    } else {
                        throw 'Missing execute function in script';
                    }
                }
            }
            cli.addCommands(command);
        } else {
            cli.warn('Script not found:', scripts[key]);
        }
    }
}

initScripts();

module.exports = class Scripts extends cli.Command {

    static command = "scripts";
    static alias = "s";
    static description = "use custom scripts";

    static arguments = [
        {
            command: 'add',
            description: "<path> add script path to scripts",
            execute: (args) => this.add(...args)
        },
        {
            command: 'remove',
            description: "<name> remove script from scripts",
            execute: (args) => this.remove(...args)
        },
        {
            command: 'show',
            description: "show all scripts",
            execute: (args) => this.show(...args)
        }
    ]

    static add(path) {
        if(path) {
            const p = path.split("/")[0].split("\\");
            this.addScript(p[p.length-1].split(".")[0], path);
        } else {
            throw `Inavlid options ${arguments}`;
        }
    }

    static remove(name) {
        if(name) {
            this.removeScript(name);
        } else {
            throw `Inavlid options ${arguments}`;
        }
    }

    static show() {
        for(let script in config.get('scripts')) {
            cli.log(script, config.get('scripts')[script], script.description);
        }
    }

    static removeScript(name) {
        if(!config.get('scripts')[name]) {
            throw "script not found";
        }
        delete config.get('scripts')[name];
        config.saveToFile();
    }

    static addScript(name, path) {
        if(!path) {
            throw "provide path to script";
        }
        config.scripts = config.get('scripts') || {};
        config.scripts[name] = path;
        config.saveToFile();
    }
}
