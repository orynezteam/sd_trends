import os

def replace_url_in_files(directory, old_url, new_url):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if old_url in content:
                        new_content = content.replace(old_url, new_url)
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Replaced in: {filepath}")
                        count += 1
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
    print(f"Finished. Replaced URL in {count} files.")

if __name__ == '__main__':
    src_dir = os.path.abspath('src')
    old_target = "http://localhost:5000"
    new_target = "https://sd-trends.onrender.com"
    replace_url_in_files(src_dir, old_target, new_target)
