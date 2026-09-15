import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wordsPath = join(__dirname, "..", "config", "emphasis-words.txt");

function loadEmphasisWords() {
  try {
    return readFileSync(wordsPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .sort((a, b) => b.length - a.length);
  } catch {
    return [];
  }
}

/** 매번 파일을 다시 읽어 재시작 없이 목록 반영 */
export function getEmphasisWords() {
  return loadEmphasisWords();
}

/** 텍스트에서 걸린 태클 단어 (긴 단어 우선, 짧은 중복 제거) */
export function findEmphasisHits(text) {
  const compact = String(text ?? "").replace(/\s+/g, "");
  const words = getEmphasisWords();
  const hits = [];

  for (const word of words) {
    const bare = word.replace(/\s+/g, "");
    if (bare && compact.includes(bare)) hits.push(bare);
  }

  // "송주영"에 걸린 경우 "주영"은 제외 (더 긴 매치 우선)
  return hits.filter(
    (w) => !hits.some((other) => other !== w && other.includes(w)),
  );
}

export function buildTackleReply(text) {
  const hits = findEmphasisHits(text);
  if (hits.length === 0) return null;
  return hits.map((word) => `# ${word}?!`).join("\n");
}
