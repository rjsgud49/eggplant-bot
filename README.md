# eggplant-bot (가지야)

`가지야` 접두사로 호출하는 단순 문답 디스코드 봇입니다. LLM은 Google Gemini를 사용합니다.

## 빠른 시작

1. 의존성 설치

```bash
npm install
```

2. 키 설정

```bash
cp .env.example .env
```

`.env`에 값을 채웁니다. (키 목록은 아래 참고)

3. 캐릭터 프롬프트 작성

`prompts/character.txt`에 원하는 캐릭터 설정을 넣습니다.

4. 실행

```bash
npm start
```

## 사용법

디스코드 채널에서:

```text
가지야 오늘 기분 어때?
```

## 필요한 키 (`.env`)

| 키 | 설명 | 발급처 |
| --- | --- | --- |
| `DISCORD_TOKEN` | 봇 토큰 | [Discord Developer Portal](https://discord.com/developers/applications) → Application → Bot → Reset Token |
| `GEMINI_API_KEY` | Gemini API 키 | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | (선택) 모델명. 기본 `gemini-3.6-flash` | Gemini 모델 목록 |

### Discord 봇 권한 체크리스트

- Bot 탭에서 **Message Content Intent** 활성화
- 초대 시 권한: `Send Messages`, `Read Message History`, `View Channels`

## 파일 구조

```text
.env.example          # 키 템플릿
prompts/character.txt # 캐릭터 프롬프트 (직접 수정)
src/config.js         # 환경변수/프롬프트 로드
src/ai.js             # Gemini 호출
src/index.js          # 디스코드 봇 진입점
```
