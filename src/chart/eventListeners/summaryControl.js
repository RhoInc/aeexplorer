/*------------------------------------------------------------------------------------------------\
  Define summary control event listener.
\------------------------------------------------------------------------------------------------*/

export function summaryControl(table, canvas, data, vars, settings) {
    var summaryControls = canvas.selectAll('div.summaryDiv .summaryRadio');

    summaryControls
        .on('change', function (d) {
            summaryControls
                .each(function (di) {
                    d3.select(this.parentNode).style('font-weight', 'normal');
                    d3.select(this)[0][0].checked = false; });
            d3.select(this)[0][0].checked = true;
            d3.select(this.parentNode).style('font-weight', 'bold');
            var summary = d3.select(this.parentNode)[0][0].textContent;
            table.AETable.redraw(table, canvas, data, vars, settings, summary);
        });
}
