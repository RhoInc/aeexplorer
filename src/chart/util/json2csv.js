import { collapse } from './collapse';

export function json2csv(chart) {
    const majorValidation = collapse(chart.data.major), // flatten major data array
        minorValidation = collapse(chart.data.minor), // flatten minor data array
        fullValidation = d3
            .merge([majorValidation, minorValidation]) // combine flattened major and minor data arrays
            .sort(
                (a, b) =>
                    a.majorCategory < b.majorCategory
                        ? -1
                        : a.majorCategory > b.majorCategory
                          ? 1
                          : a.minorCategory < b.minorCategory ? -1 : 1
            ),
        CSVarray = [];

    fullValidation.forEach((d, i) => {
        //add headers to CSV array
        if (i === 0) {
            const headers = Object.keys(d).map(key => `"${key.replace(/"/g, '""')}"`);
            CSVarray.push(headers);
        }

        //add rows to CSV array
        const row = Object.keys(d).map(key => {
            if (typeof d[key] === 'string') d[key] = d[key].replace(/"/g, '""');

            return `"${d[key]}"`;
        });

        CSVarray.push(row);
    });

    //transform CSV array into CSV string
    const CSV = new Blob([CSVarray.join('\n')], { type: 'text/csv;charset=utf-8;' }),
        fileName = `${chart.config.variables.major}-${chart.config.variables.minor}-${chart.config
            .summary}.csv`,
        link = chart.wrap.select('#downloadCSV');

    if (navigator.msSaveBlob) {
        // IE 10+
        link.style({
            cursor: 'pointer',
            'text-decoration': 'underline',
            color: 'blue'
        });
        link.on('click', () => {
            navigator.msSaveBlob(CSV, fileName);
        });
    } else {
        // Browsers that support HTML5 download attribute
        if (link.node().download !== undefined) {
            // feature detection
            var url = URL.createObjectURL(CSV);
            link.node().setAttribute('href', url);
            link.node().setAttribute('download', fileName);
        }
    }

    return CSVarray;
}
