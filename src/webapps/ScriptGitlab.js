const fetch = require('node-fetch');
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const simpleGit = require('simple-git')();

const cli = require('../cli.js');
const config = require('../config.js');

module.exports = class Gitlab extends cli.Command {

    static command = 'gitlab';
    static alias = 'g';
    static description = "gitlab projects tool";

    static required = [
        "gitlab_url",
        "private_token",
        "webapps_root"
    ];

    static arguments = [
        {
            command: "cloneAll",
            description: "clone all gitlab webapp projects",
            execute: () => {
                this.getAllProjectsFrom('webapps');
            }
        },
        {
            command: "updateAll",
            description: "update all gitlab webapp projects",
            execute: () => {
                this.updateAllProjectsFrom('webapps');
            }
        },
        {
            command: "list",
            description: "list of all gitlab projects",
            execute: () => {
                this.getProjectList('webapps').then(list => {
                    this.listPorjects(list);
                })
            }
        }
    ]

    static async makeRequest(api) {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

        return fetch(api, {
            rejectUnauthorized : false
        }).then(res => res.json().then(data => {
            return data;
        })).catch(err => {
            cli.error('Can not reach gitlab');
            return [];
        })
    }
    
    static requestAllGroups() {
        const api = `${config.get('gitlab_url')}/api/v4/groups/?simple=true&private_token=${config.get('private_token')}&per_page=100&page=1`;
        return this.makeRequest(api);
    }
    
    static async requestProjects(groupid, page) {
        const requestPage = page || 1;

        const api = `${config.get('gitlab_url')}/api/v4/groups/${groupid}/projects?simple=true&private_token=${config.get('private_token')}&per_page=100&page=${requestPage}`;
        const response = this.makeRequest(api);
        const responseData = [];

        return response.then(async data => {
            responseData.push(...data);
            if(data.length > 100) {
                const nextPage = await this.requestProjects(groupid, requestPage+1);
                responseData.push(...nextPage);
            }
            return responseData;
        });
    }

    static async getProjectList(group) {
        const groups = await this.requestAllGroups();
    
        const gitProjects = [];
        const gitGroups = {};
    
        for(let g of groups) {
            if(g.full_name.match(group)) {
    
                const projects = await this.requestProjects(g.id);
                gitProjects.push(
                    ...projects.map(project => ({
                        path: project.ssh_url_to_repo,
                        name: project.name
                    }))
                );
    
                gitGroups[g.name] = {
                    projects: projects.length
                };
            } 
        }

        return {
            groups: gitGroups,
            projects: gitProjects
        }
    }
    
    static async cloneProject(url, dest, dir) {
        return new Promise((resovle, reject) => {
            const destination = path.join(dest, dir);
            simpleGit.clone(url, destination, {}, (err) => {
                if(!err) {
                    resovle();
                } else {
                    reject(err);
                }
            });
        })
    }
    
    static async pullProject(repoPath) {
        return new Promise((resovle, reject) => {
            simpleGit.cwd(repoPath);
            simpleGit.pull((err) => {
                if(!err) {
                    resovle();
                } else {
                    reject(err);
                }
            });
        })
    }

    static async forEachProject(projectList, callback) {
        let projectCounter = 0;
        const projects = projectList.projects;
        if(callback) {
            for(let project of projects) {
                projectCounter++;
                await callback(project, projectCounter);
            }
        }
    }

    // commands

    static async listPorjects(list) {
        cli.headline(`Projects (${list.projects.length}):`);
        for(let key in list.groups) {
            cli.log(`  ${key}: ${list.groups[key].projects}`);
        }
        cli.log();
    }

    static async updateAllProjectsFrom(group) {
        const list = await this.getProjectList(group);
        this.forEachProject(list, async (project, counter) => {
            const status = ' ' + counter++ + '/' + list.projects.length + ' ';
            this.info(status, 'pulling', project.name);
            if(fs.existsSync(path.join(config.get('webapps_root'), project.name))) {
                await this.pullProject(path.join(config.get('webapps_root'), project.name)).catch(err => err);
                this.updateLine('info', chalk.green(status, 'pulled', project.name, '√'));
            } else {
                this.updateLine('info', chalk.yellow(status, project.name, 'not found √'));
            }
        }).then(() => {
            this.listPorjects(list);
        })
    }

    static async getAllProjectsFrom(group) {
        const list = await this.getProjectList(group);
        this.forEachProject(list, async (project, counter) => {
            const status = ' ' + counter++ + '/' + list.projects.length + ' ';
            this.info(status, 'cloning', project.name);
            if(!fs.existsSync(path.join(config.get('webapps_root'), project.name))) {
                await this.cloneProject(project.path, config.get('webapps_root'), project.name).catch(err => err);
                this.updateLine('info', chalk.green(status, 'cloned', project.name, '√'));
            } else {
                this.updateLine('info', chalk.yellow(status, project.name, 'exists √'));
            }
        }).then(() => {
            this.listPorjects(list);
        })
    }

}
