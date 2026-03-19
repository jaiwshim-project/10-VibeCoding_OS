/**
 * ============================================================================
 * 파일 업로드 API 라우트 (Task #14)
 * ============================================================================
 * POST /api/media/upload — 단일 파일 업로드
 * POST /api/media/bulk-upload — 다중 파일 업로드
 * GET /api/media/candidate/:id/list — 후보자 미디어 목록
 * DELETE /api/media/:id — 파일 삭제 (관리자)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  verifyToken,
  requireRole,
  optionalAuth,
  sendError,
  sendSuccess,
} = require('../middleware/auth');

// ============================================================================
// Multer 설정
// ============================================================================

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// 업로드 디렉토리 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'video/mp4', 'video/webm', 'video/ogg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // MIME 타입 별 서브디렉토리
    let subdir = 'misc';
    if (file.mimetype.startsWith('image/')) subdir = 'images';
    else if (file.mimetype.startsWith('video/')) subdir = 'videos';
    else if (file.mimetype === 'application/pdf') subdir = 'documents';

    const fullPath = path.join(UPLOAD_DIR, subdir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // 고유 파일명 생성: timestamp-randomhex.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

// 파일 필터
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
});

// ============================================================================
// 유틸리티
// ============================================================================

function buildFileUrl(req, filePath) {
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${relativePath}`;
}

// ============================================================================
// 라우트
// ============================================================================

/**
 * POST /api/media/upload
 * 단일 파일 업로드
 */
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file provided');
    }

    const { candidate_id, description, is_public = true } = req.body;

    if (!candidate_id) {
      // 업로드된 파일 정리
      fs.unlinkSync(req.file.path);
      return sendError(res, 400, 'candidate_id is required');
    }

    // 후보자 존재 확인
    const candidateCheck = await req.db.query(
      'SELECT id FROM candidates WHERE id = $1',
      [candidate_id]
    );
    if (candidateCheck.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return sendError(res, 404, 'Candidate not found');
    }

    const fileUrl = buildFileUrl(req, req.file.path);

    // DB에 파일 정보 저장
    const result = await req.db.query(
      `INSERT INTO media
       (candidate_id, filename, mime_type, file_size, file_path, s3_url, uploaded_by, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        candidate_id,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.path,
        fileUrl,
        req.user.id,
        is_public === 'true' || is_public === true,
      ]
    );

    sendSuccess(res, 201, {
      ...result.rows[0],
      url: fileUrl,
    }, 'File uploaded successfully');
  } catch (error) {
    // 업로드된 파일 정리 (실패 시)
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('POST /api/media/upload error:', error);
    sendError(res, 500, 'File upload failed');
  }
});

/**
 * POST /api/media/bulk-upload
 * 다중 파일 업로드 (최대 10개)
 */
router.post('/bulk-upload', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No files provided');
    }

    const { candidate_id, is_public = true } = req.body;

    if (!candidate_id) {
      req.files.forEach(f => fs.unlinkSync(f.path));
      return sendError(res, 400, 'candidate_id is required');
    }

    const candidateCheck = await req.db.query(
      'SELECT id FROM candidates WHERE id = $1',
      [candidate_id]
    );
    if (candidateCheck.rows.length === 0) {
      req.files.forEach(f => fs.unlinkSync(f.path));
      return sendError(res, 404, 'Candidate not found');
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const fileUrl = buildFileUrl(req, file.path);
        const result = await req.db.query(
          `INSERT INTO media
           (candidate_id, filename, mime_type, file_size, file_path, s3_url, uploaded_by, is_public)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            candidate_id,
            file.originalname,
            file.mimetype,
            file.size,
            file.path,
            fileUrl,
            req.user.id,
            is_public === 'true' || is_public === true,
          ]
        );
        uploadedFiles.push({ ...result.rows[0], url: fileUrl });
      } catch (err) {
        errors.push({ filename: file.originalname, error: err.message });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    sendSuccess(res, 201, {
      uploaded: uploadedFiles.length,
      errors: errors.length,
      files: uploadedFiles,
      failedFiles: errors,
    }, `${uploadedFiles.length} files uploaded successfully`);
  } catch (error) {
    if (req.files) req.files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
    console.error('POST /api/media/bulk-upload error:', error);
    sendError(res, 500, 'Bulk upload failed');
  }
});

/**
 * GET /api/media/candidate/:id/list
 * 후보자 미디어 목록
 */
router.get('/candidate/:id/list', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0, mime_type } = req.query;

    let query = `
      SELECT id, candidate_id, filename, mime_type, file_size,
             s3_url AS url, is_public, uploaded_by, created_at
      FROM media
      WHERE candidate_id = $1 AND is_public = true
    `;
    const params = [id];
    let paramCount = 2;

    if (mime_type) {
      query += ` AND mime_type LIKE $${paramCount}`;
      params.push(`${mime_type}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await req.db.query(query, params);

    sendSuccess(res, 200, {
      candidate_id: parseInt(id),
      total: result.rows.length,
      media: result.rows,
    }, 'Media list retrieved successfully');
  } catch (error) {
    console.error('GET /api/media/candidate/:id/list error:', error);
    sendError(res, 500, 'Failed to retrieve media list');
  }
});

/**
 * DELETE /api/media/:id
 * 파일 삭제 (관리자 또는 업로드한 본인)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 파일 정보 조회
    const mediaResult = await req.db.query(
      'SELECT * FROM media WHERE id = $1',
      [id]
    );

    if (mediaResult.rows.length === 0) {
      return sendError(res, 404, 'File not found');
    }

    const media = mediaResult.rows[0];

    // 권한 확인: 관리자 또는 업로드한 본인만 삭제 가능
    if (req.user.role !== 'admin' && req.user.id !== media.uploaded_by) {
      return sendError(res, 403, 'You can only delete your own files');
    }

    // DB에서 삭제
    await req.db.query('DELETE FROM media WHERE id = $1', [id]);

    // 파일 시스템에서도 삭제
    if (media.file_path && fs.existsSync(media.file_path)) {
      fs.unlinkSync(media.file_path);
    }

    sendSuccess(res, 200, { id }, 'File deleted successfully');
  } catch (error) {
    console.error('DELETE /api/media/:id error:', error);
    sendError(res, 500, 'Failed to delete file');
  }
});

module.exports = router;
