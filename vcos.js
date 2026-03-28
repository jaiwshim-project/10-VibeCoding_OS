/* ═══════════════════════════════════════════════════════════
   VCOS — Vibe Coding Operating System  |  Core Utilities
   buildNav · buildProgress · buildFooter · calcComplexity
═══════════════════════════════════════════════════════════ */

const VCOS_VERSION = 'v1.0.0';
const STORAGE_KEY = 'vcos_project';

/* ── Clipboard Helper ────────────────────────────────────── */
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✅ 복사됨!';
    setTimeout(() => btn.textContent = orig, 1800);
  });
}

/* ── Feature Labels ─────────────────────────────────────── */
const FEATURE_LABELS = {
  user_auth:    '👤 사용자 인증/로그인',
  ai_chat:      '💬 AI 채팅/대화',
  ai_recommend: '🎯 AI 추천 시스템',
  payment:      '💳 결제/구독',
  dashboard:    '📊 대시보드/분석',
  content:      '📝 콘텐츠 관리',
  search:       '🔍 검색 기능',
  realtime:     '⚡ 실시간 기능',
  notification: '🔔 알림/Push',
  file_upload:  '📁 파일/이미지 업로드',
  map:          '🗺️ 지도/위치',
  external_api: '🔗 외부 API 연동',
  mobile:       '📱 모바일 반응형',
  multilang:    '🌐 다국어 지원',
  rag:          '🧠 RAG/지식베이스',
  video:        '🎥 영상/미디어',
  lms:          '🎓 LMS/학습 관리',
  ecommerce:    '🛒 인터넷 쇼핑/커머스',
  supabase:        '🗄️ Supabase 연동',
  vercel:          '🚀 Vercel 배포 연동',
  color_theme:     '🎨 컬러 색상과 배경',
  mobile_optimize: '📲 모바일 화면 최적화',
  opacity_optimize:'👁️ 투명도 최적화',
  manual:       '📖 매뉴얼 페이지 (프리미엄 디자인)',
  copyright:    '📜 저작권 등록 자료 생성',
  svg_sitemap:  '🗺️ SVG 구조도',
  chatbot:      '💬 챗봇 인터페이스(RAG)'
};

/* ── Feature Commands (기본 포함 기능 상세 명령어) ────────── */
const FEATURE_COMMANDS = {
  manual: `사용자 매뉴얼 버튼을 푸터에 만들고 상세한 매뉴얼 페이지(manual.html)를 만들어.

아래 디자인 규칙을 반드시 적용해:

### 1. 프리미엄 화이트 테마
- body 배경: bg-gradient-to-b from-slate-50 via-white to-slate-50
- 모든 카드/섹션: 흰색 기반에 은은한 색상 그라데이션 배경
- 전체적으로 밝고 깨끗한 화이트 톤 유지

### 2. 테두리 색상 + 배경색 (섹션별 컬러 코딩)
- 모든 페이지 섹션 카드에 해당 섹션 테마 색상의 테두리(border)를 적용
- 배경은 해당 색상의 아주 연한 그라데이션 (예: linear-gradient(135deg, #eff6ff 0%, #ffffff 40%))
- RQTDW 5단계 카드: 각 단계별 브랜드 컬러 좌측 5px 보더 + 상/우/하 연한 색상 보더 + 그라데이션 배경
  - R(Read): 블루 계열 (#2563eb / #bfdbfe / #eff6ff)
  - Q(Question): 오렌지 계열 (#ea580c / #fed7aa / #fff7ed)
  - T(Think): 그린 계열 (#16a34a / #bbf7d0 / #f0fdf4)
  - D(Discussion): 퍼플 계열 (#9333ea / #d8b4fe / #faf5ff)
  - W(Write): 틸 계열 (#0d9488 / #99f6e4 / #f0fdfa)
- AI 기능 카드: 좌측 3px 색상 보더 + 호버 시 전체 보더 색상 전환 + 4px 상승 애니메이션
- FAQ 카드: 호버 시 블루 보더 + 그라데이션 배경 + 컬러 쉐도우
- 시작하기 Step 카드: 각 스텝별 좌측 4px 컬러 보더 (R→Q→T→D 순서 색상)
- 대시보드 카드: 골드/앰버 테두리 + 아이보리 그라데이션

### 3. 사이드바 메뉴 프리미엄 디자인
- 데스크톱 사이드바: 아이콘 배지 + 컬러 보더 + 활성 상태 그라데이션 + RQTDW 하위 메뉴
- 모바일 TOC: 동일한 아이콘+테두리 디자인 + 하단 RQTDW 5색 바

### 4. 글자 가독성 최대화
- 모든 텍스트 opacity: 100% (투명도 없음)
- 본문 텍스트: text-gray-800 이상 (밝은 회색 사용 금지)
- 제목/헤더: text-gray-900, font-weight: 700+
- 절대 text-gray-400 이하의 본문 텍스트 사용 금지

### 5. PDF 다운로드 기능
- PDF 다운로드는 반드시 window.print() + @media print CSS 방식으로 구현
- html2pdf, html2canvas 방식은 절대 사용하지 않음
- 헤더에 "인쇄/PDF" 버튼 배치
- @media print CSS: 사이드바/FAB 숨김, 본문 전체 너비, page-break-inside: avoid, 컬러 보존

### 6. 추가 프리미엄 요소
- 히어로 섹션: 블루/퍼플 그라데이션 오버레이
- 카드 호버 효과: translateY(-2~4px) + box-shadow 강화
- 반응형: 모바일 최적화 (목차 FAB 버튼 + 오버레이 TOC)
- 스크롤 스파이: IntersectionObserver로 사이드바 활성 메뉴 자동 추적
- FAQ: 아코디언 애니메이션 (max-height 트랜지션)
- 푸터에 매뉴얼 버튼: 앰버/옐로우 색상 테마, 책 아이콘, 새 탭 열기`,

  copyright: `/copyright 실행 — 저작권 등록용 프로그램 명세서(copyright.html) 자동 생성

Phase 1. 프로젝트 분석 (데이터 수집)
- Git 이력 (첫 커밋 날짜, 최종 커밋, 총 커밋 수, 마일스톤)
- 소스 파일 수, 총 줄 수, 파일별 줄 수 통계
- 프로젝트 구조 파악 (index.html, JS, CSS, 서브페이지)

Phase 1.5. 분대 편성 및 병렬 실행
- Alpha: copyright.html 골격 + 탭 1~3 (개요, 기능명세, 시스템구조)
- Bravo: 탭 4~7 (독창적요소, 창작이력, 저작권선언, 구조도)
- Charlie: 메타태그 전 페이지 + footer 저작권 표기 + README.md + SVG 구조도

Phase 2. copyright.html 7탭 구조 생성
- Premium White Theme (배경 #fff, 브랜드 #2563eb/#7c3aed)
- 탭 1: 프로그램 개요 | 탭 2: 기능 명세 | 탭 3: 시스템 구조
- 탭 4: 독창적 요소 | 탭 5: 창작 이력 | 탭 6: 저작권 선언 | 탭 7: 구조도
- PDF 다운로드: window.print() + @media print + A4 최적화

Phase 3. 프로젝트 저작권 표기 보강
- 버전 상수 추가 + Footer 저작권 표기
- 전 페이지 meta author/description/copyright 태그 일괄 추가
- README.md 생성

Phase 4. SVG 아키텍처 구조도 생성
- viewBox 1600x1200, Premium White Theme
- 6개 레이어 수직 구조 (User Input → Core → Phases → Skills → Team → Data)

Phase 5. 검증 (7탭 전환, PDF, 메타태그, Footer, README 확인)`
};

/* ── LocalStorage ────────────────────────────────────────── */
function saveProject(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadProject() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
  catch { return null; }
}
function clearProject() {
  localStorage.removeItem(STORAGE_KEY);
}
function requireProject(redirectUrl) {
  const p = loadProject();
  if (!p || !p.name) { location.href = redirectUrl; return null; }
  return p;
}

/* ── Complexity ──────────────────────────────────────────── */
function calcComplexity(p) {
  const features = p.features || [];
  const fc = features.length;

  let ui = 1;
  if (features.includes('dashboard')) ui += 2;
  if (features.includes('mobile'))    ui += 1;
  if (features.includes('multilang')) ui += 1;
  if (features.includes('video'))     ui += 1;
  ui = Math.min(5, Math.round(ui * (p.scale || 1) / 2));

  let backend = 1;
  if (features.includes('user_auth'))    backend += 1;
  if (features.includes('payment'))      backend += 2;
  if (features.includes('realtime'))     backend += 2;
  if (features.includes('notification')) backend += 1;
  backend = Math.min(5, backend);

  let ai = (p.aiLevel || 0);
  if (features.includes('ai_chat'))      ai += 1;
  if (features.includes('ai_recommend')) ai += 1;
  if (features.includes('rag'))          ai += 2;
  ai = Math.min(5, ai);

  let integration = 0;
  if (features.includes('external_api')) integration += 2;
  if (features.includes('map'))          integration += 1;
  if (features.includes('payment'))      integration += 1;
  integration = Math.min(5, integration);

  let data = 0;
  if (features.includes('rag'))         data += 2;
  if (features.includes('file_upload')) data += 1;
  if (features.includes('search'))      data += 1;
  if (features.includes('dashboard'))   data += 1;
  data = Math.min(5, data);

  let security = 0;
  if (features.includes('user_auth')) security += 1;
  if (features.includes('payment'))   security += 2;
  if (fc > 8)                          security += 1;
  security = Math.min(5, security);

  const total = ui + backend + ai + integration + data + security;
  return { total, ui, backend, ai, integration, data, security, featureCount: fc };
}

function getProjectType(total) {
  if (total < 8)  return { type:'Small',      label:'Small',      color:'#3fb950', badge:'🟢' };
  if (total < 16) return { type:'Medium',     label:'Medium',     color:'#e3b341', badge:'🟡' };
  if (total < 24) return { type:'Large',      label:'Large',      color:'#f0883e', badge:'🟠' };
  return            { type:'Enterprise', label:'Enterprise', color:'#f85149', badge:'🔴' };
}

/* ── Squad Builder ───────────────────────────────────────── */
function buildSquads(p, c) {
  const squads = [];
  const t = c.total;

  squads.push({
    id:'hq', name:'HQ 본부 (소대장+연락병+용병4)', emoji:'🎖️',
    role:'오케스트레이션 / 지휘관 연락 / 용병 AI 조율',
    color:'#8b949e', colorBg:'rgba(139,148,158,.08)', colorBorder:'rgba(139,148,158,.3)',
    agents:[
      { name:'소대장', model:'opus' }, { name:'연락병', model:'haiku' },
      { name:'Gemini (용병)', model:'external' }, { name:'Perplexity (용병)', model:'external' },
      { name:'Grok (용병)', model:'external' },   { name:'ChatGPT (용병)', model:'external' }
    ]
  });
  if (t >= 8) squads.push({
    id:'alpha', name:'Alpha 분대', emoji:'🔴',
    role:'아키텍처 설계 / 요구사항 분석',
    color:'#f85149', colorBg:'rgba(248,81,73,.06)', colorBorder:'rgba(248,81,73,.25)',
    agents:[
      { name:'아키텍트-1', model:'opus' },     { name:'아키텍트-2', model:'opus' },
      { name:'요구사항분석-1', model:'sonnet' },{ name:'요구사항분석-2', model:'sonnet' },
      { name:'요구사항분석-3', model:'sonnet' },{ name:'기술리뷰어-1', model:'sonnet' },
      { name:'기술리뷰어-2', model:'sonnet' }, { name:'기술리뷰어-3', model:'sonnet' },
      { name:'문서작성-1', model:'haiku' },    { name:'문서작성-2', model:'haiku' },
      { name:'문서작성-3', model:'haiku' },    { name:'문서작성-4', model:'haiku' }
    ]
  });
  squads.push({
    id:'bravo', name:'Bravo 분대', emoji:'🔵',
    role:'핵심 개발 / API 구현 / 빌드',
    color:'#58a6ff', colorBg:'rgba(88,166,255,.06)', colorBorder:'rgba(88,166,255,.25)',
    agents:[
      { name:'백엔드개발-1', model:'sonnet' }, { name:'백엔드개발-2', model:'sonnet' },
      { name:'백엔드개발-3', model:'sonnet' }, { name:'백엔드개발-4', model:'sonnet' },
      { name:'프론트엔드-1', model:'sonnet' }, { name:'프론트엔드-2', model:'sonnet' },
      { name:'프론트엔드-3', model:'sonnet' }, { name:'프론트엔드-4', model:'sonnet' },
      { name:'API개발자-1', model:'sonnet' },  { name:'API개발자-2', model:'sonnet' },
      { name:'빌드엔지니어-1', model:'haiku' },{ name:'빌드엔지니어-2', model:'haiku' }
    ]
  });
  squads.push({
    id:'charlie', name:'Charlie 분대', emoji:'🟢',
    role:'QA / 문서화 / 코드 리뷰',
    color:'#3fb950', colorBg:'rgba(63,185,80,.06)', colorBorder:'rgba(63,185,80,.25)',
    agents:[
      { name:'QA엔지니어-1', model:'sonnet' },  { name:'QA엔지니어-2', model:'sonnet' },
      { name:'QA엔지니어-3', model:'sonnet' },  { name:'코드리뷰어-1', model:'sonnet' },
      { name:'코드리뷰어-2', model:'sonnet' },  { name:'코드리뷰어-3', model:'sonnet' },
      { name:'문서화-1', model:'haiku' },        { name:'문서화-2', model:'haiku' },
      { name:'문서화-3', model:'haiku' },        { name:'테스트자동화-1', model:'haiku' },
      { name:'테스트자동화-2', model:'haiku' },  { name:'테스트자동화-3', model:'haiku' }
    ]
  });
  if (t >= 16) squads.push({
    id:'delta', name:'Delta 분대', emoji:'🟠',
    role:'데이터/AI 연동 / EDA',
    color:'#f0883e', colorBg:'rgba(240,136,62,.06)', colorBorder:'rgba(240,136,62,.25)',
    agents:[
      { name:'데이터엔지니어-1', model:'sonnet' },{ name:'데이터엔지니어-2', model:'sonnet' },
      { name:'데이터엔지니어-3', model:'sonnet' },{ name:'AI엔지니어-1', model:'sonnet' },
      { name:'AI엔지니어-2', model:'sonnet' },    { name:'AI엔지니어-3', model:'sonnet' },
      { name:'EDA분석가-1', model:'haiku' },      { name:'EDA분석가-2', model:'haiku' },
      { name:'EDA분석가-3', model:'haiku' },      { name:'모델최적화-1', model:'opus' },
      { name:'모델최적화-2', model:'opus' },      { name:'모델최적화-3', model:'opus' }
    ]
  });
  if (t >= 16) squads.push({
    id:'echo', name:'Echo 분대', emoji:'🟣',
    role:'보안 감사 / 성능 / CI/CD',
    color:'#bc8cff', colorBg:'rgba(188,140,255,.06)', colorBorder:'rgba(188,140,255,.25)',
    agents:[
      { name:'보안감사관-1', model:'opus' },    { name:'보안감사관-2', model:'opus' },
      { name:'성능엔지니어-1', model:'sonnet' },{ name:'성능엔지니어-2', model:'sonnet' },
      { name:'성능엔지니어-3', model:'sonnet' },{ name:'CI/CD엔지니어-1', model:'sonnet' },
      { name:'CI/CD엔지니어-2', model:'sonnet' },{ name:'CI/CD엔지니어-3', model:'sonnet' },
      { name:'모니터링-1', model:'haiku' },     { name:'모니터링-2', model:'haiku' },
      { name:'모니터링-3', model:'haiku' },     { name:'모니터링-4', model:'haiku' }
    ]
  });
  return squads;
}

/* ── Skill Catalogue ─────────────────────────────────────── */
function getRelevantSkills(p, c) {
  const f  = p.features || [];
  const t  = c.total;
  const hasUI    = f.some(x => ['dashboard','mobile','video'].includes(x));
  const hasAPI   = f.some(x => ['user_auth','payment','realtime','notification','external_api','search'].includes(x));
  const hasDB    = f.some(x => ['user_auth','payment','content','search','rag','file_upload','dashboard'].includes(x));
  const hasAuth  = f.some(x => ['user_auth','payment'].includes(x));
  const hasData  = f.some(x => ['rag','dashboard','file_upload'].includes(x));
  const hasVideo = f.includes('video');
  const hasMedia = f.some(x => ['content','file_upload','video'].includes(x));

  return [
    /* ── Phase 1 — 빌드 ─────────────────────────────── */
    { phase:'P1', emoji:'🪖', name:'/platoon-formation-v2',      short:'소대 편제 (66명)',
      cmd:'/platoon-formation-v2',   model: t>=16?'opus':'sonnet',
      desc:'HQ + 최대 5분대(Alpha~Echo) 자동 편성. 복잡도에 따라 필요한 분대만 투입.',
      when:'개발 시작 직후 — 첫 번째 명령', condition:'항상', active:true },
    { phase:'P1', emoji:'🤖', name:'/deploy-subagent-core',       short:'서브에이전트 병렬 투입',
      cmd:'/deploy-subagent-core',   model:'sonnet',
      desc:'병렬 서브에이전트 편성으로 복잡 기능 동시 개발. 속도 3~5배 향상.',
      when:'복잡한 기능 구현 시', condition:'Medium+ 복잡도', active:t>=8 },
    { phase:'P1', emoji:'⚡', name:'/deploy-skill-core',          short:'스킬 조합 편성',
      cmd:'/deploy-skill-core',      model:'sonnet',
      desc:'프로젝트에 최적화된 스킬 조합 선택 및 실행 전략 수립.',
      when:'개발 전략 수립 시', condition:'Medium+ 복잡도', active:t>=8 },
    { phase:'P1', emoji:'🎨', name:'/ui-ux-builder-core',         short:'UX 설계 + UI 구현',
      cmd:'/ui-ux-builder-core',     model:'sonnet',
      desc:'사용자 경험 설계부터 UI 컴포넌트 구현까지 올인원.',
      when:'UI 개발 단계', condition:'UI/대시보드/모바일 기능', active:hasUI || f.length>0 },
    { phase:'P1', emoji:'🎨', name:'/theme-color-design',         short:'테마 색상 디자인',
      cmd:'/theme-color-design',     model:'haiku',
      desc:'브랜드 컬러 팔레트 설계, 프리미엄 화이트 테마, CSS 변수 자동 생성. 접근성 기준(WCAG) 준수.',
      when:'UI 스타일링 단계', condition:'항상', active:true },
    { phase:'P1', emoji:'🤖', name:'/chat-ui-builder',            short:'챗봇 UI (RAG)',
      cmd:'/chat-ui-builder',        model:'haiku',
      desc:'플로팅 버튼 + iframe 챗봇. Supabase pgvector RAG로 문서 기반 정확한 답변 생성.',
      when:'챗봇/AI 기능 구현 단계', condition:'챗봇/RAG/지식베이스 기능', active:f.includes('chatbot')||f.includes('rag')||f.includes('ai_chat') },
    { phase:'P1', emoji:'🔌', name:'/api-builder-core',           short:'REST API 구축',
      cmd:'/api-builder-core',       model:'sonnet',
      desc:'REST API 설계, CRUD 구현, Zod 유효성 검사까지.',
      when:'백엔드 API 구현 단계', condition:'인증/결제/실시간/외부API 기능', active:hasAPI },
    { phase:'P1', emoji:'🗄️', name:'/db-schema-core',            short:'DB 스키마 설계',
      cmd:'/db-schema-core',         model:'sonnet',
      desc:'데이터베이스 스키마 설계, RLS 정책, 마이그레이션 스크립트.',
      when:'DB 설계 단계', condition:'인증/결제/콘텐츠/검색/RAG 기능', active:hasDB },
    { phase:'P1', emoji:'🖼️', name:'/create-image-core',         short:'이미지/다이어그램 생성',
      cmd:'/create-image-core',      model:'haiku',
      desc:'SVG/HTML/Mermaid/Pillow 기반 이미지 및 다이어그램 자동 생성.',
      when:'UI 자산 · 다이어그램 필요 시', condition:'콘텐츠/이미지/영상 기능', active:hasMedia },
    { phase:'P1', emoji:'📄', name:'/doc-generator-core',         short:'문서 자동 생성',
      cmd:'/doc-generator-core',     model:'haiku',
      desc:'PDF/DOCX/PPTX/XLSX/HWP 문서 자동 생성.',
      when:'산출물 문서 필요 시', condition:'Medium+ 복잡도', active:t>=8 },
    { phase:'P1', emoji:'🔍', name:'/find-skills-core',           short:'추가 스킬 탐색',
      cmd:'/find-skills-core',       model:'haiku',
      desc:'오픈 생태계에서 추가 스킬 검색·설치.',
      when:'새로운 기능 필요 시', condition:'Large/Enterprise 복잡도', active:t>=16 },
    { phase:'P1', emoji:'🎥', name:'/youtube-generate-core',      short:'유튜브 영상 자동화',
      cmd:'/youtube-generate-core',  model:'sonnet',
      desc:'소재 → 리서치 → 대본 → 영상 재료 → 블로그 올인원.',
      when:'영상 콘텐츠 생성 시', condition:'영상/미디어 기능만', active:hasVideo },

    /* ── Phase 2 — 고도화 ───────────────────────────── */
    { phase:'P2', emoji:'🔄', name:'/review-evaluate-core',       short:'97점 순환 평가 루프',
      cmd:'/review-evaluate-core',   model:'opus',
      desc:'5기준(아키텍처·코드·보안·성능·유지보수) 자동 평가 후 97점 달성까지 반복 개선.',
      when:'결과물 완성 후 — 최소 3회 반복', condition:'항상', active:true },
    { phase:'P2', emoji:'🛡️', name:'/security-audit-core',        short:'OWASP Top 10 보안감사',
      cmd:'/security-audit-core',    model:'sonnet',
      desc:'OWASP Top 10 기반 보안 취약점 자동 탐지 및 패치.',
      when:'고도화 2~3회차', condition:'인증/결제 기능', active:hasAuth },
    { phase:'P2', emoji:'🧪', name:'/e2e-test-core',              short:'Playwright E2E 테스트',
      cmd:'/e2e-test-core',          model:'sonnet',
      desc:'사용자 시나리오 기반 E2E 테스트 자동 작성 및 실행.',
      when:'UI 완성 후 고도화 단계', condition:'UI/대시보드/모바일 기능', active:hasUI || f.length>0 },
    { phase:'P2', emoji:'🔬', name:'/api-test-core',              short:'Jest/Supertest + 부하테스트',
      cmd:'/api-test-core',          model:'sonnet',
      desc:'API 단위·통합·부하 테스트 자동화.',
      when:'API 완성 후 고도화 단계', condition:'API 있는 프로젝트', active:hasAPI },
    { phase:'P2', emoji:'🔧', name:'/troubleshoot-core',          short:'디버깅 / RCA',
      cmd:'/troubleshoot-core',      model:'sonnet',
      desc:'근본 원인 분석(RCA) 기반 버그 수정 및 문제해결.',
      when:'오류 발생 시 언제든지', condition:'항상', active:true },
    { phase:'P2', emoji:'📈', name:'/performance-check-core',     short:'Lighthouse 성능 최적화',
      cmd:'/performance-check-core', model:'sonnet',
      desc:'Core Web Vitals, Lighthouse 점수 최적화, 번들 분석.',
      when:'고도화 3회차 이후', condition:'Large/Enterprise 복잡도', active:t>=16 },
    { phase:'P2', emoji:'🚀', name:'/cicd-setup-core',            short:'GitHub Actions CI/CD',
      cmd:'/cicd-setup-core',        model:'sonnet',
      desc:'GitHub Actions 파이프라인 구축, 자동 배포 설정.',
      when:'V4 목표 달성 후 배포 단계', condition:'Medium+ 복잡도', active:t>=8 },
    { phase:'P2', emoji:'📊', name:'/exploratory-data-analysis',  short:'EDA 데이터 탐색 분석',
      cmd:'/exploratory-data-analysis', model:'haiku',
      desc:'데이터셋 탐색, 통계 분석, 시각화, 인사이트 도출.',
      when:'데이터 분석 필요 시', condition:'대시보드/RAG/파일업로드 기능', active:hasData },
    { phase:'P2', emoji:'🏗️', name:'/cpc-setup',                  short:'CPC 인프라 구축',
      cmd:'/cpc-setup',              model:'sonnet',
      desc:'Supabase + Vercel + 소대 등록 + 연락병 배포 인프라 구축.',
      when:'Enterprise 인프라 구축 시', condition:'Enterprise 복잡도', active:t>=24 }
  ];
}

/* ── Token Estimate ──────────────────────────────────────── */
function calcTokenEstimate(c) {
  const estimated = 50000 + (c.total * 8000);
  return {
    total:  estimated,
    cost:   (estimated / 1_000_000 * 0.25).toFixed(2),
    haiku:  Math.round(estimated * 0.60),
    sonnet: Math.round(estimated * 0.35),
    opus:   Math.round(estimated * 0.05)
  };
}

/* ── Refinement Scores ───────────────────────────────────── */
function calcRefineScores(c) {
  const v1 = Math.min(75, 55 + c.featureCount);
  const v2 = Math.min(85, v1 + 12);
  const v3 = Math.min(93, v2 + 10);
  const v4 = Math.min(98, v3 + 8);
  return { v1, v2, v3, v4, cycles: c.total > 16 ? 4 : 3 };
}

/* ── Navigation ──────────────────────────────────────────── */
const NAV_ITEMS = [
  { num:'1', label:'인텐트 입력',   file:'01-intent.html' },
  { num:'2', label:'AI 협업 준비',  file:'02-ai-collab.html' },
  { num:'3', label:'복잡도 분석',   file:'03-complexity.html' },
  { num:'4', label:'분대 편성',     file:'04-squad.html' },
  { num:'5', label:'스킬 전략',     file:'05-skills.html' },
  { num:'6', label:'토큰 최적화',   file:'06-token.html' },
  { num:'7', label:'명령어 생성',   file:'07-command.html' }
];

function buildNav(activeNum, isHome) {
  const prefix      = isHome ? 'pages/' : '';
  const homeHref    = isHome ? 'index.html' : '../index.html';
  const refineHref       = `${prefix}07-refinement.html`;
  const salGridHref      = `${prefix}08-sal-grid.html`;
  const debugLoopHref    = `${prefix}09-debug-loop.html`;
  const slideshowHref    = `${prefix}10-slideshow.html`;
  const youtubeHref      = `${prefix}11-youtube.html`;
  const active           = String(activeNum);
  const isRefine         = active === 'R';
  const isSalGrid        = active === 'SG';
  const isDebugLoop      = active === 'D4';
  const isSlideshow      = active === 'SW';
  const isYoutube        = active === 'YT';

  // 1번 메뉴: 인텐트 입력 (드롭다운 부모)
  // 2~7번 메뉴: 서브 메뉴
  const intent   = NAV_ITEMS[0]; // num:'1'
  const subItems = NAV_ITEMS.slice(1); // num:'2'~'7'

  // 부모가 활성인 조건: 현재 페이지가 1~7번 중 하나
  const isPhase1Active = ['1','2','3','4','5','6','7'].includes(active);
  const intentHref     = `${prefix}${intent.file}`;

  const subLinks = subItems.map(item => {
    const isSub = item.num === active;
    return `<a href="${prefix}${item.file}" class="${isSub?'active':''}">
        <span class="nav-num">${item.num}</span>${item.label}</a>`;
  }).join('');

  return `<div class="header-inner">
    <div><div class="logo-mark">V<span>C</span>OS</div><div class="logo-sub">Vibe Coding OS</div></div>
    <nav class="nav-links">
      <a href="${homeHref}" class="home-link">🏠 홈</a>
      <div class="nav-dropdown">
        <div class="nav-dropdown-toggle${isPhase1Active?' active':''}">
          <span class="nav-num" style="${isPhase1Active?'background:rgba(255,255,255,.35)':''}">P1</span>인텐트 입력
          <span class="nav-dropdown-caret">▾</span>
        </div>
        <div class="nav-dropdown-menu">
          <div class="nav-dropdown-menu-inner">
            <a href="${intentHref}" class="${active==='1'?'active':''}">
              <span class="nav-num">1</span>${intent.label}</a>
            ${subLinks}
          </div>
        </div>
      </div>
      <a href="${salGridHref}" class="nav-link${isSalGrid?' active':''}" style="margin-left:6px;${isSalGrid?'':'background:rgba(67,56,202,.12);border:1px solid rgba(67,56,202,.35);'}">
        <span class="nav-num" style="${isSalGrid?'background:rgba(255,255,255,.35)':'background:rgba(67,56,202,.5)'};font-size:7px;width:18px">P2</span>SAL-Grid</a>
      <a href="${debugLoopHref}" class="nav-link${isDebugLoop?' active':''}" style="margin-left:4px;${isDebugLoop?'':'background:rgba(225,29,72,.12);border:1px solid rgba(225,29,72,.35);'}">
        <span class="nav-num" style="${isDebugLoop?'background:rgba(255,255,255,.35)':'background:rgba(225,29,72,.5)'};font-size:7px;width:18px">P3</span>Debug Loop</a>
      <a href="${refineHref}" class="nav-link${isRefine?' active':''}" style="margin-left:4px;${isRefine?'':'background:rgba(234,88,12,.12);border:1px solid rgba(234,88,12,.35);'}">
        <span class="nav-num" style="${isRefine?'background:rgba(255,255,255,.35)':'background:rgba(234,88,12,.5)'};font-size:7px;width:18px">P4</span>고도화</a>
      <a href="${slideshowHref}" class="nav-link${isSlideshow?' active':''}" style="margin-left:4px;${isSlideshow?'':'background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.35);'}">
        <span class="nav-num" style="${isSlideshow?'background:rgba(255,255,255,.35)':'background:rgba(124,58,237,.5)'};font-size:7px;width:18px">P5</span>Slideshow</a>
      <a href="${youtubeHref}" class="nav-link${isYoutube?' active':''}" style="margin-left:4px;${isYoutube?'':'background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);'}">
        <span class="nav-num" style="${isYoutube?'background:rgba(255,255,255,.35)':'background:rgba(245,158,11,.5)'};font-size:7px;width:18px">P6</span>YouTube</a>
    </nav>
  </div>`;
}

/* ── Progress Bar ────────────────────────────────────────── */
const PROGRESS_LABELS = ['인텐트','복잡도','분대','스킬','토큰','명령어'];

function buildProgress(activeNum) {
  const active = parseInt(activeNum);
  return PROGRESS_LABELS.map((label, i) => {
    const n = i + 1;
    const done   = n < active;
    const cur    = n === active;
    const cls    = 'ps' + (done?' done':'') + (cur?' active':'');
    return `<div class="${cls}"><div class="ps-num">${done?'✓':n}</div>${n}. ${label}</div>`;
  }).join('');
}

/* ── Footer ──────────────────────────────────────────────── */
function buildFooter(isHome) {
  const prefix   = isHome ? 'pages/' : '';
  const homeHref = isHome ? 'index.html' : '../index.html';

  const phase1Links = NAV_ITEMS.map(item =>
    `<li><a href="${prefix}${item.file}"><span class="fn">${item.num}</span>${item.label}</a></li>`
  ).join('');

  const refineHrefFooter      = `${prefix}07-refinement.html`;
  const salGridHrefFooter     = `${prefix}08-sal-grid.html`;
  const debugLoopHrefFooter   = `${prefix}09-debug-loop.html`;
  const slideshowHrefFooter   = `${prefix}10-slideshow.html`;
  const youtubeHrefFooter     = `${prefix}11-youtube.html`;

  return `<footer class="vcos-footer">
  <div class="footer-inner">
    <div class="footer-top">

      <div class="footer-brand">
        <div class="footer-logo">V<span>C</span>OS</div>
        <div class="footer-tagline">아이디어를 AI 개발 명령어로 변환하는<br>바이브 코딩 운영체계</div>
        <div class="footer-badge">
          <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;flex-shrink:0"></span>
          25 Skills &nbsp;·&nbsp; 5 Squads &nbsp;·&nbsp; 66명 편제
        </div>
      </div>

      <div class="footer-nav">
        <div class="footer-nav-col">
          <div class="footer-col-title">🚀 Phase 1 — 기획</div>
          <ul class="footer-links">${phase1Links}</ul>
        </div>
        <div class="footer-nav-col">
          <div class="footer-col-title" style="color:rgba(255,165,100,.75)">🔥 P2~P6</div>
          <ul class="footer-links">
            <li><a href="${refineHrefFooter}" style="color:rgba(255,165,100,.9)"><span class="fn" style="background:rgba(234,88,12,.45)">P2</span>고도화 엔진</a></li>
            <li><a href="${salGridHrefFooter}" style="color:rgba(165,180,252,.9)"><span class="fn" style="background:rgba(67,56,202,.45)">P3</span>SAL-Grid</a></li>
            <li><a href="${debugLoopHrefFooter}" style="color:rgba(253,164,175,.9)"><span class="fn" style="background:rgba(225,29,72,.45)">P4</span>Debug Loop</a></li>
            <li><a href="${slideshowHrefFooter}" style="color:rgba(196,181,253,.9)"><span class="fn" style="background:rgba(124,58,237,.45)">P5</span>Slideshow</a></li>
            <li><a href="${youtubeHrefFooter}" style="color:rgba(253,211,77,.9)"><span class="fn" style="background:rgba(245,158,11,.45)">P6</span>YouTube</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-actions">
        <a href="${homeHref}" class="footer-btn footer-btn-primary">🏠 홈으로</a>
        <a href="${prefix}01-intent.html" class="footer-btn footer-btn-ghost">✏️ 새 프로젝트</a>
        <a href="${prefix}07-command.html" class="footer-btn footer-btn-ghost">⚡ 명령어 생성</a>
        <a href="${refineHrefFooter}" class="footer-btn footer-btn-ghost" style="border-color:rgba(234,88,12,.4);color:rgba(255,165,100,.9)">🔥 고도화 엔진</a>
        <a href="${isHome?'pages/sitemap.html':'../pages/sitemap.html'}" class="footer-btn footer-btn-ghost" style="border-color:rgba(8,145,178,.4);color:rgba(103,232,249,.9)">🗺 구조도</a>
        <a href="${prefix}manual.html" class="footer-btn footer-btn-ghost" style="border-color:rgba(124,58,237,.4);color:rgba(167,139,250,.9)">📖 매뉴얼</a>
        <a href="${isHome?'../03-04 AX덴탈그룹/skills/02 스킬 모음 claude-20260305T005001Z-1-001/skills_overview.svg':'../../03-04 AX덴탈그룹/skills/02 스킬 모음 claude-20260305T005001Z-1-001/skills_overview.svg'}" target="_blank" class="footer-btn footer-btn-ghost" style="border-color:rgba(124,58,237,.5);color:rgba(196,181,253,.95);background:rgba(124,58,237,.08);font-weight:700">🗂️ SAL 22 스킬</a>
        <a href="${isHome?'pages/skills-map.html':'../pages/skills-map.html'}" class="footer-btn footer-btn-ghost" style="border-color:rgba(234,88,12,.5);color:rgba(255,200,100,.95);background:rgba(234,88,12,.08);font-weight:700">⚡ 25 스킬 구조도</a>
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="footer-btn footer-btn-ghost" style="border-color:rgba(66,133,244,.5);color:rgba(138,193,255,.95);background:rgba(66,133,244,.08);font-weight:700">🔑 Gemini KEY</a>
      </div>

    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 심재우(Shim Jaewoo). VCOS ${VCOS_VERSION} — Vibe Coding Operating System. All rights reserved.</div>
      <div class="footer-chips">
        <span class="footer-chip">Claude Sonnet</span>
        <span class="footer-chip">25 Skills</span>
        <span class="footer-chip">5 Squads</span>
        <span class="footer-chip">66명 편제</span>
        <span class="footer-chip">Supabase</span>
        <span class="footer-chip">95점 목표</span>
      </div>
    </div>
  </div>
</footer>`;
}
