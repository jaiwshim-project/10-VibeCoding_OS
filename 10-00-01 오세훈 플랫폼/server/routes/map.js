/**
 * ============================================================================
 * 지도/위치 API 라우트 (Task #11)
 * ============================================================================
 * GET /api/map/locations — 모든 위치 목록
 * GET /api/map/locations/:id — 위치 상세
 * POST /api/map/locations — 위치 추가 (관리자)
 * PUT /api/map/locations/:id — 위치 수정 (관리자)
 * DELETE /api/map/locations/:id — 위치 삭제 (관리자)
 * GET /api/map/nearby — 반경 내 위치 검색
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
 * GET /api/map/locations
 * 모든 위치 목록 조회 (공개)
 */
router.get('/locations', optionalAuth, async (req, res) => {
  try {
    const { candidate_id, type, limit = 100 } = req.query;

    let query = `
      SELECT
        id, candidate_id, name, type,
        latitude, longitude, address, phone,
        website, event_date, description, image_url,
        created_at
      FROM locations
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (candidate_id) {
      query += ` AND candidate_id = $${paramCount}`;
      params.push(candidate_id);
      paramCount++;
    }

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await req.db.query(query, params);

    sendSuccess(res, 200, result.rows, 'Locations retrieved successfully');
  } catch (error) {
    console.error('GET /api/map/locations error:', error);
    sendError(res, 500, 'Failed to retrieve locations');
  }
});

/**
 * GET /api/map/locations/:id
 * 위치 상세 조회 (공개)
 */
router.get('/locations/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      `SELECT id, candidate_id, name, type,
              latitude, longitude, address, phone,
              website, event_date, description, image_url, created_at
       FROM locations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Location not found');
    }

    sendSuccess(res, 200, result.rows[0], 'Location retrieved successfully');
  } catch (error) {
    console.error('GET /api/map/locations/:id error:', error);
    sendError(res, 500, 'Failed to retrieve location');
  }
});

/**
 * GET /api/map/nearby
 * 반경 내 위치 검색
 * 쿼리 파라미터: lat, lng, radius (km), type
 */
router.get('/nearby', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 5, type, candidate_id } = req.query;

    if (!lat || !lng) {
      return sendError(res, 400, 'lat and lng are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude)) {
      return sendError(res, 400, 'Invalid lat/lng values');
    }

    // 하버사인 공식으로 거리 계산 (PostgreSQL)
    let query = `
      SELECT
        id, candidate_id, name, type,
        latitude, longitude, address, phone,
        event_date, description,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance_km
      FROM locations
      WHERE 1=1
    `;
    const params = [latitude, longitude];
    let paramCount = 3;

    if (candidate_id) {
      query += ` AND candidate_id = $${paramCount}`;
      params.push(candidate_id);
      paramCount++;
    }

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    // 반경 필터 + 거리순 정렬
    query += `
      HAVING (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      )) <= $${paramCount}
      ORDER BY distance_km ASC
      LIMIT 50
    `;
    params.push(radiusKm);

    // HAVING 없이 WHERE로 대체 (더 안전)
    const safeQuery = `
      SELECT * FROM (
        SELECT
          id, candidate_id, name, type,
          latitude, longitude, address, phone,
          event_date, description,
          (6371 * acos(
            LEAST(1.0, cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude)))
          )) AS distance_km
        FROM locations
        WHERE 1=1
        ${candidate_id ? `AND candidate_id = $${paramCount - 1}` : ''}
        ${type ? `AND type = $${paramCount - (candidate_id ? 0 : 1)}` : ''}
      ) sub
      WHERE distance_km <= ${radiusKm}
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    const result = await req.db.query(
      `SELECT
        id, candidate_id, name, type,
        latitude, longitude, address, phone,
        event_date, description,
        ROUND(CAST(6371 * acos(
          LEAST(1.0, cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude)))
        ) AS NUMERIC), 2) AS distance_km
       FROM locations
       ORDER BY distance_km ASC
       LIMIT 50`,
      [latitude, longitude]
    );

    const nearby = result.rows.filter(r => r.distance_km <= radiusKm);

    sendSuccess(res, 200, {
      center: { lat: latitude, lng: longitude },
      radius_km: radiusKm,
      count: nearby.length,
      locations: nearby,
    }, 'Nearby locations retrieved successfully');
  } catch (error) {
    console.error('GET /api/map/nearby error:', error);
    sendError(res, 500, 'Failed to retrieve nearby locations');
  }
});

/**
 * GET /api/map/heatmap
 * 지지도 히트맵 데이터 (공개)
 */
router.get('/heatmap', optionalAuth, async (req, res) => {
  try {
    const { candidate_id = 1 } = req.query;

    // 실제 구현에서는 설문 데이터, SNS 데이터 등에서 집계
    // 현재는 서울 주요 자치구별 더미 데이터
    const heatmapData = [
      { district: '종로구', lat: 37.5730, lng: 126.9794, support: 72, intensity: 0.72 },
      { district: '중구',   lat: 37.5636, lng: 126.9976, support: 68, intensity: 0.68 },
      { district: '용산구', lat: 37.5321, lng: 126.9909, support: 65, intensity: 0.65 },
      { district: '성동구', lat: 37.5634, lng: 127.0369, support: 70, intensity: 0.70 },
      { district: '광진구', lat: 37.5385, lng: 127.0823, support: 58, intensity: 0.58 },
      { district: '동대문구', lat: 37.5744, lng: 127.0406, support: 62, intensity: 0.62 },
      { district: '중랑구', lat: 37.6063, lng: 127.0927, support: 55, intensity: 0.55 },
      { district: '성북구', lat: 37.5894, lng: 127.0167, support: 63, intensity: 0.63 },
      { district: '강북구', lat: 37.6398, lng: 127.0256, support: 60, intensity: 0.60 },
      { district: '도봉구', lat: 37.6688, lng: 127.0471, support: 64, intensity: 0.64 },
      { district: '노원구', lat: 37.6542, lng: 127.0568, support: 61, intensity: 0.61 },
      { district: '은평구', lat: 37.6027, lng: 126.9293, support: 67, intensity: 0.67 },
      { district: '서대문구', lat: 37.5792, lng: 126.9368, support: 71, intensity: 0.71 },
      { district: '마포구', lat: 37.5663, lng: 126.9014, support: 73, intensity: 0.73 },
      { district: '양천구', lat: 37.5170, lng: 126.8666, support: 69, intensity: 0.69 },
      { district: '강서구', lat: 37.5509, lng: 126.8496, support: 66, intensity: 0.66 },
      { district: '구로구', lat: 37.4954, lng: 126.8876, support: 59, intensity: 0.59 },
      { district: '금천구', lat: 37.4600, lng: 126.9001, support: 57, intensity: 0.57 },
      { district: '영등포구', lat: 37.5264, lng: 126.8965, support: 74, intensity: 0.74 },
      { district: '동작구', lat: 37.5124, lng: 126.9393, support: 76, intensity: 0.76 },
      { district: '관악구', lat: 37.4784, lng: 126.9516, support: 54, intensity: 0.54 },
      { district: '서초구', lat: 37.4836, lng: 127.0327, support: 82, intensity: 0.82 },
      { district: '강남구', lat: 37.5172, lng: 127.0473, support: 85, intensity: 0.85 },
      { district: '송파구', lat: 37.5145, lng: 127.1060, support: 78, intensity: 0.78 },
      { district: '강동구', lat: 37.5301, lng: 127.1238, support: 71, intensity: 0.71 },
    ];

    sendSuccess(res, 200, {
      candidate_id: parseInt(candidate_id),
      total_districts: heatmapData.length,
      average_support: Math.round(heatmapData.reduce((s, d) => s + d.support, 0) / heatmapData.length),
      data: heatmapData,
      updated_at: new Date(),
    }, 'Heatmap data retrieved successfully');
  } catch (error) {
    console.error('GET /api/map/heatmap error:', error);
    sendError(res, 500, 'Failed to retrieve heatmap data');
  }
});

/**
 * POST /api/map/locations
 * 위치 추가 (관리자)
 */
router.post('/locations', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const {
      candidate_id, name, type, latitude, longitude,
      address, phone, website, event_date, description, image_url,
    } = req.body;

    if (!candidate_id || !name || !latitude || !longitude) {
      return sendError(res, 400, 'candidate_id, name, latitude, longitude are required');
    }

    const result = await req.db.query(
      `INSERT INTO locations
       (candidate_id, name, type, latitude, longitude, address, phone, website, event_date, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [candidate_id, name, type, latitude, longitude, address, phone, website, event_date, description, image_url]
    );

    sendSuccess(res, 201, result.rows[0], 'Location created successfully');
  } catch (error) {
    console.error('POST /api/map/locations error:', error);
    sendError(res, 500, 'Failed to create location');
  }
});

/**
 * PUT /api/map/locations/:id
 * 위치 수정 (관리자)
 */
router.put('/locations/:id', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ['name', 'type', 'latitude', 'longitude', 'address', 'phone', 'website', 'event_date', 'description', 'image_url'];

    const updates = [];
    const values = [];
    let paramCount = 1;

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return sendError(res, 400, 'No fields to update');
    }

    values.push(id);

    const result = await req.db.query(
      `UPDATE locations SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Location not found');
    }

    sendSuccess(res, 200, result.rows[0], 'Location updated successfully');
  } catch (error) {
    console.error('PUT /api/map/locations/:id error:', error);
    sendError(res, 500, 'Failed to update location');
  }
});

/**
 * DELETE /api/map/locations/:id
 * 위치 삭제 (관리자)
 */
router.delete('/locations/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      'DELETE FROM locations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Location not found');
    }

    sendSuccess(res, 200, { id }, 'Location deleted successfully');
  } catch (error) {
    console.error('DELETE /api/map/locations/:id error:', error);
    sendError(res, 500, 'Failed to delete location');
  }
});

module.exports = router;
