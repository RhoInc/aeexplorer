/*------------------------------------------------------------------------------------------------\
  Add differences to data object.
\------------------------------------------------------------------------------------------------*/

import { calculateDifference } from './calculateDifference';

export function addDifferences(data, groups) {
    var nGroups = groups.length;

    if (nGroups > 1) {
        data.forEach(function(major) {
            major.values.forEach(function(minor) {
                minor.differences = [];

                var groups = minor.values;
                var otherGroups = [].concat(minor.values);

                groups.forEach(function(group) {
                    delete otherGroups[otherGroups.map(m => m.key).indexOf(group.key)];
                    otherGroups.forEach(function(otherGroup) {
                        var diff = calculateDifference(
                            major.key,
                            minor.key,
                            group.key,
                            otherGroup.key,
                            group.values.n,
                            group.values.tot,
                            otherGroup.values.n,
                            otherGroup.values.tot
                        );
                        minor.differences.push(diff);
                    });
                });
            });
        });
    }

    return data;
}
