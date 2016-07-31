export function init(canvas, data, settings, onDataError) {
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

    for (var x in settings.variables) {
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
    table.eventListeners.search(canvas, data, settings.variables, settings)
    table.eventListeners.customFilters(canvas, data, settings.variables, settings)

  //Draw the table (remove previous if any)
    table.AETable.redraw(canvas, data, settings.variables, settings)
}
