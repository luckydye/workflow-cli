const Command = require('../Command');
const log = require('../Logger');
const Config = require('../Config');

module.exports = class ScriptUpdate extends Command {

    static load() {
        const lastupdate = Config.get('lastupdate');
        if(Date.now() - lastupdate > 1000 * 60 * 60 * 24 * 7) {
            log.log('Running autoupdate');
            this.execute();
        }
    }

    static command = 'update';
    static description = "update workflow-cli";

    static execute() {
        log.title('Updating workflow-cli');
        const child = this.spawnProcess('git', ['pull', 'origin', 'master'], __dirname)
        child.then(() => this.spawnProcess('npm', ['run', 'enable'], __dirname))
        Config.set('lastupdate', Date.now());
        return child;
    }
}
