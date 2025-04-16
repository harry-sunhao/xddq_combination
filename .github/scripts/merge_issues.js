const axios = require('axios');
const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const [owner, repoName] = repo.split('/');

const COMBINATIONS_PATH = path.join('data', 'combinations_full.json');

// 获取所有 open issues（最多100个）
async function fetchOpenIssues() {
  const res = await axios.get(`https://api.github.com/repos/${repo}/issues`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
    params: {
      state: 'open',
      per_page: 100,
    },
  });

  // 只保留非 PR 的 issue
  return res.data.filter(issue => !issue.pull_request);
}

// 提取 issue 中的 JSON 数据（你也可以换成别的解析逻辑）
function parseIssueData(issue) {
  try {
    return JSON.parse(issue.body);
  } catch (e) {
    console.warn(`⚠️ 无法解析 issue #${issue.number} 的 JSON 内容`);
    return null;
  }
}

// 合并 issue 内容到主组合文件
function mergeCombinations(existing, additions) {
  const merged = [...existing];
  for (const item of additions) {
    if (!merged.some(e => JSON.stringify(e) === JSON.stringify(item))) {
      merged.push(item);
    }
  }
  return merged;
}

// 关闭指定 issue
async function closeIssue(number) {
  await axios.patch(`https://api.github.com/repos/${repo}/issues/${number}`, {
    state: 'closed',
  }, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  console.log(`✅ 已关闭 issue #${number}`);
}

// 主执行函数
async function run() {
  console.log('📥 正在获取 open issues...');
  const issues = await fetchOpenIssues();

  let mergedIssues = [];
  let newCombinations = [];

  for (const issue of issues) {
    const data = parseIssueData(issue);
    if (data && Array.isArray(data)) {
      newCombinations = newCombinations.concat(data);
      mergedIssues.push(issue.number);
    }
  }

  if (newCombinations.length === 0) {
    console.log('⚠️ 没有可合并的新组合，退出。');
    return;
  }

  console.log(`🔧 准备合并 ${newCombinations.length} 条数据到 combinations_full.json`);

  // 读取原始组合
  const existing = JSON.parse(fs.readFileSync(COMBINATIONS_PATH, 'utf-8'));
  const merged = mergeCombinations(existing, newCombinations);

  // 写入更新文件
  fs.writeFileSync(COMBINATIONS_PATH, JSON.stringify(merged, null, 2), 'utf-8');

  console.log(`✅ 合并完成，共 ${merged.length} 条记录`);

  // 自动关闭已处理的 issues
  for (const issueNumber of mergedIssues) {
    await closeIssue(issueNumber);
  }
}

run().catch(err => {
  console.error('❌ 脚本执行出错:', err.message);
  process.exit(1);
});
