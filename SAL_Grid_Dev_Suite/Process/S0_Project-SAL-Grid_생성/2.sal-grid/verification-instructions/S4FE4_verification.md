# Verification Instruction - S4FE4

## Task ID
S4FE4

## Verification Goal
07-command.html과 08-command.html의 중복 문제가 해결되었고, 사용자가 07번 URL에 접근해도 올바른 경험을 얻는지 검증한다.

## Verification Agent
`code-reviewer-기본`

## Verification Checklist

### 1. 파일 상태 확인
- [ ] 07-command.html 파일 내용이 명확한 역할 또는 리다이렉트를 가짐
- [ ] 08-command.html 기능이 정상 작동 (명령어 생성 + 복사)

### 2. 리다이렉트 시나리오 (해당 시)
- [ ] `<meta http-equiv="refresh" content="0; url=08-command.html">` 존재
- [ ] 브라우저에서 07-command.html 접근 → 08-command.html로 이동

### 3. buildNav 일관성
- [ ] vcos.js buildNav에서 7번 단계 링크가 의도한 파일 가리킴
- [ ] 모든 페이지의 네비게이션에서 명령어 단계 링크 일치

### 4. sitemap.html 반영
- [ ] sitemap.html에서 07-command.html 표시 방식 올바름

## Pass Criteria
- 07-command.html과 08-command.html 역할 명확히 구분됨
- 사용자 혼란 없음
