/*------------------------------------------------------------------------------------------------\
  Initialize adverse event explorer.
\------------------------------------------------------------------------------------------------*/

export function init(data) {
    var settings = this.config;

    //create chart wrapper in specified div
    this.wrap = d3.select(this.element).append('div');
    this.wrap.attr("class","aeExplorer")

    this.raw_data = data; 

  //Initialize adverse event eplorer.
    this.util.setDefaults(this)
    this.layout();
    this.controls.init(this);
    this.AETable.redraw(this)
}
