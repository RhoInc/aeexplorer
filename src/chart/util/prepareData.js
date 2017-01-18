/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/
export function prepareData(chart) {
    var vars = chart.config.variables //convenience mapping

    //get filter information
    chart.config.variables.filters
    .forEach(function(filter_d){
        
        //get a list of values that are currently selected
        filter_d.currentValues =  []
        var thisFilter = chart.wrap.select('.custom-filters').selectAll('select')
        .filter(function(select_d){return select_d.value_col == filter_d.value_col})
        thisFilter.selectAll('option').each(function(option_d) {
            if (d3.select(this).property('selected')) {filter_d.currentValues.push(option_d)}
        })
    })
    
  //Subset data on groups specified in chart.config.groups.
    var groupNames = chart.config.groups.map(d => d.key);
    chart.population_data = chart.raw_data.filter(d => groupNames.indexOf(d[vars['group']]) >= 0);

  //Filter data to reflect the current population (based on filters where type = `participant`)
     chart.config.variables.filters.filter(d=>d.type=="participant")
    .forEach(function(filter_d) {
        //remove the filtered values from the population data
        chart.population_data = chart.population_data
        .filter(function(rowData){
            return filter_d.currentValues.indexOf(rowData[filter_d.value_col])>-1
        }) 
    })

  //Nest data by [vars.group] and [vars.id].
    var nestedData = d3.nest()
        .key(d => d[vars.group])
        .key(d => d[vars.id])
        .entries(chart.population_data);

  //Calculate number of [vars.id] and number of events.
    chart.config.groups
        .forEach(d => {
          //Filter nested data on [vars.group].
            var groupData = nestedData
                .filter(di => di.key === d.key);

          //Calculate number of [vars.id].
            d.n = groupData.length > 0 ?
                groupData[0].values.length :
                d3.sum(
                    nestedData
                        .map(di => di.values.length));

          //Calculate number of events.
            d.nEvents = chart.raw_data
                .filter(di => di[vars.group] === d.key && di.placeholderFlag === false)
                .length;
        });

  //Filter event level data
  chart.population_event_data = chart.population_data
     chart.config.variables.filters.filter(function(d){return d.type=="event"})
    .forEach(function(filter_d) {
        //remove the filtered values from the population data
        chart.population_event_data = chart.population_event_data
        .filter(function(rowData){
            return filter_d.currentValues.indexOf(rowData[filter_d.value_col])>-1
        }) 
    })

console.log('raw records:' + chart.raw_data.length + ' | raw event records:' + chart.raw_event_data.length +" | pop records: "+chart.population_data.length +" | population event (filtered) records: "+chart.population_event_data.length)

}
