let voicesReady = false;

function loadVoices() {
  voicesReady = true;
}

if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.addEventListener("voiceschanged", loadVoices);
  loadVoices();
}

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === "te-in") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("te")) ||
    voices.find((v) => /telugu/i.test(v.name)) ||
    null
  );
}

export function speak(text, { rate = 0.78, pitch = 1 } = {}) {
  if (!text || typeof speechSynthesis === "undefined") return Promise.resolve();
  speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "te-IN";
    u.rate = rate;
    u.pitch = pitch;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

export function stopSpeak() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

export async function chant(items, { gap = 420 } = {}) {
  stopSpeak();
  for (const item of items) {
    const text = typeof item === "string" ? item : item.speak || item.letter || item;
    await speak(text, { rate: 0.72 });
    await new Promise((r) => setTimeout(r, gap));
  }
}
