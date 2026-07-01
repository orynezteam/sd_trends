import sys

filepath = r'd:\sd\sd_trends\frontend\src\components\Footer\Footer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("fetch('http://localhost:5000/api/settings')", "fetch('http://localhost:5000/api/settings', { cache: 'no-store' })")
content = content.replace("fetch('http://localhost:5000/api/footer-links')", "fetch('http://localhost:5000/api/footer-links', { cache: 'no-store' })")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

filepath_admin = r'd:\sd\sd_trends\frontend\src\app\admin\footer\page.tsx'
with open(filepath_admin, 'r', encoding='utf-8') as f:
    content_admin = f.read()

content_admin = content_admin.replace("fetch('http://localhost:5000/api/settings')", "fetch('http://localhost:5000/api/settings', { cache: 'no-store' })")
content_admin = content_admin.replace("fetch('http://localhost:5000/api/footer-links')", "fetch('http://localhost:5000/api/footer-links', { cache: 'no-store' })")

with open(filepath_admin, 'w', encoding='utf-8') as f:
    f.write(content_admin)

print('Added cache: no-store to Footer fetches')
