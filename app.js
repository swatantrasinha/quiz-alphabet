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

const answerInput = document.getElementById('answer-input');
const submitAnswer = document.getElementById('submit-answer');

let score = 0;
let total = 0;
let currentLetter = 'A';
let recognition;
let transcript = '';

const LETTER_IMAGES = {
  A: { img: 'images/apple.avif', word: 'Apple' },
  B: { img: 'images/ball.avif', word: 'Ball' },
  C: { img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop', word: 'Cat' },
  D: { img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop', word: 'Dog' },
  E: { img: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&h=300&fit=crop', word: 'Elephant' },
  F: { img: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=300&h=300&fit=crop', word: 'Fish' },
  G: { img: 'images/goat.avif', word: 'Goat' },
  H: { img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=300&h=300&fit=crop', word: 'Hen' },
  I: { img: 'images/icecream.jpg', word: 'Ice Cream' },
  J: { img: 'images/jug.avif', word: 'Jug' },
  K: { img: 'images/kite.jpeg', word: 'Kite' },
  L: { img: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&h=300&fit=crop', word: 'Lion' },
  M: { img: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300&h=300&fit=crop', word: 'Monkey' },
  N: { img: 'images/nest.avif', word: 'Nest' },
  O: { img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop', word: 'Orange' },
  P: { img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop', word: 'Parrot' },
  Q: { img: 'images/queen.avif', word: 'Queen' },
  R: { img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&h=300&fit=crop', word: 'Rabbit' },
  S: { img: 'images/sun.avif', word: 'Sun' },
  T: { img: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=300&h=300&fit=crop', word: 'Tiger' },
  U: { img: 'images/umbrella.avif', word: 'Umbrella' },
  V: { img: 'images/van.avif', word: 'Van' },
  W: { img: 'images/watch.jpg', word: 'Watch' },
  X: { img: 'images/xylophone.avif', word: 'Xylophone' },
  Y: { img: 'images/Yak.avif', word: 'Yak' },
  Z: { img: 'https://images.unsplash.com/photo-1526095179574-86e545346ae6?w=300&h=300&fit=crop', word: 'Zebra' },
};

const PHONETIC_MAP = {
  A: ['AY', 'EI', 'EH'],
  B: ['BE', 'BEE', 'BI'],
  C: ['CE', 'SEE', 'SI', 'SEA'],
  D: ['DE', 'DEE', 'DI'],
  E: ['EE', 'IH'],
  F: ['EF', 'EFF'],
  G: ['GE', 'GEE', 'JI', 'JEE', 'GI'],
  H: ['AITCH', 'EICH', 'ACH'],
  I: ['AI', 'EYE', 'AYE'],
  J: ['JAY', 'JE', 'JAI'],
  K: ['KAY', 'KE', 'KAI', 'KA'],
  L: ['EL', 'ELL'],
  M: ['EM', 'EMM'],
  N: ['EN', 'ENN'],
  O: ['OH', 'OO'],
  P: ['PE', 'PEE', 'PI'],
  Q: ['QUE', 'CUE', 'KU', 'KYU', 'CU', 'KUE'],
  R: ['AR', 'ARE', 'AHR'],
  S: ['ES', 'ESS'],
  T: ['TE', 'TEE', 'TI'],
  U: ['YU', 'YOU', 'YOO'],
  V: ['VE', 'VEE', 'VI'],
  W: ['DOUBLE U', 'DOUBLE YOU', 'DOUBLEU', 'DOUBLEYOU'],
  X: ['EX', 'EKS'],
  Y: ['WHY', 'WAI', 'WY'],
  Z: ['ZE', 'ZEE', 'ZED', 'ZI'],
};

function matchesLetter(spoken, letter) {
  const clean = spoken.replace(/[^A-Z]/g, '');
  if (clean === letter || clean.charAt(0) === letter) return true;
  const variants = PHONETIC_MAP[letter] || [];
  return variants.some(v => clean === v || spoken.includes(v));
}

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
  const saved = localStorage.getItem('quizLetters');
  const pool = saved ? JSON.parse(saved) : [];
  if (pool.length === 0) {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function updateModeBadge() {
  const badge = document.getElementById('mode-badge');
  const saved = localStorage.getItem('quizLetters');
  const pool = saved ? JSON.parse(saved) : [];
  if (pool.length === 0) {
    badge.textContent = '🎲 All letters (random)';
    badge.className = 'mode-badge random';
  } else {
    badge.textContent = `📌 ${pool.length} letter(s): ${pool.join(', ')}`;
    badge.className = 'mode-badge fixed';
  }
}

function nextQuestion() {
  currentLetter = getLetter();
  letterEl.textContent = currentLetter;
  updateModeBadge();
  feedbackEl.textContent = '';
  heardEl.textContent = '';
  nextBtn.classList.add('hidden');
  startBtn.disabled = false;
  answerInput.value = '';
  answerInput.disabled = false;
  submitAnswer.disabled = false;
  showStartState();
}

function handleCorrect() {
  score++;
  feedbackEl.innerHTML = '';
  showClapping();
  showCelebration();
  showHappyOverlay();
}

function handleWrong() {
  feedbackEl.innerHTML = '';
  showSadOverlay();
}

function disableInputs() {
  startBtn.disabled = true;
  answerInput.disabled = true;
  submitAnswer.disabled = true;
}

function checkAnswer() {
  if (!transcript) {
    heardEl.textContent = "Didn't catch anything. Try again!";
    return;
  }

  heardEl.textContent = `I heard: "${transcript}"`;
  total++;

  const words = transcript.split(/\s+/);
  const isCorrect = words.some(w => matchesLetter(w, currentLetter));

  if (isCorrect) {
    handleCorrect();
  } else {
    handleWrong();
  }

  scoreEl.textContent = score;
  totalEl.textContent = total;
  nextBtn.classList.remove('hidden');
  disableInputs();
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

function showClapping() {
  feedbackEl.innerHTML = '<div class="clap-anim"><span class="clap-hand left">👏</span><span class="clap-hand right">👏</span></div>';
  setTimeout(() => { feedbackEl.innerHTML = ''; }, 5000);
}

function showHappyOverlay() {
  const img = LETTER_IMAGES[currentLetter];
  const overlay = document.createElement('div');
  overlay.className = 'happy-overlay';
  overlay.innerHTML = `
    <div class="happy-content">
      <div class="happy-emoji">🤩</div>
      <div class="happy-claps">👏👏👏</div>
      <div class="letter-image hidden">
        ${getLetterImageHTML(currentLetter)}
        <div class="letter-image-word">${currentLetter} for ${img.word}</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  setTimeout(() => {
    const imgSection = overlay.querySelector('.letter-image');
    const emojiSection = overlay.querySelector('.happy-emoji');
    const clapsSection = overlay.querySelector('.happy-claps');
    if (emojiSection) emojiSection.classList.add('hidden');
    if (clapsSection) clapsSection.classList.add('hidden');
    if (imgSection) imgSection.classList.remove('hidden');
  }, 2500);

  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 400);
  }, 6000);
}

function getLetterImageHTML(letter) {
  const data = LETTER_IMAGES[letter];
  if (data.img) {
    return `<img src="${data.img}" alt="${data.word}" class="letter-image-pic">`;
  }
  return `<div class="letter-image-emoji">${data.emoji}</div>`;
}

function showSadOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'happy-overlay sad-overlay';
  overlay.innerHTML = `
    <div class="happy-content">
      <div class="sad-emoji">😭<span class="tear left"></span><span class="tear right"></span></div>
      <div class="sad-letter">It's <span class="correct-letter">${currentLetter}</span></div>
      <div class="sad-msg">Try again! You got this! 💪</div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 400);
  }, 3000);
}

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

  setTimeout(() => container.remove(), 2500);
}

submitAnswer.addEventListener('click', () => {
  const val = answerInput.value.trim().toUpperCase();
  if (!/^[A-Z]$/.test(val)) {
    heardEl.textContent = 'Please type a single letter (A-Z)';
    return;
  }
  total++;
  heardEl.textContent = `You typed: "${val}"`;
  if (val === currentLetter) {
    handleCorrect();
  } else {
    handleWrong();
  }
  scoreEl.textContent = score;
  totalEl.textContent = total;
  nextBtn.classList.remove('hidden');
  disableInputs();
});

answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitAnswer.click();
});

nextBtn.addEventListener('click', nextQuestion);

nextQuestion();
