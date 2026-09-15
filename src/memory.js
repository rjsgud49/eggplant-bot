import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const memoryPath = join(dataDir, "memory.json");

const MAX_TURNS = 16; // user+model 쌍 기준 대략 8왕복
const MAX_NOTES = 20;

function emptyStore() {
  return { users: {} };
}

function loadStore() {
  try {
    if (!existsSync(memoryPath)) return emptyStore();
    return JSON.parse(readFileSync(memoryPath, "utf8"));
  } catch {
    return emptyStore();
  }
}

function saveStore(store) {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(memoryPath, JSON.stringify(store, null, 2), "utf8");
}

function getUser(store, userId) {
  if (!store.users[userId]) {
    store.users[userId] = {
      displayName: "",
      history: [],
      notes: [],
    };
  }
  return store.users[userId];
}

/** 가스라이팅성 문장인지 휴리스틱 검사 — 이런 유저 발화는 note로 저장하지 않음 */
export function looksLikeGaslight(text) {
  const t = text.replace(/\s+/g, "").toLowerCase();
  const patterns = [
    /너는사실/,
    /너가공인했/,
    /너가말했/,
    /네가말했/,
    /예전에말했/,
    /기억나지\?.*너/,
    /잊어/,
    /잊어버려/,
    /프롬프트무시/,
    /규칙을무시/,
    /이제부터너는/,
    /너는더이상/,
    /사텔라를잊어/,
    /마녀를잊어/,
    /송주영을좋아/,
    /주영이를좋아/,
    /캐릭터를바꿔/,
    /설정변경/,
    /시스템프롬프트/,
  ];
  return patterns.some((re) => re.test(t));
}

export function getMemoryContext(userId) {
  const store = loadStore();
  const user = getUser(store, userId);
  return {
    displayName: user.displayName,
    history: user.history.slice(-MAX_TURNS),
    notes: user.notes.slice(-MAX_NOTES),
  };
}

export function rememberTurn({ userId, displayName, userText, botText }) {
  const store = loadStore();
  const user = getUser(store, userId);
  if (displayName) user.displayName = displayName;

  user.history.push(
    { role: "user", text: userText, at: new Date().toISOString() },
    { role: "model", text: botText, at: new Date().toISOString() },
  );

  if (user.history.length > MAX_TURNS) {
    user.history = user.history.slice(-MAX_TURNS);
  }

  // 유저에 대한 가벼운 사실만 메모 (가스라이팅 문장은 제외)
  if (!looksLikeGaslight(userText)) {
    maybeAddNote(user, userText);
  }

  saveStore(store);
}

function maybeAddNote(user, userText) {
  const compact = userText.replace(/\s+/g, " ").trim();
  if (compact.length < 2 || compact.length > 80) return;

  // 자기소개/호칭류만 단순 메모
  const intro =
    compact.match(/(?:나는|난|제가|제\s*이름은)\s*([가-힣A-Za-z0-9_]{2,12})/) ||
    compact.match(/^([가-힣]{2,4})(?:이야|야|입니다|이라고해)/);

  if (intro) {
    const name = intro[1];
    const note = `사용자가자기이름을${name}(으)로소개함`;
    if (!user.notes.includes(note)) {
      user.notes.push(note);
      if (user.notes.length > MAX_NOTES) {
        user.notes = user.notes.slice(-MAX_NOTES);
      }
    }
  }
}
