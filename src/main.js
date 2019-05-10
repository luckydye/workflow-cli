#!/usr/bin/env node

const cli = require('./cli');

cli.addCommands(
    require('./default/ScriptConfigure.js'),
    require('./default/ScriptUpdate.js'),
    require('./default/ScriptScipts.js'),
);

cli.execute(process.argv.slice(2));
