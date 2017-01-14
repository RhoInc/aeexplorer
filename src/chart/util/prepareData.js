/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/
export function prepareData(chart) {
    var noAEs = ['', 'na', 'n/a', 'no ae', 'no aes', 'none', 'unknown', 'none/unknown'];
    var vars = chart.config.variables //convenience mapping

    //get filter information
    var currentFilters = []
    chart.wrap.select('.custom-filters').selectAll('select')
    .each(function(filter_d){
        //get a list of values that are currently selected
        filter_d.currentValues =  []
        d3.select(this).selectAll('option').each(function(di) {
            if (d3.select(this).property('selected')) {filter_d.currentValues.push(di)}
        })
        currentFilters.push(filter_d)
    })
    console.log(currentFilters)
    
    //Flag records which represent [vars.id] values without an adverse event.
    chart.raw_data.forEach(d => {
        d.data_all = 'All';
        d.flag = 0;

        if (noAEs.indexOf(d[vars.major].trim().toLowerCase()) > -1) {
            d[vars.major] = 'None/Unknown';
            d.flag = 1;
        }

        if (noAEs.indexOf(d[vars.minor].trim().toLowerCase()) > -1) {
            d[vars.minor] = 'None/Unknown';
        }
    });

  //Subset data on groups specified in chart.config.groups.
    var groupNames = chart.config.groups.map(d => d.key);
    chart.population_data = chart.raw_data.filter(d => groupNames.indexOf(d[vars['group']]) >= 0);

  //Filter data to reflect the current population (based on filters where type = `participant`)
    currentFilters.filter(function(d){return d.type=="participant"})
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
                .filter(di => di[vars.group] === d.key && di.flag === 0)
                .length;
        });

  //Filter event level data - clone population data and then filter 
  chart.filtered_data = chart.population_data
    currentFilters.filter(function(d){return d.type=="event"})
    .forEach(function(filter_d) {
        //remove the filtered values from the population data
        chart.filtered_data = chart.filtered_data
        .filter(function(rowData){
            return filter_d.currentValues.indexOf(rowData[filter_d.value_col])>-1
        }) 
    })

console.log('raw records:' + chart.raw_data.length + " - pop records: "+chart.population_data.length +" - filtered records: "+chart.filtered_data.length)

}
