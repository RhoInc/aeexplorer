/*------------------------------------------------------------------------------------------------\
  Initialize adverse event explorer.
\------------------------------------------------------------------------------------------------*/

export function init(data) {
    //save raw data
    this.raw_data = data;
    this.util.setDefaults(this);

    //Flag placeholder rows in raw data save a separate event-only data set
    var placeholderCol = this.config.defaults.placeholderFlag.value_col;
    var placeholderValues = this.config.defaults.placeholderFlag.values;
    this.raw_data.forEach(
        d => (d.placeholderFlag = placeholderValues.indexOf(d[placeholderCol]) > -1)
    );
    this.raw_event_data = data.filter(d => !d.placeholderFlag);
    //draw controls and initial chart
    this.controls.init(this);
    this.AETable.redraw(this);
}
