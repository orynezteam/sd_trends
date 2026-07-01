import os
import re

def fix_jsx_currency(directory):
    for root, dirs, files in os.walk(directory):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Replace >$ or > $ followed by {
                # E.g. >${p.price} -> >₹{p.price}
                # Also consider <span>${price}</span> or just space ${
                
                new_content = re.sub(r'>\s*\$\{', '>₹{', content)
                new_content = re.sub(r'>\s*\$ \$\{', '>₹ {', new_content) # if there is a space between $ and {
                
                # Wait, could also be inside quotes: text="$50" -> handled by digit replace
                # What if it's like <span className={styles.price}>${product.price}</span>
                # That matches >${
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f"Updated JSX {f}")

if __name__ == '__main__':
    fix_jsx_currency('d:/sd/sd_trends/frontend/src')
