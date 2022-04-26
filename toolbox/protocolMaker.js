///It receives a JSON file with ..., then it process the data to get a protocol parameter of either number, string, or discreet parameter
//The format is:
///   [{"name": "example1", "description": "", "type": "{string, int, discreet}", "subtext": "".
///   "discreets": [], "labels": [] }]
const xmlBuilder = require('xmlbuilder');

class ProtocolMaker{
    constructor(jsonArray, tableName, startingId){
        this.propertyList = JSON.parse(jsonArray);
        this.tableName = tableName;
        this.startingId = startingId
    };

    convert(){
        let root = xmlBuilder.create('Params');
        
        // for (var property in this.propertyList){
        //     builder.ele('Name').text(`${property.name}`);
        // }
        for (var property in this.propertyList){
            var param = xmlBuilder.create('Param');
            //root.ele('Param', {'id': `${this.startingId++}`,});
            param.ele('Name').text(`${property.name}`);
            param.ele('Description').text(`${property.title}`);
            param.ele('Type').text('read');
            param.ele('Information').ele('Subtext').text(`${property.subtext}`);
            param.ele("Interprete").ele('RawType').text('numeric text');

            root.importDocument(param);
        }

        return root.end({'pretty': true});
    }
}

create(`
[{
    "description": "Controls the frequency response of the 4:2:2 <-> 4:4:4 conversion", "title": "Chroma anti-alias", "live": true,
    "dataType": "integer",
    "enum": [ 0, 1, 2, 3, 4 ],
    "enumLabels": [ "0", "1", "2", "3", "4" ],
    "default": 1
}, 
{
    "description": "Example1",
    "dataType": "integer",
    "enum": [ 0, 1 ],
    "enumLabels": [ "0", "1" ],
    "default": 1
}]
`, 'frameSync', 1000);


function create(jsonArray, name, id){
    var maker = new ProtocolMaker(jsonArray, name, id);
    console.log(maker.convert());
    //console.log(id);
}
