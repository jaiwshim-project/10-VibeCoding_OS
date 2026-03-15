# P1-5. Business Plan — Vibe Coding OS (VCOS)

> 작성일: 2026-03-16 | 버전: 1.0 | 소급도입

---

## 1. 프로젝트 요약

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Vibe Coding OS (VCOS) |
| **한줄 설명** | AI 시대를 위한 소프트웨어 개발 운영체제 |
| **기술 스택** | Vanilla HTML/CSS/JavaScript |
| **배포** | GitHub Pages (jaiwshim-project/10-VibeCoding_OS) |
| **개발자** | Sunny (jaiwshim) |
| **시작일** | 2025년 (추정) |
| **현재 상태** | 운영 중 + SAL Grid 소급도입 진행 |

---

## 2. 제품 현황 (2026-03-16 기준)

### 완성된 기능

#### Phase 1 — 핵심 워크플로우 (7단계)
| # | 파일 | 기능 | 상태 |
|---|------|------|------|
| 1 | 01-intent.html | 프로젝트 인텐트 입력 | ✅ 완성 |
| 2 | 02-ai-collab.html | AI 협업 준비 | ✅ 완성 |
| 3 | 03-complexity.html | 복잡도 분석 | ✅ 완성 |
| 4 | 04-squad.html | 분대 편성 | ✅ 완성 |
| 5 | 05-skills.html | 스킬 전략 (25개) | ✅ 완성 |
| 6 | 06-token.html | 토큰 최적화 | ✅ 완성 |
| 7 | 08-command.html | 명령어 생성 | ✅ 완성 |

#### Phase 2 — 고도화 엔진 (5개 페이지)
| # | 파일 | 기능 | 상태 |
|---|------|------|------|
| 1 | 07-refinement.html | SAL Grid 엔진 | ✅ 완성 |
| 2 | 08-sal-grid.html | SAL Grid 상세 | ✅ 완성 |
| 3 | 09-debug-loop.html | 5회 디버그 루프 | ✅ 완성 |
| 4 | 10-slideshow.html | 슬라이드쇼 웹 | ✅ 완성 |
| 5 | 11-youtube.html | 유튜브 영상 생성 | ✅ 완성 |

#### 유틸리티 페이지
| 파일 | 기능 | 상태 |
|------|------|------|
| index.html | 메인 대시보드 | ✅ 완성 |
| manual.html | 사용 매뉴얼 | ✅ 완성 |
| skills-map.html | 25개 스킬 맵 | ✅ 완성 |
| sitemap.html | 사이트맵 | ✅ 완성 |

### 공유 인프라
- `vcos.css` — 통합 디자인 시스템 (phase-banner, page-hero, footer 등)
- `vcos.js` — 공유 컴포넌트 (buildHeader, buildFooter, buildNav)
- `supabase.js` — DB 연동 (미래 사용 예정)

---

## 3. 로드맵

### 단기 (2026 Q1~Q2)
- [ ] SAL Grid Dev Suite 소급도입 완료 (PART 2~9)
- [ ] VCOS 전체 Task Grid 생성 및 검증
- [ ] 누락 기능 식별 및 보완
- [ ] 성능 최적화

### 중기 (2026 Q3~Q4)
- [ ] 사용자 테스트 및 피드백 수집
- [ ] 스킬 마켓플레이스 기획
- [ ] 영문 버전 검토

### 장기 (2027+)
- [ ] Pro Tier 출시
- [ ] 교육 콘텐츠 시리즈
- [ ] 기업 라이선스 프로그램

---

## 4. 성공 지표 (KPI)

| 지표 | 현재 | 6개월 목표 | 1년 목표 |
|------|------|----------|---------|
| GitHub Stars | 측정 예정 | 100 | 500 |
| 월간 방문자 | 측정 예정 | 1,000 | 5,000 |
| VCOS 사용 완료율 | 측정 예정 | 30% | 50% |
| 스킬 패키지 다운로드 | 측정 예정 | 200 | 1,000 |

---

## 5. 리스크 관리

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| Anthropic Claude 정책 변경 | 중 | 높음 | 멀티 LLM 지원 고려 |
| 경쟁 유사 제품 출시 | 높음 | 중 | 방법론 IP + 커뮤니티 확보 |
| 1인 개발 리소스 부족 | 높음 | 중 | SAL Grid로 자동화 최대화 |
| AI 코딩 트렌드 변화 | 중 | 중 | 방법론 불변 원칙 고수 |

---

## 6. 실행 계획 (현재 ~ 3개월)

```
Week 1-2:  SAL Grid 소급도입 PART 2~3 (P2 기획 + TASK_PLAN)
Week 3-4:  SAL Grid PART 4~5 (Instruction + JSON 생성)
Week 5-8:  SAL Grid PART 6~7 (Task 실행 + 검증)
Week 9-10: SAL Grid PART 8~9 (Stage Gate + 완료)
Week 11-12: 사용자 테스트 + 피드백 반영
```
