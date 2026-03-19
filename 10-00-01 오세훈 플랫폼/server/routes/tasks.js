/**
 * 태스크 협업 관리 API 라우트
 * Charlie 분대 — Task #39
 *
 * 엔드포인트:
 *   GET    /api/tasks            태스크 목록 (필터: status, priority, assignee, search, page, limit)
 *   GET    /api/tasks/stats      통계 요약
 *   GET    /api/tasks/:id        특정 태스크 + 댓글 + 서브태스크
 *   POST   /api/tasks            새 태스크 생성
 *   PUT    /api/tasks/:id        태스크 전체 수정
 *   PATCH  /api/tasks/:id/status 상태만 변경
 *   DELETE /api/tasks/:id        태스크 삭제
 *
 *   GET    /api/tasks/:id/comments       댓글 목록
 *   POST   /api/tasks/:id/comments       댓글 생성
 *   DELETE /api/tasks/:id/comments/:cid  댓글 삭제
 *
 *   GET    /api/tasks/:id/subtasks        서브태스크 목록
 *   POST   /api/tasks/:id/subtasks        서브태스크 추가
 *   PATCH  /api/tasks/:id/subtasks/:sid   서브태스크 완료 토글
 *   DELETE /api/tasks/:id/subtasks/:sid   서브태스크 삭제
 *
 *   POST   /api/tasks/:id/assignees       담당자 추가
 *   DELETE /api/tasks/:id/assignees/:uid  담당자 제거
 */

'use strict';

const express = require('express');
const router = express.Router();

// 미들웨어 임포트 (auth.js에서 내보낸 함수)
const { verifyToken, sendError, sendSuccess } = require('../middleware/auth');

/* ============================================================
   인메모리 데이터 스토어 (DB 미연결 환경용 Fallback)
   실제 운영에서는 아래 db 쿼리 함수를 주석 해제하고
   MOCK 데이터를 제거합니다.
   ============================================================ */

let _taskSeq = 10;
let _commentSeq = 100;
let _subtaskSeq = 1000;

const MOCK_TASKS = [
  {
    id: 1,
    title: '도봉구 캠프 전략 수정',
    description: '도봉구 지지층 결집 전략을 수정하고 유권자 접점 행사 일정 확정',
    assignees: ['전략팀', '이수진'],
    status: 'in-progress',
    priority: 'high',
    due_date: '2026-03-25',
    tags: ['전략', '지역'],
    subtasks: [
      { id: 1, task_id: 1, text: '현황 분석 보고서 작성', done: true, created_at: new Date('2026-03-18') },
      { id: 2, task_id: 1, text: '주요 공약 재정리', done: true, created_at: new Date('2026-03-18') },
      { id: 3, task_id: 1, text: '유권자 접점 일정 확정', done: false, created_at: new Date('2026-03-18') },
    ],
    created_by: 'admin',
    created_at: new Date('2026-03-18'),
    updated_at: new Date('2026-03-19'),
  },
  {
    id: 2,
    title: '강남구 경제정책 강조 자료 준비',
    description: '강남구 지역 특성에 맞는 경제정책 자료 작성 및 인쇄물 발주',
    assignees: ['정책팀', '김민준'],
    status: 'pending',
    priority: 'high',
    due_date: '2026-03-22',
    tags: ['정책', '자료'],
    subtasks: [
      { id: 4, task_id: 2, text: '자료 초안 작성', done: false, created_at: new Date('2026-03-17') },
      { id: 5, task_id: 2, text: '디자인 팀 검토', done: false, created_at: new Date('2026-03-17') },
    ],
    created_by: 'admin',
    created_at: new Date('2026-03-17'),
    updated_at: new Date('2026-03-17'),
  },
  {
    id: 3,
    title: '판세 분석 보고서 작성',
    description: '주간 판세 분석 및 선거구별 전략 보고서 — 후보자 보고용',
    assignees: ['분석팀'],
    status: 'in-progress',
    priority: 'high',
    due_date: '2026-03-20',
    tags: ['판세', '보고서'],
    subtasks: [
      { id: 6, task_id: 3, text: '여론조사 데이터 수집', done: true, created_at: new Date('2026-03-16') },
      { id: 7, task_id: 3, text: '지역별 분석', done: false, created_at: new Date('2026-03-16') },
    ],
    created_by: 'admin',
    created_at: new Date('2026-03-16'),
    updated_at: new Date('2026-03-19'),
  },
  {
    id: 4,
    title: '유권자 여론조사 데이터 입력',
    description: '최신 여론조사 결과를 시스템에 입력하고 대시보드 반영',
    assignees: ['데이터팀', '박서연'],
    status: 'completed',
    priority: 'medium',
    due_date: '2026-03-19',
    tags: ['데이터', '여론조사'],
    subtasks: [
      { id: 8, task_id: 4, text: '원시 데이터 정리', done: true, created_at: new Date('2026-03-15') },
      { id: 9, task_id: 4, text: 'DB 입력', done: true, created_at: new Date('2026-03-15') },
      { id: 10, task_id: 4, text: '검증 및 확인', done: true, created_at: new Date('2026-03-15') },
    ],
    created_by: 'admin',
    created_at: new Date('2026-03-15'),
    updated_at: new Date('2026-03-18'),
  },
  {
    id: 5,
    title: '캠프 일정 조율',
    description: '지역별 방문 일정 및 행사 일정 최종 확인 — 4월 일정 포함',
    assignees: ['일정팀', '최지원'],
    status: 'pending',
    priority: 'medium',
    due_date: '2026-03-21',
    tags: ['일정'],
    subtasks: [],
    created_by: 'admin',
    created_at: new Date('2026-03-17'),
    updated_at: new Date('2026-03-17'),
  },
];

let MOCK_COMMENTS = [
  { id: 1, task_id: 1, author: 'admin', text: '전략 방향 조율 완료. 이수진 팀장 확인 요청합니다.', created_at: new Date('2026-03-19T10:30:00') },
  { id: 2, task_id: 1, author: '이수진', text: '확인했습니다. 일정 부분은 내일 오전까지 확정하겠습니다.', created_at: new Date('2026-03-19T11:00:00') },
];

/** 모든 tasks를 담은 배열 (인메모리 DB 역할) */
let tasks = MOCK_TASKS.map(t => ({ ...t }));
let comments = MOCK_COMMENTS.map(c => ({ ...c }));

/* ============================================================
   헬퍼 함수
   ============================================================ */

/** 오늘보다 마감일이 지난 태스크 여부 */
function isOverdue(task) {
  if (!task.due_date || task.status === 'completed') return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

/** 서브태스크 진행률 계산 */
function calcProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return null;
  const done = subtasks.filter(s => s.done).length;
  return { done, total: subtasks.length, percent: Math.round((done / subtasks.length) * 100) };
}

/** 태스크에 댓글 수 + 진행률 어노테이션 */
function annotateTask(task) {
  const taskComments = comments.filter(c => c.task_id === task.id);
  return {
    ...task,
    comment_count: taskComments.length,
    progress: calcProgress(task.subtasks),
    is_overdue: isOverdue(task),
  };
}

/** 입력 검증 헬퍼 */
function validateTaskInput(body) {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 2) {
    errors.push('title: 2자 이상 입력하세요');
  }
  if (body.status && !['pending', 'in-progress', 'completed'].includes(body.status)) {
    errors.push('status: pending | in-progress | completed 중 하나여야 합니다');
  }
  if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
    errors.push('priority: low | medium | high 중 하나여야 합니다');
  }
  if (body.due_date && isNaN(Date.parse(body.due_date))) {
    errors.push('due_date: 유효한 날짜 형식이어야 합니다 (YYYY-MM-DD)');
  }
  return errors;
}

/* ============================================================
   ROUTES
   ============================================================ */

/* ─────────────────────────────────────────
   GET /api/tasks — 태스크 목록
   Query: status, priority, assignee, search, page, limit, sort
   ───────────────────────────────────────── */
router.get('/', verifyToken, (req, res) => {
  try {
    const { status, priority, assignee, search, sort = 'created_at_desc' } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    let result = tasks.slice(); // 얕은 복사

    // 필터
    if (status) result = result.filter(t => t.status === status);
    if (priority) result = result.filter(t => t.priority === priority);
    if (assignee) result = result.filter(t => (t.assignees || []).some(a => a.includes(assignee)));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    // 정렬
    const [sortField, sortDir] = sort.split('_').reduce((acc, part, i, arr) => {
      if (i === arr.length - 1) { acc[1] = part; } else { acc[0] = (acc[0] ? acc[0] + '_' : '') + part; }
      return acc;
    }, ['', 'desc']);

    const fieldMap = { created_at: 'created_at', updated_at: 'updated_at', due_date: 'due_date', priority: 'priority' };
    const field = fieldMap[sortField] || 'created_at';

    result.sort((a, b) => {
      const av = a[field] ? new Date(a[field]) : new Date(0);
      const bv = b[field] ? new Date(b[field]) : new Date(0);
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    // 페이지네이션
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = result.slice(offset, offset + limit).map(annotateTask);

    return sendSuccess(res, 200, {
      tasks: paged,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    }, 'Tasks retrieved');
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    return sendError(res, 500, 'Failed to retrieve tasks');
  }
});

/* ─────────────────────────────────────────
   GET /api/tasks/stats — 통계 요약
   (주의: stats 라우트는 :id보다 먼저 등록)
   ───────────────────────────────────────── */
router.get('/stats', verifyToken, (req, res) => {
  try {
    const today = new Date(new Date().toDateString());

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(isOverdue).length;
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // 최근 7일 완료 추이
    const last7days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = tasks.filter(t => {
        if (t.status !== 'completed') return false;
        const updated = t.updated_at ? new Date(t.updated_at).toISOString().split('T')[0] : null;
        return updated === dateStr;
      }).length;
      last7days.push({ date: dateStr, completed: count });
    }

    // 우선순위 분포
    const priorityDist = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    return sendSuccess(res, 200, {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      highPriority,
      completionRate,
      last7days,
      priorityDist,
    }, 'Task stats retrieved');
  } catch (err) {
    console.error('GET /api/tasks/stats error:', err);
    return sendError(res, 500, 'Failed to retrieve task stats');
  }
});

/* ─────────────────────────────────────────
   GET /api/tasks/:id — 특정 태스크 상세
   ───────────────────────────────────────── */
router.get('/:id', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const taskComments = comments.filter(c => c.task_id === id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return sendSuccess(res, 200, {
      ...annotateTask(task),
      comments: taskComments,
    }, 'Task retrieved');
  } catch (err) {
    console.error('GET /api/tasks/:id error:', err);
    return sendError(res, 500, 'Failed to retrieve task');
  }
});

/* ─────────────────────────────────────────
   POST /api/tasks — 태스크 생성
   ───────────────────────────────────────── */
router.post('/', verifyToken, (req, res) => {
  try {
    const { title, description, assignee, assignees, dueDate, due_date, priority, status, tags, createdBy, created_by } = req.body;

    // 담당자: assignees 배열 또는 assignee 단일 문자열 모두 허용
    let assigneeList = [];
    if (Array.isArray(assignees)) {
      assigneeList = assignees.filter(Boolean);
    } else if (assignee) {
      assigneeList = String(assignee).split(',').map(s => s.trim()).filter(Boolean);
    }

    const errors = validateTaskInput({ title, priority, status, due_date: dueDate || due_date });
    if (errors.length) return sendError(res, 400, errors.join('; '));

    const newTask = {
      id: ++_taskSeq,
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      assignees: assigneeList,
      status: status || 'pending',
      priority: priority || 'medium',
      due_date: dueDate || due_date || null,
      tags: Array.isArray(tags) ? tags : [],
      subtasks: [],
      created_by: createdBy || created_by || (req.user && req.user.email) || 'unknown',
      created_at: new Date(),
      updated_at: new Date(),
    };

    tasks.unshift(newTask);

    return sendSuccess(res, 201, annotateTask(newTask), 'Task created successfully');
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    return sendError(res, 500, 'Failed to create task');
  }
});

/* ─────────────────────────────────────────
   PUT /api/tasks/:id — 태스크 전체 수정
   ───────────────────────────────────────── */
router.put('/:id', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const { title, description, assignee, assignees, status, priority, dueDate, due_date, tags } = req.body;

    const errors = validateTaskInput({ title: title || task.title, priority: priority || task.priority, status: status || task.status, due_date: dueDate || due_date || task.due_date });
    if (errors.length) return sendError(res, 400, errors.join('; '));

    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.due_date = dueDate;
    if (due_date !== undefined) task.due_date = due_date;
    if (Array.isArray(tags)) task.tags = tags;

    if (Array.isArray(assignees)) {
      task.assignees = assignees.filter(Boolean);
    } else if (assignee !== undefined) {
      task.assignees = String(assignee).split(',').map(s => s.trim()).filter(Boolean);
    }

    task.updated_at = new Date();

    return sendSuccess(res, 200, annotateTask(task), 'Task updated successfully');
  } catch (err) {
    console.error('PUT /api/tasks/:id error:', err);
    return sendError(res, 500, 'Failed to update task');
  }
});

/* ─────────────────────────────────────────
   PATCH /api/tasks/:id/status — 상태만 변경
   ───────────────────────────────────────── */
router.patch('/:id/status', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const { status } = req.body;
    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return sendError(res, 400, 'Invalid status. Must be: pending | in-progress | completed');
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    task.status = status;
    task.updated_at = new Date();

    return sendSuccess(res, 200, { id, status, updated_at: task.updated_at }, 'Task status updated');
  } catch (err) {
    console.error('PATCH /api/tasks/:id/status error:', err);
    return sendError(res, 500, 'Failed to update task status');
  }
});

/* ─────────────────────────────────────────
   DELETE /api/tasks/:id — 태스크 삭제
   ───────────────────────────────────────── */
router.delete('/:id', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return sendError(res, 404, 'Task not found');

    tasks.splice(idx, 1);
    // 연관 댓글도 삭제
    comments = comments.filter(c => c.task_id !== id);

    return sendSuccess(res, 200, { id }, 'Task deleted successfully');
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err);
    return sendError(res, 500, 'Failed to delete task');
  }
});

/* ============================================================
   댓글 엔드포인트
   ============================================================ */

/**
 * GET /api/tasks/:id/comments
 * 특정 태스크의 댓글 목록
 */
router.get('/:id/comments', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const taskComments = comments
      .filter(c => c.task_id === id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return sendSuccess(res, 200, taskComments, 'Comments retrieved');
  } catch (err) {
    console.error('GET /api/tasks/:id/comments error:', err);
    return sendError(res, 500, 'Failed to retrieve comments');
  }
});

/**
 * POST /api/tasks/:id/comments
 * 댓글 생성
 */
router.post('/:id/comments', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const { text, author } = req.body;
    if (!text || String(text).trim().length === 0) {
      return sendError(res, 400, 'Comment text is required');
    }

    const newComment = {
      id: ++_commentSeq,
      task_id: id,
      author: author || (req.user && req.user.email) || 'anonymous',
      text: String(text).trim(),
      created_at: new Date(),
    };

    comments.push(newComment);

    return sendSuccess(res, 201, newComment, 'Comment added');
  } catch (err) {
    console.error('POST /api/tasks/:id/comments error:', err);
    return sendError(res, 500, 'Failed to add comment');
  }
});

/**
 * DELETE /api/tasks/:id/comments/:cid
 * 댓글 삭제 (작성자 또는 admin만)
 */
router.delete('/:id/comments/:cid', verifyToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const commentId = parseInt(req.params.cid);
    if (isNaN(taskId) || isNaN(commentId)) return sendError(res, 400, 'Invalid ID');

    const idx = comments.findIndex(c => c.id === commentId && c.task_id === taskId);
    if (idx === -1) return sendError(res, 404, 'Comment not found');

    const comment = comments[idx];
    const userEmail = req.user && req.user.email;
    const userRole = req.user && req.user.role;

    if (comment.author !== userEmail && userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this comment');
    }

    comments.splice(idx, 1);
    return sendSuccess(res, 200, { id: commentId }, 'Comment deleted');
  } catch (err) {
    console.error('DELETE /api/tasks/:id/comments/:cid error:', err);
    return sendError(res, 500, 'Failed to delete comment');
  }
});

/* ============================================================
   서브태스크 엔드포인트
   ============================================================ */

/**
 * GET /api/tasks/:id/subtasks
 */
router.get('/:id/subtasks', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    return sendSuccess(res, 200, {
      subtasks: task.subtasks || [],
      progress: calcProgress(task.subtasks),
    }, 'Subtasks retrieved');
  } catch (err) {
    console.error('GET /api/tasks/:id/subtasks error:', err);
    return sendError(res, 500, 'Failed to retrieve subtasks');
  }
});

/**
 * POST /api/tasks/:id/subtasks
 * 서브태스크 추가
 */
router.post('/:id/subtasks', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const { text } = req.body;
    if (!text || String(text).trim().length === 0) {
      return sendError(res, 400, 'Subtask text is required');
    }

    if (!task.subtasks) task.subtasks = [];

    const newSub = {
      id: ++_subtaskSeq,
      task_id: id,
      text: String(text).trim(),
      done: false,
      created_at: new Date(),
    };

    task.subtasks.push(newSub);
    task.updated_at = new Date();

    return sendSuccess(res, 201, {
      subtask: newSub,
      progress: calcProgress(task.subtasks),
    }, 'Subtask added');
  } catch (err) {
    console.error('POST /api/tasks/:id/subtasks error:', err);
    return sendError(res, 500, 'Failed to add subtask');
  }
});

/**
 * PATCH /api/tasks/:id/subtasks/:sid
 * 서브태스크 완료 토글
 */
router.patch('/:id/subtasks/:sid', verifyToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const subId = parseInt(req.params.sid);
    if (isNaN(taskId) || isNaN(subId)) return sendError(res, 400, 'Invalid ID');

    const task = tasks.find(t => t.id === taskId);
    if (!task) return sendError(res, 404, 'Task not found');

    const sub = (task.subtasks || []).find(s => s.id === subId);
    if (!sub) return sendError(res, 404, 'Subtask not found');

    // done 명시 또는 토글
    if (req.body.done !== undefined) {
      sub.done = Boolean(req.body.done);
    } else {
      sub.done = !sub.done;
    }

    task.updated_at = new Date();

    return sendSuccess(res, 200, {
      subtask: sub,
      progress: calcProgress(task.subtasks),
    }, 'Subtask updated');
  } catch (err) {
    console.error('PATCH /api/tasks/:id/subtasks/:sid error:', err);
    return sendError(res, 500, 'Failed to update subtask');
  }
});

/**
 * DELETE /api/tasks/:id/subtasks/:sid
 */
router.delete('/:id/subtasks/:sid', verifyToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const subId = parseInt(req.params.sid);
    if (isNaN(taskId) || isNaN(subId)) return sendError(res, 400, 'Invalid ID');

    const task = tasks.find(t => t.id === taskId);
    if (!task) return sendError(res, 404, 'Task not found');

    const before = (task.subtasks || []).length;
    task.subtasks = (task.subtasks || []).filter(s => s.id !== subId);

    if (task.subtasks.length === before) return sendError(res, 404, 'Subtask not found');

    task.updated_at = new Date();

    return sendSuccess(res, 200, {
      id: subId,
      progress: calcProgress(task.subtasks),
    }, 'Subtask deleted');
  } catch (err) {
    console.error('DELETE /api/tasks/:id/subtasks/:sid error:', err);
    return sendError(res, 500, 'Failed to delete subtask');
  }
});

/* ============================================================
   담당자 엔드포인트
   ============================================================ */

/**
 * POST /api/tasks/:id/assignees
 * body: { assignee: "이름" }
 */
router.post('/:id/assignees', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const { assignee } = req.body;
    if (!assignee || String(assignee).trim().length === 0) {
      return sendError(res, 400, 'assignee is required');
    }

    const name = String(assignee).trim();
    if (!task.assignees) task.assignees = [];
    if (task.assignees.includes(name)) {
      return sendError(res, 409, 'Assignee already exists');
    }

    task.assignees.push(name);
    task.updated_at = new Date();

    return sendSuccess(res, 200, { id, assignees: task.assignees }, 'Assignee added');
  } catch (err) {
    console.error('POST /api/tasks/:id/assignees error:', err);
    return sendError(res, 500, 'Failed to add assignee');
  }
});

/**
 * DELETE /api/tasks/:id/assignees/:name
 */
router.delete('/:id/assignees/:name', verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 400, 'Invalid task ID');

    const task = tasks.find(t => t.id === id);
    if (!task) return sendError(res, 404, 'Task not found');

    const name = decodeURIComponent(req.params.name);
    const before = (task.assignees || []).length;
    task.assignees = (task.assignees || []).filter(a => a !== name);

    if (task.assignees.length === before) return sendError(res, 404, 'Assignee not found');

    task.updated_at = new Date();
    return sendSuccess(res, 200, { id, assignees: task.assignees }, 'Assignee removed');
  } catch (err) {
    console.error('DELETE /api/tasks/:id/assignees/:name error:', err);
    return sendError(res, 500, 'Failed to remove assignee');
  }
});

module.exports = router;
