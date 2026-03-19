/**
 * ============================================================================
 * 후보자 API 라우트 (Task #11)
 * ============================================================================
 * GET /api/candidates — 후보자 목록
 * GET /api/candidates/:id — 후보자 상세
 * PUT /api/candidates/:id — 후보자 정보 수정 (관리자)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  verifyToken,
  requireRole,
  optionalAuth,
  sendError,
  sendSuccess,
} = require('../middleware/auth');

/**
 * GET /api/candidates
 * 후보자 목록 (공개)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT id, name, title, bio, photo_url, email, website, social_links, created_at, updated_at
       FROM candidates
       ORDER BY id ASC`
    );

    sendSuccess(res, 200, result.rows, 'Candidates retrieved successfully');
  } catch (error) {
    console.error('GET /api/candidates error:', error);
    sendError(res, 500, 'Failed to retrieve candidates');
  }
});

/**
 * GET /api/candidates/:id
 * 후보자 상세 (공개)
 * 정책 수, 뉴스 수, 위치 수도 함께 반환
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const candidateResult = await req.db.query(
      `SELECT id, name, title, bio, photo_url, email, phone, website, social_links, created_at, updated_at
       FROM candidates WHERE id = $1`,
      [id]
    );

    if (candidateResult.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    const candidate = candidateResult.rows[0];

    // 관련 통계 집계
    const [policiesCount, newsCount, locationsCount] = await Promise.all([
      req.db.query('SELECT COUNT(*) FROM policies WHERE candidate_id = $1 AND status = $2', [id, 'published']),
      req.db.query('SELECT COUNT(*) FROM news WHERE candidate_id = $1 AND status = $2', [id, 'published']),
      req.db.query('SELECT COUNT(*) FROM locations WHERE candidate_id = $1', [id]),
    ]);

    sendSuccess(res, 200, {
      ...candidate,
      stats: {
        policies_count: parseInt(policiesCount.rows[0].count),
        news_count: parseInt(newsCount.rows[0].count),
        locations_count: parseInt(locationsCount.rows[0].count),
      },
    }, 'Candidate retrieved successfully');
  } catch (error) {
    console.error('GET /api/candidates/:id error:', error);
    sendError(res, 500, 'Failed to retrieve candidate');
  }
});

/**
 * PUT /api/candidates/:id
 * 후보자 정보 수정 (관리자)
 */
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['name', 'title', 'bio', 'photo_url', 'email', 'phone', 'website', 'social_links'];

    const updates = [];
    const values = [];
    let paramCount = 1;

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(field === 'social_links' ? JSON.stringify(req.body[field]) : req.body[field]);
      }
    });

    if (updates.length === 0) {
      return sendError(res, 400, 'No fields to update');
    }

    values.push(id);

    const result = await req.db.query(
      `UPDATE candidates SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, name, title, bio, photo_url, email, phone, website, social_links, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    sendSuccess(res, 200, result.rows[0], 'Candidate updated successfully');
  } catch (error) {
    console.error('PUT /api/candidates/:id error:', error);
    sendError(res, 500, 'Failed to update candidate');
  }
});

module.exports = router;
