/*------------------------------------------------------------------------------------------------\
  Generate data listing.
\------------------------------------------------------------------------------------------------*/
export function init(chart,detailTableSettings) {

    //convenience mappings
    var major = detailTableSettings.major;
    var minor = detailTableSettings.minor;
    var vars = chart.config.variables 

  //Filter the raw data given the select major and/or minor category.
    var details = chart.raw_data.filter(d => {
        var majorMatch = major === 'All' ? true : (major === d[vars['major']]);
        var minorMatch = minor === 'All' ? true : (minor === d[vars['minor']]);
        return majorMatch && minorMatch && d[vars['major']] !== 'None/Unknown';
    });

    if (vars.details.length === 0)
        vars.details = Object.keys(chart.raw_data[0])
            .filter(d => ['data_all', 'flag'].indexOf(d) === -1);

  //Keep only those columns specified in settings.variables.details.
    var detailVars = vars.details;
    var details = details.map(d => {
        var current = {};
        detailVars.forEach(currentVar => current[currentVar] = d[currentVar]);
        return current;
    });

    chart.detailTable.wrap = chart.wrap.select('div.table-wrapper')
        .append('div')
        .attr('class', 'DetailTable');
    
  //Add button to return to standard view.
    var closeButton = chart.wrap.select('div.DetailTable')
        .append('button')
        .attr('class', 'closeDetailTable btn btn-primary');

    closeButton
        .html('<i class="icon-backward icon-white fa fa-backward"></i>    Return to the Summary View');
    
    closeButton.on('click', () => {
        chart.wrap.select('.SummaryTable table').classed('summary', false);
        chart.wrap.select('div.controls').classed('hidden', false);
        chart.wrap.selectAll('.SummaryTable table tbody tr').classed('active', false);
        chart.wrap.select('.DetailTable').remove();
        chart.wrap.select('button.closeDetailTable').remove();
    });

  //Add explanatory listing title.
    chart.wrap.select('.DetailTable')
        .append('h4')
        .html(minor === 'All' ?
            'Details for ' + details.length + ' <b>' + major + '</b> records' :
            'Details for ' + details.length + ' <b>' + minor + ' (' + major + ')</b> records' );
    
  //Generate listing.    
    chart.detailTable.draw(chart.detailTable.wrap, details);
 
}