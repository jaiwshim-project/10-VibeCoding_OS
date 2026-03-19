/**
 * 미디어 모니터링 API 라우트
 * 실시간 뉴스, SNS, 방송 모니터링 + 감정분석
 */

const express = require('express');
const router = express.Router();
const { verifyToken, sendError, sendSuccess } = require('../middleware/auth');

/**
 * GET /api/news/feed
 * 실시간 뉴스 피드 (후보자 관련 기사)
 */
router.get('/feed', verifyToken, async (req, res) => {
  try {
    const { source, sentiment, dateRange, topic, limit = 20 } = req.query;

    // 더미 데이터 (실제로는 뉴스 API에서 가져옴)
    const newsItems = [
      {
        id: 1,
        title: '오세훈 "서울 교통 혁신으로 출근 시간 30% 단축"',
        summary: '오세훈 서울시장 후보는 대중교통 통합 요금제와 자동차 감기주차 시스템 도입으로 시민 생활의 질을 향상시키겠다고 발표했습니다.',
        content: '오세훈 후보가 서울 교통 혁신 정책을 발표하면서 시민들의 큰 관심을 모으고 있습니다. 특히 교통약자를 위한 맞춤형 정책이 긍정적인 반응을 얻고 있습니다.',
        source: '조선일보',
        url: '#',
        sentiment: 'positive',
        confidence: 88,
        topic: 'transport',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        title: '주택 공급 대선 쟁점화... 오세훈 "30만 호 공급 목표"',
        summary: '오세훈 후보가 주택 공급 확대 공약을 제시했습니다. 강남·강북 지역별 맞춤형 주택정책으로 주거 문제 해결에 나서겠다고 밝혔습니다.',
        content: '주택 공급 정책이 올해 선거의 핵심 쟁점으로 부각되면서, 각 후보들이 경쟁적으로 주택정책을 내놓고 있습니다.',
        source: 'MBN',
        url: '#',
        sentiment: 'positive',
        confidence: 82,
        topic: 'housing',
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: 3,
        title: '서울시 일자리 창출 정책 논란... "정책 효과 의문"',
        summary: '오세훈 후보의 일자리 창출 정책에 대해 전문가들 사이에서 의견이 엇갈리고 있습니다. 정책 실현 가능성에 대한 지적도 제기되고 있습니다.',
        content: '일자리 창출 정책의 실효성을 두고 논쟁이 일고 있습니다. 경제 전문가들은 정책의 구체성을 요구하고 있습니다.',
        source: '한겨레',
        url: '#',
        sentiment: 'neutral',
        confidence: 75,
        topic: 'economy',
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: 4,
        title: '오세훈 vs 후보 A, 여론조사서 격차 벌어져',
        summary: '최신 여론조사에서 오세훈 후보가 경쟁 후보에 앞서가고 있습니다. 특히 40대 이상 연령층에서 지지율이 높은 것으로 나타났습니다.',
        content: '실시간 여론조사 결과를 분석한 언론들의 보도가 이어지고 있습니다.',
        source: 'YTN',
        url: '#',
        sentiment: 'positive',
        confidence: 85,
        topic: 'economy',
        published_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        id: 5,
        title: '환경 정책 부실 지적... "녹색 도시 비전 필요"',
        summary: '시민 단체들이 기후변화 대응 및 환경보전 정책을 강화할 필요가 있다고 지적했습니다. 환경 정책의 충실도가 선거의 변수가 될 수 있습니다.',
        content: '환경 문제는 2026년 선거의 주요 이슈로 떠오르고 있습니다.',
        source: '환경일보',
        url: '#',
        sentiment: 'negative',
        confidence: 68,
        topic: 'environment',
        published_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ];

    // 필터링
    let filtered = newsItems;

    if (source && source !== 'all') {
      filtered = filtered.filter(n => n.source.toLowerCase().includes(source));
    }

    if (sentiment && sentiment !== 'all') {
      filtered = filtered.filter(n => n.sentiment === sentiment);
    }

    if (topic && topic !== 'all') {
      filtered = filtered.filter(n => n.topic === topic);
    }

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // 제한
    filtered = filtered.slice(0, parseInt(limit) || 20);

    sendSuccess(res, 200, filtered, 'News feed retrieved');
  } catch (error) {
    console.error('GET /api/news/feed error:', error);
    sendError(res, 500, 'Failed to retrieve news feed');
  }
});

/**
 * GET /api/news/sentiment
 * 감정 분석 통계
 */
router.get('/sentiment', verifyToken, async (req, res) => {
  try {
    const sentiment = {
      overall: {
        positive: 68,
        neutral: 20,
        negative: 12,
        updated_at: new Date(),
      },
      trends: {
        yesterday: {
          positive: 65,
          neutral: 22,
          negative: 13,
        },
        change: '+3% 긍정도 상승',
      },
      mentions: {
        total: 247,
        change: '+8.3%',
        trending_topics: [
          { topic: '서울 교통 혁신', articles: 45 },
          { topic: '주택 공급 확대', articles: 38 },
          { topic: '일자리 창출', articles: 32 },
          { topic: '환경 보전', articles: 18 },
          { topic: '관광 진흥', articles: 12 },
        ],
      },
      sns: {
        twitter: 1234,
        instagram: 856,
        blog: 432,
        youtube: 128,
      },
    };

    sendSuccess(res, 200, sentiment, 'Sentiment analysis retrieved');
  } catch (error) {
    console.error('GET /api/news/sentiment error:', error);
    sendError(res, 500, 'Failed to retrieve sentiment analysis');
  }
});

/**
 * GET /api/news/competitors
 * 경쟁 후보 비교 분석
 */
router.get('/competitors', verifyToken, async (req, res) => {
  try {
    const comparison = {
      candidates: [
        {
          name: '오세훈',
          articles_count: 247,
          positive_sentiment: 68,
          neutral_sentiment: 20,
          negative_sentiment: 12,
          reach: 1250000,
          engagement: 42500,
          trend: '↑ 긍정도 상승',
        },
        {
          name: '후보 A',
          articles_count: 156,
          positive_sentiment: 54,
          neutral_sentiment: 18,
          negative_sentiment: 28,
          reach: 890000,
          engagement: 31200,
          trend: '→ 정체',
        },
        {
          name: '후보 B',
          articles_count: 98,
          positive_sentiment: 42,
          neutral_sentiment: 22,
          negative_sentiment: 36,
          reach: 620000,
          engagement: 18700,
          trend: '↓ 부정도 증가',
        },
      ],
      analysis: {
        leading_issue: '교통 정책',
        media_advantage: '우호적 보도 비율 +12%',
        risk: '환경 정책에서 상대방이 강세',
        recommendation: '환경 공약 보강 필요',
      },
    };

    sendSuccess(res, 200, comparison, 'Competitor comparison retrieved');
  } catch (error) {
    console.error('GET /api/news/competitors error:', error);
    sendError(res, 500, 'Failed to retrieve competitor comparison');
  }
});

/**
 * GET /api/news
 * 뉴스 목록 조회 (기존 호환성)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const news = [
      {
        id: 1,
        title: '서울시장 후보들, 교통·주택 정책 놓고 경쟁',
        excerpt: '각 후보들이 시민 생활과 밀접한 교통과 주택 정책을 앞다투어 발표하고 있습니다.',
        category: 'politics',
        published_at: new Date(),
      },
      {
        id: 2,
        title: '여론조사 결과, 지지율 집중화 현상 심화',
        excerpt: '주요 후보들 간 지지율 격차가 커지면서 경선 판도가 크게 요동치고 있습니다.',
        category: 'politics',
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    sendSuccess(res, 200, news, 'News list retrieved');
  } catch (error) {
    console.error('GET /api/news error:', error);
    sendError(res, 500, 'Failed to retrieve news list');
  }
});

/**
 * GET /api/news/:id
 * 뉴스 상세 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const news = {
      id: parseInt(id),
      title: '오세훈 "서울 교통 혁신으로 출근 시간 30% 단축"',
      content: '...',
      author: '기자명',
      published_at: new Date(),
    };

    sendSuccess(res, 200, news, 'News details retrieved');
  } catch (error) {
    console.error('GET /api/news/:id error:', error);
    sendError(res, 500, 'Failed to retrieve news details');
  }
});

module.exports = router;
