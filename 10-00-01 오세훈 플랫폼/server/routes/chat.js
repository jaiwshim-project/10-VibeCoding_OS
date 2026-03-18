/**
 * ============================================================================
 * 챗봇/채팅 API 라우트 (Task #11)
 * ============================================================================
 * POST /api/chat/send — 메시지 전송 (RAG 기반 응답)
 * GET /api/chat/:sessionId — 대화 히스토리 조회
 * POST /api/chat/start — 새로운 채팅 세션 시작
 * DELETE /api/chat/:sessionId — 채팅 세션 삭제 (사용자 또는 관리자)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {
  verifyToken,
  optionalAuth,
  sendError,
  sendSuccess,
} = require('../middleware/auth');

/**
 * 세션 ID 생성
 */
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * POST /api/chat/start
 * 새로운 채팅 세션 시작
 */
router.post('/start', optionalAuth, async (req, res) => {
  try {
    const { candidate_id = 1 } = req.body;

    // 후보자 존재 확인
    const candidateCheck = await req.db.query(
      'SELECT id FROM candidates WHERE id = $1',
      [candidate_id]
    );
    if (candidateCheck.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    const sessionId = generateSessionId();

    sendSuccess(res, 201, {
      sessionId,
      candidateId: candidate_id,
      createdAt: new Date(),
    }, 'Chat session started');
  } catch (error) {
    console.error('POST /api/chat/start error:', error);
    sendError(res, 500, 'Failed to start chat session');
  }
});

/**
 * POST /api/chat/send
 * 메시지 전송 및 AI 응답 생성
 *
 * 요청:
 * {
 *   "sessionId": "abc123...",
 *   "candidateId": 1,
 *   "message": "정책에 대해 말씀해주세요",
 *   "context": { optional context }
 * }
 *
 * 응답:
 * {
 *   "success": true,
 *   "data": {
 *     "userMessage": { id, role, content, timestamp },
 *     "assistantMessage": { id, role, content, sources, timestamp }
 *   }
 * }
 */
router.post('/send', optionalAuth, async (req, res) => {
  try {
    const {
      sessionId,
      candidateId = 1,
      message,
    } = req.body;

    if (!sessionId || !message) {
      return sendError(res, 400, 'sessionId and message are required');
    }

    // 1. 사용자 메시지 저장
    const userMessageQuery = `
      INSERT INTO chat_messages
      (user_id, candidate_id, session_id, role, content, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, role, content, created_at
    `;

    const userResult = await req.db.query(userMessageQuery, [
      req.user?.id || null,
      candidateId,
      sessionId,
      'user',
      message,
    ]);

    // 2. RAG 기반 응답 생성을 위해 관련 정책/뉴스 검색
    const ragContext = await performRAGSearch(req.db, candidateId, message);

    // 3. AI 응답 생성 (Gemini API 호출)
    // 실제 구현에서는 Gemini API를 호출하고 응답을 받음
    const aiResponse = await generateAIResponse(message, ragContext);

    // 4. AI 응답 저장
    const assistantMessageQuery = `
      INSERT INTO chat_messages
      (user_id, candidate_id, session_id, role, content, context, tokens_used, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, role, content, context, created_at
    `;

    const assistantResult = await req.db.query(assistantMessageQuery, [
      req.user?.id || null,
      candidateId,
      sessionId,
      'assistant',
      aiResponse.message,
      JSON.stringify({
        sources: ragContext.sources,
        model: aiResponse.model,
        temperature: 0.7,
      }),
      aiResponse.tokens || 0,
    ]);

    sendSuccess(res, 200, {
      userMessage: userResult.rows[0],
      assistantMessage: {
        ...assistantResult.rows[0],
        context: JSON.parse(assistantResult.rows[0].context),
      },
    }, 'Message sent successfully');
  } catch (error) {
    console.error('POST /api/chat/send error:', error);
    sendError(res, 500, 'Failed to send message');
  }
});

/**
 * RAG (Retrieval-Augmented Generation) 검색
 * 사용자 질문과 관련된 정책/뉴스를 검색
 */
async function performRAGSearch(db, candidateId, query) {
  try {
    const searchQuery = `
      SELECT
        'policy' AS source_type,
        id, title,
        solution_description AS content
      FROM policies
      WHERE candidate_id = $1
        AND status = 'published'
        AND (to_tsvector('korean', title) @@ plainto_tsquery('korean', $2)
             OR to_tsvector('korean', solution_description) @@ plainto_tsquery('korean', $2))
      ORDER BY created_at DESC
      LIMIT 3

      UNION ALL

      SELECT
        'news' AS source_type,
        id, title, content
      FROM news
      WHERE candidate_id = $1
        AND status = 'published'
        AND (to_tsvector('korean', title) @@ plainto_tsquery('korean', $2)
             OR to_tsvector('korean', content) @@ plainto_tsquery('korean', $2))
      ORDER BY published_at DESC NULLS LAST
      LIMIT 2
    `;

    const results = await db.query(searchQuery, [candidateId, query]);

    return {
      query,
      sources: results.rows,
      relevance: results.rows.length > 0 ? 'high' : 'low',
    };
  } catch (error) {
    console.error('RAG search error:', error);
    return {
      query,
      sources: [],
      relevance: 'error',
      error: error.message,
    };
  }
}

/**
 * AI 응답 생성 (Gemini API 호출)
 * 실제 구현에서는 Gemini API를 호출
 */
async function generateAIResponse(userMessage, ragContext) {
  try {
    // 실제 구현: Gemini API 호출
    // const response = await callGeminiAPI({
    //   model: 'gemini-1.5-pro',
    //   prompt: userMessage,
    //   context: ragContext.sources,
    // });

    // 현재는 더미 응답 반환
    const sources = ragContext.sources.map(s => `${s.source_type}: ${s.title}`);
    const message = `감사합니다. 질문하신 "${userMessage}"에 대해 설명드리겠습니다.\n\n` +
                   `다음 자료를 참고한 답변입니다:\n${sources.join('\n')}\n\n` +
                   `더 자세한 정보가 필요하신 경우 저희 웹사이트의 정책 섹션을 확인해주세요.`;

    return {
      message,
      model: 'gemini-1.5-pro',
      tokens: 150,
    };
  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      message: '죄송합니다. 응답 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
      model: 'error',
      tokens: 0,
    };
  }
}

/**
 * GET /api/chat/:sessionId
 * 채팅 히스토리 조회
 */
router.get('/:sessionId', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        id, user_id, role, content, context,
        tokens_used, created_at
      FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `;

    const messages = await req.db.query(query, [sessionId, limit, offset]);

    sendSuccess(res, 200, {
      sessionId,
      messageCount: messages.rows.length,
      messages: messages.rows.map(msg => ({
        ...msg,
        context: msg.context ? JSON.parse(msg.context) : null,
      })),
    }, 'Chat history retrieved successfully');
  } catch (error) {
    console.error('GET /api/chat/:sessionId error:', error);
    sendError(res, 500, 'Failed to retrieve chat history');
  }
});

/**
 * DELETE /api/chat/:sessionId
 * 채팅 세션 삭제 (사용자 또는 관리자)
 */
router.delete('/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 세션의 첫 번째 메시지에서 user_id 확인
    const sessionCheck = await req.db.query(
      `SELECT DISTINCT user_id FROM chat_messages
       WHERE session_id = $1
       LIMIT 1`,
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return sendError(res, 404, 'Session not found');
    }

    // 권한 확인: 자신의 세션만 삭제 가능 (관리자는 모든 세션 삭제 가능)
    const sessionUserId = sessionCheck.rows[0].user_id;
    if (req.user.role !== 'admin' && req.user.id !== sessionUserId) {
      return sendError(res, 403, 'You can only delete your own sessions');
    }

    // 세션 삭제
    await req.db.query(
      'DELETE FROM chat_messages WHERE session_id = $1',
      [sessionId]
    );

    sendSuccess(res, 200, { sessionId }, 'Session deleted successfully');
  } catch (error) {
    console.error('DELETE /api/chat/:sessionId error:', error);
    sendError(res, 500, 'Failed to delete session');
  }
});

/**
 * GET /api/chat/stats/:candidateId
 * 채팅 통계 (관리자만)
 */
router.get('/stats/:candidateId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can view chat statistics');
    }

    const { candidateId } = req.params;
    const { days = 30 } = req.query;

    // 총 메시지 수
    const totalMessagesResult = await req.db.query(
      `SELECT COUNT(*) as total
       FROM chat_messages
       WHERE candidate_id = $1
         AND created_at >= NOW() - INTERVAL '1 day' * $2`,
      [candidateId, days]
    );

    // 일일 메시지 통계
    const dailyStatsResult = await req.db.query(
      `SELECT
         DATE(created_at) as date,
         COUNT(*) as message_count,
         COUNT(DISTINCT session_id) as session_count
       FROM chat_messages
       WHERE candidate_id = $1
         AND created_at >= NOW() - INTERVAL '1 day' * $2
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [candidateId, days]
    );

    // 인기 질문
    const popularQuestionsResult = await req.db.query(
      `SELECT
         SUBSTRING(content, 1, 100) as question,
         COUNT(*) as count
       FROM chat_messages
       WHERE candidate_id = $1
         AND role = 'user'
         AND created_at >= NOW() - INTERVAL '1 day' * $2
       GROUP BY content
       ORDER BY count DESC
       LIMIT 10`,
      [candidateId, days]
    );

    sendSuccess(res, 200, {
      period: { days, from: new Date(Date.now() - days * 24 * 60 * 60 * 1000), to: new Date() },
      totalMessages: parseInt(totalMessagesResult.rows[0].total),
      dailyStats: dailyStatsResult.rows,
      popularQuestions: popularQuestionsResult.rows,
    }, 'Chat statistics retrieved successfully');
  } catch (error) {
    console.error('GET /api/chat/stats/:candidateId error:', error);
    sendError(res, 500, 'Failed to retrieve chat statistics');
  }
});

module.exports = router;
