// for module import

const cli = require('./src/cli');
const config = require('./src/config');
const log = require('./src/logging');

cli.addCommands(
    require('./src/default/ScriptConfigure'),
    require('./src/default/ScriptUpdate'),
    require('./src/default/ScriptScipts'),
);

module.exports = {
    cli: cli,
    config: config,
    ShellCommand: cli.ShellCommand,
    Command: cli.Command,
    log: log
};
