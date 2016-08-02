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
                var group1 = minor.values[0];
                var group2 = minor.values[1];
                var diff1 = calculateDifference
                    (major.key
                    ,minor.key
                    ,group1.key
                    ,group2.key
                    ,group1.values.n
                    ,group1.values.tot
                    ,group2.values.n
                    ,group2.values.tot);
                minor.differences.push(diff1);

                if (nGroups === 3) {
                    var group3 = minor.values[2]
                    var diff2 = calculateDifference
                        (major.key
                        ,minor.key
                        ,group1.key
                        ,group3.key
                        ,group1.values.n
                        ,group1.values.tot
                        ,group3.values.n
                        ,group3.values.tot);
                    var diff3 = calculateDifference
                        (major.key
                        ,minor.key
                        ,group2.key
                        ,group3.key
                        ,group2.values.n
                        ,group2.values.tot
                        ,group3.values.n
                        ,group3.values.tot);
                    minor.differences.push(diff2, diff3);
                }
            });
        });
    }

    return data; 
}
