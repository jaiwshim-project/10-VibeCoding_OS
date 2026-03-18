# 오세훈 플랫폼 — UI 컴포넌트 라이브러리 & 디자인 시스템

**문서 버전**: 1.0
**작성**: Alpha Squad (1분대)
**날짜**: 2026-03-19

---

## 1. 색상 팔레트

### Primary Colors (주 색상)
- **기본 파란색**: `#0066CC` (텍스트, 링크, CTA 버튼)
- **라이트 파란색**: `#E6F2FF` (배경, 하이라이트)

### Secondary Colors (보조 색상)
- **회색 어두움**: `#4B5563` (부제목, 보조 텍스트)
- **회색 밝음**: `#F0F3F7` (배경, 테두리)

### Semantic Colors (의미 색상)
- **성공**: `#22C55E` (초록색)
- **경고**: `#F59E0B` (주황색)
- **에러**: `#EF4444` (빨강색)
- **정보**: `#3B82F6` (파랑색)

### Dark Mode
```css
:root[data-theme="dark"] {
  --bg-primary: #1F2937;
  --bg-secondary: #111827;
  --text-primary: #F3F4F6;
  --text-secondary: #D1D5DB;
}
```

---

## 2. 타이포그래피

### 글꼴
- **주 글꼴**: `'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **코드**: `'Monaco', 'Menlo', 'Courier New', monospace`

### 텍스트 스타일

| 용도 | 크기 | 굵기 | 줄높이 |
|------|------|------|--------|
| H1 (페이지 제목) | 32px | 800 | 1.2 |
| H2 (섹션 제목) | 24px | 700 | 1.3 |
| H3 (소제목) | 18px | 600 | 1.4 |
| 본문 | 14px | 400 | 1.6 |
| 작은 텍스트 | 12px | 400 | 1.5 |
| 버튼 | 14px | 600 | 1.5 |

---

## 3. 스페이싱 (Padding & Margin)

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

---

## 4. 코어 컴포넌트

### 4.1 Button (버튼)

**기본 사용:**
```html
<button class="btn btn-primary">확인</button>
<button class="btn btn-secondary">취소</button>
<button class="btn btn-danger">삭제</button>
<button class="btn btn-disabled" disabled>비활성</button>
```

**CSS:**
```css
.btn {
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0066CC;
  color: white;
}

.btn-primary:hover {
  background-color: #0052A3;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #F0F3F7;
  color: #4B5563;
}

.btn-danger {
  background-color: #EF4444;
  color: white;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 4.2 Card (카드)

**기본 사용:**
```html
<div class="card">
  <div class="card-header">
    <h3>정책 제목</h3>
  </div>
  <div class="card-body">
    <p>정책 설명...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">상세보기</button>
  </div>
</div>
```

**CSS:**
```css
.card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid #E5E7EB;
}

.card-body {
  padding: var(--space-4);
}

.card-footer {
  padding: var(--space-4);
  background-color: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}
```

---

### 4.3 Input (입력 필드)

**기본 사용:**
```html
<input type="text" class="input" placeholder="검색어 입력">
<input type="email" class="input" placeholder="이메일">
<textarea class="input" placeholder="메시지"></textarea>
```

**CSS:**
```css
.input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #0066CC;
  box-shadow: 0 0 0 3px #E6F2FF;
}

.input:disabled {
  background-color: #F3F4F6;
  cursor: not-allowed;
}
```

---

### 4.4 Badge (배지)

**기본 사용:**
```html
<span class="badge badge-primary">경제</span>
<span class="badge badge-success">완료</span>
<span class="badge badge-warning">진행중</span>
<span class="badge badge-danger">미완료</span>
```

**CSS:**
```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-primary {
  background-color: #E6F2FF;
  color: #0066CC;
}

.badge-success {
  background-color: #DCFCE7;
  color: #22C55E;
}

.badge-warning {
  background-color: #FEF3C7;
  color: #F59E0B;
}

.badge-danger {
  background-color: #FEE2E2;
  color: #EF4444;
}
```

---

### 4.5 Modal (모달)

**기본 사용:**
```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2>정책 상세</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <p>정책 내용...</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">닫기</button>
      <button class="btn btn-primary">저장</button>
    </div>
  </div>
</div>
```

**CSS:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6B7280;
}

.modal-body {
  padding: var(--space-6);
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid #E5E7EB;
  background-color: #F9FAFB;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

---

### 4.6 Navigation (네비게이션)

**기본 사용:**
```html
<nav class="navbar">
  <div class="navbar-logo">오세훈 플랫폼</div>
  <ul class="navbar-menu">
    <li><a href="/" class="nav-link active">홈</a></li>
    <li><a href="/profile" class="nav-link">프로필</a></li>
    <li><a href="/policies" class="nav-link">정책</a></li>
    <li><a href="/news" class="nav-link">뉴스</a></li>
  </ul>
  <button class="navbar-toggle">☰</button>
</nav>
```

**CSS:**
```css
.navbar {
  background-color: white;
  border-bottom: 1px solid #E5E7EB;
  padding: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-logo {
  font-size: 20px;
  font-weight: 800;
  color: #0066CC;
}

.navbar-menu {
  display: flex;
  gap: var(--space-6);
  list-style: none;
}

.nav-link {
  color: #4B5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #0066CC;
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .navbar-toggle {
    display: block;
  }

  .navbar-menu {
    display: none;
  }
}
```

---

## 5. CSS 변수 정의

**기본 파일 (`styles/variables.css`):**
```css
:root {
  /* Colors */
  --primary: #0066CC;
  --primary-light: #E6F2FF;
  --secondary: #4B5563;
  --border: #E5E7EB;
  --bg-light: #F9FAFB;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography */
  --font-family: 'Noto Sans KR', sans-serif;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-weight-normal: 400;
  --font-weight-bold: 600;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition: all 0.2s ease;
}
```

---

## 6. 반응형 설계 규칙

### Breakpoints
```css
@media (max-width: 640px) {
  /* 모바일 스타일 */
}

@media (min-width: 641px) and (max-width: 1024px) {
  /* 태블릿 스타일 */
}

@media (min-width: 1025px) {
  /* 데스크톱 스타일 */
}
```

---

## 7. 접근성 (A11y) 요구사항

### 기본 규칙
```css
/* 포커스 상태 시각화 */
button:focus,
input:focus,
a:focus {
  outline: 2px solid #0066CC;
  outline-offset: 2px;
}

/* 색상만으로 정보 전달 금지 */
.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status::before {
  content: '●'; /* 텍스트 표현 */
}
```

### ARIA 속성
```html
<!-- 버튼 -->
<button aria-label="메뉴 열기">☰</button>

<!-- 폼 라벨 -->
<label for="email">이메일</label>
<input id="email" type="email">

<!-- 아이콘 버튼 -->
<button aria-label="검색"><i class="icon-search"></i></button>
```

---

**이 디자인 시스템은 Bravo, Charlie, Echo, Foxtrot이 모두 참고하여 일관성 있는 UI를 구현해야 합니다.**

