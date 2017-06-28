/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
  After this function is executed there should be 4 data objects bound to the chart:
  (1) raw_data: an exact copy of the raw data, with an added "placeholderFlag" variable for participants with no events
  (2) raw_event_data: an exact copy of the raw data with placeholder rows removed
  (3) population_data: a copy of the raw data filtered by:
      (a) chart.config.groups - rows from groups not included in the settings object are removed
      (b) charts.config.variables.filters[type=="participant"] - according to current user selections
  (4) population_event_data a copy of the population_data with:
      (a) placeholder rows removed
      (b) filtered by charts.config.variables.filters[type=="participant"] - according to current user selections
\------------------------------------------------------------------------------------------------*/
export function prepareData(chart) {
    var vars = chart.config.variables; //convenience mapping

    //get filter information
    chart.config.variables.filters.forEach(function(filter_d) {
        //get a list of values that are currently selected
        filter_d.currentValues = [];
        var thisFilter = chart.wrap
            .select('.custom-filters')
            .selectAll('select')
            .filter(function(select_d) {
                return select_d.value_col == filter_d.value_col;
            });
        thisFilter.selectAll('option').each(function(option_d) {
            if (d3.select(this).property('selected')) {
                filter_d.currentValues.push(option_d);
            }
        });
    });
    /////////////////////////////////
    //Create chart.population_data
    /////////////////////////////////

    //Subset data on groups specified in chart.config.groups.
    var groupNames = chart.config.groups.map(d => d.key);
    chart.population_data = chart.raw_data.filter(d => groupNames.indexOf(d[vars['group']]) >= 0);

    //Filter data to reflect the current population (based on filters where type = `participant`)
    chart.config.variables.filters.filter(d => d.type == 'participant').forEach(function(filter_d) {
        //remove the filtered values from the population data
        chart.population_data = chart.population_data.filter(function(rowData) {
            return filter_d.currentValues.indexOf('' + rowData[filter_d.value_col]) > -1;
        });
    });

    ///////////////////////////////////////
    // create chart.population_event_data
    ////////////////////////////////////////

    // Filter event level data
    chart.population_event_data = chart.population_data.filter(d => !d.placeholderFlag);

    chart.config.variables.filters
        .filter(function(d) {
            return d.type == 'event';
        })
        .forEach(function(filter_d) {
            //remove the filtered values from the population data
            chart.population_event_data = chart.population_event_data.filter(function(rowData) {
                return filter_d.currentValues.indexOf('' + rowData[filter_d.value_col]) > -1;
            });
        });

    ////////////////////////////////////////////////////////////////////////
    // add group-level participant and event counts to chart.config.groups
    // Used in group headers and to calculate rates
    ////////////////////////////////////////////////////////////////////////

    //Nest data by [vars.group] and [vars.id].
    var nestedData = d3
        .nest()
        .key(d => d[vars.group])
        .key(d => d[vars.id])
        .entries(chart.population_data);

    //Calculate number of participants and number of events for each group.

    chart.config.groups.forEach(function(groupObj) {
        //count unique participants
        var groupVar = chart.config.variables.group;
        var groupValue = groupObj.key;
        var groupEvents = chart.population_data.filter(f => f[groupVar] == groupValue);
        groupObj.n = d3.set(groupEvents.map(m => m[chart.config.variables.id])).values().length;

        //count number of events
        groupObj.nEvents = chart.population_event_data.filter(
            f => f[groupVar] == groupValue
        ).length;
    });
}
