// // 引入 diff-match-patch 库
// const { diff_match_patch } = require('diff-match-patch');

// const { render } = require('render');
// import { render } from './render.js';

// 定义函数来计算两个文本文件之间的差异
function computeLineDiff(dmp, text1, text2) {
    // 创建 diff_match_patch 实例
    // const dmp = new diff_match_patch();
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

function readFile(inputId, outputId, text) {
    document.getElementById(inputId)
        .addEventListener('change', function () {

          let fr = new FileReader();
          fr.onload = function () {
            // document.getElementById(outputId)
            //   .textContent = fr.result;
            // console.log(fr.result)
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
    // console.log("-------in btn---------");
    // console.log(`text1: ${text1.str}`);
    // console.log(`text2: ${text2.str}`);
    var ms_start = (new Date()).getTime();
    // Diff
    const dmp = new diff_match_patch();
      
    var diffs = computeLineDiff(dmp, text1.str, text2.str);

    // Print diff in control panel
    // console.log(diff);
    // console.log("Differences:");
    // diff.forEach(function(d) {
    //   console.log(d[0], d[1]);
    // });
    // Show execution time
    var ms_end = (new Date()).getTime();
    document.getElementById('diffSpeed').innerText = 'Time: ' + (ms_end - ms_start) / 1000 + 's';

    // Render HTML on DOM
    // document.getElementById("result").innerHTML = diffs;

    // document.getElementById('originalFile').innerHTML = '';
    // document.getElementById('newFile').innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(diffs, 'text/html');
    // console.log(doc);
    const hunks = doc.querySelectorAll('*');
    // console.log(hunks);
    var diffArr = [];
    // Pass the 3 root tags(<html>, <head>, <body>) and iterate through all tags
    for (let i = 3; i < hunks.length; i++) {
        switch (hunks[i].tagName) {
            case 'SPAN':
                // document.getElementById('originalFile').insertAdjacentHTML('beforeend', hunks[i].outerHTML);
                // document.getElementById('newFile').insertAdjacentHTML('beforeend', hunks[i].outerHTML);
                
                var blocks = hunks[i].innerHTML.split("\n\u00B6<br>");
                for (let j = 0; j < blocks.length; j++) {
                    if (blocks[j] === '')
                        continue;
                    diffArr.push({
                        block: `${blocks[j]}`,
                        type: 'equal'
                    });
                }
                // var content = document.createTextNode(hunks[i].innerText);
                // content.innerHTML = hunks[i].innerHTML;
                // oriItem.appendChild(content);

                // var newItem = document.getElementById('newFile');
                // console.log(hunks[i]);
                break;
            case 'DEL':
                // document.getElementById('originalFile').insertAdjacentHTML('beforeend', hunks[i].outerHTML);
                // var brs = hunks[i].querySelectorAll('*');
                // for (let j = 0; j < brs.length; j++)
                //   document.getElementById('newFile').insertAdjacentHTML('beforeend', '<br>');

                var blocks = hunks[i].innerHTML.split("\n\u00B6<br>");
                for (let j = 0; j < blocks.length; j++) {
                    if (blocks[j] === '')
                        continue;
                    diffArr.push({
                        block: `${blocks[j]}`,
                        type: 'delete'
                    });
                }
                // console.log(hunks[i]);
                break;
            case 'INS':
                // var brs = hunks[i].querySelectorAll('*');
                // for (let j = 0; j < brs.length; j++)
                //     document.getElementById('originalFile').insertAdjacentHTML('beforeend', '<br>');
                // document.getElementById('newFile').insertAdjacentHTML('beforeend', hunks[i].outerHTML);
                
                var blocks = hunks[i].innerHTML.split("\n\u00B6<br>");
                for (let j = 0; j < blocks.length; j++) {
                    if (blocks[j] === '')
                        continue;
                    diffArr.push({
                        block: `${blocks[j]}`,
                        type: 'insert'
                    });
                }
                // console.log(hunks[i]);
                break;
            default:
                break;
        }

        // Pass <br> tag
        // if (hunks[i].tagName !== "BR") {
            
        //     console.log(hunks[i]);
        // }
            
    }
    render(diffArr);
    // console.log(diffArr);
    // console.log(doc.getElementsByTagName('*'));
}

// 示例用法
// const text1 = `Hello
// World
// This is a test
// `;
// const text2 = `Hello
// World
// This is another test
// `;

// const differences = computeLineDiff(text1, text2);

// // 输出差异
// console.log("Differences:");
// differences.forEach(([op, data]) => {
//     console.log(op, data);
// });
