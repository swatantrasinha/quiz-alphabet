const board = document.getElementById('alpha-board');
const clearBtn = document.getElementById('clear-btn');
const selectAllBtn = document.getElementById('select-all-btn');
const adminFeedback = document.getElementById('admin-feedback');
const currentSetting = document.getElementById('current-setting');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getSelected() {
  const saved = localStorage.getItem('quizLetters');
  return saved ? JSON.parse(saved) : [];
}

function saveSelected(letters) {
  if (letters.length === 0) {
    localStorage.removeItem('quizLetters');
  } else {
    localStorage.setItem('quizLetters', JSON.stringify(letters));
  }
  updateDisplay();
}

function updateDisplay() {
  const selected = getSelected();
  currentSetting.textContent = selected.length
    ? `Quiz letters: ${selected.join(', ')}`
    : 'No letters selected — quiz will use all 26 letters';

  board.querySelectorAll('.alpha-tile').forEach(tile => {
    tile.classList.toggle('selected', selected.includes(tile.dataset.letter));
  });
}

function buildBoard() {
  ALPHABET.forEach(letter => {
    const tile = document.createElement('button');
    tile.className = 'alpha-tile';
    tile.dataset.letter = letter;
    tile.textContent = letter;
    tile.addEventListener('click', () => toggleLetter(letter));
    board.appendChild(tile);
  });
}

function toggleLetter(letter) {
  const selected = getSelected();
  const idx = selected.indexOf(letter);
  if (idx === -1) {
    selected.push(letter);
  } else {
    selected.splice(idx, 1);
  }
  selected.sort();
  saveSelected(selected);
  adminFeedback.textContent = selected.length
    ? `✅ ${selected.length} letter(s) selected`
    : '🎲 Using all random letters';
  adminFeedback.style.color = '#27ae60';
}

clearBtn.addEventListener('click', () => {
  saveSelected([]);
  adminFeedback.textContent = '🗑️ Cleared! Quiz will use all 26 letters.';
  adminFeedback.style.color = '#555';
});

selectAllBtn.addEventListener('click', () => {
  saveSelected([...ALPHABET]);
  adminFeedback.textContent = '✅ All 26 letters selected';
  adminFeedback.style.color = '#27ae60';
});

buildBoard();
updateDisplay();
