/**
 * ============================================================================
 * 후보자 API 라우트 (Task #11)
 * ============================================================================
 * GET /api/candidates — 후보자 목록
 * GET /api/candidates/:id — 후보자 상세
 * POST /api/candidates — 후보자 생성 (관리자만)
 * PUT /api/candidates/:id — 후보자 수정 (관리자만)
 * DELETE /api/candidates/:id — 후보자 삭제 (관리자만)
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
 * 후보자 목록 조회 (공개)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        id, name, title, bio, photo_url, email, phone,
        website, social_links, created_at, updated_at
      FROM candidates
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const candidates = await req.db.query(query, [limit, offset]);

    sendSuccess(res, 200, candidates.rows, 'Candidates retrieved successfully');
  } catch (error) {
    console.error('GET /api/candidates error:', error);
    sendError(res, 500, 'Failed to retrieve candidates');
  }
});

/**
 * GET /api/candidates/:id
 * 후보자 상세 조회 (공개)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        id, name, title, bio, photo_url, email, phone,
        website, social_links, created_at, updated_at
      FROM candidates
      WHERE id = $1
    `;

    const result = await req.db.query(query, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    sendSuccess(res, 200, result.rows[0], 'Candidate retrieved successfully');
  } catch (error) {
    console.error('GET /api/candidates/:id error:', error);
    sendError(res, 500, 'Failed to retrieve candidate');
  }
});

/**
 * POST /api/candidates
 * 후보자 생성 (관리자만)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, title, bio, photo_url, email, phone, website, social_links } = req.body;

    // 필수 필드 검증
    if (!name) {
      return sendError(res, 400, 'Name is required');
    }

    const query = `
      INSERT INTO candidates (name, title, bio, photo_url, email, phone, website, social_links)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, title, bio, photo_url, email, phone, website, social_links, created_at, updated_at
    `;

    const result = await req.db.query(query, [
      name,
      title || null,
      bio || null,
      photo_url || null,
      email || null,
      phone || null,
      website || null,
      social_links ? JSON.stringify(social_links) : '{}',
    ]);

    sendSuccess(res, 201, result.rows[0], 'Candidate created successfully');
  } catch (error) {
    console.error('POST /api/candidates error:', error);
    if (error.code === '23505') {
      return sendError(res, 409, 'Candidate already exists');
    }
    sendError(res, 500, 'Failed to create candidate');
  }
});

/**
 * PUT /api/candidates/:id
 * 후보자 정보 수정 (관리자만)
 */
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, bio, photo_url, email, phone, website, social_links } = req.body;

    // 기존 후보자 확인
    const existing = await req.db.query(
      'SELECT id FROM candidates WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    // 동적 업데이트 (제공된 필드만 업데이트)
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount++}`);
      values.push(photo_url);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (website !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(website);
    }
    if (social_links !== undefined) {
      updates.push(`social_links = $${paramCount++}`);
      values.push(JSON.stringify(social_links));
    }

    if (updates.length === 0) {
      return sendError(res, 400, 'No fields to update');
    }

    values.push(id);

    const query = `
      UPDATE candidates
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, title, bio, photo_url, email, phone, website, social_links, created_at, updated_at
    `;

    const result = await req.db.query(query, values);

    sendSuccess(res, 200, result.rows[0], 'Candidate updated successfully');
  } catch (error) {
    console.error('PUT /api/candidates/:id error:', error);
    sendError(res, 500, 'Failed to update candidate');
  }
});

/**
 * DELETE /api/candidates/:id
 * 후보자 삭제 (관리자만)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 기존 후보자 확인
    const existing = await req.db.query(
      'SELECT id FROM candidates WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    // 삭제 (CASCADE 설정으로 관련 데이터도 함께 삭제)
    await req.db.query('DELETE FROM candidates WHERE id = $1', [id]);

    sendSuccess(res, 200, { id }, 'Candidate deleted successfully');
  } catch (error) {
    console.error('DELETE /api/candidates/:id error:', error);
    sendError(res, 500, 'Failed to delete candidate');
  }
});

module.exports = router;
