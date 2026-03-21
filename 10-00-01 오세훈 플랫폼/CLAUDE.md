# CLAUDE.md — 오세훈 플랫폼 프로젝트 가이드

> 이 파일은 Claude Code (AI 에이전트)가 이 프로젝트를 이해하고 올바르게 작업하기 위한 컨텍스트 문서입니다.
> 새 세션을 시작할 때 반드시 이 파일을 먼저 읽으세요.

---

## 1. 프로젝트 개요

**프로젝트명**: 오세훈 플랫폼 (Osewhoon Platform)
**목적**: 오세훈 서울시장 후보자를 위한 통합 캠페인 플랫폼
**시작일**: 2026-03-19
**코드 경로**: `10-00-01 오세훈 플랫폼/`

### 목표
- 유권자와 후보자 간 정보 접근성 향상
- AI 기반 정책 챗봇으로 24시간 질의응답 지원
- 선거 전략 데이터 시각화 및 실시간 모니터링
- 캠페인 팀의 태스크 관리 및 협업 지원

### 대상
- **유권자**: 정책 검색, 후보자 정보, AI 챗봇 이용
- **캠페인 팀**: 태스크 관리, KPI 대시보드, 미디어 모니터링
- **관리자**: 콘텐츠 관리, 통계 분석

### 주요 기능 (구현 완료)
| 기능 | 페이지 | 상태 |
|------|--------|------|
| 캠페인 대시보드 | index.html | 완료 |
| 후보자 프로필 | pages/profile.html | 완료 |
| 정책 & 비전 | pages/policies.html | 완료 |
| 뉴스 & 업데이트 | pages/news.html | 완료 |
| AI 챗봇 UI | pages/chatbot.html | 완료 |
| 인터랙티브 맵 | pages/map.html | 완료 |
| 선거 전략 | pages/strategy.html | 완료 |
| 선거지도 | pages/electionmap.html | 완료 |
| 승리 전략 | pages/winningtrategy.html | 완료 |
| AI 어시스턴트 | pages/ai-assistant.html | 완료 |
| 정보 분석 | pages/intelligence.html | 완료 |
| 태스크 관리 | pages/tasks.html | 완료 |
| 미디어 모니터링 | pages/media.html | 완료 |
| 로그인 | pages/login.html | 완료 |

---

## 2. 기술 스택

| 계층 | 기술 | 비고 |
|------|------|------|
| **Frontend** | HTML5, CSS3, vanilla JavaScript (ES6+) | 프레임워크 없음 |
| **UI** | 커스텀 디자인 시스템 (`styles/design-system.css`) | Alpha Squad 설계 |
| **데이터 시각화** | Chart.js | KPI, 통계 차트 |
| **지도** | Leaflet.js | 선거구 히트맵, 지지도 지도 |
| **Backend** | Node.js + Express.js | `server/index.js` |
| **Database** | PostgreSQL 15+ | `server/db/schema.sql` |
| **AI** | Google Gemini API (gemini-2.0-flash) | RAG 기반 정책 답변 |
| **인증** | JWT (JSON Web Token) | `server/middleware/auth.js` |
| **파일 업로드** | Multer (로컬 스토리지) | `server/routes/upload.js` |
| **검색** | PostgreSQL Full-Text Search + BM25 랭킹 | `js/search-engine.js` |
| **테스트** | Playwright (E2E) | `tests/e2e.test.js` |
| **배포** | Vercel + GitHub Actions | `config/deployment.md` |

---

## 3. 아키텍처

### 폴더 구조

```
10-00-01 오세훈 플랫폼/
├── CLAUDE.md                    # 이 파일 — 프로젝트 컨텍스트
├── journal/                     # 개발 저널 (세션 기록)
│   ├── INDEX.md                 # 저널 인덱스 + 타임라인
│   ├── phase-1-gemini-api.md
│   ├── phase-2-auth.md
│   ├── phase-3-stats-api.md
│   ├── phase-4-task-mgmt.md
│   ├── phase-5-mobile.md
│   ├── phase-6-kpi-dashboard.md
│   └── session-2026-03-21.md
│
├── design/                      # 아키텍처 & 설계 문서 (Alpha Squad)
│   ├── 00-platform-architecture.md
│   ├── 01-page-structure.md
│   ├── 02-data-models.md
│   └── 03-design-system.md
│
├── pages/                       # 프론트엔드 페이지 (Bravo Squad)
│   ├── profile.html, policies.html, news.html
│   ├── chatbot.html, map.html, strategy.html
│   ├── electionmap.html, winningtrategy.html
│   ├── ai-assistant.html, intelligence.html
│   ├── tasks.html, login.html
│   └── dashboard.html
│
├── styles/
│   └── design-system.css        # 공통 UI 컴포넌트 스타일
│
├── js/                          # 클라이언트 사이드 JS
│   ├── api.js                   # API 클라이언트 (fetch wrapper)
│   ├── auth.js                  # 클라이언트 인증 (JWT 저장/갱신)
│   ├── nav.js                   # 공통 모바일 네비게이션
│   └── media.js                 # 미디어 업로드
│
├── server/                      # 백엔드 (Charlie Squad)
│   ├── index.js                 # Express 서버 진입점
│   ├── routes/                  # API 라우트
│   │   ├── auth.js, candidate.js, candidates.js
│   │   ├── policies.js, news.js, chat.js
│   │   ├── map.js, search.js, stats.js
│   │   ├── tasks.js, analytics.js
│   │   ├── media.js, locations.js, upload.js
│   ├── middleware/
│   │   ├── auth.js              # JWT 검증 미들웨어
│   │   └── validate.js          # 입력 검증
│   ├── db/
│   │   ├── schema.sql           # PostgreSQL 전체 스키마
│   │   └── migrations/          # DB 마이그레이션
│   └── package.json
│
├── index.html                   # 루트 대시보드 (메인 진입점)
├── PROJECT_CHARTER.md           # 프로젝트 헌장 & 분대 편제
├── CURRENT_STATUS.md            # 현재 진행 상태 (Phase별 완료율)
└── SQUAD_ORDERS.md              # 소대 작전 명령서
```

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `server/index.js` | Express 앱 설정, 미들웨어 연결, 라우트 마운트 |
| `server/db/schema.sql` | 전체 PostgreSQL 스키마 (7개 테이블 + 뷰) |
| `server/middleware/auth.js` | JWT 검증, 역할 기반 접근 제어 |
| `js/api.js` | 모든 API 호출의 공통 fetch wrapper |
| `js/nav.js` | 모바일 사이드 드로어 네비게이션 (공통) |
| `styles/design-system.css` | 전체 UI의 CSS 변수, 컴포넌트 클래스 |

---

## 4. Phase별 개발 현황

| Phase | 내용 | 상태 | 저널 |
|-------|------|------|------|
| Phase 1 | Gemini API 통합 + AI 챗봇 | 완료 | [journal/phase-1-gemini-api.md](journal/phase-1-gemini-api.md) |
| Phase 2 | 사용자 인증 (JWT + 역할 관리) | 완료 | [journal/phase-2-auth.md](journal/phase-2-auth.md) |
| Phase 3 | 통계 API + KPI 데이터 엔드포인트 | 완료 | [journal/phase-3-stats-api.md](journal/phase-3-stats-api.md) |
| Phase 4 | 태스크 관리 (칸반 + API) | 완료 | [journal/phase-4-task-mgmt.md](journal/phase-4-task-mgmt.md) |
| Phase 5 | 모바일 반응형 최적화 | 완료 | [journal/phase-5-mobile.md](journal/phase-5-mobile.md) |
| Phase 6 | KPI 대시보드 + 실시간 알림 | 완료 | [journal/phase-6-kpi-dashboard.md](journal/phase-6-kpi-dashboard.md) |
| Phase 7+ | 문서화 + 자동화 설계 | 진행 중 | [journal/session-2026-03-21.md](journal/session-2026-03-21.md) |

---

## 5. 향후 개선 로드맵

### 단기 (다음 세션)
- [ ] PostgreSQL 실제 연결 (현재 Mock 데이터 사용)
- [ ] 환경변수 설정 (`.env` 파일 — GEMINI_API_KEY, DATABASE_URL)
- [ ] 미디어 모니터링 실시간 데이터 연결
- [ ] 관리자 CMS 페이지 완성 (`pages/admin.html`)

### 중기
- [ ] Gemini API 실 호출 (서버 사이드 → 클라이언트 분리)
- [ ] PostgreSQL 마이그레이션 실행 (`server/db/migrations/`)
- [ ] E2E 테스트 자동화 실행 (Playwright)
- [ ] GitHub Actions CI/CD 파이프라인 활성화

### 장기
- [ ] Vercel 배포
- [ ] Sentry 에러 모니터링 연결
- [ ] i18n 다국어 지원 (한국어/영어)
- [ ] PWA 전환 (오프라인 지원)

---

## 6. 개발 프로세스 — 소대 편제 방식

이 프로젝트는 **Claude Code 멀티 에이전트 소대 편제** 방식으로 개발되었습니다.

### 편제 구조

```
소대장 (Platoon Leader) — 지휘 & 조율
├── Alpha Squad  — 아키텍처 & 설계 (Task #1~4)
├── Bravo Squad  — 프론트엔드 (Task #5~10)
├── Charlie Squad — 백엔드 & API (Task #11~14, #38~42)
├── Delta Squad  — AI & 챗봇 (Task #15~18)
├── Echo Squad   — 검색 & CMS (Task #19~21)
└── Foxtrot Squad — QA & 배포 (Task #22~24)
```

### 운영 원칙
1. **병렬 처리**: 독립적인 분대는 동시에 작업
2. **의존성 관리**: 블로킹 Task 완료 후 다음 단계 진행
3. **Task 시스템**: TaskCreate / TaskUpdate / TaskGet으로 진행 추적
4. **보고 체계**: 각 분대장 → 소대장 (지휘관에게 직접 보고 금지)
5. **산출물 기준**: 각 Task는 구체적인 파일 산출물을 가짐

### 새 세션 시작 시
1. 이 파일(`CLAUDE.md`) 읽기
2. `journal/INDEX.md` 읽기 (타임라인 파악)
3. `CURRENT_STATUS.md` 읽기 (현재 진행 상태 확인)
4. TaskList 확인 (미완료 Task 파악)
5. 작업 시작

---

## 7. 주요 API 엔드포인트

| 메서드 | 경로 | 기능 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET | `/api/candidates` | 후보자 목록 |
| GET | `/api/policies` | 정책 목록 (검색/필터) |
| GET | `/api/news` | 뉴스 목록 |
| POST | `/api/chat` | Gemini AI 챗봇 응답 |
| GET | `/api/stats` | KPI 통계 데이터 |
| GET/POST | `/api/tasks` | 태스크 CRUD |
| GET | `/api/analytics` | 분석 데이터 |
| GET | `/api/map/locations` | 지도 위치 데이터 |

---

*최종 업데이트: 2026-03-21 | 작성: Charlie Squad*
