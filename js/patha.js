import { ACHULU, HALLULU, VARGAS } from "./data.js";

export const SITE_URL = "https://sda2025-tech.github.io/mana-telugu/";
const STREAK_KEY = "mana-telugu-patha";
const TE_DIGITS = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];

const CORE_ACHULU = ACHULU.filter((l) => !l.rare);
const CORE_HALLULU = HALLULU.filter((l) => !l.rare);

export function teNum(n) {
  return String(n)
    .split("")
    .map((d) => (/[0-9]/.test(d) ? TE_DIGITS[Number(d)] : d))
    .join("");
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildPathalu() {
  const days = [];
  const pushLetter = (letter, group, varga = null, pool) => {
    days.push({
      n: days.length + 1,
      type: "letter",
      group,
      varga,
      focus: letter,
      pool,
    });
  };

  CORE_ACHULU.forEach((letter) => pushLetter(letter, "achulu", null, CORE_ACHULU));

  VARGAS.forEach((varga) => {
    const row = CORE_HALLULU.filter((h) => h.varga === varga.id);
    row.forEach((letter) => {
      const pool = row.length >= 4 ? row : CORE_HALLULU;
      pushLetter(letter, "hallulu", varga, pool);
    });
  });

  return days;
}

export const PATHALU = buildPathalu();

export function curriculumIndex(d = new Date()) {
  const start = Date.UTC(2026, 0, 1);
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.floor((now - start) / 86400000);
  return ((days % PATHALU.length) + PATHALU.length) % PATHALU.length;
}

export function pathaForDate(d = new Date()) {
  return PATHALU[curriculumIndex(d)];
}

export function pathaByNumber(n) {
  const i = Number(n) - 1;
  if (Number.isNaN(i) || i < 0 || i >= PATHALU.length) return pathaForDate();
  return PATHALU[i];
}

export function lessonUrl(patha) {
  const today = pathaForDate();
  if (patha.n === today.n) return `${SITE_URL}#/patha`;
  return `${SITE_URL}#/patha/${patha.n}`;
}

function audioSlug(id) {
  const map = {
    Ta: "tta",
    Tha: "ttha",
    Da: "dda",
    Dha: "ddha",
    Na: "nna",
    La: "lla",
    Sha: "ssha",
  };
  return map[id] || id;
}

export function audioUrl(patha) {
  return `audio/${audioSlug(patha.focus.id)}.m4a`;
}

export function captionFor(patha) {
  const f = patha.focus;
  const group = patha.group === "achulu" ? "అచ్చులు · vowels" : `${patha.varga?.te || "హల్లులు"} · consonants`;
  return [
    `నేటి పాఠం ${teNum(patha.n)}/${teNum(PATHALU.length)}`,
    `${f.letter} — ${f.word}`,
    `${f.wordRoman} · ${f.meaning}`,
    group,
    "",
    "పాఠం వినండి · Play the lesson:",
    lessonUrl(patha),
    "",
    "మన తెలుగు",
    "#ManaTelugu #Telugu #తెలుగు",
  ].join("\n");
}

export function loadStreak() {
  try {
    const raw = JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
    return {
      lastDate: raw.lastDate || "",
      streak: Number(raw.streak) || 0,
      completed: Array.isArray(raw.completed) ? raw.completed : [],
    };
  } catch {
    return { lastDate: "", streak: 0, completed: [] };
  }
}

function yesterdayKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dateKey(dt);
}

export function recordCompletion(key) {
  const data = loadStreak();
  if (data.completed.includes(key)) return data;
  const streak = data.lastDate === yesterdayKey(key) ? data.streak + 1 : 1;
  const next = {
    lastDate: key,
    streak,
    completed: [...data.completed, key].slice(-180),
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}

export function makeFindChoices(patha) {
  const focus = patha.focus;
  const others = patha.pool.filter((x) => x.id !== focus.id);
  const extra = CORE_ACHULU.concat(CORE_HALLULU).filter((x) => x.id !== focus.id);
  const pool = others.length >= 3 ? others : extra;
  const pick = [];
  const used = new Set();
  while (pick.length < 3 && used.size < pool.length) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (!used.has(item.id)) {
      used.add(item.id);
      pick.push(item);
    }
  }
  return [...pick, focus].sort(() => Math.random() - 0.5);
}

export async function paintStory(canvas, patha) {
  if (!canvas || !patha) return;
  try {
    await document.fonts.ready;
  } catch {
    /* continue with fallbacks */
  }
  const w = 1080;
  const h = 1920;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ead6ad";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#f4e6c8";
  ctx.fillRect(36, 36, w - 72, h - 72);
  ctx.fillStyle = "#fff8e8";
  ctx.fillRect(88, 110, w - 176, h - 220);
  ctx.strokeStyle = "#8b1a1a";
  ctx.lineWidth = 10;
  ctx.strokeRect(88, 110, w - 176, h - 220);
  ctx.strokeStyle = "#c4a054";
  ctx.lineWidth = 2;
  ctx.strokeRect(112, 134, w - 224, h - 268);

  ctx.textAlign = "center";
  ctx.fillStyle = "#5c1010";
  ctx.font = "80px Suranna, 'Noto Serif Telugu', serif";
  ctx.fillText("మన తెలుగు", w / 2, 280);

  ctx.fillStyle = "#8b1a1a";
  ctx.font = "40px 'Noto Sans Telugu', sans-serif";
  ctx.fillText(`నేటి పాఠం  ${teNum(patha.n)} / ${teNum(PATHALU.length)}`, w / 2, 370);

  ctx.font = "140px sans-serif";
  ctx.fillText(patha.focus.emoji, w / 2, 600);

  ctx.fillStyle = "#5c1010";
  ctx.font = "400px 'Noto Serif Telugu', serif";
  ctx.fillText(patha.focus.letter, w / 2, 1040);

  ctx.font = "92px 'Noto Serif Telugu', serif";
  ctx.fillText(patha.focus.word, w / 2, 1200);

  ctx.fillStyle = "#5a3a28";
  ctx.font = "44px 'Source Sans 3', sans-serif";
  ctx.fillText(`${patha.focus.wordRoman}  ·  ${patha.focus.meaning}`, w / 2, 1290);

  ctx.fillStyle = "#8b1a1a";
  ctx.font = "44px 'Noto Sans Telugu', sans-serif";
  ctx.fillText("పాఠం వినండి", w / 2, 1480);
  ctx.font = "32px 'Source Sans 3', sans-serif";
  ctx.fillStyle = "#5a3a28";
  ctx.fillText("Play the lesson", w / 2, 1540);

  ctx.fillStyle = "#8b1a1a";
  ctx.font = "32px 'Source Sans 3', sans-serif";
  ctx.fillText("sda2025-tech.github.io/mana-telugu", w / 2, 1620);
}

export async function downloadStory(canvas, patha) {
  await paintStory(canvas, patha);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mana-telugu-patha-${patha.n}-${patha.focus.id}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      resolve();
    }, "image/png");
  });
}

function pickRecorderMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

function waitForAudio(audio) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Pronunciation file did not load.")), 8000);
    const done = (err) => {
      clearTimeout(timer);
      if (err) reject(err);
      else resolve();
    };
    audio.addEventListener("canplaythrough", () => done(), { once: true });
    audio.addEventListener("error", () => done(new Error("Pronunciation file missing.")), { once: true });
    if (audio.readyState >= 3) done();
    else audio.load();
  });
}

export async function downloadStoryVideo(canvas, patha) {
  await paintStory(canvas, patha);
  const mime = pickRecorderMime();
  if (!mime) {
    throw new Error("This browser cannot record video. Use Chrome on a computer, then upload the file to Instagram.");
  }
  if (typeof canvas.captureStream !== "function") {
    throw new Error("This browser cannot capture the card as video.");
  }

  const audio = new Audio(audioUrl(patha));
  audio.crossOrigin = "anonymous";
  audio.preload = "auto";
  await waitForAudio(audio);

  const ac = new AudioContext();
  if (ac.state === "suspended") await ac.resume();
  const src = ac.createMediaElementSource(audio);
  const dest = ac.createMediaStreamDestination();
  src.connect(dest);
  src.connect(ac.destination);
  if (!dest.stream.getAudioTracks().length) {
    await ac.close();
    throw new Error("Could not attach pronunciation audio to the video.");
  }

  const frame = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  let raf = 0;
  const keepAlive = () => {
    canvas.getContext("2d").putImageData(frame, 0, 0);
    raf = requestAnimationFrame(keepAlive);
  };
  keepAlive();

  const canvasStream = canvas.captureStream(30);
  const mixed = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(mixed, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
  const chunks = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise((resolve, reject) => {
    rec.onstop = resolve;
    rec.onerror = () => reject(new Error("Recording failed."));
  });

  rec.start(200);
  try {
    await audio.play();
    await Promise.race([
      new Promise((r) => {
        audio.onended = r;
      }),
      new Promise((r) => setTimeout(r, Math.max(3000, (audio.duration || 4) * 1000 + 800))),
    ]);
    await new Promise((r) => setTimeout(r, 350));
  } finally {
    if (rec.state !== "inactive") rec.stop();
  }
  await stopped;
  cancelAnimationFrame(raf);
  canvasStream.getTracks().forEach((t) => t.stop());
  dest.stream.getTracks().forEach((t) => t.stop());
  audio.pause();
  await ac.close();

  if (!chunks.length) throw new Error("Recording produced an empty file.");
  const ext = mime.includes("mp4") ? "mp4" : "webm";
  const blob = new Blob(chunks, { type: mime.split(";")[0] });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mana-telugu-patha-${patha.n}-${patha.focus.id}.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
}
