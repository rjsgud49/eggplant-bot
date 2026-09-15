import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const model = genAI.getGenerativeModel({
  model: config.geminiModel,
  systemInstruction: config.characterPrompt,
});

export async function askCharacter(question) {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: question }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 180,
    },
  });

  const answer = result.response.text()?.trim();
  if (!answer) {
    throw new Error("모델이 빈 응답을 반환했습니다.");
  }

  return answer;
}
