const { Console } = require('console');
const fs = require('fs');
const path = require('path');
const protocolMaker = require('./protocolMaker');

const encoding = { encoding: 'ascii', flag: 'r' };

let COMMAND_QUESTIONS = [];

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

        this.questions = ['What is the file path?'];
        this.answers = [];
        this.x = 0;
    }

    GetNextQuestion(){
        var question = '';
        if(!this.singleItem){
            question = COMMAND_QUESTIONS[0];
            COMMAND_QUESTIONS.splice(0, 1);
        }

        return question;
    }

    //#region Starter methods
    CheckInverseArgument(){
        if(this.currentValue == '-i'){
            this.inverse = true;
            if(this.inverse){
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
    //#endregion

    getFileData(filepath) {
        var filePath = path.join(...filepath.split('\\'));
        return fs.readFileSync(filePath, encoding);
    }
    
    parseSingleFile(){
        var filepath = process.cwd() + '\\toolbox\\example.json';
        var items = JSON.parse(this.getFileData(filepath));
        for(var item of items){
            console.log(item);
        }

        console.log(protocolMaker(items));
    }

    parseCommandQuestions(line){
        {
            this.answers.push(line);
            
            if(this.answers.length == 1){
                console.log(this.getFileData(line));
            }

            return COMMAND_QUESTIONS.length == 0; //don't ask more question if no more questions
        }
    }
}

module.exports = LineProcessor;