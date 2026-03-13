---
description: "테마 색상 디자인 — 브랜드 컬러 팔레트 설계, 프리미엄 화이트 / 라이트 테마, CSS 변수 자동 생성 (WCAG 준수)"
user-invocable: true
---

# /theme-color-design — 테마 색상 디자인

프로젝트의 **브랜드 컬러 팔레트**를 설계하고, **프리미엄 화이트 / 라이트 테마**를 구성하며, **CSS 변수**를 자동 생성한다.
WCAG 2.1 접근성 기준(명도 대비)을 준수하고, 일관된 디자인 시스템 토큰을 출력한다.

## Usage
/theme-color-design [brand_color_or_keyword]

## Phase 1. 브랜드 분석

### 인자가 있는 경우
- **컬러 코드 지정** (예: `#2563eb`): 해당 색상을 Primary로 팔레트 확장
- **키워드 지정** (예: `의료`, `교육`, `쇼핑`): 업종에 맞는 색상 자동 제안

### 인자가 없는 경우
- 프로젝트 컨텍스트(목적, 사용자, 기능)를 분석하여 최적 색상 방향 제안
- AskUserQuestion으로 선호 색상 계열 확인

### 분석 보고
```
🎨 브랜드 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
프로젝트: {프로젝트명}
업종/목적: {분석 결과}
색상 방향: {차갑다/따뜻하다/중립적} / {활기찬/신뢰/전문적}
Primary 후보: {색상 3개 제안}
```

## Phase 2. 컬러 팔레트 생성

Primary 색상 기준으로 전체 팔레트를 생성한다.

### 팔레트 구성
| 토큰 | 역할 | 라이트 | 다크 |
|------|------|--------|------|
| --color-primary | 주요 액션, 버튼 | {hex} | {hex} |
| --color-primary-hover | 호버 상태 | {hex} | {hex} |
| --color-primary-light | 배경 강조 | {hex} | {hex} |
| --color-secondary | 보조 색상 | {hex} | {hex} |
| --color-success | 성공/완료 | {hex} | {hex} |
| --color-warning | 경고 | {hex} | {hex} |
| --color-error | 오류 | {hex} | {hex} |
| --color-bg | 페이지 배경 | {hex} | {hex} |
| --color-bg-2 | 카드/섹션 배경 | {hex} | {hex} |
| --color-border | 테두리 | {hex} | {hex} |
| --color-text | 본문 텍스트 | {hex} | {hex} |
| --color-text-2 | 보조 텍스트 | {hex} | {hex} |
| --color-text-3 | 비활성 텍스트 | {hex} | {hex} |

### WCAG 명도 대비 검증
- 본문 텍스트: **4.5:1 이상** (AA 기준)
- 큰 텍스트/아이콘: **3:1 이상**
- 각 조합 대비 비율 출력 및 Pass/Fail 표시

## Phase 3. CSS 변수 생성

### 라이트 테마
```css
:root {
  /* Primary */
  --color-primary:        {hex};
  --color-primary-hover:  {hex};
  --color-primary-light:  {hex};

  /* Semantic */
  --color-secondary:      {hex};
  --color-success:        {hex};
  --color-warning:        {hex};
  --color-error:          {hex};

  /* Background */
  --color-bg:             {hex};
  --color-bg-2:           {hex};
  --color-bg-3:           {hex};

  /* Border */
  --color-border:         {hex};
  --color-border-strong:  {hex};

  /* Text */
  --color-text:           {hex};
  --color-text-2:         {hex};
  --color-text-3:         {hex};
}
```

### 프리미엄 화이트 테마
```css
[data-theme="premium-white"] {
  --color-primary:        {hex};
  /* 라이트와 동일 구조, 프리미엄 화이트 모드 값으로 재정의 */
}
```

### Tailwind Config (선택)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      }
    }
  }
}
```

## Phase 4. 컴포넌트 적용 가이드

### 버튼
```css
.btn-primary {
  background: var(--color-primary);
  color: #fff;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}
```

### 카드
```css
.card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
}
```

### 프리미엄 화이트 모드 토글 (JS)
```js
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme: isPremium ? "light" : "premium-white"';
  document.documentElement.setAttribute('data-theme', isPremium ? "light" : "premium-white");
  localStorage.setItem('theme', isPremium ? "light" : "premium-white");
}
const saved = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', saved);
```

## Phase 5. 최종 보고

```
✅ 테마 색상 디자인 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary:    {hex} ({색상명})
팔레트:     13개 토큰 생성
WCAG:       본문 {대비비율}:1 ✅ / 아이콘 {대비비율}:1 ✅
테마:       라이트 + 프리미엄 화이트 모드
출력 파일:  theme.css (또는 직접 삽입)

적용 방법:
  1. CSS 변수를 globals.css 또는 index.css에 붙여넣기
  2. data-theme: isPremium ? "light" : "premium-white"" 토글 스크립트 추가
  3. 기존 하드코딩 색상을 var(--color-*) 로 교체
```
