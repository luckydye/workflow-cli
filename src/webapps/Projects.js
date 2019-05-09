const path = require('path');
const fs = require('fs');
const xml = require('xml2js');
const cli = require('../cli.js');

const RELATIVE_CONTEXT_PATH = '/src/main/webapp/META-INF';

module.exports = class Projects {

    static parseProjectPom(projectPath) {
        let result = {};

        const pomPath = path.join(projectPath, "pom.xml");
        if(!fs.existsSync(pomPath)) {
            throw "Pom not found in " + projectPath;
        }

        let pomString = fs.readFileSync(pomPath, "utf8");
        const xmlParser = new xml.Parser({ attrkey: "attributes" });
        xmlParser.parseString(pomString, (error, xml) => {
            if(error) throw "Error parsing pom.xml for " + projectPath;
            result = xml;
        });

        return result;
    }

    static async createProjectContext(projectPath, templateFile) {
        return new Promise((resolve, reject) => {

            if(!fs.existsSync(templateFile)) {
                throw `context.xml not found at ${templateFile}`;
            }
    
            const contextPath = path.join(projectPath, RELATIVE_CONTEXT_PATH);
            const contextFile = path.join(contextPath, 'context.xml');
    
            const pom = this.parseProjectPom(projectPath);
            const artifactName = pom.project.artifactId[0];
            const stylePath = this.getProjectStylePath(projectPath);
            const db_prefix = 'i4_';

            const information = {
                database: db_prefix + artifactName.replace("-", "_"),
                name: artifactName,
                style: stylePath ? stylePath.replace(/(\\)+/g, "/") : " "
            }
    
            let template = fs.readFileSync(templateFile).toString();

            const found = template.matchAll(/\$\{[a-zA-Z]+\}/g);
            for(let f of found) {
                const path = f[0].replace(/[(${)|(})]/g, "").split(".");
                const data = information[path[0]];
                if(data) {
                    template = template.replace(f[0], data);
                }
            }
    
            fs.mkdir(contextPath, { recursive: true }, (err) => {
                if(err) {
                    reject(err);
                } else {
                    fs.writeFileSync(contextFile, template);
                    resolve(artifactName);
                }
            });
        })
    }

    static findContextFile(projectPath) {
        const root = path.join(projectPath, RELATIVE_CONTEXT_PATH);

        if(!fs.existsSync(root)) return;

        const files = fs.readdirSync(root);
        const index = files.indexOf('context.xml');
        if(index != -1) {
            return path.join(root, files[index]);
        }
    }

    static getProjectStylePath(projectPath) {
        const found = this.findInPath({
            startPath: projectPath,
            file: 'WEB-INF/layout.xml',
            depth: 8,
        });
        return found[0];
    }

    static async findProject(rootDirectory, searchString) {
        if(searchString) {
            const projects = [];
                
            if(Array.isArray(rootDirectory)) {
                for(let root of rootDirectory) {
                    if(root) {
                        projects.push(...this.findInPath({ startPath: root }));
                    }
                }
            } else {
                projects.push(...this.findInPath({ startPath: rootDirectory }));
            }

            const matches = [];
            for(let project of projects) {
                if(project.match(searchString)) {
                    matches.push(project);
                }
            }
            
            if(matches.length > 1) {
                return cli.contextSelection("Select project", matches).then(({ selection }) => {
                    return selection;
                })
            } else if(matches.length == 1) {
                return matches[0];
            }
        }
    }

    static findInPath({
        startPath = null,
        file = 'pom.xml',
        depth = 2,
    } = {}) {
        if(!startPath) throw "No path given";

        const root = path.resolve(startPath);
        const query = file;
        const maxLevel = depth;

        const results = [];

        function checkDir(rootPath, level = 0) {
            if(level > maxLevel) return;
            
            const dirs = fs.readdirSync(rootPath);
            for(let dir of dirs) {
                const dirPath = path.join(rootPath, dir);

                if(fs.lstatSync(dirPath).isDirectory()) {
                    checkDir(dirPath, level+1);
                }
                if(fs.existsSync(path.join(dirPath, query))) {
                    results.push(dirPath);
                }
            }
        }

        checkDir(root);
        return results;
    }
}