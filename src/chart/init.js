/*------------------------------------------------------------------------------------------------\
  Initialize adverse event explorer.
\------------------------------------------------------------------------------------------------*/

export function init(data) {
    var settings = this.config;

    //create chart wrapper in specified div
    this.wrap = d3.select(this.element).append('div');
    this.wrap.attr("class","aeExplorer")

    //save raw data
    this.raw_data = data; 

    //settings and defaults
    this.util.setDefaults(this)
    this.layout();

    //Flag placeholder rows in raw data save a separate event-only data set
    var placeholderValues = this.config.defaults.placeholderFlag.values
    var placeholderCol = this.config.defaults.placeholderFlag.value_col
    this.raw_data.forEach(d => d.placeholderFlag = placeholderValues.indexOf(d[placeholderCol])> -1)
    this.raw_event_data = data.filter(d => !d.placeholderFlag)
    console.log(this)
    //draw controls and initial chart
    this.controls.init(this);
    this.AETable.redraw(this)
}
