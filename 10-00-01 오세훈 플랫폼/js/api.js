/**
 * ============================================================================
 * 오세훈 선거캠프 플랫폼 — 프론트엔드 API 클라이언트 (Task #11)
 * ============================================================================
 * REST API 호출 모듈 — Vanilla JS fetch 기반
 * 작성: Charlie 분대 (3분대장)
 * 날짜: 2026-03-19
 * ============================================================================
 */

const API_BASE = window.API_BASE_URL || '/api';

// ============================================================================
// 공통 fetch 래퍼
// ============================================================================

/**
 * HTTP 요청 실행
 * @param {string} endpoint - API 경로
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>}
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || `HTTP ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ============================================================================
// 인증 (Auth)
// ============================================================================

const Auth = {
  /**
   * 로그인
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.data?.token) {
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('currentUser', JSON.stringify(result.data.user));
    }
    return result;
  },

  /** 회원가입 */
  async signup(email, password, name) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  /** 로그아웃 */
  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  },

  /** 내 프로필 조회 */
  async me() {
    return apiRequest('/auth/me');
  },

  /** 토큰 갱신 */
  async refreshToken() {
    const result = await apiRequest('/auth/refresh', { method: 'POST' });
    if (result.data?.token) {
      localStorage.setItem('authToken', result.data.token);
    }
    return result;
  },

  /** 현재 로그인 여부 */
  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  },

  /** 현재 사용자 정보 */
  currentUser() {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  },
};

// ============================================================================
// 후보자 (Candidates)
// ============================================================================

const Candidates = {
  /** 후보자 목록 */
  async list() {
    return apiRequest('/candidates');
  },

  /** 후보자 상세 (통계 포함) */
  async get(id) {
    return apiRequest(`/candidates/${id}`);
  },

  /** 후보자 정보 수정 (관리자) */
  async update(id, data) {
    return apiRequest(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// 정책 (Policies)
// ============================================================================

const Policies = {
  /**
   * 정책 목록
   * @param {Object} params - { candidate_id, category, status, limit, offset, sort }
   */
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/policies${qs ? '?' + qs : ''}`);
  },

  /** 정책 상세 */
  async get(id) {
    return apiRequest(`/policies/${id}`);
  },

  /** 정책 생성 (에디터/관리자) */
  async create(data) {
    return apiRequest('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 정책 수정 */
  async update(id, data) {
    return apiRequest(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** 정책 삭제 (관리자) */
  async delete(id) {
    return apiRequest(`/policies/${id}`, { method: 'DELETE' });
  },
};

// ============================================================================
// 뉴스 (News)
// ============================================================================

const News = {
  /** 뉴스 목록 (공개 플랫폼용) */
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/news${qs ? '?' + qs : ''}`);
  },

  /** 뉴스 상세 */
  async get(id) {
    return apiRequest(`/news/${id}`);
  },

  /** 실시간 뉴스 피드 (워룸 내부) */
  async feed(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/news/feed${qs ? '?' + qs : ''}`);
  },

  /** 감정분석 통계 */
  async sentiment() {
    return apiRequest('/news/sentiment');
  },

  /** 경쟁 후보 비교 */
  async competitors() {
    return apiRequest('/news/competitors');
  },
};

// ============================================================================
// 검색 (Search)
// ============================================================================

const Search = {
  /**
   * 통합 검색
   * @param {string} query - 검색어
   * @param {Object} options - { candidate_id, type, limit }
   */
  async search(query, options = {}) {
    return apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify({ q: query, ...options }),
    });
  },

  /** 자동완성 제안 */
  async suggestions(query, limit = 10) {
    return apiRequest(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /** 검색 분석 (관리자) */
  async analytics(days = 30) {
    return apiRequest(`/search/analytics?days=${days}`);
  },
};

// ============================================================================
// 지도 (Map)
// ============================================================================

const Map = {
  /**
   * 위치 목록
   * @param {Object} params - { candidate_id, type, limit }
   */
  async locations(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/map/locations${qs ? '?' + qs : ''}`);
  },

  /** 위치 상세 */
  async location(id) {
    return apiRequest(`/map/locations/${id}`);
  },

  /**
   * 반경 내 위치 검색
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} radius - 반경 (km)
   */
  async nearby(lat, lng, radius = 5, params = {}) {
    const qs = new URLSearchParams({ lat, lng, radius, ...params }).toString();
    return apiRequest(`/map/nearby?${qs}`);
  },

  /** 히트맵 데이터 */
  async heatmap(candidateId = 1) {
    return apiRequest(`/map/heatmap?candidate_id=${candidateId}`);
  },

  /** 위치 추가 (관리자) */
  async createLocation(data) {
    return apiRequest('/map/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 위치 삭제 (관리자) */
  async deleteLocation(id) {
    return apiRequest(`/map/locations/${id}`, { method: 'DELETE' });
  },
};

// ============================================================================
// 챗봇 (Chat)
// ============================================================================

const Chat = {
  /** 새 세션 시작 */
  async startSession(candidateId = 1) {
    return apiRequest('/chat/start', {
      method: 'POST',
      body: JSON.stringify({ candidate_id: candidateId }),
    });
  },

  /**
   * 메시지 전송
   * @param {string} sessionId - 세션 ID
   * @param {string} message - 메시지 내용
   * @param {number} candidateId - 후보자 ID
   */
  async send(sessionId, message, candidateId = 1) {
    return apiRequest('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, candidateId }),
    });
  },

  /** 대화 히스토리 조회 */
  async history(sessionId, limit = 50) {
    return apiRequest(`/chat/${sessionId}?limit=${limit}`);
  },

  /** 세션 삭제 */
  async deleteSession(sessionId) {
    return apiRequest(`/chat/${sessionId}`, { method: 'DELETE' });
  },

  /** 챗봇 통계 (관리자) */
  async stats(candidateId, days = 30) {
    return apiRequest(`/chat/stats/${candidateId}?days=${days}`);
  },
};

// ============================================================================
// 미디어 (Media)
// ============================================================================

const Media = {
  /**
   * 파일 업로드
   * @param {File} file - 업로드할 파일
   * @param {number} candidateId - 후보자 ID
   */
  async upload(file, candidateId, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidate_id', candidateId);
    if (options.isPublic !== undefined) {
      formData.append('is_public', options.isPublic);
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  /** 후보자 미디어 목록 */
  async list(candidateId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/media/candidate/${candidateId}/list${qs ? '?' + qs : ''}`);
  },

  /** 파일 삭제 */
  async delete(fileId) {
    return apiRequest(`/media/${fileId}`, { method: 'DELETE' });
  },
};

// ============================================================================
// 분석 (Analytics)
// ============================================================================

const Analytics = {
  /**
   * 이벤트 추적
   * @param {string} eventType - 이벤트 유형
   * @param {Object} data - 추가 데이터
   */
  async track(eventType, data = {}) {
    try {
      await apiRequest('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ event_type: eventType, ...data }),
      });
    } catch (e) {
      // 추적 실패는 무시
    }
  },

  /** 전체 대시보드 통계 */
  async overview(days = 30) {
    return apiRequest(`/analytics/overview?days=${days}`);
  },

  /** 콘텐츠 성과 분석 */
  async content(type = 'news', days = 30) {
    return apiRequest(`/analytics/content?type=${type}&days=${days}`);
  },
};

// ============================================================================
// 헬스체크
// ============================================================================

const Health = {
  async check() {
    const response = await fetch('/health');
    return response.json();
  },

  async checkDB() {
    return apiRequest('/health/db');
  },
};

// ============================================================================
// 글로벌 내보내기
// ============================================================================

// 브라우저 환경
if (typeof window !== 'undefined') {
  window.OsehoonAPI = {
    Auth,
    Candidates,
    Policies,
    News,
    Search,
    Map,
    Chat,
    Media,
    Analytics,
    Health,
  };
}

// Node.js 환경 (테스트용)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Auth,
    Candidates,
    Policies,
    News,
    Search,
    Map,
    Chat,
    Media,
    Analytics,
    Health,
  };
}
