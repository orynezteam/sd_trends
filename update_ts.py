import json
import re

with open('backend/new_products.json', 'r') as f:
    products = json.load(f)

# Update products.ts
ts_path = 'frontend/src/data/products.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace everything after `export const PRODUCTS: Product[] = `
new_array_str = json.dumps(products, indent=2)

pattern = r"(export const PRODUCTS:\s*Product\[\]\s*=\s*)\[.*\];"
replacement = r"\1" + new_array_str + ";"

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated products.ts")
