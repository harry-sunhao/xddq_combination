import os
import pandas as pd
import json
import re

# 自动查找 Excel 文件
excel_file = None
for root, _, files in os.walk("."):
    for f in files:
        if f.endswith(".xlsx") or f.endswith(".xls"):
            excel_file = os.path.join(root, f)
            break
    if excel_file:
        break

if not excel_file:
    raise FileNotFoundError("❌ 未找到任何 Excel 文件（.xlsx/.xls）")

print(f"✅ 读取文件: {excel_file}")

# 读取 Excel 分表
df = pd.read_excel(excel_file, sheet_name="分表")

result = []

# 遍历每个 cell（每个 cell 是一个组合）
for col in df.columns:
    for value in df[col].dropna():
        combo_str = str(value).strip()
        tokens = combo_str.split()
        board = {}
        for token in tokens:
            match = re.match(r"^(\d{2})([金绿蓝])$", token)
            if match:
                pos, color = match.groups()
                board[pos] = color
        if board:
            result.append(board)

# 保存 JSON
output_path = "data/combinations_full.json"
os.makedirs("data", exist_ok=True)
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"✅ 已保存为组合 JSON 文件: {output_path}")
