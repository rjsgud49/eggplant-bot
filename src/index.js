import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { askCharacter } from "./ai.js";
import { config } from "./config.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

function parsePrefixMessage(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith(config.prefix)) return null;

  const question = trimmed.slice(config.prefix.length).trim();
  return { question };
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`로그인 완료: ${readyClient.user.tag}`);
  console.log(`접두사: "${config.prefix}"`);
  console.log(
    `초대 링크: https://discord.com/api/oauth2/authorize?client_id=${readyClient.user.id}&permissions=68608&scope=bot%20applications.commands`,
  );
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // Message Content Intent가 꺼져 있으면 content가 비어 옴
  if (!message.content) {
    console.warn(
      `[경고] 메시지 content가 비어 있음 (채널: ${message.channelId}). Developer Portal에서 Message Content Intent를 켜세요.`,
    );
    return;
  }

  console.log(`[수신] ${message.author.tag}: ${message.content}`);

  const parsed = parsePrefixMessage(message.content);
  if (!parsed) return;

  if (!parsed.question) {
    await message.reply(`이렇게 불러줘: \`${config.prefix} 질문내용\``);
    return;
  }

  try {
    await message.channel.sendTyping();
    const answer = await askCharacter(parsed.question);

    // Discord 메시지 한도(2000자) 대비
    const chunks = answer.match(/[\s\S]{1,1900}/g) ?? [answer];
    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  } catch (error) {
    console.error("응답 생성 실패:", error);
    await message.reply("지금은 대답하기 어려워. 잠시 후 다시 말해줘.");
  }
});

client.login(config.discordToken);
