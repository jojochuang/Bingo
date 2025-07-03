import HanziConvert from 'https://cdn.jsdelivr.net/npm/hanzi-convert@1.0.7/lib/index.js';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

// ✅ 你的公開 Google Sheets CSV 連結
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPNJAxqBpnl_82VuX4xdIqC81d7fZJlaynWv2dqbXmKdKyepi28T3RMK4b_yp9v8s4B7s0oAR49YRj/pub?gid=0&single=true&output=csv';

const menu = document.getElementById('menu');
const wordPoolDiv = document.getElementById('word-pool');
const selectedDiv = document.getElementById('selected-words');
const selectedCount = document.getElementById('selected-count');

let csvData = [];
let uniqueWords = [];
let selectedWords = [];

const slotDisplay = document.getElementById('slot-display');
const slotButton = document.getElementById('slot-button');

// ✅ 抓取 CSV → 切割成 rows → 用第一列做選單
async function fetchCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  const rows = text.split('\n').map(row => row.split(','));
  console.log('Parsed rows:', rows); // 除錯用
  csvData = rows;
  buildMenu(rows[0]);
}

// ✅ 生成選單按鈕
function buildMenu(headers) {
  headers.forEach((header, index) => {
    if (header.trim()) {
      const btn = document.createElement('button');
      btn.className = 'menu-btn';
      btn.textContent = header.trim();
      btn.addEventListener('click', () => loadColumn(index));
      menu.appendChild(btn);
    }
  });
}

// ✅ 點選欄位 → 拆句子成單字 → 去重 → 繁簡體
function loadColumn(colIndex) {
  selectedWords = [];
  selectedDiv.innerHTML = '';
  updateSelectedCount();

  let fullWords = [];
  csvData.slice(1).forEach(row => {
    if (row[colIndex]) {
      fullWords.push(...row[colIndex].trim().split(''));
    }
  });

  const uniqueSet = new Set(fullWords);
  uniqueWords = Array.from(uniqueSet).map(w => ({
    traditional: w,
    simplified: HanziConvert.t2s(w)
  }));

  renderWordPool();
}

// ✅ 顯示可選單字池
function renderWordPool() {
  wordPoolDiv.innerHTML = '';
  uniqueWords.forEach(word => {
    const div = document.createElement('div');
    div.className = 'word';
    div.innerText = word.traditional === word.simplified ? word.traditional : `${word.traditional}/${word.simplified}`;
    div.addEventListener('click', () => toggleWord(word, div));
    wordPoolDiv.appendChild(div);
  });
}

// ✅ 點選或取消單字
function toggleWord(word, el) {
  const found = selectedWords.find(w => w.traditional === word.traditional);
  if (found) {
    selectedWords = selectedWords.filter(w => w.traditional !== word.traditional);
    el.classList.remove('selected');
  } else {
    if (selectedWords.length >= 30) {
      alert('最多只能選 30 個！');
      return;
    }
    selectedWords.push(word);
    el.classList.add('selected');
  }
  updateSelected();
}

function updateSelected() {
  selectedDiv.innerHTML = '';
  selectedWords.forEach(word => {
    const div = document.createElement('div');
    div.className = 'word selected';
    div.innerText = word.traditional === word.simplified ? word.traditional : `${word.traditional}/${word.simplified}`;
    selectedDiv.appendChild(div);
  });
  updateSelectedCount();
}

function updateSelectedCount() {
  selectedCount.innerText = selectedWords.length;
}

// ✅ 拉霸按鈕邏輯
slotButton.addEventListener('click', () => {
  if (selectedWords.length === 0) {
    slotDisplay.innerText = "已抽完！";
    return;
  }
  const index = Math.floor(Math.random() * selectedWords.length);
  const word = selectedWords.splice(index, 1)[0];
  slotDisplay.innerText = word.traditional === word.simplified ? word.traditional : `${word.traditional}\n${word.simplified}`;
  updateSelected();
});

// ✅ 生成賓果卡 PDF
document.getElementById('generate-bingo').addEventListener('click', () => {
  const count = parseInt(document.getElementById('bingo-count').value) || 1;
  if (selectedWords.length < 25) {
    alert('選的字至少要有 25 個！');
    return;
  }
  const pdf = new jsPDF();
  for (let i = 0; i < count; i++) {
    const shuffled = shuffle([...selectedWords]);
    drawBingoCard(pdf, shuffled, i !== 0);
  }
  pdf.save('bingo_cards.pdf');
});

// ✅ Shuffle 工具
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ✅ 畫賓果卡
function drawBingoCard(pdf, words, newPage) {
  if (newPage) pdf.addPage();
  const rows = 5, cols = 5, cellSize = 40;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= words.length) break;
      const w = words[idx++];
      const text = w.traditional === w.simplified ? w.traditional : `${w.traditional}\n${w.simplified}`;
      pdf.text(text, 20 + c * cellSize, 20 + r * cellSize);
    }
  }
}

// ✅ 一進網頁就跑！
fetchCSV();
