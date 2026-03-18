/**
 * ============================================================================
 * 위치/지도 API 라우트 (Task #11)
 * ============================================================================
 * GET /api/locations — 위치 목록
 * GET /api/locations/:id — 위치 상세
 * GET /api/locations/nearby?lat=&lon=&radius= — 근처 위치 검색
 * GET /api/locations/heatmap — 히트맵 데이터 (지역별 지지도)
 * POST /api/locations — 위치 생성 (관리자만)
 * PUT /api/locations/:id — 위치 수정 (관리자만)
 * DELETE /api/locations/:id — 위치 삭제 (관리자만)
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
 * GET /api/locations
 * 위치 목록 조회 (공개)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      candidate_id,
      type,
      limit = 100,
      offset = 0,
    } = req.query;

    let query = `
      SELECT
        id, candidate_id, name, type, latitude, longitude,
        address, phone, website, event_date, description,
        image_url, created_at, updated_at
      FROM locations
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // 필터: 후보자 ID
    if (candidate_id) {
      query += ` AND candidate_id = $${paramCount}`;
      params.push(candidate_id);
      paramCount++;
    }

    // 필터: 위치 타입
    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    // 정렬 및 페이지네이션
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const locations = await req.db.query(query, params);

    sendSuccess(res, 200, locations.rows, 'Locations retrieved successfully');
  } catch (error) {
    console.error('GET /api/locations error:', error);
    sendError(res, 500, 'Failed to retrieve locations');
  }
});

/**
 * GET /api/locations/:id
 * 위치 상세 조회 (공개)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        id, candidate_id, name, type, latitude, longitude,
        address, phone, website, event_date, description,
        image_url, created_at, updated_at
      FROM locations
      WHERE id = $1
    `;

    const result = await req.db.query(query, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Location not found');
    }

    sendSuccess(res, 200, result.rows[0], 'Location retrieved successfully');
  } catch (error) {
    console.error('GET /api/locations/:id error:', error);
    sendError(res, 500, 'Failed to retrieve location');
  }
});

/**
 * GET /api/locations/nearby?lat=<latitude>&lon=<longitude>&radius=<km>
 * 근처 위치 검색 (공개)
 *
 * 예: /api/locations/nearby?lat=37.5665&lon=126.9780&radius=5
 * (반경 5km 이내의 모든 위치)
 */
router.get('/search/nearby', optionalAuth, async (req, res) => {
  try {
    const { lat, lon, radius = 5, candidate_id } = req.query;

    // 필수 파라미터 검증
    if (!lat || !lon) {
      return sendError(res, 400, 'Latitude and longitude are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius);

    // 범위 검증
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return sendError(res, 400, 'Invalid latitude or longitude');
    }

    if (radiusKm < 0 || radiusKm > 500) {
      return sendError(res, 400, 'Radius must be between 0 and 500 km');
    }

    // Haversine 공식을 사용한 거리 기반 검색
    // earthdistance 확장 사용 (PostgreSQL)
    let query = `
      SELECT
        id, candidate_id, name, type, latitude, longitude,
        address, phone, website, event_date, description,
        image_url,
        ROUND(
          earth_distance(ll_to_earth($1, $2), ll_to_earth(latitude, longitude))::numeric / 1000,
          2
        ) AS distance_km,
        created_at, updated_at
      FROM locations
      WHERE earth_distance(ll_to_earth($1, $2), ll_to_earth(latitude, longitude)) <= ($3 * 1000)
    `;
    const params = [latitude, longitude, radiusKm];
    let paramCount = 4;

    // 후보자 필터
    if (candidate_id) {
      query += ` AND candidate_id = $${paramCount}`;
      params.push(candidate_id);
      paramCount++;
    }

    query += ` ORDER BY distance_km ASC`;

    const nearbyLocations = await req.db.query(query, params);

    sendSuccess(res, 200, {
      center: { latitude, longitude },
      radius_km: radiusKm,
      locations: nearbyLocations.rows,
      count: nearbyLocations.rows.length,
    }, 'Nearby locations retrieved successfully');
  } catch (error) {
    console.error('GET /api/locations/search/nearby error:', error);
    sendError(res, 500, 'Failed to search nearby locations');
  }
});

/**
 * GET /api/locations/heatmap
 * 지역별 지지도 히트맵 데이터 (공개)
 * 위도/경도 그룹핑으로 밀집도 계산
 */
router.get('/heatmap', optionalAuth, async (req, res) => {
  try {
    const { candidate_id, type } = req.query;

    let query = `
      SELECT
        ROUND(latitude::numeric, 2) AS lat,
        ROUND(longitude::numeric, 2) AS lon,
        COUNT(*) AS intensity,
        ARRAY_AGG(DISTINCT type) AS types,
        ARRAY_AGG(DISTINCT name) AS names
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

    query += ` GROUP BY ROUND(latitude::numeric, 2), ROUND(longitude::numeric, 2)
               ORDER BY intensity DESC`;

    const heatmapData = await req.db.query(query, params);

    sendSuccess(res, 200, {
      heatmap: heatmapData.rows,
      intensity_range: {
        min: Math.min(...heatmapData.rows.map(r => r.intensity)),
        max: Math.max(...heatmapData.rows.map(r => r.intensity)),
      },
    }, 'Heatmap data retrieved successfully');
  } catch (error) {
    console.error('GET /api/locations/heatmap error:', error);
    sendError(res, 500, 'Failed to retrieve heatmap data');
  }
});

/**
 * POST /api/locations
 * 위치 생성 (관리자만)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      candidate_id,
      name,
      type,
      latitude,
      longitude,
      address,
      phone,
      website,
      event_date,
      description,
      image_url,
    } = req.body;

    // 필수 필드 검증
    if (!candidate_id || !name || latitude === undefined || longitude === undefined) {
      return sendError(res, 400, 'candidate_id, name, latitude, and longitude are required');
    }

    // 좌표 범위 검증
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return sendError(res, 400, 'Invalid latitude or longitude');
    }

    // 후보자 존재 확인
    const candidateCheck = await req.db.query(
      'SELECT id FROM candidates WHERE id = $1',
      [candidate_id]
    );
    if (candidateCheck.rows.length === 0) {
      return sendError(res, 404, 'Candidate not found');
    }

    const query = `
      INSERT INTO locations
      (candidate_id, name, type, latitude, longitude, address, phone,
       website, event_date, description, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, candidate_id, name, type, latitude, longitude,
                address, phone, website, event_date, description,
                image_url, created_at, updated_at
    `;

    const result = await req.db.query(query, [
      candidate_id,
      name,
      type || null,
      latitude,
      longitude,
      address || null,
      phone || null,
      website || null,
      event_date || null,
      description || null,
      image_url || null,
    ]);

    sendSuccess(res, 201, result.rows[0], 'Location created successfully');
  } catch (error) {
    console.error('POST /api/locations error:', error);
    sendError(res, 500, 'Failed to create location');
  }
});

/**
 * PUT /api/locations/:id
 * 위치 수정 (관리자만)
 */
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      latitude,
      longitude,
      address,
      phone,
      website,
      event_date,
      description,
      image_url,
    } = req.body;

    // 기존 위치 확인
    const existing = await req.db.query(
      'SELECT id FROM locations WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return sendError(res, 404, 'Location not found');
    }

    // 좌표 범위 검증
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      return sendError(res, 400, 'Invalid latitude');
    }
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      return sendError(res, 400, 'Invalid longitude');
    }

    // 동적 업데이트
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }
    if (latitude !== undefined) {
      updates.push(`latitude = $${paramCount++}`);
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push(`longitude = $${paramCount++}`);
      values.push(longitude);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (website !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(website);
    }
    if (event_date !== undefined) {
      updates.push(`event_date = $${paramCount++}`);
      values.push(event_date);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }

    if (updates.length === 0) {
      return sendError(res, 400, 'No fields to update');
    }

    values.push(id);

    const query = `
      UPDATE locations
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, candidate_id, name, type, latitude, longitude,
                address, phone, website, event_date, description,
                image_url, created_at, updated_at
    `;

    const result = await req.db.query(query, values);

    sendSuccess(res, 200, result.rows[0], 'Location updated successfully');
  } catch (error) {
    console.error('PUT /api/locations/:id error:', error);
    sendError(res, 500, 'Failed to update location');
  }
});

/**
 * DELETE /api/locations/:id
 * 위치 삭제 (관리자만)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 기존 위치 확인
    const existing = await req.db.query(
      'SELECT id FROM locations WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return sendError(res, 404, 'Location not found');
    }

    // 삭제
    await req.db.query('DELETE FROM locations WHERE id = $1', [id]);

    sendSuccess(res, 200, { id }, 'Location deleted successfully');
  } catch (error) {
    console.error('DELETE /api/locations/:id error:', error);
    sendError(res, 500, 'Failed to delete location');
  }
});

module.exports = router;
