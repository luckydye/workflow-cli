const { ShellCommand } = require('../cli.js');
const config = require('../config.js');
const Projects = require('./Projects');

module.exports = class Release extends ShellCommand {

    static command = 'release';
    static alias = 'r';
    static description = "[<project name>] release webapp";

    static required = [
        'release_script',
        'webapps_root'
    ];

    static executable = "mvn";
    static parameters = [config.get('release_script')];

    static execute(args) {
        this.cleanRelease();
        if(args[0]) {
            const root = [
                config.get('webapps_root'),
                config.get('fragments_root')
            ];
            Projects.findProject(root, args[0]).then(projectPath => {
                if(projectPath) {
                    this.info('releasing', projectPath);
                    this.spawnProcess(this.executable, [...this.parameters, ...args], projectPath);
                } else {
                    this.info('No projects found in', root, 'for', args[0]);
                }
            }).catch(err => {
                this.error(err);
            })
        } else {
            this.spawnProcess(this.executable, [...this.parameters, ...args]);
        }
    }

    static cleanRelease() {
        this.info("Release clean");
    }

}
