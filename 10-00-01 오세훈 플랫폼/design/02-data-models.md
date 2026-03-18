# 오세훈 플랫폼 — 데이터 모델링

**문서 버전**: 1.0
**작성**: Alpha Squad (1분대)
**날짜**: 2026-03-19

---

## 1. 데이터 모델 개요

총 7개의 핵심 데이터 모델:

| # | 모델 | 목적 | 소유 분대 |
|---|------|------|----------|
| 1 | Candidate | 후보자 정보 | Charlie (DB) + Bravo (UI) |
| 2 | Policy | 정책 정보 | Charlie (DB) + Bravo (UI) + Delta (RAG) |
| 3 | News | 뉴스/기사 | Charlie (DB) + Bravo (UI) + Echo (검색) |
| 4 | SearchIndex | 검색 인덱스 | Echo (검색 엔진) |
| 5 | User | 사용자 정보 | Charlie (인증) |
| 6 | Location | 지도 위치 | Echo (지도) |
| 7 | ChatMessage | 대화 메시지 | Delta (챗봇) |

---

## 2. 상세 데이터 모델

### 모델 1: Candidate (후보자)

**테이블명**: `candidates`
**설명**: 후보자의 기본 정보

```sql
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(50),
  bio TEXT,
  photo_url VARCHAR(500),
  email VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(200),
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**JSON 스키마 (API 응답):**
```json
{
  "id": 1,
  "name": "오세훈",
  "title": "서울시장 예정 후보자",
  "bio": "20년 경력 정치인",
  "photo_url": "https://example.com/photo.jpg",
  "email": "contact@example.com",
  "phone": "+82-10-XXXX-XXXX",
  "website": "https://example.com",
  "social_links": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/...",
    "youtube": "https://youtube.com/..."
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-03-19T12:00:00Z"
}
```

---

### 모델 2: Policy (정책)

**테이블명**: `policies`
**설명**: 후보자의 공약/정책

```sql
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  problem_statement TEXT,
  solution_description TEXT,
  expected_outcome TEXT,
  budget BIGINT,
  timeline VARCHAR(100),
  status VARCHAR(20) DEFAULT 'published',
  content_vector VECTOR(1536),  -- Gemini embeddings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
```

**JSON 스키마:**
```json
{
  "id": 1,
  "candidate_id": 1,
  "title": "50만개 일자리 창출",
  "category": "경제",
  "problem_statement": "청년 실업률이 높다",
  "solution_description": "기업 세제 혜택을 통한 일자리 창출",
  "expected_outcome": "3년 내 50만개 일자리 창출",
  "budget": 500000000000,
  "timeline": "3년",
  "status": "published",
  "created_at": "2026-01-15T00:00:00Z"
}
```

---

### 모델 3: News (뉴스)

**테이블명**: `news`
**설명**: 후보자 관련 뉴스 및 기사

```sql
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE,
  content TEXT,
  excerpt VARCHAR(500),
  thumbnail_url VARCHAR(500),
  category VARCHAR(50),
  author VARCHAR(100),
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'published',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
```

**JSON 스키마:**
```json
{
  "id": 1,
  "candidate_id": 1,
  "title": "오세훈 후보, 교통 개혁 발표",
  "slug": "osewhoon-traffic-reform",
  "content": "오세훈 후보가 오늘 서울 교통 개혁 방안을...",
  "excerpt": "교통 혼잡 50% 감소 목표",
  "thumbnail_url": "https://example.com/news1.jpg",
  "category": "정책",
  "author": "기자명",
  "published_at": "2026-03-19T10:00:00Z",
  "status": "published",
  "view_count": 1250,
  "created_at": "2026-03-19T09:00:00Z"
}
```

---

### 모델 4: SearchIndex (검색 인덱스)

**테이블명**: `search_index`
**설명**: 전체 검색을 위한 통합 인덱스

```sql
CREATE TABLE search_index (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50),  -- 'policy' | 'news' | 'event'
  entity_id INT,
  title VARCHAR(300),
  content TEXT,
  category VARCHAR(50),
  url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (entity_id, entity_type) REFERENCES (
    policies(id), 'policy' |
    news(id), 'news'
  )
);

-- Full-Text Search 인덱스
CREATE INDEX idx_search_content ON search_index
  USING GIN (to_tsvector('korean', content));
```

**용도**: 빠른 검색을 위한 PostgreSQL Full-Text Search

---

### 모델 5: User (사용자)

**테이블명**: `users`
**설명**: 로그인 사용자 정보

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'viewer',  -- 'viewer' | 'editor' | 'admin'
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**JSON 스키마:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "관리자",
  "role": "admin",
  "preferences": {
    "language": "ko",
    "theme": "light",
    "notifications": true
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### 모델 6: Location (지도 위치)

**테이블명**: `locations`
**설명**: 지도에 표시할 위치 정보

```sql
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),  -- 'office' | 'event' | 'rally'
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  address VARCHAR(300),
  phone VARCHAR(20),
  website VARCHAR(200),
  event_date TIMESTAMP,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- 지리 쿼리 최적화
CREATE INDEX idx_location_geo ON locations USING GIST (
  ll_to_earth(latitude, longitude)
);
```

**JSON 스키마:**
```json
{
  "id": 1,
  "name": "오세훈 캠프 본부",
  "type": "office",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "address": "서울시 중구 명동",
  "phone": "+82-2-XXXX-XXXX",
  "website": "https://example.com",
  "event_date": null,
  "description": "캠프 본부 사무실",
  "image_url": "https://example.com/office.jpg",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### 모델 7: ChatMessage (대화 메시지)

**테이블명**: `chat_messages`
**설명**: 챗봇 대화 히스토리

```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INT,  -- NULL이면 익명
  candidate_id INT NOT NULL,
  role VARCHAR(20),  -- 'user' | 'assistant'
  content TEXT NOT NULL,
  context JSONB,  -- RAG 컨텍스트
  tokens_used INT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
```

**JSON 스키마:**
```json
{
  "id": 1,
  "user_id": null,
  "candidate_id": 1,
  "role": "user",
  "content": "정책에 대해 말씀해주세요",
  "context": null,
  "tokens_used": 12,
  "created_at": "2026-03-19T12:30:00Z"
}
```

**AI 응답 예시:**
```json
{
  "id": 2,
  "user_id": null,
  "candidate_id": 1,
  "role": "assistant",
  "content": "오세훈 후보의 핵심 정책은...",
  "context": {
    "retrieval": [
      {"policy_id": 1, "relevance": 0.95},
      {"policy_id": 2, "relevance": 0.87}
    ],
    "model": "gemini-1.5",
    "generated_tokens": 145
  },
  "tokens_used": 145,
  "created_at": "2026-03-19T12:31:00Z"
}
```

---

## 3. 관계도 (Entity Relationship Diagram)

```
Candidate (1)
  ├─ (1:N) Policy
  ├─ (1:N) News
  ├─ (1:N) Location
  └─ (1:N) ChatMessage

User (1)
  └─ (1:N) ChatMessage

SearchIndex
  ├─ References Policy
  ├─ References News
  └─ References Location
```

---

## 4. 인덱싱 전략

### 주요 인덱스
```sql
-- Candidate
CREATE INDEX idx_candidate_name ON candidates(name);

-- Policy
CREATE INDEX idx_policy_candidate ON policies(candidate_id);
CREATE INDEX idx_policy_category ON policies(category);
CREATE INDEX idx_policy_status ON policies(status);

-- News
CREATE INDEX idx_news_candidate ON news(candidate_id);
CREATE INDEX idx_news_published ON news(published_at);
CREATE INDEX idx_news_slug ON news(slug);

-- Location
CREATE INDEX idx_location_type ON locations(type);
CREATE INDEX idx_location_event_date ON locations(event_date);

-- ChatMessage
CREATE INDEX idx_chat_candidate ON chat_messages(candidate_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at);
```

---

## 5. 데이터 검증 규칙

### Candidate
- name: 1-100 글자
- email: 유효한 이메일 형식
- phone: 11-13 글자

### Policy
- title: 1-200 글자
- category: 사전에 정의된 값
- budget: 0 이상

### News
- title: 1-300 글자
- slug: 고유값, URL 호환

### Location
- latitude: -90 ~ 90
- longitude: -180 ~ 180
- name: 1-200 글자

---

**이 데이터 모델은 Charlie(DB), Bravo(UI), Delta(RAG), Echo(검색)가 모두 참고해야 하는 핵심 문서입니다.**

