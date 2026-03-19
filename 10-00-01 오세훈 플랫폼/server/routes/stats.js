/**
 * 선거 통계 API 라우트
 * 캠프 플랫폼에서 사용할 실시간 데이터 제공
 */

const express = require('express');
const router = express.Router();
const { verifyToken, sendError, sendSuccess } = require('../middleware/auth');

/**
 * GET /api/stats/support
 * 지지도 현황 (전국, 지역별, 연령별)
 */
router.get('/support', async (req, res) => {
  try {
    const { region, ageGroup } = req.query;

    // 더미 데이터 (실제로는 DB에서 조회)
    const supportData = {
      overall: {
        support: 45,
        favorability: 60,
        undecided: 25,
        updated_at: new Date(),
      },
      byRegion: [
        { region: '도봉구', support: 52, favorability: 58 },
        { region: '노원구', support: 51, favorability: 57 },
        { region: '강북구', support: 48, favorability: 54 },
        { region: '강동구', support: 47, favorability: 53 },
        { region: '송파구', support: 42, favorability: 48 },
        { region: '동작구', support: 43, favorability: 49 },
        { region: '관악구', support: 41, favorability: 47 },
        { region: '강남구', support: 37, favorability: 45 },
        { region: '서초구', support: 38, favorability: 46 },
        { region: '강서구', support: 39, favorability: 47 },
        { region: '종로구', support: 44, favorability: 50 },
        { region: '중구', support: 43, favorability: 49 },
        { region: '용산구', support: 46, favorability: 52 },
        { region: '은평구', support: 45, favorability: 51 },
        { region: '마포구', support: 44, favorability: 50 },
        { region: '서대문구', support: 42, favorability: 48 },
        { region: '성북구', support: 46, favorability: 52 },
        { region: '중랑구', support: 47, favorability: 53 },
        { region: '성동구', support: 43, favorability: 49 },
      ],
      byAgeGroup: [
        { ageGroup: '10-20대', support: 38, favorability: 52 },
        { ageGroup: '30대', support: 42, favorability: 56 },
        { ageGroup: '40대', support: 48, favorability: 62 },
        { ageGroup: '50대', support: 52, favorability: 65 },
        { ageGroup: '60대+', support: 55, favorability: 68 },
      ],
    };

    // 필터링 (선택사항)
    if (region) {
      const filtered = supportData.byRegion.find(r => r.region === region);
      if (filtered) {
        return sendSuccess(res, 200, filtered, 'Support data retrieved');
      }
    }

    if (ageGroup) {
      const filtered = supportData.byAgeGroup.find(a => a.ageGroup === ageGroup);
      if (filtered) {
        return sendSuccess(res, 200, filtered, 'Support data retrieved');
      }
    }

    sendSuccess(res, 200, supportData, 'Support data retrieved');
  } catch (error) {
    console.error('GET /api/stats/support error:', error);
    sendError(res, 500, 'Failed to retrieve support data');
  }
});

/**
 * GET /api/stats/weekly
 * 주간 추이 (지지도, 호의도)
 */
router.get('/weekly', async (req, res) => {
  try {
    const weeklyData = {
      weeks: [
        {
          week: '3/2 - 3/8',
          support: 42,
          favorability: 58,
          undecided: 27,
        },
        {
          week: '3/9 - 3/15',
          support: 43,
          favorability: 59,
          undecided: 26,
        },
        {
          week: '3/16 - 3/22',
          support: 45,
          favorability: 60,
          undecided: 25,
        },
      ],
      trend: {
        supportTrend: '+2%',
        favorabilityTrend: '+2%',
        undecidedTrend: '-2%',
      },
      updated_at: new Date(),
    };

    sendSuccess(res, 200, weeklyData, 'Weekly data retrieved');
  } catch (error) {
    console.error('GET /api/stats/weekly error:', error);
    sendError(res, 500, 'Failed to retrieve weekly data');
  }
});

/**
 * GET /api/stats/districts
 * 자치구별 상세 현황
 */
router.get('/districts', async (req, res) => {
  try {
    const districtsData = {
      districts: [
        {
          name: '도봉구',
          support: 52,
          favorability: 58,
          turnoutPrediction: 66,
          strategicPriority: '지지층 결집',
        },
        {
          name: '노원구',
          support: 51,
          favorability: 57,
          turnoutPrediction: 64,
          strategicPriority: '지지층 결집',
        },
        {
          name: '강북구',
          support: 48,
          favorability: 54,
          turnoutPrediction: 60,
          strategicPriority: '미결정층 설득',
        },
        {
          name: '강동구',
          support: 47,
          favorability: 53,
          turnoutPrediction: 61,
          strategicPriority: '미결정층 설득',
        },
        {
          name: '송파구',
          support: 42,
          favorability: 48,
          turnoutPrediction: 62,
          strategicPriority: '접근',
        },
        {
          name: '동작구',
          support: 43,
          favorability: 49,
          turnoutPrediction: 60,
          strategicPriority: '접근',
        },
        {
          name: '관악구',
          support: 41,
          favorability: 47,
          turnoutPrediction: 58,
          strategicPriority: '접근',
        },
        {
          name: '강남구',
          support: 37,
          favorability: 45,
          turnoutPrediction: 62,
          strategicPriority: '경제정책 강조',
        },
        {
          name: '서초구',
          support: 38,
          favorability: 46,
          turnoutPrediction: 63,
          strategicPriority: '정책 신뢰도 강화',
        },
        {
          name: '강서구',
          support: 39,
          favorability: 47,
          turnoutPrediction: 56,
          strategicPriority: '교통 정책 강조',
        },
      ],
      summary: {
        strongRegions: 8, // 40% 이상
        targetRegions: 9, // 35-40%
        weakRegions: 3, // 35% 이하
        averageSupport: 45,
        averageTurnout: 61,
      },
      updated_at: new Date(),
    };

    sendSuccess(res, 200, districtsData, 'Districts data retrieved');
  } catch (error) {
    console.error('GET /api/stats/districts error:', error);
    sendError(res, 500, 'Failed to retrieve districts data');
  }
});

/**
 * GET /api/stats/competitive
 * 경쟁 후보 비교
 */
router.get('/competitive', async (req, res) => {
  try {
    const competitiveData = {
      candidates: [
        {
          name: '오세훈',
          support: 45,
          favorability: 60,
          policyTrust: 52,
          leadership: 58,
          economics: 48,
          position: '우위',
        },
        {
          name: '후보 A',
          support: 38,
          favorability: 48,
          policyTrust: 42,
          leadership: 44,
          economics: 41,
          position: '열세',
        },
        {
          name: '후보 B',
          support: 32,
          favorability: 44,
          policyTrust: 35,
          leadership: 39,
          economics: 37,
          position: '열세',
        },
      ],
      gaps: {
        against_a: 7,
        against_b: 13,
        trend: 'Expanding',
      },
      updated_at: new Date(),
    };

    sendSuccess(res, 200, competitiveData, 'Competitive data retrieved');
  } catch (error) {
    console.error('GET /api/stats/competitive error:', error);
    sendError(res, 500, 'Failed to retrieve competitive data');
  }
});

/**
 * GET /api/stats/summary
 * 대시보드용 요약 데이터
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = {
      kpis: {
        support: {
          value: 45,
          trend: '+3.2%',
          status: '목표 달성',
        },
        favorability: {
          value: 60,
          trend: '+2.1%',
          status: '목표 달성',
        },
        coreSupport: {
          value: '1.2M',
          trend: '→ 변동 없음',
          status: '유지',
        },
        keyIssues: {
          value: 5,
          trend: '추적 중',
          status: '관심',
        },
      },
      notifications: [
        {
          type: 'update',
          message: '지난주 지지도 3.2% 포인트 상승',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          type: 'task_due',
          message: '강남구 캠프 전략 수정 마감일 3/25',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ],
      lastUpdate: new Date(),
    };

    sendSuccess(res, 200, summary, 'Summary data retrieved');
  } catch (error) {
    console.error('GET /api/stats/summary error:', error);
    sendError(res, 500, 'Failed to retrieve summary data');
  }
});

module.exports = router;
