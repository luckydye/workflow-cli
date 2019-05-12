#!/usr/bin/env node

const CommandLine = require('./CommandLine');

CommandLine.addCommands(
    require('./default/ScriptConfigure.js'),
    require('./default/ScriptUpdate.js'),
    require('./default/ScriptScipts.js'),
);

CommandLine.execute(process.argv.slice(2));
