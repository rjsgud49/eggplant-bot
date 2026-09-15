import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`.env에 ${name} 값이 필요합니다. .env.example를 참고하세요.`);
  }
  return value;
}

export const config = {
  discordToken: requireEnv("DISCORD_TOKEN"),
  geminiApiKey: requireEnv("GEMINI_API_KEY"),
  geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash",
  prefix: "가지야",
  characterPrompt: readFileSync(join(rootDir, "prompts", "character.txt"), "utf8").trim(),
};
