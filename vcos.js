/* ═══════════════════════════════════════════════════════════
   VCOS — Vibe Coding Operating System  |  Core Utilities
   buildNav · buildProgress · buildFooter · calcComplexity
═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'vcos_project';

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
  supabase:     '🗄️ Supabase 연동',
  vercel:       '🚀 Vercel 배포 연동',
  manual:       '📖 매뉴얼 페이지',
  svg_sitemap:  '🗺️ SVG 구조도',
  chatbot:      '💬 챗봇 인터페이스(RAG)'
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
  { num:'1', label:'인텐트 입력', file:'01-intent.html' },
  { num:'2', label:'복잡도 분석', file:'02-complexity.html' },
  { num:'3', label:'분대 편성',   file:'03-squad.html' },
  { num:'4', label:'스킬 전략',   file:'04-skills.html' },
  { num:'5', label:'토큰 최적화', file:'05-token.html' },
  { num:'6', label:'명령어 생성', file:'06-command.html' }
];

function buildNav(activeNum, isHome) {
  const prefix    = isHome ? 'pages/' : '';
  const homeHref  = isHome ? 'index.html' : '../index.html';
  const refineHref = `${prefix}06-refinement.html`;
  const isRefine   = String(activeNum) === 'R';

  const links = NAV_ITEMS.map(item => {
    const active = item.num === String(activeNum);
    return `<a href="${prefix}${item.file}" class="nav-link${active?' active':''}">
      <span class="nav-num">${item.num}</span>${item.label}</a>`;
  }).join('');

  return `<div class="header-inner">
    <div><div class="logo-mark">V<span>C</span>OS</div><div class="logo-sub">Vibe Coding OS</div></div>
    <nav class="nav-links">
      <a href="${homeHref}" class="home-link">🏠 홈</a>${links}
      <a href="${refineHref}" class="nav-link${isRefine?' active':''}" style="margin-left:6px;background:rgba(234,88,12,.12);border:1px solid rgba(234,88,12,.35);color:rgba(255,255,255,.9)">
        <span class="nav-num" style="background:rgba(234,88,12,.5);font-size:7px;width:18px">P2</span>고도화</a>
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

  const refineHrefFooter = `${prefix}06-refinement.html`;

  return `<footer class="vcos-footer">
  <div class="footer-inner">
    <div class="footer-top">

      <div class="footer-brand">
        <div class="footer-logo">V<span>C</span>OS</div>
        <div class="footer-tagline">아이디어를 AI 개발 명령어로 변환하는<br>바이브 코딩 운영체계</div>
        <div class="footer-badge">
          <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;flex-shrink:0"></span>
          21 Skills &nbsp;·&nbsp; 5 Squads &nbsp;·&nbsp; 66명 편제
        </div>
      </div>

      <div style="display:flex;gap:36px;align-items:flex-start">
        <div>
          <div class="footer-col-title" style="color:rgba(255,255,255,.5);margin-bottom:6px">🚀 Phase 1 — 기획</div>
          <ul class="footer-links">${phase1Links}</ul>
        </div>
        <div>
          <div class="footer-col-title" style="color:rgba(255,165,100,.7);margin-bottom:6px">🔥 Phase 2 — 고도화</div>
          <ul class="footer-links">
            <li><a href="${refineHrefFooter}" style="color:rgba(255,165,100,.85)"><span class="fn" style="background:rgba(234,88,12,.4);color:rgba(255,255,255,.9)">P2</span>결과물 고도화 엔진</a></li>
          </ul>
        </div>
      </div>

      <div style="width:100%">
        <div style="display:flex;flex-direction:row;flex-wrap:wrap;gap:7px;align-items:center">
          <a href="${homeHref}" class="footer-btn footer-btn-primary">🏠 홈으로</a>
          <a href="${prefix}01-intent.html" class="footer-btn footer-btn-ghost">✏️ 새 프로젝트</a>
          <a href="${prefix}06-command.html" class="footer-btn footer-btn-ghost">⚡ 명령어 생성</a>
          <a href="${refineHrefFooter}" class="footer-btn footer-btn-ghost" style="border-color:rgba(234,88,12,.4);color:rgba(255,165,100,.9)">🔥 고도화 엔진</a>
          <a href="${isHome?'pages/sitemap.html':'../pages/sitemap.html'}" class="footer-btn footer-btn-ghost" style="border-color:rgba(8,145,178,.4);color:rgba(103,232,249,.9)">🗺 구조도</a>
          <a href="${prefix}manual.html" class="footer-btn footer-btn-ghost" style="border-color:rgba(124,58,237,.4);color:rgba(167,139,250,.9)">📖 매뉴얼</a>
        </div>
      </div>

    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 VCOS — Vibe Coding Operating System. Powered by Claude.</div>
      <div class="footer-chips">
        <span class="footer-chip">Claude Sonnet</span>
        <span class="footer-chip">21 Skills</span>
        <span class="footer-chip">5 Squads</span>
        <span class="footer-chip">66명 편제</span>
        <span class="footer-chip">Supabase</span>
        <span class="footer-chip">95점 목표</span>
      </div>
    </div>
  </div>
</footer>`;
}
