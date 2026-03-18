/**
 * ============================================================================
 * 인증 API 라우트 (Task #11)
 * ============================================================================
 * POST /api/auth/signup — 회원가입
 * POST /api/auth/login — 로그인
 * POST /api/auth/logout — 로그아웃
 * POST /api/auth/refresh — 토큰 갱신
 * GET /api/auth/me — 현재 사용자 정보 조회
 * PUT /api/auth/password — 비밀번호 변경
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  generateToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  sendError,
  sendSuccess,
} = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * 회원가입
 *
 * 요청:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "name": "사용자명"
 * }
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // 비밀번호 길이 검증 (최소 8자)
    if (password.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters');
    }

    // 중복 이메일 확인
    const existingUser = await req.db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return sendError(res, 409, 'Email already registered');
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const query = `
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, email, name, role, created_at
    `;

    const result = await req.db.query(query, [
      email,
      passwordHash,
      name || email.split('@')[0],  // 기본값: 이메일 앞부분
      'viewer',  // 기본 역할
    ]);

    const user = result.rows[0];
    const token = generateToken(user);

    sendSuccess(res, 201, {
      user,
      token,
      expiresIn: process.env.JWT_EXPIRY || '7d',
    }, 'User registered successfully');
  } catch (error) {
    console.error('POST /api/auth/signup error:', error);
    sendError(res, 500, 'Registration failed');
  }
});

/**
 * POST /api/auth/login
 * 로그인
 *
 * 요청:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // 사용자 조회
    const result = await req.db.query(
      `SELECT id, email, password_hash, name, role, is_active, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const user = result.rows[0];

    // 활성 사용자 확인
    if (!user.is_active) {
      return sendError(res, 403, 'Account is inactive. Contact administrator.');
    }

    // 비밀번호 검증
    const isPasswordValid = await comparePasswords(password, user.password_hash);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // 마지막 로그인 시간 업데이트
    await req.db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // 토큰 생성
    const token = generateToken(user);

    // 응답에서 password_hash 제거
    delete user.password_hash;

    sendSuccess(res, 200, {
      user,
      token,
      expiresIn: process.env.JWT_EXPIRY || '7d',
    }, 'Login successful');
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    sendError(res, 500, 'Login failed');
  }
});

/**
 * POST /api/auth/logout
 * 로그아웃 (토큰 무효화)
 * 실제로는 클라이언트가 토큰을 삭제하면 되지만,
 * 서버에서 추가 처리가 필요한 경우 토큰 블랙리스트 구현 가능
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // 선택사항: 로그아웃 로그 기록
    setImmediate(() => {
      req.db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [req.user.id, 'logout', req.ip, req.get('user-agent')]
      ).catch(err => {
        console.error('Failed to log logout:', err);
      });
    });

    sendSuccess(res, 200, {}, 'Logged out successfully');
  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    sendError(res, 500, 'Logout failed');
  }
});

/**
 * POST /api/auth/refresh
 * 토큰 갱신 (만료 전 새 토큰 발급)
 */
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const user = req.user;

    // 사용자가 여전히 활성 상태인지 확인
    const result = await req.db.query(
      'SELECT is_active FROM users WHERE id = $1',
      [user.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return sendError(res, 403, 'User is no longer active');
    }

    const token = generateToken(user);

    sendSuccess(res, 200, {
      token,
      expiresIn: process.env.JWT_EXPIRY || '7d',
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('POST /api/auth/refresh error:', error);
    sendError(res, 500, 'Token refresh failed');
  }
});

/**
 * GET /api/auth/me
 * 현재 사용자 정보 조회
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT id, email, name, role, preferences,
              last_login, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, result.rows[0], 'User profile retrieved successfully');
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    sendError(res, 500, 'Failed to retrieve user profile');
  }
});

/**
 * PUT /api/auth/password
 * 비밀번호 변경
 *
 * 요청:
 * {
 *   "currentPassword": "oldpassword",
 *   "newPassword": "newpassword123"
 * }
 */
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current password and new password are required');
    }

    // 새 비밀번호 길이 검증
    if (newPassword.length < 8) {
      return sendError(res, 400, 'New password must be at least 8 characters');
    }

    // 현재 비밀번호와 동일한지 확인
    if (currentPassword === newPassword) {
      return sendError(res, 400, 'New password must be different from current password');
    }

    // 사용자 조회
    const result = await req.db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'User not found');
    }

    // 현재 비밀번호 검증
    const isPasswordValid = await comparePasswords(
      currentPassword,
      result.rows[0].password_hash
    );
    if (!isPasswordValid) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    // 새 비밀번호 해싱 및 저장
    const newPasswordHash = await hashPassword(newPassword);
    await req.db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    // 로그 기록
    setImmediate(() => {
      req.db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [req.user.id, 'password_change', req.ip, req.get('user-agent')]
      ).catch(err => {
        console.error('Failed to log password change:', err);
      });
    });

    sendSuccess(res, 200, {}, 'Password changed successfully');
  } catch (error) {
    console.error('PUT /api/auth/password error:', error);
    sendError(res, 500, 'Password change failed');
  }
});

/**
 * PUT /api/auth/profile
 * 사용자 프로필 수정
 *
 * 요청:
 * {
 *   "name": "새이름",
 *   "preferences": { "language": "en", "theme": "dark" }
 * }
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, preferences } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (preferences !== undefined) {
      updates.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(preferences));
    }

    if (updates.length === 0) {
      return sendError(res, 400, 'No fields to update');
    }

    values.push(req.user.id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, preferences, created_at, updated_at
    `;

    const result = await req.db.query(query, values);

    sendSuccess(res, 200, result.rows[0], 'Profile updated successfully');
  } catch (error) {
    console.error('PUT /api/auth/profile error:', error);
    sendError(res, 500, 'Profile update failed');
  }
});

module.exports = router;
