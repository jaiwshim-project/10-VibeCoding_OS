/**
 * ============================================================================
 * 파일/미디어 API 라우트 (Task #11)
 * ============================================================================
 * POST /api/media/upload — 파일 업로드 (관리자/에디터)
 * GET /api/media/:id — 파일 다운로드
 * GET /api/media/:candidateId/list — 후보자의 미디어 목록
 * DELETE /api/media/:id — 파일 삭제 (관리자만)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const {
  verifyToken,
  requireRole,
  sendError,
  sendSuccess,
} = require('../middleware/auth');

/**
 * 파일 업로드 설정 (multer)
 */
const uploadDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,  // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 허용된 MIME 타입
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

/**
 * POST /api/media/upload
 * 파일 업로드 (관리자/에디터)
 *
 * 멀티파트 요청:
 * - files: 업로드할 파일들
 * - candidate_id: 후보자 ID
 * - description: 파일 설명 (선택사항)
 * - is_public: 공개 여부 (기본값: true)
 */
router.post(
  '/upload',
  verifyToken,
  requireRole('editor', 'admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      const { candidate_id, description, is_public = true } = req.body;

      if (!candidate_id) {
        return sendError(res, 400, 'candidate_id is required');
      }

      if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
      }

      // 후보자 존재 확인
      const candidateCheck = await req.db.query(
        'SELECT id FROM candidates WHERE id = $1',
        [candidate_id]
      );
      if (candidateCheck.rows.length === 0) {
        return sendError(res, 404, 'Candidate not found');
      }

      // 파일 정보 저장
      const query = `
        INSERT INTO media
        (candidate_id, filename, mime_type, file_size, file_path,
         uploaded_by, is_public, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, candidate_id, filename, mime_type, file_size,
                  file_path, uploaded_by, is_public, created_at
      `;

      const result = await req.db.query(query, [
        candidate_id,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.filename,  // 저장된 파일명
        req.user.id,
        is_public === 'true' || is_public === true,
      ]);

      const media = result.rows[0];

      sendSuccess(res, 201, {
        ...media,
        url: `/api/media/${media.id}`,
      }, 'File uploaded successfully');
    } catch (error) {
      console.error('POST /api/media/upload error:', error);

      // 업로드한 파일 삭제
      if (req.file) {
        setImmediate(() => {
          fs.unlink(path.join(uploadDir, req.file.filename)).catch(err => {
            console.error('Failed to delete uploaded file:', err);
          });
        });
      }

      sendError(res, 500, 'File upload failed');
    }
  }
);

/**
 * GET /api/media/:id
 * 파일 다운로드/조회
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 파일 정보 조회
    const result = await req.db.query(
      `SELECT id, filename, mime_type, file_size, file_path,
              is_public, candidate_id
       FROM media
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'File not found');
    }

    const media = result.rows[0];

    // 공개 여부 확인
    if (!media.is_public && (!req.user || (req.user.role !== 'admin' && req.user.id !== media.uploaded_by))) {
      return sendError(res, 403, 'Access denied');
    }

    // 파일 경로
    const filePath = path.join(uploadDir, media.file_path);

    // 파일 존재 확인
    try {
      await fs.access(filePath);
    } catch (error) {
      return sendError(res, 404, 'File not found on disk');
    }

    // 다운로드 또는 인라인 표시
    res.setHeader('Content-Type', media.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${media.filename}"`);
    res.setHeader('Content-Length', media.file_size);

    // 파일 전송
    res.download(filePath, media.filename);
  } catch (error) {
    console.error('GET /api/media/:id error:', error);
    sendError(res, 500, 'Failed to retrieve file');
  }
});

/**
 * GET /api/media/candidate/:candidateId/list
 * 후보자의 미디어 목록
 */
router.get('/candidate/:candidateId/list', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { limit = 50, offset = 0, mime_type } = req.query;

    let query = `
      SELECT
        id, candidate_id, filename, mime_type, file_size,
        uploaded_by, is_public, created_at
      FROM media
      WHERE candidate_id = $1
    `;
    const params = [candidateId];
    let paramCount = 2;

    // 필터: MIME 타입
    if (mime_type) {
      query += ` AND mime_type LIKE $${paramCount}`;
      params.push(`${mime_type}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const mediaList = await req.db.query(query, params);

    sendSuccess(res, 200, {
      candidateId,
      count: mediaList.rows.length,
      media: mediaList.rows.map(m => ({
        ...m,
        url: `/api/media/${m.id}`,
      })),
    }, 'Media list retrieved successfully');
  } catch (error) {
    console.error('GET /api/media/candidate/:candidateId/list error:', error);
    sendError(res, 500, 'Failed to retrieve media list');
  }
});

/**
 * DELETE /api/media/:id
 * 파일 삭제 (관리자만)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 파일 정보 조회
    const result = await req.db.query(
      'SELECT id, file_path FROM media WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'File not found');
    }

    const media = result.rows[0];

    // 데이터베이스에서 삭제
    await req.db.query('DELETE FROM media WHERE id = $1', [id]);

    // 디스크에서 파일 삭제 (비동기)
    setImmediate(() => {
      fs.unlink(path.join(uploadDir, media.file_path)).catch(err => {
        console.error('Failed to delete file from disk:', err);
      });
    });

    sendSuccess(res, 200, { id }, 'File deleted successfully');
  } catch (error) {
    console.error('DELETE /api/media/:id error:', error);
    sendError(res, 500, 'Failed to delete file');
  }
});

/**
 * POST /api/media/bulk-upload
 * 여러 파일 일괄 업로드
 */
router.post(
  '/bulk-upload',
  verifyToken,
  requireRole('editor', 'admin'),
  upload.array('files', 10),  // 최대 10개 파일
  async (req, res) => {
    try {
      const { candidate_id, is_public = true } = req.body;

      if (!candidate_id) {
        return sendError(res, 400, 'candidate_id is required');
      }

      if (!req.files || req.files.length === 0) {
        return sendError(res, 400, 'No files uploaded');
      }

      // 후보자 존재 확인
      const candidateCheck = await req.db.query(
        'SELECT id FROM candidates WHERE id = $1',
        [candidate_id]
      );
      if (candidateCheck.rows.length === 0) {
        return sendError(res, 404, 'Candidate not found');
      }

      // 모든 파일 저장
      const uploadedFiles = [];
      for (const file of req.files) {
        const result = await req.db.query(
          `INSERT INTO media
           (candidate_id, filename, mime_type, file_size, file_path,
            uploaded_by, is_public, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           RETURNING id, filename, mime_type, file_size, created_at`,
          [
            candidate_id,
            file.originalname,
            file.mimetype,
            file.size,
            file.filename,
            req.user.id,
            is_public === 'true' || is_public === true,
          ]
        );
        uploadedFiles.push({
          ...result.rows[0],
          url: `/api/media/${result.rows[0].id}`,
        });
      }

      sendSuccess(res, 201, {
        count: uploadedFiles.length,
        files: uploadedFiles,
      }, 'Files uploaded successfully');
    } catch (error) {
      console.error('POST /api/media/bulk-upload error:', error);

      // 업로드한 모든 파일 삭제
      if (req.files) {
        setImmediate(() => {
          req.files.forEach(file => {
            fs.unlink(path.join(uploadDir, file.filename)).catch(err => {
              console.error('Failed to delete uploaded file:', err);
            });
          });
        });
      }

      sendError(res, 500, 'Bulk upload failed');
    }
  }
);

module.exports = router;
