# 오세훈 플랫폼 — 백엔드 API 서버

**작성자**: Charlie 분대 (분대장)
**날짜**: 2026-03-19
**버전**: 1.0.0

---

## 개요

오세훈 플랫폼의 Express.js 백엔드 서버입니다. REST API를 통해 30개 이상의 엔드포인트를 제공하며, JWT 인증과 RBAC(Role-Based Access Control) 권한 체계를 구현합니다.

---

## 주요 기능

### 1. 인증 & 권한 관리 (Task #13)
- JWT 토큰 기반 인증
- RBAC 권한 체계 (viewer, editor, admin)
- 비밀번호 해싱 (bcrypt)
- 토큰 갱신 (refresh)
- 감사 로그 (audit logging)

### 2. REST API 엔드포인트 (Task #11)
- **후보자** (Candidates): 5개 엔드포인트
- **정책** (Policies): 5개 엔드포인트
- **뉴스** (News): 5개 엔드포인트
- **검색** (Search): 3개 엔드포인트 + 자동완성
- **위치** (Locations): 7개 엔드포인트 + 근처 검색, 히트맵
- **챗봇** (Chat): 4개 엔드포인트 + RAG 엔진
- **인증** (Auth): 6개 엔드포인트
- **파일** (Media): 5개 엔드포인트 + 일괄 업로드

### 3. 데이터베이스 (Task #12)
- PostgreSQL DDL (9개 테이블)
- 자동 타임스탐프 (updated_at)
- 인덱싱 및 최적화
- Full-Text Search (FTS) 지원

### 4. 클라이언트 파일 업로드 (Task #14)
- MediaUploader 클래스 (js/media.js)
- 드래그 앤 드롭 지원
- 진행률 추적
- 여러 파일 일괄 업로드
- 파일 미리보기 생성

---

## 설치 및 실행

### 1. 필수 요구사항
```
Node.js >= 16.0.0
npm >= 8.0.0
PostgreSQL >= 13.0
```

### 2. 의존성 설치
```bash
cd server
npm install
```

### 3. 환경 설정
```bash
cp .env.example .env
# .env 파일을 열어 데이터베이스 정보 등을 수정하세요
```

### 4. 데이터베이스 초기화
```bash
psql -U postgres -h localhost -d osewhoon_platform -f db/schema.sql
```

또는:
```bash
npm run db:init
```

### 5. 서버 시작

개발 환경:
```bash
npm run dev
```

프로덕션 환경:
```bash
npm start
```

### 6. 서버 검증
```bash
curl http://localhost:3000/health
```

---

## API 엔드포인트 목록

### 인증 (Authentication)
```
POST   /api/auth/signup           회원가입
POST   /api/auth/login            로그인
POST   /api/auth/logout           로그아웃
POST   /api/auth/refresh          토큰 갱신
GET    /api/auth/me               현재 사용자 정보
PUT    /api/auth/password         비밀번호 변경
PUT    /api/auth/profile          프로필 수정
```

### 후보자 (Candidates)
```
GET    /api/candidates            후보자 목록
GET    /api/candidates/:id        후보자 상세
POST   /api/candidates            후보자 생성 (관리자)
PUT    /api/candidates/:id        후보자 수정 (관리자)
DELETE /api/candidates/:id        후보자 삭제 (관리자)
```

### 정책 (Policies)
```
GET    /api/policies              정책 목록
GET    /api/policies/:id          정책 상세
POST   /api/policies              정책 생성 (에디터/관리자)
PUT    /api/policies/:id          정책 수정 (에디터/관리자)
DELETE /api/policies/:id          정책 삭제 (관리자)
```

### 뉴스 (News)
```
GET    /api/news                  뉴스 목록
GET    /api/news/:slug            뉴스 상세 (slug 또는 id)
POST   /api/news                  뉴스 생성 (에디터/관리자)
PUT    /api/news/:id              뉴스 수정 (에디터/관리자)
DELETE /api/news/:id              뉴스 삭제 (관리자)
```

### 검색 (Search)
```
POST   /api/search                통합 검색
GET    /api/search/suggestions    검색 자동완성
GET    /api/search/analytics      검색 통계 (관리자)
```

### 위치 (Locations)
```
GET    /api/locations             위치 목록
GET    /api/locations/:id         위치 상세
GET    /api/locations/search/nearby   근처 위치 검색
GET    /api/locations/heatmap     히트맵 데이터
POST   /api/locations             위치 생성 (관리자)
PUT    /api/locations/:id         위치 수정 (관리자)
DELETE /api/locations/:id         위치 삭제 (관리자)
```

### 챗봇 (Chat)
```
POST   /api/chat/start            세션 시작
POST   /api/chat/send             메시지 전송
GET    /api/chat/:sessionId       대화 히스토리
DELETE /api/chat/:sessionId       세션 삭제
GET    /api/chat/stats/:candidateId   채팅 통계 (관리자)
```

### 파일 (Media)
```
POST   /api/media/upload          파일 업로드
GET    /api/media/:id             파일 다운로드
GET    /api/media/candidate/:candidateId/list   미디어 목록
DELETE /api/media/:id             파일 삭제 (관리자)
POST   /api/media/bulk-upload     일괄 업로드
```

### 헬스 체크
```
GET    /health                    서버 상태
GET    /api/health/db             DB 연결 확인
```

---

## 사용 예시

### 1. 회원가입 및 로그인
```bash
# 회원가입
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "사용자명"
  }'

# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. 정책 조회
```bash
curl http://localhost:3000/api/policies?limit=10&offset=0
```

### 3. 검색
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "q": "일자리 창출",
    "candidate_id": 1
  }'
```

### 4. 파일 업로드
```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "candidate_id=1"
```

### 5. 챗봇 메시지
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123...",
    "candidateId": 1,
    "message": "정책에 대해 말씀해주세요"
  }'
```

---

## 권한 체계 (RBAC)

### viewer (일반 사용자)
- 후보자, 정책, 뉴스, 위치 조회 (읽기)
- 검색 및 챗봇 사용

### editor (콘텐츠 작성자)
- viewer의 모든 권한
- 정책 및 뉴스 작성/수정
- 파일 업로드

### admin (관리자)
- 모든 권한
- 사용자 관리
- 감사 로그 조회
- 통계 및 분석 데이터 조회

---

## 데이터베이스 스키마

### 테이블 목록
1. `candidates` - 후보자 정보
2. `policies` - 정책/공약
3. `news` - 뉴스/기사
4. `search_index` - 검색 인덱스
5. `users` - 사용자 정보
6. `locations` - 지도 위치
7. `chat_messages` - 챗봇 메시지
8. `media` - 파일/미디어
9. `audit_logs` - 감사 로그

더 자세한 내용은 `db/schema.sql` 참고

---

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| NODE_ENV | 운영 환경 | development |
| PORT | 서버 포트 | 3000 |
| DB_HOST | 데이터베이스 호스트 | localhost |
| DB_PORT | 데이터베이스 포트 | 5432 |
| DB_USER | 데이터베이스 사용자 | postgres |
| DB_PASSWORD | 데이터베이스 비밀번호 | postgres |
| DB_NAME | 데이터베이스 이름 | osewhoon_platform |
| JWT_SECRET | JWT 서명 키 | (필수) |
| JWT_EXPIRY | 토큰 만료 시간 | 7d |
| CORS_ORIGIN | CORS 허용 도메인 | * |
| GEMINI_API_KEY | Gemini API 키 | (선택사항) |

---

## 파일 구조

```
server/
├── db/
│   └── schema.sql                    # PostgreSQL DDL
├── middleware/
│   └── auth.js                       # JWT + RBAC 인증
├── routes/
│   ├── candidates.js                 # 후보자 API
│   ├── policies.js                   # 정책 API
│   ├── news.js                       # 뉴스 API
│   ├── search.js                     # 검색 API
│   ├── locations.js                  # 위치 API
│   ├── chat.js                       # 챗봇 API
│   ├── auth.js                       # 인증 API
│   └── media.js                      # 파일 API
├── index.js                          # Express 앱 초기화
├── package.json                      # NPM 의존성
├── .env.example                      # 환경 설정 예시
├── .gitignore                        # Git 무시 파일
└── README.md                         # 이 파일

js/
└── media.js                          # 클라이언트 파일 업로드
```

---

## 프로덕션 배포

### 1. 환경 변수 설정
```bash
# .env 파일 생성 (민감한 정보 입력)
NODE_ENV=production
JWT_SECRET=<매우-안전한-시크릿-키>
DB_HOST=<프로덕션-데이터베이스-호스트>
# ... 기타 설정
```

### 2. 의존성 최적화
```bash
npm ci --only=production
```

### 3. 포트 설정
```bash
PORT=3000 npm start
```

### 4. PM2로 관리
```bash
npm install -g pm2
pm2 start server/index.js --name "osewhoon-api"
pm2 save
pm2 startup
```

---

## 문제 해결

### 데이터베이스 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- PostgreSQL 서버가 실행 중인지 확인
- DB_HOST, DB_PORT, 사용자명, 비밀번호 확인

### JWT 토큰 오류
```
Error: Invalid token
```
- JWT_SECRET이 올바르게 설정되었는지 확인
- Authorization 헤더 형식: `Bearer <token>`

### CORS 오류
```
Access to XMLHttpRequest blocked by CORS policy
```
- CORS_ORIGIN 환경 변수 확인
- 클라이언트 도메인이 허용 목록에 있는지 확인

---

## 지원 및 피드백

문제가 발생하거나 개선 사항이 있으면 Charlie 분대에 보고해주세요.

---

**최종 업데이트**: 2026-03-19
