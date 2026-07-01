import sys

# 1. Update NewProductPage
filepath_new = r'd:\sd\sd_trends\frontend\src\app\admin\products\new\page.tsx'
with open(filepath_new, 'r', encoding='utf-8') as f:
    content_new = f.read()

quill_imports = """import Link from 'next/link';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';"""
content_new = content_new.replace("import Link from 'next/link';", quill_imports)

form_data_old = """    soldCount: '15'
  });"""
form_data_new = """    soldCount: '15',
    about_text: '',
    shipping_text: ''
  });"""
content_new = content_new.replace(form_data_old, form_data_new)

payload_old = """        sold_count: parseInt(formData.soldCount) || 0,
        images: imageUrls"""
payload_new = """        sold_count: parseInt(formData.soldCount) || 0,
        about_text: formData.about_text,
        shipping_text: formData.shipping_text,
        images: imageUrls"""
content_new = content_new.replace(payload_old, payload_new)

desc_old = """            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} />
            </div>
          </div>"""
desc_new = """            <div className={styles.formGroup}>
              <label>Description (Short)</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} />
            </div>
            
            <div className={styles.formGroup}>
              <label>About This Item (Rich Text)</label>
              <ReactQuill 
                value={formData.about_text} 
                onChange={(val) => setFormData(prev => ({ ...prev, about_text: val }))}
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Shipping & Returns (Rich Text)</label>
              <ReactQuill 
                value={formData.shipping_text} 
                onChange={(val) => setFormData(prev => ({ ...prev, shipping_text: val }))}
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
          </div>"""
content_new = content_new.replace(desc_old, desc_new)

with open(filepath_new, 'w', encoding='utf-8') as f:
    f.write(content_new)

# 2. Update EditProductPage
filepath_edit = r'd:\sd\sd_trends\frontend\src\app\admin\products\[id]\page.tsx'
with open(filepath_edit, 'r', encoding='utf-8') as f:
    content_edit = f.read()

content_edit = content_edit.replace("import Link from 'next/link';", quill_imports)

form_data_old_edit = """    soldCount: '0'
  });"""
form_data_new_edit = """    soldCount: '0',
    about_text: '',
    shipping_text: ''
  });"""
content_edit = content_edit.replace(form_data_old_edit, form_data_new_edit)

populate_old = """          viewerCount: data.viewerCount?.toString() || '0',
          soldCount: data.soldCount?.toString() || '0'
        });"""
populate_new = """          viewerCount: data.viewerCount?.toString() || '0',
          soldCount: data.soldCount?.toString() || '0',
          about_text: data.aboutText || '',
          shipping_text: data.shippingText || ''
        });"""
content_edit = content_edit.replace(populate_old, populate_new)

content_edit = content_edit.replace(payload_old, payload_new)
content_edit = content_edit.replace(desc_old, desc_new)

with open(filepath_edit, 'w', encoding='utf-8') as f:
    f.write(content_edit)

print("Admin product pages updated with rich text!")
