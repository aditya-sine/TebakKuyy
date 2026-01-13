// --- DATA SOAL ---
const rawQuestions = [
    { 
        q: "Kenapa zombie kalau nyerang bareng-bareng?", 
        opts: ["Biar rame", "Takut sendirian", "Karena kalau sendiri namanya zomblo.", "Lagi reuni"],
        a: 2,
        emoji: "🧟" 
    },
    { 
        q: "Hewan apa yang paling sederhana?", 
        opts: ["Kucing", "Ala kadal-nya", "Ayam", "Cacing"],
        a: 1,
        emoji: "🦎" 
    },
    { 
        q: "Kenapa dokter bedah saat operasi selalu memakai masker?", 
        opts: ["Biar kelihatan profesional", "Menghindari bau ruang operasi", "Supaya kalau gagal, nggak dikenali pasien.", "Biar nggak ketularan jomblo"],
        a: 2,
        emoji: "😷" 
    },
    { 
        q: "Cermin, cermin apa yang bikin senyum?", 
        opts: ["Cermin kamar", "Cermin mobil", "Cermin toko", "Cermin pas lihat kamu"],
        a: 3,
        emoji: "🪞" 
    },
    { 
        q: "Es, es apa yang bikin adem di hati?", 
        opts: ["Es batu", "Es teh", "Es krim", "Es kamu senyum ke aku"],
        a: 3,
        emoji: "👟" 
    },
    { 
        q: "Tiang, tiang apa yang paling enak?", 
        opts: ["Tiang listrik", "Tiang bendera", "Tiang-tiang mikirin kamu.", "Tiang jemuran tetangga"],
        a: 2,
        emoji: "💈" 
    },
    { 
        q: "Ayah Budi punya 5 anak: Nini, Nunu, Nana, Nene. Siapa anak kelima?", 
        opts: ["Nono", "Budi", "Tidak ada", "Ani"], 
        a: 1,
        emoji: "👨‍👧‍👦" 
    },
    { 
        q: "Penyanyi yang rambutnya gak lurus?", 
        opts: ["Ayu Ting Ting", "Keriting Dayanti", "Ari Lasso", "Isyana"],
        a: 1,
        emoji: "🎤"
    },
    { 
        q: "Pintu apa yang didorong sepuluh orang pun tidak akan terbuka?", 
        opts: ["Pintu besi", "Pintu hati", "Pintu yang ada tulisan 'TARIK'", "Pintu terkunci"], 
        a: 2,
        emoji: "🚪" 
    },
    { 
        q: "Penyanyi luar negeri yang suka sepedaan?", 
        opts: ["Justin Bibir", "Selena Gowes", "Ariana Grende", "Taylor Sweet"], 
        a: 1,
        emoji: "🚲" 
    },
    { 
        q: "Apa bahasa Jepang-nya 'Saya dicopet'?",
        opts: ["Takusidoku", "Sakukudiraba", "Yamete Kudasai", "Kurasa Takada"],
        a: 1,
        emoji: "👜" 
    },
    { 
        q: "Pocong apa yang paling jadi favorit ibu-ibu?", 
        opts: ["Pocong Mumun", "Pocongan harga", "Pocong Junaedi", "Pocong rambut panjang"], 
        a: 1,
        emoji: "👻" 
    },
    { 
        q: "Ada 1 kilo kapuk dan 1 kilo besi. Jika dijatuhkan ke kaki, mana yang lebih sakit?", 
        opts: ["Besi", "Kapuk", "Sama saja", "Kaki-nya"], 
        a: 3,
        emoji: "🦶" 
    },
    { 
        q: "Kenapa dalang selalu bawa keris pas pertunjukan wayang?",
        opts: ["Buat jaga diri", "Aksesori wajib", "Karena kalau bawa kompor, istrinya gak bisa masak", "Biar sakti"],
        a: 3,
        emoji: "🧠"  
    },
    { 
        q: "Kenapa senyum kamu itu berbahaya?", 
        opts: ["Karena manis", "Karena bikin salah fokus", "Karena nyebar virus senang", "Semua benar"], 
        a: 3,
        emoji: "🎭" 
    }
];

// --- GAME STATE ---
const STATE = {
    score: 0,
    index: 0,
    questions: [],
    streak: 0,
    maxQuestions: 15,
    timer: null,
    timeLeft: 15,
    soundOn: true
};

// --- DOM HELPER ---
const getEl = (id) => document.getElementById(id);

// --- AUDIO ENGINE ---
// Inisialisasi AudioContext (lazy load agar tidak diblokir browser)
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSfx(type) {
    if (!STATE.soundOn) return;
    initAudio(); // Pastikan audio context aktif

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'win') {
        playNote(523.25, 0, 0.1); 
        playNote(659.25, 0.1, 0.1); 
        playNote(783.99, 0.2, 0.2); 
        playNote(1046.50, 0.4, 0.4); 
    }
}

function playNote(freq, delay, duration) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
}

function toggleSound() {
    STATE.soundOn = !STATE.soundOn;
    const btn = getEl('sound-icon');
    if(btn) btn.innerText = STATE.soundOn ? '🔊' : '🔇';
}

// --- BACKGROUND ANIMATION ---
document.addEventListener("DOMContentLoaded", () => {
    const bgContainer = getEl('bg-elements');
    if (bgContainer) {
        const emojis = ['🍌', '🤪', '🍕', '⭐', '❓', '🤡', '🤣', '💣', '💥'];
        const shapes = ['shape-circle', 'shape-square', 'shape-triangle'];

        for(let i=0; i<15; i++) {
            const el = document.createElement('div');
            el.className = 'float-item';
            
            if (Math.random() > 0.5) {
                el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                el.classList.add('float-emoji');
            } else {
                el.classList.add(shapes[Math.floor(Math.random() * shapes.length)]);
            }

            el.style.left = Math.random() * 100 + '%';
            el.style.animationDuration = (Math.random() * 15 + 10) + 's';
            el.style.animationDelay = (Math.random() * 10) + 's';
            bgContainer.appendChild(el);
        }
    }
});

// --- CORE GAME LOGIC ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = getEl(id);
    if(screen) screen.classList.add('active');
}

function startGame() {
    // Inisialisasi audio saat interaksi user pertama
    initAudio();
    
    STATE.score = 0;
    STATE.index = 0;
    STATE.streak = 0;
    
    // Acak soal
    STATE.questions = [...rawQuestions].sort(() => 0.5 - Math.random()).slice(0, STATE.maxQuestions);
    
    // Bersihkan confetti jika ada sisa
    const canvas = getEl('confetti');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0, canvas.width, canvas.height);
    }

    playSfx('pop');
    switchScreen('screen-game');
    loadQuestion();
}

function loadQuestion() {
    // Stop timer lama untuk safety
    clearInterval(STATE.timer);

    if (STATE.index >= STATE.questions.length) {
        endGame();
        return;
    }

    const q = STATE.questions[STATE.index];
    getEl('q-indicator').innerText = `${STATE.index + 1}/${STATE.questions.length}`;
    getEl('score-display').innerText = STATE.score;
    getEl('q-text').innerText = q.q;
    getEl('mascot-game').innerText = q.emoji || "🤔";

    // Options
    const optsContainer = getEl('options-container');
    optsContainer.innerHTML = '';
    
    q.opts.forEach((optText, idx) => {
        const btn = document.createElement('div');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${optText}</span>`;
        // Pass event agar tombol bisa dimanipulasi
        btn.onclick = (e) => checkAnswer(idx, q.a, e.currentTarget);
        optsContainer.appendChild(btn);
    });

    // Combo UI
    const comboBadge = getEl('combo-badge');
    if (STATE.streak > 1) {
        comboBadge.innerText = `COMBO x${STATE.streak}! 🔥`;
        comboBadge.classList.add('show');
    } else {
        comboBadge.classList.remove('show');
    }

    startTimer();
}

function startTimer() {
    clearInterval(STATE.timer);
    STATE.timeLeft = 15;
    const timerBar = getEl('timer-bar');
    if(!timerBar) return;

    timerBar.className = 'timer-bar';
    timerBar.style.width = '100%';
    
    STATE.timer = setInterval(() => {
        STATE.timeLeft -= 0.1;
        const pct = (STATE.timeLeft / 15) * 100;
        timerBar.style.width = `${pct}%`;

        if (STATE.timeLeft < 5) timerBar.classList.add('danger');

        if (STATE.timeLeft <= 0) {
            clearInterval(STATE.timer);
            handleTimeOut();
        }
    }, 100);
}

function handleTimeOut() {
    playSfx('wrong');
    showFeedback("WAKTU HABIS!", false);
    STATE.streak = 0;
    disableButtons();
    
    setTimeout(() => {
        STATE.index++;
        loadQuestion();
    }, 1500);
}

function disableButtons() {
    const container = getEl('options-container');
    if(!container) return;
    const btns = container.children;
    for(let b of btns) b.style.pointerEvents = 'none';
}

function checkAnswer(selected, correct, btn) {
    clearInterval(STATE.timer);
    disableButtons();

    const isCorrect = selected === correct;
    const allBtns = getEl('options-container').children;

    if (isCorrect) {
        btn.classList.add('correct');
        btn.innerHTML += ' ✅';
        STATE.streak++;
        
        const bonus = Math.floor(STATE.timeLeft);
        const streakBonus = (STATE.streak - 1) * 10;
        const points = 20 + streakBonus + bonus;
        
        STATE.score += points;
        playSfx('correct');
        getEl('mascot-game').innerText = "🤩";
        showFeedback("MANTAP!", true, `+${points} Poin`);
    } else {
        btn.classList.add('wrong');
        btn.innerHTML += ' ❌';
        // Tunjukkan jawaban benar
        if(allBtns[correct]) allBtns[correct].classList.add('correct');
        
        STATE.streak = 0;
        playSfx('wrong');
        getEl('mascot-game').innerText = "😵";
        showFeedback("YAH SALAH!", false);
    }

    setTimeout(() => {
        STATE.index++;
        loadQuestion();
    }, 1500);
}

function showFeedback(text, isGood, subtext = "") {
    const overlay = getEl('feedback-popup');
    if(!overlay) return;

    overlay.style.backgroundColor = isGood ? 'var(--white)' : 'var(--dark)';
    overlay.style.color = isGood ? 'var(--dark)' : 'var(--white)';
    overlay.style.borderColor = isGood ? 'var(--success)' : 'var(--danger)';
    
    overlay.innerHTML = `${text}<span style="display:block; font-size:0.6em; color:${isGood ? 'var(--success)' : 'var(--danger)'}">${subtext}</span>`;
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 1000);
}

function endGame() {
    playSfx('win');
    switchScreen('screen-result');
    
    let temp = 0;
    const final = STATE.score;
    const el = getEl('final-score');
    const step = Math.ceil(final / 50);
    
    if(el) {
        const anim = setInterval(() => {
            temp += step;
            if (temp >= final) {
                temp = final;
                clearInterval(anim);
                triggerConfetti();
            }
            el.innerText = temp;
        }, 20);
    } else {
        triggerConfetti();
    }

    const msgEl = getEl('result-msg');
    if(msgEl) {
        if (final > 150) {
            msgEl.innerText = "LEGEND RECEH 👑 Lawakanmu resmi naik kelas elit.";
        } else if (final > 80) {
            msgEl.innerText = "GOKIL 😂 Bakat recehmu mulai bikin orang ketagihan!";
        } else {
            msgEl.innerText = "Hmm 🤔 Masih anget… coba isi ulang micin dulu!";
        }
    }
}

// --- CONFETTI EFFECT ---
function triggerConfetti() {
    const canvas = getEl('confetti');
    if(!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const colors = ['#feca57', '#ff6b6b', '#54a0ff', '#1dd1a1'];
    
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            rotation: Math.random() * 360
        });
    }

    function render() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += 5;
            if (p.y < canvas.height) active = true;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        });
        
        if (active) requestAnimationFrame(render);
    }
    render();
}