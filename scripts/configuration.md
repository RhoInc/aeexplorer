# Renderer-specific settings
The sections below describe each aeexplorer setting as of version 3.2.6.

## settings.variables
`object`

an object that specifies how to map columns from the data file to the chart settings

### settings.variables.id
`string`

ID

**default:** `"USUBJID"`

### settings.variables.major
`string`

Major Category

**default:** `"AEBODSYS"`

### settings.variables.minor
`string`

Minor Category

**default:** `"AEDECOD"`

### settings.variables.group
`string`

Group

**default:** `"ARM"`

### settings.variables.details
`array`

Details

**default:** none

### settings.variables.filters
`array`

Filters

**default:** 
```
[
  {
    "value_col": "AESER",
    "label": "Serious?",
    "type": "event",
    "start": []
  },
  {
    "value_col": "AESEV",
    "label": "Severity",
    "type": "event",
    "start": []
  },
  {
    "value_col": "AEREL",
    "label": "Relationship",
    "type": "event",
    "start": []
  },
  {
    "value_col": "AEOUT",
    "label": "Outcome",
    "type": "event",
    "start": []
  }
]
```



## settings.groups
`array`

An array specifying which levels of settings.variables.groups will appear as columns in the table.

**default:** none



## settings.defaults
`object`

an object containing default settings regarding appearance of the tables

### settings.defaults.placeholderFlag
`object`

Placeholder Rows Definition



### settings.defaults.maxPrevalence
`number`

Maximum Prevelance

**default:** `0`

### settings.defaults.maxGroups
`number`

Maximum Group Count

**default:** `6`

### settings.defaults.totalCol
`boolean`

Show Total Column?

**default:** `true`

### settings.defaults.diffCol
`boolean`

Show Difference Column?

**default:** `true`

### settings.defaults.prefTerms
`boolean`

Show All Preferred Terms?

**default:** `false`

### settings.defaults.summarizeBy
`string`

Data Summary Type

**default:** `"participant"`



## settings.plotSettings
`object`

Object to specify the appearance of the plots embedded in the table rows.

### settings.plotSettings.h
`number`

Height

**default:** `15`

### settings.plotSettings.w
`number`

Width

**default:** `200`

### settings.plotSettings.r
`number`

Radius

**default:** `7`

### settings.plotSettings.margin
`object`

Dot Plot Margins



### settings.plotSettings.diffMargin
`object`

Difference Plot Margins





## settings.validation
`boolean`

adds a link to download the summarized data in a comma-separated format

**default:** `false`