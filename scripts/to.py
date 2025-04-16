
import pandas as pd
import json
import re

df = pd.read_excel("副本仙兽降幅搜索库分表.xlsx", sheet_name="分表")
result = {"金": [], "绿": [], "蓝": []}

for col in df.columns:
    if isinstance(col, str) and re.match(r'\d{2}[金绿蓝]', col):
        color = col[-1]
        if color in result:
            for value in df[col].dropna():
                positions = value.strip().split()
                result[color].append([pos[:-1] for pos in positions if pos.endswith(color)])

with open("../data/combinations.json", "w+", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
