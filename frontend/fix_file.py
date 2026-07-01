import sys

file_path = r'd:\sd\sd_trends\frontend\src\app\product\[id]\ProductClientPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if 'disabled={quantity >= (product.stock || 10)}' in line:
        start_idx = i
        break

if start_idx == -1:
    print("Could not find anchor")
    sys.exit(1)

replacement = """                disabled={quantity >= (product.stock || 10)}
              >
                <Plus size={12} />
              </button>
            </div>

            <button 
              type="button" 
              className={styles.stickyAddBtn}
              onClick={handleAddToCartClick}
              disabled={(product.stock || 0) <= 0}
            >
              ADD TO CART
            </button>
            <button 
              type="button" 
              className={styles.stickyBuyBtn}
              onClick={handleBuyNow}
              disabled={(product.stock || 0) <= 0}
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '0.9rem',
          fontWeight: 500,
          animation: 'fadeInOut 3s forwards'
        }}>
          {toastMsg}
          <style jsx>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translate(-50%, 20px); }
              10% { opacity: 1; transform: translate(-50%, 0); }
              90% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -20px); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
"""

new_lines = lines[:start_idx]
new_content = ''.join(new_lines) + replacement

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('File repaired successfully')
