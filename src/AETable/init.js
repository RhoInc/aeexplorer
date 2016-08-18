/*------------------------------------------------------------------------------------------------\
  Call functions to collapse the raw data using the selected categories and create the summary
  table.
\------------------------------------------------------------------------------------------------*/

import { util } from '../util';

export function init(table, canvas, data, vars, settings) {

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

    function fillRow(d) {
      //Append major row expand/collapse control.
        var controlCell = d3.select(this)
            .append('td')
            .attr('class', 'controls');

        if (d.key === 'All') {
            controlCell
                .append('span')
                .attr('title', 'Expand')
                .text('+');
        }

      //Append row label.
        var category = d3.select(this)
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
            total.group  = 'Total';
            total.label  = d.values[0].values.label;
            total.major  = d.values[0].values.major;
            total.minor  = d.values[0].values.minor;
            total.n      = d3.sum (d.values, function(d1) { return d1.values.n     ; });
            total.nRecords = d3.sum (d.values, function(d1) { return d1.values.nRecords; });
            total.tot    = d3.sum (d.values, function(d1) { return d1.values.tot   ; });
            total.per    = total.n/total.tot*100;

            d.values[d.values.length] =
                {key: 'Total'
                ,values: total};
        }

      //Append textual rates.
        var values = d3.select(this).selectAll('td.values')
            .data(d.values,function(d) {
                return d.key; })
            .enter()
            .append('td')
            .attr('class', 'values')
            .attr('title', function(d) {
                return d.values.n + '/' + d.values.tot; })
            .text(function(d) {
                return fixed1(d['values'].per) + '%'; })
            .style('color', function(d) {
                return table.colorScale(d.key); });

      //Append graphical rates.
        var prevalencePlot = d3.select(this)
            .append('td')
            .classed('prevplot', true)
                .append('svg')
                .attr('height', h)
                .attr('width', w + 10)
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
                return percentScale(d.values['per']); })
            .attr('cy', h/2)
            .attr('r', r - 2)
            .attr('fill', function(d) {
                    return table.colorScale(d.values['group']); })
                .append('title')
                .text(function(d) {
                    return d.key + ': ' + d3.format(',.1%')(d.values.per/100); });

      //Handle rate differences between groups if settings reference more then one group.
        if (settings.groups.length > 1 && settings.defaults.diffCol === 'Show') {

          //Append container for group rate differences.
            var differencePlot = d3.select(this)
                .append('td')
                .classed('diffplot', true)
                    .append('svg')
                    .attr('height', h)
                    .attr('width', w + 10)
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
                .attr('y1', h/2)
                .attr('y2', h/2)
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
                        table.colorScale(d.group1) :
                        table.colorScale(d.group2); })
                .attr('stroke', function(d) {
                    return d.diff < 0 ?
                        table.colorScale(d.group1) :
                        table.colorScale(d.group2); })
                .attr('stroke-opacity', 0.3);

            diffPoints
                .append('svg:path')
                .attr('d', function(d) { 
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
                        table.colorScale(d.group2) :
                        table.colorScale(d.group1) })
                .attr('stroke', function(d) {
                    return d.diff < 0 ?
                        table.colorScale(d.group2) :
                        table.colorScale(d.group1)})
                .attr('stroke-opacity', 0.3)
        }
    }//fillRow(d)

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
    if (settings.validation) {
        var collapse = function(nested) {
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

        var majorValidation = collapse(dataMajor);
        var minorValidation = collapse(dataMinor);
        var fullValidation = d3.merge([majorValidation, minorValidation])
            .sort(function(a,b) {
                return a.minorCategory < b.minorCategory ? -1 : 1; })
            .sort(function(a,b) {
                return a.majorCategory < b.majorCategory ? -1 : 1; });

      //Function from http://stackoverflow.com/questions/4130849/convert-json-format-to-csv-format-for-ms-excel
        function DownloadJSON2CSV(objArray) {
            var array = typeof objArray !== 'object' ?
                JSON.parse(objArray) :
                objArray;
            var CSV = '';

          //Output column headers.
            var header = '';
            for (var index in array[0]) {
                header += index + ', ';
            }
            header.slice(0, header.length - 1);
            CSV += header + '\r\n';

          //Output column data.
            for (var i = 0; i < array.length; i++) {
                var row = '';

                for (var index in array[i]) {
                    row += array[i][index] + ', ';
                }

                row.slice(0, row.length - 1); 
                CSV += row + '\r\n';
            }

            canvas
                .append('a')
                .attr('href', 'data:text/csv;charset=utf-8,' + escape(CSV))
                .attr('download', true)
                .text('Download Summarized Data');
        }

        DownloadJSON2CSV(fullValidation)
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
                ,n: d3.sum(settings.groups, function(d) { return d.n; })}) :
            settings.groups))
        .enter()
        .append('th')
            .html(function(d) {
                return '<span>' + d.key + '</span>' + '<br><span id="group-num">(n=' + d.n + ')</span>'; })
            .style('color', function(d) {
                return table.colorScale(d.key); })
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

  //Set up layout and Scales for the plots.
    var fixed1 = d3.format('0.1f');

  //Plot size
    var h = 15,
        w = 200,
        margin = {left:40, right:40},
        diffMargin = {left:5, right:5},
        r = 7;

  //Prevalence scales
    var allPercents = d3.merge(
        dataMajor.map(function(major) {
            return d3.merge(major.values.map(function(minor) {
                return d3.merge(minor.values.map(function(group) {
                    return [group.values.per];
                }));
            }));
        }));

    var percentScale = d3.scale.linear()
        .range([0, w])
        .domain([0, d3.max(allPercents)]);

  //Add Prevalence Axis
    var percentAxis = d3.svg.axis()
        .scale(percentScale)
        .orient('top')
        .ticks(6);

    var prevAxis = canvas.select('th.prevHeader')
        .append('svg')
        .attr('height', '34px')
        .attr('width', w + 10)
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

        var diffScale = d3.scale.linear()
            .range([diffMargin.left, w - diffMargin.right])
            .domain(d3.extent(d3.merge([minorDiffs, allDiffs])));

      //Difference Axis
        var diffAxis = d3.svg.axis()
            .scale(diffScale)
            .orient('top')
            .ticks(8);

        var prevAxis = canvas.select('th.diffplot.axis')
            .append('svg')
            .attr('height', '34px')
            .attr('width', w + 10)
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
            function(d) {
                return d.values; },
            function(datum) {
                return datum.key; })
        .enter()
        .append('tr')
        .attr('class', 'major')
        .each(fillRow);

  //Append rows for each minor category.
    var majorGroups = tab.selectAll('tbody')
        .data(dataMinor, function(d) {
            return d.key; });

    var minorRows = majorGroups.selectAll('tr')
        .data(
            function(d) {
                return d.values; },
            function(datum) {
                return datum.key; })
        .enter()
        .append('tr')
        .attr('class', 'minor')
        .each(fillRow);

  //Add a footer for overall rates.
    tab.append('tfoot')
        .selectAll('tr')
        .data(dataAny.length > 0 ? dataAny[0].values : [])
        .enter()
        .append('tr')
        .each(fillRow)

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

  //////////////////////////////////////////////
  //Set up mouseover and click interactivity
  /////////////////////////////////////////////

    /**-------------------------------------------------------------------------------------------\

      annoteDetails(row, group, position)
        - Convenience function that shows the raw #s and annotates point values for a single group

            + row
                - highlighted row (selection containing a 'tr')
            + group
                - group to highlight
            + position
                - 'left'/'right' - controls annotation position

    \-------------------------------------------------------------------------------------------**/

    function annoteDetails(row, group, position) {
      //add color for the selected group on all rows
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

      //Add raw numbers for the current row
        row.selectAll('td.values')
            .filter(function(e) {
                return e.key === group; })
            .append('span.annote')
            .classed('annote', true)
            .text(function(d) {
                return ' (' + d['values'].n + '/' + d['values'].tot + ')'; });

        //row.select('td.prevplot').selectAll('g.points')
        //    .filter(function(e) {
        //        return e.key === group; })
        //    .append('svg:text')
        //    .attr('x', function(d) {
        //        return percentScale(d.values['per']); })   
        //    .attr('dx', function(d) {
        //        return position === 'right' ? '1em' : '-1em'; })   
        //    .attr('y', h/2 + 5)
        //    .attr('fill', function(d) {
        //        return table.colorScale(d.values['group']); }) 
        //    .attr('text-anchor', function(d) {
        //        return position === 'right' ? 'start' : 'end'; })  
        //    .attr('class', 'annote')
        //    .attr('font-size', '10px')
        //    .style('text-shadow', '1px 1px #fff')
        //    .text(function(d) {
        //        return fixed1(d.values['per']); });
    }

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
            annoteDetails(canvas.selectAll('.SummaryTable tr'), d.key, 'right');
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
            annoteDetails(currentRow, d.group1, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? 'right' : 'left');
            annoteDetails(currentRow, d.group2, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? 'left' : 'right');

        })
        .on('mouseout', function(d) {
            canvas.selectAll('td.diffplot svg g').selectAll('path')
                .attr('fill-opacity', function(d) {
                    return (d.sig === 1) ? 1 : 0.1; })
                .attr('stroke-opacity', 0.3);

            if (settings.groups.length === 3) {
                d3.select(this.parentNode).select('.ci')
                    .classed('hidden', true);
            }

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
