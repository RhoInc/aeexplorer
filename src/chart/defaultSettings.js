const defaultSettings = {
    variables: {
        id: 'USUBJID',
        major: 'AEBODSYS',
        minor: 'AEDECOD',
        group: 'ARM',
        details: null,
        filters: [
            {
                value_col: 'AESER',
                label: 'Serious?',
                type: 'event',
                start: null
            },
            {
                value_col: 'AESEV',
                label: 'Severity',
                type: 'event',
                start: null
            },
            {
                value_col: 'AEREL',
                label: 'Relationship',
                type: 'event',
                start: null
            },
            {
                value_col: 'AEOUT',
                label: 'Outcome',
                type: 'event',
                start: null
            }
        ]
    },
    variableOptions: null,
    groups: null,
    colors: ['#377EB8', '#4DAF4A', '#984EA3', '#FF7F00', '#A65628', '#F781BF', '#E41A1C'],
    defaults: {
        placeholderFlag: {
            value_col: 'AEBODSYS',
            values: ['NA']
        },
        maxPrevalence: 0,
        maxGroups: 6,
        totalCol: true,
        groupCols: true,
        diffCol: true,
        prefTerms: false,
        summarizeBy: 'participant',
        webchartsDetailsTable: false,
        useVariableControls: true
    },
    plotSettings: {
        h: 15,
        w: 200,
        margin: {
            left: 40,
            right: 40
        },
        diffMargin: {
            left: 5,
            right: 5
        },
        r: 7
    },
    validation: false
};

export const colors = defaultSettings.colors;
export default defaultSettings;
