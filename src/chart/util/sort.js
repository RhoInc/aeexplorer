/*------------------------------------------------------------------------------------------------\
  Define sorting algorithms.
\------------------------------------------------------------------------------------------------*/

export const sort = {
    //Sort by descending frequency.
    maxPer: function(a, b) {
        var max_a = a.values.map(function(minor) {
            var n = d3.sum(minor.values.map(group => group.values.n));
            var tot = d3.sum(minor.values.map(group => group.values.tot));
            return n / tot;
        })[0];
        var max_b = b.values.map(function(minor) {
            var n = d3.sum(minor.values.map(group => group.values.n));
            var tot = d3.sum(minor.values.map(group => group.values.tot));
            return n / tot;
        })[0];
        var diff = max_b - max_a;

        return diff ? diff : a.key < b.key ? -1 : 1;
    }
};
