/**
 * ============================================================================
 * 인증 미들웨어 (Task #13)
 * ============================================================================
 * JWT 토큰 검증 + RBAC (Role-Based Access Control) 권한 체계
 * 작성: Charlie 분대
 * 날짜: 2026-03-19
 * ============================================================================
 */

const jwt = require('jsonwebtoken');

// 환경 변수에서 JWT 시크릿 가져오기
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * ============================================================================
 * 1. JWT 토큰 생성
 * ============================================================================
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'osewhoon-platform',
  });
}

/**
 * ============================================================================
 * 2. JWT 토큰 검증 미들웨어
 * ============================================================================
 */
function verifyToken(req, res, next) {
  // 1. Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Missing authorization header',
    });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token format (expected: Bearer <token>)',
    });
  }

  // 2. 토큰 검증
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // 요청 객체에 사용자 정보 저장
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        expiredAt: error.expiredAt,
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
    res.status(401).json({
      success: false,
      error: 'Token verification failed',
    });
  }
}

/**
 * ============================================================================
 * 3. RBAC 권한 검증 미들웨어
 * ============================================================================
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // verifyToken이 먼저 실행되어야 함
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // 사용자의 역할이 허용된 목록에 포함되는지 확인
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * ============================================================================
 * 4. 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 계속)
 * ============================================================================
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // 토큰이 없으면 req.user = null로 설정하고 계속
    req.user = null;
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    req.user = null;  // 토큰이 유효하지 않아도 계속
  }
  next();
}

/**
 * ============================================================================
 * 5. 감사 로그 미들웨어
 * ============================================================================
 */
function auditLog(db) {
  return async (req, res, next) => {
    // 원본 res.json() 함수를 래핑
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // 쓰기 작업(POST, PUT, DELETE)만 로깅
      if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
        // 요청 처리 후 비동기로 로그 저장 (응답 지연 방지)
        setImmediate(async () => {
          try {
            await db.query(
              `INSERT INTO audit_logs
               (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                req.user.id,
                req.method.toLowerCase(),
                req.baseUrl.split('/')[2],  // 엔티티 타입 추출 (예: 'policies')
                data.id || null,
                JSON.stringify(req.body),
                req.ip,
                req.get('user-agent'),
              ]
            );
          } catch (err) {
            console.error('Audit log error:', err);
            // 로그 저장 실패는 응답에 영향을 주지 않음
          }
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * ============================================================================
 * 6. 역할별 접근 제어 정책
 * ============================================================================
 */
const RBAC_POLICIES = {
  // 뷰어 (일반 사용자)
  viewer: {
    canRead: ['candidates', 'policies', 'news', 'locations', 'search'],
    canWrite: [],
    canDelete: [],
  },

  // 에디터 (콘텐츠 작성자)
  editor: {
    canRead: ['candidates', 'policies', 'news', 'locations', 'search', 'users'],
    canWrite: ['policies', 'news'],
    canDelete: [],
  },

  // 관리자
  admin: {
    canRead: ['candidates', 'policies', 'news', 'locations', 'search', 'users', 'audit_logs'],
    canWrite: ['candidates', 'policies', 'news', 'locations', 'users'],
    canDelete: ['policies', 'news'],
  },
};

/**
 * ============================================================================
 * 7. 리소스 기반 접근 제어 미들웨어
 * ============================================================================
 */
function checkResourcePermission(action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userRole = req.user.role;
    const policy = RBAC_POLICIES[userRole];

    if (!policy) {
      return res.status(403).json({
        success: false,
        error: 'Unknown user role',
      });
    }

    // 리소스 타입 추출 (URL 기반)
    const resourceType = req.baseUrl.split('/').pop();  // '/api/policies' -> 'policies'

    // 권한 확인
    let hasPermission = false;
    if (action === 'read') {
      hasPermission = policy.canRead.includes(resourceType);
    } else if (action === 'write') {
      hasPermission = policy.canWrite.includes(resourceType);
    } else if (action === 'delete') {
      hasPermission = policy.canDelete.includes(resourceType);
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `${userRole} role cannot ${action} ${resourceType}`,
      });
    }

    next();
  };
}

/**
 * ============================================================================
 * 8. 토큰 새로고침 (리프레시)
 * ============================================================================
 */
function refreshToken(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const newToken = generateToken(req.user);
  res.json({
    success: true,
    token: newToken,
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * ============================================================================
 * 9. 비밀번호 해싱 (bcrypt 사용)
 * ============================================================================
 */
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Password hashing failed: ' + error.message);
  }
}

async function comparePasswords(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed: ' + error.message);
  }
}

/**
 * ============================================================================
 * 10. CORS 헤더 미들웨어
 * ============================================================================
 */
function corsHeaders(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

/**
 * ============================================================================
 * 11. 에러 응답 포매터
 * ============================================================================
 */
function sendError(res, statusCode, message, details = null) {
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
}

/**
 * ============================================================================
 * 12. 성공 응답 포매터
 * ============================================================================
 */
function sendSuccess(res, statusCode, data, message = 'Success') {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * ============================================================================
 * 내보내기
 * ============================================================================
 */
module.exports = {
  // 토큰 관련
  generateToken,
  refreshToken,
  verifyToken,
  optionalAuth,

  // RBAC 관련
  requireRole,
  checkResourcePermission,

  // 유틸리티
  hashPassword,
  comparePasswords,
  corsHeaders,
  auditLog,
  sendError,
  sendSuccess,

  // 상수
  RBAC_POLICIES,
  JWT_SECRET,
  JWT_EXPIRY,
};
