const fs = require("fs");
const axios = require("axios");

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const apiBase = `https://api.github.com/repos/${repo}`;

async function getAllIssuesWithLabel(label) {
  const res = await axios.get(`${apiBase}/issues`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "xddq-bot"
    },
    params: {
      labels: label,
      state: "open",
      per_page: 100,
    }
  });

  return res.data;
}

(async () => {
  console.log("🔍 正在读取用户提交 issue...");
  const issues = await getAllIssuesWithLabel("用户提交");

  let result = [];

  // 尝试读取现有 JSON 文件
  try {
    const existing = JSON.parse(fs.readFileSync("data/combinations_full.json", "utf8"));
    result = Array.isArray(existing) ? existing : [];
  } catch (e) {
    console.warn("⚠️ 未找到或无法读取原始 JSON 文件，使用空数组");
  }

  for (const issue of issues) {
    const match = issue.body.match(/```json\n([\s\S]+?)\n```/);
    if (match) {
      try {
        const obj = JSON.parse(match[1]);
        result.push(obj);
        console.log(`✅ 合并 Issue #${issue.number}`);
      } catch (e) {
        console.warn(`❌ 无法解析 Issue #${issue.number} 内容`);
      }
    }
  }

  // 去重（按 JSON 字符串去重）
  const unique = Array.from(new Set(result.map(JSON.stringify))).map(JSON.parse);

  fs.writeFileSync("data/combinations_full.json", JSON.stringify(unique, null, 2));
  console.log("✅ 已写入 data/combinations_full.json");
})();
