# eggplant-bot (가지야)

두 가지 기능이 **완전히 분리**되어 있습니다.

1. **가지야 챗봇** — 페텔기우스 문답 (Gemini)
2. **태클** — 일반 채팅에서 지정 단어 감지 시 `# 단어?!` 반응 (LLM 없음)

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

4. 태클 단어 설정 (선택)

`config/emphasis-words.txt`에 한 줄에 하나씩 적습니다.

5. 실행

```bash
npm start
```

## 사용법

### 1) 가지야 챗봇 (페텔기우스)

```text
가지야 오늘 기분 어때?
```

### 2) 태클 기능 (별개)

일반 채팅에 지정 단어가 나오면 봇이 `# 단어?!`로만 반응합니다.  
가지야/페텔기우스 말투와 무관합니다. (기본: OFF)

```text
/태클켜기
/태클끄기
/태클상태
```

예시: 단어 `송주영`이 목록에 있고 태클 ON인 상태에서 누가 `송주영 봤어`라고 하면

```text
# 송주영?!
```

## 필요한 키 (`.env`)

| 키 | 설명 | 발급처 |
| --- | --- | --- |
| `DISCORD_TOKEN` | 봇 토큰 | [Discord Developer Portal](https://discord.com/developers/applications) → Application → Bot → Reset Token |
| `GEMINI_API_KEY` | Gemini API 키 (필수, 가지야용) | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_API_KEY2` | (선택) 예비 키. 1번 한도 초과 시 자동 사용 | 동일 |
| `GEMINI_API_KEY3` | (선택) 추가 예비 키 | 동일 |
| `GEMINI_MODEL` | (선택) 모델명. 기본 `gemini-2.5-flash` | Gemini 모델 목록 |

### Discord 봇 권한 체크리스트

- Bot 탭에서 **Message Content Intent** 활성화
- 초대 시 권한: `Send Messages`, `Read Message History`, `View Channels`

## 파일 구조

```text
.env.example                 # 키 템플릿
config/emphasis-words.txt    # 태클 단어 목록
prompts/character.txt        # 페텔기우스 프롬프트
src/tackle.js                # 태클 on/off 저장
src/emphasis.js              # 태클 단어 감지
src/memory.js                # 가지야 유저 기억
src/ai.js                    # Gemini (가지야 전용)
src/index.js                 # 디스코드 봇 진입점
```
