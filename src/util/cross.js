/*------------------------------------------------------------------------------------------------\
  Calculate number of events, number of subjects, and adverse event rate by major, minor, and
  group.
\------------------------------------------------------------------------------------------------*/

export function cross(data, groups, id, major, minor, group) {
    var groupNames = groups
        .map(function(e) {
            return e.key; });

  //Calculate number of events, number of subjects, and adverse event rate by major, minor, and
  //group.
    var nestedData = d3.nest()
        .key(function(d) { return major == 'All' ? 'All' : d[major]; })
        .key(function(d) { return minor == 'All' ? 'All' : d[minor]; })
        .key(function(d) { return d[group]; })
        .rollup(function(d) {
            var selectedMajor = major === 'All' ? 'All' : d[0][major];
            var selectedMinor = minor === 'All' ? 'All' : d[0][minor];
            var selectedGroup = d[0][group];

            var nRecords = d.length;
            var ids = d3.nest()
                .key(function(d) { return d[id]; })
                .entries(d);
            var n = ids.length;
            var currentGroup = groups
                .filter(function(e) {
                    return e.key === d[0][group]; });
            var tot = currentGroup[0].n;
            var per = Math.round(n/tot*1000)/10;

            var selectedMajorMinorGroup =
                {major: selectedMajor
                ,minor: selectedMinor
                ,label: selectedMinor === 'All' ? selectedMajor : selectedMinor
                ,group: selectedGroup
                ,nRecords: nRecords
                ,n: n
                ,tot: tot
                ,per: per}; 

            return selectedMajorMinorGroup; })
        .entries(data);

  //Generate data objects for major*minor*group combinations absent in data.
    nestedData.forEach(function(eMajor) { 
        eMajor.values.forEach(function(eMinor) {
            var currentGroupList = eMinor.values.map(function(e) {
                return e.key; });

            groupNames
                .forEach(function(eGroup, groupIndex) {
                    if (currentGroupList.indexOf(eGroup) === -1) {
                        var currentGroup = groups
                            .filter(function(e) {
                                return e.key === eGroup; })
                        var tot = currentGroup[0].n;
                        var shellMajorMinorGroup =
                            {key: eGroup
                            ,values:
                                {group: eGroup
                                ,label: eMinor.key=='All' ? eMajor.key : eMinor.key
                                ,major: eMajor.key
                                ,minor: eMinor.key
                                ,n: 0
                                ,nRecords: 0
                                ,per: 0
                                ,tot: tot
                                }};

                        eMinor.values.push(shellMajorMinorGroup);
                    }
                });

            eMinor.values
                .sort(function(a,b) {
                    return  groups.map(function(group) { return group.key; }).indexOf(a.key) -
                            groups.map(function(group) { return group.key; }).indexOf(b.key); });
        });
    });

    return nestedData
}
