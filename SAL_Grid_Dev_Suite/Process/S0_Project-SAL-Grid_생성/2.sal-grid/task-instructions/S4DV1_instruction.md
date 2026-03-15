# Task Instruction - S4DV1

## Task ID
S4DV1

## Task Name
viewer_json.html 배포 + SAL Grid 공개 URL 설정

## Task Goal
SAL Grid Viewer(viewer_json.html)가 GitHub Pages에서 접근 가능하도록 하고, 공개 URL을 문서에 기록한다.

## Prerequisites (Dependencies)
- S0DC2 (JSON + Viewer 셋업 완료)
- S1DV1 (GitHub Pages 배포 설정 완료)

## Specific Instructions

### 1. GitHub Pages 배포 확인
현재 `main` 브랜치의 GitHub Pages가 활성화되어 있는지 확인:
```bash
gh api repos/jaiwshim-project/10-VibeCoding_OS/pages
```

### 2. Viewer 접근 URL 확인
Viewer가 다음 URL에서 접근 가능한지 확인:
```
https://jaiwshim-project.github.io/10-VibeCoding_OS/SAL_Grid_Dev_Suite/Process/S0_Project-SAL-Grid_생성/4.viewer/viewer_json.html
```

### 3. index.json 공개 접근 확인
GitHub Pages에서 JSON 파일이 올바르게 서빙되는지 확인:
```
https://jaiwshim-project.github.io/10-VibeCoding_OS/SAL_Grid_Dev_Suite/Process/S0_Project-SAL-Grid_생성/3.method/json/data/index.json
```

### 4. viewer_json.html 경로 수정 (필요 시)
로컬 상대 경로가 GitHub Pages URL과 다를 경우, viewer_json.html 내 fetch 경로 조정.

### 5. VCOS sitemap.html에 Viewer 링크 추가 (선택)
sitemap.html의 유틸리티 링크 섹션에 "📊 SAL Grid Viewer" 버튼 추가.

### 6. URL 문서화
`SAL_Grid_Dev_Suite/Human_ClaudeCode_Bridge/Reports/` 또는 `.claude/work_logs/current.md`에 Viewer 공개 URL 기록.

## Expected Output Files
- GitHub Pages URL 접근 가능 (파일 생성 아님)
- `.claude/work_logs/current.md` (URL 기록)

## Completion Criteria
- [ ] GitHub Pages에서 viewer_json.html 접근 가능
- [ ] 30개 Task가 Viewer에 표시됨
- [ ] Viewer URL이 work_logs에 기록됨

## Tech Stack
- GitHub Pages
- Static HTML

## Tools
- gh CLI
- git push

## Execution Type
AI-Only (git push + URL 확인)

## Remarks
- 로컬에서 viewer 확인: `npx serve` → localhost:3000/...viewer_json.html
- CORS 문제로 file:// 프로토콜에서는 JSON 로드 불가 — 반드시 서버 경유
