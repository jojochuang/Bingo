import HanziConvert from 'https://cdn.jsdelivr.net/npm/hanzi-convert@1.0.7/lib/index.js';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

// ✅ 預設抓 HTML 元件
const inputWords = document.getElementById('input-words');
const loadBtn = document.getElementById('load-words');
const selectedDiv = document.getElementById('selected-words');
const selectedCount = document.getElementById('selected-count');

const slotDisplay = document.getElementById('slot-display');
const slotButton = document.getElementById('slot-button');

let selectedWords = [];

// ✅ 按下【載入字庫】按鈕的功能
loadBtn.addEventListener('click', () => {
  console.log('✅ 載入字庫按鈕被點到');
  const input = inputWords.value.trim();
  if (!input) {
    alert('請先輸入字串！');
    return;
  }
  // 拆字 + 去重
  let words = input.split('');
  const uniqueSet = new Set(words);
  selectedWords = Array.from(uniqueSet).map(w => ({
    traditional: w,
    simplified: HanziConvert.t2s(w)
  }));
  updateSelected();
});

// ✅ 更新已載入單字池
function updateSelected() {
  selectedDiv.innerHTML = '';
  selectedWords.forEach(word => {
    const div = document.createElement('div');
    div.className = 'word selected';
    div.innerText = word.traditional === word.simplified
      ? word.traditional
      : `${word.traditional}/${word.simplified}`;
    selectedDiv.appendChild(div);
  });
  selectedCount.innerText = selectedWords.length;
}

// ✅ 拉霸抽字
slotButton.addEventListener('click', () => {
  if (selectedWords.length === 0) {
    slotDisplay.innerText = "已抽完！";
    return;
  }
  const index = Math.floor(Math.random() * selectedWords.length);
  const word = selectedWords.splice(index, 1)[0];
  slotDisplay.innerText = word.traditional === word.simplified
    ? word.traditional
    : `${word.traditional}\n${word.simplified}`;
  updateSelected();
});

// ✅ 產生賓果卡
document.getElementById('generate-bingo').addEventListener('click', () => {
  const count = parseInt(document.getElementById('bingo-count').value) || 1;
  if (selectedWords.length < 25) {
    alert('至少要有 25 個字才夠排一張 5x5 賓果卡！');
    return;
  }
  const pdf = new jsPDF();
  for (let i = 0; i < count; i++) {
    const shuffled = shuffle([...selectedWords]);
    drawBingoCard(pdf, shuffled, i !== 0);
  }
  pdf.save('bingo_cards.pdf');
});

// ✅ 工具：隨機洗牌
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ✅ 工具：畫賓果卡
function drawBingoCard(pdf, words, newPage) {
  if (newPage) pdf.addPage();
  const rows = 5, cols = 5, cellSize = 40;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= words.length) break;
      const w = words[idx++];
      const text = w.traditional === w.simplified
        ? w.traditional
        : `${w.traditional}\n${w.simplified}`;
      pdf.text(text, 20 + c * cellSize, 20 + r * cellSize);
    }
  }
}

console.log('✅ slot.js 已載入成功！');
