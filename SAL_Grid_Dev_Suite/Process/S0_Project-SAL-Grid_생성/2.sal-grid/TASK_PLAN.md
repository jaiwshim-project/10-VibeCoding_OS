# Vibe Coding OS — Task Plan

> **작성일**: 2026-03-16
> **수정일**: 2026-03-16
> **버전**: v1.0
> **프로젝트**: Vibe Coding OS (VCOS)
> **총 Task 수**: 30개
> **아키텍처**: Vanilla HTML/CSS/JavaScript
> **시나리오**: 소급도입 (Retroactive Application)

---

## Stage별 Task 수

| Stage | 한글명 | Task 수 | 타입 |
|-------|--------|---------|------|
| S0 | Project SAL Grid 생성 | 4 | 신규+소급 |
| S1 | 공유 인프라 | 5 | 소급 완료 |
| S2 | Phase 1 핵심 워크플로우 | 9 | 소급 완료 |
| S3 | Phase 2 고도화 엔진 | 5 | 소급 완료 |
| S4 | 문서·유틸리티·마무리 | 7 | 소급+신규 |
| **합계** | | **30** | |

---

## Area별 분포

| Area | S0 | S1 | S2 | S3 | S4 | 합계 |
|------|----|----|----|----|----|----|
| FE (Frontend) | 0 | 2 | 7 | 5 | 4 | **18** |
| BA (Backend APIs) | 0 | 0 | 0 | 0 | 0 | 0 |
| DB (Database) | 0 | 0 | 0 | 0 | 0 | 0 |
| SC (Security) | 0 | 0 | 0 | 0 | 0 | 0 |
| BI (Backend Infra) | 0 | 0 | 0 | 0 | 0 | 0 |
| EX (External) | 0 | 0 | 0 | 0 | 0 | 0 |
| TS (Testing) | 0 | 0 | 0 | 0 | 1 | **1** |
| DV (DevOps) | 2 | 1 | 0 | 0 | 1 | **4** |
| DS (Design) | 0 | 1 | 0 | 0 | 0 | **1** |
| DC (Documentation) | 2 | 0 | 0 | 0 | 1 | **3** |
| CS (Content System) | 0 | 1 | 2 | 0 | 0 | **3** |
| **합계** | **4** | **5** | **9** | **5** | **7** | **30** |

---

## S0 — Project SAL Grid 생성 (4개)

> SAL Grid Dev Suite 인프라 구축. 신규 Tasks.

| Task ID | Task명 | Area | Dependencies | 상태 |
|---------|--------|------|-------------|------|
| S0DV1 | scripts + Pre-commit Hook 설치 | DV | - | ✅ Completed (소급) |
| S0DV2 | SAL_Grid_Dev_Suite Template 복사 + 플레이스홀더 치환 | DV | S0DV1 | ✅ Completed (소급) |
| S0DC1 | TASK_PLAN.md 생성 | DC | S0DV2 | ✅ Completed |
| S0DC2 | JSON + Viewer 셋업 (index.json + viewer_json.html 배포) | DC | S0DC1 | ⏳ Pending |

---

## S1 — 공유 인프라 (5개)

> 전체 플랫폼이 공유하는 핵심 파일들. 소급 완료.

| Task ID | Task명 | Area | Dependencies | 상태 |
|---------|--------|------|-------------|------|
| S1DS1 | vcos.css — 통합 디자인 시스템 | DS | S0DV1 | ✅ Completed (소급) |
| S1CS1 | vcos.js — skills/squad 데이터 정의 (25개 스킬, 66명 에이전트) | CS | S0DV1 | ✅ Completed (소급) |
| S1FE1 | vcos.js — 공유 컴포넌트 (buildHeader/Nav/Footer, save/loadProject) | FE | S1DS1, S1CS1 | ✅ Completed (소급) |
| S1FE2 | index.html — 메인 대시보드 | FE | S1FE1 | ✅ Completed (소급) |
| S1DV1 | .gitignore + GitHub Pages 배포 설정 | DV | S0DV1 | ✅ Completed (소급) |

---

## S2 — Phase 1 핵심 워크플로우 (9개)

> 7단계 메인 워크플로우 + 핵심 로직. 소급 완료.

| Task ID | Task명 | Area | Dependencies | 상태 |
|---------|--------|------|-------------|------|
| S2FE1 | 01-intent.html — 프로젝트 인텐트 입력 | FE | S1FE1 | ✅ Completed (소급) |
| S2FE2 | 02-ai-collab.html — AI 협업 준비 | FE | S2FE1 | ✅ Completed (소급) |
| S2FE3 | 03-complexity.html — 복잡도 분석 (6축 슬라이더) | FE | S2FE1 | ✅ Completed (소급) |
| S2FE4 | 04-squad.html — 분대 편성 (HQ + 5분대, 66명) | FE | S2FE3, S1CS1 | ✅ Completed (소급) |
| S2FE5 | 05-skills.html — 스킬 전략 (25개 자동 선택) | FE | S2FE3, S1CS1 | ✅ Completed (소급) |
| S2FE6 | 06-token.html — 토큰 최적화 (3계층 모델) | FE | S2FE3 | ✅ Completed (소급) |
| S2FE7 | 08-command.html — 완성 명령어 생성 + 클립보드 | FE | S2FE1, S2FE3, S2FE4, S2FE5, S2FE6 | ✅ Completed (소급) |
| S2CS1 | vcos.js calcComplexity — 복잡도 계산·분대 편성 로직 | CS | S1CS1 | ✅ Completed (소급) |
| S2CS2 | vcos.js getRelevantSkills — 스킬 자동 선택 알고리즘 | CS | S1CS1 | ✅ Completed (소급) |

---

## S3 — Phase 2 고도화 엔진 (5개)

> 5개 전문 고도화 엔진. 소급 완료.

| Task ID | Task명 | Area | Dependencies | 상태 |
|---------|--------|------|-------------|------|
| S3FE1 | 07-refinement.html — 고도화 엔진 (97점 평가루프) | FE | S1FE1 | ✅ Completed (소급) |
| S3FE2 | 08-sal-grid.html — SAL Grid 방법론 설명 + 명령어 | FE | S1FE1 | ✅ Completed (소급) |
| S3FE3 | 09-debug-loop.html — 5회 디버그 루프 엔진 | FE | S1FE1 | ✅ Completed (소급) |
| S3FE4 | 10-slideshow.html — 슬라이드쇼 웹 생성기 | FE | S1FE1 | ✅ Completed (소급) |
| S3FE5 | 11-youtube.html — 유튜브 영상 올인원 자동화 | FE | S1FE1 | ✅ Completed (소급) |

---

## S4 — 문서·유틸리티·마무리 (7개)

> 매뉴얼, 스킬맵, 사이트맵, 품질 개선. 소급+신규 혼합.

| Task ID | Task명 | Area | Dependencies | 상태 |
|---------|--------|------|-------------|------|
| S4FE1 | manual.html — 사용 매뉴얼 | FE | S2CS2, S3FE1 | ✅ Completed (소급) |
| S4FE2 | skills-map.html — 25개 스킬 맵 시각화 | FE | S2CS2 | ✅ Completed (소급) |
| S4FE3 | sitemap.html — 전체 사이트맵 + Phase 흐름도 | FE | S1FE2 | ✅ Completed (소급) |
| S4FE4 | 07-command.html 정리 (중복 확인 + 처리) | FE | S2FE7 | ⏳ Pending |
| S4DC1 | P1+P2 기획 문서 완성 (12개 문서) | DC | S0DV2 | ✅ Completed |
| S4TS1 | 전체 페이지 기능 검증 테스트 | TS | S3FE5, S4FE3 | ⏳ Pending |
| S4DV1 | viewer_json.html 배포 + SAL Grid 공개 URL 설정 | DV | S0DC2, S1DV1 | ⏳ Pending |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-16 | 최초 생성 — 소급도입 30개 Task 매핑 |
