# Verification Instruction - S0DC2

## Task ID
S0DC2

## Verification Goal
index.json + 30개 grid_records JSON + 5개 stage_gate JSON이 올바르게 생성되었고, viewer_json.html에서 Task 목록이 정상 표시되는지 검증한다.

## Verification Agent
`code-reviewer-기본`

## Verification Checklist

### 1. index.json 검증
- [ ] 파일 존재: `Process/S0_.../3.method/json/data/index.json`
- [ ] `total_tasks` = 30
- [ ] `task_ids` 배열에 30개 ID 포함 (S0DV1 ~ S4DV1)
- [ ] JSON 문법 오류 없음

### 2. grid_records 검증 (30개)
- [ ] 30개 파일 모두 존재 (`grid_records/S0DV1.json` ~ `S4DV1.json`)
- [ ] 소급 완료 Task: `task_status: "Completed"`, `verification_status: "Skipped (PO Approved)"`
- [ ] Pending Task: `task_status: "Pending"`, `task_progress: 0`
- [ ] `stage` 필드가 숫자형 (0~4)
- [ ] `area` 필드가 올바른 코드 (FE, DV, DC, DS, CS, TS)

### 3. stage_gate_records 검증 (5개)
- [ ] `S0_gate.json` ~ `S4_gate.json` 존재
- [ ] S0~S3: `stage_gate_status: "Approved (Retroactive)"`
- [ ] S4: `stage_gate_status: "Not Started"`

### 4. Viewer 동작 검증
- [ ] `npx serve` 실행 후 Viewer URL 접근 가능
- [ ] 30개 Task 카드 표시
- [ ] Stage별 필터 동작

## Pass Criteria
- 30개 grid_records 파일 존재 + JSON 문법 오류 없음
- Viewer에서 Task 목록 표시
