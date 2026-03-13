---
description: "챗봇 UI 빌더 — 플로팅 버튼 + iframe + RAG 지식베이스 연동 챗봇 자동 생성"
user-invocable: true
---

# /chat-ui-builder — 챗봇 UI 빌더 (RAG 포함)

웹 페이지에 **오른쪽 하단 플로팅 버튼**과 **iframe 챗봇 창**을 자동으로 추가한다.
**RAG(Retrieval-Augmented Generation)** 기술로 프로젝트 문서를 벡터 검색하여 정확한 답변을 생성한다.
Claude Haiku 모델 + Supabase pgvector 백엔드를 사용한다.

## Usage
/chat-ui-builder [target_file_or_project]

## Phase 1. 프로젝트 분석

### 분석 보고
```
🤖 챗봇 UI 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
프로젝트: {프로젝트명}
삽입 위치: {파일 경로}
챗봇 용도: {고객지원 / 도우미 / 튜터 / 기타}
백엔드: Claude Haiku + Supabase pgvector (RAG)
UI 방식: 플로팅 버튼 + iframe 오버레이
```

## Phase 2. 파일 구조 생성

```
chatbot/
├── chat.html          # iframe 챗봇 UI (RAG 검색 포함)
├── chat-widget.js     # 플로팅 버튼 + iframe 제어
├── rag-indexer.html   # 관리자용: 문서 임베딩 & Supabase 저장
└── rag-config.js      # RAG 설정 (Supabase URL, 컬렉션명)
```

## Phase 3. Supabase RAG 설정

### Supabase SQL — 벡터 테이블 생성
```sql
-- pgvector 확장 활성화
create extension if not exists vector;

-- 지식베이스 테이블
create table chat_documents (
  id         bigserial primary key,
  content    text not null,
  embedding  vector(1536),
  metadata   jsonb default '{}',
  source     text,
  created_at timestamptz default now()
);

-- 유사도 검색 인덱스
create index on chat_documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 유사도 검색 함수
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count     int   default 5
)
returns table (id bigint, content text, metadata jsonb, similarity float)
language sql stable as $$
  select id, content, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from chat_documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

### rag-config.js
```js
const RAG_CONFIG = {
  supabaseUrl:  localStorage.getItem('supabaseUrl')  || '',
  supabaseKey:  localStorage.getItem('supabaseKey')  || '',
  anthropicKey: localStorage.getItem('chatApiKey')   || '',
  tableName:    'chat_documents',
  matchCount:   5,
  threshold:    0.65,
  model:        'claude-haiku-4-5-20251001',
  embedModel:   'voyage-3'  // 또는 text-embedding-3-small (OpenAI)
};
```

## Phase 4. RAG 검색 파이프라인

### chat.html — 핵심 RAG 로직
```js
// 1. 임베딩 생성 (Voyage AI 또는 Claude Embeddings)
async function getEmbedding(text) {
  // 옵션 A: Voyage AI (Anthropic 파트너)
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RAG_CONFIG.voyageKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, model: 'voyage-3' })
  });
  const data = await res.json();
  return data.data[0].embedding;
}

// 2. Supabase 유사도 검색
async function searchDocs(query) {
  const embedding = await getEmbedding(query);
  const { createClient } = supabase;
  const db = createClient(RAG_CONFIG.supabaseUrl, RAG_CONFIG.supabaseKey);
  const { data } = await db.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: RAG_CONFIG.threshold,
    match_count:     RAG_CONFIG.matchCount
  });
  return data || [];
}

// 3. RAG 컨텍스트 주입
async function sendMsgWithRAG(userMsg) {
  const docs = await searchDocs(userMsg);
  const context = docs.map((d, i) =>
    `[참고 ${i+1}] ${d.content}`
  ).join('\n\n');

  const systemPrompt = SYSTEM_PROMPT + (context ? `

## 참고 문서 (RAG 검색 결과)
${context}

위 문서를 기반으로 정확하게 답변하세요. 문서에 없는 내용은 모른다고 하세요.` : '');

  // Claude Haiku API 호출 (컨텍스트 포함)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': RAG_CONFIG.anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: RAG_CONFIG.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })
  });
  return (await res.json()).content?.[0]?.text || '오류가 발생했습니다.';
}
```

## Phase 5. 문서 인덱서 (rag-indexer.html)

```html
<!-- 관리자용 문서 임베딩 도구 -->
<!-- 텍스트/파일을 붙여넣으면 청크 분할 → 임베딩 → Supabase 저장 -->

청크 분할 전략:
- 최대 500 토큰 (약 400자)
- 50자 오버랩으로 컨텍스트 연속성 유지
- 문단/줄바꿈 기준 자연스럽게 분할
```

## Phase 6. 플로팅 버튼 + iframe

### chat-widget.js
```js
(function() {
  const CHAT_URL = './chatbot/chat.html';
  const btn = document.createElement('button');
  btn.id = 'chat-float-btn';
  btn.innerHTML = '💬';
  btn.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    width:56px; height:56px; border-radius:50%;
    background:linear-gradient(135deg,#2563eb,#1d4ed8);
    color:#fff; font-size:22px; border:none; cursor:pointer;
    box-shadow:0 4px 20px rgba(37,99,235,.45);
    transition:all .2s cubic-bezier(.4,0,.2,1);
    display:flex; align-items:center; justify-content:center;
  `;
  const panel = document.createElement('div');
  panel.style.cssText = `
    position:fixed; bottom:92px; right:24px; z-index:9998;
    width:380px; height:580px; border-radius:16px;
    box-shadow:0 12px 48px rgba(0,0,0,.18);
    overflow:hidden; display:none; border:1.5px solid #e2e8f0;
  `;
  const iframe = document.createElement('iframe');
  iframe.src = CHAT_URL;
  iframe.style.cssText = 'width:100%;height:100%;border:none';
  panel.appendChild(iframe);
  let open = false;
  btn.onclick = () => {
    open = !open;
    panel.style.display = open ? 'block' : 'none';
    btn.innerHTML = open ? '✕' : '💬';
    btn.style.background = open
      ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
      : 'linear-gradient(135deg,#2563eb,#1d4ed8)';
  };
  document.body.appendChild(panel);
  document.body.appendChild(btn);
})();
```

## Phase 7. 최종 보고

```
✅ 챗봇 UI 빌더 (RAG) 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI:      플로팅 버튼 (우하단) + iframe 오버레이 (380×580)
모델:    Claude Haiku (claude-haiku-4-5-20251001)
RAG:     Supabase pgvector + Voyage AI 임베딩 (1536차원)
파일:    chatbot/chat.html, chat-widget.js, rag-indexer.html

설정 방법:
  1. Supabase에서 pgvector SQL 실행 (Phase 3 참조)
  2. rag-indexer.html로 문서 임베딩 & 저장
  3. 브라우저 콘솔에서 API 키 등록:
     localStorage.setItem('chatApiKey', 'sk-ant-...')
     localStorage.setItem('supabaseUrl', 'https://xxx.supabase.co')
     localStorage.setItem('supabaseKey', 'eyJ...')
  4. 메인 HTML </body> 직전: <script src="./chatbot/chat-widget.js">
```
