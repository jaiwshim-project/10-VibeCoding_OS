/**
 * ============================================================================
 * 선거 통계 API 라우트 (Task #33 — Phase 3 실시간 데이터 API)
 * ============================================================================
 * GET /api/stats/support      — 지지도 현황 (전국, 지역별, 연령별)
 * GET /api/stats/weekly       — 주간 추이
 * GET /api/stats/districts    — 자치구별 상세 현황
 * GET /api/stats/competitive  — 경쟁 후보 비교
 * GET /api/stats/summary      — 대시보드 요약
 * POST /api/stats/snapshot    — 새 스냅샷 등록 (관리자)
 * PUT  /api/stats/snapshot/:id — 스냅샷 수정 (관리자)
 * ============================================================================
 * 작성: Alpha 분대 (api-developer + backend-developer)
 * 날짜: 2026-03-19
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { verifyToken, sendError, sendSuccess } = require('../middleware/auth');

// ============================================================================
// 내부 헬퍼: 후보자 ID 파라미터 파싱 (기본값 1)
// ============================================================================
function parseCandidateId(query) {
  const id = parseInt(query.candidate_id || query.candidateId || '1', 10);
  return isNaN(id) || id < 1 ? 1 : id;
}

// ============================================================================
// 내부 헬퍼: 최신 election_stats 레코드 조회
// snapshot_type 우선순위: 'weekly' 최신 → 'daily' 최신 → 없으면 null
// ============================================================================
async function getLatestSnapshot(db, candidateId) {
  const result = await db.query(
    `SELECT * FROM election_stats
     WHERE candidate_id = $1
     ORDER BY snapshot_date DESC, created_at DESC
     LIMIT 1`,
    [candidateId]
  );
  return result.rows[0] || null;
}

// ============================================================================
// GET /api/stats/support
// 지지도 현황: 전국 + 지역별 + 연령별
// Query: candidate_id (default: 1), region (선택), age_group (선택)
// ============================================================================
router.get('/support', async (req, res) => {
  try {
    const { region, age_group } = req.query;
    const candidateId = parseCandidateId(req.query);

    const snapshot = await getLatestSnapshot(req.db, candidateId);

    if (!snapshot) {
      return sendError(res, 404, 'No stats data found for this candidate');
    }

    // ── 지역별 단일 조회 ──
    if (region) {
      const regionResult = await req.db.query(
        `SELECT region_name, support_rate, favorability_rate,
                turnout_prediction, strategic_priority
         FROM election_stats_by_region
         WHERE stats_id = $1 AND region_name = $2
         LIMIT 1`,
        [snapshot.id, region]
      );
      if (regionResult.rows.length === 0) {
        return sendError(res, 404, `Region '${region}' not found`);
      }
      return sendSuccess(res, 200, regionResult.rows[0], 'Support data retrieved');
    }

    // ── 연령대 단일 조회 ──
    if (age_group) {
      const ageResult = await req.db.query(
        `SELECT age_group, support_rate, favorability_rate, sample_size
         FROM election_stats_by_age
         WHERE stats_id = $1 AND age_group = $2
         LIMIT 1`,
        [snapshot.id, age_group]
      );
      if (ageResult.rows.length === 0) {
        return sendError(res, 404, `Age group '${age_group}' not found`);
      }
      return sendSuccess(res, 200, ageResult.rows[0], 'Support data retrieved');
    }

    // ── 전체 조회: overall + byRegion + byAgeGroup ──
    const [regionRows, ageRows] = await Promise.all([
      req.db.query(
        `SELECT region_name AS region, support_rate AS support,
                favorability_rate AS favorability,
                turnout_prediction, strategic_priority
         FROM election_stats_by_region
         WHERE stats_id = $1
         ORDER BY support_rate DESC`,
        [snapshot.id]
      ),
      req.db.query(
        `SELECT age_group AS "ageGroup",
                support_rate AS support,
                favorability_rate AS favorability,
                sample_size
         FROM election_stats_by_age
         WHERE stats_id = $1
         ORDER BY age_min ASC NULLS LAST`,
        [snapshot.id]
      ),
    ]);

    const supportData = {
      overall: {
        support:        parseFloat(snapshot.support_rate),
        favorability:   parseFloat(snapshot.favorability_rate),
        undecided:      parseFloat(snapshot.undecided_rate),
        oppose:         snapshot.oppose_rate ? parseFloat(snapshot.oppose_rate) : null,
        support_delta:  parseFloat(snapshot.support_delta || 0),
        favorability_delta: parseFloat(snapshot.favorability_delta || 0),
        sample_size:    snapshot.sample_size,
        survey_agency:  snapshot.survey_agency,
        margin_of_error: snapshot.margin_of_error ? parseFloat(snapshot.margin_of_error) : null,
        snapshot_date:  snapshot.snapshot_date,
        updated_at:     snapshot.updated_at,
      },
      byRegion:   regionRows.rows.map(r => ({
        region:       r.region,
        support:      parseFloat(r.support),
        favorability: r.favorability ? parseFloat(r.favorability) : null,
        turnoutPrediction: r.turnout_prediction ? parseFloat(r.turnout_prediction) : null,
        strategicPriority: r.strategic_priority,
      })),
      byAgeGroup: ageRows.rows.map(a => ({
        ageGroup:     a.ageGroup,
        support:      parseFloat(a.support),
        favorability: a.favorability ? parseFloat(a.favorability) : null,
        sampleSize:   a.sample_size,
      })),
    };

    sendSuccess(res, 200, supportData, 'Support data retrieved');
  } catch (error) {
    console.error('GET /api/stats/support error:', error);
    sendError(res, 500, 'Failed to retrieve support data');
  }
});

// ============================================================================
// GET /api/stats/weekly
// 주간 추이 — 최근 N개 weekly 스냅샷
// Query: candidate_id (default: 1), weeks (default: 8)
// ============================================================================
router.get('/weekly', async (req, res) => {
  try {
    const candidateId = parseCandidateId(req.query);
    const weeks = Math.min(parseInt(req.query.weeks || '8', 10), 52);

    const weeklyResult = await req.db.query(
      `SELECT
         snapshot_date,
         TO_CHAR(snapshot_date, 'MM/DD') AS week_start,
         support_rate     AS support,
         favorability_rate AS favorability,
         undecided_rate   AS undecided,
         support_delta,
         favorability_delta,
         sample_size,
         survey_agency,
         notes
       FROM election_stats
       WHERE candidate_id = $1
         AND snapshot_type = 'weekly'
       ORDER BY snapshot_date DESC
       LIMIT $2`,
      [candidateId, weeks]
    );

    if (weeklyResult.rows.length === 0) {
      return sendError(res, 404, 'No weekly data found');
    }

    // 최신 vs 직전 주 트렌드 계산
    const rows = weeklyResult.rows.reverse(); // 오름차순으로 변환 (차트용)
    const latest = rows[rows.length - 1];
    const prev   = rows.length >= 2 ? rows[rows.length - 2] : null;

    const formatDelta = (delta) => {
      if (delta === null || delta === undefined) return '→ 변동 없음';
      const num = parseFloat(delta);
      if (num > 0) return `+${num.toFixed(1)}%`;
      if (num < 0) return `${num.toFixed(1)}%`;
      return '→ 변동 없음';
    };

    const weeklyData = {
      weeks: rows.map(r => ({
        week:         r.week_start,
        snapshotDate: r.snapshot_date,
        support:      parseFloat(r.support),
        favorability: parseFloat(r.favorability),
        undecided:    parseFloat(r.undecided),
        support_delta:      parseFloat(r.support_delta || 0),
        favorability_delta: parseFloat(r.favorability_delta || 0),
        sampleSize:   r.sample_size,
        surveyAgency: r.survey_agency,
        notes:        r.notes,
      })),
      trend: {
        supportTrend:      formatDelta(latest.support_delta),
        favorabilityTrend: formatDelta(latest.favorability_delta),
        undecidedTrend: prev
          ? formatDelta((parseFloat(latest.undecided) - parseFloat(prev.undecided)).toFixed(2))
          : '→ 변동 없음',
      },
      updated_at: new Date(),
    };

    sendSuccess(res, 200, weeklyData, 'Weekly data retrieved');
  } catch (error) {
    console.error('GET /api/stats/weekly error:', error);
    sendError(res, 500, 'Failed to retrieve weekly data');
  }
});

// ============================================================================
// GET /api/stats/districts
// 자치구별 상세 현황
// Query: candidate_id (default: 1), region_type (default: 'district')
// ============================================================================
router.get('/districts', async (req, res) => {
  try {
    const candidateId = parseCandidateId(req.query);
    const regionType  = req.query.region_type || 'district';

    const snapshot = await getLatestSnapshot(req.db, candidateId);
    if (!snapshot) {
      return sendError(res, 404, 'No stats data found');
    }

    const districtResult = await req.db.query(
      `SELECT
         region_name      AS name,
         support_rate     AS support,
         favorability_rate AS favorability,
         turnout_prediction AS "turnoutPrediction",
         strategic_priority AS "strategicPriority"
       FROM election_stats_by_region
       WHERE stats_id = $1
         AND region_type = $2
       ORDER BY support_rate DESC`,
      [snapshot.id, regionType]
    );

    if (districtResult.rows.length === 0) {
      return sendError(res, 404, `No district data found for region_type='${regionType}'`);
    }

    const districts = districtResult.rows.map(d => ({
      name:             d.name,
      support:          parseFloat(d.support),
      favorability:     d.favorability ? parseFloat(d.favorability) : null,
      turnoutPrediction:d.turnoutPrediction ? parseFloat(d.turnoutPrediction) : null,
      strategicPriority:d.strategicPriority,
    }));

    // 집계 요약
    const supports   = districts.map(d => d.support);
    const turnouts   = districts.filter(d => d.turnoutPrediction !== null).map(d => d.turnoutPrediction);
    const avgSupport = supports.reduce((a, b) => a + b, 0) / supports.length;
    const avgTurnout = turnouts.length > 0
      ? turnouts.reduce((a, b) => a + b, 0) / turnouts.length
      : 0;

    const summary = {
      strongRegions: districts.filter(d => d.support >= 45).length,
      targetRegions: districts.filter(d => d.support >= 40 && d.support < 45).length,
      weakRegions:   districts.filter(d => d.support < 40).length,
      averageSupport: parseFloat(avgSupport.toFixed(1)),
      averageTurnout: parseFloat(avgTurnout.toFixed(1)),
      totalDistricts: districts.length,
    };

    sendSuccess(res, 200, {
      districts,
      summary,
      snapshot_date: snapshot.snapshot_date,
      updated_at: snapshot.updated_at,
    }, 'Districts data retrieved');
  } catch (error) {
    console.error('GET /api/stats/districts error:', error);
    sendError(res, 500, 'Failed to retrieve districts data');
  }
});

// ============================================================================
// GET /api/stats/competitive
// 경쟁 후보 비교 데이터
// Query: candidate_id (default: 1)
// ============================================================================
router.get('/competitive', async (req, res) => {
  try {
    const candidateId = parseCandidateId(req.query);

    const snapshot = await getLatestSnapshot(req.db, candidateId);
    if (!snapshot) {
      return sendError(res, 404, 'No stats data found');
    }

    const competitorResult = await req.db.query(
      `SELECT
         candidate_label  AS name,
         is_our_candidate AS "isOurCandidate",
         support_rate     AS support,
         favorability_rate AS favorability,
         policy_trust     AS "policyTrust",
         leadership_score AS leadership,
         economics_score  AS economics,
         position
       FROM election_stats_competitors
       WHERE stats_id = $1
       ORDER BY support_rate DESC`,
      [snapshot.id]
    );

    if (competitorResult.rows.length === 0) {
      return sendError(res, 404, 'No competitor data found');
    }

    const candidates = competitorResult.rows.map(c => ({
      name:          c.name,
      isOurCandidate:c.isOurCandidate,
      support:       parseFloat(c.support),
      favorability:  c.favorability  ? parseFloat(c.favorability)  : null,
      policyTrust:   c.policyTrust   ? parseFloat(c.policyTrust)   : null,
      leadership:    c.leadership    ? parseFloat(c.leadership)     : null,
      economics:     c.economics     ? parseFloat(c.economics)      : null,
      position:      c.position,
    }));

    // 격차 계산: 아군(isOurCandidate=true) vs 나머지
    const ours   = candidates.find(c => c.isOurCandidate);
    const others = candidates.filter(c => !c.isOurCandidate);
    const gaps   = {};
    others.forEach((o, i) => {
      const label = String.fromCharCode(65 + i); // A, B, C ...
      gaps[`against_${label.toLowerCase()}`] = ours
        ? parseFloat((ours.support - o.support).toFixed(1))
        : null;
    });
    gaps.trend = ours && others.length > 0
      ? (ours.support - others[0].support >= 5 ? 'Expanding' : 'Stable')
      : 'Unknown';

    sendSuccess(res, 200, {
      candidates,
      gaps,
      snapshot_date: snapshot.snapshot_date,
      updated_at:    snapshot.updated_at,
    }, 'Competitive data retrieved');
  } catch (error) {
    console.error('GET /api/stats/competitive error:', error);
    sendError(res, 500, 'Failed to retrieve competitive data');
  }
});

// ============================================================================
// GET /api/stats/summary
// 대시보드 요약 KPI
// Query: candidate_id (default: 1)
// ============================================================================
router.get('/summary', async (req, res) => {
  try {
    const candidateId = parseCandidateId(req.query);

    const snapshot = await getLatestSnapshot(req.db, candidateId);
    if (!snapshot) {
      return sendError(res, 404, 'No stats data found');
    }

    // 직전 weekly 스냅샷 (트렌드 비교용)
    const prevResult = await req.db.query(
      `SELECT support_rate, favorability_rate, undecided_rate
       FROM election_stats
       WHERE candidate_id = $1
         AND snapshot_type = 'weekly'
         AND snapshot_date < $2
       ORDER BY snapshot_date DESC
       LIMIT 1`,
      [candidateId, snapshot.snapshot_date]
    );
    const prev = prevResult.rows[0] || null;

    // 총 자치구 수 (regions) 조회
    const districtCountResult = await req.db.query(
      `SELECT COUNT(*) AS cnt FROM election_stats_by_region WHERE stats_id = $1`,
      [snapshot.id]
    );
    const districtCount = parseInt(districtCountResult.rows[0]?.cnt || 0);

    // 핵심 이슈 수: 전략적 우선순위가 설정된 구 수
    const priorityResult = await req.db.query(
      `SELECT COUNT(DISTINCT strategic_priority) AS cnt
       FROM election_stats_by_region
       WHERE stats_id = $1 AND strategic_priority IS NOT NULL`,
      [snapshot.id]
    );
    const keyIssues = parseInt(priorityResult.rows[0]?.cnt || 0);

    const formatTrend = (curr, prevVal) => {
      if (!prevVal) return '→ 변동 없음';
      const delta = parseFloat(curr) - parseFloat(prevVal);
      if (delta > 0) return `+${delta.toFixed(1)}%`;
      if (delta < 0) return `${delta.toFixed(1)}%`;
      return '→ 변동 없음';
    };

    const supportVal      = parseFloat(snapshot.support_rate);
    const favorVal        = parseFloat(snapshot.favorability_rate);
    const prevSupport     = prev ? parseFloat(prev.support_rate)      : null;
    const prevFavor       = prev ? parseFloat(prev.favorability_rate) : null;

    const summary = {
      kpis: {
        support: {
          value:  supportVal,
          trend:  formatTrend(supportVal, prevSupport),
          status: supportVal >= 45 ? '목표 달성' : supportVal >= 40 ? '목표 근접' : '목표 미달',
        },
        favorability: {
          value:  favorVal,
          trend:  formatTrend(favorVal, prevFavor),
          status: favorVal >= 55 ? '목표 달성' : '목표 미달',
        },
        districts: {
          value:  districtCount,
          trend:  '→ 추적 중',
          status: '모니터링',
        },
        keyIssues: {
          value:  keyIssues,
          trend:  '→ 추적 중',
          status: '관심',
        },
      },
      snapshot_date: snapshot.snapshot_date,
      survey_agency: snapshot.survey_agency,
      sample_size:   snapshot.sample_size,
      lastUpdate:    snapshot.updated_at,
    };

    sendSuccess(res, 200, summary, 'Summary data retrieved');
  } catch (error) {
    console.error('GET /api/stats/summary error:', error);
    sendError(res, 500, 'Failed to retrieve summary data');
  }
});

// ============================================================================
// POST /api/stats/snapshot
// 새 스냅샷 등록 (관리자 전용)
// Body: { candidate_id, snapshot_date, snapshot_type, support_rate,
//         favorability_rate, undecided_rate, oppose_rate,
//         support_delta, favorability_delta,
//         sample_size, survey_agency, margin_of_error, notes }
// ============================================================================
router.post('/snapshot', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can create stats snapshots');
    }

    const {
      candidate_id   = 1,
      snapshot_date,
      snapshot_type  = 'manual',
      support_rate,
      favorability_rate,
      undecided_rate,
      oppose_rate    = null,
      support_delta  = 0,
      favorability_delta = 0,
      sample_size    = 0,
      survey_agency  = null,
      margin_of_error = null,
      notes          = null,
    } = req.body;

    // 필수값 검증
    if (support_rate === undefined || favorability_rate === undefined || undecided_rate === undefined) {
      return sendError(res, 400, 'support_rate, favorability_rate, undecided_rate are required');
    }

    const insertResult = await req.db.query(
      `INSERT INTO election_stats
         (candidate_id, snapshot_date, snapshot_type,
          support_rate, favorability_rate, undecided_rate, oppose_rate,
          support_delta, favorability_delta,
          sample_size, survey_agency, margin_of_error, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (candidate_id, snapshot_date, snapshot_type)
         DO UPDATE SET
           support_rate       = EXCLUDED.support_rate,
           favorability_rate  = EXCLUDED.favorability_rate,
           undecided_rate     = EXCLUDED.undecided_rate,
           oppose_rate        = EXCLUDED.oppose_rate,
           support_delta      = EXCLUDED.support_delta,
           favorability_delta = EXCLUDED.favorability_delta,
           sample_size        = EXCLUDED.sample_size,
           survey_agency      = EXCLUDED.survey_agency,
           margin_of_error    = EXCLUDED.margin_of_error,
           notes              = EXCLUDED.notes,
           updated_at         = NOW()
       RETURNING *`,
      [
        candidate_id,
        snapshot_date || new Date().toISOString().split('T')[0],
        snapshot_type,
        support_rate, favorability_rate, undecided_rate, oppose_rate,
        support_delta, favorability_delta,
        sample_size, survey_agency, margin_of_error, notes,
      ]
    );

    sendSuccess(res, 201, insertResult.rows[0], 'Snapshot created/updated successfully');
  } catch (error) {
    console.error('POST /api/stats/snapshot error:', error);
    sendError(res, 500, 'Failed to create stats snapshot');
  }
});

// ============================================================================
// PUT /api/stats/snapshot/:id
// 스냅샷 수정 (관리자 전용)
// ============================================================================
router.put('/snapshot/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can update stats snapshots');
    }

    const { id } = req.params;
    const fields = [
      'support_rate', 'favorability_rate', 'undecided_rate', 'oppose_rate',
      'support_delta', 'favorability_delta', 'sample_size',
      'survey_agency', 'margin_of_error', 'notes',
    ];

    // 전달된 필드만 SET
    const updates = [];
    const values  = [];
    let paramIdx  = 1;

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIdx++}`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return sendError(res, 400, 'No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const updateResult = await req.db.query(
      `UPDATE election_stats
       SET ${updates.join(', ')}
       WHERE id = $${paramIdx}
       RETURNING *`,
      values
    );

    if (updateResult.rows.length === 0) {
      return sendError(res, 404, `Snapshot id=${id} not found`);
    }

    sendSuccess(res, 200, updateResult.rows[0], 'Snapshot updated successfully');
  } catch (error) {
    console.error('PUT /api/stats/snapshot/:id error:', error);
    sendError(res, 500, 'Failed to update stats snapshot');
  }
});

module.exports = router;
