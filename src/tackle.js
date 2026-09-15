import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const tacklePath = join(dataDir, "tackle.json");

function emptyStore() {
  return { guilds: {} };
}

function loadStore() {
  try {
    if (!existsSync(tacklePath)) return emptyStore();
    return JSON.parse(readFileSync(tacklePath, "utf8"));
  } catch {
    return emptyStore();
  }
}

function saveStore(store) {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(tacklePath, JSON.stringify(store, null, 2), "utf8");
}

function scopeKey(guildId) {
  return guildId || "dm";
}

/** 기본값: 꺼짐 (명시적으로 /태클켜기 해야 동작) */
export function isTackleEnabled(guildId) {
  const store = loadStore();
  const key = scopeKey(guildId);
  if (!(key in store.guilds)) return false;
  return store.guilds[key] === true;
}

export function setTackleEnabled(guildId, enabled) {
  const store = loadStore();
  store.guilds[scopeKey(guildId)] = Boolean(enabled);
  saveStore(store);
  return store.guilds[scopeKey(guildId)];
}
