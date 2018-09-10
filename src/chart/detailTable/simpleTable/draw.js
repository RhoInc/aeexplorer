export function draw(chart, data) {
    //Generate listing container.
    var canvas = chart.detailTable.wrap;
    var listing = canvas.append('table').attr('class', 'table');

    //Append header to listing container.
    var headerRow = listing.append('thead').append('tr');
    headerRow.selectAll('th').data(d3.keys(data[0])).enter().append('th').html(d => d);

    //Add rows to listing container.
    var tbody = listing.append('tbody');
    var rows = tbody.selectAll('tr').data(data).enter().append('tr');

    //Add data cells to rows.
    var cols = rows.selectAll('tr').data(d => d3.values(d)).enter().append('td').html(d => d);
}
