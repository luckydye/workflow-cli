module.exports = class Interface {

    static selection(title, items) {
        return require('inquirer').prompt([{
            type: "list",
            name: 'selection',
            message: title,
            choices: items
        }]);
    }

    static progress(timer) {
        const bar = "████████████████████████████████████████";
        const starttick = Date.now();

        return {
            plot(value, max) {
                const frac = (value / max);
                const state = bar.substr(0, bar.length * frac).padEnd(bar.length);
                const delta = ((Date.now() - starttick) / 1000) / 60;
                const time = (delta / frac).toFixed(2);

                process.stdout.cursorTo(0, process.stdout.rows - 1);
                process.stdout.write(`${state}│  ${timer ? '~ ' + time + ' minutes' : ''}`);
            }
        }
    }

}