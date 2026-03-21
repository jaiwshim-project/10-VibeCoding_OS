# Phase 01 — Gemini 2.0 Flash API 연동

**작성자:** Alpha 분대장
**작성일:** 2026-03-21
**커밋:** `8d674a9` (최초 구현) → `916c615` (고도화)
**담당 분대:** Alpha 분대 (api-developer + backend-developer)

---

## 1. 임무 (What)

오세훈 캠프 플랫폼의 AI 어시스턴트 기능에서 목업 응답 대신 **Gemini 2.0 Flash API 실제 호출**을 구현한다. 백엔드 `server/routes/chat.js`의 `generateAIResponse()` 함수를 실제 API 연동으로 전환하고, 프론트엔드 `pages/ai-assistant.html`을 fetch API 기반 실제 통신으로 교체한다.

**변경 범위:**
- `server/routes/chat.js` — AI 응답 생성 함수 전환
- `pages/ai-assistant.html` — 프론트엔드 fetch 통신 구현
- `server/package.json` — `@google/generative-ai` 의존성 추가

---

## 2. 배경/맥락 (Why)

초기 플랫폼은 모든 AI 응답을 하드코딩된 목업 텍스트로 반환하고 있었다. 캠프 내부 스태프가 실제로 활용하려면 선거 전략·정책·판세 분석을 실시간으로 질의할 수 있는 **진짜 AI가 필요**했다.

기술 선택 배경:
- **Gemini 2.0 Flash**: 응답 속도가 빠르고 비용 효율적. 캠프 환경처럼 빈번한 질의가 예상되는 시나리오에 적합.
- **RAG(Retrieval-Augmented Generation)**: 이미 구축된 정책 DB 컨텍스트를 AI에게 주입하여 캠프 맞춤 응답 품질 향상.
- **서버사이드 API 호출**: API 키를 클라이언트에 노출하지 않기 위해 모든 Gemini 호출은 Node.js 서버에서만 처리.

---

## 3. 설계 결정 (Decisions)

| 결정 사항 | 선택 | 대안 / 이유 |
|---|---|---|
| AI 모델 | `gemini-2.0-flash` | gemini-1.5-pro 대비 레이턴시 우위, 비용 절감 |
| 프롬프트 구조 | systemInstruction + contextText + userMessage | 역할 고정 + 컨텍스트 분리로 응답 품질 제어 |
| 토큰 카운팅 | 문자 길이 기반 근사치 (`/ 4`) | Gemini API 정확한 토큰 API는 별도 설정 필요, 빠른 구현 우선 |
| 에러 폴백 | API 키 미설정 시 사용자 안내 메시지 반환 | 서버 500 오류 대신 graceful degradation |
| 세션 관리 | `crypto.randomBytes(16)` 기반 sessionId | UUID 라이브러리 불필요, Node.js 내장 모듈 활용 |

**시스템 프롬프트 설계 원칙:**
```
- 역할: 캠프 내부 스태프 전용 선거 전략·정책·판세 분석 전문가
- 대상: 후보자 본인과 캠프 스태프만 (대외비)
- 언어: 한국어 전용
- 제약: 공개된 정보만 활용, 개인정보 보호 준수
```

---

## 4. 구현 상세 (How)

### 4-1. 서버 측 Gemini 연동 (`server/routes/chat.js`)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAIResponse(userMessage, ragContext) {
  // RAG 컨텍스트 포매팅 → 시스템 프롬프트 설정 → API 호출
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(fullPrompt);
  const aiMessage = result.response.text();
  const estimatedTokens = Math.ceil(fullPrompt.length / 4 + aiMessage.length / 4);
  return { message: aiMessage, model: 'gemini-2.0-flash', tokens: estimatedTokens };
}
```

### 4-2. RAG 컨텍스트 주입 방식

```
[POLICY] 오세훈 주요 정책 — 내용...
[STRATEGY] 선거 전략 문서 — 내용...
```
`source_type`을 대문자 태그로 표시하여 AI가 출처 유형을 구분하도록 설계.

### 4-3. 프론트엔드 통신 (`pages/ai-assistant.html`)

- `POST /api/chat/send` 엔드포인트 호출
- sessionId는 페이지 로드 시 자동 생성, localStorage에 저장
- 응답 에러 시 사용자 친화적 메시지 표시

### 4-4. 엔드포인트 구조

```
POST /api/chat/start    — 세션 시작
POST /api/chat/send     — 메시지 전송 및 AI 응답
GET  /api/chat/:id      — 히스토리 조회
DELETE /api/chat/:id    — 세션 삭제
```

---

## 5. 이슈/해결 (Issues)

| 이슈 | 원인 | 해결 |
|---|---|---|
| API 키 미설정 시 서버 크래시 | `process.env.GEMINI_API_KEY` undefined | `try/catch` + `error.message.includes('API key')` 분기 처리 |
| 토큰 정보 부정확 | Gemini Flash는 별도 토큰 집계 설정 필요 | 문자 길이 / 4 근사치로 대체, TODO로 남김 |
| 클라이언트 sessionId 동기화 | 페이지 새로고침 시 세션 유실 | localStorage 저장으로 해결 |
| RAG 소스 없을 때 컨텍스트 공백 | 정책 DB 비어있는 경우 | `sources.length > 0` 조건부 컨텍스트 생성 |

---

## 6. 연계사항 (Dependencies)

- **선행 조건:** `server/middleware/auth.js` — `verifyToken`, `optionalAuth`, `sendError`, `sendSuccess` 미들웨어 존재 필요
- **환경 변수:** `.env`에 `GEMINI_API_KEY` 설정 필수
- **패키지:** `@google/generative-ai` npm 패키지 설치 필요 (`server/package.json` 추가됨)
- **DB:** `candidates` 테이블 — 채팅 세션 시작 시 후보자 존재 검증에 사용
- **후속 Phase:** Phase 2(인증)에서 AI 어시스턴트 페이지에 `auth.js`가 추가되어 로그인 필수 보호 페이지로 전환됨

---

## 7. 향후 과제 (TODO)

- [ ] 정확한 토큰 사용량 집계 — Gemini API `usageMetadata` 활용으로 전환
- [ ] 대화 히스토리를 PostgreSQL에 영속 저장 (현재 메모리 기반)
- [ ] Gemini 모델 버전 관리 — 환경 변수 `GEMINI_MODEL`로 외부화
- [ ] 스트리밍 응답 지원 (`generateContentStream`) — 긴 응답 UX 개선
- [ ] 프롬프트 인젝션 방어 강화 — 입력 sanitization 추가
- [ ] RAG 소스 품질 평가 지표 도입 (relevance score)
