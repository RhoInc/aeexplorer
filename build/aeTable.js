'use strict';

var aeTable = (function () {
    'use strict';

    var defaultSettings = { 'variables': { 'id': 'USUBJID',
            'major': 'AEBODSYS',
            'minor': 'AEDECOD',
            'group': 'ARM',
            'details': [] },
        'filters': [{ 'value_col': 'AESER',
            'label': 'Serious?' }, { 'value_col': 'AESEV',
            'label': 'Severity' }, { 'value_col': 'AEREL',
            'label': 'Relationship' }, { 'value_col': 'AEOUT',
            'label': 'Outcome' }],
        'groups': [],
        'defaults': { 'maxPrevalence': 0,
            'totalCol': 'Show',
            'diffCol': 'Show',
            'prefTerms': 'Hide' },
        'validation': false };

    /*------------------------------------------------------------------------------------------------\
      Initialize adverse event explorer.
    \------------------------------------------------------------------------------------------------*/

    function init(data) {
        var element = d3.select(this.element);
        var settings = this.config;

        //Render single column if no group variable is specified.
        if (!settings.variables.group || ['', ' '].indexOf(settings.variables.group) > -1) {
            settings.variables.group = 'data_all';
            settings.defaults.totalCol = '';
            settings.groups = [{ 'key': 'All' }];
        }

        function errorNote(msg) {
            element.append('div').attr('class', 'alert alert-error alert-danger').text(msg);
        };

        //Check that variables specified in settings exist in data.
        for (var x in settings.variables) {
            var varList = d3.keys(data[0]).concat('data_all');

            if (varList.indexOf(settings.variables[x]) === -1) {
                if (settings.variables[x] instanceof Array) {
                    settings.variables[x].forEach(function (e) {
                        if (d3.keys(data[0]).indexOf(e) === -1) {
                            errorNote('Error in variables object.');
                            throw new Error(x + ' variable ' + '(\'' + e + '\') not found in dataset.');
                        }
                    });
                } else {
                    errorNote('Error in variables object.');
                    throw new Error(x + ' variable ' + '(\'' + settings.variables[x] + '\') not found in dataset.');
                }
            }
        }

        //Check that group values defined in settings are actually present in dataset.
        var groups = d3.set(data.map(function (d) {
            return d[settings.variables.group];
        })).values();
        var groupsObject = groups.map(function (d) {
            return { 'key': d };
        });

        if (!settings.groups || settings.groups.length === 0) settings.groups = groupsObject.sort(function (a, b) {
            return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
        });

        settings.groups.forEach(function (d) {
            if (groups.indexOf(d.key) === -1) {
                errorNote('Error in settings object.');
                throw new Error('\'' + e.key + '\' in the Groups setting is not found in the dataset.');
            }
        });

        //Set the domain for the color scale based on groups.
        this.colorScale.domain(settings.groups.map(function (e) {
            return e.key;
        }));

        //Set 'Total' column color to #777.
        if (settings.defaults.totalCol === 'Show') this.colorScale.range()[settings.groups.length] = '#777';

        //Initialize adverse event eplorer.
        this.layout(element);
        this.controls.init(this, element, data, settings.variables, settings);
        this.eventListeners.rateFilter(this, element);
        this.eventListeners.search(this, element, data, settings.variables, settings);
        this.eventListeners.customFilters(this, element, data, settings.variables, settings);
        this.AETable.redraw(this, element, data, settings.variables, settings);
    }

    /*------------------------------------------------------------------------------------------------\
      Set colors.
    \------------------------------------------------------------------------------------------------*/

    var colorScale = d3.scale.ordinal().range(['#377EB8', '#4DAF4A', '#984EA3', '#FF7F00', '#A65628', '#F781BF', '#FFFF33', '#E41A1C']);

    /*------------------------------------------------------------------------------------------------\
      Generate HTML containers.
    \------------------------------------------------------------------------------------------------*/

    function layout(canvas) {
        var wrapper = canvas.append('div').attr('class', 'aeTable row-fluid').append('div').attr('class', 'table-wrapper');
        wrapper.append('div').attr('class', 'controls form-inline row-fluid');
        wrapper.append('div').attr('class', 'SummaryTable');
    }

    /*------------------------------------------------------------------------------------------------\
      Initialize controls.
    \------------------------------------------------------------------------------------------------*/

    function init$1(table, canvas, data, vars, settings) {
        var controls = canvas.select('div.controls');
        controls.attr('onsubmit', 'return false;');

        //Clear controls.
        controls.selectAll('*').remove();

        //Generate HTML containers.
        var rateFilter = controls.append('div').attr('class', 'rate-filter');
        var searchBox = controls.append('form').attr('class', 'searchForm navbar-search pull-right').attr('onsubmit', 'return false;');
        var customFilters = controls.append('div').attr('class', 'custom-filters');

        //Draw UI component.
        table.controls.filters.rate.init(rateFilter);
        table.controls.filters.custom.init(customFilters, data, vars, settings);
        table.controls.search.init(searchBox);

        //Initialize the filter rate.
        table.controls.filters.rate.set(canvas, settings);
    }

    /*------------------------------------------------------------------------------------------------\
      Initialize rate filter.
    \------------------------------------------------------------------------------------------------*/

    function init$2(selector) {
        //Clear rate filter.
        selector.selectAll('span.filterLabel, div.rateFilterDiv').remove();

        //Generate rate filter.
        selector.append('span').attr('class', 'sectionHead').text('Filter by prevalence:');

        var rateFilter = selector.append('div').attr('class', 'input-prepend input-append input-medium rateFilterDiv');
        rateFilter.append('span').attr('class', 'add-on before').html('&#8805;');
        rateFilter.append('input').attr({ 'class': 'appendedPrependedInput rateFilter',
            'type': 'text' });
        rateFilter.append('span').attr('class', 'add-on after').text('%');
    }

    function get() {}

    /*------------------------------------------------------------------------------------------------\
      Set rate filter default.
    \------------------------------------------------------------------------------------------------*/

    function set(canvas, settings) {
        canvas.select('div.controls input.rateFilter').property('value', settings.defaults.maxPrevalence ? settings.defaults.maxPrevalence : 0);
    }

    var rate = { init: init$2,
        get: get,
        set: set };

    /*------------------------------------------------------------------------------------------------\
      Initialize custom controls.
    \------------------------------------------------------------------------------------------------*/

    function init$3(selector, data, vars, settings) {
        //Create list of filter variables.
        var filterVars = settings.filters.map(function (e) {
            return {
                value_col: e.value_col,
                values: [] };
        });

        //Create list for each filter variable of its distinct values.
        filterVars.forEach(function (e) {
            var varLevels = d3.nest().key(function (d) {
                return d[e.value_col];
            }).entries(data);
            e.values = varLevels.map(function (d) {
                return d.key;
            });
        });

        //Clear custom controls.
        selector.selectAll('ul.nav').remove();

        //Add filter controls.
        var filterList = selector.append('ul').attr('class', 'nav');
        var filterItem = filterList.selectAll('li').data(filterVars).enter().append('li').attr('class', function (d) {
            return 'custom-' + d.key + ' filterCustom';
        });
        var filterLabel = filterItem.append('span').attr('class', 'filterLabel').text(function (d) {
            if (settings.filters) {
                var filterLabel = settings.filters.filter(function (d1) {
                    return d1.value_col === d.value_col;
                })[0].label;

                return filterLabel ? filterLabel : d.key;
            } else return d.key;
        });
        var filterCustom = filterItem.append('select').attr('multiple', true);

        //Add data-driven filter options.
        var filterItems = filterCustom.selectAll('option').data(function (d) {
            return d.values.filter(function (di) {
                return ['NA', '', ' '].indexOf(di) === -1;
            });
        }).enter().append('option').html(function (d) {
            return '<span><i class = "icon-remove icon-white fa fa-times"></i></span>' + (['NA', '', ' '].indexOf(d) > -1 ? '[None]' : d);
        }).attr('value', function (d) {
            return d;
        }).attr('selected', 'selected');
    }

    function get$1() {}

    /*------------------------------------------------------------------------------------------------\
      Set custom filter defaults.
    \------------------------------------------------------------------------------------------------*/

    function set$1() {}

    var custom = { init: init$3,
        get: get$1,
        set: set$1 };

    var filters = { rate: rate,
        custom: custom };

    /*------------------------------------------------------------------------------------------------\
      Initialize search control.
    \------------------------------------------------------------------------------------------------*/

    function init$4(selector) {
        //Clear search control.
        selector.selectAll('span.seach-label, input.searchBar').remove();

        //Generate search control.
        var searchLabel = selector.append('span').attr('class', 'search-label label hidden');
        searchLabel.append('span').attr('class', 'search-count');
        searchLabel.append('span').attr('class', 'clear-search').html('&#9747;');
        selector.append('input').attr('type', 'text').attr('class', 'searchBar search-query input-medium').attr('placeholder', 'Search');
    }

    function get$2() {}

    /*------------------------------------------------------------------------------------------------\
      Set search term default.
    \------------------------------------------------------------------------------------------------*/

    function set$2() {}

    /*------------------------------------------------------------------------------------------------\
      Clear search term results.
    \------------------------------------------------------------------------------------------------*/

    function clear(table, canvas) {
        //Re-enable rate filter.
        canvas.select('input.rateFilter').property('disabled', false);

        //Clear search box.
        canvas.select('input.searchBar').property('value', '');

        //Remove search highlighting.
        canvas.selectAll('div.SummaryTable table tbody tr.search td.rowLabel').html(function (d) {
            return d.values[0].values['label'];
        });

        //Remove 'clear search' icon and label.
        canvas.select('span.search-label').classed('hidden', true);

        //Clear search flags.
        canvas.selectAll('div.SummaryTable').classed('search', false);
        canvas.selectAll('div.SummaryTable table tbody').classed('search', false);
        canvas.selectAll('div.SummaryTable table tbody tr').classed('search', false);

        //Reset filters and row toggle.
        table.AETable.toggleRows(canvas);
    }

    var search = { init: init$4,
        get: get$2,
        set: set$2,
        clear: clear };

    var controls = { init: init$1,
        filters: filters,
        search: search };

    /*------------------------------------------------------------------------------------------------\
      Define rate filter event listener.
    \------------------------------------------------------------------------------------------------*/

    function rateFilter(table, canvas) {
        var rateFilter = canvas.select('input.rateFilter');

        rateFilter.on('change', function (d) {
            //Clear filter flags.
            canvas.selectAll('.SummaryTable table tbody tr').classed('filter', false);

            //Add filter flags.
            table.AETable.toggleRows(canvas);
        });
    }

    /*------------------------------------------------------------------------------------------------\
      Define custom filters event listener.
    \------------------------------------------------------------------------------------------------*/

    function customFilters(table, canvas, data, vars, settings) {
        var filterCustom = canvas.selectAll('.custom-filters ul li select');

        //Redraw table without bootstrap multiselect.
        filterCustom.on('change', function () {
            table.AETable.redraw(table, canvas, data, vars, settings);
        });
    }

    /*------------------------------------------------------------------------------------------------\
      Define search control event listener.
    \------------------------------------------------------------------------------------------------*/

    function search$1(table, canvas, data, vars, settings) {
        canvas.select('input.searchBar').on('change', function (d) {
            var searchTerm = d3.select(this).property('value').toLowerCase();

            if (searchTerm.length > 0) {

                //Clear the previous search but preserve search text.
                table.controls.search.clear(table, canvas);
                d3.select(this).property('value', searchTerm);

                //Clear flags.
                canvas.selectAll('div.SummaryTable table tbody').classed('minorHidden', false);
                canvas.selectAll('div.SummaryTable table tbody tr').classed('filter', false);
                canvas.select('div.SummaryTable').classed('search', false);
                canvas.selectAll('div.SummaryTable table tbody').classed('search', false);
                canvas.selectAll('div.SummaryTable table tbody tr').classed('search', false);

                //Hide expand/collapse cells.
                canvas.selectAll('div.SummaryTable table tbody tr td.controls span').classed('hidden', true);

                //Display 'clear search' icon.
                canvas.select('span.search-label').classed('hidden', false);

                //Flag summary table.
                var tab = canvas.select('div.SummaryTable').classed('search', true);

                //Capture rows which contain the search term.
                var tbodyMatch = tab.select('table').selectAll('tbody').each(function (bodyElement) {
                    var bodyCurrent = d3.select(this);
                    var bodyData = bodyCurrent.data()[0];

                    bodyCurrent.selectAll('tr').each(function (rowElement) {
                        var rowCurrent = d3.select(this);
                        var rowData = rowCurrent.data()[0];
                        var rowText = rowCurrent.classed('major') ? bodyData.key.toLowerCase() : rowData.key.toLowerCase();

                        if (rowText.search(searchTerm) >= 0) {

                            bodyCurrent.classed('search', true);
                            rowCurrent.classed('search', true);

                            //Highlight search text in selected table cell.
                            var currentText = rowCurrent.select('td.rowLabel').html();
                            var searchStart = currentText.toLowerCase().search(searchTerm);
                            var searchStop = searchStart + searchTerm.length;
                            var newText = currentText.slice(0, searchStart) + '<span class="search">' + currentText.slice(searchStart, searchStop) + '</span>' + currentText.slice(searchStop, currentText.length);
                            rowCurrent.select('td.rowLabel').html(newText);
                        }
                    });
                });

                //Disable the rate filter.
                d3.select('input.rateFilter').property('disabled', true);

                //Update the search label.
                var matchCount = canvas.selectAll('tr.search')[0].length;
                canvas.select('span.search-count').text(matchCount + ' matches');
                canvas.select('span.search-label').attr('class', matchCount === 0 ? 'search-label label label-warning' : 'search-label label label-success');

                //Check whether search term returned zero matches.
                if (matchCount === 0) {
                    //Restore the table.
                    canvas.selectAll('div.SummaryTable').classed('search', false);
                    canvas.selectAll('div.SummaryTable table tbody').classed('search', false);
                    canvas.selectAll('div.SummaryTable table tbody tr').classed('search', false);

                    //Reset the filters and row toggle.
                    table.AETable.toggleRows(canvas);
                }
            } else table.controls.search.clear(table, canvas);
        });

        canvas.select('span.clear-search').on('click', function () {
            table.controls.search.clear(table, canvas);
        });
    }

    var eventListeners = { rateFilter: rateFilter,
        customFilters: customFilters,
        search: search$1 };

    /*------------------------------------------------------------------------------------------------\
      Clear the current table and draw a new one.
    \------------------------------------------------------------------------------------------------*/

    function redraw(table, canvas, data, vars, settings) {
        table.controls.search.clear(table, canvas);
        table.AETable.wipe(canvas);
        var filteredData = table.AETable.prepareData(canvas, data, vars, settings);
        table.AETable.init(table, canvas, filteredData, vars, settings);
        table.AETable.toggleRows(canvas);
    }

    /*------------------------------------------------------------------------------------------------\
      Clears the summary or detail table and all associated buttons.
    \------------------------------------------------------------------------------------------------*/

    function wipe(canvas) {
        canvas.select(".table-wrapper .SummaryTable table").remove();
        canvas.select(".table-wrapper .SummaryTable button").remove();
        canvas.select(".table-wrapper .DetailTable").remove();
        canvas.select(".table-wrapper .DetailTable").remove();
    }

    /*------------------------------------------------------------------------------------------------\
      Filter the raw data per the current filter and group selections.
    \------------------------------------------------------------------------------------------------*/

    function prepareData(canvas, data, vars, settings) {
        var noAEs = ['', 'na', 'n/a', 'no ae', 'no aes', 'none', 'unknown', 'none/unknown'];

        //Flag records which represent [vars.id] values without an adverse event.
        data.forEach(function (d) {
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
        var nestedData = d3.nest().key(function (d) {
            return d[vars.group];
        }).key(function (d) {
            return d[vars.id];
        }).entries(data);

        //Calculate number of [vars.id] and number of events.
        settings.groups.forEach(function (d) {
            //Filter nested data on [vars.group].
            var groupData = nestedData.filter(function (di) {
                return di.key === d.key;
            });

            //Calculate number of [vars.id].
            d.n = groupData.length > 0 ? groupData[0].values.length : d3.sum(nestedData.map(function (di) {
                return di.values.length;
            }));

            //Calculate number of events.
            d.nEvents = data.filter(function (di) {
                return di[vars.group] === d.key && di.flag === 0;
            }).length;
        });

        //Subset data on groups specified in settings.groups.
        var groupNames = settings.groups.map(function (d) {
            return d.key;
        });
        var sub = data.filter(function (d) {
            return groupNames.indexOf(d[vars['group']]) >= 0;
        });

        //Filter without bootstrap multiselect
        canvas.select('.custom-filters').selectAll('select').each(function (d) {
            d3.select(this).selectAll('option').each(function (di) {
                if (!d3.select(this).property('selected')) sub = sub.filter(function (dii) {
                    return dii[d.value_col] !== di;
                });
            });
        });

        return sub;
    }

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

    function annoteDetails(table, canvas, row, group) {
        //Add color for the selected group on all rows.
        var allPoints = canvas.selectAll('td.prevplot svg g.points').filter(function (e) {
            return e.key === group;
        });
        allPoints.select('circle').attr('fill', function (d) {
            return table.colorScale(d.key);
        }).attr('opacity', 1);

        var allVals = canvas.selectAll('td.values').filter(function (e) {
            return e.key === group;
        });
        allVals.style('color', function (d) {
            return table.colorScale(d.key);
        });

        var header = canvas.selectAll('th.values').filter(function (e) {
            return e.key === group;
        });
        header.style('color', function (d) {
            return table.colorScale(d.key);
        });

        //Add raw numbers for the current row.
        row.selectAll('td.values').filter(function (e) {
            return e.key === group;
        }).append('span.annote').classed('annote', true).text(function (d) {
            return ' (' + d['values'].n + '/' + d['values'].tot + ')';
        });
    }

    /*------------------------------------------------------------------------------------------------\
      Calculate differences between groups.
    \------------------------------------------------------------------------------------------------*/

    function calculateDifference(major, minor, group1, group2, n1, tot1, n2, tot2) {
        var zCrit = 1.96;
        var p1 = n1 / tot1;
        var p2 = n2 / tot2;
        var diff = p1 - p2;
        var se = Math.sqrt(p1 * (1 - p1) / tot1 + p2 * (1 - p2) / tot2);
        var lower = diff - 1.96 * se;
        var upper = diff + 1.96 * se;
        var sig = lower > 0 | upper < 0 ? 1 : 0;
        var summary = { 'major': major,
            'minor': minor,

            'group1': group1,
            'n1': n1,
            'tot1': tot1,
            'p1': p1,

            'group2': group2,
            'n2': n2,
            'tot2': tot2,
            'p2': p2,

            'diff': diff * 100,
            'lower': lower * 100,
            'upper': upper * 100,
            'sig': sig };

        return summary;
    }

    function addDifferences(data, groups) {
        var nGroups = groups.length;

        if (nGroups > 1) {
            data.forEach(function (major) {
                major.values.forEach(function (minor) {
                    minor.differences = [];

                    var groups = minor.values;
                    var otherGroups = [].concat(minor.values);

                    groups.forEach(function (group) {
                        delete otherGroups[otherGroups.map(function (m) {
                            return m.key;
                        }).indexOf(group.key)];
                        otherGroups.forEach(function (otherGroup) {
                            var diff = calculateDifference(major.key, minor.key, group.key, otherGroup.key, group.values.n, group.values.tot, otherGroup.values.n, otherGroup.values.tot);
                            minor.differences.push(diff);
                        });
                    });
                });
            });
        }

        return data;
    }

    /*------------------------------------------------------------------------------------------------\
      Calculate number of events, number of subjects, and adverse event rate by major, minor, and
      group.
    \------------------------------------------------------------------------------------------------*/

    function cross(data, groups, id, major, minor, group) {
        var groupNames = groups.map(function (d) {
            return d.key;
        });

        //Calculate [id] and event frequencies and rates by [major], [minor], and [group].
        var nestedData = d3.nest().key(function (d) {
            return major == 'All' ? 'All' : d[major];
        }).key(function (d) {
            return minor == 'All' ? 'All' : d[minor];
        }).key(function (d) {
            return d[group];
        }).rollup(function (d) {
            var selection = {};

            //Category
            selection.major = major === 'All' ? 'All' : d[0][major];
            selection.minor = minor === 'All' ? 'All' : d[0][minor];
            selection.label = selection.minor === 'All' ? selection.major : selection.minor;
            selection.group = d[0][group];

            //Numerator
            var ids = d3.nest().key(function (di) {
                return di[id];
            }).entries(d);
            selection.n = ids.length;
            selection.nEvents = d.length;

            //Denominator
            var currentGroup = groups.filter(function (di) {
                return di.key === d[0][group];
            });
            selection.tot = currentGroup[0].n;
            selection.totEvents = currentGroup[0].nEvents;

            //Rate
            selection.per = Math.round(selection.n / selection.tot * 1000) / 10;
            selection.perEvents = Math.round(selection.nEvents / selection.totEvents * 1000) / 10;

            return selection;
        }).entries(data);

        //Generate data objects for major*minor*group combinations absent in data.
        nestedData.forEach(function (dMajor) {
            dMajor.values.forEach(function (dMinor) {
                var currentGroupList = dMinor.values.map(function (d) {
                    return d.key;
                });

                groupNames.forEach(function (dGroup, groupIndex) {
                    if (currentGroupList.indexOf(dGroup) === -1) {
                        var currentGroup = groups.filter(function (d) {
                            return d.key === dGroup;
                        });
                        var tot = currentGroup[0].n;
                        var totEvents = currentGroup[0].nEvents;
                        var shellMajorMinorGroup = { key: dGroup,
                            values: { major: dMajor.key,
                                minor: dMinor.key,
                                label: dMinor.key === 'All' ? dMajor.key : dMinor.key,
                                group: dGroup,

                                n: 0,
                                nEvents: 0,

                                tot: tot,
                                totEvents: totEvents,

                                per: 0,
                                perEvents: 0 } };

                        dMinor.values.push(shellMajorMinorGroup);
                    }
                });

                dMinor.values.sort(function (a, b) {
                    return groups.map(function (group) {
                        return group.key;
                    }).indexOf(a.key) - groups.map(function (group) {
                        return group.key;
                    }).indexOf(b.key);
                });
            });
        });

        return nestedData;
    }

    /*------------------------------------------------------------------------------------------------\
      Define sorting algorithms.
    \------------------------------------------------------------------------------------------------*/

    var sort = {
        //Sort by descending frequency.
        maxPer: function maxPer(a, b) {
            var max_a = a.values.map(function (minor) {
                return d3.max(minor.values.map(function (groups) {
                    return groups.values.per;
                }));
            })[0];
            var max_b = b.values.map(function (minor) {
                return d3.max(minor.values.map(function (groups) {
                    return groups.values.per;
                }));
            })[0];

            return max_a < max_b ? 1 : max_a > max_b ? -1 : 0;
        }
    };

    var util = { calculateDifference: calculateDifference,
        addDifferences: addDifferences,
        cross: cross,
        sort: sort };

    /*------------------------------------------------------------------------------------------------\
      Collapse data for export to .csv.
    \------------------------------------------------------------------------------------------------*/

    function collapse(nested) {
        //Collapse nested object.
        var collapsed = nested.map(function (soc) {
            var allRows = soc.values.map(function (e) {
                var eCollapsed = {};
                eCollapsed.majorCategory = '"' + e.values[0].values.major + '"';
                eCollapsed.minorCategory = '"' + e.values[0].values.minor + '"';

                e.values.forEach(function (val, i) {
                    var n = i + 1;
                    eCollapsed['val' + n + '_label'] = val.key;
                    eCollapsed['val' + n + '_numerator'] = val.values.n;
                    eCollapsed['val' + n + '_denominator'] = val.values.tot;
                    eCollapsed['val' + n + '_percent'] = val.values.per;
                });

                if (e.differences) {
                    e.differences.forEach(function (diff, i) {
                        var n = i + 1;
                        eCollapsed['diff' + n + '_label'] = diff.group1 + '-' + diff.group2;
                        eCollapsed['diff' + n + '_val'] = diff['diff'];
                        eCollapsed['diff' + n + '_sig'] = diff['sig'];
                    });
                }
                return eCollapsed;
            });
            return allRows;
        });
        return d3.merge(collapsed);
    }

    /*------------------------------------------------------------------------------------------------\
      Convert JSON data to comma separated values. Function found at
      http://stackoverflow.com/questions/4130849/convert-json-format-to-csv-format-for-ms-excel.
    \------------------------------------------------------------------------------------------------*/

    function json2csv(objArray) {
        var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
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

        return CSV;
    }

    function init$5(table, canvas, data, vars, settings) {

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
            var controlCell = d3.select(this).append('td').attr('class', 'controls');

            if (d.key === 'All') {
                controlCell.append('span').attr('title', 'Expand').text('+');
            }

            //Append row label.
            var category = d3.select(this).append('td').attr({ 'class': 'rowLabel',
                'title': 'Show listing' });
            category.append('a').text(function (rowValues) {
                return rowValues.values[0].values['label'];
            });

            //Calculate total frequency, number of records, population denominator, and rate.
            if (settings.defaults.totalCol === 'Show') {
                var total = {};
                total.major = d.values[0].values.major;
                total.minor = d.values[0].values.minor;
                total.label = d.values[0].values.label;
                total.group = 'Total';

                total.n = d3.sum(d.values, function (di) {
                    return di.values.n;
                });
                total.nEvents = d3.sum(d.values, function (di) {
                    return di.values.nEvents;
                });

                total.tot = d3.sum(d.values, function (di) {
                    return di.values.tot;
                });
                total.totEvents = d3.sum(d.values, function (di) {
                    return di.values.totEvents;
                });

                total.per = total.n / total.tot * 100;
                total.perEvents = total.nEvents / total.totEvents * 100;

                d.values[d.values.length] = { key: 'Total',
                    values: total };
            }

            //Append textual rates.
            var values = d3.select(this).selectAll('td.values').data(d.values, function (d) {
                return d.key;
            }).enter().append('td').attr('class', 'values').attr('title', function (d) {
                return d.values.n + '/' + d.values.tot;
            }).text(function (d) {
                return d3.format('0.1f')(d['values'].per) + '%';
            }).style('color', function (d) {
                return table.colorScale(d.key);
            });

            //Append graphical rates.
            var prevalencePlot = d3.select(this).append('td').classed('prevplot', true).append('svg').attr('height', h).attr('width', w + 10).append('svg:g').attr('transform', 'translate(5,0)');

            var points = prevalencePlot.selectAll('g.points').data(d.values).enter().append('g').attr('class', 'points');
            points.append('svg:circle').attr('cx', function (d) {
                return percentScale(d.values['per']);
            }).attr('cy', h / 2).attr('r', r - 2).attr('fill', function (d) {
                return table.colorScale(d.values['group']);
            }).append('title').text(function (d) {
                return d.key + ': ' + d3.format(',.1%')(d.values.per / 100);
            });

            //Handle rate differences between groups if settings reference more then one group.
            if (settings.groups.length > 1 && settings.defaults.diffCol === 'Show') {

                //Append container for group rate differences.
                var differencePlot = d3.select(this).append('td').classed('diffplot', true).append('svg').attr('height', h).attr('width', w + 10).append('svg:g').attr('transform', 'translate(5,0)');

                var diffPoints = differencePlot.selectAll('g').data(d.differences).enter().append('svg:g');
                diffPoints.append('title').text(function (d) {
                    return d.group1 + ' (' + d3.format(',.1%')(d.p1) + ') vs. ' + d.group2 + ' (' + d3.format(',.1%')(d.p2) + '): ' + d3.format(',.1%')(d.diff / 100);
                });

                //Append graphical rate difference confidence intervals.
                diffPoints.append('svg:line').attr('x1', function (d) {
                    return diffScale(d.upper);
                }).attr('x2', function (d) {
                    return diffScale(d.lower);
                }).attr('y1', h / 2).attr('y2', h / 2).attr('class', 'ci').classed('hidden', settings.groups.length > 2).attr('stroke', '#bbb');

                //Append graphical rate differences.
                var triangle = d3.svg.line().x(function (d) {
                    return d.x;
                }).y(function (d) {
                    return d.y;
                }).interpolate('linear-closed');

                diffPoints.append('svg:path').attr('d', function (d) {
                    var leftpoints = [{ x: diffScale(d.diff), y: h / 2 + r } //bottom
                    , { x: diffScale(d.diff) - r, y: h / 2 } //middle-left
                    , { x: diffScale(d.diff), y: h / 2 - r } //top
                    ];
                    return triangle(leftpoints);
                }).attr('class', 'diamond').attr('fill-opacity', function (d) {
                    return d.sig === 1 ? 1 : 0.1;
                }).attr('fill', function (d) {
                    return d.diff < 0 ? table.colorScale(d.group1) : table.colorScale(d.group2);
                }).attr('stroke', function (d) {
                    return d.diff < 0 ? table.colorScale(d.group1) : table.colorScale(d.group2);
                }).attr('stroke-opacity', 0.3);

                diffPoints.append('svg:path').attr('d', function (d) {
                    var rightpoints = [{ x: diffScale(d.diff), y: h / 2 + r } //bottom
                    , { x: diffScale(d.diff) + r, y: h / 2 } //middle-right
                    , { x: diffScale(d.diff), y: h / 2 - r } //top
                    ];
                    return triangle(rightpoints);
                }).attr('class', 'diamond').attr('fill-opacity', function (d) {
                    return d.sig === 1 ? 1 : 0.1;
                }).attr('fill', function (d) {
                    return d.diff < 0 ? table.colorScale(d.group2) : table.colorScale(d.group1);
                }).attr('stroke', function (d) {
                    return d.diff < 0 ? table.colorScale(d.group2) : table.colorScale(d.group1);
                }).attr('stroke-opacity', 0.3);
            }
        }

        //Create a dataset nested by [ settings.variables.group ] and [ settings.variables.id ].
        var sub = data.filter(function (e) {
            return e.flag === 0;
        });
        var dataAny = util.cross(sub, settings.groups, vars['id'], 'All', 'All', vars['group'], settings.groups);
        //Create a dataset nested by [ settings.variables.major ], [ settings.variables.group ], and
        //[ settings.variables.id ].
        var dataMajor = util.cross(data, settings.groups, vars['id'], vars['major'], 'All', vars['group'], settings.groups);
        //Create a dataset nested by [ settings.variables.major ], [ settings.variables.minor ],
        //[ settings.variables.group ], and [ settings.variables.id ].
        var dataMinor = util.cross(data, settings.groups, vars['id'], vars['major'], vars['minor'], vars['group'], settings.groups);

        //Add a 'differences' object to each row.
        dataMajor = util.addDifferences(dataMajor, settings.groups);
        dataMinor = util.addDifferences(dataMinor, settings.groups);
        dataAny = util.addDifferences(dataAny, settings.groups);

        //Sort the data based by maximum prevelence.
        dataMajor = dataMajor.sort(util.sort.maxPer);
        dataMinor.forEach(function (major) {
            major.values.sort(function (a, b) {
                var max_a = d3.max(a.values.map(function (groups) {
                    return groups.values.per;
                }));
                var max_b = d3.max(b.values.map(function (groups) {
                    return groups.values.per;
                }));

                return max_a < max_b ? 1 : -1;
            });
        });

        //Output the data if the validation setting is flagged.
        if (settings.validation && d3.select('#downloadCSV')[0][0] === null) {

            var majorValidation = collapse(dataMajor);
            var minorValidation = collapse(dataMinor);

            var fullValidation = d3.merge([majorValidation, minorValidation]).sort(function (a, b) {
                return a.minorCategory < b.minorCategory ? -1 : 1;
            }).sort(function (a, b) {
                return a.majorCategory < b.majorCategory ? -1 : 1;
            });

            var CSV = json2csv(fullValidation);

            canvas.append('a').attr({ 'href': 'data:text/csv;charset=utf-8,' + escape(CSV),
                'download': true,
                'id': 'downloadCSV' }).text('Download Summarized Data');
        }

        //Draw the summary table headers.
        var totalCol = settings.defaults.totalCol === 'Show';
        var tab = canvas.select('.SummaryTable').append('table');
        var nGroups = settings.groups.length + totalCol;
        var header1 = tab.append('thead').append('tr');

        //Expand/collapse control column header
        header1.append('th').attr('rowspan', 2);

        //Category column header
        header1.append('th').attr('rowspan', 2).text('Category');

        //Group column headers
        header1.append('th').attr('colspan', nGroups - totalCol).text('Groups');

        //Total column header
        if (totalCol) header1.append('th').text('');

        //Graphical AE rates column header
        header1.append('th').text('AE Rate by group');

        //Group differences column header
        var header2 = tab.select('thead').append('tr');
        header2.selectAll('td.values').data(totalCol ? settings.groups.concat({ key: 'Total',
            n: d3.sum(settings.groups, function (d) {
                return d.n;
            }) }) : settings.groups).enter().append('th').html(function (d) {
            return '<span>' + d.key + '</span>' + '<br><span id="group-num">(n=' + d.n + ')</span>';
        }).style('color', function (d) {
            return table.colorScale(d.key);
        }).attr('class', 'values');
        header2.append('th').attr('class', 'prevHeader');
        if (nGroups > 1 && settings.defaults.diffCol === 'Show') {
            header1.append('th').text('Difference Between Groups').attr('class', 'diffplot');
            header2.append('th').attr('class', 'diffplot axis');
        }

        //Plot size
        var h = 15,
            w = 200,
            margin = { left: 40, right: 40 },
            diffMargin = { left: 5, right: 5 },
            r = 7;

        //Prevalence scales
        var allPercents = d3.merge(dataMajor.map(function (major) {
            return d3.merge(major.values.map(function (minor) {
                return d3.merge(minor.values.map(function (group) {
                    return [group.values.per];
                }));
            }));
        }));

        var percentScale = d3.scale.linear().range([0, w]).domain([0, d3.max(allPercents)]);

        //Add Prevalence Axis
        var percentAxis = d3.svg.axis().scale(percentScale).orient('top').ticks(6);

        var prevAxis = canvas.select('th.prevHeader').append('svg').attr('height', '34px').attr('width', w + 10).append('svg:g').attr('transform', 'translate(5,34)').attr('class', 'axis percent').call(percentAxis);

        //Difference Scale
        if (settings.groups.length > 1) {
            //Difference Scale
            var allDiffs = d3.merge(dataMajor.map(function (major) {
                return d3.merge(major.values.map(function (minor) {
                    return d3.merge(minor.differences.map(function (diff) {
                        return [diff.upper, diff.lower];
                    }));
                }));
            }));

            var minorDiffs = d3.merge(dataMinor.map(function (m) {
                return d3.merge(m.values.map(function (m2) {
                    return d3.merge(m2.differences.map(function (m3) {
                        return d3.merge([[m3.upper], [m3.lower]]);
                    }));
                }));
            }));

            var diffScale = d3.scale.linear().range([diffMargin.left, w - diffMargin.right]).domain(d3.extent(d3.merge([minorDiffs, allDiffs])));

            //Difference Axis
            var diffAxis = d3.svg.axis().scale(diffScale).orient('top').ticks(8);

            var prevAxis = canvas.select('th.diffplot.axis').append('svg').attr('height', '34px').attr('width', w + 10).append('svg:g').attr('transform', 'translate(5,34)').attr('class', 'axis').attr('class', 'percent').call(diffAxis);
        }

        ////////////////////////////
        // Add Rows to the table //
        ////////////////////////////
        if (!dataMajor.length) {
            if (canvas.select('.missing-data-alert').empty()) {
                canvas.select('.SummaryTable').insert('div', 'table').attr('class', 'alert alert-error alert-danger missing-data-alert').text('No data found in the column specified for major category.');
                throw new Error('No data found in the column specified for major category.');
            }
        }

        //Append a group of rows (<tbody>) for each major category.
        var majorGroups = tab.selectAll('tbody').data(dataMajor, function (d) {
            return d.key;
        }).enter().append('tbody').attr('class', 'minorHidden').attr('class', function (d) {
            return 'major-' + d.key.replace(/[^A-Za-z0-9]/g, '');
        });

        //Append a row summarizing all minor categories for each major category.
        var majorRows = majorGroups.selectAll('tr').data(function (d) {
            return d.values;
        }, function (datum) {
            return datum.key;
        }).enter().append('tr').attr('class', 'major').each(fillRow);

        //Append rows for each minor category.
        var majorGroups = tab.selectAll('tbody').data(dataMinor, function (d) {
            return d.key;
        });

        var minorRows = majorGroups.selectAll('tr').data(function (d) {
            return d.values;
        }, function (datum) {
            return datum.key;
        }).enter().append('tr').attr('class', 'minor').each(fillRow);

        //Add a footer for overall rates.
        tab.append('tfoot').selectAll('tr').data(dataAny.length > 0 ? dataAny[0].values : []).enter().append('tr').each(fillRow);

        //Remove unwanted elements from the footer.
        tab.selectAll('tfoot svg').remove();
        tab.select('tfoot i').remove();
        tab.select('tfoot td.controls span').text('');

        //Hide the rows covering missing data (we could convert this to an option later)
        tab.selectAll('tbody').filter(function (e) {
            return e.key === 'None/Unknown';
        }).classed('hidden', true);

        ////////////////////////////////////////////////
        // Mouseover/Mouseout for header columns values
        ////////////////////////////////////////////////
        canvas.selectAll('.summaryTable th.values').on('mouseover', function (d) {
            //change colors for points and values to gray
            canvas.selectAll('td.prevplot svg g.points circle').attr('fill', '#555').attr('opacity', 0.1);
            canvas.selectAll('.values').style('color', '#ccc');

            //highlight the selected group
            annoteDetails(table, canvas, canvas.selectAll('.SummaryTable tr'), d.key, 'right');
        }).on('mouseout', function (d) {
            //Clear annotations
            canvas.selectAll('td.prevplot svg g.points circle').attr('fill', function (d) {
                return table.colorScale(d.key);
            }).attr('opacity', 1);
            canvas.selectAll('.values').style('color', function (d) {
                return table.colorScale(d.key);
            });
            canvas.selectAll('.annote').remove();
        });

        ///////////////////////////////////////////////
        // Mouseover/Mouseout for difference diamonds
        ///////////////////////////////////////////////
        canvas.selectAll('td.diffplot svg g path.diamond').on('mouseover', function (d) {
            var currentRow = canvas.selectAll('.SummaryTable tbody tr').filter(function (e) {
                return e.values[0].values.major === d.major && e.values[0].values.minor === d.minor;
            });

            var sameGroups = canvas.selectAll('td.diffplot svg g').filter(function (e) {
                return e.group1 === d.group1 && e.group2 === d.group2;
            });

            //Display CI;
            d3.select(this.parentNode).select('.ci').classed('hidden', false);

            //Highlight text/points of selected groups.
            annoteDetails(table, canvas, currentRow, d.group1, d.n1 / d.tot1 > d.n2 / d.tot2 ? 'right' : 'left');
            annoteDetails(table, canvas, currentRow, d.group2, d.n1 / d.tot1 > d.n2 / d.tot2 ? 'left' : 'right');
        }).on('mouseout', function (d) {
            canvas.selectAll('td.diffplot svg g').selectAll('path').attr('fill-opacity', function (d) {
                return d.sig === 1 ? 1 : 0.1;
            }).attr('stroke-opacity', 0.3);

            d3.select(this.parentNode).select('.ci').classed('hidden', true);

            //Restore the percentage colors.
            canvas.selectAll('td.prevplot svg g.points circle').attr('fill', function (d) {
                return table.colorScale(d.key);
            }).attr('opacity', 1);
            canvas.selectAll('.values').style('color', function (d) {
                return table.colorScale(d.key);
            });
            //Delete annotations.
            canvas.selectAll('.annote').remove();
        });

        //////////////////////////////////
        // Click Control for table rows //
        //////////////////////////////////
        canvas.selectAll('.SummaryTable tr').on('mouseover', function (d) {
            d3.select(this).select('td.rowLabel').classed('highlight', true);
        }).on('mouseout', function (d) {
            d3.select(this).select('td.rowLabel').classed('highlight', false);
        });

        //Expand/collapse a section
        canvas.selectAll('tr.major').selectAll('td.controls').on('click', function (d) {
            var current = d3.select(this.parentNode.parentNode);
            var toggle = !current.classed('minorHidden');
            current.classed('minorHidden', toggle);

            d3.select(this).select('span').attr('title', toggle ? 'Expand' : 'Collapse').text(function () {
                return toggle ? '+' : '-';
            });
        });

        ///////////////////////////
        // Show the details table
        ///////////////////////////
        canvas.selectAll('td.rowLabel').on('click', function (d) {
            //Update classes (row visibility handeled via css)
            var toggle = !canvas.select('.SummaryTable table').classed('summary');
            canvas.select('.SummaryTable table').classed('summary', toggle);
            canvas.select('div.controls').classed('hidden', toggle);

            //Create/remove the participant level table       
            if (toggle) {
                var major = d.values[0].values['major'];
                var minor = d.values[0].values['minor'];
                table.detailTable(canvas, data, vars, { detailTable: { 'major': major,
                        'minor': minor } });
            } else {
                canvas.select('.DetailTable').remove();
                canvas.select('div.closeDetailTable').remove();
            }
        });
    }

    function eventListeners$1(data, vars, settings) {}

    /*------------------------------------------------------------------------------------------------\
      Apply basic filters and toggles.
    \------------------------------------------------------------------------------------------------*/

    function toggleRows(canvas) {
        //Toggle minor rows.
        var minorToggle = settings.defaults.prefTerms !== 'Show';
        canvas.selectAll('.SummaryTable tbody').classed('minorHidden', minorToggle);
        canvas.selectAll('.SummaryTable table tbody').select('tr.major td.controls span').text(minorToggle ? '+' : '-');

        //Toggle Difference plots
        var differenceToggle = false;
        canvas.selectAll('.SummaryTable .diffplot').classed('hidden', differenceToggle);

        //Filter based on prevalence.
        var filterVal = canvas.select('div.controls input.rateFilter').property('value');
        canvas.selectAll('div.SummaryTable table tbody').each(function (d) {
            var allRows = d3.select(this).selectAll('tr');
            var filterRows = allRows.filter(function (d) {
                var percents = d.values.map(function (element) {
                    return element.values.per;
                });
                var maxPercent = d3.max(percents);

                return maxPercent < filterVal;
            });
            filterRows.classed('filter', 'true');

            d3.select(this).select('tr.major td.controls span').classed('hidden', filterRows[0].length + 1 >= allRows[0].length);
        });
    }

    var AETable = { redraw: redraw,
        wipe: wipe,
        prepareData: prepareData,
        init: init$5,
        eventListeners: eventListeners$1,
        toggleRows: toggleRows };

    /*------------------------------------------------------------------------------------------------\
      Generate data listing.
    \------------------------------------------------------------------------------------------------*/

    function detailTable(canvas, data, vars, settings) {
        var major = settings.detailTable.major;
        var minor = settings.detailTable.minor;

        //Filter the raw data given the select major and/or minor category.
        var details = data.filter(function (d) {
            var majorMatch = major === 'All' ? true : major === d[vars['major']];
            var minorMatch = minor === 'All' ? true : minor === d[vars['minor']];
            return majorMatch && minorMatch && d[vars['major']] !== 'None/Unknown';
        });

        if (vars.details.length === 0) vars.details = Object.keys(data[0]).filter(function (d) {
            return ['data_all', 'flag'].indexOf(d) === -1;
        });

        //Keep only those columns specified in settings.variables.details.
        var detailVars = vars.details;
        var details = details.map(function (d) {
            var current = {};
            detailVars.forEach(function (currentVar) {
                return current[currentVar] = d[currentVar];
            });
            return current;
        });

        canvas.select('div.table-wrapper').append('div').attr('class', 'DetailTable');

        //Add button to return to standard view.
        var closeButton = canvas.select('div.DetailTable').append('button').attr('class', 'closeDetailTable btn btn-primary');

        closeButton.html('<i class="icon-backward icon-white fa fa-backward"></i>    Return to the Summary View');

        closeButton.on('click', function () {
            canvas.select('.SummaryTable table').classed('summary', false);
            canvas.select('div.controls').classed('hidden', false);
            canvas.selectAll('.SummaryTable table tbody tr').classed('active', false);
            canvas.select('.DetailTable').remove();
            canvas.select('button.closeDetailTable').remove();
        });

        //Add explanatory listing title.
        canvas.select('.DetailTable').append('h4').html(minor === 'All' ? 'Details for ' + details.length + ' <b>' + major + '</b> records' : 'Details for ' + details.length + ' <b>' + minor + ' (' + major + ')</b> records');

        //Generate listing.
        function basicTable(element, predata) {
            var canvas = d3.select(element);
            var wrapper = canvas.append('div').attr('class', 'ig-basicTable');

            function transform(data) {
                var colList = d3.keys(data[0]);

                var subCols = data.map(function (d) {
                    var current = {};
                    colList.forEach(function (colName) {
                        return current[colName] = d[colName];
                    });

                    return current;
                });

                var rowStart = 0;
                var rowCount = data.length;
                var subRows = subCols.slice(rowStart, rowStart + rowCount);

                return subRows;
            };

            var sub = transform(predata);
            draw(canvas, sub);

            function draw(canvas, data) {
                //Generate listing container.
                var listing = canvas.select('div.ig-basicTable').insert('table', 'button').attr('class', 'table').datum(settings);

                //Append header to listing container.
                var headerRow = listing.append('thead').append('tr');
                headerRow.selectAll('th').data(d3.keys(data[0])).enter().append('th').html(function (d) {
                    return d;
                });

                //Add rows to listing container.
                var tbody = listing.append('tbody');
                var rows = tbody.selectAll('tr').data(data).enter().append('tr');

                //Add data cells to rows.
                var cols = rows.selectAll('tr').data(function (d) {
                    return d3.values(d);
                }).enter().append('td').html(function (d) {
                    return d;
                });
            };
        }
        basicTable('.DetailTable', details);
    }

    function index() {
        var element = arguments.length <= 0 || arguments[0] === undefined ? 'body' : arguments[0];
        var config = arguments.length <= 1 || arguments[1] === undefined ? defaultSettings : arguments[1];

        var aeTable = { element: element,
            config: config,
            init: init,
            colorScale: colorScale,
            layout: layout,
            controls: controls,
            eventListeners: eventListeners,
            AETable: AETable,
            detailTable: detailTable,
            util: util };

        return aeTable;
    }

    return index;
})();

