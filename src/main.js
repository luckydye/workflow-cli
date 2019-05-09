#!/usr/bin/env node

const cli = require('./cli');

cli.addCommands(
    require('./default/ScriptConfigure'),
    require('./default/ScriptUpdate'),
    require('./default/ScriptScipts'),
    require('./webapps/ScriptGitlab'),
    require('./webapps/ScriptWebapps'),
    require('./webapps/ScriptRelease'),
    require('./webapps/ScriptRoot'),
);

cli.execute(process.argv.slice(2));
