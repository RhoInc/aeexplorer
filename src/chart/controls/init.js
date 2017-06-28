/*------------------------------------------------------------------------------------------------\
  Initialize controls.
\------------------------------------------------------------------------------------------------*/

export function init(chart) {
    chart.controls.wrap = chart.wrap.select('div.controls');
    chart.controls.wrap.attr('onsubmit', 'return false;');
    chart.controls.wrap.selectAll('*').remove(); //Clear controls.

    //Draw UI components
    chart.controls.filters.rate.init(chart);
    chart.controls.summaryControl.init(chart);
    chart.controls.search.init(chart);
    chart.controls.filters.custom.init(chart);

    //Initialize the filter rate.
    chart.controls.filters.rate.set(chart);

    //assign filterDiv class to all filter wrappers
    chart.controls.wrap.selectAll('div').classed('filterDiv', true);
}
