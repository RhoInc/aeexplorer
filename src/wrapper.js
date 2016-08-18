import { createTable } from './createTable.js';
import defaultSettings from './default-settings';
import './util/object-assign';

export default function aeExplorer(element, userSettings) {
    let settings = Object.assign({}, defaultSettings, userSettings);
    let aeTable = createTable(element, settings);

    return aeTable;
}
