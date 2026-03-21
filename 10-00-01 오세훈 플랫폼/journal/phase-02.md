# Phase 02 — 스태프 로그인 시스템 및 인증 구현

**작성자:** Alpha 분대장
**작성일:** 2026-03-21
**커밋:** `8784e46` (최초 구현) → `916c615` (고도화 — Bravo Squad)
**담당 분대:** Bravo 분대 (security-specialist + api-developer)

---

## 1. 임무 (What)

캠프 플랫폼의 전략·정보·AI 기능이 담긴 6개 페이지를 **인증된 스태프만 접근 가능하도록** 보호한다. 신규 `pages/login.html` 로그인 페이지와 `js/auth.js` 공통 인증 모듈을 구현하고, 기존 6개 전략 페이지에 인증 체크를 적용한다.

**변경 범위:**
- `pages/login.html` — 신규 스태프 로그인 페이지
- `js/auth.js` — 공통 클라이언트 인증 모듈 (v1.0 → v2.0 고도화)
- 6개 보호 페이지: dashboard, intelligence, strategy, electionmap, winningtrategy, ai-assistant

---

## 2. 배경/맥락 (Why)

Phase 1 완료 후 AI 어시스턴트와 전략 분석 페이지는 누구나 URL만 알면 접근 가능한 상태였다. 캠프 내부 기밀 정보(지지도 분석, 경쟁 후보 분석, 판세 시뮬레이션)가 외부에 노출될 위험이 있었다.

**보호 필요 이유:**
- 선거 전략 문서 및 실시간 지지도 데이터는 **대외비** 수준의 기밀
- 캠프 스태프 역할(admin/manager/staff/viewer)별 권한 분리 필요
- AI 어시스턴트의 무단 이용 방지 (API 비용 통제)

**기술 방향 결정:**
- 서버에 이미 JWT 기반 인증(`server/middleware/auth.js`)이 구현되어 있었으므로 클라이언트 측에서도 JWT를 활용하는 방향 채택
- 세션 스토리지 대신 `localStorage` 선택 — 탭 간 로그인 상태 공유 필요

---

## 3. 설계 결정 (Decisions)

| 결정 사항 | 선택 | 이유 |
|---|---|---|
| 토큰 저장소 | `localStorage` | 탭 간 공유 필요, 서버사이드 렌더링 없으므로 XSS 위험 최소화는 CSP로 보완 |
| JWT 만료 검증 | 클라이언트 측 사전 검증 (`isTokenExpired`) | 서버 요청 전 만료 감지 → 불필요한 API 호출 제거 |
| 역할 계층 | `admin > manager > staff > viewer` (숫자 레벨) | 단순 문자열 비교 대신 계층적 권한 확인 가능 |
| 리디렉트 후 복귀 | `redirectAfterLogin` localStorage 저장 | 로그인 후 원래 페이지로 자동 이동 UX |
| 브루트포스 방지 | 로그인 실패 횟수 카운터 + 잠금 (고도화에서 추가) | 무차별 대입 공격 방어 |
| 비밀번호 가시성 토글 | 눈 아이콘 버튼 (고도화에서 추가) | 스태프 편의성 |

**역할 계층 구조:**
```javascript
const ROLE_HIERARCHY = { admin: 4, manager: 3, staff: 2, viewer: 1 };
// hasRequiredRole(userRole, requiredRole): 숫자 레벨 비교로 계층 권한 확인
```

---

## 4. 구현 상세 (How)

### 4-1. 공통 인증 모듈 (`js/auth.js`) — 핵심 함수 7개

**JWT 디코딩 및 만료 검증:**
```javascript
function decodeJwtPayload(token) {
  // Base64URL → Base64 변환 후 JSON 파싱
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(atob(base64).split('').map(...).join('')));
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  // 10초 여유 두고 검사 (클럭 스큐 방지)
  return Date.now() / 1000 > payload.exp - 10;
}
```

**보호 페이지 접근 제어:**
```javascript
function requireLogin(requiredRole = null) {
  if (!token || !user) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = 'login.html';
    return false;
  }
  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    // 권한 부족 → dashboard.html로 리디렉트
  }
  return true;
}
```

**API 인증 헤더 주입:**
```javascript
function getAuthHeaders(headers = {}) {
  const token = getAuthToken();
  return { ...headers, ...(token && { Authorization: `Bearer ${token}` }) };
}
```

**인증 에러 핸들러 (401/403 분리 처리):**
```javascript
function handleAuthError(response) {
  if (response.status === 401) {
    // 세션 만료 → 현재 위치 저장 → login.html?reason=session_expired
  }
  if (response.status === 403) {
    // 권한 없음 → dashboard.html
  }
}
```

### 4-2. 로그인 페이지 (`pages/login.html`)

- 디자인: 캠프 레드 그라디언트 배경 + 화이트 카드 레이아웃
- 흐름: 아이디/비밀번호 입력 → `POST /api/auth/login` → JWT + 사용자 정보 localStorage 저장 → 이전 페이지 또는 dashboard.html로 리디렉트
- 고도화 추가: 브루트포스 방지(5회 실패 시 잠금), 비밀번호 표시 토글, 실패 사유별 메시지

### 4-3. 보호 페이지 적용 방식

각 보호 페이지 상단에 auth.js 스크립트 추가 후 페이지 로드 시 호출:
```html
<script src="../js/auth.js"></script>
<script>requireLogin();</script>
```

**보호 적용 페이지:** dashboard, intelligence, strategy, electionmap, winningtrategy, ai-assistant, tasks (7개)

---

## 5. 이슈/해결 (Issues)

| 이슈 | 원인 | 해결 |
|---|---|---|
| 로그아웃 후 뒤로가기 시 페이지 접근 가능 | 브라우저 캐시 | `requireLogin()` 매 페이지 로드 시 재검증으로 최소화 |
| JWT 만료 감지 지연 | 클라이언트 시계와 서버 시계 차이 | `exp - 10` (10초 여유) 로직 도입 |
| 역할 문자열 직접 비교의 취약성 | `admin` !== `Admin` 오타 가능 | 숫자 레벨 매핑 (`ROLE_HIERARCHY`) 도입 |
| 로그인 후 원래 페이지 유실 | 리디렉트 URL 미저장 | `redirectAfterLogin` localStorage 키 활용 |
| 403 vs 401 혼용 | 권한 없음과 만료를 동일하게 처리 | 상태 코드별 분기 처리 (`handleAuthError`) |

---

## 6. 연계사항 (Dependencies)

- **선행 조건:**
  - `server/middleware/auth.js` — 서버 측 JWT 발급 및 검증 (`POST /api/auth/login`)
  - `server/routes/auth.js` — 로그인 엔드포인트 존재 필요
- **영향 받는 Phase:**
  - Phase 1 (AI 어시스턴트): `auth.js` 추가로 로그인 필수 페이지가 됨
  - Phase 3~6: 모든 통계/태스크/KPI 페이지의 API 호출 시 `getAuthHeaders()` 활용
- **DB 의존성:** `staff_users` 또는 `users` 테이블 — 아이디/패스워드/역할 저장
- **후속 작업:** Phase 4 태스크 관리에서 역할별 접근 제어(`requiredRole: 'staff'`) 활용

---

## 7. 향후 과제 (TODO)

- [ ] Refresh Token 도입 — 현재 Access Token 단일 구조, 장기 세션 지원 미흡
- [ ] HTTPS Only 쿠키 저장 방식 전환 — XSS 방어 강화 (`HttpOnly` 쿠키)
- [ ] 서버 측 세션 블랙리스트 — 강제 로그아웃 기능 (관리자 → 특정 스태프 킥)
- [ ] 2FA (두 번째 인증) — OTP 또는 이메일 인증 코드
- [ ] 로그인 시도 로그 저장 — IP 기반 이상 접근 탐지
- [ ] 비밀번호 해싱 검증 — bcrypt 라운드 수 설정값 문서화
- [ ] 세션 타임아웃 UI — 만료 N분 전 경고 팝업
