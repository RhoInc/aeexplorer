var dataElement = '.graphic-wrapper';
var dataPath = 'https://raw.githubusercontent.com/RhoInc/data-library/master/data/clinical-trials/renderer-specific/icata-aes.csv';
var settings = {
    variables: {
        id: 'ID',
        major: 'System Organ Class',
        minor: 'Preferred Term',
        group: 'Treatment Arm',
        filters: [
            {
                value_col: 'Serious',
                label: 'Serious',
                type: 'event',
                start: []
            },
            {
                value_col: 'Outcome',
                label: 'Outcome',
                type: 'event',
                start: []
            },
            {
                value_col: 'Race/Ethnicity',
                label: 'Race/Ethnicity',
                type: 'participant',
                start: []
            }
        ],
        details: [
            'ID',
            'Verbatim Name',
            'Preferred Term',
            'System Organ Class',
            'Outcome',
            'Serious',
            'Treatment Arm',
            'Race/Ethnicity'
        ]
    },
    defaults: {
        placeholderFlag: {
            value_col: 'Preferred Term',
            values: ['NA']
        },
        maxPrevalence: 5.0,
        prefTerms: true,
        diffCol: true
    }
};

d3.csv(dataPath, function(error, data) {
    var instance = aeTable.createChart('#container', settings);
    instance.init(data);
});
