const { ShellCommand } = require('../cli.js');
const config = require('../config');
const path = require('path');

module.exports = class Root extends ShellCommand {

    static command = 'root';
    static description = "opens config.webapps_root";

    static executable = config.get('explorer') || 'explorer';
    static parameters = [path.resolve(config.get('webapps_root'))];

}
