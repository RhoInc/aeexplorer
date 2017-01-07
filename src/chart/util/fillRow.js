
/**-------------------------------------------------------------------------------------------\

  fillrow(d)
    - Convienence function which fills each table row and draws the plots.

      + Note1: We'll call this 2x. Once for the major rows and once for
        the minor rows. Will probably want to add a 3rd for overall too.

      + Note2: Scoped within AETable() to avoid passing the big data
        sets around.

      + Note3: Would be good to split out separate plotting functions if
        this gets too much more complex.

\-------------------------------------------------------------------------------------------**/

export function fillRow(currentRow, chart, d) {
    var table = chart;
  //Append major row expand/collapse control.
    var controlCell = currentRow
        .append('td')
        .attr('class', 'controls');

    if (d.key === 'All') {
        controlCell
            .append('span')
            .attr('title', 'Expand')
            .text('+');
    }

  //Append row label.
    var category = currentRow
        .append('td')
        .attr(
            {'class': 'rowLabel'
            ,'title': 'Show listing'});
    category
        .append('a')
        .text(function(rowValues) {
            return rowValues.values[0].values['label'];
        });

  //Calculate total frequency, number of records, population denominator, and rate.
    if (settings.defaults.totalCol === 'Show') {
        var total = {};
        total.major     = d.values[0].values.major;
        total.minor     = d.values[0].values.minor;
        total.label     = d.values[0].values.label;
        total.group     = 'Total';

        total.n   = d3.sum (d.values, di => di.values.n);
        total.tot = d3.sum (d.values, di => di.values.tot);

        total.per = total.n/total.tot*100;

        d.values[d.values.length] =
            {key: 'Total'
            ,values: total};
    }

  //Append textual rates.
    var values = currentRow.selectAll('td.values')
        .data(d.values,function(d) {
            return d.key; })
        .enter()
        .append('td')
        .attr('class', 'values')
        .attr('title', function(d) {
            return d.values.n + '/' + d.values.tot; })
        .text(function(d) {
            return d3.format('0.1f')(d['values'].per) + '%'; })
        .style('color', function(d) {
            return table.colorScale(d.key); });

  //Append graphical rates.
    var prevalencePlot = currentRow
        .append('td')
        .classed('prevplot', true)
            .append('svg')
            .attr('height', chart.config.plotSettings.h)
            .attr('width', chart.config.plotSettings.w + 10)
                .append('svg:g')
                .attr('transform', 'translate(5,0)');

    var points = prevalencePlot.selectAll('g.points')
        .data(d.values)
        .enter()
        .append('g')
        .attr('class', 'points');
    points
        .append('svg:circle')
        .attr('cx', function(d) {
            return chart.percentScale(d.values['per']); })
        .attr('cy', chart.config.plotSettings.h/2)
        .attr('r', chart.config.plotSettings.r - 2)
        .attr('fill', function(d) {
                return table.colorScale(d.values['group']); })
            .append('title')
            .text(function(d) {
                return d.key + ': ' + d3.format(',.1%')(d.values.per/100); });

  //Handle rate differences between groups if settings reference more then one group.
    if (settings.groups.length > 1 && settings.defaults.diffCol === 'Show') {

      //Append container for group rate differences.
        var differencePlot = currentRow
            .append('td')
            .classed('diffplot', true)
                .append('svg')
                .attr('height', chart.config.plotSettings.h)
                .attr('width', chart.config.plotSettings.w + 10)
                    .append('svg:g')
                    .attr('transform', 'translate(5,0)');

        var diffPoints = differencePlot.selectAll('g')
            .data(d.differences)
            .enter()
            .append('svg:g');
        diffPoints
            .append('title')
            .text(function(d) {
                return  d.group1 + ' (' + d3.format(',.1%')(d.p1) + ') vs. ' +
                        d.group2 + ' (' + d3.format(',.1%')(d.p2) + '): ' +
                        d3.format(',.1%')(d.diff/100); });

      //Append graphical rate difference confidence intervals.
        diffPoints
            .append('svg:line')
            .attr('x1', function(d) {
                return diffScale(d.upper); })
            .attr('x2', function(d) {
                return diffScale(d.lower); })
            .attr('y1', chart.config.plotSettings.h/2)
            .attr('y2', chart.config.plotSettings.h/2)
            .attr('class', 'ci')
            .classed('hidden', settings.groups.length > 2)
            .attr('stroke', '#bbb');

      //Append graphical rate differences.
        var triangle = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate('linear-closed');
        
        diffPoints
            .append('svg:path')
            .attr('d', function(d) { 
                var h = chart.config.plotSettings.h,
                    r = chart.config.plotSettings.r

                var leftpoints =
                    [{x:diffScale(d.diff)     ,y:h/2 + r}//bottom
                    ,{x:diffScale(d.diff) - r ,y:h/2    }//middle-left
                    ,{x:diffScale(d.diff)     ,y:h/2 - r}//top
                    ];
                return triangle(leftpoints); 
            })
            .attr('class', 'diamond')
            .attr('fill-opacity', function(d) {
                return (d.sig === 1) ? 1 : 0.1; })
            .attr('fill', function(d) {
                return d.diff < 0 ?
                    chart.colorScale(d.group1) :
                    chart.colorScale(d.group2); })
            .attr('stroke', function(d) {
                return d.diff < 0 ?
                    chart.colorScale(d.group1) :
                    chart.colorScale(d.group2); })
            .attr('stroke-opacity', 0.3);

        diffPoints
            .append('svg:path')
            .attr('d', function(d) { 
                var h = chart.config.plotSettings.h,
                    r = chart.config.plotSettings.r;

                var rightpoints =
                    [{x:diffScale(d.diff)    ,y:h/2 + r}//bottom
                    ,{x:diffScale(d.diff) + r,y:h/2    }//middle-right
                    ,{x:diffScale(d.diff)    ,y:h/2 - r}//top
                    ];
                return triangle(rightpoints); 
            })
            .attr('class', 'diamond')
            .attr('fill-opacity', function(d) {
                return (d.sig === 1) ? 1 : 0.1; })
            .attr('fill', function(d) {
                return d.diff<0 ?
                    chart.colorScale(d.group2) :
                    chart.colorScale(d.group1) })
            .attr('stroke', function(d) {
                return d.diff < 0 ?
                    chart.colorScale(d.group2) :
                    chart.colorScale(d.group1)})
            .attr('stroke-opacity', 0.3)
    }
}
