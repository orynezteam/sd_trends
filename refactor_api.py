import os
import re

def refactor_frontend(directory):
    count = 0
    import_stmt = "import { API_BASE_URL, BASE_URL } from '@/config';\n"
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                
                # Skip the config file itself
                if file == 'config.ts':
                    continue
                    
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Check if it contains the target URLs
                    if "https://sd-trends.onrender.com/api" in content or "https://sd-trends.onrender.com" in content:
                        
                        # Replace the URLs
                        content = content.replace("https://sd-trends.onrender.com/api", "${API_BASE_URL}")
                        content = content.replace("https://sd-trends.onrender.com", "${BASE_URL}")
                        
                        # Fix cases where the replacement broke string concatenation (e.g. fetch('${API_BASE_URL}'))
                        # If it's inside single or double quotes, convert to template literals or just fix the quotes
                        # A simple regex to catch 'url' or "url" and convert to `url` if it contains ${...}
                        content = re.sub(r"'([^'\n]*\$\{API_BASE_URL\}[^'\n]*)'", r"`\1`", content)
                        content = re.sub(r'"([^"\n]*\$\{API_BASE_URL\}[^"\n]*)"', r"`\1`", content)
                        content = re.sub(r"'([^'\n]*\$\{BASE_URL\}[^'\n]*)'", r"`\1`", content)
                        content = re.sub(r'"([^"\n]*\$\{BASE_URL\}[^"\n]*)"', r"`\1`", content)
                        
                        # Also replace exact fetch('.../api/...') with fetch(`${API_BASE_URL}/...`)
                        # The regex above handles most of this beautifully!
                        
                        # Add import if not present
                        if "API_BASE_URL" in content and "@/config" not in content:
                            # Inject right after the first line (which is usually 'use client' or import React)
                            lines = content.split('\n')
                            insert_idx = 0
                            for i, line in enumerate(lines):
                                if line.startswith('import ') or line.startswith("'use client'") or line.startswith('"use client"'):
                                    insert_idx = i + 1
                                elif line.strip() == '':
                                    continue
                                else:
                                    break
                            
                            # Fallback if no imports found
                            if insert_idx == 0:
                                insert_idx = 0
                                
                            lines.insert(insert_idx, import_stmt)
                            content = '\n'.join(lines)
                            
                    if content != original_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Refactored: {filepath}")
                        count += 1
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
                    
    print(f"Finished. Refactored {count} files.")

if __name__ == '__main__':
    src_dir = os.path.abspath('frontend/src')
    refactor_frontend(src_dir)
