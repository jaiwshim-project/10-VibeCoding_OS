# Phase 6 — 대시보드 KPI 확대 + 실시간 알림

**커밋**: `547fbe4`
**날짜**: 2026-03-19
**담당**: Bravo 분대
**파일 수**: 1개 수정 (`pages/dashboard.html`, +344 lines)

---

## 1. 임무 (What)

대시보드의 KPI 카드를 4개에서 8개로 확장하고, **실시간 알림 패널**과 **태스크 진행률 섹션**을 추가한다.

- KPI 카드: 지지도·호의도·핵심지지층·관심사이슈 (기존 4개) + 투표율예측·부동층비율·주간변화율·강북지지도 (신규 4개)
- 실시간 알림 패널: `/api/stats/summary` 연동, 상대 시간 표시
- 태스크 진행률: `/api/tasks` 연동, 프로그레스 바 3개

---

## 2. 배경/맥락 (Why)

Phase 1~5를 거쳐 AI 분석, 인증, 통계 API, 태스크 관리, 모바일 최적화가 완료됐다. 그러나 대시보드는 정적인 4개 KPI 카드만 보여주고 있어, **캠프 지도부가 한눈에 파악해야 할 판세 정보가 분산**되어 있었다.

구체적인 문제:
1. 투표율 예측, 부동층 비율 등 핵심 판세 지표가 별도 페이지에 숨겨져 있었다
2. 태스크 진행 상황과 통계 알림이 대시보드에서 보이지 않았다
3. 캠프 총괄이 아침 브리핑에서 탭을 여러 개 열어야 했다

Phase 6는 **대시보드를 진짜 지휘 화면**으로 만드는 통합 작업이다.

---

## 3. 설계 결정 (Decisions)

| 결정 | 선택 | 이유 |
|------|------|------|
| KPI 4→8개 확장 | 동일 `.kpi-card` 컴포넌트 재사용 | CSS 그리드가 자동으로 2열 배치, 코드 변경 최소 |
| 알림 초기 상태 | HTML에 정적 알림 3개 하드코딩 | API 실패 시에도 빈 화면이 아닌 의미 있는 기본값 표시 |
| 알림 업데이트 방식 | `loadDashboardData()` → `updateAlerts()` 함수 분리 | API 성공 시에만 DOM 교체, 실패 시 정적 기본값 유지 |
| 진행률 계산 위치 | 클라이언트 JS (`updateTaskProgress`) | 서버가 이미 `/api/tasks` 원시 데이터를 반환하므로 집계는 클라이언트에서 |
| 상대 시간 표시 | `getTimeAgo()` 내장 구현 | 외부 라이브러리(day.js 등) 의존성 추가 없이 단순 구현 |
| XSS 방지 | `escapeHtml()` 함수로 API 응답 이스케이프 | 알림 메시지가 서버 데이터를 innerHTML에 삽입하기 때문 |
| 메뉴 확장 | 태스크 메뉴 + 로그아웃 버튼 추가 | Phase 4 태스크 페이지 링크, Phase 2 인증 로그아웃 연계 |

**KPI 수 결정 배경**: 8개는 현재 화면에서 4×2 그리드로 깔끔하게 표시된다. 10개 이상이 되면 스크롤이 생겨 한눈에 파악이 불가능하다. 선거 캠프가 매일 아침 브리핑에서 보는 핵심 지표 8개를 선별했다.

---

## 4. 구현 상세 (How)

### 4.1 KPI 카드 8개

| # | 지표 | 값 | 트렌드 |
|---|------|-----|--------|
| 1 | 지지도 | 45% | ↑ 3.2% 상승 |
| 2 | 호의도 | 60% | ↑ 2.1% 상승 |
| 3 | 핵심 지지층 규모 | 1.2M | → 변동 없음 |
| 4 | 주요 관심사 이슈 | 5개 | 추적 중 |
| 5 | 투표율 예측 | 61% | ↑ 2.5% 상승 |
| 6 | 부동층 비율 | 25% | ↓ 2% 감소 |
| 7 | 주간 변화율 | +2.8% | 상승 추세 |
| 8 | 강북 지역 지지도 | 52% | ↑ 1.3% 상승 |

CSS `.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) }`로 반응형 배치.

### 4.2 실시간 알림 패널

```javascript
async function loadDashboardData() {
  const response = await fetch('/api/stats/summary', {
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
  const result = await response.json();
  if (result.success && result.data.notifications?.length > 0) {
    updateAlerts(result.data.notifications);
  }
  // API 실패 or 알림 없으면 정적 HTML 기본값 유지
}

function updateAlerts(notifications) {
  alertsContainer.innerHTML = notifications.map(notif => `
    <div class="alert-item ${notif.type === 'update' ? 'update' : ''}">
      <div class="alert-title">${escapeHtml(notif.message)}</div>
      <div class="alert-time">${getTimeAgo(new Date(notif.timestamp))}</div>
      <span class="alert-badge">${notif.type === 'update' ? '업데이트' : '알림'}</span>
    </div>
  `).join('');
}
```

### 4.3 태스크 진행률 섹션

```javascript
async function loadTaskProgress() {
  const response = await fetch('/api/tasks', { headers: getAuthHeaders({}) });
  const result = await response.json();
  updateTaskProgress(result.data);
}

function updateTaskProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 전체 진행률 프로그레스 바
  document.getElementById('totalProgressBar').style.width = completionRate + '%';
  // 진행 중 (주황 그라데이션)
  document.getElementById('inProgressBar').style.width = Math.round((inProgress/total)*100) + '%';
  // 완료 (초록 그라데이션)
  document.getElementById('completedBar').style.width = completionRate + '%';
}
```

### 4.4 상대 시간 계산 (`getTimeAgo`)

```
< 60초  → '방금 전'
< 1시간 → 'N분 전'
< 1일   → 'N시간 전'
< 7일   → 'N일 전'
그 외   → 'YYYY. M. D.' (ko-KR locale)
```

### 4.5 초기화 시퀀스

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initAuth();         // Phase 2: JWT 토큰 검증
  setActiveMenu();    // 현재 페이지 메뉴 활성화
  loadDashboardData(); // /api/stats/summary → 알림 업데이트
  loadTaskProgress(); // /api/tasks → 진행률 업데이트
});
```

---

## 5. 이슈/해결 (Issues)

| 이슈 | 원인 | 해결 |
|------|------|------|
| 알림 API 없을 때 빈 화면 | `updateAlerts([])` 호출 시 innerHTML을 빈 메시지로 교체 | API 실패 또는 빈 배열인 경우 조건 분기로 기본 정적 HTML 유지 |
| XSS 취약점 위험 | 서버 알림 메시지를 `innerHTML`에 직접 삽입 | `escapeHtml()` 함수로 `<>&"'` 이스케이프 처리 |
| 모바일 KPI 그리드 레이아웃 | 8개 카드가 768px에서 1열이 되면 너무 길어짐 | `@media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr 1fr } }` 로 2열 유지 |
| 진행률 NaN | tasks 배열이 비어있을 때 `completed/0` 계산 | `total > 0` 조건 가드로 0% 기본값 처리 |
| 진행 중 / 완료율 동일 값 | `inProgressRate`와 `completedRate`가 같은 계산 로직 | `inProgressRate = inProgress/total`, `completedRate = completed/total`로 명확히 분리 |

---

## 6. 연계사항 (Dependencies)

- **Phase 2 (인증)**: `getAuthHeaders()`, `handleAuthError()`, `initAuth()` 사용 — 대시보드 진입 시 JWT 검증
- **Phase 3 (통계 API)**: `/api/stats/summary` 엔드포인트 소비 — notifications 배열로 알림 패널 구성
- **Phase 4 (태스크 관리)**: `/api/tasks` 엔드포인트 소비 — 태스크 진행률 계산
- **Phase 5 (모바일)**: `nav.js` 스크립트로 햄버거 메뉴 활성화, design-system.css 모바일 그리드 규칙 활용
- **향후 WebSocket**: 현재 `DOMContentLoaded`에서 1회만 로드. 실시간 push를 위해서는 WebSocket 또는 polling 도입 필요

---

## 7. 향후 과제 (TODO)

- [ ] **실시간 polling**: `setInterval(loadDashboardData, 30000)` 로 30초마다 자동 갱신
- [ ] **WebSocket 연동**: SSE(Server-Sent Events) 또는 WebSocket으로 서버 push 기반 실시간 알림
- [ ] **KPI 동적 바인딩**: 현재 KPI 카드 값이 하드코딩됨 → `/api/stats/summary` 응답으로 DOM 업데이트
- [ ] **알림 읽음 처리**: 알림 클릭 시 읽음 표시, 뱃지 카운트 감소
- [ ] **KPI 목표값 설정**: 각 지표에 목표값 라인 표시 (예: 지지도 목표 50%)
- [ ] **KPI 히스토리 차트**: 카드 클릭 시 주간 추이 미니 차트 오버레이
- [ ] **알림 필터**: 유형별 (업데이트/긴급/달성) 필터링 버튼
- [ ] **대시보드 레이아웃 커스터마이징**: 드래그앤드롭으로 KPI 카드 순서/표시 여부 설정
