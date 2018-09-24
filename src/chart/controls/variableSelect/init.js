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
        .property('selected', d => d === chart.config.variables[variable]);

    //initialize event listener
    variableControl.on('change', function(d) {
        const current = this.value;
        chart.config.variables[variable] = current;

        //update config.groups if needed
        if (variable == 'group') {
            var allGroups = d3
                .set(chart.raw_data.map(d => d[chart.config.variables.group]))
                .values();
            var groupsObject = allGroups.map(d => {
                return { key: d };
            });
            chart.config.groups = groupsObject.sort(
                (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
            );
        }

        chart.AETable.redraw(chart);
    });
}
