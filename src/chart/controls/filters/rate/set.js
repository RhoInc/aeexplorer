/*------------------------------------------------------------------------------------------------\
  Set rate filter default.
\------------------------------------------------------------------------------------------------*/

export function set(chart) {
    chart.controls.wrap.select('input.rateFilter')
        .property('value', 
        	chart.config.defaults.maxPrevalence ?  
        	 	chart.config.defaults.maxPrevalence : 
        	 	0
        );
}
