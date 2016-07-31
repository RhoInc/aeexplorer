export const AETable = {
  ////////////////////////////////////////////////
  //Clear the current table and draw a new one
  ////////////////////////////////////////////////
    redraw: function(canvas, data, vars, settings) {
        table.controls.search.clear(canvas) //Reset the search bar
        table.AETable.wipe(canvas) //clear previous tables
        var data_filtered = table.AETable.prepareData(canvas, data,vars,settings) //get the data ready
        table.AETable.init(canvas, data_filtered, vars, settings) // draw the table
        table.AETable.toggleRows(canvas) //show/hide table rows as needed
    },

  ////////////////////////////////////////////////////////////////////
  //Clears the summary or detail table (and all associated buttons)
  ////////////////////////////////////////////////////////////////////
    wipe: function(canvas) {
        canvas.select(".table-wrapper .SummaryTable table").remove()
        canvas.select(".table-wrapper .SummaryTable button").remove()
        canvas.select(".table-wrapper .DetailTable").remove()
        canvas.select(".table-wrapper .DetailTable").remove()
    },

  ///////////////////////////////////////////////////////////////////
  //	Filter the raw data according to the filter and group selections
  ///////////////////////////////////////////////////////////////////
    prepareData: function(canvas, data,vars,settings) {

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
    },

  ///////////////////////////////////////////////////////////////
  // Call functions to collapse the raw data using the selected 
  // categories and create the summary table
  ///////////////////////////////////////////////////////////////
    init: function(canvas, data, vars, settings) {

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

        function fillRow(d) {
          // Cell with row "controls"
            var controlCell=d3.select(this).append("td").attr("class","controls")
            if(d.key=="All") {
                controlCell.append("span")
                .text(function() {
                    var toggle = true//canvas.select("a.toggleRows").text() == "Show all nested rows"
                    return toggle ? "+" : "-"
                })
            }

          // Cell with Label (System Organ Class or Preferred term name)
            d3.select(this).append("td").attr("class","rowLabel").append("a")
            .text(function(rowvalues) {return rowvalues.values[0].values["label"]}) 

          // Append Cells with rates and ns
            var values=d3.select(this).selectAll("td.values") //Add a cell for every group (regardless of if there is an AE)
                .data(d.values,function(d) {return d.key})
                .enter()
                .append("td")
                .attr("class","values")
                .text(function(d) {return fixed1(d["values"].per)+"%"})
              //+ ") "<span class='vals'><sup>"+d["values"].n+"</sup>&frasl;<sub>"+d["values"].tot+"</sub></span>"})
                .style("color",function(d) {return table.colorScale(d.key)})


          //Cell with Prevalence Plot
            var prev_plot=d3.select(this).append("td").classed("prevplot",true)
                .append("svg")
                .attr("height",h)
                .attr("width",w+10)
                .append("svg:g")
                    .attr("transform", "translate(5,0)")

            var points=prev_plot.selectAll("g.points")
            .data(d.values)
            .enter()
            .append("g")
            .attr("class","points")

            points
            .append("svg:circle")
                .attr("cx", function(d) {return percent_scale(d.values["per"])})
                .attr("cy", h/2)
                .attr("r",r-2)
                .attr("fill",function(d) {return table.colorScale(d.values["group"])})

          //Cells with Difference plots 
            if(settings.groups.length>1) {

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
                    .attr("x1", function(d) {return diff_scale(d.upper); })
                    .attr("x2", function(d) {return diff_scale(d.lower); })
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
                        var leftpoints = [
                            {x:diff_scale(d.diff)   ,y:h/2+r},//bottom
                            {x:diff_scale(d.diff)-r ,y:h/2},//middle-left
                            {x:diff_scale(d.diff)   ,y:h/2-r},//top
                            ];
                        return triangle(leftpoints); 
                    })
                    .attr("class","diamond")
                    .attr("fill-opacity",function(d) {return (d.sig==1) ? 1 : 0.1})
                    .attr("fill",function(d) {return d.diff<0 ? table.colorScale(d.group1) : table.colorScale(d.group2)})
                    .attr("stroke",function(d) {return d.diff<0 ? table.colorScale(d.group1) : table.colorScale(d.group2)})
                    .attr("stroke-opacity",0.3)

                diffpoints
                .append("svg:path")
                    .attr("d", function(d) { 
                        var rightpoints = [
                            {x:diff_scale(d.diff)   ,y:h/2+r},//bottom
                            {x:diff_scale(d.diff)+r ,y:h/2},//middle-right
                            {x:diff_scale(d.diff)   ,y:h/2-r},//top
                            ];
                        return triangle(rightpoints); 
                    })
                    .attr("class","diamond")
                    .attr("fill-opacity",function(d) {return (d.sig==1) ? 1 : 0.1})
                    .attr("fill",function(d) {return d.diff<0 ? table.colorScale(d.group2) : table.colorScale(d.group1) })
                    .attr("stroke",function(d) {return d.diff<0 ? table.colorScale(d.group2) : table.colorScale(d.group1)})
                    .attr("stroke-opacity",0.3)
            }
        } //end fillRow


      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //Create 1 nested data set each at System Organ Class and preferred term level with group-level prevalence data//
      ///////////////////////////////////////////////////////	/////////////////////////////////////////////////////////
        var data_major=util.cross(data, settings.groups, vars["id"], vars["major"], "All",         vars["group"], settings.groups)
        var data_minor=util.cross(data, settings.groups, vars["id"], vars["major"], vars["minor"], vars["group"], settings.groups)
        var sub = data.filter(function(e) {return e.flag==0}) //subset so that the total column ignores missing values
        var data_any=  util.cross(sub, settings.groups, vars["id"], "All"        , "All",         vars["group"], settings.groups)

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
        data_minor.forEach(function(major) {
            major.values.sort(function(a,b) {
                var max_a= d3.max(
                    a.values.map(function(groups) {
                        return groups.values.per
                    })
                )

                var max_b= d3.max(
                    b.values.map(function(groups) {
                        return groups.values.per
                    })
                )

                return max_a < max_b ? 1 : -1
            })
        })

      ////////////////////////////////////////////////////////////
      //	Output the data if the validation setting is flagged//
      ////////////////////////////////////////////////////////////
        if (settings.validation) {
            var collapse = function(nested) {
              //Parse nested object into a flat object
                var flat = nested.map(function(soc) {
                    var allRows=soc.values.map(function(e) {	
                        var e_flat = {}
                        e_flat.cat_main='"'+e.values[0].values.major+'"';
                        e_flat.cat_sub ='"'+e.values[0].values.minor+'"';
                        e.values.forEach(function(val,i) {
                            var n=i+1;
                            e_flat["val"+n+"_label"]=val.key;
                            e_flat["val"+n+"_numerator"]=val.values.n;
                            e_flat["val"+n+"_denominator"]=val.values.tot;
                            e_flat["val"+n+"_percent"]=val.values.per;
                        });
                        if(e.differences) {
                            e.differences.forEach(function(diff,i) {
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
                .sort(function(a,b) {return a.cat_sub < b.cat_sub ? -1 : 1})
                .sort(function(a,b) {return a.cat_main < b.cat_main ? -1 : 1})

          //Function from http://stackoverflow.com/questions/4130849/convert-json-format-to-csv-format-for-ms-excel
              function DownloadJSON2CSV(objArray) {
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
        var tab=canvas.select(".SummaryTable").append("table")
        var n_groups=settings.groups.length
        var header1=tab.append("thead").append("tr")

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

        var header2=tab.select("thead").append("tr")
        header2.selectAll("td.values")
        .data(settings.groups)
        .enter()
        .append("th")
            .html(function(d) {return "<span>"+d.key+"</span>" +"<br><span id='group-num'>(n="+d.n+")</span>"})
            .style("color",function(d) {return table.colorScale(d.key)})
            .attr("class","values")
        header2.append("th")
            .attr("class","prevHeader")
        if(n_groups>1) {
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
        var allPercents=d3.merge(
            data_major.map(function(major) {
                return d3.merge(major.values.map(function(minor) {
                    return  d3.merge(minor.values.map(function(group) {
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

        var prevAxis=canvas.select("th.prevHeader").append("svg")
            .attr("height","34px")
            .attr("width",w+10)
            .append("svg:g")
                .attr("transform", "translate(5,34)") 		
                .attr("class", "axis percent")
                .call(percentAxis)
        

      //Difference Scale 
        if(settings.groups.length>1) {	//Only run if there are 2+ groups
          //Difference Scale 
            var allDiffs=d3.merge(
                data_major.map(function(major) {
                    return d3.merge(major.values.map(function(minor) {
                        return  d3.merge(minor.differences.map(function(diff) {
                            return [diff.upper,diff.lower]
                        }))
                    }))
                })
            );

            var minorDiffs = d3.merge(
                data_minor.map(function(m) {
                    return d3.merge(m.values.map(function(m2) {
                        return d3.merge(
                            m2.differences.map(function(m3) {return d3.merge([[m3.upper], [m3.lower]]) })
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

            var prevAxis=canvas.select("th.diffplot.axis").append("svg")
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
        if(!data_major.length) {
          // var holder_row = tab.append("tbody").append("tr");
          // holder_row.append("td");
            if(canvas.select(".missing-data-alert").empty()) {
                canvas.select(".SummaryTable").insert("div", "table").attr("class", "alert alert-error alert-danger missing-data-alert")
                    .text("No data found in the column specified for major category.");
                throw new Error("No data found in the column specified for major category.");
            }
        }

      //Append a group of rows (<tbody>) for each System Organ Class
        var major_groups=tab.selectAll("tbody")
            .data(data_major,function(d) {return d.key})
            .enter()
            .append("tbody")
            .attr("class","minorHidden")
            .attr("class",function(d) {return "major-"+d.key.replace(/[^A-Za-z0-9]/g, '')}) //remove non character items

      //Append a row summarizing all pref terms for each Major category
        var major_rows=major_groups.selectAll("tr")
            .data(function(d) {return d.values},function(datum) {return datum.key}) //data is the "all" row 
            .enter()
            .append("tr")
                .attr("class","major")
                .each(fillRow)

      //Now Append rows for each Minor Category	
      //Important note: We are violating the typical D3 pattern a bit here in that that we do *not* want to .exit().remove() the rows that we already have ...
      //link the Preferred Term Data 
        var major_groups=tab.selectAll("tbody")
        .data(data_minor,function(d) {return d.key})
        
        var minor_rows=major_groups.selectAll("tr")
        .data(function(d) {return d.values},function(datum) {return datum.key}) //data is the "all" row 
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
         tab.selectAll("tbody").filter(function(e) {return e.key=="None/Unknown"}).classed("hidden",true)

      //////////////////////////////////////////////
      //Set up mouseover and click interactivity
      /////////////////////////////////////////////


      /////////////////////////////////////////////////////////////////////////////////////////////
      //Convenience function that shows the raw #s and annotates point values for a single group
      // row - highlighted row (selection containing a "tr")
      // group - group to highlight
      // position - "left"/"right" - controls annotation position
      /////////////////////////////////////////////////////////////////////////////////////////////

        function annoteDetails(row, group, position) {
          //add color for the selected group on all rows
            var allPoints=canvas.selectAll("td.prevplot svg g.points").filter(function(e) {return e.key==group})		
            allPoints.select("circle")
            .attr("fill",function(d) {return table.colorScale(d.key)})
            .attr("opacity",1)

            var allVals=canvas.selectAll("td.values").filter(function(e) {return e.key==group})		
            allVals.style("color",function(d) {return table.colorScale(d.key)})

            var header=canvas.selectAll("th.values").filter(function(e) {return e.key==group})
            header.style("color",function(d) {return table.colorScale(d.key)})

          //Add raw numbers for the current row
            row.selectAll("td.values").filter(function(e) {return e.key==group}).append("span.annote")
            .classed("annote",true)
            .text(function(d) {return " ("+d["values"].n+"/"+d["values"].tot+")"})

            row.select("td.prevplot").selectAll("g.points").filter(function(e) {return e.key==group})
            .append("svg:text")
            .attr("x", function(d) {return percent_scale(d.values["per"]) })   
            .attr("dx", function(d) {return position=="right" ? "1em" : "-1em"})   
            .attr("y", h/2+5)
            .attr("fill",function(d) {return table.colorScale(d.values["group"])}) 
            .attr("text-anchor", function(d) {return position=="right" ? "start" : "end"})  
            .attr("class","annote")
            .attr("font-size","10px")
            .style("text-shadow", "1px 1px #fff")
            .text(function(d) {return fixed1(d.values["per"])})
        }

      ////////////////////////////////////////////////
      // Mouseover/Mouseout for header columns values
      ////////////////////////////////////////////////
        canvas.selectAll(".summaryTable th.values").on("mouseover",function(d) {
          //change colors for points and values to gray
            canvas.selectAll("td.prevplot svg g.points circle").attr("fill","#555").attr("opacity",0.1)
            canvas.selectAll(".values").style("color","#ccc")	
            
          //highlight the selected group
            annoteDetails(canvas.selectAll(".SummaryTable tr"), d.key ,"right")
        }).on("mouseout",function(d) {
          //Clear annotations
            canvas.selectAll("td.prevplot svg g.points circle").attr("fill",function(d) {return table.colorScale(d.key)}).attr("opacity",1)
            canvas.selectAll(".values").style("color",function(d) {return table.colorScale(d.key)})
            canvas.selectAll(".annote").remove()
        })

      ///////////////////////////////////////////////
      // Mouseover/Mouseout for difference diamonds
      ///////////////////////////////////////////////
        canvas.selectAll("td.diffplot svg g path.diamond").on("mouseover",function(d) {
            var currentRow=canvas.selectAll(".SummaryTable tbody tr").filter(function(e) {
                return e.values[0].values.major == d.major &&  e.values[0].values.minor == d.minor
            });

            var sameGroups=canvas.selectAll("td.diffplot svg g").filter(function(e) {
                return e.group1==d.group1 && e.group2 == d.group2;
            });

          //show the CI -- this works with canvas.select but not d3.select
            d3.select(this.parentNode).select(".ci").classed("hidden",false);

          //highlight the points/text for the selected groups
            annoteDetails(currentRow, d.group1, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? "right" : "left");
            annoteDetails(currentRow, d.group2, ((d.n1/d.tot1) > (d.n2/d.tot2)) ? "left" : "right");

        }).on("mouseout",function(d) {
          //restore the other points
            canvas.selectAll("td.diffplot svg g").selectAll("path")
            .attr("fill-opacity",function(d) {return (d.sig==1) ? 1 : 0.1})
            .attr("stroke-opacity", 0.3)


          //hide the CI (for 3 groups)
            if (settings.groups.length==3) {
                d3.select(this.parentNode).select(".ci").classed("hidden",true)
            }
          //Restore the percentage colors
            canvas.selectAll("td.prevplot svg g.points circle").attr("fill",function(d) {return table.colorScale(d.key)}).attr("opacity",1)
            canvas.selectAll(".values").style("color",function(d) {return table.colorScale(d.key)})
          //Delete annotations
            canvas.selectAll(".annote").remove()
        })

      //////////////////////////////////
      // Click Control for table rows //
      //////////////////////////////////
      //make controls visible on mouseover
        canvas.selectAll(".SummaryTable tr")
            .on("mouseover",function(d) {
                d3.select(this).select("td.rowLabel").classed("highlight",true)
            })
            .on("mouseout",function(d) {
                d3.select(this).select("td.rowLabel").classed("highlight",false)
            });

      // Expand/collapse a section 
        canvas.selectAll("tr.major").selectAll("td.controls").on("click",function(d) {
            var current = d3.select(this.parentNode.parentNode);
            var toggle = !(current.classed("minorHidden")) // True if we want to show the minor rows, false if we want to remove them. 
            if(toggle) {
                current.classed("minorHidden", true)
            }else{
                current.classed("minorHidden", false)
            }
            d3.select(this).select("span").text(function() {return toggle ? '+':'-'});
        });

      ///////////////////////////
      // Show the details table
      ///////////////////////////
        canvas.selectAll("td.rowLabel").on("click",function(d) {
          //Update classes (row visibility handeled via css)
            var toggle=!(canvas.select(".SummaryTable table").classed("summary")) // True if we want to draw the participant table, false if we want to remove it. 
            canvas.select(".SummaryTable table").classed("summary",toggle)
            canvas.select("div.controls").classed("hidden",toggle)				

          //create/remove the participant level table		
            if(toggle) {
                var major=d.values[0].values["major"]
                var minor=d.values[0].values["minor"]
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

    eventListeners: function(data, vars, settings) {
    },

    toggleRows: function(canvas) {
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
        canvas.selectAll("div.SummaryTable table tbody").each(function(d) {
            var allRows = d3.select(this).selectAll("tr")
            var filterRows = allRows.filter(function(d) {
                var maxVal= d3.max(d.values.map(function(element) {return element.values.per}))	
                return maxVal < filterVal
            })
            filterRows.classed("filter","true")
            var currentBody=d3.select(this);

          // show/hide arrows
            currentBody.select("tr.major td.controls span").classed("hidden",
                filterRows[0].length + 1 >= allRows[0].length
            )
    
        })
    }
}
