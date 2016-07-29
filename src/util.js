export const util = {

    cross: function(data, groups, id, major, minor, group) {
        const groupNames = groups.map(function(e) {
            return e.key;
        });

        const data_nested = d3.nest()
            .key(function(d) { return major == 'All' ? 'All' : d[major]; })
            .key(function(d) { return minor == 'All' ? 'All' : d[minor]; })
            .key(function(d) { return d[group]; })
            .rollup(function(d) {
                const ids = d3.nest()
                    .key(function(d) { return d[id]})
                    .entries(d)
                const n = ids.length;
                const n_recs = d.length;
                const currentGroup = groups.filter(function(e) {
                    return e.key === d[0][group];
                });
                const tot=currentGroup[0].n;
                const per=Math.round(n/tot*1000)/10; //simple prevelance caluclation

              //get the rest of the needed information from the raw data		
                const current_major= major=='All' ? 'All' : d[0][major]
                const current_minor= minor=='All' ? 'All' : d[0][minor]
                const current_group= d[0][group];
                
                const current_obj={
                    major: current_major,
                    minor: current_minor,
                    label: current_minor=='All' ? current_major : current_minor,
                    group: current_group,
                    n_recs: n_recs,
                    n: n,
                    tot: tot,
                    per: per
                    } 

                return(current_obj)
            })
            .entries(data);

      //Now fill in the gaps for categories (Major*Minor) where there are groups with 0 incidence. 
        data_nested.forEach(function(eMajor) { 
            eMajor.values.forEach(function(eMinor) {
                const currentGroupList = eMinor.values.map(function(e) {
                    return e.key;
                });

                groupNames.forEach(function(eGroup,groupIndex) {			
                  //Check to see if each group level has an object, if it doesn't, splice in an element fill of 0s				
                    if(currentGroupList.indexOf(eGroup)==-1) {
                      //get group size
                        const currentGroup = groups.filter(function(e) { return (e.key==eGroup)})
                        const tot = currentGroup[0].n;
                      //new object with n=0
                        newObj = {
                            key: eGroup,
                            values: {
                                group: eGroup,
                                label: eMinor.key=='All' ? eMajor.key : eMinor.key,
                                major: eMajor.key,
                                minor: eMinor.key,
                                n: 0,
                                n_recs: 0,
                                per: 0,
                                tot: tot
                            }
                        }
                        eMinor.values.push(newObj)
                        
                    }
                });

                eMinor.values.sort(function(a,b) {
                    return  groups.map(function(group) { return group.key; }).indexOf(a.key) -
                            groups.map(function(group) { return group.key; }).indexOf(b.key);
                    });
            });
        });

        return data_nested
    },

    calculateDifference: function(major, minor, group1, group2, n1, tot1, n2, tot2) {
        const zCrit = 1.96;
        const p1 = n1/tot1;
        const p2 = n2/tot2;
        const diff = (p1 - p2);
        const se = Math.sqrt(p1*(1-p1)/tot1 + p2*(1-p2)/tot2)
        const lower = (diff - 1.96*se);
        const upper = (diff + 1.96*se);
        const sig = (lower > 0 | upper < 0) ? 1 : 0;
        const summary =
            {'major' : major
            ,'minor' : minor
            ,'group1' : group1
            ,'group2' : group2
            ,'n1' : n1
            ,'n2' : n2
            ,'tot1' : tot1
            ,'tot2' : tot2
            ,'diff' : diff*100
            ,'lower' : lower*100
            ,'upper' : upper*100
            ,'sig' : sig}

        return summary;
    },

    addDifferences: function(data, groups) {
        const nGroups = groups.length;

        if (nGroups > 1) {
            data.forEach(function(major) {
                major.values.forEach(function(minor) {
                    minor.differences = [];
                    const group1 = minor.values[0];
                    const group2 = minor.values[1];
                    const diff1 = util.calculateDifference
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
                        const group3 = minor.values[2]
                        const diff2 = util.calculateDifference
                            (major.key
                            ,minor.key
                            ,group1.key
                            ,group3.key
                            ,group1.values.n
                            ,group1.values.tot
                            ,group3.values.n
                            ,group3.values.tot);
                        const diff3 = util.calculateDifference
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
    },

    sort: {
        maxPer: function(a,b) {
            const max_a = a.values
                .map(function(minor) {
                    return d3.max(
                        minor.values.map(function(groups) {
                            return groups.values.per;
                        })
                    );
                })[0];
            const max_b = b.values
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
}
