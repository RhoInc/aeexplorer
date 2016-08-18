import table from './table';

export function createTable(element = 'body', config = {}) {
    let thisTable = Object.create(table);
    thisTable.div = element;
    thisTable.config = Object.create(config);
    thisTable.wrap = d3.select(thisTable.div).append('div');

    return thisTable;
}
