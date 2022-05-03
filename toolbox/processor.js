const fs = require('fs');
const path = require('path');
const protocolMaker = require('./protocolMaker');

const encoding = { encoding: 'ascii', flag: 'r' };

class LineProcessor{
    constructor(parameters){
        this.startingPid = 0;
        this.arguments = parameters;
        for(let i = 0 ; i < parameters.length ; i++){
            console.log(parameters[i]);
            this.currentValue = parameters[i];
            this.pointer = i;
            this.CheckInverseArgument();
            this.CheckPidStartingPoint();
            this.whichSetofQuestions();
        }

        this.questions = ['What is the path of the schema file?'];
        this.parameterQuestions = ['What is the parameter JSON?', 'Name the file that will hold all the parameters?'];
        this.x = 0;
    }

    GetQuestion(){
        var question = '';
        if(!this.singleItem){
            question = this.questions[0];
            this.questions.splice(0, 1);
            this.answers = this.questions.length;
        }

        if(this.singleItem){
            question = this.parameterQuestions[0];
            this.parameterQuestions.splice(0, 1);
            this.answers = this.parameterQuestions.length;
        }

        return question;
    }

    CheckInverseArgument(){
        if(this.currentValue == '-i'){
            this.inverse = true;
            if(this.inverse){
                console.log('***INVERSING***');
                this.behavior = 'inverse';
            }
        }
        else if(this.currentValue == '-o'){
            this.original = true
        }
    }

    CheckPidStartingPoint(){
        try{
            if(this.currentValue == '--pid'){
                this.startingPid = this.arguments[this.pointer + 1];
            }
        }
        catch(e){
            console.log('argument was no bueno', argument, e);
        }
    }

    whichSetofQuestions(){
        if(this.currentValue == '-s')
        {
            this.singleItem = true;
        }
    }

    ProcessFile(input) {

        var filePath = path.join(...input.split('\\'));
        var secondFilePath = path.join(...input.replace('schema', 'class').replace('.json', '.txt').split('\\'));
        
        let data = fs.readFileSync(filePath, encoding);
        let secondData = fs.readFileSync(secondFilePath, encoding);
        
        var items = this.Process(JSON.parse(data), JSON.parse(this.TransformClass(secondData)));
        
        if(items.length > 0){
            var xmlPath = path.join(...input.replace('schema', 'parameters').replace('.json', '.xml').split('\\'));
            fs.writeFileSync(xmlPath, items.join('\n'));
        }
    }

    Compare(properties, driverItems) {
        let missingItems = [];
    
        for (var property in properties) {
            let key = property.toLowerCase();
            let data = properties[property];
    
            if(this.behavior == 'inverse'){
                if(driverItems.includes(key))
                    missingItems.push(this.convertMissingItem(property, data));
            }
            else if (!driverItems.includes(key) || key == "videoforcedstandard") {
                missingItems.push(this.convertMissingItem(property, data));
            }
        }
    
        return missingItems;
    }
    
    convertMissingItem(property, data){
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
    
    Process(apiJson, driverJson) {
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
    
                let missingItems = this.Compare(data, driverItems);
                let slParameters = protocolMaker(missingItems, this.startingPid);
                if (missingItems.length == 0)
                    noMissingItems.push(apiProperty);
                else{
                    categories.push(apiProperty);
                    categories.push(slParameters);
                    var classProperties = missingItems.map(
                        x => this.CreateClassProperty(x.type, x.name));
    
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
    
    CreateClassProperty(type, name){
        let classType = type == 'boolean' ? 'bool' : type == 'string' ? 'string' : 'int'
        return `public ${classType} ${name} { get; set; }`;
    }
    
    TransformClass(data) {
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

    parse(line){
        {
            console.log('~~~~~~~~~~~~~~~~');
            if (this.arguments.length == 0 || inverse || original)
            {
                if(this.inverse)
                    this.behavior = 'inverse';
        
                this.ProcessFile(line);
                return true;
            }
            else if(this.x++ == 0){
                this.answers[0] = line
                console.log(parameterQuestions[this.x]);
            }
            else 
            {
                if(this.x == 2){
                    this.answers[1] = line;
                }
                else{
                    this.answers[0] = line;
                }
                const defaultFilePath = 'C:\\Users\\miguelgu\\Documents\\2.Jobs\\2021\\Tasks\\slParameters';
                var converted = JSON.parse('{' + this.answers[0] + '}');
        
                console.log('**Taken**');
                for(var jObject in converted){
                    let data = converted[jObject];
                    // console.log(data);
        
                    var item = this.convertMissingItem(jObject, data);
                    var parameter = protocolMaker([item]);
                    if(this.x > 2){
                        console.log('***ENTERING');
                        var lines = parameter.split('\n');
                        lines.splice(0, 1);
                        parameter = lines.join('\n');
                    }
        
                    let filePath = defaultFilePath + '\\' + this.answers[1] + '.xml';
                    if(fs.existsSync(filePath)){
                        fs.appendFileSync(filePath, parameter)
                    }
                    else{
                        fs.writeFileSync(filePath, parameter);
                    }
                }
        
                console.log(parameterQuestions[0]);
            }

            var question = this.GetQuestion();
            if(question != ''){
                console.log(question);
                return false;   
            }
            else return true;
        }
    }
}

module.exports = LineProcessor;