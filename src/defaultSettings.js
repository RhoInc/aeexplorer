const defaultSettings =
    {'variables':
        {'id': 'USUBJID'
        ,'major': 'AEBODSYS'
        ,'minor': 'AEDECOD'
        ,'group': 'ARM'
        ,'details': []}
    ,'filters':
        [   {'value_col': 'AESER'
            ,'label': 'Serious?'}
        ,   {'value_col': 'AESEV'
            ,'label': 'Severity'}
        ,   {'value_col': 'AEREL'
            ,'label': 'Relationship'}
        ,   {'value_col': 'AEOUT'
            ,'label': 'Outcome'}]
    ,'groups':
        []
    ,'defaults':
        {'maxPrevalence': 0
        ,'totalCol': 'Show'
        ,'diffCol': 'Show'
        ,'prefTerms': 'Hide'}
    ,'validation': false};

export default defaultSettings;
