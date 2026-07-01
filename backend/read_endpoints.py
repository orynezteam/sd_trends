import sys

filepath = r'd:\sd\sd_trends\backend\app.py'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '/api/products/<id>' in line and 'PUT' in line:
        print(''.join(lines[i:i+40]))
        print('---')
    if '/api/products' in line and 'POST' in line and '<id>' not in line:
        print(''.join(lines[i:i+40]))
        print('---')
