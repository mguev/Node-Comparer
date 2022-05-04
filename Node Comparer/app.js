const readline = require('readline');
const LineProcessor = require('./../toolbox/processor');

console.log('******Starting Program**********');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var processor = new LineProcessor(process.argv.slice(2));

var question = processor.GetNextQuestion();
if(question != '')
    console.log(question);

processor.parseSingleFile();
rl.close();

// If you want to parse inputs from the command line
// rl.on('line', (line) => {
//     if(processor.parseCommandQuestions(line)){
//         rl.close();
//     }
//     else{
//         console.log(processor.GetNextQuestion());
//     }
// });