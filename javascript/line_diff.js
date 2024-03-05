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
    const hunks = doc.querySelectorAll('*');
    var diffArr = [];
    // Skip the 3 root tags(<html>, <head>, <body>) and iterate through all tags
    for (let i = 3; i < hunks.length; i++) {
        switch (hunks[i].tagName) {
            case 'SPAN':
                diffArrPush(diffArr, hunks[i], 'equal');
                break;
            case 'DEL':
                diffArrPush(diffArr, hunks[i], 'delete');
                break;
            case 'INS':
                diffArrPush(diffArr, hunks[i], 'insert');
                break;
            default:
                break;
        }           
    }
    render(diffArr);

    ms_end = (new Date()).getTime();
    document.getElementById('renderSpeed').innerText = 'Render Time: ' + (ms_end - ms_start) / 1000 + 's';

    // console.log(doc.getElementsByTagName('*'));
}

function diffArrPush(diffArr, hunk, type) {
    var blocks = hunk.innerHTML.split("\n\u00B6<br>");
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i] === '')
            continue;
        diffArr.push({
            block: `${blocks[i]}`,
            type: `${type}`
        });
    }
}
