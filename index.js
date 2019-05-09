// for module import

const cli = require('./cli');

cli.addCommands(
    require('./default/ScriptConfigure'),
    require('./default/ScriptUpdate'),
    require('./default/ScriptScipts'),
);

module.exports = cli;