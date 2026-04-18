const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const letterEl = document.getElementById('letter');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const feedbackEl = document.getElementById('feedback');
const heardEl = document.getElementById('heard');
const nextBtn = document.getElementById('next-btn');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const noSupport = document.getElementById('no-support');

let score = 0;
let total = 0;
let currentLetter = 'A';
let recognition;
let transcript = '';

if (!SpeechRecognition) {
  startBtn.classList.add('hidden');
  noSupport.classList.remove('hidden');
} else {
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 5;

  recognition.addEventListener('result', (e) => {
    transcript = Array.from(e.results).map(r => r[0].transcript).join('').trim().toUpperCase();
    heardEl.textContent = `Hearing: "${transcript}"`;
  });

  recognition.addEventListener('error', (e) => {
    const messages = {
      'no-speech': 'No speech detected. Speak louder and closer to the mic!',
      'audio-capture': 'No microphone found. Please connect one.',
      'not-allowed': 'Mic access denied. Please allow microphone in browser settings.',
      'network': 'Network error. Check your internet connection.',
      'aborted': '',
    };
    const msg = messages[e.error];
    if (msg) heardEl.textContent = msg;
    showStartState();
  });

  recognition.addEventListener('end', () => showStartState());
}

function showStartState() {
  startBtn.classList.remove('hidden', 'listening');
  stopBtn.classList.add('hidden');
}

function showStopState() {
  startBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');
}

function getLetter() {
  const saved = localStorage.getItem('quizLetter');
  if (saved) return saved;
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function updateModeBadge() {
  const badge = document.getElementById('mode-badge');
  const saved = localStorage.getItem('quizLetter');
  badge.textContent = saved ? `📌 Fixed: ${saved}` : '🎲 Random mode';
  badge.className = 'mode-badge ' + (saved ? 'fixed' : 'random');
}

function nextQuestion() {
  currentLetter = getLetter();
  letterEl.textContent = currentLetter;
  updateModeBadge();
  feedbackEl.textContent = '';
  heardEl.textContent = '';
  nextBtn.classList.add('hidden');
  startBtn.disabled = false;
  showStartState();
}

function checkAnswer() {
  if (!transcript) {
    heardEl.textContent = "Didn't catch anything. Try again!";
    return;
  }

  heardEl.textContent = `I heard: "${transcript}"`;
  total++;

  const words = transcript.split(/\s+/);
  const isCorrect = words.some(w => w === currentLetter || w.charAt(0) === currentLetter);

  if (isCorrect) {
    score++;
    feedbackEl.textContent = '🎉 Correct! Great job!';
    showCelebration();
  } else {
    feedbackEl.textContent = `❌ It's "${currentLetter}"`;
  }

  scoreEl.textContent = score;
  totalEl.textContent = total;
  nextBtn.classList.remove('hidden');
  startBtn.disabled = true;
}

startBtn.addEventListener('click', () => {
  if (!recognition) return;
  transcript = '';
  feedbackEl.textContent = '';
  heardEl.textContent = 'Listening... speak now!';
  showStopState();
  recognition.start();
});

stopBtn.addEventListener('click', () => {
  if (!recognition) return;
  recognition.stop();
  showStartState();
  checkAnswer();
});

function showCelebration() {
  const container = document.createElement('div');
  container.className = 'celebration';
  document.body.appendChild(container);

  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bd6','#ffa94d'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.7 + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 2200);
}

nextBtn.addEventListener('click', nextQuestion);

nextQuestion();
