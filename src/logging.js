const chalk = require('chalk');

let lastlog = "";

function formatPrefix(str, loglevel) {
    let prefix = lastlog == loglevel ? '' : str;
    prefix = prefix.padEnd(5, " ");
    lastlog = loglevel;
    return prefix;
}

module.exports = {
    
    prefix: null,

    log(...str) {
        if(this.prefix) {
            let prefix = formatPrefix(this.prefix, 0);
            console.log(prefix, ...str);
        } else {
            lastlog = 0;
            console.log(...str);
        }
    },

    error(...str) {
        let prefix = formatPrefix('Error', 1);
        console.error(chalk.bgWhite.red(prefix), ...str);
    },

    info(...str) {
        let prefix = formatPrefix('Info', 2);
        console.log(chalk.bgWhite.black(prefix), ...str);
    },

    warn(...str) {
        let prefix = formatPrefix('Warning', 3);
        console.log(chalk.bgBlack.yellow(prefix), ...str);
    },

    headline(str) {
        lastlog = 0;
        console.log(chalk.black.bgWhite('\n', str.padEnd(52, " ")), "\n");
    },

    updateLine(logType, str, linecount = 1) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0, process.stdout.rows - (linecount+1));
        this[logType](str);
    }

}
