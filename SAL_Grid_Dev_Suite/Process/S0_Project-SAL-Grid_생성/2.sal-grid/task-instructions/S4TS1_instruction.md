# Task Instruction - S4TS1

## Task ID
S4TS1

## Task Name
전체 페이지 기능 검증 테스트

## Task Goal
VCOS Phase 1 워크플로우 전체(01→08-command)와 Phase 2 고도화 엔진 5개 페이지의 핵심 기능이 정상 동작하는지 검증한다.

## Prerequisites (Dependencies)
- S3FE5 (11-youtube.html 완료)
- S4FE3 (sitemap.html 완료)

## Specific Instructions

### 1. Phase 1 워크플로우 검증 체크리스트

| 페이지 | 검증 항목 |
|--------|---------|
| 01-intent.html | 입력 → localStorage 저장 확인 |
| 02-ai-collab.html | 페이지 로드 + 내용 표시 |
| 03-complexity.html | 슬라이더 조작 → 점수 계산 |
| 04-squad.html | 복잡도 기반 분대 자동 표시 |
| 05-skills.html | 스킬 자동 선택 + Phase 분류 |
| 06-token.html | 토큰 최적화 정보 표시 |
| 08-command.html | 명령어 생성 + 복사 버튼 작동 |

### 2. Phase 2 엔진 검증

| 페이지 | 검증 항목 |
|--------|---------|
| 07-refinement.html | 페이지 로드 + 섹션 표시 |
| 08-sal-grid.html | SAL Grid 설명 + 명령어 표시 |
| 09-debug-loop.html | 디버그 루프 UI 표시 |
| 10-slideshow.html | 슬라이드쇼 생성기 로드 |
| 11-youtube.html | 유튜브 자동화 UI 로드 |

### 3. 공통 컴포넌트 검증

- [ ] buildHeader() — 모든 페이지에서 헤더 표시
- [ ] buildNav(N) — 현재 단계 하이라이트 올바름
- [ ] buildFooter() — 2열 메뉴 + 8버튼 2열 그리드 표시
- [ ] 모바일 반응형 — 320px 화면에서 레이아웃 깨짐 없음

### 4. 발견된 버그 기록
각 버그를 다음 형식으로 기록:
```
[페이지] [현상] [재현 방법] [우선순위: P0/P1/P2]
```

## Expected Output Files
- `Process/S4_개발_마무리/Testing/docs/S4TS1_test_report.md` (검증 결과 보고서)

## Completion Criteria
- [ ] 16개 페이지 모두 로드 성공 (에러 없음)
- [ ] Phase 1 데이터 흐름 (01→08) 정상 작동
- [ ] 공통 컴포넌트 모든 페이지 정상 표시
- [ ] P0 버그 없음 (기능 불가 수준)
- [ ] 발견된 버그 목록 문서화

## Tech Stack
- Browser (수동 테스트)
- Chrome DevTools (콘솔 에러 확인)

## Tools
- Grep (코드 검색)

## Execution Type
Hybrid (AI 분석 + PO 브라우저 확인)

## Remarks
- P0 버그 발견 시 즉시 수정 후 재검증
- 테스트 결과는 Testing/docs/에 저장 (Production 미포함)
