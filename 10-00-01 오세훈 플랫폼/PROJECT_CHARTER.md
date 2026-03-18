# 오세훈 플랫폼 (Osewhoon Platform)
## 서울시장 후보자 캠페인 플랫폼

**프로젝트 코드명**: osewhoon-platoon
**규모**: Large (20 points)
**시작일**: 2026-03-19
**상태**: 🚀 Phase 7 - Operational Commencement

---

## 1. 프로젝트 개요

오세훈 서울시장 후보자를 위한 통합 캠페인 플랫폼입니다. 후보자의 정책, 뉴스, 프로필, AI 챗봇, 인터랙티브 지도 등을 통합하여 유권자와의 관계를 구축하고 선거 전략을 지원합니다.

### 23개 핵심 기능
1. **후보자 대시보드** - 주요 성과, 일정, 통계
2. **프로필 페이지** - 이력, 성과, 추천인
3. **정책 및 비전** - 정책 검색, 비교, 다운로드
4. **뉴스 & 업데이트** - 피드, 검색, 구독
5. **AI 챗봇** - RAG 기반 정책 답변
6. **인터랙티브 맵** - 위치, 이벤트, 지지도
7. **콘텐츠 관리** - 뉴스, 정책, 프로필 관리
8. **전체 검색** - 모든 콘텐츠 검색
9. **사용자 인증** - JWT, 역할 기반 접근
10. **파일 업로드** - 미디어, 문서 관리
11-23. *추가 기능 (UI/UX, 성능, 보안, i18n 등)*

---

## 2. 조직 구조 (6개 분대, 24개 Task)

```
osewhoon-platoon (총 42명)
├── HQ (본부)
│   ├── 소대장 (Team Lead)
│   └── 연락병 (Comms)
│
├── 1분대: Alpha (아키텍처 & 설계) — 4 Task
├── 2분대: Bravo (프론트엔드) — 6 Task
├── 3분대: Charlie (백엔드 & API) — 4 Task
├── 4분대: Delta (AI & 챗봇) — 4 Task
├── 5분대: Echo (검색, 지도, CMS) — 3 Task
└── 6분대: Foxtrot (QA, 테스트, 배포) — 3 Task
```

---

## 3. 프로젝트 구조 (디렉토리 맵)

```
10-00-01 오세훈 플랫폼/
├── .claude/                 # 프로젝트 설정
│   └── team-config.json     # 팀 구성
├── design/                  # Alpha 산출물 (설계 문서)
│   ├── 01-architecture.md   # 시스템 아키텍처
│   ├── 02-sitemap.md        # 사이트맵, 페이지 구조
│   ├── 03-data-models.md    # 데이터 모델링
│   └── 04-design-system.md  # UI 컴포넌트, CSS 변수
│
├── public/                  # 정적 파일
│   ├── index.html           # 메인 홈페이지
│   └── assets/              # 이미지, 폰트
│
├── pages/                   # Bravo 산출물 (프론트엔드 페이지)
│   ├── profile.html         # 후보자 프로필
│   ├── policies.html        # 정책 & 비전
│   ├── news.html            # 뉴스 & 업데이트
│   ├── chatbot.html         # AI 챗봇
│   └── map.html             # 인터랙티브 맵
│
├── styles/                  # Bravo 산출물 (CSS)
│   ├── design-system.css    # Alpha가 정의한 디자인 시스템
│   ├── components.css       # 컴포넌트 스타일
│   └── responsive.css       # 반응형 디자인
│
├── js/                      # Charlie 산출물 (클라이언트 JS)
│   ├── api.js               # API 클라이언트
│   ├── mock-data.js         # Mock 데이터
│   ├── auth.js              # 인증 (클라이언트)
│   └── media.js             # 미디어 업로드
│
├── server/                  # Charlie 산출물 (백엔드)
│   ├── index.js             # 메인 서버
│   ├── routes/              # API 라우트
│   │   ├── candidate.js
│   │   ├── policies.js
│   │   ├── news.js
│   │   ├── chat.js
│   │   ├── map.js
│   │   ├── auth.js
│   │   └── upload.js
│   ├── services/            # 비즈니스 로직
│   │   ├── gemini-service.js        # Delta
│   │   ├── rag-engine.js            # Delta
│   │   ├── recommendation-service.js # Delta
│   │   ├── search-service.js        # Echo
│   │   └── cms-service.js           # Echo
│   ├── middleware/          # 인증, 검증
│   │   ├── auth.js
│   │   └── validate.js
│   ├── db/                  # 데이터베이스
│   │   ├── schema.sql       # PostgreSQL 스키마
│   │   ├── migrations/      # DB 마이그레이션
│   │   └── seeds/           # Mock 데이터
│   └── config/              # 환경 설정
│       └── database.md      # DB 설정 가이드
│
├── tests/                   # Foxtrot 산출물
│   ├── e2e/                 # Playwright E2E 테스트
│   │   ├── home.spec.js
│   │   ├── profile.spec.js
│   │   ├── policies.spec.js
│   │   ├── news.spec.js
│   │   ├── chatbot.spec.js
│   │   └── map.spec.js
│   ├── accessibility.md     # WCAG AA 감사
│   └── performance.md       # Lighthouse 최적화
│
├── i18n/                    # Foxtrot 산출물 (국제화)
│   ├── ko.json              # 한국어
│   └── en.json              # 영어
│
├── .github/
│   └── workflows/           # Foxtrot 산출물 (GitHub Actions)
│       ├── test.yml         # E2E 테스트 CI
│       └── deploy.yml       # 자동 배포
│
├── docs/                    # 문서
│   ├── API.md               # API 문서
│   ├── SETUP.md             # 개발 환경 설정
│   └── DEPLOYMENT.md        # 배포 가이드
│
├── .env.example             # 환경변수 템플릿
├── package.json             # Node.js 의존성
├── Dockerfile               # Docker 설정
└── README.md                # 프로젝트 개요
```

---

## 4. 기술 스택

| 계층 | 기술 |
|------|------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **UI Framework** | 커스텀 컴포넌트 라이브러리 (Alpha 제공) |
| **Data Viz** | Chart.js, D3.js |
| **Maps** | Leaflet.js 또는 Mapbox GL |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL 15+ |
| **AI** | Google Gemini API (RAG) |
| **File Storage** | AWS S3 또는 로컬 |
| **Search** | PostgreSQL Full-Text Search |
| **Testing** | Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Docker + Vercel / AWS |
| **Monitoring** | Sentry, Datadog |

---

## 5. 분대별 작업 할당

### Alpha Squad (1분대) — 아키텍처 & 설계
**분대장**: Alpha
**Task**: #1, #2, #3, #4 (4개)

| # | Task | 담당 | 산출물 |
|---|------|------|--------|
| 1 | 시스템 아키텍처 설계 | Alpha-1 | design/01-architecture.md |
| 2 | 페이지 구조 & 와이어프레임 | Alpha-2 | design/02-sitemap.md + 와이어프레임 |
| 3 | 데이터 모델링 | Alpha-3 | design/03-data-models.md |
| 4 | UI 컴포넌트 라이브러리 | Alpha-4 | design/04-design-system.md + styles/design-system.css |

**의존성**: 없음 (최우선)
**블로킹**: Bravo, Charlie, Delta, Echo, Foxtrot (모두 대기)

---

### Bravo Squad (2분대) — 프론트엔드 개발
**분대장**: Bravo
**Task**: #5, #6, #7, #8, #9, #10 (6개)

| # | Task | 담당 | 페이지 |
|---|------|------|--------|
| 5 | 대시보드 홈페이지 | Bravo-1 | public/index.html |
| 6 | 후보자 프로필 | Bravo-2 | pages/profile.html |
| 7 | 정책 & 비전 | Bravo-3 | pages/policies.html |
| 8 | 뉴스 & 업데이트 | Bravo-4 | pages/news.html |
| 9 | AI 챗봇 UI | Bravo-5 | pages/chatbot.html |
| 10 | 인터랙티브 맵 | Bravo-6 | pages/map.html |

**의존성**: Alpha (Task #4 완료 후)
**CSS 제공**: Alpha의 design-system.css
**API 준비**: Charlie와 병렬 진행

---

### Charlie Squad (3분대) — 백엔드 & API
**분대장**: Charlie
**Task**: #11, #12, #13, #14 (4개)

| # | Task | 담당 | 산출물 |
|---|------|------|--------|
| 11 | REST API 엔드포인트 | Charlie-1 | server/routes/ |
| 12 | 데이터베이스 스키마 | Charlie-2 | server/db/schema.sql |
| 13 | 인증 & 권한 | Charlie-3 | server/middleware/auth.js |
| 14 | 파일 업로드 | Charlie-4 | server/services/media.js |

**의존성**: Alpha (Task #3 완료 후)
**API Spec 제공**: Alpha의 design/01-architecture.md
**의존 관계**:
  - Task #12 먼저 (DB 스키마)
  - Task #13 (인증 미들웨어)
  - Task #11 (API 엔드포인트)
  - Task #14 (파일 업로드)

---

### Delta Squad (4분대) — AI & 챗봇 통합
**분대장**: Delta
**Task**: #15, #16, #17, #18 (4개)

| # | Task | 담당 | 산출물 |
|---|------|------|--------|
| 15 | Gemini API 통합 | Delta-1 | server/services/gemini-service.js |
| 16 | RAG 엔진 | Delta-2 | server/services/rag-engine.js |
| 17 | 추천 시스템 | Delta-3 | server/services/recommendation-service.js |
| 18 | 챗봇 통합 | Delta-4 | server/controllers/chatbot-controller.js |

**의존성**: Charlie (Task #11 완료 후)
**API 엔드포인트 필요**: Charlie의 /api/chat 구현
**콘텐츠 필요**: Alpha의 정책 데이터 + Bravo의 뉴스/프로필

---

### Echo Squad (5분대) — 검색, 지도, CMS
**분대장**: Echo
**Task**: #19, #20, #21 (3개)

| # | Task | 담당 | 산출물 |
|---|------|------|--------|
| 19 | 검색 엔진 | Echo-1 | server/services/search-service.js |
| 20 | 인터랙티브 지도 | Echo-2 | server/services/map-service.js |
| 21 | CMS 백엔드 | Echo-3 | server/controllers/cms-controller.js |

**의존성**: Charlie (Task #11 완료 후)
**UI 필요**: Bravo의 map.html (Task #10) 및 ChatBot 이 완료된 후

---

### Foxtrot Squad (6분대) — QA, 테스트, 배포
**분대장**: Foxtrot
**Task**: #22, #23, #24 (3개)

| # | Task | 담당 | 산출물 |
|---|------|------|--------|
| 23 | 접근성 & i18n | Foxtrot-2 | i18n/, tests/accessibility.md |
| 22 | E2E 테스트 | Foxtrot-1 | tests/e2e/ |
| 24 | 배포 & 모니터링 | Foxtrot-3 | Dockerfile, .github/workflows/ |

**의존성**: 모든 분대 완료 후
**테스트 대상**: Bravo의 모든 페이지, Charlie의 모든 API
**병렬 가능**:
  - Task #23 (페이지 완성 후 접근성 검증)
  - Task #22 (E2E 테스트)
  - Task #24 (배포 파이프라인 준비)

---

## 6. 작전 일정 (Timeline)

```
Phase 7: Operational Commencement ✅ (2026-03-19 현재)
├─ Task #1~4 (Alpha): 설계 문서 (병렬, 1-2시간)
├─ Task #5~10 (Bravo): 페이지 개발 (Alpha 완료 후, 2-3시간)
├─ Task #11~14 (Charlie): API & DB (Alpha 완료 후, 2-3시간)
├─ Task #15~18 (Delta): AI 통합 (Charlie #11 완료 후, 1-2시간)
├─ Task #19~21 (Echo): 검색 & CMS (Charlie #11 완료 후, 1-2시간)
└─ Task #22~24 (Foxtrot): QA & 배포 (모든 분대 완료 후, 1-2시간)

예상 총 소요 시간: 6-8시간 (병렬 처리)
```

---

## 7. 소대 운영 원칙

✅ **병렬 처리**: 독립적인 분대는 동시 작업
✅ **의존성 관리**: 블로킹 작업은 완료 후 진행
✅ **보고 체계**: 각 Task 완료 후 소대장에게 보고
✅ **문제 해결**: 분대장이 자율 판단 (지휘관 상호작용 금지)

---

## 8. 작전 현황

| 상태 | 분대 | 상태 |
|------|------|------|
| 🚀 활성화 | Alpha | ✅ Task #1~4 시작 |
| 🚀 활성화 | Bravo | ✅ Task #5~10 시작 (Alpha 대기) |
| 🚀 활성화 | Charlie | ✅ Task #11~14 시작 (Alpha 대기) |
| 🚀 활성화 | Delta | ✅ Task #15~18 대기 (Charlie) |
| 🚀 활성화 | Echo | ✅ Task #19~21 대기 (Charlie) |
| 🚀 활성화 | Foxtrot | ✅ Task #22~24 대기 (완료) |

---

**소대 편성**: 2026-03-19
**작전 개시**: 2026-03-19 Phase 7 ✅
**다음 단계**: Phase 8 (임무 수행)

