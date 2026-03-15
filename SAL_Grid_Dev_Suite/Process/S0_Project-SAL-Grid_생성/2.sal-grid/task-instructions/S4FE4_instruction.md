# Task Instruction - S4FE4

## Task ID
S4FE4

## Task Name
07-command.html 정리 (중복 확인 + 처리)

## Task Goal
pages/ 폴더에 07-command.html과 08-command.html이 모두 존재하는 상황을 분석하여, 중복 파일을 정리하거나 적절한 역할을 부여한다.

## Prerequisites (Dependencies)
- S2FE7 (08-command.html — 완성 명령어 생성 완료)

## Specific Instructions

### 1. 현황 분석
두 파일 비교:
- `pages/07-command.html` — 내용 확인 (구버전? 리다이렉트?)
- `pages/08-command.html` — 현재 사용 중인 최종 명령어 생성 페이지

### 2. 분기 처리 (분석 결과에 따라)

**시나리오 A: 07-command.html이 구버전 (deprecated)**
→ 07-command.html을 08-command.html로 리다이렉트 처리:
```html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="refresh" content="0; url=08-command.html">
</head>
<body>08-command.html로 이동 중...</body>
</html>
```

**시나리오 B: 07-command.html이 독립 기능을 가짐**
→ 유지하되 네비게이션에서 올바르게 연결 확인

**시나리오 C: 완전 중복**
→ 07-command.html 삭제 검토 (PO 확인 후)

### 3. vcos.js buildNav 확인
buildNav 함수에서 07번 단계가 어떤 파일을 가리키는지 확인 후 일치시킴.

## Expected Output Files
- `pages/07-command.html` (수정 또는 리다이렉트 처리)

## Completion Criteria
- [ ] 두 파일의 역할이 명확히 구분됨
- [ ] 중복이 없거나, 중복이 있다면 리다이렉트 처리
- [ ] vcos.js buildNav와 일치

## Tech Stack
- HTML (리다이렉트 또는 내용 정리)

## Tools
- Read, Grep

## Execution Type
AI-Only (분석 후 결정)

## Remarks
- 사용자가 07-command.html에 직접 접근할 경우 오작동 방지
- sitemap.html에서도 해당 파일 참조 확인 필요
