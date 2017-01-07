/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/
export function prepareData(chart) {
    var noAEs = ['', 'na', 'n/a', 'no ae', 'no aes', 'none', 'unknown', 'none/unknown'];

    var vars = chart.config.variables //convenience mapping

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

  //Nest data by [vars.group] and [vars.id].
    var nestedData = d3.nest()
        .key(d => d[vars.group])
        .key(d => d[vars.id])
        .entries(chart.raw_data);

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

  //Subset data on groups specified in chart.config.groups.
    var groupNames = chart.config.groups
        .map(d => d.key);
    var sub = chart.raw_data
        .filter(d => groupNames.indexOf(d[vars['group']]) >= 0);

  //Filter without bootstrap multiselect
    chart.wrap.select('.custom-filters').selectAll('select')
        .each(function(d) {
            d3.select(this).selectAll('option')
                .each(function(di) {
                    if (!d3.select(this).property('selected'))
                        sub = sub.filter(dii => dii[d.value_col] !== di);
                });
        });

    return sub;
}
