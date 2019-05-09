#!/usr/bin/env node

const cli = require('./cli');

cli.addCommands(
    require('./default/ScriptConfigure'),
    require('./default/ScriptUpdate'),
    require('./default/ScriptScipts'),
);

cli.execute(process.argv.slice(2));
