///It receives a JSON file with ..., then it process the data to get a protocol parameter of either number, string, or discreet parameter
//The format is:
///   [{"name": "example1", "description": "", "type": "{string, int, discreet}", "subtext": "".
///   "discreets": [], "labels": [] }]
const xmlBuilder = require('xmlbuilder');

class ProtocolMaker{
    constructor(jsonArray, tableName, startingId){
        // this.propertyList = JSON.parse(jsonArray);
        this.propertyList = jsonArray;
        console.log(this.propertyList);
        this.tableName = tableName;
        this.startingId = startingId
    };

    convert(){
        let root = xmlBuilder.create('Params');
    
        for (var property of this.propertyList){
            var param = xmlBuilder.create('Param');
            param.ele('Name').text(`${property.name}`);
            param.ele('Description').text(`${property.description}`);
            param.ele('Type').text('read');
            param.ele('Information').ele('Subtext').text(`${property.subtext}`);

            var interprete = xmlBuilder.create('Interprete');
            interprete.ele('RawType').text(
                property.type == 'integer' || property.type == 'discreet' ? 'numeric text' : 'other');
            interprete.ele('type').text(
                property.type == 'integer' || property.type == 'discreet' ? 'double' : 'string');
            interprete.ele('LenghtType').text('next param');
            param.importDocument(interprete);

            param.ele('Display').ele('RTDisplay').text('true');
            param.importDocument(this.GetDiscreetValues(property));
            root.importDocument(param);
        }

        return root.end({'pretty': true});
    }

    GetDiscreetValues(property){
        var measurement = xmlBuilder.create('Measurement');
        console.log('*******', property.name);
        console.log(property.type);
        if(property.type == 'integer')
            return measurement.ele('Type').text('number');
        else if(property.type == 'string')
            return measurement.ele('Type').text('string');
        else{
            measurement.ele('Type').text('discreet');
            var discreets = xmlBuilder.create('Discreets');
            if(property.type == "boolean"){
                var discreet = xmlBuilder.create('Discreet');
                discreet.ele('Display').text('Disabled');
                discreet.ele('Value').text('0');
                discreets.importDocument(discreet);

                var discreet = xmlBuilder.create('Discreet');
                discreet.ele('Display').text('Enabled');
                discreet.ele('Value').text('1');
                discreets.importDocument(discreet);
            }
            else if(property.type == 'discreet_strings'){
                for(var i = 0; i < property.discreets.length ; i++){
                    var discreet = xmlBuilder.create('Discreet');
                    discreet.ele('Display').text(property.discreets[i]);
                    discreet.ele('Value').text(property.discreets[i]);
                    discreets.importDocument(discreet);
                }
            }
            else{
                for(var i = 0; i < property.discreets.length ; i++){
                    var discreet = xmlBuilder.create('Discreet');
                    discreet.ele('Display').text(property.labels[i]);
                    discreet.ele('Value').text(property.discreets[i]);
                    discreets.importDocument(discreet);
                }
            }

            return measurement.importDocument(discreets);
        }
    }

    CreateDiscreet(discreet, label){
        var discreet = xmlBuilder.create('Discreet');
        discreet.ele('Display').text(discreet);
        discreet.ele('Value').text(label);
        return discreet;
    }
}

module.exports = function(jsonArray, name, id){
    var maker = new ProtocolMaker(jsonArray, name, id);
    return maker.convert();
    //return 'Hello';
}

// create(`
// [{
//     "name":"Example1",
//     "description": "Controls the frequency response of the 4:2:2 <-> 4:4:4 conversion", "title": "Chroma anti-alias", "live": true,
//     "dataType": "integer",
//     "enum": [ 0, 1, 2, 3, 4 ],
//     "enumLabels": [ "0", "1", "2", "3", "4" ],
//     "default": 1,
//     "type": "int"
// }, 
// {
//     "name":"Example2",
//     "description": "Example1",
//     "dataType": "integer",
//     "enum": [ 0, 1 ],
//     "enumLabels": [ "4K", "1080HD" ],
//     "default": 1,
//     "type": "discreet"
// }]
// `, 'frameSync', 1000);

