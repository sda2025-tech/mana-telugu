import {
  CHAPTERS,
  ACHULU,
  HALLULU,
  ALL_LETTERS,
  VARGAS,
  VOWEL_SIGNS,
  GUNINTHAM_CONSONANTS,
  VATTULU,
  VATTU_SHAPES,
  PADALU,
  VAKYALU,
  SANKHYALU,
  GEYALU,
  SAMETHALU,
} from "./data.js";
import { speak, stopSpeak, chant } from "./speech.js";

const app = document.querySelector("#app");
const nav = document.querySelector("#chapter-nav");
const PROGRESS_KEY = "mana-telugu-learned";

function learnedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function saveLearned(set) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
}
function markLearned(id) {
  const set = learnedSet();
  set.add(id);
  saveLearned(set);
  return set;
}

function route() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\/?/, "").split("/");
  return { view: parts[0] || "home", param: parts[1] || "" };
}

function navHtml(current) {
  return CHAPTERS.map(
    (c) =>
      `<a href="${c.path}" class="${c.id === current ? "active" : ""}">${c.te}</a>`
  ).join("");
}

function toolbar(extra = "") {
  return `<div class="toolbar">${extra}</div>`;
}

function pageHead(title, sub, extraBtns = "") {
  return `<div class="page-head">
    <div>
      <h1>${title}</h1>
      <p>${sub}</p>
    </div>
    ${toolbar(extraBtns)}
  </div>`;
}

function letterCard(item, kind) {
  return `<button class="letter-card ${item.rare ? "rare" : ""}" data-open="${kind}:${item.id}" type="button">
    ${item.rare ? `<span class="pill">ప్రాచీనం</span>` : ""}
    <div class="emoji">${item.emoji}</div>
    <div class="aksharam">${item.letter}</div>
    <div class="word">${item.word}</div>
    <div class="meta">${item.roman} · ${item.meaning}</div>
  </button>`;
}

function overlay(item) {
  return `<div class="overlay" data-close="1">
    <div class="overlay-card">
      <button class="close-x" data-close="1" type="button" aria-label="Close">×</button>
      <div class="emoji" style="font-size:3rem">${item.emoji}</div>
      <div class="aksharam">${item.letter}</div>
      <p class="word" style="font-family:var(--display);font-size:2rem;margin:.2rem 0">${item.word}</p>
      <p>${item.wordRoman} · ${item.meaning}${item.hint ? ` · ${item.hint}` : ""}</p>
      ${item.note ? `<p class="note">${item.note}</p>` : ""}
      <div class="cover-actions" style="margin-top:1rem">
        <button class="btn" data-speak="${item.speak}" type="button">వినండి · Hear</button>
        <button class="btn ghost" data-learn="${item.id}" type="button">నేర్చుకున్నాను · Learned</button>
      </div>
    </div>
  </div>`;
}

function findLetter(kind, id) {
  const list = kind === "h" ? HALLULU : ACHULU;
  return list.find((x) => x.id === id);
}

function renderHome() {
  const set = learnedSet();
  const total = ALL_LETTERS.length;
  const done = ALL_LETTERS.filter((l) => set.has(l.id)).length;
  const proverb = SAMETHALU[new Date().getDate() % SAMETHALU.length];
  const today = ALL_LETTERS[new Date().getDate() % ALL_LETTERS.length];
  const chapters = CHAPTERS.filter((c) => c.id !== "home")
    .map(
      (c) => `<a class="chapter-card" href="${c.path}">
        <div class="num">${c.num}</div>
        <h3>${c.te}</h3>
        <p>${c.en}</p>
      </a>`
    )
    .join("");

  return `<div class="wrap">
    <div class="cover">
      <div class="ornament">✦ ✦ ✦</div>
      <p class="kicker">Pedda Balasiksha · పెద్ద బాలశిక్ష</p>
      <h1>మన తెలుగు</h1>
      <p class="subtitle">Mana Telugu</p>
      <p class="lead">Vowels, then consonants, then guninthalu — the Pedda Balasiksha path. Tap a letter to hear it.</p>
      <div class="cover-actions">
        <a class="btn" href="#/achulu">పుస్తకం తెరువు · Open the book</a>
        <a class="btn ghost" href="#/abhyasam">అభ్యాసం · Practice</a>
      </div>
    </div>
    <p class="proverb">“${proverb.te}”<br><span style="color:var(--ink-soft);font-size:.95rem">${proverb.en}</span></p>
    <div class="progress" title="${done}/${total} letters marked learned"><span style="width:${Math.round((done / total) * 100)}%"></span></div>
    <p style="text-align:center;color:var(--ink-soft);margin-top:0">నేటి అక్షరం · today's letter
      <button class="btn small ghost" data-speak="${today.speak}" type="button">${today.letter} — ${today.word}</button>
    </p>
    <h2 style="font-family:var(--display);font-weight:400;margin:1.6rem 0 .8rem">పాఠములు · Lessons</h2>
    <div class="chapter-grid">${chapters}</div>
    <div class="note">
      <strong>ఎలా చదవాలి · How to use.</strong>
      Ten quiet minutes a day is enough. Learn అచ్చులు first, with the picture word: ఆ for ఆవు. Then chant one varga of హల్లులు a week. Guninthalu come after the letters feel familiar. Chrome or Edge will speak Telugu when a Telugu voice is installed.
    </div>
  </div>`;
}

function renderLetters(kind) {
  const isAchulu = kind === "achulu";
  const list = isAchulu ? ACHULU : HALLULU;
  const title = isAchulu ? "అచ్చులు" : "హల్లులు";
  const sub = isAchulu
    ? "Sixteen vowels of the school primer, each with a picture word. Tap a letter to hear it, or open పాఠం to trace one at a time."
    : "Thirty-six consonants, grouped in vargas by where the sound is made. Chant a row, then tap each picture word.";
  const chantList = list.map((l) => l.letter).join(" ");
  const extra = `
    <button class="btn small" data-chant="${kind}" type="button">గానం · Chant</button>
    <a class="btn small ghost" href="#/${kind}/lesson">పాఠం · Lesson</a>
    <button class="btn small ghost" data-speak="${chantList}" type="button">అన్నీ వినండి</button>`;

  if (!isAchulu) {
    const blocks = VARGAS.map((v) => {
      const cards = HALLULU.filter((h) => h.varga === v.id)
        .map((h) => letterCard(h, "h"))
        .join("");
      return `<section class="varga-row">
        <h2>${v.te} <span>${v.en} · ${v.chant}</span>
          <button class="btn small ghost" data-speak="${v.chant}" type="button">వినండి</button>
        </h2>
        <div class="letter-grid">${cards}</div>
      </section>`;
    }).join("");
    return `<div class="wrap">${pageHead(title, sub, extra)}${blocks}</div>`;
  }

  const cards = list.map((a) => letterCard(a, "a")).join("");
  return `<div class="wrap">${pageHead(title, sub, extra)}<div class="letter-grid">${cards}</div></div>`;
}

function renderLesson(kind, index = 0) {
  const list = kind === "hallulu" ? HALLULU : ACHULU;
  const i = Math.max(0, Math.min(list.length - 1, Number(index) || 0));
  const item = list[i];
  const prev = i > 0 ? `#/${kind}/lesson/${i - 1}` : "";
  const next = i < list.length - 1 ? `#/${kind}/lesson/${i + 1}` : "";
  return `<div class="wrap">
    ${pageHead("పాఠం · Lesson", `${i + 1} / ${list.length} · finger-trace the letter, then say the picture word.`)}
    <div class="lesson">
      <div class="trace-board">
        <p class="trace-caption">వేలితో దిద్దండి · trace with a finger</p>
        <div class="trace-letter" data-speak="${item.letter}">${item.letter}</div>
        <p class="trace-caption">${item.roman}${item.hint ? ` · ${item.hint}` : ""}</p>
      </div>
      <div class="lesson-side">
        <div class="emoji">${item.emoji}</div>
        <div class="word">${item.word}</div>
        <p>${item.wordRoman} · ${item.meaning}</p>
        ${item.note ? `<p class="note">${item.note}</p>` : ""}
        <button class="btn" data-speak="${item.speak}" type="button">వినండి · Hear</button>
      </div>
    </div>
    <div class="lesson-nav">
      ${prev ? `<a class="btn ghost" href="${prev}">← మునుపటి</a>` : `<span></span>`}
      ${next ? `<a class="btn" href="${next}">తరువాత →</a>` : `<a class="btn" href="#/${kind}">చిత్రపటం</a>`}
    </div>
  </div>`;
}

function guninthamRow(consonant) {
  return VOWEL_SIGNS.map((v) => {
    const form = consonant + v.sign;
    return `<button class="g-cell" data-speak="${form}" type="button">
      <div class="big">${form}</div>
      <div class="tiny">${v.name}<br>${consonant} + ${v.vowel}</div>
    </button>`;
  }).join("");
}

function renderGuninthalu(letter = "క") {
  const current = GUNINTHAM_CONSONANTS.find((c) => c.letter === letter) || GUNINTHAM_CONSONANTS[0];
  const picks = GUNINTHAM_CONSONANTS.map(
    (c) =>
      `<button type="button" data-g="${c.letter}" class="${c.letter === current.letter ? "active" : ""}">${c.letter}</button>`
  ).join("");
  const chantText = VOWEL_SIGNS.map((v) => current.letter + v.sign).join(" ");
  return `<div class="wrap">
    ${pageHead(
      "గుణింతాలు",
      "Each consonant already carries అ. Attach a vowel sign — గుడి, కొమ్ము, దీర్ఘం — and the sound changes. Learn one consonant's full row, then the pattern repeats.",
      `<button class="btn small" data-speak="${chantText}" type="button">గుణింతం గానం</button>`
    )}
    <p>హల్లు ఎంచుకోండి · pick a consonant</p>
    <div class="gunintham-pick">${picks}</div>
    <div class="note"><strong>${current.letter}</strong> (${current.roman}) — ${current.word}. The sign names are the same ones a Pedda Balasiksha teacher recites.</div>
    <div class="gunintham-table">${guninthamRow(current.letter)}</div>
  </div>`;
}

function renderVattulu() {
  const shapes = VATTU_SHAPES.map((s) => {
    const sample = "క" + "్" + s.letter;
    return `<button class="g-cell" data-speak="${sample}" type="button">
      <div class="big">${sample}</div>
      <div class="tiny">${s.name}</div>
    </button>`;
  }).join("");
  const cards = VATTULU.map(
    (v) => `<button class="word-card" data-speak="${v.word}" type="button">
      <div class="emoji">${v.emoji}</div>
      <div class="te">${v.form}</div>
      <p>${v.parts}</p>
      <p><strong>${v.word}</strong> · ${v.meaning}</p>
    </button>`
  ).join("");
  const pick = HALLULU.filter((h) => h.id !== "ksha")
    .slice(0, 34)
    .map((h) => h.letter);
  return `<div class="wrap">
    ${pageHead(
      "ఒత్తులు · వత్తులు",
      "When two consonants sit together, the second often hangs as a vattu under the first: అమ్మ, ఇల్లు, పక్షి. Learn these after guninthalu."
    )}
    <div class="builder">
      <p>రెండు హల్లులు కలిపి చూడండి · join two consonants with virama (్)</p>
      <p style="color:var(--ink-soft);margin:.2rem 0">మొదటి హల్లు</p>
      <div class="gunintham-pick" id="vattu-a">${pick
        .map((letter) => `<button type="button" data-va="${letter}">${letter}</button>`)
        .join("")}</div>
      <p style="color:var(--ink-soft);margin:.2rem 0">రెండవ హల్లు (వత్తు)</p>
      <div class="gunintham-pick" id="vattu-b">${pick
        .map((letter) => `<button type="button" data-vb="${letter}">${letter}</button>`)
        .join("")}</div>
      <div class="builder-result" id="vattu-out">క్క</div>
    </div>
    <h2 style="font-family:var(--display);font-weight:400">క కింద కొన్ని వత్తులు</h2>
    <div class="gunintham-table">${shapes}</div>
    <h2 style="font-family:var(--display);font-weight:400;margin-top:1.4rem">సాధారణ ఒత్తు పదాలు</h2>
    <div class="word-grid">${cards}</div>
    <p class="note" style="margin-top:1rem">The Telugu virama is ్. A consonant + ్ + another consonant prints the conjunct your browser already knows.</p>
  </div>`;
}

function renderPadalu() {
  const groups = [
    ["family", "కుటుంబం · family"],
    ["home", "ఇల్లు · home & school"],
    ["animals", "జంతువులు · animals"],
    ["food", "ఆహారం · food"],
    ["nature", "ప్రకృతి · nature"],
  ];
  const blocks = groups
    .map(([id, label]) => {
      const cards = PADALU.filter((p) => p.group === id)
        .map(
          (p) => `<button class="word-card" data-speak="${p.word}" type="button">
            <div class="emoji">${p.emoji}</div>
            <div class="te">${p.word}</div>
            <p>${p.roman} · ${p.meaning}</p>
          </button>`
        )
        .join("");
      return `<section class="varga-row"><h2>${label}</h2><div class="word-grid">${cards}</div></section>`;
    })
    .join("");
  return `<div class="wrap">${pageHead("పదాలు", "Simple primer words, grouped the way a child meets the world: family, house, animals, food, sky.")}${blocks}</div>`;
}

function renderVakyalu() {
  const cards = VAKYALU.map(
    (s) => `<article class="sentence-card">
      <p class="te">${s.te}</p>
      <p>${s.en}</p>
      <div class="chips">${s.words.map((w) => `<button class="chip" data-speak="${w}" type="button">${w}</button>`).join("")}</div>
      <p style="margin:.7rem 0 0"><button class="btn small" data-speak="${s.speak}" type="button">వాక్యం వినండి</button></p>
    </article>`
  ).join("");
  return `<div class="wrap">${pageHead("వాక్యాలు", "Read word by word, then the whole sentence. Tap a chip to hear just that word.")}<div class="word-grid" style="grid-template-columns:1fr">${cards}</div></div>`;
}

function renderSankhyalu() {
  const cards = SANKHYALU.map(
    (n) => `<button class="num-card" data-speak="${n.word}" type="button">
      <div class="emoji">${n.emoji}</div>
      <div class="te">${n.te}</div>
      <p>${n.n} · ${n.word}</p>
      <p>${n.roman}</p>
    </button>`
  ).join("");
  return `<div class="wrap">${pageHead("సంఖ్యలు", "Telugu digits ౦–౯, then the names children chant: ఒకటి రెండు మూడు…")}<div class="num-grid">${cards}</div></div>`;
}

function renderGeyalu() {
  const cards = GEYALU.map(
    (g) => `<article class="rhyme-card">
      <h3>${g.title}</h3>
      <p style="color:var(--ink-soft);margin:0 0 .6rem">${g.en}</p>
      ${g.lines.map((line) => `<p class="line">${line}</p>`).join("")}
      <p class="meaning">${g.meaning}</p>
      <p><button class="btn small" data-speak="${g.lines.join(" ")}" type="button">గేయం వినండి</button></p>
    </article>`
  ).join("");
  return `<div class="wrap">${pageHead("గేయాలు", "Chant the alphabet, the vargas, and a few original primer songs. Folk memory is how Telugu stayed in the mouth.")}<div class="word-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${cards}</div></div>`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuiz(n = 8) {
  const pool = ALL_LETTERS.filter((l) => !l.rare);
  return shuffle(pool)
    .slice(0, n)
    .map((item) => {
      const others = shuffle(pool.filter((x) => x.id !== item.id)).slice(0, 3);
      const choices = shuffle([item, ...others]);
      const kind = Math.random() < 0.5 ? "letter" : "word";
      return { item, choices, kind };
    });
}

let quizState = { questions: [], i: 0, score: 0, locked: false };

function quizView() {
  if (quizState.i >= quizState.questions.length) {
    return `<div class="wrap"><div class="quiz">
      <h1 style="font-family:var(--display);font-weight:400">అభ్యాసం పూర్తి</h1>
      <p class="prompt">${quizState.score} / ${quizState.questions.length}</p>
      <p>Score. Open the book again tomorrow; short daily sitting beats a long one.</p>
      <div class="cover-actions">
        <button class="btn" data-quiz="start" type="button">మళ్ళీ · Again</button>
        <a class="btn ghost" href="#/">ముఖచిత్రం</a>
      </div>
    </div></div>`;
  }
  const q = quizState.questions[quizState.i];
  const prompt = q.kind === "letter" ? q.item.letter : `${q.item.emoji}<br><span style="font-size:1.6rem">${q.item.meaning}</span>`;
  const ask = q.kind === "letter" ? "ఈ అక్షరం ఏ పదం?" : "ఈ బొమ్మ ఏ అక్షరం?";
  const choices = q.choices
    .map((c) => {
      const label = q.kind === "letter" ? `${c.word}` : c.letter;
      return `<button type="button" data-choice="${c.id}">${label}</button>`;
    })
    .join("");
  return `<div class="wrap">
    ${pageHead("అభ్యాసం", `ప్రశ్న ${quizState.i + 1} / ${quizState.questions.length} · ${ask}`)}
    <div class="quiz">
      <button class="btn small ghost" data-speak="${q.item.speak}" type="button">వినండి</button>
      <div class="prompt">${prompt}</div>
      <p>${q.kind === "letter" ? q.item.roman : "choose the letter"}</p>
      <div class="choices">${choices}</div>
    </div>
  </div>`;
}

function renderAbhyasam() {
  if (!quizState.questions.length) quizState = { questions: makeQuiz(), i: 0, score: 0, locked: false };
  return quizView();
}

function render() {
  stopSpeak();
  const { view, param } = route();
  const current = CHAPTERS.find((c) => c.id === view) ? view : "home";
  nav.innerHTML = navHtml(current === "home" ? "home" : view);
  let html = "";
  if (view === "achulu" && param === "lesson") html = renderLesson("achulu", location.hash.split("/")[3]);
  else if (view === "hallulu" && param === "lesson") html = renderLesson("hallulu", location.hash.split("/")[3]);
  else if (view === "achulu") html = renderLetters("achulu");
  else if (view === "hallulu") html = renderLetters("hallulu");
  else if (view === "guninthalu") html = renderGuninthalu(decodeURIComponent(param || "క"));
  else if (view === "vattulu") html = renderVattulu();
  else if (view === "padalu") html = renderPadalu();
  else if (view === "vakyalu") html = renderVakyalu();
  else if (view === "sankhyalu") html = renderSankhyalu();
  else if (view === "geyalu") html = renderGeyalu();
  else if (view === "abhyasam") html = renderAbhyasam();
  else html = renderHome();
  app.innerHTML = html;
  if (view === "vattulu") updateVattu(false);
  window.scrollTo(0, 0);
}

let vattuA = "క";
let vattuB = "క";
function updateVattu(play = true) {
  const out = document.querySelector("#vattu-out");
  if (out) {
    out.textContent = vattuA + "్" + vattuB;
    if (play) speak(out.textContent);
  }
  document.querySelectorAll("[data-va]").forEach((b) => b.classList.toggle("active", b.dataset.va === vattuA));
  document.querySelectorAll("[data-vb]").forEach((b) => b.classList.toggle("active", b.dataset.vb === vattuB));
}

app.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-speak],[data-chant],[data-open],[data-close],[data-learn],[data-g],[data-va],[data-vb],[data-choice],[data-quiz]");
  if (!t) {
    if (e.target.closest(".trace-letter")) speak(e.target.closest(".trace-letter").dataset.speak);
    return;
  }
  if (t.dataset.close) {
    document.querySelector(".overlay")?.remove();
    return;
  }
  if (t.dataset.speak) {
    speak(t.dataset.speak);
    return;
  }
  if (t.dataset.chant) {
    const list = t.dataset.chant === "hallulu" ? HALLULU : ACHULU;
    chant(list.map((x) => x.letter));
    return;
  }
  if (t.dataset.open) {
    const [kind, id] = t.dataset.open.split(":");
    const item = findLetter(kind, id);
    if (item) {
      app.insertAdjacentHTML("beforeend", overlay(item));
      speak(item.speak);
    }
    return;
  }
  if (t.dataset.learn) {
    markLearned(t.dataset.learn);
    t.textContent = "✓ ఉంచబడింది";
    return;
  }
  if (t.dataset.g) {
    location.hash = `#/guninthalu/${t.dataset.g}`;
    return;
  }
  if (t.dataset.va) {
    vattuA = t.dataset.va;
    updateVattu();
    return;
  }
  if (t.dataset.vb) {
    vattuB = t.dataset.vb;
    updateVattu();
    return;
  }
  if (t.dataset.quiz === "start") {
    quizState = { questions: makeQuiz(), i: 0, score: 0, locked: false };
    render();
    return;
  }
  if (t.dataset.choice) {
    if (quizState.locked) return;
    quizState.locked = true;
    const q = quizState.questions[quizState.i];
    const ok = t.dataset.choice === q.item.id;
    t.classList.add(ok ? "correct" : "wrong");
    if (ok) quizState.score += 1;
    else {
      const right = t.parentElement.querySelector(`[data-choice="${q.item.id}"]`);
      if (right) right.classList.add("correct");
    }
    speak(ok ? "చక్కగా ఉంది" : q.item.letter);
    setTimeout(() => {
      quizState.i += 1;
      quizState.locked = false;
      render();
    }, 900);
  }
});

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (e) => {
  const { view, param } = route();
  if (param !== "lesson") return;
  const parts = location.hash.split("/");
  const i = Number(parts[3] || 0);
  const list = view === "hallulu" ? HALLULU : ACHULU;
  if (e.key === "ArrowRight" && i < list.length - 1) location.hash = `#/${view}/lesson/${i + 1}`;
  if (e.key === "ArrowLeft" && i > 0) location.hash = `#/${view}/lesson/${i - 1}`;
});

render();
