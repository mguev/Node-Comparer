const fs = require('fs');
const readline = require('readline');
const path = require('path');

const questions = ['What is the path of the schema file?'];
const encoding = { encoding: 'ascii', flag: 'r' };

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let x = 0;
let answers = [questions.length];
console.log('******Starting Progragm**********');
console.log(questions[x]);

rl.on('line', function (line) {
    if (x == 0) {
        answers[0] = path.join(...line.split('\\'));
        answers[1] = path.join(...line.replace('schema', 'class').replace('.json', '.txt').split('\\'));
    }
    //console.log(questions[++x]);
    //if (x >= questions.length) {
    ProcessFile(answers[0], answers[1]);
    rl.close();
    //}
})

function ProcessFile(filePath, secondFilePath) {
    console.log('Reading file....');
    let data = fs.readFileSync(filePath, encoding);
    let secondData = fs.readFileSync(secondFilePath, encoding);
   
    Process(JSON.parse(data), JSON.parse(TransformClass(secondData)));
}

function Compare(properties, driverItems) {
    let missingItems = [];

    for (var property in properties) {
        let key = property.toLowerCase();
        let data = properties[property];

        if (!driverItems.includes(key) || key == "videoforcedstandard") {
            //missingItems.push(property);
            missingItems.push({
                name: property,
                description: data.title,
                type: data.dataType,
                subtext: data.description,
                discreets: data.enum,
                labels: data.enumLabels
            });
        }
    }

    return missingItems;
}

function Process(apiJson, driverJson) {
    let driverItems = [];
    let noMissingItems = [];

    for (var driverProperty in driverJson) {
        driverItems.push(driverProperty.toLowerCase());
    }

    for (let apiProperty in apiJson.properties) {
        try {
            let data = '';
            if (apiJson.properties[apiProperty].dataType == 'object') {
                data = apiJson.properties[apiProperty].properties;
            }
            else {
                data = apiJson.properties[apiProperty].items.properties;
            }

            let missingItems = Compare(data, driverItems);
            if (missingItems.length == 0)
                noMissingItems.push(apiProperty);
            else
                console.log('Missing items', apiProperty, missingItems);
        } catch (e) {
            console.log('API Property could not be process:', apiProperty);
            console.log(e);
        }
    }

    console.log('No missing items: ', noMissingItems);
}

function TransformClass(data) {
    const intType = 'public int ';
    const stringType = 'public string ';
    const boolType = 'public bool ';

    let result = [];
    for (let rawLine of data.split('\n')) {
        if (rawLine.includes('public class') || (rawLine.trim().length == 1 && rawLine.includes('{'))) 
            continue;
        

        let line = rawLine.replace('{ get; set; }', '');
        line = line.trim();

        line = `"${line}": `;
        if (rawLine.includes(intType)) {
            line = line.replace(intType, '') + ' 1';
        }
        else if (rawLine.includes(stringType)) {
            line = line.replace(stringType, '') + '""';
        }
        else if (rawLine.includes(boolType)) {
            line = line.replace(boolType, '') + ' true';
        }
        else
            continue;

        result.push(line);
    }

    return `{${result.join(',')}}`;
}
