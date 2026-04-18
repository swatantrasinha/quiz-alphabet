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

const LETTER_IMAGES = {
  A: { img: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=300&h=300&fit=crop', word: 'Apple' },
  B: { img: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=300&h=300&fit=crop', word: 'Ball' },
  C: { img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop', word: 'Cat' },
  D: { img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop', word: 'Dog' },
  E: { img: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&h=300&fit=crop', word: 'Elephant' },
  F: { img: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=300&h=300&fit=crop', word: 'Fish' },
  G: { img: 'https://images.unsplash.com/photo-1524024973431-3c27cd77f348?w=300&h=300&fit=crop', word: 'Goat' },
  H: { img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=300&h=300&fit=crop', word: 'Hen' },
  I: { img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=300&fit=crop', word: 'Ice Cream' },
  J: { img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop', word: 'Jug' },
  K: { img: 'https://images.unsplash.com/photo-1601134991665-a020399422e3?w=300&h=300&fit=crop', word: 'Kite' },
  L: { img: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&h=300&fit=crop', word: 'Lion' },
  M: { img: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300&h=300&fit=crop', word: 'Monkey' },
  N: { img: 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=300&h=300&fit=crop', word: 'Nest' },
  O: { img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop', word: 'Orange' },
  P: { img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop', word: 'Parrot' },
  Q: { img: 'https://images.unsplash.com/photo-1589554009835-5c8e1e1b1b0e?w=300&h=300&fit=crop', word: 'Queen' },
  R: { img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&h=300&fit=crop', word: 'Rabbit' },
  S: { img: 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=300&h=300&fit=crop', word: 'Sun' },
  T: { img: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=300&h=300&fit=crop', word: 'Tiger' },
  U: { img: 'https://images.unsplash.com/photo-1534309466160-70b22cc6254d?w=300&h=300&fit=crop', word: 'Umbrella' },
  V: { img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=300&h=300&fit=crop', word: 'Van' },
  W: { img: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=300&h=300&fit=crop', word: 'Watermelon' },
  X: { img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=300&fit=crop', word: 'Xylophone' },
  Y: { img: 'https://images.unsplash.com/photo-1605559911160-a3d95d213904?w=300&h=300&fit=crop', word: 'Yak' },
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
  const isCorrect = words.some(w => matchesLetter(w, currentLetter));

  if (isCorrect) {
    score++;
    feedbackEl.innerHTML = '';
    showClapping();
    showCelebration();
    showHappyOverlay();
  } else {
    feedbackEl.innerHTML = '';
    showSadOverlay();
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

nextBtn.addEventListener('click', nextQuestion);

nextQuestion();
