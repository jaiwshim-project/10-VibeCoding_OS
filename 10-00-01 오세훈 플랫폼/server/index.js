/**
 * ============================================================================
 * 오세훈 플랫폼 — Express.js 백엔드 서버 (Task #11)
 * ============================================================================
 * 30+ REST API 엔드포인트 통합
 * JWT 인증 + RBAC 권한 체계
 * 작성: Charlie 분대 (분대장)
 * 날짜: 2026-03-19
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// 환경 변수 로드
dotenv.config();

// 미들웨어 임포트
const {
  corsHeaders,
  auditLog,
  sendError,
  sendSuccess,
} = require('./middleware/auth');

// 라우트 임포트
const candidatesRouter = require('./routes/candidates');
const policiesRouter = require('./routes/policies');
const newsRouter = require('./routes/news');
const searchRouter = require('./routes/search');
const locationsRouter = require('./routes/locations');
const chatRouter = require('./routes/chat');
const authRouter = require('./routes/auth');
const mediaRouter = require('./routes/media');

// ============================================================================
// Express 앱 초기화
// ============================================================================

const app = express();

// ============================================================================
// 보안 미들웨어
// ============================================================================

app.use(helmet());  // HTTP 헤더 보안
app.use(cors(corsHeaders));  // CORS 설정
app.use(morgan('combined'));  // 로깅

// ============================================================================
// 바디 파서 미들웨어
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================================================
// 데이터베이스 연결 풀 설정
// ============================================================================

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'osewhoon_platform',
});

// 데이터베이스 연결 풀에 대한 에러 핸들링
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// ============================================================================
// 요청 미들웨어 (DB 연결 주입)
// ============================================================================

app.use((req, res, next) => {
  req.db = pool;
  next();
});

// ============================================================================
// 헬스체크 엔드포인트
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================================
// 데이터베이스 연결 테스트 엔드포인트
// ============================================================================

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

// ============================================================================
// API 라우트 마운트
// ============================================================================

// 후보자
app.use('/api/candidates', candidatesRouter);

// 정책
app.use('/api/policies', policiesRouter);

// 뉴스
app.use('/api/news', newsRouter);

// 검색
app.use('/api/search', searchRouter);

// 위치/지도
app.use('/api/locations', locationsRouter);

// 챗봇
app.use('/api/chat', chatRouter);

// 인증
app.use('/api/auth', authRouter);

// 파일/미디어
app.use('/api/media', mediaRouter);

// ============================================================================
// 404 에러 핸들러
// ============================================================================

app.use('*', (req, res) => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
});

// ============================================================================
// 글로벌 에러 핸들러
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // 멀터 에러
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 413, 'File size exceeds limit (50MB)');
    }
    return sendError(res, 400, `Upload error: ${err.message}`);
  }

  // 기타 에러
  sendError(res, 500, 'Internal server error', {
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================================================
// 서버 시작
// ============================================================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║        오세훈 플랫폼 - Express.js 백엔드 서버 시작             ║
╠════════════════════════════════════════════════════════════════╣
║ 포트:          ${PORT}                                       ║
║ 환경:          ${NODE_ENV}                                      ║
║ 타임스탬프:    ${new Date().toISOString()}          ║
╠════════════════════════════════════════════════════════════════╣
║ API 엔드포인트:                                                ║
║   POST   /api/auth/signup      — 회원가입                     ║
║   POST   /api/auth/login       — 로그인                       ║
║   GET    /api/candidates       — 후보자 목록                  ║
║   GET    /api/policies         — 정책 목록                    ║
║   GET    /api/news             — 뉴스 목록                    ║
║   POST   /api/search           — 통합 검색                    ║
║   GET    /api/locations        — 위치 목록                    ║
║   POST   /api/chat/send        — 챗봇 메시지 전송             ║
║   POST   /api/media/upload     — 파일 업로드                  ║
║   GET    /health               — 헬스 체크                    ║
║   GET    /api/health/db        — DB 연결 테스트               ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// ============================================================================
// 우아한 종료 (Graceful Shutdown)
// ============================================================================

process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호 수신, 서버 종료 중...');
  server.close(() => {
    console.log('HTTP 서버 종료');
    pool.end(() => {
      console.log('데이터베이스 연결 종료');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT 신호 수신, 서버 종료 중...');
  server.close(() => {
    console.log('HTTP 서버 종료');
    pool.end(() => {
      console.log('데이터베이스 연결 종료');
      process.exit(0);
    });
  });
});

// ============================================================================
// 핸들되지 않은 예외
// ============================================================================

process.on('uncaughtException', (err) => {
  console.error('핸들되지 않은 예외:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('핸들되지 않은 Promise 거부:', reason);
  process.exit(1);
});

module.exports = app;
