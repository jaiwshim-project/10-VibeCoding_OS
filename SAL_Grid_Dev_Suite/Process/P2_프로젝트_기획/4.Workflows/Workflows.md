# P2-4. Workflows — Vibe Coding OS (VCOS)

> 작성일: 2026-03-16 | 버전: 1.0

---

## 1. 데이터 흐름 (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                      데이터 흐름                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  사용자 입력 → 01-intent                                    │
│       ↓                                                     │
│  localStorage ["vcosProject"] ← 모든 단계가 읽고 씀        │
│       ↓                                                     │
│  02 → 03 → 04 → 05 → 06 → 08-command                       │
│       각 단계에서 데이터 누적/보완                           │
│       ↓                                                     │
│  08-command: 모든 데이터 통합 → 명령어 생성                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. localStorage 데이터 스키마

```javascript
// localStorage key: "vcosProject"
{
  // 01-intent
  name: "프로젝트명",
  goal: "프로젝트 목표",
  stack: "기술 스택",

  // 03-complexity
  complexity: {
    ui: 1-5,        // UI 복잡도
    backend: 1-5,   // 백엔드 복잡도
    ai: 1-5,        // AI 활용도
    integration: 1-5, // 통합 복잡도
    data: 1-5,      // 데이터 복잡도
    security: 1-5   // 보안 요구사항
  },
  complexityTotal: 0-30,
  projectType: "Simple"|"Standard"|"Complex"|"Enterprise",

  // 04-squad
  squads: [
    { name: "HQ", role: "...", agents: [...] },
    { name: "Alpha Squad", role: "...", agents: [...] },
    ...
  ],

  // 05-skills
  skills: {
    phase1: [...],  // 선택된 Phase 1 스킬
    phase2: [...]   // 선택된 Phase 2 스킬
  },

  // 06-token
  tokenStrategy: "Balanced"|"Economy"|"Premium"
}
```

---

## 3. 컴포넌트 공유 워크플로우

### vcos.js 공유 함수

```
각 HTML 페이지
      ↓ <script src="../vcos.js">
buildHeader()  → 상단 헤더 렌더링
buildNav(activeNum) → 단계별 네비게이션
buildFooter()  → 하단 푸터 (메뉴 2열 + 버튼 2열 그리드)
saveProject()  → localStorage 저장
loadProject()  → localStorage 불러오기
calcComplexity() → 복잡도 계산
buildSquads()  → 분대 자동 구성
getRelevantSkills() → 스킬 자동 선택
```

### vcos.css 디자인 시스템

```
.phase-banner   → 각 페이지 상단 배너 (phase별 색상)
.page-hero      → 페이지 제목/설명 영역
.footer-nav     → 푸터 왼쪽 메뉴 (2열)
.footer-actions → 푸터 오른쪽 버튼 (2열 그리드)
```

---

## 4. 개발 워크플로우 (SAL Grid 도입 후)

```
기능 개발
      ↓
Process/S?_{Stage}/{Area}/ 에 파일 저장 (원본)
      ↓
git commit
      ↓
Pre-commit Hook 자동 실행 (sync-to-root.js)
      ↓
pages/ 또는 루트로 자동 복사 (배포용)
      ↓
GitHub Pages 자동 반영
```

---

## 5. 소급도입 Stage 매핑 계획

| Stage | 이름 | 대상 파일 | 상태 |
|-------|------|----------|------|
| S0 | SAL Grid 생성 | TASK_PLAN, JSON, Viewer | 진행 중 |
| S1 | 공유 인프라 | vcos.js, vcos.css, index.html | 소급 완료 |
| S2 | Phase 1 핵심 | 01~06 + 08-command | 소급 완료 |
| S3 | Phase 2 고도화 | 07-refinement ~ 11-youtube | 소급 완료 |
| S4 | 문서/유틸리티 | manual, skills-map, sitemap | 소급 완료 |
