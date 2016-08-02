/*------------------------------------------------------------------------------------------------\
  Set rate filter default.
\------------------------------------------------------------------------------------------------*/

export function set(canvas, settings) {
    if (settings.defaults !== undefined) {
        if (settings.defaults.maxPrevalence !== undefined) {
            canvas.select('div.controls input.rateFilter')
                .property('value', settings.defaults.maxPrevalence);
        }
    }
}
