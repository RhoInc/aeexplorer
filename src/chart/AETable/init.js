/*------------------------------------------------------------------------------------------------\
  Call functions to collapse the raw data using the selected categories and create the summary
  table.
\------------------------------------------------------------------------------------------------*/

import { annoteDetails } from './annoteDetails';
import { util } from '../util';
import { collapse } from './collapse';
import { json2csv } from './json2csv';

export function init(table, canvas, data, vars, settings) {
    var chart = table;
    var summary = d3.selectAll('.summaryDiv label')
        .filter(function(d) {
            return d3.select(this).selectAll('.summaryRadio').property('checked'); })[0][0]
        .textContent;

  //Create a dataset nested by [ settings.variables.group ] and [ settings.variables.id ].
    var sub = data.filter(function(e) {
        return e.flag === 0; });
    var dataAny = util.cross
        (sub
        ,settings.groups
        ,vars['id']
        ,'All'        
        ,'All'
        ,vars['group']
        ,settings.groups);
  //Create a dataset nested by [ settings.variables.major ], [ settings.variables.group ], and
  //[ settings.variables.id ].
    var dataMajor = util.cross
        (data
        ,settings.groups
        ,vars['id']
        ,vars['major']
        ,'All'
        ,vars['group']
        ,settings.groups);
  //Create a dataset nested by [ settings.variables.major ], [ settings.variables.minor ],
  //[ settings.variables.group ], and [ settings.variables.id ].
    var dataMinor = util.cross
        (data
        ,settings.groups
        ,vars['id']
        ,vars['major']
        ,vars['minor']
        ,vars['group']
        ,settings.groups);

  //Add a 'differences' object to each row.
    dataMajor = util.addDifferences(dataMajor,settings.groups)
    dataMinor = util.addDifferences(dataMinor,settings.groups)
    dataAny   = util.addDifferences(dataAny,settings.groups)

  //Sort the data based by maximum prevelence.
    dataMajor = dataMajor.sort(util.sort.maxPer);
    dataMinor.forEach(function(major) {
        major.values.sort(function(a,b) {
            var max_a = d3.max(
                a.values.map(function(groups) {
                    return groups.values.per;
                })
            );
            var max_b = d3.max(
                b.values.map(function(groups) {
                    return groups.values.per;
                })
            );

            return max_a < max_b ? 1 : -1;
        });
    });

  //Output the data if the validation setting is flagged.
    if (settings.validation && d3.select('#downloadCSV')[0][0] === null) {

        var majorValidation = collapse(dataMajor);
        var minorValidation = collapse(dataMinor);

        var fullValidation = d3.merge([majorValidation, minorValidation])
            .sort(function(a,b) {
                return a.minorCategory < b.minorCategory ? -1 : 1; })
            .sort(function(a,b) {
                return a.majorCategory < b.majorCategory ? -1 : 1; });

        var CSV = json2csv(fullValidation)

        canvas
            .append('a')
            .attr(
                {'href': 'data:text/csv;charset=utf-8,' + escape(CSV)
                ,'download': true
                ,'id': 'downloadCSV'})
            .text('Download Summarized Data');
    }

  //Draw the summary table headers.
    var totalCol = (settings.defaults.totalCol === 'Show');
    var tab = canvas.select('.SummaryTable')
        .append('table');
    var nGroups = settings.groups.length + totalCol;
    var header1 = tab
        .append('thead')
            .append('tr')

  //Expand/collapse control column header
    header1
        .append('th')
        .attr('rowspan', 2);

  //Category column header
    header1.append('th')
        .attr('rowspan',2)
        .text('Category')

  //Group column headers
    header1.append('th')
        .attr('colspan',nGroups - totalCol)
        .text('Groups');

  //Total column header
    if (totalCol)
        header1.append('th')
            .text('');

  //Graphical AE rates column header
    header1.append('th')
        .text('AE Rate by group')

  //Group differences column header
    var header2 = tab.select('thead')
        .append('tr');
    header2.selectAll('td.values')
        .data((totalCol ?
            settings.groups.concat(
                {key: 'Total'
                ,n: d3.sum(settings.groups, d => d.n)
                ,nEvents: d3.sum(settings.groups, d => d.nEvents)}) :
            settings.groups))
        .enter()
        .append('th')
            .html(d => '<span>' + d.key + '</span>' + '<br><span id="group-num">(n=' + (summary === 'participant' ? d.n : d.nEvents) + ')</span>')
            .style('color', d => table.colorScale(d.key))
            .attr('class', 'values');
    header2.append('th')
        .attr('class', 'prevHeader');
    if (nGroups > 1 && settings.defaults.diffCol === 'Show') {
        header1.append('th')
            .text('Difference Between Groups')
            .attr('class', 'diffplot');
        header2.append('th')
            .attr('class', 'diffplot axis');
    }

  //Prevalence scales
    var allPercents = d3.merge(
        dataMajor.map(function(major) {
            return d3.merge(major.values.map(function(minor) {
                return d3.merge(minor.values.map(function(group) {
                    return [group.values.per];
                }));
            }));
        }));
    console.log(chart)
    chart.percentScale = d3.scale.linear()
        .range([0, chart.config.plotSettings.w])
        .domain([0, d3.max(allPercents)]);

  //Add Prevalence Axis
    var percentAxis = d3.svg.axis()
        .scale(chart.percentScale)
        .orient('top')
        .ticks(6);

    var prevAxis = canvas.select('th.prevHeader')
        .append('svg')
        .attr('height', '34px')
        .attr('width', chart.config.plotSettings.w + 10)
            .append('svg:g')
            .attr('transform', 'translate(5,34)')         
            .attr('class', 'axis percent')
            .call(percentAxis)
    

  //Difference Scale 
    if (settings.groups.length > 1) {
      //Difference Scale 
        var allDiffs = d3.merge(
            dataMajor.map(function(major) {
                return d3.merge(major.values.map(function(minor) {
                    return d3.merge(minor.differences.map(function(diff) {
                        return [diff.upper,diff.lower];
                    }));
                }));
            }));

        var minorDiffs = d3.merge(
            dataMinor.map(function(m) {
                return d3.merge(m.values.map(function(m2) {
                    return d3.merge(m2.differences.map(function(m3) {
                        return d3.merge([[m3.upper], [m3.lower]]);
                    }));
                }));
            }));

        chart.diffScale = d3.scale.linear()
            .range([chart.config.plotSettings.diffMargin.left, 
                chart.config.plotSettings.w - chart.config.plotSettings.diffMargin.right])
            .domain(d3.extent(d3.merge([minorDiffs, allDiffs])));

      //Difference Axis
        var diffAxis = d3.svg.axis()
            .scale(chart.diffScale)
            .orient('top')
            .ticks(8);

        var prevAxis = canvas.select('th.diffplot.axis')
            .append('svg')
            .attr('height', '34px')
            .attr('width', chart.config.plotSettings.w + 10)
                .append('svg:g')
                .attr('transform', 'translate(5,34)')         
                .attr('class', 'axis')
                .attr('class', 'percent')
                .call(diffAxis);
    }

  ////////////////////////////
  // Add Rows to the table //
  ////////////////////////////
    if (!dataMajor.length) {
        if (canvas.select('.missing-data-alert').empty()) {
            canvas.select('.SummaryTable')
                .insert('div', 'table')
                .attr('class', 'alert alert-error alert-danger missing-data-alert')
                .text('No data found in the column specified for major category.');
            throw new Error('No data found in the column specified for major category.');
        }
    }

  //Append a group of rows (<tbody>) for each major category.
    var majorGroups = tab.selectAll('tbody')
        .data(dataMajor, function(d) {
            return d.key; })
        .enter()
        .append('tbody')
        .attr('class', 'minorHidden')
        .attr('class', function(d) {
            return 'major-' + d.key.replace(/[^A-Za-z0-9]/g, ''); });

  //Append a row summarizing all minor categories for each major category.
    var majorRows = majorGroups.selectAll('tr')
        .data(
            function(d) {return d.values; },
            function(datum) {return datum.key; }
        )
        .enter()
        .append('tr')
        .attr('class', 'major')
        .each(function(d){
            var thisRow = d3.select(this)
            chart.util.fillRow(thisRow, chart,d)
        });

  //Append rows for each minor category.
    var majorGroups = tab.selectAll('tbody')
        .data(dataMinor, function(d) {
            return d.key; });

    var minorRows = majorGroups.selectAll('tr')
        .data(
            function(d) {return d.values;},
            function(datum) {return datum.key;}
        )
        .enter()
        .append('tr')
        .attr('class', 'minor')
        .each(function(d){
            var thisRow = d3.select(this)
            chart.util.fillRow(thisRow, chart,d)
        });
  //Add a footer for overall rates.
    tab.append('tfoot')
        .selectAll('tr')
        .data(dataAny.length > 0 ? dataAny[0].values : [])
        .enter()
        .append('tr')
        .each(function(d){
            var thisRow = d3.select(this)
            chart.util.fillRow(thisRow, chart,d)
        });

  //Remove unwanted elements from the footer.
    tab.selectAll('tfoot svg').remove();
    tab.select('tfoot i').remove();
    tab.select('tfoot td.controls span')
        .text('');

  //Hide the rows covering missing data (we could convert this to an option later)
     tab.selectAll('tbody')
        .filter(function(e) {
            return e.key === 'None/Unknown'; })
        .classed('hidden', true)

  ////////////////////////////////////////////////
  // Mouseover/Mouseout for header columns values
  ////////////////////////////////////////////////
    canvas.selectAll('.summaryTable th.values')
        .on('mouseover', function(d) {
          //change colors for points and values to gray
            canvas.selectAll('td.prevplot svg g.points circle')
                .attr('fill', '#555')
                .attr('opacity', 0.1);
            canvas.selectAll('.values')
                .style('color', '#ccc');

          //highlight the selected group
            annoteDetails(table, canvas, canvas.selectAll('.SummaryTable tr'), d.key, 'right');
        })
        .on('mouseout', function(d) {
          //Clear annotations
            canvas.selectAll('td.prevplot svg g.points circle')
                .attr('fill', function(d) {
                    return table.colorScale(d.key); })
                .attr('opacity', 1);
            canvas.selectAll('.values')
                .style('color', function(d) {
                    return table.colorScale(d.key); });
            canvas.selectAll('.annote').remove();
        });

  ///////////////////////////////////////////////
  // Mouseover/Mouseout for difference diamonds
  ///////////////////////////////////////////////
    canvas.selectAll('td.diffplot svg g path.diamond')
        .on('mouseover', function(d) {
            var currentRow = canvas.selectAll('.SummaryTable tbody tr')
                .filter(function(e) {
                    return  e.values[0].values.major === d.major &&
                            e.values[0].values.minor === d.minor; });

            var sameGroups = canvas.selectAll('td.diffplot svg g')
                .filter(function(e) {
                    return e.group1 === d.group1 && e.group2 === d.group2; });

          //Display CI;
            d3.select(this.parentNode).select('.ci')
                .classed('hidden', false);

          //Highlight text/points of selected groups.
            annoteDetails(table, canvas, currentRow, d.group1, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? 'right' : 'left');
            annoteDetails(table, canvas, currentRow, d.group2, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? 'left' : 'right');

        })
        .on('mouseout', function(d) {
            canvas.selectAll('td.diffplot svg g').selectAll('path')
                .attr('fill-opacity', function(d) {
                    return (d.sig === 1) ? 1 : 0.1; })
                .attr('stroke-opacity', 0.3);

            d3.select(this.parentNode).select('.ci')
                .classed('hidden', true);

          //Restore the percentage colors.
            canvas.selectAll('td.prevplot svg g.points circle')
                .attr('fill', function(d) {
                    return table.colorScale(d.key); })
                .attr('opacity', 1);
            canvas.selectAll('.values')
                .style('color', function(d) {
                    return table.colorScale(d.key); });
          //Delete annotations.
            canvas.selectAll('.annote').remove();
        })

  //////////////////////////////////
  // Click Control for table rows //
  //////////////////////////////////
    canvas.selectAll('.SummaryTable tr')
        .on('mouseover', function(d) {
            d3.select(this).select('td.rowLabel')
                .classed('highlight', true);
        })
        .on('mouseout', function(d) {
            d3.select(this).select('td.rowLabel')
                .classed('highlight', false);
        });

  //Expand/collapse a section
    canvas.selectAll('tr.major').selectAll('td.controls')
        .on('click',function(d) {
            var current = d3.select(this.parentNode.parentNode);
            var toggle = !(current.classed('minorHidden'));
            current.classed('minorHidden', toggle);

            d3.select(this)
                .select('span')
                .attr('title', toggle ? 'Expand' : 'Collapse')
                .text(function() {
                    return toggle ? '+' : '-'; });
        });

  ///////////////////////////
  // Show the details table
  ///////////////////////////
    canvas.selectAll('td.rowLabel')
        .on('click',function(d) {
          //Update classes (row visibility handeled via css)
            var toggle = !(canvas.select('.SummaryTable table').classed('summary'));
            canvas.select('.SummaryTable table')
                .classed('summary', toggle);
            canvas.select('div.controls')
                .classed('hidden', toggle);

          //Create/remove the participant level table        
            if (toggle) {
                var major = d.values[0].values['major'];
                var minor = d.values[0].values['minor'];
                table.detailTable
                    (canvas
                    ,data
                    ,vars
                    ,{detailTable:
                        {'major': major
                        ,'minor': minor}});
            } else {
                canvas.select('.DetailTable').remove();
                canvas.select('div.closeDetailTable').remove();
            }
        });
}
