const fs = require('fs');
const path = require('path');
const CommandLine = require('../CommandLine');
const Command = require('../Command');
const log = require('../Logger');
const Config = require('../Config');

module.exports = class ScriptScripts extends Command {

    static load() {
        const scripts = Config.get('scripts') || {};
        for(let key in scripts) {
            const abolutePath = path.resolve(Config.location, scripts[key]);
            if(fs.existsSync(abolutePath)) {
                let script = require(abolutePath);
                if(script.command) {
                    script.description = script.description || scripts[key];
                    const command = Object.assign(class cmd extends Command {}, script);
                    CommandLine.addCommands(command);
                } else {
                    log.error('Script', key, 'has no command defined.');
                }
            } else {
                log.warn('Script not found:', scripts[key]);
            }
        }
    }

    static command = "scripts";
    static alias = "s";
    static description = "use custom scripts";

    static arguments = [
        {
            command: 'add',
            usage: "<path>",
            description: "add script path to scripts",
            execute: (args) => this.add(...args)
        },
        {
            command: 'remove',
            usage: "<name>",
            description: "remove script from scripts",
            execute: (args) => this.remove(...args)
        },
        {
            command: 'show',
            description: "show all scripts",
            execute: (args) => this.show(...args)
        }
    ]

    static add(filePath) {
        const abolutePath = path.resolve(Config.location, filePath);
        const parsed = path.parse(abolutePath);

        if(parsed.name in Config.get('scripts')) {
            throw `Script already added ${parsed.name}`;
        }

        let valid = Boolean(fs.existsSync(abolutePath));
        if(valid) {
            valid = Boolean(fs.statSync(abolutePath).isFile());
            valid = parsed.ext === '.js';
        }

        if(filePath && valid) {
            this.addScript(parsed.name, filePath);
        } else {
            throw `Inavlid script path ${abolutePath}`;
        }
    }

    static remove(name) {
        if(name) {
            this.removeScript(name);
        } else {
            throw `Inavlid options "${name}"`;
        }
    }

    static show() {
        log.log(Config.get('scripts'));
    }

    static removeScript(name) {
        if(!Config.get('scripts')[name]) {
            throw "script not found";
        }
        delete Config.get('scripts')[name];
        Config.saveToFile();
        log.info('Script removed', name);
    }

    static addScript(name, path) {
        if(!path) {
            throw "provide path to script";
        }
        const scripts = Config.get('scripts') || {};
        scripts[name] = path;
        Config.set('scripts', scripts);
        log.info('Script added', name);
    }
}
