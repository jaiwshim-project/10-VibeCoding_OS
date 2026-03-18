/**
 * ============================================================================
 * 뉴스 API 라우트 (Task #11)
 * ============================================================================
 * GET /api/news — 뉴스 목록
 * GET /api/news/:slug — 뉴스 상세 (slug 또는 id)
 * POST /api/news — 뉴스 생성 (에디터/관리자)
 * PUT /api/news/:id — 뉴스 수정 (에디터/관리자)
 * DELETE /api/news/:id — 뉴스 삭제 (관리자만)
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
 * GET /api/news
 * 뉴스 목록 조회 (공개)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      candidate_id,
      category,
      status = 'published',
      limit = 20,
      offset = 0,
      sort = 'published_at',
    } = req.query;

    let query = `
      SELECT
        id, candidate_id, title, slug, content, excerpt,
        thumbnail_url, category, author, published_at,
        status, view_count, created_at, updated_at
      FROM news
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

    // 정렬
    const allowedSortFields = ['published_at', 'created_at', 'view_count', 'title'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'published_at';
    query += ` ORDER BY ${sortField} DESC`;

    // 페이지네이션
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const news = await req.db.query(query, params);

    sendSuccess(res, 200, news.rows, 'News retrieved successfully');
  } catch (error) {
    console.error('GET /api/news error:', error);
    sendError(res, 500, 'Failed to retrieve news');
  }
});

/**
 * GET /api/news/:slug
 * 뉴스 상세 조회 (slug 또는 id)
 */
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // slug로 먼저 검색 시도
    let query = `
      SELECT
        id, candidate_id, title, slug, content, excerpt,
        thumbnail_url, category, author, published_at,
        status, view_count, created_at, updated_at
      FROM news
      WHERE (slug = $1 OR id = $1::INT)
      AND status = 'published'
      LIMIT 1
    `;

    const result = await req.db.query(query, [slug]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'News not found');
    }

    // 조회수 증가 (비동기로 처리)
    setImmediate(() => {
      req.db.query('UPDATE news SET view_count = view_count + 1 WHERE id = $1', [result.rows[0].id]).catch(err => {
        console.error('Failed to update view count:', err);
      });
    });

    sendSuccess(res, 200, result.rows[0], 'News retrieved successfully');
  } catch (error) {
    console.error('GET /api/news/:slug error:', error);
    sendError(res, 500, 'Failed to retrieve news');
  }
});

/**
 * POST /api/news
 * 뉴스 생성 (에디터/관리자)
 */
router.post('/', verifyToken, requireRole('editor', 'admin'), async (req, res) => {
  try {
    const {
      candidate_id,
      title,
      content,
      excerpt,
      thumbnail_url,
      category,
      author,
      slug,
      published_at,
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

    // slug 자동 생성 (제공되지 않은 경우)
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const query = `
      INSERT INTO news
      (candidate_id, title, slug, content, excerpt, thumbnail_url,
       category, author, published_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, candidate_id, title, slug, content, excerpt,
                thumbnail_url, category, author, published_at,
                status, view_count, created_at, updated_at
    `;

    const result = await req.db.query(query, [
      candidate_id,
      title,
      finalSlug,
      content || null,
      excerpt || null,
      thumbnail_url || null,
      category || null,
      author || null,
      published_at || new Date(),
      status,
    ]);

    sendSuccess(res, 201, result.rows[0], 'News created successfully');
  } catch (error) {
    console.error('POST /api/news error:', error);
    if (error.code === '23505') {
      return sendError(res, 409, 'Slug already exists');
    }
    sendError(res, 500, 'Failed to create news');
  }
});

/**
 * PUT /api/news/:id
 * 뉴스 수정 (에디터/관리자)
 */
router.put('/:id', verifyToken, requireRole('editor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      thumbnail_url,
      category,
      author,
      slug,
      published_at,
      status,
    } = req.body;

    // 기존 뉴스 확인
    const existing = await req.db.query(
      'SELECT id FROM news WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return sendError(res, 404, 'News not found');
    }

    // 동적 업데이트
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramCount++}`);
      values.push(excerpt);
    }
    if (thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramCount++}`);
      values.push(thumbnail_url);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (author !== undefined) {
      updates.push(`author = $${paramCount++}`);
      values.push(author);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (published_at !== undefined) {
      updates.push(`published_at = $${paramCount++}`);
      values.push(published_at);
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
      UPDATE news
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, candidate_id, title, slug, content, excerpt,
                thumbnail_url, category, author, published_at,
                status, view_count, created_at, updated_at
    `;

    const result = await req.db.query(query, values);

    sendSuccess(res, 200, result.rows[0], 'News updated successfully');
  } catch (error) {
    console.error('PUT /api/news/:id error:', error);
    if (error.code === '23505') {
      return sendError(res, 409, 'Slug already exists');
    }
    sendError(res, 500, 'Failed to update news');
  }
});

/**
 * DELETE /api/news/:id
 * 뉴스 삭제 (관리자만)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 기존 뉴스 확인
    const existing = await req.db.query(
      'SELECT id FROM news WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return sendError(res, 404, 'News not found');
    }

    // 삭제
    await req.db.query('DELETE FROM news WHERE id = $1', [id]);

    sendSuccess(res, 200, { id }, 'News deleted successfully');
  } catch (error) {
    console.error('DELETE /api/news/:id error:', error);
    sendError(res, 500, 'Failed to delete news');
  }
});

module.exports = router;
