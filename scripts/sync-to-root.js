/**
 * sync-to-root.js
 *
 * Stage 폴더 → Root 폴더 자동 동기화 스크립트
 * Pre-commit Hook에서 실행됨
 *
 * 매핑:
 *   S?_{StageName}/Frontend/      -> pages/
 *   S?_{StageName}/Backend_APIs/  -> api/Backend_APIs/
 *   S?_{StageName}/Security/      -> api/Security/
 *   S?_{StageName}/Backend_Infra/ -> api/Backend_Infra/
 *   S?_{StageName}/External/      -> api/External/
 */

const fs = require('fs');
const path = require('path');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Stage 폴더 패턴 (S1 ~ S5)
const STAGE_FOLDERS = [
    'S1_개발_준비',
    'S2_개발-1차',
    'S3_개발-2차',
    'S4_개발-3차',
    'S5_개발_마무리'
];

// Area → Root 매핑
const AREA_MAPPING = {
    'Frontend': 'pages',
    'Backend_APIs': 'api/Backend_APIs',
    'Security': 'api/Security',
    'Backend_Infra': 'api/Backend_Infra',
    'External': 'api/External'
};

// 콘솔 출력 헬퍼
const log = {
    info: (msg) => console.log(`\x1b[36mℹ️  ${msg}\x1b[0m`),
    success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
    error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
    warn: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
    header: (msg) => console.log(`\n\x1b[33m${'='.repeat(50)}\n🔄 ${msg}\n${'='.repeat(50)}\x1b[0m\n`)
};

// 디렉토리 재귀 생성
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 파일 복사 (재귀)
function copyRecursive(src, dest, stats = { copied: 0, skipped: 0 }) {
    if (!fs.existsSync(src)) {
        return stats;
    }

    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        ensureDir(dest);
        const items = fs.readdirSync(src);

        for (const item of items) {
            // 숨김 파일, node_modules 제외
            if (item.startsWith('.') || item === 'node_modules') {
                continue;
            }
            copyRecursive(
                path.join(src, item),
                path.join(dest, item),
                stats
            );
        }
    } else if (stat.isFile()) {
        // 대상 디렉토리 생성
        ensureDir(path.dirname(dest));

        // 파일이 변경되었는지 확인
        let shouldCopy = true;
        if (fs.existsSync(dest)) {
            const srcStat = fs.statSync(src);
            const destStat = fs.statSync(dest);
            // 수정 시간이 같으면 건너뜀
            if (srcStat.mtimeMs <= destStat.mtimeMs) {
                shouldCopy = false;
                stats.skipped++;
            }
        }

        if (shouldCopy) {
            fs.copyFileSync(src, dest);
            stats.copied++;
            log.info(`복사: ${path.relative(PROJECT_ROOT, src)} → ${path.relative(PROJECT_ROOT, dest)}`);
        }
    }

    return stats;
}

// 메인 동기화 함수
function syncToRoot() {
    log.header('Stage → Root 동기화');

    let totalCopied = 0;
    let totalSkipped = 0;

    for (const stageFolder of STAGE_FOLDERS) {
        const stagePath = path.join(PROJECT_ROOT, stageFolder);

        if (!fs.existsSync(stagePath)) {
            continue;
        }

        for (const [areaFolder, rootTarget] of Object.entries(AREA_MAPPING)) {
            const srcPath = path.join(stagePath, areaFolder);
            const destPath = path.join(PROJECT_ROOT, rootTarget);

            if (!fs.existsSync(srcPath)) {
                continue;
            }

            const stats = copyRecursive(srcPath, destPath);
            totalCopied += stats.copied;
            totalSkipped += stats.skipped;
        }
    }

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('📊 동기화 결과');
    console.log('='.repeat(50));
    console.log(`  복사된 파일: ${totalCopied}개`);
    console.log(`  건너뛴 파일: ${totalSkipped}개 (변경 없음)`);
    console.log('='.repeat(50) + '\n');

    if (totalCopied > 0) {
        log.success(`${totalCopied}개 파일 동기화 완료!`);
    } else {
        log.info('동기화할 변경 사항 없음');
    }

    return true;
}

// 실행
try {
    const success = syncToRoot();
    process.exit(success ? 0 : 1);
} catch (err) {
    log.error(`동기화 실패: ${err.message}`);
    process.exit(1);
}
