# Phase 4 — 스태프 협업 태스크 관리 시스템

**커밋**: `62905f1`
**날짜**: 2026-03-19
**담당**: Bravo 분대
**파일 수**: 3개 신규 (942 lines)

---

## 1. 임무 (What)

선거 캠프 스태프들이 공동으로 사용할 **태스크 관리 시스템**을 구축한다.

- `pages/tasks.html`: 칸반 스타일 UI (태스크 생성 폼 + 리스트 + 필터)
- `server/routes/tasks.js`: RESTful CRUD API 6개 엔드포인트
- `server/index.js`: tasksRouter 마운트 (`/api/tasks`)

---

## 2. 배경/맥락 (Why)

Phase 1~3에서 Gemini AI 분석, 인증, 통계 API를 구축했으나, **캠프 내부 운영 도구**가 없었다. 선거 캠프는 지역별 전략팀·정책팀·데이터팀이 동시에 활동하기 때문에 진행 현황 공유와 마감일 관리가 필수적이다.

기존에는 구두·메신저로 업무를 분배했으나, 담당자 파악 및 우선순위 관리가 불투명했다. Phase 4는 이 공백을 채우기 위한 **내부 협업 레이어**다.

---

## 3. 설계 결정 (Decisions)

| 결정 | 선택 | 이유 |
|------|------|------|
| UI 패턴 | 리스트형 (칸반 아님) | MVP 단계에서 복잡한 드래그앤드롭보다 빠른 전달 우선 |
| 데이터 저장 | 인메모리 더미 데이터 | DB 스키마 확정 전 프로토타이핑 속도 우선 |
| 인증 | `verifyToken` 미들웨어 전 엔드포인트 적용 | Phase 2 인증 시스템과 일관성 유지 |
| 상태 순환 | `pending → in-progress → completed` | 단방향 상태 머신으로 혼란 방지 |
| 필터 방식 | 쿼리 파라미터 (`?status=&priority=`) | REST 표준 준수, 클라이언트-서버 분리 |
| 우선순위 | `high / medium / low` 3단계 | 4단계 이상은 현장에서 구별이 어렵다는 운영 경험 |

**칸반 vs 리스트 결정 배경**: 드래그앤드롭은 모바일 터치에서 UX가 열악하다. Phase 5에서 모바일 최적화를 계획하고 있어, 리스트형으로 먼저 구현 후 Phase 6 이후 칸반 컬럼으로 전환하는 단계적 접근을 선택했다.

---

## 4. 구현 상세 (How)

### 4.1 API 엔드포인트 (`server/routes/tasks.js`)

```
GET    /api/tasks              # 전체 조회 (status/priority/assignee 필터)
GET    /api/tasks/:id          # 단건 조회
POST   /api/tasks              # 생성 (title, assignee 필수)
PUT    /api/tasks/:id          # 수정 (status, description, assignee, dueDate, priority)
DELETE /api/tasks/:id          # 삭제
GET    /api/tasks/stats/summary # 통계 (완료율, 고우선순위 개수, 지연 태스크)
```

모든 엔드포인트는 `verifyToken` 미들웨어를 통과해야 한다. 응답은 `sendSuccess` / `sendError` 헬퍼로 일관된 JSON 포맷을 유지한다.

### 4.2 태스크 데이터 구조

```javascript
{
  id: Number,
  title: String,          // 필수
  description: String,
  assignee: String,       // 필수 (팀 단위: '전략팀', '정책팀' 등)
  status: 'pending' | 'in-progress' | 'completed',
  priority: 'high' | 'medium' | 'low',
  due_date: Date,
  created_by: String,
  created_at: Date,
  updated_at: Date
}
```

### 4.3 샘플 데이터 (5개 태스크)

| ID | 제목 | 담당 | 상태 | 우선순위 |
|----|------|------|------|----------|
| 1 | 도봉구 캠프 전략 수정 | 전략팀 | in-progress | high |
| 2 | 강남구 경제정책 강조 자료 | 정책팀 | pending | high |
| 3 | 판세 분석 보고서 | 분석팀 | in-progress | high |
| 4 | 유권자 여론조사 데이터 입력 | 데이터팀 | completed | medium |
| 5 | 캠프 일정 조율 | 일정팀 | pending | medium |

완료율 20% (1/5), 고우선순위 3개 반영.

### 4.4 UI 구성 (`pages/tasks.html`)

- **좌측 사이드바**: 태스크 생성 폼 (sticky 포지션), 필드: 제목·설명·담당자·마감일·우선순위
- **상단 필터 바**: 상태/우선순위 드롭다운 (`onchange="filterTasks()"` 이벤트)
- **태스크 리스트**: 각 항목에 상태 배지, 우선순위 배지, 담당자, 마감일, 상태 순환 버튼
- **API 연동**: `fetch('/api/tasks', { headers: { Authorization: Bearer token } })`
- **인증 처리**: 401/403 응답 시 `login.html`로 자동 리다이렉트

### 4.5 모바일 반응형

768px 이하에서 사이드바(폼)와 태스크 리스트가 세로 스택으로 전환된다.

---

## 5. 이슈/해결 (Issues)

| 이슈 | 원인 | 해결 |
|------|------|------|
| `GET /api/tasks/stats/summary` 라우트 충돌 | Express는 `:id` 파라미터 라우트가 `stats/summary`를 먼저 매칭할 수 있음 | `router.get('/stats/summary', ...)` 를 `router.get('/:id', ...)` **이전**에 선언하여 우선순위 확보 |
| 더미 데이터 중복 | `GET /` 와 `GET /:id` 에 동일 배열이 하드코딩됨 | MVP 단계에서 허용, 향후 DB 연동 시 공통 store 모듈로 분리 예정 |
| 필터 클라이언트-서버 이중화 | UI에서 `filterTasks()`로 DOM 필터링, 서버도 쿼리 파라미터 지원 | 초기에는 클라이언트 필터로 충분하나, 데이터 증가 시 서버 필터로 전환 계획 |

---

## 6. 연계사항 (Dependencies)

- **Phase 2 (인증)**: `verifyToken` 미들웨어 의존. 로그인 없이 API 접근 불가
- **Phase 3 (통계 API)**: `sendSuccess` / `sendError` 헬퍼 공유 (`server/middleware/auth.js`)
- **Phase 6 (KPI 대시보드)**: `GET /api/tasks`와 `GET /api/tasks/stats/summary`를 dashboard.html이 소비하여 태스크 진행률 섹션 렌더링
- **Phase 5 (모바일)**: `nav.js` 스크립트를 `tasks.html` 하단에 추가하여 햄버거 메뉴 활성화

---

## 7. 향후 과제 (TODO)

- [ ] **DB 연동**: 인메모리 더미 데이터를 `campaign_tasks` PostgreSQL/SQLite 테이블로 교체
- [ ] **서브태스크**: 태스크 내 체크리스트 구조 (`task_subtasks` 테이블)
- [ ] **댓글 기능**: 태스크별 스레드 댓글 (`task_comments` 테이블)
- [ ] **담당자 다중 지정**: 현재 단일 문자열 → 배열 + 사용자 ID 참조
- [ ] **실시간 업데이트**: WebSocket 또는 SSE로 다른 사용자 변경 사항 실시간 반영
- [ ] **칸반 보드 전환**: 드래그앤드롭 컬럼 뷰 (데스크톱 전용)
- [ ] **마감일 알림**: Phase 6 알림 패널과 연동하여 D-3, D-1 경고 자동화
