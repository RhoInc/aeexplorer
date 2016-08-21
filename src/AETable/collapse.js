/*------------------------------------------------------------------------------------------------\
  Collapse data for export to .csv.
\------------------------------------------------------------------------------------------------*/

export function collapse(nested) {
  //Collapse nested object.
    var collapsed = nested.map(function(soc) {
        var allRows = soc.values.map(function(e) {    
            var eCollapsed = {};
            eCollapsed.majorCategory = '"' + e.values[0].values.major + '"';
            eCollapsed.minorCategory = '"' + e.values[0].values.minor + '"';

            e.values.forEach(function(val,i) {
                var n = i + 1;
                eCollapsed['val' + n + '_label'] = val.key;
                eCollapsed['val' + n + '_numerator'] = val.values.n;
                eCollapsed['val' + n + '_denominator'] = val.values.tot;
                eCollapsed['val' + n + '_percent'] = val.values.per;
            });

            if (e.differences) {
                e.differences.forEach(function(diff,i) {
                    var n = i + 1;
                    eCollapsed['diff' + n + '_label'] = diff.group1 + '-' + diff.group2;
                    eCollapsed['diff' + n + '_val'] = diff['diff'];
                    eCollapsed['diff' + n + '_sig'] = diff['sig'];

                });
            }
            return eCollapsed
        });
        return allRows
    });
    return d3.merge(collapsed);
}
