export function detailTable(canvas, data, vars, settings) {
    const major = settings.detailTable.major;
    const minor = settings.detailTable.minor;

  //Filter the raw data set based on the major and minor categories
    const details = data.filter(function(e) {
        majorMatch = major === "All" ? true : (major === e[vars["major"]]);
        minorMatch = minor === "All" ? true : (minor === e[vars["minor"]]);
        return majorMatch && minorMatch;
    });

    if (vars.details.length === 0) {
        vars.details = Object.keys(data[0])
            .filter(function(d) {
                return ['data_all', 'flag'].indexOf(d) === -1;
            });
    }

  //subset to the selected columns
    const detailVars = vars.details
        .map(function(e) {
            current = {};
            detailVars.forEach(function(currentVar) {
                current[currentVar] = e[currentVar];
            })
            return current;
        });

    canvas.select("div.table-wrapper").append("div").attr("class","DetailTable");
    
  //button to close return to standard view
    closeButton = canvas.select("div.DetailTable").append("button")
        .attr("class","closeDetailTable btn btn-primary");

    closeButton.html("<i class='icon-backward icon-white fa fa-backward'></i>    Return to the Summary View");
    
    closeButton.on("click",function() {
        canvas.select(".SummaryTable table").classed("summary",false);
        canvas.select("div.controls").classed("hidden",false);
        canvas.selectAll(".SummaryTable table tbody tr").classed("active",false);
        canvas.select(".DetailTable").remove();
        canvas.select("button.closeDetailTable").remove();
    });

  // Header
    canvas.select(".DetailTable").append("h4").
        html(minor=="All"? "Details for "+details.length+" <b>"+major+"</b> records" : "Details for "+details.length+" <b>"+minor+" ("+major+")</b> records" );

  //function to make table - taken from basicTable.js
    function basicTable(element, predata) { //REQUIRED
        const canvas = d3.select(element)
        const wrapper = canvas.append("div").attr("class","ig-basicTable") //REQUIRED

        function transform(data) {
            const colList = d3.keys(data[0]);

            const subCols = data.map(function(e) {
                const current = {};
                colList.forEach(function(colName) {
                    current[colName] = e[colName];
                });
                return current;
            }) 

            const rowStart = 0;
            const rowCount = data.length ;
            const subRows = subCols.slice(rowStart, rowStart+rowCount);

            return subRows;
        };

        const sub = transform(predata);
        draw(canvas,sub);

        function draw(canvas, data) {
          //add table
            const table = canvas.select("div.ig-basicTable")
                .insert("table", "button")
                .attr("class","table")
                .datum(settings);

            headerRow = table.append("thead").append("tr");
            headerRow.selectAll("th")
                .data(d3.keys(data[0]))
                .enter()
                .append("th").html(function(d) { return d; });

          //add table rows (1 per svg row)
            const tbody = table.append("tbody");
            const rows = tbody.selectAll("tr").data(data).enter().append("tr");

          //add columns (once per row)
            const cols = rows.selectAll("tr")
                .data(function(d) { return d3.values(d); })
                .enter()
                .append("td")
                .html(function(d) { return d; });
        };
    }
    basicTable(".DetailTable", details);	
}
