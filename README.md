
# 寻道大千四圣仙兽降福组合推荐器

这是一个用于模拟和推荐“仙兽降福”策略的 Web 工具，支持手动设定棋盘格子颜色并智能推荐最优组合，同时可预览组合详情。

---

## 🔧 功能特性

- 🎨 **主棋盘设定**：点击格子循环设置颜色（金 → 绿 → 蓝 → 空）
- 🧠 **智能组合分析**：根据设定自动推荐匹配组合，分为推荐 / 中性 / 规避
- 🔍 **组合预览区**：点击推荐结果可在右侧显示预览棋盘，不影响左侧设定
- ♻️ **重置支持双清空**：清除主棋盘和预览棋盘内容
- 💡 **添加组合建议**：可将当前棋盘状态导出为反馈建议

## 🌐 在线演示地址

👉 [点击打开在线版本](https://harry-sunhao.github.io/xssq-combination)

## 📁 项目结构

```plaintext
.
├── index.html               # 主页面文件（含逻辑与布局）
├── data/
│   └── combinations_full.json  # 组合数据文件（由 Excel 自动转换）
├── to.py   # 数据转换脚本
└── README.md
```

## 📦 使用方法

### 🔹 本地运行

1. 克隆项目：

```bash
   git clone https://github.com/your-username/xssq-combination.git
```

2. 打开 `index.html` 即可在浏览器中使用，无需服务器。

3. 若需要更新组合数据：

   ```bash
   python to.py
   ```
## 📊 数据来源与致谢

本项目中用于组合推荐的数据（`combinations_full.json`）基于 Excel 数据文件自动生成。  
特别感谢以下贡献者提供宝贵数据支持（排名不分先后）：

- 💎 **[桃源·远航]**
- 💎 **[其他热心朋友]**

> 如需补充或更新，请提交 Pull Request 或联系作者。

## 📝 作者信息

- 作者：Hao Sun(桃源 · 太叔)
- GitHub: [harry-sunhao](https://github.com/harry-sunhao)


## 📄 License

MIT License
