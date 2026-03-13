/* ═══════════════════════════════════════════════════════════
   VCOS — Supabase Client
   ① 이 파일을 열어 아래 두 값을 채우세요
   ② Supabase 대시보드 → Settings → API 에서 복사
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://haxcktfnuudlqciyljtp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGNrdGZudXVkbHFjaXlsanRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDUwNDAsImV4cCI6MjA4NDg4MTA0MH0.suN7BeaHx3MjaNlMDQa0940P-rMl2XPyk4ksoQEU3YM';

/* ── 클라이언트 초기화 ── */
const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ══════════════════════════════════════════════════════════
   PROJECT CRUD
══════════════════════════════════════════════════════════ */

/**
 * 프로젝트 저장 (create or update)
 * localStorage 대체
 */
async function saveProjectDB(data) {
  const payload = {
    name:         data.name,
    purpose:      data.purpose      || '',
    target_users: data.users        || [],
    features:     data.features     || [],
    ai_level:     data.aiLevel      || 0,
    scale:        data.scale        || 1,
    tech_stack:   data.techStack    || '',
    updated_at:   new Date().toISOString()
  };

  // 기존 프로젝트 ID가 있으면 update, 없으면 insert
  const existingId = localStorage.getItem('vcosProjectId');

  if (existingId) {
    const { data: row, error } = await db
      .from('projects')
      .update(payload)
      .eq('id', existingId)
      .select()
      .single();
    if (error) { console.error('saveProjectDB update:', error); throw error; }
    return row;
  } else {
    const { data: row, error } = await db
      .from('projects')
      .insert(payload)
      .select()
      .single();
    if (error) { console.error('saveProjectDB insert:', error); throw error; }
    localStorage.setItem('vcosProjectId', row.id);  // ID만 로컬에 보관
    return row;
  }
}

/**
 * 프로젝트 불러오기
 */
async function loadProjectDB() {
  const id = localStorage.getItem('vcosProjectId');
  if (!id) return null;

  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('loadProjectDB:', error); return null; }

  // VCOS 내부 포맷으로 변환
  return {
    name:      data.name,
    purpose:   data.purpose,
    users:     data.target_users,
    features:  data.features,
    aiLevel:   data.ai_level,
    scale:     data.scale,
    techStack: data.tech_stack,
    savedAt:   new Date(data.updated_at).getTime()
  };
}

/**
 * 분석 결과 저장 (02~07 자동 생성 데이터)
 */
async function saveAnalysisDB(projectId, analysisData) {
  const { error } = await db
    .from('project_analysis')
    .upsert({
      project_id:        projectId,
      score_ui:          analysisData.ui,
      score_backend:     analysisData.backend,
      score_ai:          analysisData.ai,
      score_integration: analysisData.integration,
      score_data:        analysisData.data,
      score_security:    analysisData.security,
      total_score:       analysisData.total,
      project_type:      analysisData.projectType,
      squads:            analysisData.squads      || null,
      selected_skills:   analysisData.skills      || null,
      token_policy:      analysisData.tokenPolicy || null,
      generated_command: analysisData.command     || null,
      calculated_at:     new Date().toISOString()
    }, { onConflict: 'project_id' });

  if (error) console.error('saveAnalysisDB:', error);
}

/**
 * 분석 결과 불러오기
 */
async function loadAnalysisDB(projectId) {
  const { data, error } = await db
    .from('project_analysis')
    .select('*')
    .eq('project_id', projectId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

/* ══════════════════════════════════════════════════════════
   PROJECT LIST (여러 프로젝트 관리)
══════════════════════════════════════════════════════════ */

async function listProjectsDB() {
  const { data, error } = await db
    .from('projects')
    .select('id, name, status, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) { console.error('listProjectsDB:', error); return []; }
  return data;
}

async function deleteProjectDB(projectId) {
  const { error } = await db
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) { console.error('deleteProjectDB:', error); return false; }
  if (localStorage.getItem('vcosProjectId') === projectId) {
    localStorage.removeItem('vcosProjectId');
  }
  return true;
}

/* ══════════════════════════════════════════════════════════
   CCO 연동 — 분대 → 에이전트 자동 생성
══════════════════════════════════════════════════════════ */

async function launchToCCO(projectId) {
  const analysis = await loadAnalysisDB(projectId);
  if (!analysis?.squads) {
    alert('먼저 분대 편성(Section 3)을 완료해주세요.');
    return;
  }

  const squads = Array.isArray(analysis.squads) ? analysis.squads : [];
  const agents = [];

  for (const squad of squads) {
    for (const agent of (squad.agents || [])) {
      agents.push({
        project_id: projectId,
        squad_id:   squad.id,
        name:       agent.name || `${squad.name}-01`,
        type:       agent.role || squad.id,
        model:      analysis.token_policy?.default_model || 'haiku',
        status:     'idle'
      });
    }
  }

  if (agents.length > 0) {
    const { error } = await db.from('agents').insert(agents);
    if (error) { console.error('launchToCCO agents:', error); return; }
  }

  // CCO Execution 페이지로 이동
  const ccoBase = '../51-1 클로드코드 오케스트레이션';
  window.location.href = `${ccoBase}/execution.html?project=${projectId}`;
}

/* ══════════════════════════════════════════════════════════
   기존 localStorage 호환 레이어
   — vcos.js의 saveProject/loadProject를 그대로 유지하면서
     Supabase에도 동시 저장
══════════════════════════════════════════════════════════ */

const _origSaveProject = window.saveProject;
window.saveProjectWithDB = async function(data) {
  // 기존 localStorage 저장 유지 (즉시 반응성)
  if (typeof saveProject === 'function') saveProject(data);

  // Supabase 비동기 저장 (백그라운드)
  try {
    await saveProjectDB(data);
  } catch (e) {
    console.warn('Supabase 저장 실패, localStorage만 사용합니다:', e.message);
  }
};
