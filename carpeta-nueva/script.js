// ===== UTILIDADES BÁSICAS =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const topInput = $('#topSearchInput');
const bottomInput = $('#bottomSearchInput');
const micTop = $('#micTop');
const micBottom = $('#micBottom');
const iconItems = $$('.icon-menu .icon-item');

// ===== 1️⃣  BUSCADOR =====
function handleEnterSearch(input) {
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const q = input.value.trim();
            if (!q) return clearHighlights();
            runClientSearch(q);
        }
    });
}
handleEnterSearch(topInput);
handleEnterSearch(bottomInput);

function runClientSearch(query) {
    const q = query.toLowerCase();
    let hits = 0;
    iconItems.forEach(card => {
        const text = (card.innerText || '').toLowerCase();
        const kw = (card.dataset.keywords || '').toLowerCase();
        const match = text.includes(q) || kw.includes(q);
        card.classList.toggle('highlight', match);
        card.style.opacity = match ? '1' : '0.35';
        hits += match ? 1 : 0;
    });
    if (hits === 0) clearHighlights();
}
function clearHighlights() {
    iconItems.forEach(card => {
        card.classList.remove('highlight');
        card.style.opacity = '';
    });
}

// ===== 2️⃣  MICRÓFONO (Web Speech API) =====
function setupMic(imgEl, targetInput) {
    if (!imgEl || !targetInput) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        imgEl.addEventListener('click', () => {
            alert('El dictado por voz no es compatible con este navegador. Usa Chrome.');
        });
        return;
    }

    const rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = true;

    const start = () => {
        imgEl.classList.add('mic-listening');
        rec.start();
    };
    const stop = () => {
        imgEl.classList.remove('mic-listening');
        try { rec.stop(); } catch (_) { }
    };

    imgEl.addEventListener('click', start);
    imgEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') start();
    });

    rec.onresult = e => {
        let txt = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            const tr = e.results[i][0].transcript;
            txt += tr;
        }
        targetInput.value = txt;
    };

    rec.onend = () => {
        stop();
        const q = targetInput.value.trim();
        if (q) runClientSearch(q);
    };

    rec.onerror = () => stop();
}
setupMic(micTop, topInput);
setupMic(micBottom, bottomInput);

// ===== 3️⃣  ZOOM EN ICONOS Y BÚSQUEDA AL HACER CLICK =====
iconItems.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        const label = (card.querySelector('p')?.innerText || '').trim();
        if (topInput) topInput.value = label;
        if (bottomInput) bottomInput.value = label;
        runClientSearch(label);
    });
});
[topInput, bottomInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
        if (!inp.value.trim()) clearHighlights();
    });
});
// Tilt calculado por posición del mouse
iconItems.forEach(card => {
    const stone = card.querySelector('.icon-stone');
    if (!stone) return;
    card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 10;  // -5..5
        const y = ((e.clientY - r.top) / r.height - 0.5) * -10; // -5..5
        stone.style.transform = `rotateX(${y}deg) rotateY(${x}deg) scale(1.06)`;
    });
    card.addEventListener('mouseleave', () => {
        stone.style.transform = '';
    });
});
// Crea tooltips usando el <p> como texto
iconItems.forEach(card => {
    const label = card.querySelector('p')?.innerText?.trim() || '';
    card.setAttribute('data-title', label);
});
// === Botón "Volver arriba" ===
const goTop = document.getElementById('goTop');

if (goTop) {
    // Mostrar el botón cuando se hace scroll hacia abajo
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            goTop.classList.add('show');
        } else {
            goTop.classList.remove('show');
        }
    });

    // Volver arriba con scroll suave
    goTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
