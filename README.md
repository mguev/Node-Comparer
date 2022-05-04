# Node-Comparer
 
 -This tool allows you to create protocol from custom JSON items. These JSON items (or array of it) must follow the following format:
 
    "name": "Example1",
    "description": "Just an example",
    "type": "discreet",
    "subtext": "Full description",
    "discreets": ["0", "1", "2"],
    "labels": ["discreet1", "discreet2", "discreet3"]

-Overview:

    name: isRequired
    description: isRequired
    type: isRequired ('integer', 'discreet', 'boolean', or 'string')
    subtext: isRequired
    discreets: isRequired if type == 'discreet'
    labels:isRequired if type == 'discreet'


-Then, this will be tranformed into a parameter. You can run the code and it will show you an example.
-Just run node 'app.js'
