/*------------------------------------------------------------------------------------------------\
  Generate data listing.
\------------------------------------------------------------------------------------------------*/
export function init(chart, detailTableSettings) {
    //convenience mappings
    var major = detailTableSettings.major;
    var minor = detailTableSettings.minor;
    var vars = chart.config.variables;

    //Filter the raw data given the select major and/or minor category.
    var details = chart.population_event_data.filter(d => {
        var majorMatch = major === 'All' ? true : major === d[vars['major']];
        var minorMatch = minor === 'All' ? true : minor === d[vars['minor']];
        return majorMatch && minorMatch;
    });

    if (vars.details.length === 0)
        vars.details = Object.keys(chart.population_data[0]).filter(
            d => ['data_all', 'placeholderFlag'].indexOf(d) === -1
        );

    //Keep only those columns specified in settings.variables.details.
    var detailVars = vars.details;
    var details = details.map(d => {
        var current = {};
        detailVars.forEach(currentVar => (current[currentVar] = d[currentVar]));
        return current;
    });

    chart.detailTable.wrap = chart.wrap
        .select('div.table-wrapper')
        .append('div')
        .attr('class', 'DetailTable');

    chart.detailTable.head = chart.wrap
        .select('div.table-wrapper')
        .insert('div', '.controls')
        .attr('class', 'DetailHeader');

    //Add button to return to standard view.
    var closeButton = chart.detailTable.head
        .append('button')
        .attr('class', 'closeDetailTable btn btn-primary');

    closeButton.html(
        '<i class="icon-backward icon-white fa fa-backward"></i>    Return to the Summary View'
    );

    closeButton.on('click', () => {
        chart.wrap.select('.SummaryTable table').classed('summary', false);
        chart.wrap.select('div.controls').selectAll('div').classed('wc-hidden', false);
        chart.wrap
            .select('div.controls')
            .select('div.custom-filters')
            .selectAll('select')
            .property('disabled', '');
        chart.wrap.selectAll('.SummaryTable table tbody tr').classed('wc-active', false);
        chart.detailTable.wrap.remove();
        chart.detailTable.head.remove();
    });

    //Add explanatory listing title.
    chart.detailTable.head
        .append('h4')
        .html(
            minor === 'All'
                ? 'Details for ' + details.length + ' <b>' + major + '</b> records'
                : 'Details for ' + details.length + ' <b>' + minor + ' (' + major + ')</b> records'
        );

    //Details about current population filters
    var filtered = chart.raw_event_data.length != chart.population_event_data.length;
    if (filtered) {
        chart.wrap
            .select('div.controls')
            .select('div.custom-filters')
            .classed('wc-hidden', false)
            .selectAll('select')
            .property('disabled', 'disabled');
        chart.detailTable.head
            .append('span')
            .html(filtered ? 'The listing is filtered as shown:' : '');
    }

    //Generate listing.
    chart.detailTable.draw(chart.detailTable.wrap, details);
}
