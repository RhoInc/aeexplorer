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
        ,'totalCol': true
        ,'diffCol': true
        ,'prefTerms': false}
    ,'plotSettings':
        {'h':15
        ,'w':200
        ,'margin':{'left':40, 'right':40}
        ,'diffMargin': {"left":5, "right":5}
        ,'r':7}
    ,'validation': false};

export default defaultSettings;