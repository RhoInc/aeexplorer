d3.csv(
    'https://raw.githubusercontent.com/RhoInc/data-library/master/data/clinical-trials/adam/adae.csv',
    function(error, data) {
        if (error) console.log(error);

        var settings = {
            variables: {
                group: 'ARM'
            },
            variableOptions: {
                group: ['SEX', 'RACE', 'SITE', 'ARM']
            },
            colors: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'],
            defaults: {
                webchartsDetailTable: true,
                placeholderFlag: {
                    value_col: 'AEBODSYS',
                    values: ['']
                }
            }
        };
        var instance = aeTable.createChart('#container', settings);
        instance.init(data.filter(d => d.ARM !== 'Screen Failure'));
    }
);
