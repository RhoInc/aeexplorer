/*------------------------------------------------------------------------------------------------\
  Set colors.
\------------------------------------------------------------------------------------------------*/

export default function colorScale(colors) {
    return d3.scale.ordinal().range(colors);
}
