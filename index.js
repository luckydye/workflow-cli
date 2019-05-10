// for module import

const cli = require('./src/cli');
const config = require('./src/config');

cli.addCommands(
    require('./src/default/ScriptConfigure.js'),
    require('./src/default/ScriptUpdate.js'),
    require('./src/default/ScriptScipts.js'),
);

module.exports = {
    cli: cli,
    config: config,
    ShellCommand: cli.ShellCommand,
    Command: cli.Command
};
