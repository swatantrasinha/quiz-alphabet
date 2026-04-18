const letterInput = document.getElementById('letter-input');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const adminFeedback = document.getElementById('admin-feedback');
const currentSetting = document.getElementById('current-setting');

function updateDisplay() {
  const saved = localStorage.getItem('quizLetter');
  currentSetting.textContent = saved
    ? `Quiz is set to letter: "${saved}"`
    : 'Quiz is using random letters';
}

submitBtn.addEventListener('click', () => {
  const val = letterInput.value.trim().toUpperCase();
  if (!/^[A-Z]$/.test(val)) {
    adminFeedback.textContent = '⚠️ Please enter a single letter (A-Z)';
    adminFeedback.style.color = '#e74c3c';
    return;
  }
  localStorage.setItem('quizLetter', val);
  letterInput.value = '';
  adminFeedback.textContent = `✅ Quiz letter set to "${val}"`;
  adminFeedback.style.color = '#27ae60';
  updateDisplay();
});

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('quizLetter');
  adminFeedback.textContent = '🗑️ Cleared! Quiz will use random letters.';
  adminFeedback.style.color = '#555';
  updateDisplay();
});

updateDisplay();
