/*------------------------------------------------------------------------------------------------\
  Generate data listing.
\------------------------------------------------------------------------------------------------*/

export function detailTable(canvas, data, vars, settings) {
    var major = settings.detailTable.major;
    var minor = settings.detailTable.minor;

  //Filter the raw data given the select major and/or minor category.
    var details = data.filter(function(e) {
        var majorMatch = major === 'All' ? true : (major === e[vars['major']]);
        var minorMatch = minor === 'All' ? true : (minor === e[vars['minor']]);
        return majorMatch && minorMatch;
    });

    if (vars.details.length === 0) {
        vars.details = Object.keys(data[0])
            .filter(function(d) {
                return ['data_all', 'flag'].indexOf(d) === -1; });
    }

  //Keep only those columns specified in settings.variables.details.
    var detailVars = vars.details;
    var details = details.map(function(e) {
        var current = {};
        detailVars.forEach(function(currentVar) {
            current[currentVar] = e[currentVar]
        })
        return current;
    });

    canvas.select('div.table-wrapper')
        .append('div')
        .attr('class', 'DetailTable');
    
  //Add button to return to standard view.
    var closeButton = canvas.select('div.DetailTable')
        .append('button')
        .attr('class', 'closeDetailTable btn btn-primary');

    closeButton
        .html('<i class="icon-backward icon-white fa fa-backward"></i>    Return to the Summary View');
    
    closeButton.on('click',function() {
        canvas.select('.SummaryTable table')
            .classed('summary', false);
        canvas.select('div.controls')
            .classed('hidden', false);
        canvas.selectAll('.SummaryTable table tbody tr')
            .classed('active', false);
        canvas.select('.DetailTable').remove();
        canvas.select('button.closeDetailTable').remove();
    });

  //Add explanatory listing title.
    canvas.select('.DetailTable')
        .append('h4')
        .html(minor === 'All' ?
            'Details for ' + details.length + ' <b>' + major + '</b> records' :
            'Details for ' + details.length + ' <b>' + minor + ' (' + major + ')</b> records' );

  //Generate listing.
    function basicTable(element, predata) {
        var canvas = d3.select(element)
        var wrapper = canvas
            .append('div')
            .attr('class', 'ig-basicTable')

        function transform(data) {
            var colList = d3.keys(data[0]);

            var subCols = data.map(function(e) {
                var current = {};
                colList.forEach(function(colName) {
                    current[colName] = e[colName];
                });
                return current;
            }) ;

            var rowStart = 0;
            var rowCount = data.length;
            var subRows = subCols.slice(rowStart, rowStart + rowCount);

            return subRows;
        };

        var sub = transform(predata);
        draw(canvas, sub);

        function draw(canvas, data) {
          //Generate listing container.
            var listing = canvas.select('div.ig-basicTable')
                .insert('table', 'button')
                .attr('class', 'table')
                .datum(settings);

          //Append header to listing container.
            var headerRow = listing
                .append('thead')
                    .append('tr');
            headerRow.selectAll('th')
                .data(d3.keys(data[0]))
                .enter()
                .append('th')
                .html(function(d) {
                    return d; });

          //Add rows to listing container.
            var tbody = listing
                .append('tbody');
            var rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

          //Add data cells to rows.
            var cols = rows.selectAll('tr')
                .data(function(d) {
                    return d3.values(d); })
                .enter()
                .append('td')
                .html(function(d) {
                    return d; });
        };
    }
    basicTable('.DetailTable', details);
}
