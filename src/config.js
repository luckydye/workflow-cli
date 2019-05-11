const fs = require('fs');
const path = require('path');
const log = require('./logging');

const CONFIG_NAME = require('../package.json').name+'.json';
const CONFIG_PATH = path.resolve(process.env.USERPROFILE, CONFIG_NAME);
const ALT_CONFIG_PATH = path.resolve(process.cwd(), CONFIG_NAME);

class Config {

    static getInstance() {
        if(!globalThis.config) {
            globalThis.config = new Config();
        }
        return globalThis.config;
    }

    constructor() {
        this.store = {};
        this.loadFromFile();
    }

    set(key, value) {
        if(key && value) {
            this.store[key] = value;
            this.saveToFile();
        }
    }

    get(key) {
        const value = this.store[key];
        if(!value) {
            this.set(key, "");
        }
        return value;
    }

    saveToFile() {
        const err = fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.store, null, '\t'));
        if(err) return log.error(err);
    }

    loadFromFile() {
        try {
            if(fs.existsSync(ALT_CONFIG_PATH)) {
                log.info('Using local config');
                this.store = require(ALT_CONFIG_PATH);
            }
            if(!fs.existsSync(CONFIG_PATH)) {
                this.saveToFile();
                log.info("Config created");
                this.store = require(CONFIG_PATH);
            } else {
                this.store = require(CONFIG_PATH);
            }
        } catch(err) {
            log.error('Error getting config file', err);
        }
    }

}

module.exports = Config.getInstance();
