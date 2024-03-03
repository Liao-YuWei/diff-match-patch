function render(diffArr) {
    d3.select('#svgResult svg').remove(); // 刪除前一次建立的圖表

    const boxWidth = 100, boxHeight = 50;
    const boxHorizontalPadding = 100, boxVerticalPadding = 25;

    const rwdSvgWidth = parseInt(d3.select('#svgResult').style('width')),
        rwdSvgHeight = diffArr.length * (boxHeight + boxVerticalPadding);
    
    const svg = d3.select('#svgResult')
        .append('svg')
        .attr('width', rwdSvgWidth)
        .attr('height', rwdSvgHeight);

    var outerG = svg.append("g")
        .attr("transform", `translate(${rwdSvgWidth / 2}, 0)`);

    var boxEnter = outerG.selectAll("g").data(diffArr)
        .enter().append("g");

    boxEnter
        .attr("transform", function(d, i) {
            switch(d.type) {
                case "equal":
                    return  `translate(${-boxWidth / 2}, ${i * (boxHeight + boxVerticalPadding)})`;
                case "delete":
                    return  `translate(${-boxWidth / 2 - boxHorizontalPadding}, ${i * (boxHeight + boxVerticalPadding)})`;
                case "insert":
                    return  `translate(${-boxWidth / 2 + boxHorizontalPadding}, ${i * (boxHeight + boxVerticalPadding)})`;
            }
        });

    boxEnter.append("rect")
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("class", d =>`box ${d.type}`);

    boxEnter.append("text")
        .attr("x", boxWidth / 2)
        .attr("y", boxHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(d => d.block)
        .attr("class", d =>`boxtext ${d.type}`);

    const boxShift = 50;
    outerG.selectAll("g")
        .filter(function(d) {
            return d.type === "delete";
        })
        .attr("dx", boxShift);

    window.addEventListener("resize", handleResize);
}


function handleResize() {
    const rwdSvgWidth = parseInt(d3.select('#svgResult').style('width'));
    d3.select("#svgResult svg")
        .attr("width", rwdSvgWidth);
    d3.select("#svgResult svg g")
        .attr("transform", `translate(${rwdSvgWidth / 2}, 0)`);
}