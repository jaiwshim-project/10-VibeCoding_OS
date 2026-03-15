# P2-1. Project Plan — Vibe Coding OS (VCOS)

> 작성일: 2026-03-16 | 버전: 1.0 | 소급도입

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Vibe Coding OS (VCOS) |
| **방법론** | Vanilla HTML/CSS/JavaScript |
| **시나리오** | 소급도입 (기존 프로토타입 → SAL Grid 적용) |
| **DEV_ROOT** | `SAL_Grid_Dev_Suite/` |
| **PROJECT_ROOT** | `/c/01 Claude-Code/10 Vibe Coding OS/` |
| **GitHub** | jaiwshim-project/10-VibeCoding_OS |
| **배포** | GitHub Pages |

---

## 2. Stage 구성 결정

소급도입이므로 기존 파일을 Stage에 매핑:

| Stage | 이름 | 내용 | 타입 |
|-------|------|------|------|
| **S0** | Project SAL Grid 생성 | TASK_PLAN, JSON, Viewer 생성 | 신규 |
| **S1** | 공유 인프라 완성 | vcos.js, vcos.css, index.html | 소급 완료 |
| **S2** | Phase 1 핵심 워크플로우 | 01~06 + 08-command.html | 소급 완료 |
| **S3** | Phase 2 고도화 엔진 | 07-refinement ~ 11-youtube | 소급 완료 |
| **S4** | 문서/유틸리티 + 마무리 | manual, skills-map, sitemap + 개선 | 소급+신규 |

---

## 3. Area 매핑 (VCOS 특화)

VCOS는 정적 Vanilla 프로젝트이므로 주요 Area:

| Area 코드 | 용도 | VCOS 파일 |
|---------|------|---------|
| **FE** | Frontend 페이지 | pages/*.html |
| **DS** | 디자인 시스템 | vcos.css |
| **DC** | 문서화 | manual.html, sitemap.html, README |
| **DV** | DevOps | scripts/, .gitignore, Git Hook |
| **CS** | 콘텐츠 | skills 데이터, squad 데이터 (vcos.js 내) |

---

## 4. 예상 Task 수 (N×11 매트릭스 예비 분석)

| Stage | FE | DS | DC | DV | CS | 합계 |
|-------|----|----|----|----|----|----|
| S0 | 0 | 0 | 2 | 2 | 0 | ~4 |
| S1 | 2 | 2 | 0 | 1 | 1 | ~6 |
| S2 | 7 | 0 | 0 | 0 | 2 | ~9 |
| S3 | 5 | 0 | 0 | 0 | 0 | ~5 |
| S4 | 2 | 0 | 3 | 1 | 0 | ~6 |
| **합계** | **16** | **2** | **5** | **4** | **3** | **~30** |

> 소급 완료 Task가 대부분 → 소급 Gate 적용

---

## 5. 일정 계획

| 단계 | 내용 | 예상 완료 |
|------|------|---------|
| PART 1 | Template 셋업 | ✅ 2026-03-16 완료 |
| PART 2 | P1+P2 기획서 | ✅ 2026-03-16 완료 |
| PART 3 | TASK_PLAN 생성 | 2026-03-16 |
| PART 4 | Instruction 파일 | 2026-03-17 |
| PART 5 | JSON + Viewer | 2026-03-17 |
| PART 6~7 | Task 실행/검증 | 2026-03-18~20 |
| PART 8 | Stage Gate | 2026-03-21 |
| PART 9 | 완료 + 배포 | 2026-03-22 |

---

## 6. 성공 기준

- [ ] VCOS 전체 기능이 SAL Grid Task로 매핑됨
- [ ] 모든 Task JSON이 정확히 생성됨
- [ ] viewer_json.html에서 전체 Task 현황 확인 가능
- [ ] 소급 Task는 간소화 Gate, 신규 Task는 정상 Gate
- [ ] Pre-commit Hook이 Stage → Root 자동 동기화
