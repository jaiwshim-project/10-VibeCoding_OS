# 자동화 훅 설계 문서 — 오세훈 플랫폼

> 향후 Claude Code 세션 자동화 및 기록 에이전트 운영을 위한 설계 문서입니다.
> 본 세션(2026-03-21) 경험을 바탕으로 작성되었습니다.

---

## 1. 자동화 목표

### 핵심 문제 (현재)
- 새 세션 시작 시 매번 프로젝트 컨텍스트를 수동으로 설명해야 함
- 개발 진행 상황이 파일로 기록되지 않아 세션 간 연속성 부족
- Task 완료 후 관련 문서 업데이트가 수동 과정에 의존

### 자동화 목표
1. **세션 시작 자동화**: 새 세션에서 즉시 프로젝트 컨텍스트 로드
2. **개발 저널 자동 기록**: 주요 작업 완료 시 저널 파일 자동 업데이트
3. **Task 상태 동기화**: 파일 생성/수정 완료 시 Task 자동 완료 처리
4. **체크포인트 알림**: 중요 마일스톤 도달 시 요약 보고

---

## 2. 기록 에이전트 역할 (본 세션 경험 기반 개선안)

### 현재 방식 (수동)
```
소대장 → 분대장에게 메시지 전달
분대장 → TaskList 확인
분대장 → TaskUpdate (in_progress)
분대장 → 파일 작성
분대장 → TaskUpdate (completed)
분대장 → 소대장에게 보고
```

### 개선된 방식 (반자동화)

#### 세션 시작 훅
세션 시작 시 자동으로 실행되는 루틴:
```
1. CLAUDE.md 읽기 (프로젝트 컨텍스트)
2. journal/INDEX.md 읽기 (타임라인)
3. TaskList 조회 (미완료 Task 파악)
4. CURRENT_STATUS.md 읽기 (현재 Phase)
→ 준비 완료 메시지 출력: "컨텍스트 로드 완료. 미완료 Task N개 확인."
```

#### 작업 완료 훅
파일 생성/수정 완료 후 자동 실행:
```
1. 관련 Task를 completed로 업데이트
2. journal/session-{date}.md에 작업 내용 append
3. CURRENT_STATUS.md 완료율 업데이트
4. INDEX.md 저널 목록 업데이트 (필요 시)
```

#### 세션 종료 훅
세션 마무리 시 자동 실행:
```
1. 완료된 Task 목록 수집
2. 미완료 Task 목록 수집
3. journal/session-{date}.md 최종 업데이트
4. NEXT_SESSION_CHECKLIST.md 업데이트
5. 소대장에게 종료 보고
```

---

## 3. 훅 설계 — settings.json 기반

Claude Code의 `.claude/settings.json`을 활용한 훅 설정:

### 설정 파일 구조

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/pre-write.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/post-write.js"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/session-end.js"
          }
        ]
      }
    ]
  }
}
```

### 훅 스크립트 설계

#### `post-write.js` — 파일 생성 후 저널 기록
```javascript
// .claude/hooks/post-write.js
// PostToolUse(Write) 훅: 파일 생성 시 저널에 자동 기록

const fs = require('fs');
const path = require('path');

const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const filePath = toolInput.file_path || '';
const today = new Date().toISOString().split('T')[0];
const journalPath = path.join(__dirname, `../../journal/session-${today}.md`);

// 저널 파일이 없으면 생성
if (!fs.existsSync(journalPath)) {
  fs.writeFileSync(journalPath, `# 개발 세션 — ${today}\n\n## 작업 로그\n\n`);
}

// 작업 내용 append
const entry = `- [${new Date().toTimeString().slice(0,5)}] 파일 생성: \`${filePath}\`\n`;
fs.appendFileSync(journalPath, entry);
```

#### `session-end.js` — 세션 종료 요약
```javascript
// .claude/hooks/session-end.js
// Stop 훅: 세션 종료 시 요약 생성

const today = new Date().toISOString().split('T')[0];
const summary = `
## 세션 종료 요약 (${today})
- 세션 종료 시각: ${new Date().toTimeString().slice(0,8)}
- 다음 세션 시작 전: CLAUDE.md와 journal/INDEX.md를 먼저 읽으세요.
`;
process.stderr.write(summary);
```

### 환경변수 활용
훅 스크립트에서 활용 가능한 Claude Code 환경변수:
```
CLAUDE_TOOL_NAME      — 현재 실행 중인 도구 이름
CLAUDE_TOOL_INPUT     — 도구 입력값 (JSON)
CLAUDE_TOOL_RESPONSE  — 도구 응답값 (JSON)
CLAUDE_SESSION_ID     — 현재 세션 ID
```

---

## 4. CPC/MCP 연동 (선택)

### MCP 서버 연동 가능 영역

#### TaskManager MCP
현재 내장 Task 시스템을 외부 MCP로 확장 가능:
```json
// .claude/settings.json MCP 설정 (선택)
{
  "mcpServers": {
    "task-manager": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "TASK_FILE": "./journal/tasks.json"
      }
    }
  }
}
```

#### GitHub MCP (선택)
커밋 자동화 및 PR 생성 연동:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

#### 적용 우선순위
1. **즉시 적용 가능**: settings.json 훅 (별도 서버 불필요)
2. **단기 적용**: GitHub MCP (PR/커밋 자동화)
3. **장기 검토**: 외부 Task Manager MCP

---

## 5. 다음 세션 시작 가이드

### 즉시 실행 명령어

```bash
# 1. 프로젝트 디렉토리 이동
cd "10-00-01 오세훈 플랫폼"

# 2. 서버 실행 (개발 모드)
cd server && npm install && node index.js

# 3. 환경변수 설정 (없을 경우)
cp .env.example .env
# .env 파일에서 GEMINI_API_KEY, DATABASE_URL 설정
```

### 세션 시작 프롬프트 (복사 붙여넣기용)

```
CLAUDE.md, journal/INDEX.md, CURRENT_STATUS.md를 읽고
현재 프로젝트 상태를 파악한 후 TaskList를 확인해서
미완료 작업을 알려주세요.
```

### 주요 미완료 작업 (2026-03-21 기준)

| 우선순위 | 작업 | 예상 소요 |
|----------|------|-----------|
| 높음 | PostgreSQL 실제 연결 설정 | 30분 |
| 높음 | `.env` 파일 설정 | 10분 |
| 중간 | DB 마이그레이션 실행 | 20분 |
| 중간 | Gemini API 실 호출 테스트 | 30분 |
| 낮음 | E2E 테스트 실행 | 45분 |
| 낮음 | GitHub Actions 활성화 | 20분 |

### 훅 시스템 설치 (선택)

```bash
# .claude 디렉토리 생성
mkdir -p "10-00-01 오세훈 플랫폼/.claude/hooks"

# settings.json 생성 (위 3. 훅 설계 참고)
# post-write.js, session-end.js 생성 (위 스크립트 참고)
```

---

## 6. 자동화 구현 로드맵

```
Phase A (즉시) — 문서 기반 컨텍스트
  ├── CLAUDE.md 유지 관리 ✅ (T7 완료)
  ├── journal/INDEX.md 업데이트 ✅ (T8 완료)
  └── 세션별 저널 파일 수동 기록

Phase B (단기) — 훅 기반 반자동화
  ├── .claude/settings.json 훅 설정
  ├── post-write.js 저널 자동 기록
  └── session-end.js 종료 요약

Phase C (중기) — MCP 연동
  ├── GitHub MCP (자동 커밋/PR)
  └── 외부 Task Manager 연동

Phase D (장기) — 완전 자동화
  ├── CI/CD에 저널 생성 포함
  ├── Slack/알림 연동
  └── 자동 상태 리포트 생성
```

---

*작성일: 2026-03-21 | 작성: Charlie Squad*
*본 세션 경험 기반 — 향후 자동화 수준에 따라 업데이트 필요*
