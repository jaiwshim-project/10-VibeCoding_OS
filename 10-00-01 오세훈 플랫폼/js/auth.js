/**
 * 공통 인증 모듈
 * 스태프 로그인 여부 확인 및 토큰 관리
 */

/**
 * 현재 사용자 정보 반환
 * @returns {Object|null} 사용자 정보 또는 null
 */
function getCurrentUser() {
  try {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * 현재 인증 토큰 반환
 * @returns {string|null} JWT 토큰 또는 null
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * 로그인 여부 확인
 * @returns {boolean} 로그인 상태
 */
function isLoggedIn() {
  return !!getAuthToken() && !!getCurrentUser();
}

/**
 * 로그아웃
 */
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

/**
 * 보호된 페이지 접근 확인
 * 로그인하지 않은 경우 login.html으로 리디렉트
 * @param {string} requiredRole - 필요한 역할 (선택사항)
 */
function requireLogin(requiredRole = null) {
  const token = getAuthToken();
  const user = getCurrentUser();

  // 로그인 확인
  if (!token || !user) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = 'login.html';
    return false;
  }

  // 역할 확인 (필요한 경우)
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    console.error(`접근 권한 없음: ${requiredRole} 역할 필요`);
    alert('접근 권한이 없습니다. 관리자에게 문의하세요.');
    window.location.href = 'dashboard.html';
    return false;
  }

  return true;
}

/**
 * API 요청 시 인증 헤더 포함
 * @param {Object} headers - 기본 헤더 객체
 * @returns {Object} 인증 헤더가 포함된 헤더 객체
 */
function getAuthHeaders(headers = {}) {
  const token = getAuthToken();
  return {
    ...headers,
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

/**
 * API 응답의 인증 에러 처리
 * 토큰 만료 등의 경우 로그인 페이지로 리디렉트
 * @param {Response} response - fetch 응답 객체
 * @returns {boolean} 인증 에러 여부
 */
function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

/**
 * 페이지 로드 시 사용자 정보 표시 (헤더 또는 네비게이션에 사용)
 * @param {string} elementId - 사용자 정보를 표시할 요소 ID
 */
function displayUserInfo(elementId) {
  const user = getCurrentUser();
  if (!user) return;

  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = `${user.name} (${user.role})`;
  }
}

/**
 * 페이지에 로그아웃 버튼 추가
 * @param {string} parentElementId - 로그아웃 버튼을 추가할 부모 요소 ID
 */
function addLogoutButton(parentElementId) {
  const parent = document.getElementById(parentElementId);
  if (!parent) return;

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'logout-btn';
  logoutBtn.textContent = '🚪 로그아웃';
  logoutBtn.style.cssText = `
    padding: 8px 16px;
    background: #EF4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  `;

  logoutBtn.addEventListener('mouseenter', () => {
    logoutBtn.style.opacity = '0.8';
  });

  logoutBtn.addEventListener('mouseleave', () => {
    logoutBtn.style.opacity = '1';
  });

  logoutBtn.addEventListener('click', logout);
  parent.appendChild(logoutBtn);
}

// 페이지 로드 시 자동으로 실행되는 초기화 함수
function initAuth() {
  const user = getCurrentUser();

  // 대시보드/전략 페이지들은 로그인 필수
  const protectedPages = [
    'dashboard.html',
    'intelligence.html',
    'strategy.html',
    'electionmap.html',
    'winningtrategy.html',
    'ai-assistant.html',
    'tasks.html'
  ];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // 보호된 페이지에 미로그인 상태로 접근하면 로그인 페이지로 리디렉트
  if (protectedPages.includes(currentPage) && !isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = 'login.html';
  }

  // 로그인 페이지는 이미 로그인 상태면 대시보드로 리디렉트
  if (currentPage === 'login.html' && isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
}

// 페이지 로드 시 인증 초기화
document.addEventListener('DOMContentLoaded', initAuth);
