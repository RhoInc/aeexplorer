export function layout(canvas) {
    const wrapper = canvas
        .append("div").attr("class","ig-aetable row-fluid")
        .append("div").attr("class","table-wrapper");
    wrapper.append("div").attr("class","controls form-inline row-fluid");
    wrapper.append("div").attr("class","SummaryTable");
}