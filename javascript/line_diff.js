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

// function readFile(inputId, text) {
//     document.getElementById(inputId)
//         .addEventListener('change', function () {

//           let fr = new FileReader();
//           fr.onload = function () {
//             text.str = fr.result;
//           }
//           try {
//             fr.readAsText(this.files[0]);
//           }
//           catch(e) {
//             text.str = ``;
//             console.log(e);
//           }
          
//         })
// }

function launchDiff() {
    if (text1.str === `` || text2.str === ``) {
        document.getElementById("empty").style.display = 'block';
        return;
    }
    document.getElementById("empty").style.display = 'none';

    /**
     * Compute diff
     */
    // var ms_start = (new Date()).getTime();
      
    var diffs = computeLineDiff(text1.str, text2.str);

    // var ms_end = (new Date()).getTime();
    // document.getElementById('diffSpeed').innerText = 'Diff Time: ' + (ms_end - ms_start) / 1000 + 's';

    /** 
     * Render graph on DOM
     */
    // ms_start = (new Date()).getTime();

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

    let previousBtn = document.getElementById("previousBtn");
    // previousBtn.style.display = "block";
    previousBtn.onclick = function() { moveToPreviousHunk(hunks) };

    let nextBtn = document.getElementById("nextBtn");
    // nextBtn.style.display = "block"; 
    nextBtn.onclick = function() { moveToNextHunk(hunks) };

    // ms_end = (new Date()).getTime();
    // document.getElementById('renderSpeed').innerText = 'Render Time: ' + (ms_end - ms_start) / 1000 + 's';

    // console.log(doc.getElementsByTagName('*'));
}

function diffArrPush(diffArr, blockGroup, type, numOfLines, hunks, curHunk, hunkPadding) {
    var blocks = blockGroup.innerHTML.split('\n\u00B6<br>');

    if ((type === 'delete' || type === 'insert') && curHunk.start === -1) {
        curHunk.start = (numOfLines.num - hunkPadding > 0) ? numOfLines.num - hunkPadding : 0;
    } 
    else if(type === 'equal' && curHunk.start !== -1 && blocks.length > hunkPadding * 2) {
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

function debounce(func, wait) {
    let timeout;
  
    return function executedFunction() {
      const context = this;
      const args = arguments;
      
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
}

function changeSliderRange(hunks) {
    if (hunks.length === 0) {
        document.getElementById("hunkSizeG").style.display = 'none';
        return;
    }
        
    let curMin = Number.MAX_VALUE, curMax = -Number.MAX_VALUE;
    for (let i = 0; i < hunks.length; i++) {
        curMin = Math.min(curMin, hunks[i].len);
        curMax = Math.max(curMax, hunks[i].len);
    }

    document.getElementById("hunkSizeG").style.display = 'block';

    let inputBox = document.getElementById("hunkSize");
    inputBox.min = curMin;
    inputBox.max = curMax;
    inputBox.value = curMin;
    document.getElementById("hunkSizeMin").innerText = `${inputBox.min}`;
    document.getElementById("hunkSizeMax").innerText = `${inputBox.max}`;

    const hunkSizeVisual = document.getElementById('hunkSizeVisual');
    hunkSizeVisual.max = curMax - curMin;
    hunkSizeVisual.value = 0;

    // let sliderOutput = document.getElementById("curHunkSize");
    // sliderOutput.innerHTML = `current threshold: ${slider.value}`;
    
    inputBox.oninput = debounce(function() {
        // sliderOutput.innerHTML = `current threshold: ${this.value}`;
        if (this.value < curMin) {
            this.value = curMin;
        }
        else if (this.value > curMax) {
            this.value = curMax;
        }

        const hunkSizeVisual = document.getElementById('hunkSizeVisual');
        hunkSizeVisual.value = this.value - curMin;
        drawHunks(hunks, this.value);
    }, 800);
}

function moveToPreviousHunk(hunks) {
    const topShift = 30;
    let elements = document.getElementById("hunks").getElementsByTagName('*');
    for (let i = elements.length - 1; i >= 0; i--) {
        let element = elements[i];
        let yPos = element.getBoundingClientRect().y;
        const resultContainer = document.getElementById('resultContainer');
        if (yPos < -topShift) {
            resultContainer.scrollTo({ top: resultContainer.scrollTop + yPos - topShift, behavior: 'smooth'});
            break;
        }
    }
}

function moveToNextHunk(hunks) {
    const topShift = 30;
    let elements = document.getElementById("hunks").getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let yPos = element.getBoundingClientRect().y;
        const resultContainer = document.getElementById('resultContainer');
        if (yPos > topShift) {
            resultContainer.scrollTo({ top: resultContainer.scrollTop + yPos - topShift, behavior: 'smooth'});
            break;
        }
    }
}

var didScroll = false;

// window.onscroll = function() {
//     didScroll = true;
// };

setInterval(function() {
    if ( didScroll ) {
        didScroll = false;
        const topShift = 30;
        let elements = document.getElementById("hunks").getElementsByTagName('*');
        if (elements[0].getBoundingClientRect().y > topShift)
            previousBtn.style.display = 'none';
        else
            previousBtn.style.display = 'block';

        if (elements[elements.length - 1].getBoundingClientRect().y < -topShift)
            nextBtn.style.display = 'none';
        else
            nextBtn.style.display = 'block';
    }
}, 500);

document.addEventListener('DOMContentLoaded', function() {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.onscroll = onResultScroll;
});

function onResultScroll() {
    didScroll = true;
}


function readFile(inputId, text) {
    document.addEventListener('DOMContentLoaded', function() {
        var area = document.querySelector('#'+inputId)
        var input = area.querySelector('input[type="file"]');
        var button = area.querySelector('button');
        var filenameDisplay = area.querySelector('.filename');
    
        // Highlight and handle drag over
        area.addEventListener('dragover', function(event) {
            event.preventDefault();
            area.style.backgroundColor = '#7A88FA'; // Highlight color
        });
    
        // Reset background color on drag leave
        area.addEventListener('dragleave', function(event) {
            area.style.backgroundColor = '#6C7AED'; // Original color
        });
    
        // Handle file drop
        area.addEventListener('drop', function(event) {
            event.preventDefault();
            area.style.backgroundColor = '#6C7AED'; // Reset color
            if (event.dataTransfer.files.length > 0) {
                input.files = event.dataTransfer.files;

                let fr = new FileReader();
                    fr.onload = function () {
                    text.str = fr.result;
                }
                try {
                    fr.readAsText(input.files[0]);
                    filenameDisplay.textContent = 'Selected file: ' + input.files[0].name;
                }
                catch(e) {
                    text.str = ``;
                    console.log(e);
                    filenameDisplay.textContent = 'No file selected';
                }
                // console.log(input.files[0].name + ' was added to ' + input.name);
            }
        });

        // Open file selector when box is clicked
        button.addEventListener('click', function() {
            input.click(); // Simulate click on the input
        });

        // Handle selected file
        input.addEventListener('change', function () {
            let fr = new FileReader();
                fr.onload = function () {
                text.str = fr.result;
            }
            try {
                fr.readAsText(this.files[0]);
                filenameDisplay.textContent = 'Selected file: ' + this.files[0].name;
            }
            catch(e) {
                text.str = ``;
                console.log(e);
                filenameDisplay.textContent = 'No file selected';
            }
            // console.log(this.files[0].name + ' was added to ' + this.name);
        })
    });
}