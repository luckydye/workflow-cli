const cli = require('../cli');
const log = require('../logging');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = class Scripts extends cli.Command {

    static load() {
        const scripts = config.get('scripts') || {};
        for(let key in scripts) {
            if(fs.existsSync(scripts[key])) {
                let script = require(scripts[key]);
                if(script.command) {
                    script.description = script.description || scripts[key];
                    const command = Object.assign(class cmd extends cli.Command {}, script);
                    cli.addCommands(command);
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

    static add(filePath) {
        const abolutePath = path.resolve(config.location, filePath);
        const parsed = path.parse(abolutePath);

        if(parsed.name in config.get('scripts')) {
            throw `Script already added ${parsed.name}`;
        }

        let valid = Boolean(fs.existsSync(abolutePath));
        if(valid) {
            valid = Boolean(fs.statSync(abolutePath).isFile());
            valid = parsed.ext === '.js';
        }

        if(filePath && valid) {
            this.addScript(parsed.name, abolutePath);
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
        log.log(config.get('scripts'));
    }

    static removeScript(name) {
        if(!config.get('scripts')[name]) {
            throw "script not found";
        }
        delete config.get('scripts')[name];
        config.saveToFile();
        log.info('Script removed', name);
    }

    static addScript(name, path) {
        if(!path) {
            throw "provide path to script";
        }
        config.scripts = config.get('scripts') || {};
        config.scripts[name] = path;
        config.set('scripts', config.scripts);
        log.info('Script added', name);
    }
}
