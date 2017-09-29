# Adverse Event Explorer

![alt tag](https://user-images.githubusercontent.com/31038805/30923072-ee757b02-a378-11e7-91a5-dd2bb31f402c.gif)

## Overview
The AE Explorer is a JavaScript library that allows users to dynamically query adverse event (AE) data in real time. A typical AE Explorer looks like this: 



Users can click on any row in the table to create a listing like this: 



The AE Explorer is an open source project built using standard web technology and will run in any modern web browser. The displays created are all dynamically linked to coded adverse event data which allows the tool to work with data from any adverse event coding system, e.g. MedDRA. The charts are created using [D3](http://www.d3js.org "D3.js").

The AE Explorer contains all of the information available in standard listings, but we apply interactive elements common in website design to give users the ability to search the data. The default view is a single-screen display of AEs grouped by the MedDRA System Organ Class. Dot plots portray the incidence in the different treatment groups. 

## Usage
In the simplest case, using a dataset matching all default requirements, the chart can be created with a single line of code.

```javascript
aeTable('#chartLocation', {}).init(data);
```

The code to load a comma-delimited data set and initialize a customized chart, with filters and simple data mappings, looks like this: 

```javascript
   const settings = {
            'variables': {
                'group': 'group', //overwrite default value 'ARM'
                'filters': [
                    {'value_col': 'SITEID', 'label': 'Site ID', 'type': 'participant' },
                    {'value_col': 'AESER', 'label': 'Serious?', 'type': 'event' }, 
                    {'value_col': 'AESEV', 'label': 'Severity', 'type': 'event' }, 
                    {'value_col': 'AEREL', 'label': 'Relationship','type': 'event' }, 
                    {'value_col': 'AEOUT', 'label': 'Outcome','type': 'event' }, 
                 ]
             },
        };

        d3.csv('../data/ADAE.csv', function(data) {
            aeTable.createChart('#chartLocation', settings).init(data);
        });
```

## Example
- [Basic Example](https://rhoinc.github.io/viz-library/examples/0008-safetyExplorer-default/ae-table/index.html)
