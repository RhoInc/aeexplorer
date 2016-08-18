/*------------------------------------------------------------------------------------------------\
  Set rate filter default.
\------------------------------------------------------------------------------------------------*/

export function set(canvas, settings) {
    canvas.select('div.controls input.rateFilter')
        .property('value', settings.defaults.maxPrevalence ? settings.defaults.maxPrevalence : 0);
}
