// // 引入 diff-match-patch 库
// const { diff_match_patch } = require('diff-match-patch');

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
    
    dmp.diff_cleanupSemantic(diffs);

    return diffs;
}

function readFile(inputId, outputId) {
    document.getElementById(inputId)
        .addEventListener('change', function () {

          let fr = new FileReader();
          fr.onload = function () {
            document.getElementById(outputId)
              .textContent = fr.result;
            console.log(fr.result)
          }

          fr.readAsText(this.files[0]);

          return fr;
        })
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
