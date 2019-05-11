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
                const script = require(scripts[key]);
                script.description = script.description || scripts[key];
                if(script.command) {
                    cli.addCommands(script);
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
        let valid = Boolean(fs.existsSync(filePath));
        if(valid) {
            valid = Boolean(fs.statSync(filePath).isFile());
            let ext = filePath.split(".");
            ext = ext[ext.length-1];
            valid = ext === 'js';
        }
        const abolutePath = path.resolve(process.env.USERPROFILE, filePath);

        if(filePath && valid) {
            const p = filePath.split("/")[0].split("\\");
            this.addScript(p[p.length-1].split(".")[0], abolutePath);
        } else {
            throw `Inavlid path ${abolutePath}`;
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
        for(let script in config.get('scripts')) {
            log.log(script, config.get('scripts')[script], script.description);
        }
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
