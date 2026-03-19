-- ============================================================================
-- Migration: 001_election_stats.sql
-- 선거 통계 테이블 설계 및 마이그레이션 (Task #34)
-- 작성: Alpha 분대 (database-developer)
-- 날짜: 2026-03-19
-- ============================================================================

-- ============================================================================
-- 1. election_stats (지지도 스냅샷 — 메인 테이블)
-- 특정 시점의 지지도/호의도/미결정층 수치를 저장
-- ============================================================================
CREATE TABLE IF NOT EXISTS election_stats (
  id                  SERIAL PRIMARY KEY,
  candidate_id        INT NOT NULL,
  snapshot_date       DATE NOT NULL DEFAULT CURRENT_DATE,     -- 조사 기준일
  snapshot_type       VARCHAR(20) NOT NULL DEFAULT 'daily',  -- 'daily'|'weekly'|'manual'

  -- 핵심 지표 (%)
  support_rate        NUMERIC(5,2) NOT NULL CHECK (support_rate BETWEEN 0 AND 100),
  favorability_rate   NUMERIC(5,2) NOT NULL CHECK (favorability_rate BETWEEN 0 AND 100),
  undecided_rate      NUMERIC(5,2) NOT NULL CHECK (undecided_rate BETWEEN 0 AND 100),
  oppose_rate         NUMERIC(5,2)          CHECK (oppose_rate BETWEEN 0 AND 100),

  -- 트렌드 (이전 주 대비 변동폭, %)
  support_delta       NUMERIC(5,2) DEFAULT 0,
  favorability_delta  NUMERIC(5,2) DEFAULT 0,

  -- 표본 정보
  sample_size         INT DEFAULT 0,
  survey_agency       VARCHAR(100),       -- 조사 기관명
  margin_of_error     NUMERIC(4,2),       -- 오차 한계 (%)

  -- 메타
  notes               TEXT,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_election_stats_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,

  -- 같은 후보자의 같은 날짜/타입 중복 방지 (덮어쓰기는 UPDATE 사용)
  CONSTRAINT uq_election_stats_daily
    UNIQUE (candidate_id, snapshot_date, snapshot_type)
);

COMMENT ON TABLE election_stats IS '선거 지지도 시계열 스냅샷 — 전체 수치';
COMMENT ON COLUMN election_stats.snapshot_type IS 'daily: 자동 집계 | weekly: 주간 집계 | manual: 수동 입력';
COMMENT ON COLUMN election_stats.support_delta IS '이전 동일 snapshot_type 대비 지지율 변동 (양수=상승)';


-- ============================================================================
-- 2. election_stats_by_region (지역별 지지도)
-- election_stats의 스냅샷과 1:N 관계
-- ============================================================================
CREATE TABLE IF NOT EXISTS election_stats_by_region (
  id                  SERIAL PRIMARY KEY,
  stats_id            INT NOT NULL,           -- election_stats.id FK
  candidate_id        INT NOT NULL,
  snapshot_date       DATE NOT NULL,

  -- 지역 정보
  region_type         VARCHAR(20) NOT NULL DEFAULT 'district',  -- 'district'|'city'|'province'
  region_name         VARCHAR(100) NOT NULL,  -- '강남구', '서울시' 등

  -- 지표
  support_rate        NUMERIC(5,2) NOT NULL CHECK (support_rate BETWEEN 0 AND 100),
  favorability_rate   NUMERIC(5,2)          CHECK (favorability_rate BETWEEN 0 AND 100),
  turnout_prediction  NUMERIC(5,2)          CHECK (turnout_prediction BETWEEN 0 AND 100),
  strategic_priority  VARCHAR(100),           -- '지지층 결집', '미결정층 설득' 등

  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_region_stats
    FOREIGN KEY (stats_id) REFERENCES election_stats(id) ON DELETE CASCADE,
  CONSTRAINT fk_region_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  CONSTRAINT uq_region_stats
    UNIQUE (stats_id, region_name)
);

COMMENT ON TABLE election_stats_by_region IS '지역(자치구/시/도)별 지지도 상세';


-- ============================================================================
-- 3. election_stats_by_age (연령대별 지지도)
-- ============================================================================
CREATE TABLE IF NOT EXISTS election_stats_by_age (
  id                  SERIAL PRIMARY KEY,
  stats_id            INT NOT NULL,
  candidate_id        INT NOT NULL,
  snapshot_date       DATE NOT NULL,

  -- 연령 구분
  age_group           VARCHAR(20) NOT NULL,   -- '10-20대', '30대', '40대', '50대', '60대+'
  age_min             INT,                     -- 최솟값 (선택)
  age_max             INT,                     -- 최댓값 (선택, NULL = 이상)

  -- 지표
  support_rate        NUMERIC(5,2) NOT NULL CHECK (support_rate BETWEEN 0 AND 100),
  favorability_rate   NUMERIC(5,2)          CHECK (favorability_rate BETWEEN 0 AND 100),
  sample_size         INT DEFAULT 0,

  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_age_stats
    FOREIGN KEY (stats_id) REFERENCES election_stats(id) ON DELETE CASCADE,
  CONSTRAINT fk_age_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  CONSTRAINT uq_age_stats
    UNIQUE (stats_id, age_group)
);

COMMENT ON TABLE election_stats_by_age IS '연령대별 지지도 상세';


-- ============================================================================
-- 4. election_stats_competitors (경쟁 후보 비교)
-- ============================================================================
CREATE TABLE IF NOT EXISTS election_stats_competitors (
  id                  SERIAL PRIMARY KEY,
  stats_id            INT NOT NULL,
  snapshot_date       DATE NOT NULL,

  -- 후보 정보
  candidate_label     VARCHAR(100) NOT NULL,  -- '오세훈', '후보 A', '후보 B'
  is_our_candidate    BOOLEAN NOT NULL DEFAULT FALSE,

  -- 지표
  support_rate        NUMERIC(5,2) NOT NULL CHECK (support_rate BETWEEN 0 AND 100),
  favorability_rate   NUMERIC(5,2)          CHECK (favorability_rate BETWEEN 0 AND 100),
  policy_trust        NUMERIC(5,2)          CHECK (policy_trust BETWEEN 0 AND 100),
  leadership_score    NUMERIC(5,2)          CHECK (leadership_score BETWEEN 0 AND 100),
  economics_score     NUMERIC(5,2)          CHECK (economics_score BETWEEN 0 AND 100),

  -- 경쟁 포지션
  position            VARCHAR(20),            -- '우위', '열세', '동률'

  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_competitor_stats
    FOREIGN KEY (stats_id) REFERENCES election_stats(id) ON DELETE CASCADE,
  CONSTRAINT uq_competitor_stats
    UNIQUE (stats_id, candidate_label)
);

COMMENT ON TABLE election_stats_competitors IS '경쟁 후보 간 지표 비교';


-- ============================================================================
-- 5. 인덱스 생성
-- ============================================================================

-- election_stats: 날짜·후보자 조회 최적화
CREATE INDEX IF NOT EXISTS idx_election_stats_candidate_date
  ON election_stats (candidate_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_election_stats_snapshot_type
  ON election_stats (candidate_id, snapshot_type, snapshot_date DESC);

-- election_stats_by_region: 지역명 검색
CREATE INDEX IF NOT EXISTS idx_region_stats_id
  ON election_stats_by_region (stats_id);

CREATE INDEX IF NOT EXISTS idx_region_stats_candidate_date
  ON election_stats_by_region (candidate_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_region_name
  ON election_stats_by_region (region_name);

-- election_stats_by_age: age_group 조회
CREATE INDEX IF NOT EXISTS idx_age_stats_id
  ON election_stats_by_age (stats_id);

-- election_stats_competitors: 날짜별 비교 조회
CREATE INDEX IF NOT EXISTS idx_competitor_stats_id
  ON election_stats_competitors (stats_id);


-- ============================================================================
-- 6. updated_at 자동 갱신 트리거
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_election_stats_updated_at ON election_stats;
CREATE TRIGGER trg_election_stats_updated_at
  BEFORE UPDATE ON election_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 7. 시드 데이터 (초기 더미 데이터 — 개발/테스트용)
-- ============================================================================

-- 전체 지지도 스냅샷 (주간 3개)
INSERT INTO election_stats
  (candidate_id, snapshot_date, snapshot_type,
   support_rate, favorability_rate, undecided_rate, oppose_rate,
   support_delta, favorability_delta,
   sample_size, survey_agency, margin_of_error, notes)
VALUES
  (1, '2026-03-08', 'weekly', 42.0, 58.0, 27.0, 13.0,  0.0,  0.0, 1000, '캠프 내부 조사', 3.1, '3월 1주차'),
  (1, '2026-03-15', 'weekly', 43.0, 59.0, 26.0, 13.0, +1.0, +1.0, 1000, '캠프 내부 조사', 3.1, '3월 2주차'),
  (1, '2026-03-19', 'weekly', 45.0, 60.0, 25.0, 12.0, +2.0, +1.0, 1200, '캠프 내부 조사', 2.8, '3월 3주차 (최신)')
ON CONFLICT (candidate_id, snapshot_date, snapshot_type) DO NOTHING;

-- 지역별 지지도 시드 (최신 weekly 기준)
INSERT INTO election_stats_by_region
  (stats_id, candidate_id, snapshot_date, region_type, region_name,
   support_rate, favorability_rate, turnout_prediction, strategic_priority)
SELECT
  s.id, 1, s.snapshot_date, 'district', r.region_name,
  r.support_rate, r.favorability_rate, r.turnout_prediction, r.strategic_priority
FROM election_stats s
CROSS JOIN (VALUES
  ('도봉구', 52.0, 58.0, 66.0, '지지층 결집'),
  ('노원구', 51.0, 57.0, 64.0, '지지층 결집'),
  ('강북구', 48.0, 54.0, 60.0, '미결정층 설득'),
  ('강동구', 47.0, 53.0, 61.0, '미결정층 설득'),
  ('송파구', 42.0, 48.0, 62.0, '접근'),
  ('동작구', 43.0, 49.0, 60.0, '접근'),
  ('관악구', 41.0, 47.0, 58.0, '접근'),
  ('강남구', 37.0, 45.0, 62.0, '경제정책 강조'),
  ('서초구', 38.0, 46.0, 63.0, '정책 신뢰도 강화'),
  ('강서구', 39.0, 47.0, 56.0, '교통 정책 강조'),
  ('종로구', 44.0, 50.0, 65.0, '지지층 결집'),
  ('중구',   43.0, 49.0, 63.0, '미결정층 설득'),
  ('용산구', 46.0, 52.0, 67.0, '지지층 결집'),
  ('은평구', 45.0, 51.0, 61.0, '미결정층 설득'),
  ('마포구', 44.0, 50.0, 62.0, '미결정층 설득'),
  ('서대문구',42.0,48.0, 59.0, '접근'),
  ('성북구', 46.0, 52.0, 60.0, '미결정층 설득'),
  ('중랑구', 47.0, 53.0, 58.0, '미결정층 설득'),
  ('성동구', 43.0, 49.0, 61.0, '접근')
) AS r(region_name, support_rate, favorability_rate, turnout_prediction, strategic_priority)
WHERE s.snapshot_date = '2026-03-19' AND s.snapshot_type = 'weekly'
ON CONFLICT (stats_id, region_name) DO NOTHING;

-- 연령별 지지도 시드 (최신 weekly 기준)
INSERT INTO election_stats_by_age
  (stats_id, candidate_id, snapshot_date, age_group, age_min, age_max,
   support_rate, favorability_rate, sample_size)
SELECT
  s.id, 1, s.snapshot_date, a.age_group, a.age_min, a.age_max,
  a.support_rate, a.favorability_rate, a.sample_size
FROM election_stats s
CROSS JOIN (VALUES
  ('10-20대', 18, 29, 38.0, 52.0, 200),
  ('30대',    30, 39, 42.0, 56.0, 250),
  ('40대',    40, 49, 48.0, 62.0, 280),
  ('50대',    50, 59, 52.0, 65.0, 270),
  ('60대+',   60, NULL, 55.0, 68.0, 200)
) AS a(age_group, age_min, age_max, support_rate, favorability_rate, sample_size)
WHERE s.snapshot_date = '2026-03-19' AND s.snapshot_type = 'weekly'
ON CONFLICT (stats_id, age_group) DO NOTHING;

-- 경쟁 후보 비교 시드 (최신 weekly 기준)
INSERT INTO election_stats_competitors
  (stats_id, snapshot_date, candidate_label, is_our_candidate,
   support_rate, favorability_rate, policy_trust, leadership_score, economics_score, position)
SELECT
  s.id, s.snapshot_date, c.candidate_label, c.is_our_candidate,
  c.support_rate, c.favorability_rate, c.policy_trust, c.leadership_score, c.economics_score, c.position
FROM election_stats s
CROSS JOIN (VALUES
  ('오세훈',  TRUE,  45.0, 60.0, 52.0, 58.0, 48.0, '우위'),
  ('후보 A',  FALSE, 38.0, 48.0, 42.0, 44.0, 41.0, '열세'),
  ('후보 B',  FALSE, 32.0, 44.0, 35.0, 39.0, 37.0, '열세')
) AS c(candidate_label, is_our_candidate, support_rate, favorability_rate,
       policy_trust, leadership_score, economics_score, position)
WHERE s.snapshot_date = '2026-03-19' AND s.snapshot_type = 'weekly'
ON CONFLICT (stats_id, candidate_label) DO NOTHING;
