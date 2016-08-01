export const sort = {
    maxPer: function(a,b) {
        var max_a = a.values
            .map(function(minor) {
                return d3.max(
                    minor.values.map(function(groups) {
                        return groups.values.per;
                    })
                );
            })[0];
        var max_b = b.values
            .map(function(minor) {
                return d3.max(
                    minor.values.map(function(groups) {
                        return groups.values.per;
                    })
                );
            })[0];
        return max_a < max_b ? 1 : max_a > max_b ?-1 : 0;
    }
}
