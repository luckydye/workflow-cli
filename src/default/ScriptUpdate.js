const Command = require('../Command');
const log = require('../Logger');
const Config = require('../Config');

module.exports = class ScriptUpdate extends Command {

    static async load() {
        const uptodate = await this.checkUpToDate();
        if(!uptodate) {
            log.info('Update available!');
            log.info('Run "update" to update');
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

    static async checkUpToDate() {
        // git show-branch --list origin/master master
        return Command.spawnChildProcess('git', ["show-branch", "--list", "origin/master", "master"], {
            cwd: __dirname
        }).then(data => {
            const lines = data[0].split("\n").map(line => {
                const str = line.replace(/[\'|\"]/g, "").match(/\] .*/g);
                return str ? str[0] : str;
            });
            return lines[0].match(lines[1]);
        })
    }
}
