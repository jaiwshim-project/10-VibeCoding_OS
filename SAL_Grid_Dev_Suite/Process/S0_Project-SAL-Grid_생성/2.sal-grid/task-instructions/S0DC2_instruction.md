# Task Instruction - S0DC2

## Task ID
S0DC2

## Task Name
JSON + Viewer 셋업 (index.json + viewer_json.html 배포 위치 확인)

## Task Goal
VCOS SAL Grid의 index.json을 30개 Task 정보로 채우고, viewer_json.html이 올바른 경로에 있는지 확인하여 SAL Grid Viewer가 작동하도록 셋업한다.

## Prerequisites (Dependencies)
- S0DC1 (TASK_PLAN.md 생성 완료)

## Specific Instructions

### 1. index.json 생성
`Process/S0_Project-SAL-Grid_생성/3.method/json/data/index.json`에 프로젝트 메타데이터와 30개 Task ID 배열 작성:

```json
{
  "project_id": "VCOS-2026-001",
  "project_name": "Vibe Coding OS",
  "description": "AI 시대를 위한 소프트웨어 개발 운영체제",
  "method": "Vanilla",
  "total_tasks": 30,
  "task_ids": [
    "S0DV1", "S0DV2", "S0DC1", "S0DC2",
    "S1DS1", "S1CS1", "S1FE1", "S1FE2", "S1DV1",
    "S2FE1", "S2FE2", "S2FE3", "S2FE4", "S2FE5", "S2FE6", "S2FE7", "S2CS1", "S2CS2",
    "S3FE1", "S3FE2", "S3FE3", "S3FE4", "S3FE5",
    "S4FE1", "S4FE2", "S4FE3", "S4FE4", "S4DC1", "S4TS1", "S4DV1"
  ],
  "created_at": "2026-03-16",
  "updated_at": "2026-03-16"
}
```

### 2. 30개 grid_records JSON 파일 생성
`Process/S0_Project-SAL-Grid_생성/3.method/json/data/grid_records/` 폴더에 각 Task별 JSON 파일 생성.

**소급 완료 Task 공통 형식:**
```json
{
  "task_id": "S1FE1",
  "task_name": "vcos.js — 공유 컴포넌트",
  "stage": 1,
  "area": "FE",
  "task_status": "Completed",
  "task_progress": 100,
  "verification_status": "Skipped (PO Approved)",
  "generated_files": "vcos.js",
  "remarks": "소급 등록: 2026-03-16",
  "modification_history": ["소급 등록: 2026-03-16"],
  "created_at": "2026-03-16",
  "updated_at": "2026-03-16"
}
```

**Pending Task 형식:**
```json
{
  "task_id": "S4FE4",
  "task_name": "07-command.html 정리",
  "stage": 4,
  "area": "FE",
  "task_status": "Pending",
  "task_progress": 0,
  "verification_status": "Not Verified",
  "remarks": "",
  "created_at": "2026-03-16",
  "updated_at": "2026-03-16"
}
```

### 3. stage_gate_records JSON 생성
`Process/S0_Project-SAL-Grid_생성/3.method/json/data/stage_gate_records/` 폴더에 S0~S4 gate JSON 파일 생성.

S0~S3 소급 완료: `stage_gate_status: "Approved (Retroactive)"`
S4 진행 중: `stage_gate_status: "Not Started"`

### 4. viewer_json.html 경로 확인
`Process/S0_Project-SAL-Grid_생성/4.viewer/viewer_json.html` 파일이 index.json과 grid_records/를 올바른 상대 경로로 참조하는지 확인.
경로 기준: `../3.method/json/data/index.json`

## Expected Output Files
- `Process/S0_Project-SAL-Grid_생성/3.method/json/data/index.json`
- `Process/S0_Project-SAL-Grid_생성/3.method/json/data/grid_records/S0DV1.json` (~ S4DV1.json, 30개)
- `Process/S0_Project-SAL-Grid_생성/3.method/json/data/stage_gate_records/S0_gate.json` (~ S4_gate.json, 5개)

## Completion Criteria
- [ ] index.json에 30개 task_id 모두 포함
- [ ] grid_records/ 폴더에 30개 JSON 파일 생성
- [ ] stage_gate_records/ 폴더에 5개 gate JSON 파일 생성
- [ ] viewer_json.html 로컬 서버에서 접근 시 Task 목록 표시

## Tech Stack
- JSON 파일 작성
- Static HTML (viewer)

## Tools
- Write (JSON 파일 생성)

## Execution Type
AI-Only

## Remarks
- 소급 완료 Task의 verification_status는 "Skipped (PO Approved)" 사용
- grid_records/ 폴더 경로 주의: Process/S0_.../3.method/json/data/grid_records/
