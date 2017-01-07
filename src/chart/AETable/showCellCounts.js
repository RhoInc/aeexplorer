/*------------------------------------------------------------------------------------------------\

  annoteDetails(table, canvas, row, group)
    - Convenience function that shows the raw #s and annotates point values for a single group

        + table
            - AE table object
        + rows
            - highlighted row(s) (selection containing 'tr' objects)
        + group
            - group to highlight

\------------------------------------------------------------------------------------------------*/

export function showCellCounts(chart, rows, group) {
  //Add raw counts for the specified row/groups .
    rows.selectAll('td.values')
        .filter(function(e) {
            return e.key === group; })
        .append('span.annote')
        .classed('annote', true)
        .text(function(d) {
            return ' (' + d['values'].n + '/' + d['values'].tot + ')'; });
}
