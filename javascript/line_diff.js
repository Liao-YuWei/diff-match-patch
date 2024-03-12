// 定义函数来计算两个文本文件之间的差异
function computeLineDiff(text1, text2) {
    // 创建 diff_match_patch 实例
    const dmp = new diff_match_patch();
    // 使用 diff_linesToChars_ 函数来转换文本行
    const a = dmp.diff_linesToChars_(text1, text2);
    const lineText1 = a.chars1;
    const lineText2 = a.chars2;
    var lineArray = a.lineArray;

    // 使用 diff_main 函数来计算差异
    const diffs = dmp.diff_main(lineText1, lineText2, false);

    // 使用 diff_charsToLines_ 函数将差异转换回文本行
    dmp.diff_charsToLines_(diffs, lineArray);
    
    // dmp.diff_cleanupSemantic(diffs);

    var diffHtml = dmp.diff_prettyHtml(diffs);

    return diffHtml;
}

function readFile(inputId, text) {
    document.getElementById(inputId)
        .addEventListener('change', function () {

          let fr = new FileReader();
          fr.onload = function () {
            text.str = fr.result;
          }
          try {
            fr.readAsText(this.files[0]);
          }
          catch(e) {
            text.str = ``;
            console.log(e);
          }
          
        })
}

function launchDiff() {
    /**
     * Compute diff
     */
    var ms_start = (new Date()).getTime();
      
    var diffs = computeLineDiff(text1.str, text2.str);

    var ms_end = (new Date()).getTime();
    document.getElementById('diffSpeed').innerText = 'Diff Time: ' + (ms_end - ms_start) / 1000 + 's';

    /** 
     * Render graph on DOM
     */
    ms_start = (new Date()).getTime();

    const parser = new DOMParser();
    const doc = parser.parseFromString(diffs, 'text/html');
    const blockGroups = doc.querySelectorAll('*');
    var diffArr = [];
    var hunks = [], curHunk = {'start': -1, 'len': -1};
    const hunkPadding = 3;
    var numOfLines = {'num': 0};
    // Skip the 3 root tags(<html>, <head>, <body>) and iterate through all tags
    for (let i = 3; i < blockGroups.length; i++) {
        switch (blockGroups[i].tagName) {
            case 'SPAN':
                diffArrPush(diffArr, blockGroups[i], 'equal', numOfLines, hunks, curHunk, hunkPadding);
                break;
            case 'DEL':
                diffArrPush(diffArr, blockGroups[i], 'delete', numOfLines, hunks, curHunk, hunkPadding);
                break;
            case 'INS':
                diffArrPush(diffArr, blockGroups[i], 'insert', numOfLines, hunks, curHunk, hunkPadding);
                break;
            default:
                break;
        }           
    }

    // Finish the last hunk
    if (curHunk.start !== -1) {
        curHunk.len = numOfLines.num - curHunk.start;
        hunksPush(hunks, curHunk);
    }

    render(diffArr, hunks);

    changeSliderRange(hunks);

    ms_end = (new Date()).getTime();
    document.getElementById('renderSpeed').innerText = 'Render Time: ' + (ms_end - ms_start) / 1000 + 's';

    // console.log(doc.getElementsByTagName('*'));
}

function diffArrPush(diffArr, blockGroup, type, numOfLines, hunks, curHunk, hunkPadding) {
    var blocks = blockGroup.innerHTML.split('\n\u00B6<br>');

    if ((type === 'delete' || type === 'insert') && curHunk.start === -1) {
        curHunk.start = (numOfLines.num - hunkPadding > 0) ? numOfLines.num - hunkPadding : 0;
    } 
    else if(type === 'equal' && curHunk.start !== -1 && blocks.length >= hunkPadding * 2) {
        curHunk.len = numOfLines.num + hunkPadding - curHunk.start;
        hunksPush(hunks, curHunk);
    }

    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i] === '')
            continue;
        
        let blockInfo = blocks[i].split(',');
        diffArr.push({
            file: `${blockInfo[2]}`,
            function: `${blockInfo[0]}`,
            bbid: `${blockInfo[1]}`,
            type: `${type}`
        });
        numOfLines.num++;
    }
}

function hunksPush(hunks, curHunk) {
    hunks.push({... curHunk});
    curHunk.start = -1;
    curHunk.len= -1;
}

function changeSliderRange(hunks) {
    if (hunks.length === 0)
        return;

    let curMin = Number.MAX_VALUE, curMax = -Number.MAX_VALUE;
    for (let i = 0; i < hunks.length; i++) {
        curMin = Math.min(curMin, hunks[i].len);
        curMax = Math.max(curMax, hunks[i].len);
    }

    let slider = document.getElementById("hunkSize");
    slider.min = curMin;
    slider.max = curMax;
    document.getElementById("hunkSizeMin").innerText = `min: ${slider.min}`;
    document.getElementById("hunkSizeMax").innerText = `max: ${slider.max}`;

    let sliderOutput = document.getElementById("curHunkSize");
    slider.oninput = function() {
        sliderOutput.innerHTML = `current threshold: ${this.value}`;
        drawHunks(hunks, this.value);
    }
}
