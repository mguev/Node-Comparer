const fs = require('fs');
const readline = require('readline');
const path = require('path');
const protocolMaker = require('../toolbox/protocolMaker');
const { compileFunction } = require('vm');
const { deepStrictEqual } = require('assert');
const { start } = require('repl');

const questions = ['What is the path of the schema file?'];
const parameterQuestions = ['What is the parameter JSON?', 'Name the file that will hold all the parameters?'];

const encoding = { encoding: 'ascii', flag: 'r' };

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let x = 0;
let answers = [questions.length];
let behavior = 'original';
let startingPid = 0;

console.log('******Starting Progragm**********');
let myArguments = process.argv.slice(2);
var inverse = myArguments.length > 0 && myArguments[0] == 'inverse';
var original = myArguments.length > 0 && myArguments[0] == 'original';
if(inverse){
    console.log('***INVERSING***');
    behavior = 'inverse';
}

if(myArguments.length > 1)
        startingPid = parseInt(myArguments[1]);

if (myArguments.length == 0 || inverse || original){
    console.log(questions[x]);
}
else{
    console.log(parameterQuestions[0]);
}

rl.on('line', function (line) {
    console.log('Thank you!');
    if (myArguments.length == 0 || inverse || original)
    {
        if(inverse)
            behavior = 'inverse';

        ProcessFile(line);
        rl.close();
    }
    else if(x++ == 0){
        answers[0] = line
        console.log(parameterQuestions[x]);
    }
    else 
    {
        if(x == 2){
            answers[1] = line;
        }
        else{
            answers[0] = line;
        }
        const defaultFilePath = 'C:\\Users\\miguelgu\\Documents\\2.Jobs\\2021\\Tasks\\slParameters';
        var converted = JSON.parse('{' + answers[0] + '}');

        console.log('**Taken**');
        for(var jObject in converted){
            let data = converted[jObject];
            // console.log(data);

            var item = convertMissingItem(jObject, data);
            var parameter = protocolMaker([item]);
            if(x > 2){
                console.log('***ENTERING');
                var lines = parameter.split('\n');
                lines.splice(0, 1);
                parameter = lines.join('\n');
            }

            let filePath = defaultFilePath + '\\' + answers[1] + '.xml';
            if(fs.existsSync(filePath)){
                fs.appendFileSync(filePath, parameter)
            }
            else{
                fs.writeFileSync(filePath, parameter);
            }
        }

        console.log(parameterQuestions[0]);
    }
})

function ProcessFile(input) {

    var filePath = path.join(...input.split('\\'));
    var secondFilePath = path.join(...input.replace('schema', 'class').replace('.json', '.txt').split('\\'));
    
    let data = fs.readFileSync(filePath, encoding);
    let secondData = fs.readFileSync(secondFilePath, encoding);
    
    var items = Process(JSON.parse(data), JSON.parse(TransformClass(secondData)));
    
    if(items.length > 0){
        var xmlPath = path.join(...input.replace('schema', 'parameters').replace('.json', '.xml').split('\\'));
        fs.writeFileSync(xmlPath, items.join('\n'));
    }
}

function Compare(properties, driverItems) {
    let missingItems = [];

    for (var property in properties) {
        let key = property.toLowerCase();
        let data = properties[property];

        if(behavior == 'inverse'){
            if(driverItems.includes(key))
                missingItems.push(convertMissingItem(property, data));
        }
        else if (!driverItems.includes(key) || key == "videoforcedstandard") {
            missingItems.push(convertMissingItem(property, data));
        }
    }

    return missingItems;
}

function convertMissingItem(property, data){
    return {
        name: property,
        description: data.title,
        type: data.enum == null || data.dataType == 'boolean' ? data.dataType : data.dataType == 'string' ? 'discreet_strings' : 'discreet',
        subtext: data.description,
        discreets: data.enum,
        labels: data.enumLabels,
        min: data.minimum,
        max: data.maximum
    };
}

function Process(apiJson, driverJson) {
    console.log('*****COMPARING FILES*****');
    let driverItems = [];
    let noMissingItems = [];

    for (var driverProperty in driverJson) {
        driverItems.push(driverProperty.toLowerCase());
    }

    let categories = [];
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
            let slParameters = protocolMaker(missingItems, startingPid);
            if (missingItems.length == 0)
                noMissingItems.push(apiProperty);
            else{
                categories.push(apiProperty);
                categories.push(slParameters);
                var classProperties = missingItems.map(
                    x => CreateClassProperty(x.type, x.name));

                console.log([apiProperty]);
                console.log(classProperties.join('\n'));
            }
        } catch (e) {
            console.log('API Property could not be process:', apiProperty);
            console.log(e);
        }
    }

    console.log('\n----->Fields with no missing items: ', noMissingItems);
    return categories;
}

function CreateClassProperty(type, name){
    let classType = type == 'boolean' ? 'bool' : type == 'string' ? 'string' : 'int'
    return `public ${classType} ${name} { get; set; }`;
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
