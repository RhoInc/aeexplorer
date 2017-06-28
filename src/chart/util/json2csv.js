/*------------------------------------------------------------------------------------------------\
  Convert JSON data to comma separated values. Function found at
  http://stackoverflow.com/questions/4130849/convert-json-format-to-csv-format-for-ms-excel.
\------------------------------------------------------------------------------------------------*/

export function json2csv(objArray) {
    var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    var CSV = '';

    //Output column headers.
    var header = '';
    for (var index in array[0]) {
        header += index + ', ';
    }
    header.slice(0, header.length - 1);
    CSV += header + '\r\n';

    //Output column data.
    for (var i = 0; i < array.length; i++) {
        var row = '';

        for (var index in array[i]) {
            row += array[i][index] + ', ';
        }

        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
    }

    return CSV;
}
