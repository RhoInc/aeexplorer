export function init(chart, variable) {
    var selector = chart.controls.wrap.append('div').attr('class', 'variable-control variable');

    //Clear summary control.
    selector.selectAll('div.summaryDiv').remove();

    //Generate summary control.
    const labels = {
        major: 'Major Category Variable:',
        minor: 'Minor Category Variable:',
        group: 'Group Variable:',
        id: 'ID Variable:'
    };
    selector.append('span').attr('class', 'sectionHead').text(labels[variable]);

    var variableControl = selector.append('select');

    variableControl
        .selectAll('option')
        .data(chart.config.variableOptions[variable])
        .enter()
        .append('option')
        .text(d => d)
        .property('selected', function(d) {
            if ((variable == 'group') & !chart.config.defaults.groupCols) {
                return d == 'None';
            } else {
                return d === chart.config.variables[variable];
            }
        });

    //initialize event listener
    variableControl.on('change', function(d) {
        const current = this.value;
        if (current != 'None') chart.config.variables[variable] = current;

        //update config.groups if needed
        console.log(chart);
        if (variable == 'group') {
            if (current == 'None') {
                chart.config.defaults.diffCol = false;
                chart.config.defaults.groupCols = false;
                chart.config.defaults.totalCol = true;
            } else {
                chart.config.defaults.groupCols = true;
                chart.config.defaults.diffCol = true;
            }

            //update the groups setting
            var allGroups = d3
                .set(chart.raw_data.map(d => d[chart.config.variables.group]))
                .values();
            var groupsObject = allGroups.map(d => {
                return { key: d };
            });
            chart.config.groups = groupsObject.sort(
                (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
            );

            //update the color scale
            var levels = chart.config.groups.map(e => e.key);
            var colors = [
                '#377EB8',
                '#4DAF4A',
                '#984EA3',
                '#FF7F00',
                '#A65628',
                '#F781BF',
                '#E41A1C'
            ];
            if (chart.config.defaults.totalCol)
                //Set 'Total' column color to #777.
                colors[chart.config.groups.length] = '#777';

            chart.colorScale.range(colors).domain(levels);
        }

        //Check to see if there are too many levels in the new group variable
        if ((chart.config.groups.length > chart.config.defaults.maxGroups) & (current != 'None')) {
            chart.wrap
                .select('.aeTable')
                .select('.table-wrapper')
                .select('.SummaryTable')
                .style('display', 'none');
            var errorText =
                'Too Many Group Variables specified. You specified ' +
                chart.config.groups.length +
                ', but the maximum supported is ' +
                chart.config.defaults.maxGroups +
                '.';
            chart.wrap.selectAll('div.wc-alert').remove();
            chart.wrap.append('div').attr('class', 'wc-alert').text('Fatal Error: ' + errorText);
            throw new Error(errorText);
        } else {
            chart.wrap
                .select('.aeTable')
                .select('.table-wrapper')
                .select('.SummaryTable')
                .style('display', null);
            chart.wrap.selectAll('div.wc-alert').remove();
            chart.AETable.redraw(chart);
        }
    });
}
