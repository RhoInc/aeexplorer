export function toggleControls(chart) {
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
}
