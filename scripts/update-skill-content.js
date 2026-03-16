const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '../../03-04 AX덴탈그룹/skills/02 스킬 모음 claude-20260305T005001Z-1-001/sal-grid-dev-슈퍼스킬1/SKILL.md');
const htmlPath = path.join(__dirname, '../pages/08-sal-grid.html');

const content = fs.readFileSync(skillPath, 'utf8');

// JS 문자열로 변환
const escaped = content
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\r\n/g, '\\r\\n')
  .replace(/\n/g, '\\r\\n');

const newLine = 'var SKILL_CONTENT = "' + escaped + '";';

let html = fs.readFileSync(htmlPath, 'utf8');

// SKILL_CONTENT 라인 교체
const oldMatch = html.match(/^var SKILL_CONTENT = ".*";$/m);
if (!oldMatch) {
  console.error('SKILL_CONTENT 라인을 찾을 수 없습니다.');
  process.exit(1);
}

html = html.replace(/^var SKILL_CONTENT = ".*";$/m, newLine);
fs.writeFileSync(htmlPath, html, 'utf8');

const version = content.match(/version: "([^"]+)"/)?.[1];
console.log('✅ SKILL_CONTENT 업데이트 완료');
console.log('   버전:', version);
console.log('   SKILL.md 길이:', content.length, '자');
