# P2-5. Design System — Vibe Coding OS (VCOS)

> 작성일: 2026-03-16 | 버전: 1.0 | 소스: vcos.css 분석

---

## 1. 색상 시스템

### Phase 컬러 팔레트

| Phase | 역할 | 주 색상 | 배경 | 사용처 |
|-------|------|--------|------|--------|
| **P1 — Intent** | 파란색 | `#2563eb` | `#eff6ff` | 01-intent |
| **P2 — AI Collab** | 청록색 | `#0d9488` | `#f0fdfa` | 02-ai-collab |
| **P3 — Complexity** | 주황색 (amber) | `#d97706` | `#fffbeb` | 03-complexity |
| **P4 — Squad** | 보라색 | `#7c3aed` | `#f5f3ff` | 04-squad |
| **P5 — Skills** | 초록색 | `#16a34a` | `#f0fdf4` | 05-skills |
| **P6 — Token** | 분홍색 | `#db2777` | `#fdf2f8` | 06-token |
| **Phase Banner P2** | 주황색 (phase 2) | `#ea580c` | gradient | 07-refinement |
| **Phase Banner P3** | 인디고 | `#4338ca` | gradient | 08-sal-grid |
| **Phase Banner P4** | 로즈 | `#e11d48` | gradient | 09-debug-loop |
| **Phase Banner P5** | 퍼플 | `#7c3aed` | gradient | 10-slideshow |
| **Phase Banner P6** | 앰버 | `#f59e0b` | gradient | 11-youtube |

### 공통 색상

```css
--bg-primary:   #0f172a  /* 다크 배경 */
--bg-card:      #1e293b  /* 카드 배경 */
--text-primary: #f1f5f9  /* 기본 텍스트 */
--text-muted:   rgba(241,245,249,0.6)  /* 보조 텍스트 */
--border:       rgba(255,255,255,0.1)  /* 테두리 */
```

---

## 2. 타이포그래피

| 용도 | 폰트 크기 | 굵기 |
|------|---------|------|
| 페이지 제목 | 28~32px | 800 |
| 섹션 제목 | 20~22px | 700 |
| 본문 | 15~16px | 400 |
| 보조 텍스트 | 13~14px | 400 |
| 버튼 | 14~15px | 600 |

---

## 3. 컴포넌트 시스템

### .phase-banner (페이지 상단 배너)

```css
.phase-banner {
  background: linear-gradient(135deg, 색상1, 색상2, 색상3);
  box-shadow: 0 4px 24px rgba(색상, .3);
  padding: 32px 40px;
  border-radius: 0 0 24px 24px;
}
```

### .page-hero (페이지 제목 영역)

```html
<div class="page-hero">
  <div class="page-hero-icon">아이콘</div>
  <div class="page-hero-badge">PHASE N</div>
  <div class="page-hero-name">페이지 이름</div>
  <div class="page-hero-desc">설명 문구</div>
</div>
```

### .footer-nav (푸터 메뉴)

```
[Phase 1 메뉴]    [Phase 2~6 메뉴]   [버튼 2열 그리드]
 • P1 인텐트       • P2 고도화엔진     🏠홈   ✏️프로젝트
 • P2 AI 협업      • P3 SAL Grid     ⚡명령어  🔥고도화
 • P3 복잡도       • P4 디버그루프    🗺구조도  📖매뉴얼
 • P4 분대편성     • P5 슬라이드쇼    🗂️SAL22  ⚡25스킬
 • P5 스킬전략     • P6 유튜브
 • P6 토큰최적화
 • P7 명령어생성
```

### 버튼 시스템

```css
.btn          /* 기본 버튼 */
.btn-primary  /* 강조 버튼 (파란색) */
.btn-secondary /* 보조 버튼 */
.btn-sm       /* 소형 버튼 */
```

---

## 4. 레이아웃 원칙

- **최대 너비**: 900px (콘텐츠 영역)
- **패딩**: 24px (모바일) / 40px (데스크탑)
- **카드 radius**: 16px
- **그리드**: CSS Grid + Flexbox 혼용

---

## 5. 다크 테마

전체 플랫폼이 다크 테마 기준으로 설계됨:
- 배경: `#0f172a` (slate-900)
- 카드: `#1e293b` (slate-800)
- 텍스트: `#f1f5f9` (slate-100)
