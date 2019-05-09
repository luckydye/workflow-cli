const cli = require('../cli.js');
const chalk = require('chalk');
const config = require('../config.js');
const Projects = require('./Projects');
const fs = require('fs');

module.exports = class Webapps extends cli.Command {

    static command = 'webapps';
    static alias = 'app';
    static description = 'manage webapps';

    static required = [
        "context_template",
        "webapps_root"
    ]

    static arguments = [
        {
            command: "setupAll",
            description: "setup context files for all projects",
            execute: (args) => this.createAllMissingContextFiles()
        },
        {
            command: "deleteAll",
            description: "delete context files for all projects",
            execute: (args) => this.deleteAllContextFiles()
        },
        {
            command: "setup",
            description: "<project_name> setup context for a single project",
            execute: (args) => {
                this.setupProject(...args).catch(err => {
                    this.error(err);
                })
            }
        }
    ]

    static async setupProject(projectName) {
        if(!projectName) throw "Provide project name";

        const projectPath = await Projects.findProject(config.get('webapps_root'), projectName);
        if(!projectPath) throw "Project not found: " + projectName;

        const contextPath = Projects.findContextFile(projectPath);
        if(!contextPath) {
            await Projects.createProjectContext(projectPath, config.get('context_template'));
            this.info("Context created in " + projectPath);
        } else {
            this.info("Context exists in " + projectPath);
        }

        this.info(`Project ${projectPath} is setup`);
    }

    static async createAllMissingContextFiles() {
        this.headline('Setting up all projects');
        
        const projects = Projects.findInPath({ startPath: config.get('webapps_root') });
        
        let counter = 1;
        for(let projectPath of projects) {

            const status = ' ' + counter++ + '/' + projects.length + ' ';
            const templateFile = config.get('context_template');

            if(!Projects.findContextFile(projectPath)) {
                this.info(status, 'checking', projectPath);
                await Projects.createProjectContext(projectPath, templateFile);
                this.updateLine('info', chalk.green(status, 'context created for', projectPath, '√'));
            } else {
                this.info(status, 'checked', projectPath, '√');
            }
        }
        this.log();
    }

    static async deleteAllContextFiles() {
        this.headline('Clearing all projects');
        
        const projects = Projects.findInPath({ startPath: config.get('webapps_root') });
        
        let counter = 1;
        for(let projectPath of projects) {
            const status = ' ' + counter++ + '/' + projects.length + ' ';
            const contextPath = Projects.findContextFile(projectPath);

            if(contextPath) {
                this.info(status, 'searching', projectPath);
                fs.unlinkSync(contextPath);
                this.updateLine('info', chalk.yellow(status, 'context deleted for', projectPath, '√'));
            } else {
                this.info(status, 'no context in', projectPath, '√');
            }
        }
        this.log();
    }

}
