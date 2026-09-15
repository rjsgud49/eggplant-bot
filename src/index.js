import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { askCharacter } from "./ai.js";
import { config } from "./config.js";
import { getMemoryContext, rememberTurn } from "./memory.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

/** 같은 메시지에 중복 응답 방지 */
const handling = new Set();

function parsePrefixMessage(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith(config.prefix)) return null;

  const question = trimmed.slice(config.prefix.length).trim();
  return { question };
}

function toSingleReply(answer) {
  const text = answer.replace(/\s+/g, "").trim();
  if (text.length <= 1900) return text;
  return `${text.slice(0, 1890)}……`;
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`로그인 완료: ${readyClient.user.tag}`);
  console.log(`접두사: "${config.prefix}"`);
  console.log(`PID: ${process.pid}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content) return;

  const parsed = parsePrefixMessage(message.content);
  if (!parsed) return;

  if (handling.has(message.id)) return;
  handling.add(message.id);
  setTimeout(() => handling.delete(message.id), 60_000);

  if (!parsed.question) {
    await message.reply(`이렇게 불러줘: \`${config.prefix} 질문내용\``);
    return;
  }

  console.log(`[수신] ${message.author.tag}: ${message.content}`);

  try {
    await message.channel.sendTyping();
    const memory = getMemoryContext(message.author.id);
    const answer = await askCharacter(parsed.question, memory);
    const reply = toSingleReply(answer);

    rememberTurn({
      userId: message.author.id,
      displayName: message.member?.displayName || message.author.displayName || message.author.username,
      userText: parsed.question,
      botText: reply,
    });

    await message.reply(reply);
  } catch (error) {
    console.error("응답 생성 실패:", error);
    const isQuota =
      error?.status === 429 ||
      String(error?.message ?? "").includes("Too Many Requests") ||
      String(error?.message ?? "").includes("quota");
    await message.reply(
      isQuota
        ? "아아아!!!!!시련이다!!!!!API한도가바닥났다!!!!!잠시후다시불러라아아아!!!!!"
        : "지금은 대답하기 어려워. 잠시 후 다시 말해줘.",
    );
  }
});

client.login(config.discordToken);
