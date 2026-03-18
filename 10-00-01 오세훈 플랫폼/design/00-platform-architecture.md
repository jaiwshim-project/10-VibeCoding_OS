# 오세훈 플랫폼 — 시스템 아키텍처

**문서 버전**: 1.0
**작성**: Alpha Squad (1분대)
**날짜**: 2026-03-19

---

## 1. 플랫폼 개요

오세훈 서울시장 후보자를 위한 통합 캠페인 디지털 플랫폼

**핵심 목표:**
- 후보자의 정책/뉴스/프로필을 통합 제공
- AI 챗봇을 통한 유권자 상호작용
- 지역별 선거 지지도 시각화
- 후보자 캠프 운영 효율화

---

## 2. 시스템 블록 다이어그램

```
┌─────────────────────────────────────────────────────┐
│          사용자 (유권자 / 캠프 운영진)                │
└─────────────────────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │    웹 브라우저 / 모바일        │
        │   (프론트엔드 - Bravo)        │
        └──────────────────────────────┘
                       ↓
    ┌──────────────────────────────────────┐
    │   프론트엔드 API 클라이언트            │
    │   (js/api.js - Charlie)             │
    └──────────────────────────────────────┘
                       ↓
    ┌──────────────────────────────────────┐
    │   REST API (Express.js - Charlie)    │
    │   ├─ /api/candidate                 │
    │   ├─ /api/policies                  │
    │   ├─ /api/news                      │
    │   ├─ /api/chat                      │
    │   ├─ /api/map                       │
    │   ├─ /api/search                    │
    │   └─ /api/auth                      │
    └──────────────────────────────────────┘
                       ↓
    ┌────────────────────────────────────────┐
    │     비즈니스 로직 & 외부 통합           │
    │  ├─ RAG 엔진 (Delta)                 │
    │  ├─ Gemini API (Delta)               │
    │  ├─ 검색 엔진 (Echo)                  │
    │  ├─ 지도 서비스 (Echo)                 │
    │  └─ CMS (Echo)                       │
    └────────────────────────────────────────┘
                       ↓
    ┌────────────────────────────────────────┐
    │     데이터 계층                         │
    │  ├─ PostgreSQL DB (Charlie)          │
    │  ├─ Vector DB (Delta)                │
    │  └─ 파일 스토리지 (Charlie - S3)       │
    └────────────────────────────────────────┘
```

---

## 3. 페이지 구조

### 메인 페이지 (9개)

| # | 페이지 | 경로 | 목적 | 개발 분대 |
|---|--------|------|------|----------|
| 1 | 홈 대시보드 | `/` | 후보자 주요 정보, 일정, 뉴스 | Bravo |
| 2 | 프로필 | `/profile` | 후보자 이력, 성과, 추천인 | Bravo |
| 3 | 정책 | `/policies` | 정책 목록, 검색, 상세 설명 | Bravo |
| 4 | 뉴스 | `/news` | 뉴스 피드, 검색, 상세 기사 | Bravo |
| 5 | 챗봇 | `/chatbot` | AI 질의응답 UI | Bravo |
| 6 | 지도 | `/map` | 선거구 지도, 지지도, 이벤트 | Bravo |
| 7 | 검색 | `/search` | 전체 통합 검색 | Echo |
| 8 | 관리자 | `/admin` | 콘텐츠 관리 (CMS) | Echo |
| 9 | 설정 | `/settings` | 언어, 테마, 알림 설정 | Bravo |

---

## 4. 데이터 흐름도

### 사용자 조회 흐름
```
사용자 클릭 (정책 조회)
  ↓
브라우저 (pages/policies.html)
  ↓
js/api.js → fetch('/api/policies')
  ↓
Express.js Route (/routes/policies.js)
  ↓
PostgreSQL Query
  ↓
JSON 응답
  ↓
Chart.js 시각화 + DOM 업데이트
  ↓
사용자 화면 표시
```

### AI 챗봇 흐름
```
사용자 입력 (정책 질문)
  ↓
ChatBot UI (pages/chatbot.html)
  ↓
js/api.js → fetch('/api/chat/send')
  ↓
Express.js (/routes/chat.js)
  ↓
RAG 엔진 (문서 검색)
  ↓
Gemini API (AI 응답 생성)
  ↓
응답 반환 & 저장
  ↓
사용자에게 표시
```

### 검색 흐름
```
사용자 검색어 입력
  ↓
브라우저 (pages/search.html)
  ↓
js/api.js → fetch('/api/search?q=...')
  ↓
Search Service (Full-Text Search)
  ↓
PostgreSQL 검색 인덱스
  ↓
결과 반환 (뉴스, 정책, 이벤트)
  ↓
결과 표시
```

---

## 5. 기술 스택

| 계층 | 기술 | 선택 이유 |
|------|------|----------|
| **Frontend** | HTML5 + CSS3 + Vanilla JS | 의존성 최소화, 빠른 로딩 |
| **Charts** | Chart.js | 경량, 반응형, 사용 용이 |
| **Maps** | Leaflet.js | 오픈소스, 경량, 커스터마이징 용이 |
| **Backend** | Node.js + Express.js | JavaScript 통일, 높은 성능 |
| **Database** | PostgreSQL 15+ | 강력한 검색, 보안, ACID |
| **AI** | Google Gemini API | 최신 LLM, RAG 지원 |
| **Vector DB** | Pinecone 또는 로컬 임베딩 | RAG 성능, 의미론적 검색 |
| **File Storage** | AWS S3 또는 로컬 | 스케일러빌리티 |
| **Search** | PostgreSQL Full-Text Search | 별도 서버 불필요, 성능 충분 |
| **Auth** | JWT + 소셜 로그인 (선택) | 무상태, 확장성 |
| **Testing** | Playwright | 크로스 브라우저, E2E |
| **Deployment** | Docker + Vercel/AWS | 이동성, 관리 용이 |
| **Monitoring** | Sentry + Datadog | 에러 추적, 성능 모니터링 |

---

## 6. API 설계 원칙

### RESTful 설계
```
GET    /api/candidate              # 후보자 정보 조회
GET    /api/policies               # 정책 목록 조회
GET    /api/policies/:id           # 정책 상세 조회
POST   /api/policies               # 정책 생성 (관리자)
PUT    /api/policies/:id           # 정책 수정 (관리자)
DELETE /api/policies/:id           # 정책 삭제 (관리자)

GET    /api/news                   # 뉴스 목록 조회
POST   /api/news                   # 뉴스 생성 (관리자)
GET    /api/chat/send              # 챗봇 메시지 전송
GET    /api/search?q=...           # 전체 검색
GET    /api/map/locations          # 지도 위치 조회
```

### 응답 형식
```json
{
  "success": true,
  "data": { /* 실제 데이터 */ },
  "error": null,
  "timestamp": "2026-03-19T12:34:56Z"
}
```

### 에러 처리
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "POLICY_NOT_FOUND",
    "message": "Policy with ID 123 not found",
    "status": 404
  }
}
```

---

## 7. 보안 아키텍처

### Authentication (인증)
- JWT 토큰 기반
- Access Token: 15분 유효
- Refresh Token: 7일 유효
- HttpOnly 쿠키로 저장

### Authorization (권한)
- Role-Based Access Control (RBAC)
- 역할: admin, editor, viewer
- 리소스별 권한 체크

### Data Security (데이터 보안)
- SQL Injection 방지: Parameterized Queries
- CSRF 방지: CSRF 토큰
- XSS 방지: 입력 검증 + HTML escaping
- Rate Limiting: API 엔드포인트별 제한

### File Upload 보안
- 파일 타입 검증
- 바이러스 스캔 (ClamAV)
- 파일 크기 제한 (10MB)
- 안전한 저장소 (AWS S3 + 서명된 URL)

---

## 8. 성능 최적화

### Frontend
- **최소화**: HTML/CSS/JS 압축
- **캐싱**: Service Worker로 오프라인 지원
- **지연 로딩**: 이미지 lazy loading
- **번들 최적화**: 불필요한 JS 제거

### Backend
- **데이터베이스 인덱싱**: 자주 쿼리되는 컬럼에 인덱스
- **캐싱**: Redis (선택) 또는 메모리 캐시
- **쿼리 최적화**: N+1 쿼리 방지
- **Connection Pooling**: DB 연결 재사용

### 목표 지표
- 페이지 로드 시간: < 3초
- API 응답 시간: < 500ms
- Lighthouse 점수: 90+
- Time to Interactive (TTI): < 5초

---

## 9. 배포 아키텍처

```
GitHub Repository
  ↓
GitHub Actions CI/CD
  ├─ 테스트 (Playwright E2E)
  ├─ 빌드 (Docker 이미지)
  └─ 배포
      ├─ Staging (develop → Heroku)
      └─ Production (main → Vercel/AWS)
```

### 배포 환경
- **Staging**: Heroku (또는 AWS EC2)
- **Production**: Vercel (또는 AWS ECS)

---

## 10. 확장성 고려사항

### 현재 (MVP - Minimum Viable Product)
- 단일 서버 배포
- PostgreSQL 단일 인스턴스
- 로컬 파일 스토리지

### 향후 확장 (Phase 2)
- 마이크로서비스 아키텍처
- 데이터베이스 샤딩
- CDN (CloudFlare 등)
- 캐시 레이어 (Redis)
- 메시지 큐 (RabbitMQ)

---

**이 문서는 Alpha Squad(1분대)에 의해 작성되었으며, 모든 분대의 개발 작업의 기초가 됩니다.**

