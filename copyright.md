# 저작권 등록용 프로그램 명세서 생성 (copyright.html)

한국저작권위원회 저작권 등록 신청에 필요한 프로그램 명세서를 자동 생성한다.
대상 프로젝트를 분석하여 copyright.html (7탭 구조) + 메타태그 + footer 저작권 표기 + README.md + SVG 아키텍처 구조도를 일괄 생성한다.

---

## Phase 1. 프로젝트 분석 (데이터 수집)

### Step 1: 기본 정보 수집
대상 프로젝트 폴더를 지정받고 다음 정보를 자동 수집한다.

```bash
# 1. Git 첫 커밋 날짜 (창작연월일)
git log --reverse --format="%ai" | head -1

# 2. Git 최종 커밋 날짜 (최종수정일)
git log --format="%ai" | head -1

# 3. 총 커밋 수
git rev-list --count HEAD

# 4. Git 커밋 이력 (마일스톤용)
git log --reverse --format="%ad | %s" --date=short | head -20

# 5. 소스 파일 수
find . -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.svg" | grep -v node_modules | grep -v ".git" | wc -l

# 6. 총 소스코드 줄 수
find . \( -name "*.html" -o -name "*.js" -o -name "*.css" \) ! -path "./.git/*" -exec cat {} + | wc -l

# 7. 파일별 줄 수 (상위 25개)
find . \( -name "*.html" -o -name "*.js" -o -name "*.css" \) ! -path "./.git/*" -exec wc -l {} + | sort -rn | head -25

# 8. Git 사용자 정보
git config user.name && git config user.email
```

### Step 2: 프로젝트 구조 파악
- index.html 읽기 (메인 페이지 구조)
- 주요 JS 파일 읽기 (핵심 기능 파악)
- CSS 파일 헤더 읽기 (디자인 시스템 파악)
- 서브페이지 목록 확인 (pages/ 또는 하위 디렉토리)

### Step 3: 수집 데이터 정리
다음 변수를 확정한다:

| 변수 | 설명 | 예시 |
|------|------|------|
| `{프로그램명}` | 프로젝트 이름 | VCOS |
| `{부제}` | 한줄 설명 | 아이디어를 AI 개발 명령어로 변환하는 바이브 코딩 운영체계 |
| `{버전}` | 시맨틱 버전 | v1.0.0 |
| `{저작물종류}` | 편집저작물 / 어문저작물 / 프로그램저작물 | 편집저작물 |
| `{저작자}` | 한글명 (영문명) | 심재우 (Shim Jaewoo) |
| `{이메일}` | 연락처 | jaiwshim@gmail.com |
| `{창작연월일}` | Git 첫 커밋 날짜 | 2026년 3월 13일 |
| `{최종수정일}` | Git 최종 커밋 날짜 | 2026년 3월 21일 |
| `{총파일수}` | 소스 파일 수 | 67개 |
| `{총줄수}` | 소스코드 줄 수 | 23,327줄 |
| `{HTML페이지수}` | HTML 파일 수 | 17개 |
| `{커밋수}` | Git 커밋 수 | 69회 |
| `{개발기간}` | 첫 커밋~최종 커밋 | 9일 |
| `{핵심기능목록}` | 주요 기능 리스트 | Phase 1~6 기능들 |
| `{기술스택}` | 사용 기술 | HTML5, CSS3, JS, Claude AI, Supabase |
| `{독창적요소}` | 차별화 포인트 | 25 Skills, 5 Squads 등 |

---

## Phase 1.5. 분대 편성 및 병렬 실행

Phase 1 데이터 수집은 소대장이 직접 수행한다. 데이터 수집 완료 후, 3개 분대를 병렬 스폰하여 Phase 2~4를 동시 실행한다.

### 편제표

| 직책 | 호출부호 | 임무 | 모델 |
|------|---------|------|------|
| 소대장 | Lead | Phase 1 데이터 수집 + 오케스트레이션 + 품질 검증 | opus |
| 1분대장 | Alpha | copyright.html 탭 1~3 (개요, 기능명세, 시스템구조) | sonnet |
| 2분대장 | Bravo | copyright.html 탭 4~7 (독창적요소, 창작이력, 저작권선언, 구조도) | sonnet |
| 3분대장 | Charlie | 메타태그 전 페이지 + footer 저작권 표기 + README.md + SVG 구조도 | sonnet |

### 실행 절차

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1. 소대장 — Phase 1 데이터 수집 (순차)                   │
│    ① Git 이력, 파일 통계, 프로젝트 구조 파악                    │
│    ② 수집 데이터를 변수로 정리                                 │
│    ③ 필요한 파일 내용을 미리 Read로 읽어둠                      │
│                                                             │
│  Step 2. 3개 분대 동시 스폰 (병렬)                             │
│    ① Alpha, Bravo, Charlie를 하나의 메시지에서 병렬 Agent 호출   │
│       - Agent 도구 3개를 동시에 호출 (순차 호출 금지)            │
│       - model: sonnet                                        │
│       - run_in_background: true                              │
│    ② 각 분대에 Phase 1에서 수집한 데이터를 프롬프트에 포함       │
│                                                             │
│  Step 3. 소대장 — 결과 통합 및 품질 검증                        │
│    ① Alpha가 생성한 copyright.html 골격에 Bravo 콘텐츠 병합     │
│    ② Charlie의 메타태그/footer/README/SVG 결과 확인             │
│    ③ 검증 체크리스트 실행                                      │
│                                                             │
│  ⚠️ 분대 권한 문제 발생 시:                                    │
│    → 소대장이 직접 해당 작업을 수행 (fallback)                  │
│    → 외부 프로젝트 폴더 파일 수정은 소대장만 가능할 수 있음      │
└─────────────────────────────────────────────────────────────┘
```

### 분대별 프롬프트 가이드

**Alpha 프롬프트 핵심:**
- copyright.html 전체 HTML 골격 생성 (head, style, tabs, script 포함)
- 탭 1(프로그램 개요), 탭 2(기능 명세), 탭 3(시스템 구조) 콘텐츠 완성
- 탭 4~7은 placeholder (<!-- BRAVO_TAB4 --> 등)로 남김
- Phase 1에서 수집한 모든 데이터(파일 통계, Git 이력, 기능 목록 등)를 프롬프트에 포함
- Write 도구로 대상 폴더에 copyright.html 저장

**Bravo 프롬프트 핵심:**
- Alpha 완료 후 Edit 도구로 copyright.html의 탭 4~7 placeholder를 실제 콘텐츠로 교체
- 탭 4(독창적 요소): 핵심 독창성 카드 + 비교표
- 탭 5(창작 이력): Git 타임라인 + 통계
- 탭 6(저작권 선언): 선언문 + 라이선스 + 체크리스트
- 탭 7(구조도): 인라인 SVG 삽입
- ⚠️ Alpha와 의존 관계: Alpha 완료 후 실행 또는 소대장이 병합

**Charlie 프롬프트 핵심:**
- 대상 프로젝트의 메인 JS 파일에 VERSION 상수 + footer 저작권 표기 수정
- 모든 HTML 파일에 meta author/description/copyright 태그 일괄 추가
- README.md 생성
- SVG 아키텍처 구조도 생성 (별도 파일 + copyright.html 인라인용)
- ⚠️ 외부 폴더 권한 문제 시 소대장에게 보고

### 병렬 실행 패턴

**패턴 A (권한 문제 없을 때):**
```
소대장: Phase 1 수집
  ├── Alpha (background): copyright.html 골격 + 탭 1~3
  ├── Bravo (background): 탭 4~7 콘텐츠 (Alpha 완료 후 병합)
  └── Charlie (background): 메타태그 + footer + README + SVG
소대장: 결과 통합 + 검증
```

**패턴 B (권한 문제 시 fallback):**
```
소대장: Phase 1 수집
  └── Alpha (background): copyright.html 전체 (탭 1~7)
소대장: 직접 메타태그 + footer + README + SVG 수행
소대장: 검증
```

---

## Phase 2. copyright.html 생성

### 디자인 사양: Premium White Theme
- 배경: #ffffff, 카드 그라디언트(#fff → #fafbff)
- 브랜드 컬러: #2563eb (blue-600), 보조 #7c3aed (purple)
- 폰트: Noto Sans KR + Inter (Google Fonts)
- 카드: 좌측 컬러 보더 4px + 그라디언트 배경 + 호버 그림자
- 탭 버튼: 라운드 필(pill), 각 탭별 좌측 컬러 포인트
- 테이블: 블루 테두리 + 헤더 그라디언트 (#eff6ff → #eef2ff)
- 반응형: max-width 640px 대응
- 인쇄: @media print로 전 탭 자동 펼침, A4 최적화

### 7탭 구조

#### 탭 1: 프로그램 개요
- 기본 정보 테이블 (프로그램명, 부제, 버전, 저작물종류, 저작자, 이메일, 창작연월일, 최종수정일, 등록유형)
- 프로그램 목적 설명 (2~3 단락)
- 프로그램 규모 통계 카드 (총파일수, 총줄수, HTML페이지수, 핵심기능수, 커밋수, 개발기간)
- Phase 컬러바 (개발 라이프사이클 시각화)

#### 탭 2: 기능 명세
- Phase별 기능 테이블 (페이지명, 기능 설명)
- 부가 기능 페이지 테이블
- 핵심 기능 체계 (Skills, 모듈 등) — Phase별 컬러 태그로 시각화

#### 탭 3: 시스템 구조
- 기술 스택 테이블
- 핵심 편제/아키텍처 다이어그램 (해당 시)
- 파일 구조 트리 (code-block, pre 태그)
- 소스코드 통계 테이블 (파일수, 줄수, 파일종류별)
- 핵심 모듈 구조 테이블 (모듈명, 파일, 주요 함수)

#### 탭 4: 독창적 요소
- 핵심 독창성 소개
- 독창적 요소 카드 그리드 (feature-grid, 각 항목별 상단 컬러바)
- 아키텍처 독창성 테이블
- 기존 솔루션과의 차별점 비교 테이블 (비교항목 | 기존 | 본 프로젝트)

#### 탭 5: 창작 이력
- 개발 타임라인 기본 정보 테이블
- Git 커밋 이력 타임라인 (timeline 컴포넌트, 주요 마일스톤)
- 일별 개발 진행 통계 테이블
- 창작 사실 증명 테이블 (Git 이력, 설정, 타임스탬프, 파일 해시, 코드 원본)

#### 탭 6: 저작권 선언
- 저작권 등록 선언문 (declaration 카드, © 심볼, 저작자명, 법률 근거)
- 저작물 정보 테이블 (제호, 종류, 저작자, 국적, 창작연월일, 공표일, 등록유형, 등록부문)
- 권리 선언 (저작권법 제2조 제18호 인용)
- 라이선스 조건 (code-block)
- 저작권 등록 체크리스트 테이블

#### 탭 7: 시스템 구조도
- SVG 아키텍처 다이어그램 인라인 삽입
- 구조도 레이어 설명 테이블

### PDF 다운로드 기능
- 우측 하단 고정 버튼 (window.print() 호출)
- @media print CSS:
  - 탭 버튼/플로팅 버튼 숨김
  - 전 탭 자동 펼침 (display:block!important)
  - 탭별 페이지 분리 (page-break-after:always)
  - A4 사이즈 (@page{size:A4;margin:12mm 14mm})
  - 컬러 보존 (print-color-adjust:exact)
  - 인쇄 footer 자동 삽입 (::after pseudo-element)

### JavaScript
탭 전환: 클릭 시 active 클래스 토글 (순수 JS, 라이브러리 없음)

---

## Phase 3. 프로젝트 저작권 표기 보강

### Step 1: 버전 상수 추가
메인 JS 파일 상단에 버전 상수 추가:
```javascript
const {변수명}_VERSION = 'v1.0.0';
```

### Step 2: Footer 저작권 표기 수정
기존 footer에 저작자 성명 + 버전 + "All rights reserved." 추가:
```
© {년도} {저작자}. {프로그램명} ${VERSION} — {부제}. All rights reserved.
```

### Step 3: 메타 태그 추가 (전 페이지)
모든 HTML 파일의 `<title>` 태그 다음 줄에 삽입:
```html
<meta name="author" content="{저작자}">
<meta name="description" content="{페이지별 설명}">
<meta name="copyright" content="Copyright {년도} {저작자 한글명}. All rights reserved.">
```

일괄 처리 방법 (bash):
```bash
declare -A descs
descs["page1.html"]="설명1"
descs["page2.html"]="설명2"
# ...
for f in *.html; do
  desc="${descs[$f]}"
  if [ -n "$desc" ] && ! grep -q 'meta name="author"' "$f"; then
    sed -i "/<\/title>/a\\
<meta name=\"author\" content=\"{저작자}\">\\
<meta name=\"description\" content=\"${desc}\">\\
<meta name=\"copyright\" content=\"Copyright {년도} {저작자 한글명}. All rights reserved.\">" "$f"
  fi
done
```

### Step 4: README.md 생성
프로젝트 루트에 README.md 생성:
```markdown
# {프로그램명} — {영문 풀네임}

> {부제}

## 프로그램 정보
| 항목 | 내용 |
|------|------|
| 프로그램명 | {프로그램명} |
| 버전 | {버전} |
| 저작자 | {저작자} |
| 이메일 | {이메일} |
| 창작연월일 | {창작연월일} |
| 저작물 종류 | {저작물종류} |

## 주요 기능
{핵심기능 bullet list}

## 기술 스택
{기술스택 bullet list}

## 라이선스
Copyright (c) {년도} {저작자}. All rights reserved.
본 소프트웨어는 저작권법에 의해 보호됩니다.
```

---

## Phase 4. SVG 아키텍처 구조도 생성

### 사양
- 크기: viewBox="0 0 1600 1200"
- 테마: Premium White (배경 #f8fafc → #eff6ff 그라디언트)
- 6개 레이어 수직 구조:
  1. User Input (상단)
  2. Core Engine (핵심 파일)
  3. Phases (Phase별 컬러 카드)
  4. Skills/Modules (기능 그리드)
  5. Team/Architecture (편제 또는 구조)
  6. Data & Infrastructure (하단)
- 레이어 간 화살표 연결
- 하단 Legend (핵심 통계 수치)
- 저작권 표기

### 주의사항
- SVG에서 `&nbsp;` 사용 금지 → `&#160;` 사용
- SVG에서 `&amp;` 사용 금지 → `&#38;` 사용
- copyright.html에 인라인 삽입 시 ID 충돌 방지 (접두어 `a-` 추가)
- 한글은 유니코드 엔티티(&#숫자;) 또는 그대로 텍스트 사용

---

## Phase 5. 검증

### 체크리스트
- [ ] copyright.html 브라우저에서 7개 탭 전환 정상
- [ ] PDF 다운로드 버튼 클릭 → 인쇄 다이얼로그
- [ ] 인쇄 미리보기에서 전 탭 펼침 + 컬러 보존
- [ ] 구조도 SVG 인쇄 시 잘림 없음
- [ ] 전 페이지 메타 태그 확인 (grep "meta name=\"author\"")
- [ ] Footer 저작권 표기 확인
- [ ] README.md 생성 확인

### 검증 명령어
```bash
# 메타 태그 확인
grep -l 'meta name="author"' *.html pages/*.html | wc -l

# Footer 확인
grep "footer-copy" main.js

# 파일 목록
ls -la copyright.html README.md *.svg
```

---

## 사용법

```
/copyright
```

실행하면 지휘관(User)에게 다음을 질문:
1. 대상 프로젝트 폴더 경로
2. 저작자 정보 (이름, 이메일) — 기본값: 심재우, jaiwshim@gmail.com
3. 저작물 종류 — 기본값: 편집저작물

이후 Phase 1~5를 자동 실행하여 저작권 등록용 자료 일체를 생성한다.
