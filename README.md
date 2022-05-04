# Node-Comparer
 
 -->This tool allows you to create protocol from custom JSON items. These JSON items (or array of it) must follow the following format:
 {
    "name": "Example1",
    "description": "Just an example",
    "type": "discreet",
    "subtext": "Full description",
    "discreets": ["0", "1", "2"],
    "labels": ["discreet1", "discreet2", "discreet3"]
}
-->NOTE:
    name: isRequired
    description: isRequired
    type: isRequired ('integer', 'discreet', 'boolean', or 'string')
    subtext: isRequired
    discreets: isRequired if type == 'discreet'
    labels:isRequired if type == 'discreet'


-->Then, this will be tranformed to:
<?xml version="1.0"?>
<Params>
  <Param id="" trending="true">
    <Name>Example1</Name>
    <Description>Just an example</Description>
    <Type>read</Type>
    <Information>
      <Subtext>Full description</Subtext>
    </Information>
    <Interprete>
      <RawType>numeric text</RawType>
      <Type>double</Type>
      <LengthType>next param</LengthType>
    </Interprete>
    <Display>
      <RTDisplay>true</RTDisplay>
    </Display>
    <Measurement>
      <Type>discreet</Type>
      <Discreets>
        <Discreet>
          <Display>discreet1</Display>
          <Value>0</Value>
        </Discreet>
        <Discreet>
          <Display>discreet2</Display>
          <Value>1</Value>
        </Discreet>
        <Discreet>
          <Display>discreet3</Display>
          <Value>2</Value>
        </Discreet>
      </Discreets>
    </Measurement>
  </Param>
</Params>