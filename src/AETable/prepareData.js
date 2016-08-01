/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/
export function prepareData(canvas, data,vars,settings) {

    data.forEach(function(e) {
        e.data_all = "All"			//Create a placeholder variable for 1-group analysis
      //standardize (set to "None/Unknown") and flag records with missing categorical variables
        e.flag=0
        if(["No AEs","NA","na",""," ","None/Unknown"].indexOf(e[vars.major].trim())>-1) {
            e[vars.major] = "None/Unknown";
            e.flag=1;
        }
        if(["No AEs","NA","na",""," ","None/Unknown"].indexOf(e[vars.minor].trim())>-1) {
            e[vars.minor] = "None/Unknown";
        }
    });

  //set group numbers - first nest the data
    var test = d3.nest()
        .key(function(d) {return d[vars.group]})
        .key(function(d) {return d[vars.id]})
        .entries(data);
  //then create the n
    settings.groups.forEach(function(e) {
        var just_group = test.filter(function(f) {return f.key === e.key});
      //set n for each group or total n if no groups
        e.n = just_group.length ? just_group[0].values.length : d3.sum(test.map(function(m) {return m.values.length}));
    });

  //Only keep rows from the selected groups
    var groupNames=settings.groups.map(function(e) {return e.key})                  //get list of group names
    var sub=data.filter(function(e) {return groupNames.indexOf(e[vars["group"]])>=0}) //filter out unselected groups
    
  ////////////////////////////////////////////////////////////////////////////////
  //Drop the placeholder rows for participants with no AEs from the data set
  // NOTE: We can make this a lot cleaner if/when we move to loading 2 separate data sets.
  ////////////////////////////////////////////////////////////////////////////////
  //if(d3.keys(data[0]).indexOf("AEflag")>0) {
  //	var sub=sub.filter(function(e) {return +e.AEflag==1})
  //}

  /////////////////////////////////////////////////////
  // Filter the data based on the current selections
  /////////////////////////////////////////////////////

  //filter without bootstrap multiselect
    canvas.select('.custom-filters').selectAll('select')
        .each(function(dVar) {
            var currentvar = dVar.key;

            d3.select(this).selectAll("option")
                .each(function(dItem) {
                    var currentitem = dItem;
                    if(!d3.select(this).property("selected")) {
                        sub = sub.filter(function(d) {return d[currentvar] != currentitem; });
                    }
                })
        });

    return sub;
}
