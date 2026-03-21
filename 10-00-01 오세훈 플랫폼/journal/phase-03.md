# Phase 03 — 선거 통계 API 구현

**작성자:** Alpha 분대장
**작성일:** 2026-03-21
**커밋:** `c123013` (최초 구현 — 5개 엔드포인트, mock 데이터) → `916c615` (고도화 — 7개 엔드포인트, PostgreSQL 실제 조회)
**담당 분대:** Alpha 분대 (api-developer + backend-developer)

---

## 1. 임무 (What)

캠프 플랫폼 대시보드와 전략 페이지에서 사용할 **선거 통계 데이터 API**를 구현한다. 지지도 현황, 주간 추이, 자치구별 상세, 경쟁 후보 비교, KPI 요약 등 5개(→고도화 후 7개) RESTful 엔드포인트를 `server/routes/stats.js`에 구축한다.

**파일 산출물:**
- `server/routes/stats.js` — 신규 (318줄 → 고도화 후 700줄+)
- DB 스키마: `election_stats` 관련 4개 테이블 + 시드 데이터 (고도화 시 추가)

---

## 2. 배경/맥락 (Why)

Phase 1~2 완료 후 대시보드와 통계 페이지가 하드코딩된 더미 수치를 보여주고 있었다. 실제 캠프 운영에서는 여론조사 결과를 빠르게 플랫폼에 반영하고 자치구별·연령별 지지도를 분석하는 것이 핵심 업무였다.

**설계 요구사항:**
- 여론조사 데이터를 스냅샷 단위로 누적 저장하는 시계열 구조
- 자치구(25개)별 개별 조회 및 전체 목록 조회 지원
- 경쟁 후보와의 비교 데이터 제공 (선거 전략 수립 용도)
- Phase 6 KPI 대시보드에서 요약 지표 한 번에 가져올 수 있는 summary 엔드포인트

**최초 구현의 한계 (c123013):**
- 모든 데이터가 하드코딩된 JavaScript 객체 (실제 DB 연결 없음)
- 서울시 19개 자치구만 포함 (25개 중 일부)
- 후보자 필터링 없음 (단일 후보 가정)

**고도화 목표 (916c615):**
- PostgreSQL 실제 조회로 전환
- `candidate_id` 파라미터로 다중 후보 지원
- snapshot(스냅샷) 기반 시계열 구조 → 주간 추이 동적 산출

---

## 3. 설계 결정 (Decisions)

| 결정 사항 | 선택 | 이유 |
|---|---|---|
| 데이터 구조 | 스냅샷 기반 시계열 (`election_stats` 테이블) | 여론조사는 시점마다 누적되는 데이터 — 최신 1건만 조회하거나 N주치를 조회할 수 있어야 함 |
| 최신 데이터 조회 | `getLatestSnapshot()` 헬퍼 함수 | 모든 엔드포인트에서 공통으로 사용 → DRY 원칙 적용 |
| 스냅샷 우선순위 | `snapshot_date DESC, created_at DESC` | 같은 날 여러 스냅샷이 있을 경우 가장 최근 것 반환 |
| 지역 유형 구분 | `region_type` 컬럼 (`gu`, `dong`, `ward`) | 자치구·행정동·선거구 등 다양한 단위 통일 관리 |
| 경쟁 분석 구조 | `election_stats_competitors` 별도 테이블 | 동일 stats_id에 여러 후보 연결, JOIN으로 비교 |
| 집계 로직 위치 | 서버사이드 JavaScript 집계 | 복잡한 집계(강세/경합/약세 지역 분류)는 SQL 보다 JS가 가독성 우위 |
| mock → real 전환 전략 | 최초 mock으로 프론트 연동 먼저, 이후 DB 교체 | UI 검증 → DB 구현 순서로 리스크 분산 |

**엔드포인트 설계 원칙:**
- 단일 조회는 쿼리 파라미터(`?region=강남구`)로 필터
- 전체 목록은 필터 없이 호출
- 오류 응답은 공통 `sendError()` 미들웨어로 통일

---

## 4. 구현 상세 (How)

### 4-1. 엔드포인트 목록 (고도화 최종)

```
GET  /api/stats/support      — 지지도 현황 (전국, 지역별, 연령별)
GET  /api/stats/weekly       — 주간 추이 (최근 N주, 기본값 8주)
GET  /api/stats/districts    — 자치구별 상세 (25개 구 전체)
GET  /api/stats/competitive  — 경쟁 후보 비교 (다자대결 구도)
GET  /api/stats/summary      — 대시보드 KPI 요약 (한 번에 핵심 지표)
POST /api/stats/snapshot     — 새 여론조사 스냅샷 등록 (관리자)
PUT  /api/stats/snapshot/:id — 스냅샷 수정 (관리자)
```

### 4-2. 핵심 헬퍼 함수

```javascript
// 후보자 ID 안전 파싱 (기본값 1)
function parseCandidateId(query) {
  const id = parseInt(query.candidate_id || query.candidateId || '1', 10);
  return isNaN(id) || id < 1 ? 1 : id;
}

// 최신 스냅샷 조회 (모든 엔드포인트 공통)
async function getLatestSnapshot(db, candidateId) {
  const result = await db.query(
    `SELECT * FROM election_stats
     WHERE candidate_id = $1
     ORDER BY snapshot_date DESC, created_at DESC
     LIMIT 1`,
    [candidateId]
  );
  return result.rows[0] || null;
}
```

### 4-3. 지지도 조회 흐름 (`GET /api/stats/support`)

1. `parseCandidateId()` → `getLatestSnapshot()` → 스냅샷 없으면 404
2. `region` 파라미터 있으면 `election_stats_by_region` 단일 조회
3. `age_group` 파라미터 있으면 `election_stats_by_age` 단일 조회
4. 파라미터 없으면 `Promise.all([regionQuery, ageQuery])` 병렬 조회
5. 응답 구조: `{ overall, byRegion[], byAgeGroup[] }`

### 4-4. 자치구 분석 집계 (`GET /api/stats/districts`)

PostgreSQL 조회 후 서버에서 집계:
```javascript
const summary = {
  strongRegions: districts.filter(d => d.support >= 45).length,   // 강세 (45%+)
  targetRegions: districts.filter(d => d.support >= 40 && d.support < 45).length, // 경합 (40~45%)
  weakRegions:   districts.filter(d => d.support < 40).length,    // 약세 (~40%)
  averageSupport: parseFloat(avgSupport.toFixed(1)),
  totalDistricts: districts.length,
};
```

### 4-5. DB 테이블 구조 (4개 테이블)

```
election_stats               — 스냅샷 헤더 (전국 단위 지지도)
election_stats_by_region     — 지역별 상세 (stats_id FK)
election_stats_by_age        — 연령별 상세 (stats_id FK)
election_stats_competitors   — 경쟁 후보 비교 (stats_id FK)
```

---

## 5. 이슈/해결 (Issues)

| 이슈 | 원인 | 해결 |
|---|---|---|
| 최초 구현의 mock 데이터 불일치 | 서울 25개 자치구 중 19개만 포함 | 고도화 시 DB 시드 데이터로 25개 전체 포함 |
| `candidate_id` 파라미터 형식 혼용 | 프론트는 `candidateId`, 백은 `candidate_id` | `parseCandidateId()`에서 두 형식 모두 수용 |
| 동일 날짜 복수 스냅샷 | 하루 여러 번 여론조사 결과 입력 가능 | `created_at DESC` 2차 정렬로 최신 것 반환 |
| 집계 수치 소수점 부정확 | JavaScript 부동소수점 오차 | `parseFloat(value.toFixed(1))` 처리 |
| mock → real 전환 시 응답 구조 변경 | 프론트가 mock 구조에 의존 | 응답 키 이름을 mock과 동일하게 유지 (`support`, `favorability` 등) |
| `region_type` 필터 기본값 | 전체 목록 vs 자치구만 | 기본값 `'gu'`로 자치구 단위 반환, 파라미터로 변경 가능 |

---

## 6. 연계사항 (Dependencies)

- **선행 조건:**
  - `server/middleware/auth.js` — `verifyToken`, `sendError`, `sendSuccess`
  - `server/db/schema.sql` — `election_stats` 관련 테이블 4개 생성 필요
  - `req.db` — Express 앱에 PostgreSQL 풀 주입 (server/index.js에서 설정)
- **사용하는 페이지:**
  - `pages/dashboard.html` — KPI 요약 (`/api/stats/summary`)
  - `pages/intelligence.html` — 지역별/연령별 지지도 분석
  - `pages/strategy.html` — 경쟁 후보 비교
  - `pages/electionmap.html` — 자치구별 히트맵 데이터
- **Phase 6 의존:** KPI 대시보드 실시간 업데이트가 `/api/stats/summary` 엔드포인트에 의존

---

## 7. 향후 과제 (TODO)

- [ ] PostgreSQL 시드 데이터 완성 — 실제 여론조사 결과 입력 파이프라인
- [ ] `/api/stats/snapshot` 관리자 인증 강화 — 현재 `verifyToken` 수준, `requiredRole: 'admin'` 추가 필요
- [ ] 캐싱 레이어 도입 — 여론조사 데이터는 수시간 단위 변경이므로 Redis/메모리 캐시로 DB 부하 절감
- [ ] 실시간 업데이트 — WebSocket 또는 Server-Sent Events로 대시보드 자동 갱신
- [ ] 여론조사 기관별 가중치 — `survey_agency` 필드 활용한 신뢰도 가중 평균
- [ ] 오차 범위 시각화 — `margin_of_error` 데이터를 차트에 신뢰구간으로 표시
- [ ] 히스토리 API — 특정 기간 범위(`from`/`to`) 쿼리 파라미터 지원
- [ ] 데이터 내보내기 — CSV/Excel 다운로드 엔드포인트 (`GET /api/stats/export`)
