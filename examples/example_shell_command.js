const { ShellCommand } = require('../src/cli.js');
const config = require('../src/config.js');

module.exports = class ShellExample extends ShellCommand {

    static command = 'example_shell';
    static description = "example shell command";

    static required = [
        'example_path'
    ];

    static executable = "dir";
    static parameters = [config.get('example_path')];

}
