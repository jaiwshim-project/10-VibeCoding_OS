/**
 * ============================================================================
 * 정책 API 라우트 (Task #11)
 * ============================================================================
 * GET /api/policies — 정책 목록
 * GET /api/policies/:id — 정책 상세
 * POST /api/policies — 정책 생성 (에디터/관리자)
 * PUT /api/policies/:id — 정책 수정 (에디터/관리자)
 * DELETE /api/policies/:id — 정책 삭제 (관리자만)
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
 * GET /api/policies
 * 정책 목록 조회 (공개)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      candidate_id,
      category,
      status = 'published',
      limit = 50,
      offset = 0,
      sort = 'created_at',
    } = req.query;

    let query = `
      SELECT
        id, candidate_id, title, category, problem_statement,
        solution_description, expected_outcome, budget, timeline,
        status, created_at, updated_at
      FROM policies
      WHERE status = $1
    `;
    const params = [status];
    let paramCount = 2;

    // 필터: 후보자 ID
    if (candidate_id) {
      query += ` AND candidate_id = $${paramCount}`;
      params.push(candidate_id);
      paramCount++;
    }

    // 필터: 카테고리
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // 정렬 (XSS 방지를 위해 화이트리스트 사용)
    const allowedSortFields = ['created_at', 'title', 'budget', 'updated_at'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    query += ` ORDER BY ${sortField} DESC`;

    // 페이지네이션
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const policies = await req.db.query(query, params);

    sendSuccess(res, 200, policies.rows, 'Policies retrieved successfully');
  } catch (error) {
    console.error('GET /api/policies error:', error);
    sendError(res, 500, 'Failed to retrieve policies');
  }
});

/**
 * GET /api/policies/:id
 * 정책 상세 조회 (공개)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        id, candidate_id, title, category, problem_statement,
        solution_description, expected_outcome, budget, timeline,
        status, created_at, updated_at
      FROM policies
      WHERE id = $1 AND status = 'published'
    `;

    const result = await req.db.query(query, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Policy not found');
    }

    sendSuccess(res, 200, result.rows[0], 'Policy retrieved successfully');
  } catch (error) {
    console.error('GET /api/policies/:id error:', error);
    sendError(res, 500, 'Failed to retrieve policy');
  }
});

/**
 * POST /api/policies
 * 정책 생성 (에디터/관리자)
 */
router.post(
  '/',
  verifyToken,
  requireRole('editor', 'admin'),
  async (req, res) => {
    try {
      const {
        candidate_id,
        title,
        category,
        problem_statement,
        solution_description,
        expected_outcome,
        budget,
        timeline,
        status = 'published',
      } = req.body;

      // 필수 필드 검증
      if (!candidate_id || !title) {
        return sendError(res, 400, 'candidate_id and title are required');
      }

      // 후보자 존재 확인
      const candidateCheck = await req.db.query(
        'SELECT id FROM candidates WHERE id = $1',
        [candidate_id]
      );
      if (candidateCheck.rows.length === 0) {
        return sendError(res, 404, 'Candidate not found');
      }

      const query = `
        INSERT INTO policies
        (candidate_id, title, category, problem_statement, solution_description,
         expected_outcome, budget, timeline, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, candidate_id, title, category, problem_statement,
                  solution_description, expected_outcome, budget, timeline,
                  status, created_at, updated_at
      `;

      const result = await req.db.query(query, [
        candidate_id,
        title,
        category || null,
        problem_statement || null,
        solution_description || null,
        expected_outcome || null,
        budget || 0,
        timeline || null,
        status,
      ]);

      sendSuccess(res, 201, result.rows[0], 'Policy created successfully');
    } catch (error) {
      console.error('POST /api/policies error:', error);
      sendError(res, 500, 'Failed to create policy');
    }
  }
);

/**
 * PUT /api/policies/:id
 * 정책 수정 (에디터/관리자)
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('editor', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        category,
        problem_statement,
        solution_description,
        expected_outcome,
        budget,
        timeline,
        status,
      } = req.body;

      // 기존 정책 확인
      const existing = await req.db.query(
        'SELECT id FROM policies WHERE id = $1',
        [id]
      );
      if (existing.rows.length === 0) {
        return sendError(res, 404, 'Policy not found');
      }

      // 동적 업데이트
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramCount++}`);
        values.push(category);
      }
      if (problem_statement !== undefined) {
        updates.push(`problem_statement = $${paramCount++}`);
        values.push(problem_statement);
      }
      if (solution_description !== undefined) {
        updates.push(`solution_description = $${paramCount++}`);
        values.push(solution_description);
      }
      if (expected_outcome !== undefined) {
        updates.push(`expected_outcome = $${paramCount++}`);
        values.push(expected_outcome);
      }
      if (budget !== undefined) {
        updates.push(`budget = $${paramCount++}`);
        values.push(budget);
      }
      if (timeline !== undefined) {
        updates.push(`timeline = $${paramCount++}`);
        values.push(timeline);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        return sendError(res, 400, 'No fields to update');
      }

      values.push(id);

      const query = `
        UPDATE policies
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, candidate_id, title, category, problem_statement,
                  solution_description, expected_outcome, budget, timeline,
                  status, created_at, updated_at
      `;

      const result = await req.db.query(query, values);

      sendSuccess(res, 200, result.rows[0], 'Policy updated successfully');
    } catch (error) {
      console.error('PUT /api/policies/:id error:', error);
      sendError(res, 500, 'Failed to update policy');
    }
  }
);

/**
 * DELETE /api/policies/:id
 * 정책 삭제 (관리자만)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 기존 정책 확인
    const existing = await req.db.query(
      'SELECT id FROM policies WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return sendError(res, 404, 'Policy not found');
    }

    // 삭제
    await req.db.query('DELETE FROM policies WHERE id = $1', [id]);

    sendSuccess(res, 200, { id }, 'Policy deleted successfully');
  } catch (error) {
    console.error('DELETE /api/policies/:id error:', error);
    sendError(res, 500, 'Failed to delete policy');
  }
});

module.exports = router;
