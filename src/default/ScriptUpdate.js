const cli = require('../cli');
const config = require('../config');

class Update extends cli.ShellCommand {

    static command = 'update';
    static description = "update workflow-cli";

    static execute() {
        const child = this.spawnProcess('git', ['pull', 'origin', 'master'], __dirname)
        child.then(() => this.spawnProcess('npm', ['run', 'enable'], __dirname))
        config.set('lastupdate', Date.now());
        return child;
    }
}

function checkAutoUpdate() {
    const lastupdate = config.get('lastupdate');
    if(Date.now() - lastupdate > 1000 * 60 * 60 * 24 * 7) {
        cli.log('Running autoupdate');
        Update.execute();
    }
}
checkAutoUpdate();

module.exports = Update;
