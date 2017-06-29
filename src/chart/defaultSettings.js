const defaultSettings = {
    variables: {
        id: 'USUBJID',
        major: 'AEBODSYS',
        minor: 'AEDECOD',
        group: 'ARM',
        details: [],
        filters: [
            {
                value_col: 'AESER',
                label: 'Serious?',
                type: 'event',
                start: []
            },
            {
                value_col: 'AESEV',
                label: 'Severity',
                type: 'event',
                start: []
            },
            {
                value_col: 'AEREL',
                label: 'Relationship',
                type: 'event',
                start: []
            },
            {
                value_col: 'AEOUT',
                label: 'Outcome',
                type: 'event',
                start: []
            }
        ]
    },
    groups: [],
    defaults: {
        placeholderFlag: { value_col: 'AEBODSYS', values: ['NA'] },
        maxPrevalence: 0,
        maxGroups: 6,
        totalCol: true,
        diffCol: true,
        prefTerms: false,
        summarizeBy: 'participant'
    },
    plotSettings: {
        h: 15,
        w: 200,
        margin: { left: 40, right: 40 },
        diffMargin: { left: 5, right: 5 },
        r: 7
    },
    validation: false
};

export default defaultSettings;
