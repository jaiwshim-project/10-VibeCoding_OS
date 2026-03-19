/**
 * ============================================================================
 * 분석/통계 API 라우트 (Task #11)
 * ============================================================================
 * POST /api/analytics/track — 이벤트 추적
 * GET /api/analytics/overview — 전체 대시보드 통계 (관리자)
 * GET /api/analytics/content — 콘텐츠 성과 통계 (관리자)
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
 * POST /api/analytics/track
 * 사용자 이벤트 추적 (공개 — 익명 포함)
 */
router.post('/track', optionalAuth, async (req, res) => {
  try {
    const { event_type, entity_type, entity_id, metadata = {} } = req.body;

    if (!event_type) {
      return sendError(res, 400, 'event_type is required');
    }

    // 이벤트 저장 (비동기)
    setImmediate(async () => {
      try {
        await req.db.query(
          `INSERT INTO analytics_events
           (session_id, user_id, event_type, entity_type, entity_id, metadata, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.headers['x-session-id'] || null,
            req.user?.id || null,
            event_type,
            entity_type || null,
            entity_id || null,
            JSON.stringify(metadata),
            req.ip,
            req.get('user-agent'),
          ]
        );

        // 뉴스 조회수 증가
        if (event_type === 'page_view' && entity_type === 'news' && entity_id) {
          await req.db.query(
            'UPDATE news SET view_count = view_count + 1 WHERE id = $1',
            [entity_id]
          );
        }
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
    });

    sendSuccess(res, 200, { tracked: true }, 'Event tracked');
  } catch (error) {
    console.error('POST /api/analytics/track error:', error);
    sendError(res, 500, 'Failed to track event');
  }
});

/**
 * GET /api/analytics/overview
 * 전체 대시보드 통계 (관리자)
 */
router.get('/overview', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const [
      contentStats,
      pageViewStats,
      chatStats,
      topContent,
    ] = await Promise.all([
      // 콘텐츠 현황
      req.db.query(`
        SELECT
          (SELECT COUNT(*) FROM policies WHERE status = 'published') AS policies_count,
          (SELECT COUNT(*) FROM news WHERE status = 'published') AS news_count,
          (SELECT COUNT(*) FROM locations) AS locations_count,
          (SELECT COUNT(*) FROM users WHERE is_active = true) AS users_count
      `),
      // 페이지 뷰 통계
      req.db.query(`
        SELECT
          COUNT(*) AS total_views,
          COUNT(DISTINCT COALESCE(user_id::text, session_id)) AS unique_visitors,
          DATE_TRUNC('day', created_at) AS date
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
        LIMIT 30
      `, [days]),
      // 챗봇 사용 통계
      req.db.query(`
        SELECT
          COUNT(*) AS total_messages,
          COUNT(DISTINCT session_id) AS total_sessions
        FROM chat_messages
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      `, [days]),
      // 인기 콘텐츠 (뉴스 기준)
      req.db.query(`
        SELECT id, title, view_count, published_at
        FROM news
        WHERE status = 'published'
        ORDER BY view_count DESC
        LIMIT 5
      `),
    ]);

    sendSuccess(res, 200, {
      period: { days: parseInt(days) },
      content: contentStats.rows[0],
      page_views: {
        daily: pageViewStats.rows,
        total: pageViewStats.rows.reduce((sum, r) => sum + parseInt(r.total_views), 0),
        unique_visitors: pageViewStats.rows.reduce((sum, r) => sum + parseInt(r.unique_visitors), 0),
      },
      chatbot: chatStats.rows[0],
      top_content: topContent.rows,
      updated_at: new Date(),
    }, 'Overview statistics retrieved successfully');
  } catch (error) {
    console.error('GET /api/analytics/overview error:', error);
    sendError(res, 500, 'Failed to retrieve analytics overview');
  }
});

/**
 * GET /api/analytics/content
 * 콘텐츠 성과 분석 (관리자)
 */
router.get('/content', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const { days = 30, type = 'news' } = req.query;

    let contentQuery;
    if (type === 'news') {
      contentQuery = `
        SELECT
          n.id, n.title, n.category, n.view_count,
          n.published_at,
          COUNT(ae.id) AS event_count
        FROM news n
        LEFT JOIN analytics_events ae ON ae.entity_type = 'news' AND ae.entity_id = n.id
          AND ae.created_at >= NOW() - INTERVAL '1 day' * $1
        WHERE n.status = 'published'
        GROUP BY n.id
        ORDER BY n.view_count DESC
        LIMIT 20
      `;
    } else {
      contentQuery = `
        SELECT
          p.id, p.title, p.category,
          COUNT(ae.id) AS event_count
        FROM policies p
        LEFT JOIN analytics_events ae ON ae.entity_type = 'policy' AND ae.entity_id = p.id
          AND ae.created_at >= NOW() - INTERVAL '1 day' * $1
        WHERE p.status = 'published'
        GROUP BY p.id
        ORDER BY event_count DESC
        LIMIT 20
      `;
    }

    const result = await req.db.query(contentQuery, [days]);

    sendSuccess(res, 200, {
      type,
      period: { days: parseInt(days) },
      content: result.rows,
    }, 'Content analytics retrieved successfully');
  } catch (error) {
    console.error('GET /api/analytics/content error:', error);
    sendError(res, 500, 'Failed to retrieve content analytics');
  }
});

module.exports = router;
