const { Command } = require('../src/cli.js');

module.exports = class Example extends Command {

    static command = 'example';
    static alias = 'ex';
    static description = 'example command';

    static arguments = [
        {
            command: "one",
            description: "argument one",
            execute: (args) => this.one(...args)
        },
        {
            command: "two",
            description: "argument two",
            execute: (args) => this.two()
        }
    ]

    static one(value) {
        const n = parseInt(value);
        if(n) {
            for(let i = 0; i < n; i++) {
                this.log(Math.sin(i));
            }
        } else {
            throw "Not a number";
        }
    }

    static two() {
        this.log('nothing here');
    }
}
