# 소대 작전 명령서 (Squad Deployment Orders)
## osewhoon-platoon — Phase 7 Operational Commencement

**발행일**: 2026-03-19
**명령 발령**: Phase 7 작전 개시
**상태**: 🚀 ACTIVE

---

## 🔴 全 분대장에게: 작전 개시 명령

### 명령 요약
**✅ 지휘관 승인 완료**
- Write 도구 권한: **허용됨** ✅
- Bash 도구 권한: **허용됨** ✅
- 모든 분대: **작전 개시** 명령 발령

### 각 분대장에게

**당신들은 Phase 7 작전 개시 명령을 수령했습니다.**

1. TaskList를 새로고침하여 할당된 Task를 확인하세요
2. 각 Task를 Claim (owner 설정)하고 in_progress로 변경하세요
3. Task의 세부 작업을 분해하여 병력(SubAgent)을 투입하세요
4. 각 Task 완료 후 결과를 소대장에게 보고하세요

**지휘관(User)에게 직접 보고하지 마세요. 모든 보고는 소대장에게만.**

---

## Alpha Squad (1분대) — 아키텍처 & 설계

**분대장**: Alpha
**배정 Task**: #1, #2, #3, #4
**우선순위**: 🔴 최고 (블로킹 작업)

### 작전 명령

| Task | 제목 | 산출물 |
|------|------|--------|
| #1 | 시스템 아키텍처 설계 | design/01-architecture.md |
| #2 | 페이지 구조 & 와이어프레임 | design/02-sitemap.md |
| #3 | 데이터 모델링 | design/03-data-models.md |
| #4 | UI 컴포넌트 라이브러리 | design/04-design-system.md + styles/design-system.css |

### 핵심 협력 분대
- Bravo: Task #4 완료 후 design-system.css 수령
- Charlie: Task #1, #3 완료 후 API 스펙 수령
- Delta: Task #3 완료 후 데이터 모델 수령

### 작전 요령
1. **병렬 작업**: Task #1, #2, #3는 병렬 진행 가능
2. **Task #4는 마지막**: CSS 컴포넌트는 #1~#3 검토 후 작성
3. **품질 우선**: 모든 설계 문서는 구체적이고 실행 가능해야 함

---

## Bravo Squad (2분대) — 프론트엔드 개발

**분대장**: Bravo
**배정 Task**: #5, #6, #7, #8, #9, #10 (6개 페이지)
**의존성**: Alpha Task #4 완료 필요
**우선순위**: 🟡 높음

### 작전 명령

| Task | 제목 | 페이지 | 의존성 |
|------|------|--------|--------|
| #5 | 대시보드 홈페이지 | public/index.html | Alpha #1, #4 |
| #6 | 후보자 프로필 | pages/profile.html | Alpha #3, #4 |
| #7 | 정책 & 비전 | pages/policies.html | Alpha #3, #4 |
| #8 | 뉴스 & 업데이트 | pages/news.html | Alpha #3, #4 |
| #9 | AI 챗봇 UI | pages/chatbot.html | Alpha #4 |
| #10 | 인터랙티브 맵 | pages/map.html | Alpha #4 |

### 핵심 협력 분대
- Alpha: design-system.css, 컴포넌트 스펙
- Charlie: API 엔드포인트 (Task #11)
- Delta: 챗봇 로직 (Task #15~18)
- Echo: 지도 로직 (Task #20), 검색 로직 (Task #19)

### 작전 요령
1. **Task 순서**: #5 (홈) → #6,7,8 (병렬) → #9,10 (병렬, Charlie #11 완료 후)
2. **Mock 데이터 활용**: Charlie API 완료 전까지 mock 데이터 사용
3. **반응형 필수**: 모든 페이지는 모바일·태블릿·데스크톱 지원
4. **접근성 기본**: ARIA 라벨, 키보드 네비게이션 준수

---

## Charlie Squad (3분대) — 백엔드 & API

**분대장**: Charlie
**배정 Task**: #11, #12, #13, #14
**의존성**: Alpha Task #1, #3 완료 필요
**우선순위**: 🟡 높음 (블로킹 분대 많음)

### 작전 명령

| Task | 제목 | 산출물 | 의존성 |
|------|------|--------|--------|
| #12 | DB 스키마 설계 | server/db/schema.sql | Alpha #3 |
| #13 | 인증 & 권한 | server/middleware/auth.js | Alpha #3, #12 |
| #11 | REST API | server/routes/ | Alpha #1, #13 |
| #14 | 파일 업로드 | js/media.js | #11 |

### 개발할 API 엔드포인트 (최소 30개)
- **Candidate**: GET /candidate
- **Policies**: GET, POST, PUT, DELETE /policies
- **News**: GET, POST, PUT, DELETE /news
- **Chat**: POST /chat/send, GET /chat/history
- **Map**: GET /map/locations
- **Auth**: POST /auth/signup, /login, /refresh
- **Upload**: POST /upload, GET /files, DELETE /files
- **Analytics**: POST /analytics/track (선택)

### 핵심 협력 분대
- Alpha: API 스펙 (design/01-architecture.md)
- Bravo: API 호출 (js/api.js)
- Delta: Chatbot 엔드포인트 필요
- Echo: Search 엔드포인트, CMS 엔드포인트

### 작전 요령
1. **Task 순서**: #12 (DB) → #13 (인증) → #11 (API) → #14 (파일)
2. **Mock 데이터**: schema.sql에서 seeds 포함
3. **보안 우선**: SQL injection, CSRF 방지
4. **문서화**: 모든 엔드포인트는 OpenAPI 스펙 작성

---

## Delta Squad (4분대) — AI & 챗봇 통합

**분대장**: Delta
**배정 Task**: #15, #16, #17, #18
**의존성**: Charlie Task #11 완료 필요
**우선순위**: 🟡 높음

### 작전 명령

| Task | 제목 | 산출물 | 의존성 |
|------|------|--------|--------|
| #15 | Gemini API 통합 | server/services/gemini-service.js | Charlie #11 |
| #16 | RAG 엔진 | server/services/rag-engine.js | Alpha #3 + #15 |
| #17 | 추천 시스템 | server/services/recommendation-service.js | #16 |
| #18 | 챗봇 통합 | server/controllers/chatbot-controller.js | Bravo #9 + #17 |

### 개발할 기능
1. **Gemini API 호출** (프롬프트 템플릿, 토큰 관리)
2. **RAG 엔진** (정책 문서 임베딩, 벡터 검색)
3. **추천 알고리즘** (콘텐츠 기반 필터링)
4. **대화 관리** (메시지 히스토리, 컨텍스트)

### 핵심 협력 분대
- Alpha: 정책 데이터 모델 (design/03-data-models.md)
- Charlie: Chat API 엔드포인트 (Task #11)
- Bravo: Chatbot UI (Task #9)

### 작전 요령
1. **Task 순서**: #15 (Gemini) → #16 (RAG) → #17 (추천) → #18 (통합)
2. **API 키 관리**: .env 파일로 안전하게 관리
3. **응답 속도**: RAG 검색 최적화 (5초 이내)

---

## Echo Squad (5분대) — 검색, 지도, CMS

**분대장**: Echo
**배정 Task**: #19, #20, #21
**의존성**: Charlie Task #11 완료 필요
**우선순위**: 🟡 높음

### 작전 명령

| Task | 제목 | 산출물 | 의존성 |
|------|------|--------|--------|
| #19 | 검색 엔진 | server/services/search-service.js | Charlie #11 |
| #20 | 지도 통합 | server/services/map-service.js | Bravo #10 + #19 |
| #21 | CMS 백엔드 | server/controllers/cms-controller.js | Charlie #11 |

### 개발할 기능
1. **Full-Text Search** (뉴스, 정책, 이벤트 검색)
2. **지도 API** (위치, 클러스터링, 히트맵)
3. **CMS 엔드포인트** (뉴스/정책 관리, 승인 워크플로우)

### 핵심 협력 분대
- Charlie: API 기반 (Task #11)
- Bravo: 지도 UI (Task #10)

### 작전 요령
1. **Task 순서**: #19 (검색) → #20 (지도) → #21 (CMS)
2. **성능 최적화**: 인덱싱으로 검색 속도 개선
3. **지도 성능**: 마커 클러스터링으로 성능 보장

---

## Foxtrot Squad (6분대) — QA, 테스트, 배포

**분대장**: Foxtrot
**배정 Task**: #22, #23, #24
**의존성**: 모든 분대 완료 필요
**우선순위**: 🟢 보통 (마지막 단계)

### 작전 명령

| Task | 제목 | 산출물 | 의존성 |
|------|------|--------|--------|
| #23 | 접근성 & i18n | i18n/, tests/accessibility.md | Bravo #5~10 |
| #22 | E2E 테스트 | tests/e2e/ | Bravo #5~10 |
| #24 | 배포 & 모니터링 | Dockerfile, .github/workflows/ | 모든 분대 |

### 개발할 기능
1. **WCAG 2.1 AA 접근성** (색상 대비, 키보드 네비게이션, 스크린 리더)
2. **i18n** (한국어/영어, 언어 선택 UI)
3. **E2E 테스트** (Playwright, 6개 페이지)
4. **배포 파이프라인** (GitHub Actions, Docker, CI/CD)

### 핵심 협력 분대
- Bravo: 접근성 검증 대상 (Task #5~10)
- Charlie: API 테스트 대상
- 모든 분대: QA 및 배포

### 작전 요령
1. **병렬 가능**: #22, #23은 병렬 진행
2. **테스트 커버리지**: 80% 이상
3. **WCAG AA**: 자동 감사 + 수동 감사

---

## 작전 요령 (모든 분대)

### ✅ DO (할 것)
- ✅ TaskList 정기적으로 확인 (Task 할당 상태 확인)
- ✅ 각 Task별 서브 에이전트 투입 (병력 활용)
- ✅ Task 완료 후 소대장에게 보고
- ✅ 의존성 명확히 파악 후 시작
- ✅ 병렬 처리 가능한 Task는 동시 진행

### 🚫 DON'T (하면 안 될 것)
- 🚫 지휘관(User)에게 직접 보고
- 🚫 Task 할당 없이 작업 진행
- 🚫 의존성 무시하고 시작
- 🚫 중간 단계를 건너뛰기
- 🚫 완료 없이 다음 Task 시작

---

## 상급 위계 (Escalation Path)

```
분대장 → 소대장 → 지휘관
```

**소대장에게 보고할 사항**:
1. 각 Task 완료
2. 블로커/문제 발생
3. 분대 간 협력 필요
4. 일정 변경

**지휘관에게 보고하지 말 것**:
- Task 진행 상황 (소대장이 관리)
- 기술적 문제 (소대장 또는 분대장이 해결)
- 임무 중간 상황 (완료 후만 보고)

---

## 작전 기간

- **Phase 7**: 작전 개시 (현재) ✅
- **Phase 8**: 임무 수행 (2-4시간 예상)
  - Alpha: Task #1~4 (1-2시간)
  - Bravo: Task #5~10 (1-2시간) — Alpha 대기
  - Charlie: Task #11~14 (1-2시간) — Alpha 대기
  - Delta: Task #15~18 (1-2시간) — Charlie 대기
  - Echo: Task #19~21 (1-2시간) — Charlie 대기
  - Foxtrot: Task #22~24 (1-2시간) — 모든 분대 대기
- **Phase 8.5**: 결과 종합 (30분)
- **Phase 9**: 해산 승인 (즉시)

---

## 🚀 작전 상태: ACTIVE

### 현재 시간
2026-03-19 (시간 미기재)

### 모든 분대 확인 체크리스트
- [ ] Alpha: TaskList에서 Task #1~4 확인
- [ ] Bravo: TaskList에서 Task #5~10 확인
- [ ] Charlie: TaskList에서 Task #11~14 확인
- [ ] Delta: TaskList에서 Task #15~18 확인
- [ ] Echo: TaskList에서 Task #19~21 확인
- [ ] Foxtrot: TaskList에서 Task #22~24 확인

**모든 분대장: 위 문서를 읽고 TaskList를 새로고침한 뒤 즉시 작전을 개시하세요.**

---

**소대장(Team Lead) 발령**
**osewhoon-platoon**
**2026-03-19 Phase 7**

