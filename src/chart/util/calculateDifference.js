/*------------------------------------------------------------------------------------------------\
  Calculate differences between groups.
\------------------------------------------------------------------------------------------------*/

export function calculateDifference(major, minor, group1, group2, n1, tot1, n2, tot2) {
    var zCrit = 1.96;
    var p1 = n1 / tot1;
    var p2 = n2 / tot2;
    var diff = p1 - p2;
    var se = Math.sqrt(p1 * (1 - p1) / tot1 + p2 * (1 - p2) / tot2);
    var lower = diff - 1.96 * se;
    var upper = diff + 1.96 * se;
    var sig = (lower > 0) | (upper < 0) ? 1 : 0;
    var summary = {
        major: major,
        minor: minor,

        group1: group1,
        n1: n1,
        tot1: tot1,
        p1: p1,

        group2: group2,
        n2: n2,
        tot2: tot2,
        p2: p2,

        diff: diff * 100,
        lower: lower * 100,
        upper: upper * 100,
        sig: sig
    };

    return summary;
}
