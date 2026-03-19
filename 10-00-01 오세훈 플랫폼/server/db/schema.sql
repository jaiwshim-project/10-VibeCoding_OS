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
-- 테이블 10: campaign_tasks (캠프 태스크 협업 관리)
-- Charlie 분대 Task #40 — Phase 4: 스태프 협업 기능
-- ============================================================================

CREATE TABLE campaign_tasks (
  id             SERIAL PRIMARY KEY,

  -- 기본 정보
  title          VARCHAR(300)  NOT NULL,
  description    TEXT,
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  priority       VARCHAR(10)   NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low', 'medium', 'high')),

  -- 날짜
  due_date       DATE,
  completed_at   TIMESTAMP,

  -- 담당자 및 생성자 (users 테이블 FK; 다중 담당자는 task_assignees 별도 테이블)
  created_by     INT           REFERENCES users(id) ON DELETE SET NULL,

  -- 태그 (PostgreSQL 배열 타입)
  tags           TEXT[]        DEFAULT '{}',

  -- 메타
  created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_ctask_status    ON campaign_tasks(status);
CREATE INDEX idx_ctask_priority  ON campaign_tasks(priority);
CREATE INDEX idx_ctask_due_date  ON campaign_tasks(due_date);
CREATE INDEX idx_ctask_created   ON campaign_tasks(created_at DESC);
CREATE INDEX idx_ctask_created_by ON campaign_tasks(created_by);

-- GIN 인덱스: 태그 배열 검색 최적화
CREATE INDEX idx_ctask_tags      ON campaign_tasks USING GIN (tags);

-- Full-text 검색 인덱스 (제목 + 설명)
CREATE INDEX idx_ctask_fts ON campaign_tasks
  USING GIN (to_tsvector('korean', coalesce(title, '') || ' ' || coalesce(description, '')));

-- 자동 updated_at 트리거
CREATE TRIGGER trigger_campaign_tasks_timestamp
  BEFORE UPDATE ON campaign_tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 테이블 11: task_assignees (태스크 담당자 — 다대다)
-- ============================================================================

CREATE TABLE task_assignees (
  id          SERIAL    PRIMARY KEY,
  task_id     INT       NOT NULL REFERENCES campaign_tasks(id) ON DELETE CASCADE,
  user_id     INT       REFERENCES users(id) ON DELETE SET NULL,
  -- user_id가 없으면 assignee_name으로 저장 (외부 스태프용)
  assignee_name VARCHAR(100),
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_assignee CHECK (user_id IS NOT NULL OR assignee_name IS NOT NULL)
);

CREATE INDEX idx_ta_task   ON task_assignees(task_id);
CREATE INDEX idx_ta_user   ON task_assignees(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 테이블 12: task_subtasks (체크리스트 / 서브태스크)
-- ============================================================================

CREATE TABLE task_subtasks (
  id          SERIAL    PRIMARY KEY,
  task_id     INT       NOT NULL REFERENCES campaign_tasks(id) ON DELETE CASCADE,
  text        VARCHAR(500) NOT NULL,
  done        BOOLEAN   NOT NULL DEFAULT FALSE,
  done_at     TIMESTAMP,
  done_by     INT       REFERENCES users(id) ON DELETE SET NULL,
  sort_order  SMALLINT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ts_task       ON task_subtasks(task_id);
CREATE INDEX idx_ts_sort       ON task_subtasks(task_id, sort_order);

-- ============================================================================
-- 테이블 13: task_comments (태스크 댓글)
-- ============================================================================

CREATE TABLE task_comments (
  id          SERIAL    PRIMARY KEY,
  task_id     INT       NOT NULL REFERENCES campaign_tasks(id) ON DELETE CASCADE,
  author_id   INT       REFERENCES users(id) ON DELETE SET NULL,
  -- 비로그인 스태프 지원용
  author_name VARCHAR(100),
  text        TEXT      NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_comment_author CHECK (author_id IS NOT NULL OR author_name IS NOT NULL)
);

CREATE INDEX idx_tc_task       ON task_comments(task_id);
CREATE INDEX idx_tc_author     ON task_comments(author_id) WHERE author_id IS NOT NULL;
CREATE INDEX idx_tc_created    ON task_comments(created_at DESC);

-- 자동 updated_at 트리거
CREATE TRIGGER trigger_task_comments_timestamp
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 테이블 14: task_activity_log (태스크 활동 로그)
-- ============================================================================

CREATE TABLE task_activity_log (
  id          SERIAL    PRIMARY KEY,
  task_id     INT       NOT NULL REFERENCES campaign_tasks(id) ON DELETE CASCADE,
  user_id     INT       REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(50) NOT NULL,
  -- 예: 'status_changed', 'assignee_added', 'comment_added', 'subtask_toggled'
  detail      JSONB,
  -- { "from": "pending", "to": "in-progress" }
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tal_task    ON task_activity_log(task_id);
CREATE INDEX idx_tal_created ON task_activity_log(created_at DESC);

-- ============================================================================
-- 뷰: 태스크 대시보드 (통계 요약)
-- ============================================================================

CREATE OR REPLACE VIEW v_task_dashboard AS
SELECT
  status,
  priority,
  COUNT(*)                                             AS count,
  COUNT(*) FILTER (WHERE due_date < CURRENT_DATE
                   AND status <> 'completed')          AS overdue_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                    AS completion_rate_pct
FROM campaign_tasks
GROUP BY status, priority;

-- ============================================================================
-- 뷰: 태스크 + 담당자 + 진행률 통합 뷰
-- ============================================================================

CREATE OR REPLACE VIEW v_tasks_with_progress AS
SELECT
  ct.id,
  ct.title,
  ct.description,
  ct.status,
  ct.priority,
  ct.due_date,
  ct.tags,
  ct.created_at,
  ct.updated_at,
  ct.created_by,

  -- 담당자 집합 (배열로 반환)
  ARRAY_AGG(DISTINCT COALESCE(ta.assignee_name, u.name)) FILTER (
    WHERE ta.id IS NOT NULL
  ) AS assignees,

  -- 서브태스크 집계
  COUNT(DISTINCT ts.id)                                                           AS subtask_total,
  COUNT(DISTINCT ts.id) FILTER (WHERE ts.done = TRUE)                            AS subtask_done,
  ROUND(
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.done = TRUE)::NUMERIC
    / NULLIF(COUNT(DISTINCT ts.id), 0) * 100, 0
  )                                                                               AS progress_pct,

  -- 댓글 수
  COUNT(DISTINCT tc.id)                                                           AS comment_count,

  -- 기한 초과 여부
  (ct.due_date IS NOT NULL
    AND ct.due_date < CURRENT_DATE
    AND ct.status <> 'completed')                                                 AS is_overdue

FROM campaign_tasks ct
LEFT JOIN task_assignees  ta ON ta.task_id = ct.id
LEFT JOIN users           u  ON u.id = ta.user_id
LEFT JOIN task_subtasks   ts ON ts.task_id = ct.id
LEFT JOIN task_comments   tc ON tc.task_id = ct.id
GROUP BY ct.id;

-- ============================================================================
-- 초기 데이터: campaign_tasks 샘플
-- ============================================================================

-- 관리자 ID 기반 삽입 (INSERT INTO users 직후 실행 가정)
DO $$
DECLARE v_admin_id INT;
BEGIN
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO campaign_tasks (title, description, status, priority, due_date, tags, created_by) VALUES
      ('도봉구 캠프 전략 수정',    '도봉구 지지층 결집 전략 수정 및 유권자 접점 행사 일정 확정', 'in-progress', 'high',   '2026-03-25', ARRAY['전략','지역'],       v_admin_id),
      ('강남구 경제정책 자료 준비', '강남구 지역 특성에 맞는 경제정책 자료 작성 및 인쇄물 발주', 'pending',     'high',   '2026-03-22', ARRAY['정책','자료'],       v_admin_id),
      ('판세 분석 보고서 작성',    '주간 판세 분석 및 선거구별 전략 보고서',                    'in-progress', 'high',   '2026-03-20', ARRAY['판세','보고서'],     v_admin_id),
      ('여론조사 데이터 입력',     '최신 여론조사 결과를 시스템에 입력하고 대시보드 반영',       'completed',   'medium', '2026-03-19', ARRAY['데이터','여론조사'], v_admin_id),
      ('캠프 일정 조율',          '지역별 방문 일정 및 행사 일정 최종 확인',                    'pending',     'medium', '2026-03-21', ARRAY['일정'],             v_admin_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 끝
-- ============================================================================
