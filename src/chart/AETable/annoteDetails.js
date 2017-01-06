/*------------------------------------------------------------------------------------------------\

  annoteDetails(table, canvas, row, group)
    - Convenience function that shows the raw #s and annotates point values for a single group

        + table
            - AE table object
        + canvas
            - AE table element
        + row
            - highlighted row (selection containing a 'tr')
        + group
            - group to highlight

\------------------------------------------------------------------------------------------------*/

export function annoteDetails(table, canvas, row, group) {
  //Add color for the selected group on all rows.
    var allPoints = canvas.selectAll('td.prevplot svg g.points')
        .filter(function(e) {
            return e.key === group; });
    allPoints.select('circle')
        .attr('fill', function(d) {
            return table.colorScale(d.key); })
        .attr('opacity', 1);

    var allVals = canvas.selectAll('td.values')
        .filter(function(e) {
            return e.key === group; });
    allVals
        .style('color', function(d) {
            return table.colorScale(d.key); });

    var header = canvas.selectAll('th.values')
        .filter(function(e) {
            return e.key === group; });
    header
        .style('color', function(d) {
            return table.colorScale(d.key); })

  //Add raw numbers for the current row.
    row.selectAll('td.values')
        .filter(function(e) {
            return e.key === group; })
        .append('span.annote')
        .classed('annote', true)
        .text(function(d) {
            return ' (' + d['values'].n + '/' + d['values'].tot + ')'; });
}
