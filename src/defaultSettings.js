const defaultSettings =
    {'variables':
        {'id': 'USUBJID'
        ,'major': 'AEBODSYS'
        ,'minor': 'AEDECOD'
        ,'group': 'ARM'
        ,'details': []}
    ,'filters':
        [   {'value_col': 'AESER'
            ,'label': 'Serious?'
            ,'type':'event'}
        ,   {'value_col': 'AESEV'
            ,'label': 'Severity'
            ,'type':'event'}
        ,   {'value_col': 'AEREL'
            ,'label': 'Relationship'
            ,'type':'event'}
        ,   {'value_col': 'AEOUT'
            ,'label': 'Outcome'
            ,'type':'event'}
        ,  {'value_col': 'SEX'
            ,'label': 'Sex'
            ,'type':'participant'}

        ]
    ,'groups':
        []
    ,'defaults':
        {'maxPrevalence': 0
        ,'totalCol': 'Show'
        ,'diffCol': 'Show'
        ,'prefTerms': 'Hide'}
    ,'plotSettings':
        {'h':15
        ,'w':200
        ,'margin':{'left':40, 'right':40}
        ,'diffMargin': {"left":5, "right":5}
        ,'r':7}
    ,'validation': false};

export default defaultSettings;