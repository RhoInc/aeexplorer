//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//                                                                      //
// Mathematical/Statistical and data manipulation Functions             //
//                                                                      //
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
!function() {
    var util = {};
      //////////////////////////////////////////////////////////////////////////////////////////////////////////
      // cross(data, major, minor, group)	- Creates an object that is ready to be plotted in AETable(). 		//
      // Function that returns a full nested major*minor*group structure **including groups with 0 incidence**//
      //                                          
      // Note: this is still a bit messy and could use some more documentation, but it seems to work ... 
      //
      // Based on the example outlined by Mike Bostock here: 
      // https://groups.google.com/d/topic/d3-js/0zNu-oVVtwk/discussion
      //////////////////////////////////////////////////////////////////////////////////////////////////////////

        util.cross = function(data, groups, id, major, minor, group) {
            groupNames=groups.map(function(e){return e.key})                           //get list of group names
          //Do a normal nest (this will *not* detect/return groups that have no elements in the given subcategory)
            var data_nested = d3.nest()
            .key(function(d) {return major=="All" ? "All" : d[major]})
            .key(function(d) {return minor=="All" ? "All" : d[minor]})
            .key(function(d) {return d[group]})
            .rollup(function(d){

              //use nest find the number of unique ids (with 1+ AE) within this classification
                ids=d3.nest().key(function(d){return d[id]}).entries(d)
                n=ids.length;
              //Also record the total number of events
                n_recs=d.length;
                
              //get the total number of people in the current treatment group using the groups arguement
                currentgroup=groups.filter(function(e){return (e.key==d[0][group])})
                tot=currentgroup[0].n;
                per=Math.round(n/tot*1000)/10; //simple prevelance caluclation

              //get the rest of the needed information from the raw data		
                current_major= major=="All" ? "All" : d[0][major]
                current_minor= minor=="All" ? "All" : d[0][minor]
                current_group= d[0][group];
                
                current_obj={
                    major:current_major,
                    minor:current_minor,
                    label:current_minor=="All" ? current_major : current_minor,
                    group:current_group,
                    n_recs:n_recs,
                    n:n,
                    tot:tot,
                    per:per
                    } 
                return(current_obj)

                })
            .entries(data);

          //Now fill in the gaps for categories (Major*Minor) where there are groups with 0 incidence. 
            data_nested.forEach(function(eMajor){ 
                eMajor.values.forEach(function(eMinor){
                    currentGroupList=eMinor.values.map(function(e){return e.key})
                    groupNames.forEach(function(eGroup,groupIndex){			
                      //Check to see if each group level has an object, if it doesn't, splice in an element fill of 0s				
                        if(currentGroupList.indexOf(eGroup)==-1){
                          //get group size
                            currentgroup=groups.filter(function(e){return (e.key==eGroup)})
                            tot=currentgroup[0].n;
                          //new object with n=0
                            newObj={
                                key:eGroup,
                                values:{
                                    group:eGroup,
                                    label:eMinor.key=="All" ? eMajor.key : eMinor.key,
                                    major:eMajor.key,
                                    minor:eMinor.key,
                                    n:0,
                                    n_recs:0,
                                    per:0,
                                    tot:tot
                                }
                            }
                            eMinor.values.push(newObj)
                          //eMinor.values.splice(groupIndex,0,newObj)
                            
                        }
                    })
                eMinor.values.sort(function(a,b){
                    return  groups.map(function(group) { return group.key; }).indexOf(a.key) -
                            groups.map(function(group) { return group.key; }).indexOf(b.key);
                    })
                })
            })

            return data_nested
        }

      //////////////////////////////////////////////////////////////////////////
      // calculateDifference() - Function to calculate pairwise differences 	//
      // in prevlance with 95% CI 											//
      //////////////////////////////////////////////////////////////////////////

        util.calculateDifference = function(major, minor, group1, group2, n1, tot1, n2, tot2){
            zcrit=1.96; //95% CI
            p1=n1/tot1;
            p2=n2/tot2;
            diff=(p1-p2);
            se=Math.sqrt(p1*(1-p1)/tot1 + p2*(1-p2)/tot2)
            lower=(diff-1.96*se);
            upper=(diff+1.96*se);
            sig=(lower>0 | upper<0) ? 1 : 0;
            summary={
                "major":major,
                "minor":minor,
                "group1":group1,
                "group2":group2,
                "n1":n1,
                "n2":n2,
                "tot1":tot1,
                "tot2":tot2,
                "diff":diff*100,
                "lower":lower*100,
                "upper":upper*100,
                "sig":sig
            }
            return summary;
        }

      //////////////////////////////////////////////////////////////////////////////////
      // addDifferences() - Function to add a "difference" object to each table row	//
      // returns the data object with differences added
      // NOTE: will need to update this loop if we expand to 4+ groups
      //////////////////////////////////////////////////////////////////////////////////
        util.addDifferences = function(data, groups) {
            ngroups=groups.length;
            if(ngroups>1){	//Only run if there are 2+ groups
                data.forEach(function(major){
                    major.values.forEach(function(minor){
                        minor.differences=[] //initialize empty array for difference objects
                        group1=minor.values[0]
                        group2=minor.values[1]
                        diff1=util.calculateDifference(major.key, minor.key, group1.key, group2.key, group1.values.n, group1.values.tot , group2.values.n, group2.values.tot)
                        minor.differences.push(diff1)
                        if(ngroups==3){
                            group3=minor.values[2]
                            diff2=util.calculateDifference(major.key, minor.key, group1.key, group3.key, group1.values.n,group1.values.tot,group3.values.n,group3.values.tot)
                            diff3=util.calculateDifference(major.key, minor.key, group2.key, group3.key, group2.values.n,group2.values.tot,group3.values.n,group3.values.tot)
                            minor.differences.push(diff2,diff3)
                        }
                    })
                })
            }
            return data; 
        }

      //////////////////////////////////////////////////////////////////////////////////
      // Various Sort functions
      //////////////////////////////////////////////////////////////////////////////////
      //Alphabetical
        util.sort = { 
          //Max Rate
            maxPer: function(a,b){
                max_a = 
                        a.values.map(function(minor){
                            return d3.max(
                                minor.values.map(function(groups){
                                    return groups.values.per
                                })
                            )
                        })[0]
                max_b = 

                b.values.map(function(minor){
                    return d3.max(
                        minor.values.map(function(groups){
                            return groups.values.per
                        })
                    )
                })[0]	
                return max_a < max_b ? 1 : max_a > max_b ?-1 : 0;
            }
        }

    if (typeof define === "function" && define.amd)
        this.util = util, define(util);
    else if (typeof module === "object" && module.exports)
        module.exports = util;
    else this.util = util;
}();
