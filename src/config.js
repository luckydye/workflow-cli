const fs = require('fs');
const path = require('path');
const log = require('./Logger');

const CONFIG_NAME = require('../package.json').name+'.json';
const CONFIG_PATH = path.resolve(process.env.USERPROFILE, CONFIG_NAME);
const ALT_CONFIG_PATH = path.resolve(process.cwd(), CONFIG_NAME);

let configStore = {};
let configLocation = null;

function loadFromFile() {
    try {
        if(fs.existsSync(ALT_CONFIG_PATH)) {
            log.info('Using local config');
            configLocation = ALT_CONFIG_PATH;
        } else if(!fs.existsSync(CONFIG_PATH)) {
            this.saveToFile();
            log.info("Config created");
            configLocation = CONFIG_PATH;
        } else {
            configLocation = CONFIG_PATH;
        }
        configStore = require(configLocation);
    } catch(err) {
        log.error('Error getting config file', err);
    }
}

function saveToFile() {
    const err = fs.writeFileSync(CONFIG_PATH, JSON.stringify(configStore, null, '\t'));
    if(err) return log.error(err);
}

loadFromFile();

module.exports = class Config {

    static get location() {
        return path.parse(configLocation).dir;
    }

    static set(key, value) {
        if(key && value) {
            configStore[key] = value;
            saveToFile();
        }
    }

    static get(key) {
        const value = configStore[key];
        if(!value) {
            this.set(key, "");
        }
        return value;
    }

    static list() {
        return configStore;
    }

    static saveToFile() {
        saveToFile();
    }

}
