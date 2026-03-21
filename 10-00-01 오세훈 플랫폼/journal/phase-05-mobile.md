# Phase 5 — 모바일 최적화 및 반응형 네비게이션

**커밋**: `f236459`
**날짜**: 2026-03-19
**담당**: Bravo 분대
**파일 수**: 9개 변경 (273 lines 추가)

---

## 1. 임무 (What)

전체 7개 페이지에 **공통 반응형 네비게이션**을 적용하고, 모바일 터치 UX를 최적화한다.

- `js/nav.js`: 햄버거 메뉴 자동 생성 및 제어 스크립트 (93 lines)
- `styles/design-system.css`: 3단계 브레이크포인트 반응형 스타일 추가 (173 lines)
- `pages/*.html` 7개: `<script src="../js/nav.js">` 태그 추가

---

## 2. 배경/맥락 (Why)

Phase 1~4를 거치며 대시보드, 정보, 전략, 선거지도, AI 어시스턴트, 태스크 등 6개 페이지가 완성됐다. 그러나 모든 페이지는 데스크톱 중심으로 설계되어 있었고, **선거 현장 스태프의 주 디바이스는 스마트폰**이다.

캠프 현장에서 빠르게 태스크 상태를 확인하거나 판세 데이터를 조회할 때 데스크톱 레이아웃은 사용하기 어렵다. Phase 5는 이 현장 운용 요건을 충족하기 위한 **모바일 퍼스트 보강 작업**이다.

---

## 3. 설계 결정 (Decisions)

| 결정 | 선택 | 이유 |
|------|------|------|
| JS 분리 | `nav.js` 독립 파일 | 7개 페이지에 동일 로직 중복 작성 방지, 수정 단일 지점 |
| 햄버거 버튼 생성 방식 | JS로 DOM 동적 생성 | HTML 템플릿 수정 없이 스크립트 한 줄로 기존 페이지에 삽입 가능 |
| 중단점 3단계 | 768px / 1024px / 1025px+ | 모바일(≤768) / 태블릿(769~1024) / 데스크톱(1025+) |
| 터치 최적화 | `@media (hover: none) and (pointer: coarse)` | 실제 터치 디바이스 감지, hover-only 스타일 비활성화 |
| 입력 폼 폰트 16px | `font-size: 16px` on input | iOS Safari의 자동 확대 줌 방지 (16px 미만 시 자동 확대) |
| 최소 탭 영역 | `min-height: 44px; min-width: 44px` | Apple HIG 권고 기준, 터치 오류 최소화 |
| 메뉴 열림 시 스크롤 잠금 | `document.body.style.overflow = 'hidden'` | 메뉴 오버레이 뒤 페이지 스크롤 방지 |
| 리사이즈 디바운스 | `setTimeout 250ms` | 데스크톱 전환 시 resize 이벤트 과다 발생 방지 |

**JS 동적 생성 vs HTML 수정 결정**: 기존 7개 페이지의 HTML `<nav>` 구조를 일일이 수정하면 실수 리스크가 높다. `nav.js`가 `DOMContentLoaded` 시점에 `.navbar-content` 를 찾아 햄버거 버튼을 `insertBefore`로 삽입하는 방식은 기존 마크업을 건드리지 않아 안전하다.

---

## 4. 구현 상세 (How)

### 4.1 `nav.js` 핵심 로직

```javascript
function initMobileNav() {
  const navbar = document.querySelector('.navbar');
  const navbarMenu = document.querySelector('.navbar-menu');
  if (!navbar || !navbarMenu) return;
  if (document.querySelector('.hamburger-btn')) return; // 중복 방지

  // 햄버거 버튼 생성 및 ARIA 속성 설정
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.setAttribute('aria-label', '메뉴');
  hamburgerBtn.setAttribute('aria-expanded', 'false');

  // 메뉴 열림 시 body 스크롤 잠금
  function openMobileMenu(btn, menu) {
    menu.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  // 화면 밖 클릭 감지
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) closeMobileMenu(...);
  });

  // 리사이즈 디바운스 (768px 초과 시 메뉴 닫기)
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) closeMobileMenu(...);
    }, 250);
  });
}
```

### 4.2 CSS 브레이크포인트 구조

```
@media (max-width: 768px)        # 모바일: 햄버거 메뉴, 1열 그리드, 오버레이
@media (max-width: 1024px)       # 태블릿: 2열 그리드, 부분 수평 메뉴
@media (min-width: 1025px)       # 데스크톱: 풀 레이아웃
@media (hover: none) and (pointer: coarse)  # 터치 디바이스 전용
@media (prefers-reduced-motion: reduce)     # 접근성: 애니메이션 비활성화
```

### 4.3 햄버거 애니메이션

CSS transition으로 3개의 `.hamburger-line`이 X 모양으로 변형:
- Line 1: `rotate(45deg) translate(8px, 8px)`
- Line 2: `opacity: 0`
- Line 3: `rotate(-45deg) translate(7px, -7px)`

### 4.4 적용 페이지 (7개)

`dashboard.html`, `intelligence.html`, `strategy.html`, `electionmap.html`, `winningtrategy.html`, `ai-assistant.html`, `tasks.html` — 각 페이지 하단에 `<script src="../js/nav.js"></script>` 1줄 추가.

---

## 5. 이슈/해결 (Issues)

| 이슈 | 원인 | 해결 |
|------|------|------|
| iOS Safari 입력 자동 줌 | 16px 미만 폰트 크기의 input 필드 | 모바일 미디어쿼리 내 `input, textarea, select { font-size: 16px }` 적용 |
| 메뉴 열림 후 배경 스크롤 | 오버레이 뒤 페이지가 스크롤 가능 | `openMobileMenu` 시 `document.body.style.overflow = 'hidden'`, 닫힐 때 복원 |
| 빠른 resize 이벤트 폭주 | resize가 연속으로 수십 회 발생 | `setTimeout(fn, 250)` 디바운스로 최종 값에만 반응 |
| 기존 페이지 구조 다름 | 일부 페이지에 `.navbar-content`가 없는 경우 | `if (!navbarContent) return` 가드 조건으로 graceful degradation |
| 햄버거 버튼 중복 삽입 | SPA-like 페이지 전환 시 `initMobileNav` 재호출 | 함수 진입 초반에 `.hamburger-btn` 존재 여부 확인 후 early return |

---

## 6. 연계사항 (Dependencies)

- **Phase 4 (태스크 관리)**: `tasks.html`에 nav.js 적용됨 — Phase 4와 Phase 5 커밋이 연속적으로 발생
- **Phase 6 (KPI 대시보드)**: `dashboard.html`에 nav.js 적용됨, Phase 6의 알림 패널도 모바일 세로 정렬 스타일이 design-system.css에 의존
- **design-system.css**: 전체 프로젝트의 공통 스타일 파일. Phase 5에서 모바일 관련 섹션이 대규모 추가됨 — 이후 Phase에서 이 파일 수정 시 모바일 스타일 충돌 주의

---

## 7. 향후 과제 (TODO)

- [ ] **480px 초소형 브레이크포인트**: 현재 480px 이하 별도 처리 없음 — 구형 스마트폰 대응
- [ ] **PWA 지원**: 오프라인 캐싱으로 현장 네트워크 불안정 환경 대응 (`service-worker.js`)
- [ ] **스와이프 제스처**: 모바일에서 좌우 스와이프로 메뉴 열기/닫기
- [ ] **다크 모드**: `@media (prefers-color-scheme: dark)` 대응
- [ ] **네비게이션 활성 상태**: 현재 페이지에 해당하는 메뉴 항목 `.active` 자동 표시
- [ ] **포커스 트랩**: 메뉴 열림 시 Tab 키가 메뉴 내부에서만 순환되도록 접근성 강화
- [ ] **성능 측정**: Lighthouse 모바일 점수 측정 및 CLS/LCP 최적화
