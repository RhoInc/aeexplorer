//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//                                                                      //
// Functions to draw/manipulate the AE Table                            //
// - Can be called from builder or as a stand-alone function            //
//                                                                      //
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
      //Asynchronous Module Definition (AMD)
        define(["d3", "util"], factory);
    } else if (typeof module === "object" && module.exports) {
      //Node, CommonJS-like
        module.exports = factory(require("d3"), require("util"));
    } else {
      //Browser globals (root is window)
        root.aeTable = factory(root.d3, root.util);
    }
}(this, function(d3, util) {

    var table = {
        init: function(canvas, data, settings, onDataError){
          // if group is missing just render 1 column
            if(settings.variables.group==""){
                settings.variables.group="data_all"
                settings.groups=[{"key":"All","n":1,"selected":true}]
            }
        
          //reset canvas as a d3 selection here, rather than in the initial call
            canvas = d3.select(canvas);
            
            function errorNote(msg){
                canvas.append("div").attr("class", "alert alert-error alert-danger").text(msg);
            };

            for(x in settings.variables){
                var varlist = d3.keys(data[0])
                varlist.push("data_all") //exception for situations with no group variable

                if(varlist.indexOf(settings.variables[x]) === -1){
                    if(settings.variables[x] instanceof Array){
                        settings.variables[x].forEach(function(e){
                            if(d3.keys(data[0]).indexOf(e) === -1){
                                errorNote("Error in variables object.");
                                throw new Error(x + " variable "+"(\""+e+"\") not found in dataset.");
                            }
                        })
                    }
                    else{
                        errorNote("Error in variables object.");
                        throw new Error(x + " variable "+"(\""+settings.variables[x]+"\") not found in dataset.");
                    }
                }
            };
          //check that groups defined in settings are actually present in dataset
            settings.groups.forEach(function(e){
                varlist=d3.set(data.map(function(d){return d[settings.variables.group]})).values()
                varlist.push("All") //exception for situations with no group variable
                if(varlist.indexOf(e.key) == -1){
                    errorNote("Error in settings object.");
                    throw new Error("\""+e.key +"\" in the Groups setting is not found in the dataset.");
                }
            });

          //sort the groups so that they match the final data
            settings.groups.sort()

          //Set the domain for the color scale based on groups
            table.colorScale.domain(settings.groups.map(function(e){return e.key}))
            
          //layout the table
            table.layout(canvas)
          //table.header.init(canvas, settings)

          //Initialize UI (remove previous if any)
            table.controls.init(canvas, data, settings.variables, settings)

          //Initialize Event Listeners
            table.eventListeners.rateFilter(canvas)
            table.eventListeners.search(canvas, data, data, settings.variables, settings)
            table.eventListeners.customFilters(canvas, data, data, settings.variables, settings)


          //Draw the table (remove previous if any)
            table.AETable.redraw(canvas, data, data, settings.variables, settings)

        },
      //Set constants for use throughout table.js
        colorScale: d3.scale.ordinal()
            .range(["#377EB8","#4DAF4A","#984EA3", "#FF7F00", "#A65628", "#F781BF", "#FFFF33", "#E41A1C"]),
        pageTitle:"Adverse Event Explorer",

      //Layout the basic structure within the selected "canvas"
        layout: function(canvas){
            var wrapper = canvas
            .append("div").attr("class","ig-aetable row-fluid")
            .append("div").attr("class","table-wrapper")
            wrapper.append("div").attr("class","controls form-inline row-fluid")
            wrapper.append("div").attr("class","SummaryTable")
        },

        controls: {
            init: function(canvas, data, vars, settings){
                var controls = canvas.select("div.controls");
                controls.attr("onsubmit","return false;")

              //remove previous controls (if any)
                controls.selectAll("*").remove()
                
              //layout the controls form
                var rateFilter = controls.append("div").attr("class","rate-filter")
                var searchBox = controls.append("form")
                .attr("class","searchForm navbar-search pull-right")
                .attr("onsubmit","return false;")
                var customFilters = controls.append("div").attr("class","custom-filters")

              //draw UI components
                table.controls.filters.rate.init(rateFilter)
                table.controls.filters.custom.init(customFilters, data,vars,settings)
                table.controls.search.init(searchBox)

              //initialize the filter rate
                table.controls.filters.rate.set(canvas, settings)
            },

            filters: {
                rate: {
                    init:function(selector){ 
                      //remove previous version (if any)
                        selector.select("span.filterLabel").remove()
                        selector.select("div.rateFilterDiv").remove()

                      //Add new rate filter
                        selector.append("span").html("Prevalence &#8805;&nbsp;")

                        var filterRate=selector.append("div")
                        .attr("class","rateFilterDiv")
                        filterRate.append("input")
                            .attr("class","rateFilter")
                            .attr("type","text")
                        selector.append("span").text("%")
                    },
                    get: function(){},
                    set: function(canvas, settings){
                        if(settings.defaults !== undefined){
                            if(settings.defaults.maxPrevalence !== undefined){
                                canvas.select("div.controls input.rateFilter")
                                .property("value",settings.defaults.maxPrevalence)
                            }
                        }
                    }
                },
                custom:{
                    init: function(selector, data, vars, settings){
                      //Get list of categories for each selected filter
                        var filterVars=vars["filters"].map(function(e) {
                            return {key:e, values:[]};
                        });

                        filterVars.forEach(function(e) {
                            var varLevels = d3.nest()
                                .key(function(d){ return d[e.key]; })
                                .entries(data)
                            e.values = varLevels.map(function(d) {
                                return d.key
                            });
                        });

                      //Remove previous filters (if any)
                        selector.selectAll("ul.nav").remove()

                      //Add filters for each selected variable
                        var filterCustomList = selector.append("ul").attr("class","nav")
                        var filterCustom_li = filterCustomList
                            .selectAll("li")
                                .data(filterVars).enter()
                            .append("li")
                            .attr("class",function(d) {
                                return "custom-"+d.key+" filterCustom"
                            });
                        var filterLabel  =  filterCustom_li.append("span")
                            .attr("class","filterLabel")
                            .text(function(d) {
                                if (settings.filterSettings) {
                                    var filterLabel = settings.filterSettings.filter(function(d1) {
                                        return d1.key === d.key;
                                    })[0].label;
                                    return filterLabel ? filterLabel : d.key;
                                } else return d.key;
                            });

                        var filterCustom  =  filterCustom_li.append("select")
                            .attr("multiple",true)

                      //Add data-driven filter options 
                        var filterItems = filterCustom
                            .selectAll("option")
                                .data(function(d) {
                                    return d.values.filter(function(d) {
                                        return ["NA",""," "].indexOf(d) === -1;
                                    });
                                }).enter()
                            .append("option")
                            .html(function(d) {
                                    return  "<span><i class = 'icon-remove icon-white fa fa-times'></i></span>"
                                        +   (["NA",""," "].indexOf(d) > -1 ? "[None]" : d);
                                })
                            .attr("value",function(d){return d})
                            .attr("selected","selected")

                    },
                    get: function(){},
                    set: function(){}
                }
            },
            
            search:{
                init:function(selector){
                  //clear previous search bar (if any)
                    selector.select("span.seach-label").remove()
                    selector.select("input.searchBar").remove()

                  //create search bar

                    var searchLabel = selector.append("span")
                        .attr("class","search-label label hidden")
                    searchLabel.append("span")
                        .attr("class","search-count")
                    searchLabel.append("span")
                        .attr("class","clear-search")
                        .html("&#9747;")
                    selector.append("input")
                        .attr("type","text")
                        .attr("class","searchBar search-query input-medium")
                        .attr("placeholder","Search")
                },
                get: function(){},
                set: function(){},
                clear: function(canvas){
                  //un-disable rate filter
                    canvas.select("input.rateFilter").property("disabled", false);

                  //Set the search box to blank
                    canvas.select("input.searchBar").property("value","")

                  //Remove search highlighting
                    canvas.selectAll("div.SummaryTable table tbody tr.search td.rowLabel").html(function(d){return d.values[0].values["label"]}) 

                  //hide the "clear-search" icon and label
                    canvas.select("span.search-label").classed("hidden",true)

                  //clear search flags
                    canvas.selectAll("div.SummaryTable").classed("search",false)
                    canvas.selectAll("div.SummaryTable table tbody").classed("search",false)
                    canvas.selectAll("div.SummaryTable table tbody tr").classed("search",false)

                  //reset the filters and row toggle
                    table.AETable.toggleRows(canvas) //show/hide table rows as needed
                }
            }
        }, //end Controls{}

        eventListeners: {
            rateFilter:function(canvas){
                    var rateFilter = canvas.select("input.rateFilter")
                    rateFilter.on("change",function(d){	
                        
                      //remove all old filter flags
                        canvas.selectAll(".SummaryTable table tbody tr").classed("filter",false)

                      //add new filter flags as needed
                        table.AETable.toggleRows(canvas) 
                    })
            },
            customFilters:function(canvas, data, data, vars, settings){	
                var filterCustom = canvas.selectAll(".custom-filters ul li select");

              //redraw table without bootstrap multiselect
                filterCustom.on('change', function() {
                    table.AETable.redraw(canvas, data, data, vars, settings);
                });
            },

            search: function(canvas, data, data, vars, settings){
                canvas.select("input.searchBar").on("change",function(d){
                    var searchTerm=d3.select(this).property("value").toLowerCase()
                    if(searchTerm.length>0){

                      //clear the previous search (but keep the seach text the same #hack)
                        table.controls.search.clear(canvas)
                        d3.select(this).property("value",searchTerm)

                      //Show all minor rows and clear the filter
                        canvas.selectAll("div.SummaryTable table tbody").classed("minorHidden",false)
                        canvas.selectAll("div.SummaryTable table tbody tr").classed("filter",false)

                      //clear previous search flags
                        canvas.select("div.SummaryTable").classed("search",false)
                        canvas.selectAll("div.SummaryTable table tbody").classed("search",false)
                        canvas.selectAll("div.SummaryTable table tbody tr").classed("search",false)
                        
                      //change exapand/collapse cell to blank
                        canvas.selectAll("div.SummaryTable table tbody tr td.controls span").classed("hidden",true)

                      //show the "clear-search" icon
                        canvas.select("span.search-label").classed("hidden",false)

                      //flag the summary table as search
                        var tab=canvas.select("div.SummaryTable")
                        tab.classed("search",true)

                      //get tbody areas that contain the search term
                        var tbodyMatch = tab.select("table").selectAll("tbody").each(function(bodyElement){
                            var bodyCurrent = d3.select(this)
                            var bodyData = bodyCurrent.data()[0]

                            bodyCurrent.selectAll("tr").each(function(rowElement){
                                var rowCurrent = d3.select(this)
                                var rowData = rowCurrent.data()[0]
                                var rowText = rowCurrent.classed("major") ? bodyData.key.toLowerCase() : rowData.key.toLowerCase() 
                                if(rowText.search(searchTerm)>=0){

                                    bodyCurrent.classed("search",true)
                                    rowCurrent.classed("search",true)

                                  //highlight the search text in the table cell. 
                                    var currentText = rowCurrent.select("td.rowLabel").html()
                                    var searchStart = currentText.toLowerCase().search(searchTerm)
                                    var searchStop  = searchStart + searchTerm.length
                                    var newText     = currentText.slice(0,searchStart) + "<span class='search'>" + currentText.slice(searchStart,searchStop) + "</span>" + currentText.slice(searchStop,currentText.length)
                                    rowCurrent.select("td.rowLabel").html(newText)
                                }
                            })
                        })

                      //disable rate filter
                        d3.select("input.rateFilter").property("disabled", true);

                      //update the search label
                        var matchCount = canvas.selectAll("tr.search")[0].length;
                        canvas.select("span.search-count").text(matchCount + " matches ")
                        canvas.select("span.search-label").attr("class",matchCount==0 ? "search-label label label-warning": "search-label label label-success")

                      //check for an empty search result
                        if(matchCount==0){
                          //restore the table
                            canvas.selectAll("div.SummaryTable").classed("search",false)
                            canvas.selectAll("div.SummaryTable table tbody").classed("search",false)
                            canvas.selectAll("div.SummaryTable table tbody tr").classed("search",false)

                          //reset the filters and row toggle
                            table.AETable.toggleRows(canvas) //show/hide table rows as needed
                        }
                        
                    }else{
                        table.controls.search.clear(canvas)
                    }


                })		
                canvas.select("span.clear-search").on("click",function(){
                    table.controls.search.clear(canvas)
                })
            }
        },


        AETable: {
          ////////////////////////////////////////////////
          //Clear the current table and draw a new one
          ////////////////////////////////////////////////
            redraw: function(canvas, data, data, vars, settings){
                table.controls.search.clear(canvas) //Reset the search bar
                table.AETable.wipe(canvas) //clear previous tables
                var data_filtered = table.AETable.prepareData(canvas, data,vars,settings) //get the data ready
                table.AETable.init(canvas, data_filtered, vars, settings) // draw the table
                table.AETable.toggleRows(canvas) //show/hide table rows as needed
            },

          ////////////////////////////////////////////////////////////////////
          //Clears the summary or detail table (and all associated buttons)
          ////////////////////////////////////////////////////////////////////
            wipe: function(canvas){
                canvas.select(".table-wrapper .SummaryTable table").remove()
                canvas.select(".table-wrapper .SummaryTable button").remove()
                canvas.select(".table-wrapper .DetailTable").remove()
                canvas.select(".table-wrapper .DetailTable").remove()
            },

          ///////////////////////////////////////////////////////////////////
          //	Filter the raw data according to the filter and group selections
          ///////////////////////////////////////////////////////////////////
            prepareData: function(canvas, data,vars,settings){

                data.forEach(function(e){
                    e.data_all = "All"			//Create a placeholder variable for 1-group analysis
                  //standardize (set to "None/Unknown") and flag records with missing categorical variables
                    e.flag=0
                    if(["No AEs","NA","na",""," ","None/Unknown"].indexOf(e[vars.major].trim())>-1){
                        e[vars.major] = "None/Unknown";
                        e.flag=1;
                    }
                    if(["No AEs","NA","na",""," ","None/Unknown"].indexOf(e[vars.minor].trim())>-1){
                        e[vars.minor] = "None/Unknown";
                    }
                });

              //set group numbers - first nest the data
                var test = d3.nest()
                    .key(function(d){return d[vars.group]})
                    .key(function(d){return d[vars.id]})
                    .entries(data);
              //then create the n
                settings.groups.forEach(function(e){
                    var just_group = test.filter(function(f){return f.key === e.key});
                  //set n for each group or total n if no groups
                    e.n = just_group.length ? just_group[0].values.length : d3.sum(test.map(function(m){return m.values.length}));
                });

              //Only keep rows from the selected groups
                var groupNames=settings.groups.map(function(e){return e.key})                  //get list of group names
                var sub=data.filter(function(e){return groupNames.indexOf(e[vars["group"]])>=0}) //filter out unselected groups
                
              ////////////////////////////////////////////////////////////////////////////////
              //Drop the placeholder rows for participants with no AEs from the data set
              // NOTE: We can make this a lot cleaner if/when we move to loading 2 separate data sets.
              ////////////////////////////////////////////////////////////////////////////////
              //if(d3.keys(data[0]).indexOf("AEflag")>0){
              //	var sub=sub.filter(function(e){return +e.AEflag==1})
              //}

              /////////////////////////////////////////////////////
              // Filter the data based on the current selections
              /////////////////////////////////////////////////////

              //filter without bootstrap multiselect
                canvas.select('.custom-filters').selectAll('select')
                    .each(function(dVar){
                        var currentvar = dVar.key;

                        d3.select(this).selectAll("option")
                            .each(function(dItem){
                                var currentitem = dItem;
                                if(!d3.select(this).property("selected")){
                                    sub = sub.filter(function(d){return d[currentvar] != currentitem; });
                                }
                            })
                    });

                return sub;
            },
          ///////////////////////////////////////////////////////////////
          // Call functions to collapse the raw data using the selected 
          // categories and create the summary table
          ///////////////////////////////////////////////////////////////
            init: function(canvas, data, vars, settings){

              //////////////////////////////////////////////////////////////////////
              // fillrow(d)	  												  //
              // Convienence Function to fill each table row and draw the plots //
              //
              // Note1: We'll call this 2x. Once for the major rows and once for//
              // the minor rows. Will probably want to add a 3rd for overall too. //
              //
              // Note2: Scoped within AETable() to avoid passing the big data 	//
              // sets around														//
              //
              // Note3: Would be good to split out separate plotting functions if //
              // this gets too much more complex									//
              //////////////////////////////////////////////////////////////////////

                function fillRow(d){
                  // Cell with row "controls"
                    controlCell=d3.select(this).append("td").attr("class","controls")
                    if(d.key=="All"){
                        controlCell.append("span")
                        .text(function(){
                            toggle = true//canvas.select("a.toggleRows").text() == "Show all nested rows"
                            return toggle ? "+" : "-"
                        })
                    }

                  // Cell with Label (System Organ Class or Preferred term name)
                    d3.select(this).append("td").attr("class","rowLabel").append("a")
                    .text(function(rowvalues){return rowvalues.values[0].values["label"]}) 

                  // Append Cells with rates and ns
                    var values=d3.select(this).selectAll("td.values") //Add a cell for every group (regardless of if there is an AE)
                        .data(d.values,function(d){return d.key})
                        .enter()
                        .append("td")
                        .attr("class","values")
                        .text(function(d){return fixed1(d["values"].per)+"%"})
                      //+ ") "<span class='vals'><sup>"+d["values"].n+"</sup>&frasl;<sub>"+d["values"].tot+"</sub></span>"})
                        .style("color",function(d){return table.colorScale(d.key)})


                  //Cell with Prevalence Plot
                    prev_plot=d3.select(this).append("td").classed("prevplot",true)
                        .append("svg")
                        .attr("height",h)
                        .attr("width",w+10)
                        .append("svg:g")
                            .attr("transform", "translate(5,0)")

                    points=prev_plot.selectAll("g.points")
                    .data(d.values)
                    .enter()
                    .append("g")
                    .attr("class","points")

                    points
                    .append("svg:circle")
                        .attr("cx", function(d){return percent_scale(d.values["per"])})
                        .attr("cy", h/2)
                        .attr("r",r-2)
                        .attr("fill",function(d){return table.colorScale(d.values["group"])})

                  //Cells with Difference plots 
                    if(settings.groups.length>1){

                      //add svg for difference plot
                        var diff_plot=d3.select(this).append("td").classed("diffplot",true)
                            .append("svg")
                            .attr("height",h)
                            .attr("width",w+10)
                        .append("svg:g")
                            .attr("transform", "translate(5,0)")

                        var diffpoints=diff_plot.selectAll("g")
                            .data(d.differences)
                            .enter()
                            .append("svg:g")

                      //show CIs if there are 2 groups (otherwise we'll add when you mouseover a diamond)
                        diffpoints.append("svg:line")
                            .attr("x1", function(d){return diff_scale(d.upper); })
                            .attr("x2", function(d){return diff_scale(d.lower); })
                            .attr("y1", h/2)
                            .attr("y2", h/2)
                            .attr("class","ci")
                            .classed("hidden", settings.groups.length==3)
                            .attr("stroke","#bbb")

                      //add the diamonds
                        var triangle = d3.svg.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .interpolate("linear-closed");
                        
                        diffpoints
                        .append("svg:path")
                            .attr("d", function(d) { 
                                leftpoints = [
                                    {x:diff_scale(d.diff)   ,y:h/2+r},//bottom
                                    {x:diff_scale(d.diff)-r ,y:h/2},//middle-left
                                    {x:diff_scale(d.diff)   ,y:h/2-r},//top
                                    ];
                                return triangle(leftpoints); 
                            })
                            .attr("class","diamond")
                            .attr("fill-opacity",function(d){return (d.sig==1) ? 1 : 0.1})
                            .attr("fill",function(d){return d.diff<0 ? table.colorScale(d.group1) : table.colorScale(d.group2)})
                            .attr("stroke",function(d){return d.diff<0 ? table.colorScale(d.group1) : table.colorScale(d.group2)})
                            .attr("stroke-opacity",0.3)

                        diffpoints
                        .append("svg:path")
                            .attr("d", function(d) { 
                                rightpoints = [
                                    {x:diff_scale(d.diff)   ,y:h/2+r},//bottom
                                    {x:diff_scale(d.diff)+r ,y:h/2},//middle-right
                                    {x:diff_scale(d.diff)   ,y:h/2-r},//top
                                    ];
                                return triangle(rightpoints); 
                            })
                            .attr("class","diamond")
                            .attr("fill-opacity",function(d){return (d.sig==1) ? 1 : 0.1})
                            .attr("fill",function(d){return d.diff<0 ? table.colorScale(d.group2) : table.colorScale(d.group1) })
                            .attr("stroke",function(d){return d.diff<0 ? table.colorScale(d.group2) : table.colorScale(d.group1)})
                            .attr("stroke-opacity",0.3)
                    }
                } //end fillRow


              /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
              //Create 1 nested data set each at System Organ Class and preferred term level with group-level prevalence data//
              ///////////////////////////////////////////////////////	/////////////////////////////////////////////////////////
                data_major=util.cross(data, settings.groups, vars["id"], vars["major"], "All",         vars["group"], settings.groups)
                data_minor=util.cross(data, settings.groups, vars["id"], vars["major"], vars["minor"], vars["group"], settings.groups)
                var sub = data.filter(function(e){return e.flag==0}) //subset so that the total column ignores missing values
                data_any=  util.cross(sub, settings.groups, vars["id"], "All"        , "All",         vars["group"], settings.groups)

              ////////////////////////////////////////////
              // Add a "differences" object to each row //
              ////////////////////////////////////////////
                data_major=util.addDifferences(data_major,settings.groups)
                data_minor=util.addDifferences(data_minor,settings.groups)
                data_any  =util.addDifferences(data_any,settings.groups)

              /////////////////////////////////////////////////////
              // Sort the data based by maximum prevelence
              /////////////////////////////////////////////////////
                data_major=data_major.sort(util.sort.maxPer) //System organ classes
                data_minor.forEach(function(major){
                    major.values.sort(function(a,b){
                        max_a= d3.max(
                            a.values.map(function(groups){
                                return groups.values.per
                            })
                        )

                        max_b= d3.max(
                            b.values.map(function(groups){
                                return groups.values.per
                            })
                        )

                        return max_a < max_b ? 1 : -1
                    })
                })

              ////////////////////////////////////////////////////////////
              //	Output the data if the validation setting is flagged//
              ////////////////////////////////////////////////////////////
                if (settings.validation){
                    var collapse = function(nested){
                      //Parse nested object into a flat object
                        var flat = nested.map(function(soc){
                            var allRows=soc.values.map(function(e){	
                                var e_flat = {}
                                e_flat.cat_main='"'+e.values[0].values.major+'"';
                                e_flat.cat_sub ='"'+e.values[0].values.minor+'"';
                                e.values.forEach(function(val,i){
                                    var n=i+1;
                                    e_flat["val"+n+"_label"]=val.key;
                                    e_flat["val"+n+"_numerator"]=val.values.n;
                                    e_flat["val"+n+"_denominator"]=val.values.tot;
                                    e_flat["val"+n+"_percent"]=val.values.per;
                                });
                                if(e.differences){
                                    e.differences.forEach(function(diff,i){
                                        var n=i+1;
                                        e_flat["diff"+n+"_label"]=diff.group1+"-"+diff.group2;
                                        e_flat["diff"+n+"_val"]=diff["diff"];
                                        e_flat["diff"+n+"_sig"]=diff["sig"];

                                    });
                                }
                                return e_flat
                            })
                            return allRows
                        })
                        return d3.merge(flat);
                    }

                    var major_v = collapse(data_major)
                    var minor_v = collapse(data_minor)
                    var full_v = d3.merge([major_v,minor_v])
                        .sort(function(a,b){return a.cat_sub < b.cat_sub ? -1 : 1})
                        .sort(function(a,b){return a.cat_main < b.cat_main ? -1 : 1})

                  //Function from http://stackoverflow.com/questions/4130849/convert-json-format-to-csv-format-for-ms-excel
                      function DownloadJSON2CSV(objArray){
                        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
                        var str = '';
                      //first output the column names
                        var line1='';
                        for (var index in array[0]) {
                                line1 += index + ',';
                            }
                        line1.slice(0,line1.Length-1); 
                        str += line1 + '\r\n';

                      //now output the actual data
                        for (var i = 0; i < array.length; i++) {
                            var line = '';

                            for (var index in array[i]) {
                                line += array[i][index] + ',';
                            }

                          // Here is an example where you would wrap the values in double quotes
                          // for (var index in array[i]) {
                          //    line += '"' + array[i][index] + '",';
                          // }

                            line.slice(0,line.Length-1); 
                            str += line + '\r\n';
                        }
                        canvas.append("a")
                            .attr("href", "data:text/csv;charset=utf-8," + escape(str))
                            .attr("download", true)
                            .text("Download Validation Data");
                      //window.open("data:text/csv;charset=utf-8," + escape(str), "Download")
                    }
                    DownloadJSON2CSV(full_v)
                }

              ////////////////////////////////////
              // Draw the summary table headers //
              ////////////////////////////////////			
                tab=canvas.select(".SummaryTable").append("table")
                n_groups=settings.groups.length
                header1=tab.append("thead").append("tr")

              //header for "control" column
                header1.append("th").attr("rowspan",2)

              //Category
                header1.append("th")
                    .attr("rowspan",2)
                    .text("Category")	

              //Groups
                header1.append('th')
                    .attr("colspan",n_groups)
                    .text("Groups")

                header1.append('th')
                    .text("AE Rate by group")

                header2=tab.select("thead").append("tr")
                header2.selectAll("td.values")
                .data(settings.groups)
                .enter()
                .append("th")
                    .html(function(d){return "<span>"+d.key+"</span>" +"<br><span id='group-num'>(n="+d.n+")</span>"})
                    .style("color",function(d){return table.colorScale(d.key)})
                    .attr("class","values")
                header2.append("th")
                    .attr("class","prevHeader")
                if(n_groups>1){
                    header1.append('th')
                    .text("Difference Between Groups")
                    .attr("class","diffplot")	
                    header2.append("th")
                    .attr("class","diffplot axis")	
                }
                
              /////////////////////////////////////////////
              // Set up layout and Scales for the plots //
              ////////////////////////////////////////////
              //format for 1 decimal point
                var fixed1=d3.format("0.1f")

              //plot size
                var h=15,
                    w=200,
                    margin={left:40,right:40},
                    diffMargin={left:5,right:5},
                    r=7;
                    
              //Prevalence scales
              //get the range of the values - Probably a better way to do this manipulation?
                allPercents=d3.merge(
                    data_major.map(function(major){
                        return d3.merge(major.values.map(function(minor){
                            return  d3.merge(minor.values.map(function(group){
                                return [group.values.per]
                            }))
                        }))
                    })
                )

                var percent_scale = d3.scale.linear()
                    .range([0,w])
                    .domain([0,d3.max(allPercents)]);
                
                
              // Add Prevalence Axis
                var percentAxis = d3.svg.axis()
                    .scale(percent_scale)
                    .orient("top")
                    .ticks(6);

                prevAxis=canvas.select("th.prevHeader").append("svg")
                    .attr("height","34px")
                    .attr("width",w+10)
                    .append("svg:g")
                        .attr("transform", "translate(5,34)") 		
                        .attr("class", "axis percent")
                        .call(percentAxis)
                

              //Difference Scale 
                if(settings.groups.length>1){	//Only run if there are 2+ groups
                  //Difference Scale 
                    allDiffs=d3.merge(
                        data_major.map(function(major){
                            return d3.merge(major.values.map(function(minor){
                                return  d3.merge(minor.differences.map(function(diff){
                                    return [diff.upper,diff.lower]
                                }))
                            }))
                        })
                    );

                    var minorDiffs = d3.merge(
                        data_minor.map(function(m){
                            return d3.merge(m.values.map(function(m2){
                                return d3.merge(
                                    m2.differences.map(function(m3){return d3.merge([[m3.upper], [m3.lower]]) })
                                )
                            }))
                            
                        })
                    );

                    var diff_scale= d3.scale.linear()
                        .range([diffMargin.left,w-diffMargin.right])
                        .domain(d3.extent(d3.merge([minorDiffs,allDiffs])) ); 		

                  //Difference Axis
                    var diffAxis = d3.svg.axis()
                        .scale(diff_scale)
                        .orient("top")
                        .ticks(8);

                    prevAxis=canvas.select("th.diffplot.axis").append("svg")
                        .attr("height","34px")
                        .attr("width",w+10)
                        .append("svg:g")
                            .attr("transform", "translate(5,34)") 		
                            .attr("class", "axis")
                            .attr("class","percent")
                            .call(diffAxis)
                }

              ////////////////////////////
              // Add Rows to the table //
              ////////////////////////////

              //first, check if there is actually data - if not, display warning
                if(!data_major.length){
                  // var holder_row = tab.append("tbody").append("tr");
                  // holder_row.append("td");
                    if(canvas.select(".missing-data-alert").empty()){
                        canvas.select(".SummaryTable").insert("div", "table").attr("class", "alert alert-error alert-danger missing-data-alert")
                            .text("No data found in the column specified for major category.");
                        throw new Error("No data found in the column specified for major category.");
                    }
                }

              //Append a group of rows (<tbody>) for each System Organ Class
                major_groups=tab.selectAll("tbody")
                    .data(data_major,function(d){return d.key})
                    .enter()
                    .append("tbody")
                    .attr("class","minorHidden")
                    .attr("class",function(d){return "major-"+d.key.replace(/[^A-Za-z0-9]/g, '')}) //remove non character items

              //Append a row summarizing all pref terms for each Major category
                major_rows=major_groups.selectAll("tr")
                    .data(function(d){return d.values},function(datum){return datum.key}) //data is the "all" row 
                    .enter()
                    .append("tr")
                        .attr("class","major")
                        .each(fillRow)

              //Now Append rows for each Minor Category	
              //Important note: We are violating the typical D3 pattern a bit here in that that we do *not* want to .exit().remove() the rows that we already have ...
              //link the Preferred Term Data 
                major_groups=tab.selectAll("tbody")
                .data(data_minor,function(d){return d.key})
                
                minor_rows=major_groups.selectAll("tr")
                .data(function(d){return d.values},function(datum){return datum.key}) //data is the "all" row 
                .enter()
                .append("tr")
                    .attr("class","minor")
                    .each(fillRow)	

              //add a footer for overall rates
                tab.append("tfoot")
                    .selectAll("tr")
                    .data(data_any.length>0 ? data_any[0].values : [])				
                    .enter()
                    .append("tr")
                        .each(fillRow)

              //remove unwanted elements from the footer
                tab.selectAll("tfoot svg").remove()
                tab.select("tfoot i").remove();
                tab.select("tfoot td.controls span").text("")

              // Hide the rows covering missing data (we could convert this to an option later)
                 tab.selectAll("tbody").filter(function(e){return e.key=="None/Unknown"}).classed("hidden",true)

              //////////////////////////////////////////////
              //Set up mouseover and click interactivity
              /////////////////////////////////////////////


              /////////////////////////////////////////////////////////////////////////////////////////////
              //Convenience function that shows the raw #s and annotates point values for a single group
              // row - highlighted row (selection containing a "tr")
              // group - group to highlight
              // position - "left"/"right" - controls annotation position
              /////////////////////////////////////////////////////////////////////////////////////////////

                function annoteDetails(row, group, position){
                  //add color for the selected group on all rows
                    allPoints=canvas.selectAll("td.prevplot svg g.points").filter(function(e){return e.key==group})		
                    allPoints.select("circle")
                    .attr("fill",function(d){return table.colorScale(d.key)})
                    .attr("opacity",1)

                    allVals=canvas.selectAll("td.values").filter(function(e){return e.key==group})		
                    allVals.style("color",function(d){return table.colorScale(d.key)})

                    header=canvas.selectAll("th.values").filter(function(e){return e.key==group})
                    header.style("color",function(d){return table.colorScale(d.key)})

                  //Add raw numbers for the current row
                    row.selectAll("td.values").filter(function(e){return e.key==group}).append("span.annote")
                    .classed("annote",true)
                    .text(function(d){return " ("+d["values"].n+"/"+d["values"].tot+")"})

                    row.select("td.prevplot").selectAll("g.points").filter(function(e){return e.key==group})
                    .append("svg:text")
                    .attr("x", function(d){return percent_scale(d.values["per"]) })   
                    .attr("dx", function(d){return position=="right" ? "1em" : "-1em"})   
                    .attr("y", h/2+5)
                    .attr("fill",function(d){return table.colorScale(d.values["group"])}) 
                    .attr("text-anchor", function(d){return position=="right" ? "start" : "end"})  
                    .attr("class","annote")
                    .attr("font-size","10px")
                    .style("text-shadow", "1px 1px #fff")
                    .text(function(d){return fixed1(d.values["per"])})
                }

              ////////////////////////////////////////////////
              // Mouseover/Mouseout for header columns values
              ////////////////////////////////////////////////
                canvas.selectAll(".summaryTable th.values").on("mouseover",function(d){
                  //change colors for points and values to gray
                    canvas.selectAll("td.prevplot svg g.points circle").attr("fill","#555").attr("opacity",0.1)
                    canvas.selectAll(".values").style("color","#ccc")	
                    
                  //highlight the selected group
                    annoteDetails(canvas.selectAll(".SummaryTable tr"), d.key ,"right")
                }).on("mouseout",function(d){
                  //Clear annotations
                    canvas.selectAll("td.prevplot svg g.points circle").attr("fill",function(d){return table.colorScale(d.key)}).attr("opacity",1)
                    canvas.selectAll(".values").style("color",function(d){return table.colorScale(d.key)})
                    canvas.selectAll(".annote").remove()
                })

              ///////////////////////////////////////////////
              // Mouseover/Mouseout for difference diamonds
              ///////////////////////////////////////////////
                canvas.selectAll("td.diffplot svg g path.diamond").on("mouseover",function(d){
                    currentRow=canvas.selectAll(".SummaryTable tbody tr").filter(function(e){
                        return e.values[0].values.major == d.major &&  e.values[0].values.minor == d.minor
                    });

                    sameGroups=canvas.selectAll("td.diffplot svg g").filter(function(e){
                        return e.group1==d.group1 && e.group2 == d.group2;
                    });

                  //show the CI -- this works with canvas.select but not d3.select
                    d3.select(this.parentNode).select(".ci").classed("hidden",false);

                  //highlight the points/text for the selected groups
                    annoteDetails(currentRow, d.group1, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? "right" : "left");
                    annoteDetails(currentRow, d.group2, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? "left" : "right");

                }).on("mouseout",function(d){
                  //restore the other points
                    canvas.selectAll("td.diffplot svg g").selectAll("path")
                    .attr("fill-opacity",function(d){return (d.sig==1) ? 1 : 0.1})
                    .attr("stroke-opacity", 0.3)


                  //hide the CI (for 3 groups)
                    if (settings.groups.length==3){
                        d3.select(this.parentNode).select(".ci").classed("hidden",true)
                    }
                  //Restore the percentage colors
                    canvas.selectAll("td.prevplot svg g.points circle").attr("fill",function(d){return table.colorScale(d.key)}).attr("opacity",1)
                    canvas.selectAll(".values").style("color",function(d){return table.colorScale(d.key)})
                  //Delete annotations
                    canvas.selectAll(".annote").remove()
                })

              //////////////////////////////////
              // Click Control for table rows //
              //////////////////////////////////
              //make controls visible on mouseover
                canvas.selectAll(".SummaryTable tr")
                    .on("mouseover",function(d){
                        d3.select(this).select("td.rowLabel").classed("highlight",true)
                    })
                    .on("mouseout",function(d){
                        d3.select(this).select("td.rowLabel").classed("highlight",false)
                    });

              // Expand/collapse a section 
                canvas.selectAll("tr.major").selectAll("td.controls").on("click",function(d){
                    var current = d3.select(this.parentNode.parentNode);
                    var toggle = !(current.classed("minorHidden")) // True if we want to show the minor rows, false if we want to remove them. 
                    if(toggle){
                        current.classed("minorHidden", true)
                    }else{
                        current.classed("minorHidden", false)
                    }
                    d3.select(this).select("span").text(function(){return toggle ? '+':'-'});
                });

              ///////////////////////////
              // Show the details table
              ///////////////////////////
                canvas.selectAll("td.rowLabel").on("click",function(d) {
                  //Update classes (row visibility handeled via css)
                    toggle=!(canvas.select(".SummaryTable table").classed("summary")) // True if we want to draw the participant table, false if we want to remove it. 
                    canvas.select(".SummaryTable table").classed("summary",toggle)
                    canvas.select("div.controls").classed("hidden",toggle)				

                  //create/remove the participant level table		
                    if(toggle){
                        major=d.values[0].values["major"]
                        minor=d.values[0].values["minor"]
                        table.detailTable(
                            canvas,
                            data,
                            vars,
                            {detailTable:{"major":major,"minor":minor}}
                        )
                    }else{
                        canvas.select(".DetailTable").remove()
                        canvas.select("div.closeDetailTable").remove()
                    }
                })
            }, //end AETable.init()
        

            eventListeners: function(data, vars, settings){
            },

            toggleRows: function(canvas){
              ///////////////////////////////////
              // Apply basic Filters & Toggles //
              ///////////////////////////////////
              //Toggle Minor rows
                var minorToggle = true;//canvas.select("a.toggleRows").text() === "Show all nested rows"
                canvas.selectAll(".SummaryTable tbody").classed("minorHidden", minorToggle)
                canvas.selectAll(".SummaryTable table tbody").select("tr.major td.controls span")
                    .text(minorToggle ? "+":"-")


              //Toggle Difference plots
                var differenceToggle = false;//canvas.select("a.toggleDiff").text() === "Show difference column"
                canvas.selectAll(".SummaryTable .diffplot").classed("hidden", differenceToggle)


              // Filter based on Prevalence
                var filterVal=canvas.select("div.controls input.rateFilter").property("value")
                canvas.selectAll("div.SummaryTable table tbody").each(function(d){
                    var allRows = d3.select(this).selectAll("tr")
                    var filterRows = allRows.filter(function(d){
                        var maxVal= d3.max(d.values.map(function(element){return element.values.per}))	
                        return maxVal < filterVal
                    })
                    filterRows.classed("filter","true")
                    var currentBody=d3.select(this);

                  // show/hide arrows
                    currentBody.select("tr.major td.controls span").classed("hidden",
                        filterRows[0].length + 1 >= allRows[0].length
                    )
            
                })
            },
        }, //end AETable

        detailTable: function(canvas, data, vars, settings){
            var major = settings.detailTable.major;
            var minor = settings.detailTable.minor;

          // Filter the raw data set based on the major and minor categories
            var details=data.filter(function(e){
                majorMatch= major==="All" ? true : (major===e[vars["major"]])
                minorMatch= minor==="All" ? true : (minor===e[vars["minor"]])
                return majorMatch && minorMatch;
            });

            if (vars.details.length === 0) {
                vars.details = Object.keys(data[0])
                    .filter(function(d) {
                        return ['data_all', 'flag'].indexOf(d) === -1;
                    });
            }

          //subset to the selected columns
            var detailVars = vars.details;
            details = details.map(function(e) {
                current={};
                detailVars.forEach(function(currentVar){
                    current[currentVar] = e[currentVar]
                })
                return current;
            })

            canvas.select("div.table-wrapper").append("div").attr("class","DetailTable");//.attr("class","span10")
            
          //button to close return to standard view
            closeButton=canvas.select("div.DetailTable").append("button")
                .attr("class","closeDetailTable btn btn-primary");

            closeButton.html("<i class='icon-backward icon-white fa fa-backward'></i>    Return to the Summary View");
            
            closeButton.on("click",function(){
                canvas.select(".SummaryTable table").classed("summary",false);
                canvas.select("div.controls").classed("hidden",false);
                canvas.selectAll(".SummaryTable table tbody tr").classed("active",false);
                canvas.select(".DetailTable").remove();
                canvas.select("button.closeDetailTable").remove();
            });

          // Header
            canvas.select(".DetailTable").append("h4").
                html(minor=="All"? "Details for "+details.length+" <b>"+major+"</b> records" : "Details for "+details.length+" <b>"+minor+" ("+major+")</b> records" )

          //function to make table - taken from basicTable.js
            function basicTable(element, predata){ //REQUIRED
                var canvas = d3.select(element)
                var wrapper=canvas.append("div").attr("class","ig-basicTable") //REQUIRED

                function transform(data){
                    var colList = d3.keys(data[0]);
                    var subCols = data.map(function(e){
                        var current = {}
                        colList.forEach(function(colName){current[colName]=e[colName]})
                        return current;
                    }) 
                    var rowStart = 0
                    var rowCount = data.length 
                    var subRows = subCols.slice(rowStart, rowStart+rowCount)
                    return subRows
                };

                var sub=transform(predata)
                draw(canvas,sub);

                function draw(canvas, data){
                  //add table
                    var table = canvas.select("div.ig-basicTable").insert("table", "button").attr("class","table").datum(settings) 

                    headerRow = table.append("thead").append("tr")
                    headerRow.selectAll("th").data(d3.keys(data[0])).enter().append("th").html(function(d){return d});

                  //add table rows (1 per svg row)
                    var tbody = table.append("tbody")
                    var rows = tbody.selectAll("tr").data(data).enter().append("tr")

                  //add columns (once per row)
                    var cols = rows.selectAll("tr")
                        .data(function(d){return d3.values(d)})
                        .enter()
                        .append("td")
                        .html(function(d){return d});

                  // $(table.node()).dataTable();
                };
            }
            basicTable(".DetailTable", details);	
        }
    }

    var aeTable = table;

    return aeTable;
     
}));
