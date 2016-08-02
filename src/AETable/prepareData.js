/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/

export function prepareData(canvas, data, vars, settings) {
    data.forEach(function(e) {
        e.data_all = 'All';
        e.flag = 0;

        if (['No AEs','NA','na','',' ','None/Unknown', 'N/A'].indexOf(e[vars.major].trim()) > -1) {
            e[vars.major] = 'None/Unknown';
            e.flag = 1;
        }

        if (['No AEs','NA','na','',' ','None/Unknown', 'N/A'].indexOf(e[vars.minor].trim()) > -1) {
            e[vars.minor] = 'None/Unknown';
        }
    });

  //Calculate group subject totals.
    var nestedData = d3.nest()
        .key(function(d) { return d[vars.group]; })
        .key(function(d) { return d[vars.id]; })
        .entries(data);

    settings.groups.forEach(function(e) {
        var groupData = nestedData.filter(function(f) {
            return f.key === e.key; });
        e.n = groupData.length ?
            groupData[0].values.length :
            d3.sum(nestedData.map(function(m) {
                return m.values.length; }));
    });

  //Subset data on groups specified in settings.groups.
    var groupNames = settings.groups.map(function(e) {
        return e.key; });
    var sub = data.filter(function(e) {
        return groupNames.indexOf(e[vars['group']]) >= 0; });
    
  //Filter without bootstrap multiselect
    canvas.select('.custom-filters').selectAll('select')
        .each(function(dVar) {
            var currentvar = dVar.key;

            d3.select(this).selectAll('option')
                .each(function(dItem) {
                    var currentitem = dItem;

                    if (!d3.select(this).property('selected')) {
                        sub = sub.filter(function(d) {
                            return d[currentvar] != currentitem; });
                    }
                });
        });

    return sub;
}
