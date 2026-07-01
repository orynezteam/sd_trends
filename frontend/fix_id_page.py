import sys

filepath = r'd:\sd\sd_trends\frontend\src\app\admin\products\[id]\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if 'about_text:' not in content:
    content = content.replace("soldCount: '0'", "soldCount: '0',\n    about_text: '',\n    shipping_text: ''")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed [id]/page.tsx')
else:
    print('Already fixed or not found')
