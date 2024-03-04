function render(diffArr) {
    d3.select('#svgResult svg').remove(); // 刪除前一次建立的圖表

    const boxWidth = 600, boxHeight = 50;
    const boxVerticalPadding = 25;

    const rwdSvgWidth = parseInt(d3.select('#svgResult').style('width')),
        rwdSvgHeight = diffArr.length * (boxHeight + boxVerticalPadding);
    
    const boxHorizontalPadding = rwdSvgWidth * 0.4;
    
    const svg = d3.select('#svgResult')
        .append('svg')
        .attr('width', rwdSvgWidth)
        .attr('height', rwdSvgHeight);

    var outerG = svg.append("g")
        .attr("transform", `translate(${rwdSvgWidth / 2}, 0)`);

    var boxEnter = outerG.selectAll("g").data(diffArr)
        .enter().append("g");

    // Define arrow head
    svg.append("svg:defs").append("svg:marker")
        .attr("id", "arrow")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "black");

    boxEnter
        .attr("transform", function(d, i) {
            switch(d.type) {
                case "equal":
                    return  `translate(0, ${i * (boxHeight + boxVerticalPadding)})`;
                case "delete":
                    return  `translate(${-boxHorizontalPadding}, ${i * (boxHeight + boxVerticalPadding)})`;
                case "insert":
                    return  `translate(${boxHorizontalPadding}, ${i * (boxHeight + boxVerticalPadding)})`;
            }
        });
    
    var textWidth = [];
    boxEnter.append("text")
        // .attr("transform",function(d,i) { 
        //     return `translate(${this.getComputedTextLength() / 2}, 0)`
        // })
        .text(d => d.block)
        // .attr("x", function(d,i) { 
        //     return `${-textWidth[i] / 2}` 
        // })
        .attr("y", boxHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("class", d =>`boxtext ${d.type}`)
        .each(function(d,i) {
            textWidth.push(this.getComputedTextLength() + 30);
        });

    // console.log(textWidth);

    boxEnter.insert("rect", "text")
        .attr("width", (d, i) => `${textWidth[i]}`)
        .attr("height", boxHeight)
        .attr("class", d => `box ${d.type}`)
        .attr("transform",function(d,i) { 
                return `translate(${-textWidth[i] / 2}, 0)`
        });

    // const boxShift = 50;
    // outerG.selectAll("g")
    //     .filter(function(d) {
    //         return d.type === "delete";
    //     })
    //     .attr("dx", boxShift);
    
    var unfinishedSource = false, redChain = false, greenChain = false;
    // var lastIsBlack = (diffArr[0].type === 'equal') ? true : false;
    var lastRedId, lastGreenId;
    var blocks = d3.selectAll("#svgResult svg g rect").nodes();
    const gHeight = boxHeight + boxVerticalPadding;
    for (let i = 1; i < diffArr.length; i++) {
        switch(diffArr[i].type) {
            case 'equal':
                if(redChain || greenChain) {
                    if(redChain)
                        drawArrow(outerG, -boxHorizontalPadding, gHeight * lastRedId + boxHeight, 0, gHeight * i);
                    if(greenChain)
                        drawArrow(outerG, boxHorizontalPadding, gHeight * lastGreenId + boxHeight, 0, gHeight * i);
                }
                else {
                    drawArrow(outerG, 0, gHeight * i - boxVerticalPadding, 0, gHeight * i);
                }
                lastIsBlack = true;
                break;

            case 'delete':
                
                lastIsBlack = false;
                break;
            
            case 'insert':

                lastIsBlack = false;
                break;

        }
    }
    
    // let bounding_1 = blocks[1].getBoundingClientRect();
    // let bounding_3 = blocks[3].getBoundingClientRect();
    // console.log(bounding_1.left, bounding_1.bottom, bounding_3.right, bounding_3.top)

    // drawArrow(outerG, bounding_1.left, bounding_1.bottom, bounding_3.right, bounding_3.top);
    // drawArrow(outerG, 0, 50, -boxHorizontalPadding, 75);
    // console.log(d3.selectAll("#svgResult svg g rect").nodes()[1].getBoundingClientRect());
    
    // svg.append('line')
    //     .attr('x1', 100)
    //     .attr('y1', 100)
    //     .attr('x2', 150)     
    //     .attr('y2', 300)
    //     .attr('stroke', 'blue')
    //     .attr('marker-end', 'url(#arrow)');

    window.addEventListener("resize", handleResize);
}


function handleResize() {
    const rwdSvgWidth = parseInt(d3.select('#svgResult').style('width'));
    d3.select("#svgResult svg")
        .attr("width", rwdSvgWidth);
    d3.select("#svgResult svg g")
        .attr("transform", `translate(${rwdSvgWidth / 2}, 0)`);
}

function drawArrow(outerG, x1, y1, x2, y2) {
    outerG.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)     
        .attr('y2', y2)
        .attr('stroke', 'blue')
        .attr('marker-end', 'url(#arrow)');
}