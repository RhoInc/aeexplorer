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
