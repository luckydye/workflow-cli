// for module import

const Interface = require('./src/Interface');
const Command = require('./src/Command');
const CommandLine = require('./src/CommandLine');
const Config = require('./src/Config');
const log = require('./src/Logger');

cli.addCommands(
    require('./src/default/ScriptConfigure'),
    require('./src/default/ScriptUpdate'),
    require('./src/default/ScriptScipts'),
);

module.exports = {
    Config: Config,
    CommandLine: CommandLine,
    Command: Command,
    Interface: Interface,
    log: log
};
