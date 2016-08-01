/*------------------------------------------------------------------------------------------------\
  Clears the summary or deatil table and all associated buttons.
\------------------------------------------------------------------------------------------------*/

export function wipe(canvas) {
    canvas.select(".table-wrapper .SummaryTable table").remove()
    canvas.select(".table-wrapper .SummaryTable button").remove()
    canvas.select(".table-wrapper .DetailTable").remove()
    canvas.select(".table-wrapper .DetailTable").remove()
}
