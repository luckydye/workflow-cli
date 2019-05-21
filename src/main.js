#!/usr/bin/env node

const CommandLine = require('./CommandLine');

CommandLine.addCommands(
    require('./default/ScriptConfigure'),
    require('./default/ScriptUpdate'),
    require('./default/ScriptScipts'),
);

CommandLine.execute(process.argv.slice(2));
