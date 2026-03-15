# P2-3. User Flows — Vibe Coding OS (VCOS)

> 작성일: 2026-03-16 | 버전: 1.0

---

## Flow 1: Phase 1 메인 워크플로우 (신규 사용자)

```
[index.html — 메인 대시보드]
      ↓ "시작하기" 클릭
[01-intent.html — 인텐트 입력]
  → 프로젝트명, 목표, 기술스택 입력
  → localStorage 저장
      ↓ "다음" 클릭
[02-ai-collab.html — AI 협업 준비]
  → 핵심 문제 정의
  → 맥락 기록
  → 피드백 루프 계획
      ↓
[03-complexity.html — 복잡도 분석]
  → 6축 슬라이더 조정
  → 복잡도 점수 자동 계산
  → 프로젝트 타입 자동 분류
      ↓
[04-squad.html — 분대 편성]
  → 복잡도에 따라 HQ + N개 분대 자동 배치
  → 66명 AI 에이전트 역할 확인
      ↓
[05-skills.html — 스킬 전략]
  → 25개 스킬 자동 필터링
  → Phase 1 (빌드용) / Phase 2 (고도화용) 분류
  → 스킬별 명령어 확인
      ↓
[06-token.html — 토큰 최적화]
  → 3계층 모델 정책 (Opus/Sonnet/Haiku) 확인
  → 비용 최적화 전략 적용
      ↓
[08-command.html — 명령어 생성]  ← 최종 목적지
  → 모든 데이터 통합
  → Claude Code 완성 명령어 자동 생성
  → 클립보드 복사
  → Claude Code에 붙여넣기 → AI 실행
```

---

## Flow 2: Phase 2 고도화 (Phase 1 완료 후)

```
[08-command.html — Phase 1 완료]
      ↓ Phase 2 필요 시
[07-refinement.html — 고도화 엔진]
  → 어떤 고도화 필요한지 확인
  → 5가지 평가 기준 체크
  → Phase 2 실행 순서 결정
      ↓ (목적에 따라 선택)
  ┌──────────────────────────────────────────┐
  │  08-sal-grid.html  — SAL Grid 방법론     │
  │  09-debug-loop.html — 5회 디버그 루프    │
  │  10-slideshow.html  — 슬라이드쇼 생성    │
  │  11-youtube.html    — 유튜브 영상 생성   │
  └──────────────────────────────────────────┘
```

---

## Flow 3: 재방문 사용자 (저장된 프로젝트 불러오기)

```
[index.html]
  → localStorage에서 기존 프로젝트 감지
  → "이전 프로젝트 계속하기" 버튼 표시
      ↓
  원하는 단계로 바로 이동 (단계별 직접 접근 가능)
```

---

## Flow 4: 매뉴얼/참조 문서

```
[어느 페이지에서든 Footer]
  → 📖매뉴얼 버튼 → manual.html
  → 🗺구조도 버튼 → skills-map.html
  → 🏠홈으로 버튼 → index.html
```

---

## 주요 사용자 액션

| 액션 | 트리거 | 결과 |
|------|--------|------|
| 데이터 저장 | 각 페이지 "다음" 클릭 | localStorage 업데이트 |
| 명령어 복사 | "복사" 버튼 | 클립보드에 저장 |
| 프로젝트 초기화 | "초기화" 버튼 | localStorage 삭제 |
| 페이지 이동 | 네비게이션 바 | 해당 단계로 이동 |
