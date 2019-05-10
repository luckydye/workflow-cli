const cli = require('../cli');
const log = require('../logging');
const config = require('../config');

class Update extends cli.ShellCommand {

    static load() {
        const lastupdate = config.get('lastupdate');
        if(Date.now() - lastupdate > 1000 * 60 * 60 * 24 * 7) {
            log.log('Running autoupdate');
            Update.execute();
        }
    }

    static command = 'update';
    static description = "update workflow-cli";

    static execute() {
        const child = this.spawnProcess('git', ['pull', 'origin', 'master'], __dirname)
        child.then(() => this.spawnProcess('npm', ['run', 'enable'], __dirname))
        config.set('lastupdate', Date.now());
        return child;
    }
}

module.exports = Update;
