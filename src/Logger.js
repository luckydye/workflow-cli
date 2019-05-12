const chalk = require('chalk');

let lastlog = "";

function formatPrefix(str, loglevel) {
    let prefix = lastlog == loglevel ? '' : str;
    prefix = prefix.padEnd(5, " ");
    lastlog = loglevel;
    return prefix;
}

module.exports = class Logger {
    
    static prefix = null;

    static log(...str) {
        if(this.prefix) {
            let prefix = formatPrefix(this.prefix, 0);
            console.log(prefix, ...str);
        } else {
            lastlog = 0;
            console.log(...str);
        }
    }

    static error(...str) {
        let prefix = formatPrefix('Error', 1);
        console.error(chalk.bgWhite.red(prefix), ...str);
    }

    static info(...str) {
        let prefix = formatPrefix('Info', 2);
        console.log(chalk.bgWhite.black(prefix), ...str);
    }

    static warn(...str) {
        let prefix = formatPrefix('Warning', 3);
        console.log(chalk.bgBlack.yellow(prefix), ...str);
    }

    static headline(str) {
        lastlog = 0;
        console.log('\n ' + str.padEnd(52, " ") + '\n');
    }

    static updateLine(logType, str, linecount = 1) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0, process.stdout.rows - (linecount+1));
        this[logType](str);
    }

    static title(str) {
        process.stdout.write(String.fromCharCode(27) + "]0;" + str + String.fromCharCode(7));
    }

    static list(items) {
        for(let item of items) {
            let strings = [ '  ' ];
            if(Array.isArray(item)) {
                for(let section of item) {
                    strings.push(section);
                }
            } else {
                strings.push(item);
            }
            this.log(strings.join(' '));
        }
        this.log();
    }

}
