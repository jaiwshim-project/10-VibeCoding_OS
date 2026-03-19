/**
 * 태스크 관리 API 라우트
 * 스태프 협업 및 진행 관리
 */

const express = require('express');
const router = express.Router();
const { verifyToken, sendError, sendSuccess } = require('../middleware/auth');

/**
 * GET /api/tasks
 * 모든 태스크 조회 (필터링 선택사항)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, priority, assignee } = req.query;

    // 더미 데이터 (실제로는 DB에서 조회)
    let tasks = [
      {
        id: 1,
        title: '도봉구 캠프 전략 수정',
        description: '도봉구 지지층 결집 전략을 3/25일까지 수정',
        assignee: '전략팀',
        status: 'in-progress',
        priority: 'high',
        due_date: '2026-03-25',
        created_by: 'admin',
        created_at: new Date('2026-03-18'),
        updated_at: new Date('2026-03-18'),
      },
      {
        id: 2,
        title: '강남구 경제정책 강조 자료 준비',
        description: '강남구 지역 특성에 맞는 경제정책 자료 작성',
        assignee: '정책팀',
        status: 'pending',
        priority: 'high',
        due_date: '2026-03-22',
        created_by: 'admin',
        created_at: new Date('2026-03-17'),
        updated_at: new Date('2026-03-17'),
      },
      {
        id: 3,
        title: '판세 분석 보고서 작성',
        description: '주간 판세 분석 및 선거구별 전략 분석',
        assignee: '분석팀',
        status: 'in-progress',
        priority: 'high',
        due_date: '2026-03-20',
        created_by: 'admin',
        created_at: new Date('2026-03-16'),
        updated_at: new Date('2026-03-18'),
      },
      {
        id: 4,
        title: '유권자 여론조사 데이터 입력',
        description: '최신 여론조사 결과를 시스템에 입력',
        assignee: '데이터팀',
        status: 'completed',
        priority: 'medium',
        due_date: '2026-03-19',
        created_by: 'admin',
        created_at: new Date('2026-03-15'),
        updated_at: new Date('2026-03-18'),
      },
      {
        id: 5,
        title: '캠프 일정 조율',
        description: '지역별 방문 일정 및 행사 일정 최종 확인',
        assignee: '일정팀',
        status: 'pending',
        priority: 'medium',
        due_date: '2026-03-21',
        created_by: 'admin',
        created_at: new Date('2026-03-17'),
        updated_at: new Date('2026-03-17'),
      },
    ];

    // 필터링 적용
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    if (priority) {
      tasks = tasks.filter(t => t.priority === priority);
    }

    if (assignee) {
      tasks = tasks.filter(t => t.assignee.includes(assignee));
    }

    // 생성 날짜 역순 정렬
    tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sendSuccess(res, 200, tasks, 'Tasks retrieved');
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    sendError(res, 500, 'Failed to retrieve tasks');
  }
});

/**
 * GET /api/tasks/:id
 * 특정 태스크 조회
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 더미 데이터에서 조회
    const tasks = [
      {
        id: 1,
        title: '도봉구 캠프 전략 수정',
        description: '도봉구 지지층 결집 전략을 3/25일까지 수정',
        assignee: '전략팀',
        status: 'in-progress',
        priority: 'high',
        due_date: '2026-03-25',
        created_by: 'admin',
        created_at: new Date('2026-03-18'),
        updated_at: new Date('2026-03-18'),
      },
    ];

    const task = tasks.find(t => t.id === parseInt(id));

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    sendSuccess(res, 200, task, 'Task retrieved');
  } catch (error) {
    console.error('GET /api/tasks/:id error:', error);
    sendError(res, 500, 'Failed to retrieve task');
  }
});

/**
 * POST /api/tasks
 * 새 태스크 생성
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, assignee, dueDate, priority, status, createdBy } = req.body;

    // 입력 검증
    if (!title || !assignee) {
      return sendError(res, 400, 'Missing required fields');
    }

    // 새 태스크 생성 (ID는 시뮬레이션)
    const newTask = {
      id: Math.floor(Math.random() * 10000),
      title,
      description: description || null,
      assignee,
      status: status || 'pending',
      priority: priority || 'medium',
      due_date: dueDate || null,
      created_by: createdBy || 'unknown',
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log('New task created:', newTask);

    sendSuccess(res, 201, newTask, 'Task created successfully');
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    sendError(res, 500, 'Failed to create task');
  }
});

/**
 * PUT /api/tasks/:id
 * 태스크 업데이트 (상태, 설명 등)
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description, assignee, dueDate, priority } = req.body;

    // 업데이트 필드
    const updates = {};
    if (status) updates.status = status;
    if (description !== undefined) updates.description = description;
    if (assignee) updates.assignee = assignee;
    if (dueDate !== undefined) updates.due_date = dueDate;
    if (priority) updates.priority = priority;
    updates.updated_at = new Date();

    console.log(`Task ${id} updated:`, updates);

    sendSuccess(res, 200, updates, 'Task updated successfully');
  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    sendError(res, 500, 'Failed to update task');
  }
});

/**
 * DELETE /api/tasks/:id
 * 태스크 삭제
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Task ${id} deleted`);

    sendSuccess(res, 200, { id: parseInt(id) }, 'Task deleted successfully');
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    sendError(res, 500, 'Failed to delete task');
  }
});

/**
 * GET /api/tasks/stats/summary
 * 태스크 통계 요약
 */
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const summary = {
      total: 5,
      completed: 1,
      inProgress: 2,
      pending: 2,
      completionRate: 20,
      highPriorityCount: 3,
      overdueTasks: 0,
    };

    sendSuccess(res, 200, summary, 'Task summary retrieved');
  } catch (error) {
    console.error('GET /api/tasks/stats/summary error:', error);
    sendError(res, 500, 'Failed to retrieve task summary');
  }
});

module.exports = router;
