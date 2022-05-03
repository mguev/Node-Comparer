const readline = require('readline');
const LineProcessor = require('./../toolbox/processor');

console.log('******Starting Progragm**********');
var processor = new LineProcessor(process.argv.slice(2));

var question = processor.GetQuestion();
if(question != '')
    console.log(question);

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    if(processor.parse(line))
        rl.close();
});