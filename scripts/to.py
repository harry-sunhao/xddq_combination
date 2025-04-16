import os
import pandas as pd
import json
import re

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

df = pd.read_excel(excel_file, sheet_name="分表")
result = {"金": [], "绿": [], "蓝": []}

for col in df.columns:
    if isinstance(col, str) and re.match(r"\d{2}[金绿蓝]", col):
        color = col[-1]
        if color in result:
            for value in df[col].dropna():
                positions = value.strip().split()
                result[color].append([pos[:-1] for pos in positions if pos.endswith(color)])

output_path = "data/combinations.json"
os.makedirs("data", exist_ok=True)
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"✅ 已保存组合数据至 {output_path}")
