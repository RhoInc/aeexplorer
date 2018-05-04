/*------------------------------------------------------------------------------------------------\
  Clears the summary or detail table and all associated buttons.
\------------------------------------------------------------------------------------------------*/

export function wipe(canvas) {
    canvas.select('.table-wrapper .SummaryTable .wc-alert').remove();
    canvas.select('.table-wrapper .SummaryTable table').remove();
    canvas.select('.table-wrapper .SummaryTable button').remove();
    canvas.select('.table-wrapper .DetailTable').remove();
    canvas.select('.table-wrapper .DetailTable').remove();
}
