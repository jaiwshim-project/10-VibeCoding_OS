-- ============================================================================
-- 오세훈 플랫폼 — PostgreSQL DDL (Task #12)
-- ============================================================================
-- 문서: design/02-data-models.md 기반
-- 작성: Charlie 분대 (분대장)
-- 날짜: 2026-03-19
-- ============================================================================

-- 외부 확장 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================================================
-- 테이블 1: candidates (후보자)
-- ============================================================================
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(50),
  bio TEXT,
  photo_url VARCHAR(500),
  email VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(200),
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_candidate_name ON candidates(name);
CREATE INDEX idx_candidate_email ON candidates(email);

-- ============================================================================
-- 테이블 2: policies (정책/공약)
-- ============================================================================
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  problem_statement TEXT,
  solution_description TEXT,
  expected_outcome TEXT,
  budget BIGINT DEFAULT 0,
  timeline VARCHAR(100),
  status VARCHAR(20) DEFAULT 'published',
  content_vector BYTEA,  -- PostgreSQL 네이티브 벡터 저장
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_policy_candidate ON policies(candidate_id);
CREATE INDEX idx_policy_category ON policies(category);
CREATE INDEX idx_policy_status ON policies(status);
CREATE INDEX idx_policy_created ON policies(created_at);

-- ============================================================================
-- 테이블 3: news (뉴스/기사)
-- ============================================================================
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  content TEXT,
  excerpt VARCHAR(500),
  thumbnail_url VARCHAR(500),
  category VARCHAR(50),
  author VARCHAR(100),
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'published',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_candidate ON news(candidate_id);
CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_created ON news(created_at);

-- ============================================================================
-- 테이블 4: search_index (검색 인덱스)
-- ============================================================================
CREATE TABLE search_index (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,  -- 'policy' | 'news' | 'location'
  entity_id INT NOT NULL,
  title VARCHAR(300),
  content TEXT,
  category VARCHAR(50),
  url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_search_entity ON search_index(entity_type, entity_id);
CREATE INDEX idx_search_category ON search_index(category);
CREATE INDEX idx_search_created ON search_index(created_at);

-- PostgreSQL Full-Text Search (Korean 텍스트 검색)
CREATE INDEX idx_search_tsvector ON search_index
  USING GIN (to_tsvector('korean', content));

-- ============================================================================
-- 테이블 5: users (사용자/관리자)
-- ============================================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'viewer',  -- 'viewer' | 'editor' | 'admin'
  preferences JSONB DEFAULT '{"language": "ko", "theme": "light", "notifications": true}',
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_active ON users(is_active);

-- ============================================================================
-- 테이블 6: locations (지도 위치)
-- ============================================================================
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),  -- 'office' | 'event' | 'rally' | 'campaign'
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  address VARCHAR(300),
  phone VARCHAR(20),
  website VARCHAR(200),
  event_date TIMESTAMP,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_location_candidate ON locations(candidate_id);
CREATE INDEX idx_location_type ON locations(type);
CREATE INDEX idx_location_event_date ON locations(event_date);
CREATE INDEX idx_location_created ON locations(created_at);

-- 지리 쿼리 최적화 (근처 위치 검색용)
CREATE INDEX idx_location_geo ON locations
  USING GIST (ll_to_earth(latitude, longitude));

-- ============================================================================
-- 테이블 7: chat_messages (챗봇 메시지)
-- ============================================================================
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  session_id VARCHAR(100),  -- 대화 세션 추적용
  role VARCHAR(20) NOT NULL,  -- 'user' | 'assistant'
  content TEXT NOT NULL,
  context JSONB,  -- RAG 컨텍스트 (검색 결과 저장)
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_candidate ON chat_messages(candidate_id);
CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at);
CREATE INDEX idx_chat_user ON chat_messages(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 테이블 8: media (파일/미디어)
-- ============================================================================
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  filename VARCHAR(300) NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT,
  file_path VARCHAR(500) NOT NULL,
  s3_url VARCHAR(500),
  uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_candidate ON media(candidate_id);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_created ON media(created_at);

-- ============================================================================
-- 테이블 9: audit_logs (감사 로그)
-- ============================================================================
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,  -- 'create' | 'update' | 'delete' | 'login'
  entity_type VARCHAR(50),
  entity_id INT,
  changes JSONB,  -- 변경 내역
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- 트리거: 자동 updated_at 업데이트
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- candidates에 트리거 적용
CREATE TRIGGER trigger_candidates_timestamp
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- policies에 트리거 적용
CREATE TRIGGER trigger_policies_timestamp
BEFORE UPDATE ON policies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- news에 트리거 적용
CREATE TRIGGER trigger_news_timestamp
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- users에 트리거 적용
CREATE TRIGGER trigger_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- locations에 트리거 적용
CREATE TRIGGER trigger_locations_timestamp
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- media에 트리거 적용
CREATE TRIGGER trigger_media_timestamp
BEFORE UPDATE ON media
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 뷰: 통합 뉴스 및 정책 검색
-- ============================================================================
CREATE OR REPLACE VIEW v_searchable_content AS
SELECT
  'policy' AS entity_type,
  p.id AS entity_id,
  p.title,
  p.solution_description AS content,
  p.category,
  '/policies#' || p.id AS url,
  p.created_at,
  p.updated_at
FROM policies p
WHERE p.status = 'published'

UNION ALL

SELECT
  'news' AS entity_type,
  n.id AS entity_id,
  n.title,
  n.content,
  n.category,
  '/news/' || n.slug AS url,
  n.created_at,
  n.updated_at
FROM news n
WHERE n.status = 'published';

-- ============================================================================
-- 뷰: 활성 사용자 목록
-- ============================================================================
CREATE OR REPLACE VIEW v_active_users AS
SELECT
  id,
  email,
  name,
  role,
  last_login,
  created_at,
  (NOW() - last_login) AS time_since_last_login
FROM users
WHERE is_active = true
ORDER BY last_login DESC NULLS LAST;

-- ============================================================================
-- 초기 데이터 삽입 (선택사항)
-- ============================================================================

-- 후보자 초기 데이터
INSERT INTO candidates (name, title, bio, email, phone, website)
VALUES (
  '오세훈',
  '서울시장 예정 후보자',
  '20년 경력의 정치인으로 서울시의 발전을 위해 노력하고 있습니다.',
  'contact@example.com',
  '+82-10-0000-0000',
  'https://example.com'
) ON CONFLICT DO NOTHING;

-- 기본 관리자 계정 (비밀번호: admin123 - bcrypt)
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@example.com',
  '$2b$10$YIjlrHxWx8z0BJ0nJ3lNGuFGm5HjFz8DXJZl8K5l8KY8J8w9l8KYu',
  '관리자',
  'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 권한 설정 (Supabase 환경에서)
-- ============================================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- 끝
-- ============================================================================
