const boxHeight = 50;
const boxVerticalPadding = 25;

function render(diffArr) {
    d3.select('#svgResult svg').remove(); // 刪除前一次建立的圖表

    const rwdSvgWidth = parseInt(d3.select('#svgResult').style('width')),
        rwdSvgHeight = diffArr.length * (boxHeight + boxVerticalPadding);
    
    const boxHorizontalPadding = rwdSvgWidth * 0.1;
    
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
        .attr("id", "black-arrow")
        .attr("refX", 2)
        .attr("refY", 2)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 4 2 0 4 1 2")
        .style("fill", "black");

    svg.append("svg:defs").append("svg:marker")
        .attr("id", "red-arrow")
        .attr("refX", 2)
        .attr("refY", 2)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 4 2 0 4 1 2")
        .style("fill", "red");

    svg.append("svg:defs").append("svg:marker")
        .attr("id", "green-arrow")
        .attr("refX", 2)
        .attr("refY", 2)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 4 2 0 4 1 2")
        .style("fill", "green");

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
        .text(d => d.block)
        .attr("y", boxHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("class", d =>`boxtext ${d.type}`)
        .each(function(d,i) {
            textWidth.push(this.getComputedTextLength() + 30);
        });

    boxEnter.insert("rect", "text")
        .attr("width", (d, i) => `${textWidth[i]}`)
        .attr("height", boxHeight)
        .attr("class", d => `box ${d.type}`)
        .attr("transform",function(d,i) { 
                return `translate(${-textWidth[i] / 2}, 0)`
        });
    
    var redChain = false, greenChain = false;
    // var lastIsBlack = (diffArr[0].type === 'equal') ? true : false;
    var lastBlackId = 0, lastRedId = 0, lastGreenId = 0;
    if(diffArr[0].type === 'delete') {
        redChain = true;
        lastBlackId = -1;
    } 
    else if(diffArr[0].type === 'insert') {
        greenChain = true;
        lastBlackId = -1;
    }
    const gHeight = boxHeight + boxVerticalPadding;
    const blackX = 0, redX = -boxHorizontalPadding, greenX = boxHorizontalPadding;
    const pathShift = 5;
    for (let i = 1; i < diffArr.length; i++) {
        switch(diffArr[i].type) {
            case 'equal':
                if(redChain || greenChain) {
                    // From red to black
                    if(redChain) {
                        drawArrow(outerG, redX, gHeight * lastRedId + boxHeight, blackX - pathShift, gHeight * i, 'red', 1);
                        redChain = false;
                    }
                    // From green to black
                    if(greenChain) {
                        drawArrow(outerG, greenX, gHeight * lastGreenId + boxHeight, blackX + pathShift, gHeight * i, 'green', 2);
                        greenChain = false;
                    }
                }
                // From black to black
                else {
                    drawArrow(outerG, blackX, gHeight * i - boxVerticalPadding, blackX, gHeight * i, 'black', 3);
                }
                lastBlackId = i;
                break;

            case 'delete':
                // From red to red
                if(redChain) {   
                    drawArrow(outerG, redX, gHeight * (lastRedId + 1) - boxVerticalPadding, redX, gHeight * i, 'red', 4);
                }
                // From black to red
                else {
                    if(lastBlackId !== -1) {
                        drawArrow(outerG, blackX - pathShift, gHeight * (lastBlackId + 1) - boxVerticalPadding, redX, gHeight * i, 'red', 5);
                        lastBlackId = i - 1;    // Store last black id for the following green chain that may appear
                    }
                    redChain = true;
                }
                lastRedId = i;
                break;
            
            case 'insert':
                // From green to green
                if(greenChain) {
                    drawArrow(outerG, greenX, gHeight * (lastGreenId + 1) - boxVerticalPadding, greenX, gHeight * i, 'green', 6);
                }
                // From black to green
                else {
                    if(lastBlackId !== -1) {
                        drawArrow(outerG, blackX + pathShift, gHeight * (lastBlackId + 1) - boxVerticalPadding, greenX, gHeight * i, 'green', 7);
                        lastBlackId = i - 1;    // Store last black id for the following green chain that may appear
                    }   
                    greenChain = true;                
                }
                lastGreenId = i;
                break;
        }
    }
    
    // let bounding_1 = blocks[1].getBoundingClientRect();
    // let bounding_3 = blocks[3].getBoundingClientRect();
    // console.log(bounding_1.left, bounding_1.bottom, bounding_3.right, bounding_3.top)

    // drawArrow(outerG, bounding_1.left, bounding_1.bottom, bounding_3.right, bounding_3.top);
    // console.log(d3.selectAll("#svgResult svg g rect").nodes()[1].getBoundingClientRect());

    window.addEventListener("resize", handleResize);
}


function handleResize() {
    const rwdSvgWidth = parseInt(d3.select('#svgResult').style('width'));
    d3.select("#svgResult svg")
        .attr("width", rwdSvgWidth);
    d3.select("#svgResult svg g")
        .attr("transform", `translate(${rwdSvgWidth / 2}, 0)`);
}

function drawArrow(outerG, x1, y1, x2, y2, color, pathType) {
    // outerG.append('line')
    //     .attr('x1', x1)
    //     .attr('y1', y1)
    //     .attr('x2', x2)     
    //     .attr('y2', y2)
    //     .attr('stroke', color)
    //     .attr("stroke-width", 3)
    //     .attr('marker-end', `url(#${color}-arrow)`);
    
    switch(pathType) {
        case 3: case 4: case 6: // Straight down arrow
            outerG.append('path')
                .attr('d', `M${x1} ${y1} L${x2} ${y2}`)
                .attr('stroke', color)
                .attr("stroke-width", 3)
                .attr('marker-end', `url(#${color}-arrow)`);
            break;

        case 1: case 2: //Straight down then turn left or right arrow
            outerG.append('path')
                .attr('d', `M${x1} ${y1} L${x1} ${y2 - boxVerticalPadding / 2} L${x2} ${y2 - boxVerticalPadding / 2} L${x2} ${y2}`)
                .attr('stroke', color)
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('marker-end', `url(#${color}-arrow)`);
            break;

        case 5: case 7: //Turn left or right then straight down and  arrow
            outerG.append('path')
                .attr('d', `M${x1} ${y1} L${x1} ${y1 + boxVerticalPadding / 2} L${x2} ${y1 + boxVerticalPadding / 2} L${x2} ${y2}`)
                .attr('stroke', color)
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('marker-end', `url(#${color}-arrow)`);

            break;
    }

}
    