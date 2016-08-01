export function cross(data, groups, id, major, minor, group) {
    var groupNames = groups.map(function(e) {
        return e.key;
    });

    var data_nested = d3.nest()
        .key(function(d) { return major == 'All' ? 'All' : d[major]; })
        .key(function(d) { return minor == 'All' ? 'All' : d[minor]; })
        .key(function(d) { return d[group]; })
        .rollup(function(d) {
            var ids = d3.nest()
                .key(function(d) { return d[id]})
                .entries(d)
            var n = ids.length;
            var n_recs = d.length;
            var currentGroup = groups.filter(function(e) {
                return e.key === d[0][group];
            });
            var tot=currentGroup[0].n;
            var per=Math.round(n/tot*1000)/10; //simple prevelance caluclation

          //get the rest of the needed information from the raw data		
            var current_major= major=='All' ? 'All' : d[0][major]
            var current_minor= minor=='All' ? 'All' : d[0][minor]
            var current_group= d[0][group];
            
            var current_obj={
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
            var currentGroupList = eMinor.values.map(function(e) {
                return e.key;
            });

            groupNames.forEach(function(eGroup,groupIndex) {			
              //Check to see if each group level has an object, if it doesn't, splice in an element fill of 0s				
                if(currentGroupList.indexOf(eGroup)==-1) {
                  //get group size
                    var currentGroup = groups.filter(function(e) { return (e.key==eGroup)})
                    var tot = currentGroup[0].n;
                  //new object with n=0
                    var newObj = {
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
}
