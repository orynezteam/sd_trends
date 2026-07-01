import sys

filepath = r'd:\sd\sd_trends\frontend\src\app\admin\products\[id]\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("soldCount: '15'", "soldCount: '15',\n    about_text: '',\n    shipping_text: ''")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed formData in [id]/page.tsx')
