var dataElement = '.graphic-wrapper';
var dataPath =
    'https://raw.githubusercontent.com/RhoInc/data-library/master/data/clinical-trials/renderer-specific/leap-adae1.csv';
var settings = {
    variables: {
        id: 'A_ID',
        major: 'AESOC',
        minor: 'AEPT',
        group: 'TRTC',
        filters: [
            {
                value_col: 'Outcome',
                label: 'Outcome',
                type: 'event',
                start: []
            },
            {
                value_col: 'Treatment Required',
                label: 'Treatment Required',
                type: 'event',
                start: []
            },
            {
                value_col: 'Related?',
                label: 'Related?',
                type: 'event',
                start: []
            },
            {
                value_col: 'Serious?',
                label: 'Serious?',
                type: 'event',
                start: []
            }
        ],
        details: []
    },
    defaults: {
        placeholderFlag: {
            value_col: 'SEQNO',
            values: ['']
        }
    }
};

d3.csv(dataPath, function(error, data) {
    var instance = aeTable.createChart('#container', settings);
    instance.init(data);
});
