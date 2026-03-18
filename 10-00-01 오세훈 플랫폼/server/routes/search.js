/**
 * ============================================================================
 * 검색 API 라우트 (Task #11)
 * ============================================================================
 * POST /api/search — 통합 검색 (정책, 뉴스, 위치)
 * GET /api/search/analytics — 검색 통계 (관리자만)
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
 * POST /api/search
 * 통합 검색 (정책, 뉴스, 위치)
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { q, candidate_id, type, limit = 30 } = req.body;

    if (!q || q.trim().length === 0) {
      return sendError(res, 400, 'Search query is required');
    }

    const searchQuery = q.trim();
    const results = {
      query: searchQuery,
      timestamp: new Date(),
      results: {
        policies: [],
        news: [],
        locations: [],
      },
      total: 0,
    };

    // 1. 정책 검색
    if (!type || type === 'policies') {
      const policiesQuery = `
        SELECT
          'policy' AS type,
          id, candidate_id, title, category,
          SUBSTRING(solution_description, 1, 200) AS excerpt,
          NULL AS slug, NULL AS published_at
        FROM policies
        WHERE status = 'published'
          AND (to_tsvector('korean', title) @@ plainto_tsquery('korean', $1)
               OR to_tsvector('korean', solution_description) @@ plainto_tsquery('korean', $1))
          ${candidate_id ? 'AND candidate_id = $2' : ''}
        ORDER BY CASE
                 WHEN title ILIKE '%' || $1 || '%' THEN 1
                 ELSE 2
               END, created_at DESC
        LIMIT $${candidate_id ? '3' : '2'}
      `;

      const policiesParams = candidate_id ? [searchQuery, candidate_id, limit] : [searchQuery, limit];
      const policiesResult = await req.db.query(policiesQuery, policiesParams);
      results.results.policies = policiesResult.rows;
      results.total += policiesResult.rows.length;
    }

    // 2. 뉴스 검색
    if (!type || type === 'news') {
      const newsQuery = `
        SELECT
          'news' AS type,
          id, candidate_id, title, category,
          excerpt, slug, published_at
        FROM news
        WHERE status = 'published'
          AND (to_tsvector('korean', title) @@ plainto_tsquery('korean', $1)
               OR to_tsvector('korean', content) @@ plainto_tsquery('korean', $1))
          ${candidate_id ? 'AND candidate_id = $2' : ''}
        ORDER BY CASE
                 WHEN title ILIKE '%' || $1 || '%' THEN 1
                 ELSE 2
               END, published_at DESC NULLS LAST
        LIMIT $${candidate_id ? '3' : '2'}
      `;

      const newsParams = candidate_id ? [searchQuery, candidate_id, limit] : [searchQuery, limit];
      const newsResult = await req.db.query(newsQuery, newsParams);
      results.results.news = newsResult.rows;
      results.total += newsResult.rows.length;
    }

    // 3. 위치 검색
    if (!type || type === 'locations') {
      const locationsQuery = `
        SELECT
          'location' AS type,
          id, candidate_id, name, type AS location_type,
          address, latitude, longitude,
          NULL AS category, NULL AS excerpt
        FROM locations
        WHERE (to_tsvector('korean', name) @@ plainto_tsquery('korean', $1)
               OR to_tsvector('korean', address) @@ plainto_tsquery('korean', $1))
          ${candidate_id ? 'AND candidate_id = $2' : ''}
        ORDER BY CASE
                 WHEN name ILIKE '%' || $1 || '%' THEN 1
                 ELSE 2
               END
        LIMIT $${candidate_id ? '3' : '2'}
      `;

      const locationsParams = candidate_id ? [searchQuery, candidate_id, limit] : [searchQuery, limit];
      const locationsResult = await req.db.query(locationsQuery, locationsParams);
      results.results.locations = locationsResult.rows;
      results.total += locationsResult.rows.length;
    }

    // 검색 로그 저장 (비동기)
    if (req.user) {
      setImmediate(() => {
        req.db.query(
          `INSERT INTO search_logs (user_id, query, results_count, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [req.user.id, searchQuery, results.total]
        ).catch(err => {
          console.error('Failed to log search:', err);
        });
      });
    }

    sendSuccess(res, 200, results, 'Search completed successfully');
  } catch (error) {
    console.error('POST /api/search error:', error);
    sendError(res, 500, 'Search failed');
  }
});

/**
 * GET /api/search/suggestions
 * 검색 자동완성 (공개)
 */
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return sendSuccess(res, 200, [], 'No suggestions');
    }

    const suggestions = [];

    // 정책 제목 자동완성
    const policiesResult = await req.db.query(
      `SELECT DISTINCT title FROM policies
       WHERE status = 'published'
         AND title ILIKE $1 || '%'
       ORDER BY title
       LIMIT $2`,
      [q, limit / 2]
    );

    // 뉴스 제목 자동완성
    const newsResult = await req.db.query(
      `SELECT DISTINCT title FROM news
       WHERE status = 'published'
         AND title ILIKE $1 || '%'
       ORDER BY title
       LIMIT $2`,
      [q, limit / 2]
    );

    policiesResult.rows.forEach(row => {
      suggestions.push({ type: 'policy', text: row.title });
    });

    newsResult.rows.forEach(row => {
      suggestions.push({ type: 'news', text: row.title });
    });

    sendSuccess(res, 200, suggestions, 'Suggestions retrieved successfully');
  } catch (error) {
    console.error('GET /api/search/suggestions error:', error);
    sendError(res, 500, 'Failed to retrieve suggestions');
  }
});

/**
 * GET /api/search/analytics
 * 인기 검색어 및 검색 통계 (관리자만)
 */
router.get('/analytics', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // 인기 검색어 (한달간)
    const popularQueries = await req.db.query(
      `SELECT query, COUNT(*) as count
       FROM search_logs
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY query
       ORDER BY count DESC
       LIMIT 20`,
      [days]
    );

    // 일일 검색 통계
    const dailyStats = await req.db.query(
      `SELECT
         DATE(created_at) as date,
         COUNT(*) as search_count,
         COUNT(DISTINCT user_id) as unique_users
       FROM search_logs
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [days]
    );

    const analytics = {
      period: { days, from: new Date(Date.now() - days * 24 * 60 * 60 * 1000), to: new Date() },
      popularQueries: popularQueries.rows,
      dailyStats: dailyStats.rows,
    };

    sendSuccess(res, 200, analytics, 'Analytics retrieved successfully');
  } catch (error) {
    console.error('GET /api/search/analytics error:', error);
    sendError(res, 500, 'Failed to retrieve analytics');
  }
});

module.exports = router;
