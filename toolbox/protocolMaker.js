const xmlBuilder = require('xmlbuilder');

//#region protocol maker class
class ProtocolMaker{
    constructor(jsonArray, startingId){
        this.propertyList = jsonArray;
        this.startingId = startingId;
    };

    convert(){
        const root = xmlBuilder.create('Params');
    
        for (var property of this.propertyList){
            //console.log(property);
            if(property.type == 'array'){
                for(var arrayProperty in property.items){
                    console.log(arrayProperty);
                    root.importDocument(convertMissingItem(property, arrayProperty));
                }
            }
            else{
                root.importDocument(this.ParsePropery(property));
            }
        }

        return root.end({'pretty': true});
    }

    ParsePropery(property){
        try{
            var param = xmlBuilder.create('Param');
            param.attribute('id', this.startingId > 0 ? this.startingId++ : '');
            param.attribute('trending', property.type == 'string' ? 'false' : 'true');
            param.ele('Name').text(`${property.name}`);
            param.ele('Description').text(`${property.description}`);
            param.ele('Type').text('read');
            param.ele('Information').ele('Subtext').text(`${property.subtext}`);

            var interprete = xmlBuilder.create('Interprete');
            interprete.ele('RawType').text(
                property.type == 'integer' || property.type == 'discreet' || property.type == 'boolean' 
                ? 'numeric text' 
                : 'other');

            interprete.ele('Type').text(
                property.type == 'integer' || property.type == 'discreet' || property.type == 'boolean'
                ? 'double' 
                : 'string');

            interprete.ele('LengthType').text('next param');
            param.importDocument(interprete);

            var display = xmlBuilder.create('Display');
            display.ele('RTDisplay').text('true');
            if(property.min != null){
                var range = xmlBuilder.create('Range');
                range.ele('Low').text(property.min);
                range.ele('High').text(property.max);
                display.importDocument(range);
            }
            param.importDocument(display);

            return param.importDocument(this.GetDiscreetValues(property));
        }
        catch(e){
            console.log('ParsePropery|Error on property', property);
            return param;
        }
    }

    GetDiscreetValues(property){
        try{
            var measurement = xmlBuilder.create('Measurement');
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
        catch(exc){
            //console.log('Problem parsing propery', property)
            console.log(property + ', ' + exc);
            return measurement;
        }
    }

    CreateDiscreet(discreet, label){
        var discreet = xmlBuilder.create('Discreet');
        discreet.ele('Display').text(discreet);
        discreet.ele('Value').text(label);
        return discreet;
    }
}
//#endregion

///Returns a single JSON object so that it can be run by the ProtocolMaker.
module.exports = function convertMissingItem(property, data){
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

///Converts all raw parameters of a particular format (e.g. XML file, JSON API, etc...) into parameters.
///id = starting PID of the parameters
///jsonItems = All converted parameters. Use function "convertMissingItem" to parse raw values
module.exports = function(jsonItems, id){
    var maker = new ProtocolMaker(jsonItems, id);
    return maker.convert();
}