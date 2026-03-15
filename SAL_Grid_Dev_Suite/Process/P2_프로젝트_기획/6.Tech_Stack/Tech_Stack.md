# P2-6. Tech Stack — Vibe Coding OS (VCOS)

> 작성일: 2026-03-16 | 버전: 1.0

---

## 결정된 기술 스택

### Frontend (화면/UI)

| 기술 | 선택 이유 |
|------|---------|
| **HTML5** | 외부 의존성 없는 순수 마크업, 어디서든 열림 |
| **CSS3 (vcos.css)** | 통합 디자인 시스템, CSS 변수로 테마 관리 |
| **Vanilla JavaScript** | 프레임워크 없는 순수 JS, 빠른 로드, 단순 구조 |
| **localStorage** | 브라우저 내 프로젝트 상태 저장 (서버 불필요) |

### 배포

| 기술 | 선택 이유 |
|------|---------|
| **GitHub Pages** | 무료, 즉시 배포, 도메인 제공 |
| **정적 HTML** | 서버 비용 $0, CDN 자동 적용 |

### 외부 연동 (미래)

| 기술 | 상태 | 용도 |
|------|------|------|
| **Supabase** | 파일 준비 (supabase.js) | 향후 사용자 데이터 저장 |
| **Claude API** | 미구현 | AI 직접 연동 검토 |

---

## 기술 결정 배경

### "왜 React/Next.js가 아닌가?"

```
✅ VCOS 선택: Vanilla HTML/CSS/JS
   - 진입장벽 없음: 파일 더블클릭으로 즉시 실행
   - 외부 의존성 없음: npm install 불필요
   - 빠른 로드: 번들링/트랜스파일링 없음
   - 투명성: 모든 코드가 그대로 보임

❌ React 미선택 이유:
   - node_modules 의존성으로 복잡도 증가
   - 빌드 파이프라인 필요
   - VCOS의 "단순하게 시작" 철학과 불일치
```

### 브라우저 localStorage 전략

```javascript
// 프로젝트 데이터 저장 구조
{
  name: "프로젝트명",
  goal: "목표",
  stack: "기술스택",
  complexity: { ui: 3, backend: 2, ... },
  squads: [...],
  skills: [...],
  ...
}
```

- 새로고침해도 데이터 유지
- 서버 없이 상태 관리
- 개인 데이터 서버 미전송 (프라이버시)

---

## 파일 구조

```
/c/01 Claude-Code/10 Vibe Coding OS/
├── index.html          ← 메인 대시보드
├── vcos.css            ← 통합 디자인 시스템 (공유)
├── vcos.js             ← 공유 컴포넌트 + 로직
├── supabase.js         ← Supabase 클라이언트 (예비)
├── pages/
│   ├── 01-intent.html      ← Phase 1 Step 1
│   ├── 02-ai-collab.html   ← Phase 1 Step 2
│   ├── 03-complexity.html  ← Phase 1 Step 3
│   ├── 04-squad.html       ← Phase 1 Step 4
│   ├── 05-skills.html      ← Phase 1 Step 5
│   ├── 06-token.html       ← Phase 1 Step 6
│   ├── 07-command.html     ← Phase 1 Step 7 (최종 명령어)
│   ├── 07-refinement.html  ← Phase 2 엔진
│   ├── 08-sal-grid.html    ← Phase 2 SAL Grid
│   ├── 09-debug-loop.html  ← Phase 2 디버그
│   ├── 10-slideshow.html   ← Phase 2 슬라이드쇼
│   ├── 11-youtube.html     ← Phase 2 유튜브
│   ├── manual.html         ← 매뉴얼
│   ├── skills-map.html     ← 스킬 맵
│   └── sitemap.html        ← 사이트맵
└── scripts/
    ├── setup-hooks.js      ← Pre-commit Hook 설치
    └── sync-to-root.js     ← Stage → Root 동기화
```

---

## 코딩 컨벤션

| 항목 | 규칙 |
|------|------|
| 파일명 | `kebab-case.html` |
| CSS 클래스 | `kebab-case` |
| JS 함수 | `camelCase()` |
| 색상 변수 | CSS 변수 (`--color-name`) |
| Phase 색상 | P1=blue, P2=orange, P3=indigo, P4=rose, P5=purple, P6=amber |
