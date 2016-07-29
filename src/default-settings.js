//Define default settings.
const settings = {
    id_col: 'USUBJID',
    major_col: 'AEBODSYS',
    minor_col: 'AEDECOD',
    group_col: 'TRT01P',
    filter_cols: [
        'AESER',
        'AESEV',
        'AEREL'],
    detail_cols: [],
    defaults: {
        maxPrevalence: '0.0',
        prefTerms: 'Hide',
        diffCol: 'Show'},
    filterSettings: [
        {"key":"AESER",
        "label":"Serious?"},
        {"key":"AESEV",
        "label":"Severity"},
        {"key":"AEREL",
        "label":"Relationship"}]
};

//Replicate settings in multiple places in the settings object.
export function syncSettings(settings) {
    return settings;
}

//Define default control objects.
export const controlInputs = []

//Map values from settings to control inputs.
export function syncControlInputs(controlInputs, settings) {
    return controlInputs
}

export default settings
