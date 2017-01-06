/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/

export function prepareData(canvas, data, vars, settings) {
    var noAEs = ['', 'na', 'n/a', 'no ae', 'no aes', 'none', 'unknown', 'none/unknown'];

  //Flag records which represent [vars.id] values without an adverse event.
    data.forEach(d => {
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
        .entries(data);

  //Calculate number of [vars.id] and number of events.
    settings.groups
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
            d.nEvents = data
                .filter(di => di[vars.group] === d.key && di.flag === 0)
                .length;
        });

  //Subset data on groups specified in settings.groups.
    var groupNames = settings.groups
        .map(d => d.key);
    var sub = data
        .filter(d => groupNames.indexOf(d[vars['group']]) >= 0);

  //Filter without bootstrap multiselect
    canvas.select('.custom-filters').selectAll('select')
        .each(function(d) {
            d3.select(this).selectAll('option')
                .each(function(di) {
                    if (!d3.select(this).property('selected'))
                        sub = sub.filter(dii => dii[d.value_col] !== di);
                });
        });

    return sub;
}
