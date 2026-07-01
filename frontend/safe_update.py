import sys

file_path = r'd:\sd\sd_trends\frontend\src\app\product\[id]\ProductClientPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Helper for safe replacement
def safe_replace(old, new):
    global content
    if old not in content:
        print("ERROR: Could not find substring to replace:\n", old)
        sys.exit(1)
    if content.count(old) > 1:
        print("ERROR: Found multiple occurrences of substring to replace:\n", old)
        sys.exit(1)
    content = content.replace(old, new)

# 1. State changes
state_old = """  // Mock static-but-dynamic-looking sales & viewer counts
  const [soldCount, setSoldCount] = useState(14);
  const [viewerCount, setViewerCount] = useState(21);

  useEffect(() => {
    // Randomize slightly on load to look alive
    setSoldCount(Math.floor(Math.random() * 8) + 12);
    setViewerCount(Math.floor(Math.random() * 15) + 18);
  }, [productId]);"""
state_new = """  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };"""

safe_replace(state_old, state_new)

# 2. Fire tag
fire_old = """              {/* sold count with fire icon */}
              <div className={styles.fireTag}>
                <Flame size={16} className={styles.fireIcon} />
                <span>{soldCount} products sold in last 1 hour</span>
              </div>"""
fire_new = """              {/* sold count with fire icon */}
              <div className={styles.fireTag}>
                <Flame size={16} className={styles.fireIcon} />
                <span>{product.soldCount || 15} products sold in last 1 hour</span>
              </div>"""

safe_replace(fire_old, fire_new)

# 3. Stock badge
stock_old = """              {/* stock count badge */}
              <div className={styles.stockRow}>
                <span className={styles.stockBadge}>
                  {product.stock > 0 ? `${product.stock + 200} in stock` : 'Out of stock'}
                </span>
              </div>"""
stock_new = """              {/* stock count badge */}
              <div className={styles.stockRow}>
                <span className={styles.stockBadge}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>"""

safe_replace(stock_old, stock_new)

# 4. Utility Row Links
util_old = """              {/* Utility Row Links */}
              <div className={styles.utilityRow}>
                <button type="button" className={styles.utilityBtn}>
                  <Shuffle size={14} /> COMPARE
                </button>
                <button 
                  type="button" 
                  className={`${styles.utilityBtn} ${isWishlisted ? styles.utilityBtnActive : ''}`}
                  onClick={() => {
                    if (isWishlisted) {
                      router.push('/wishlist');
                    } else {
                      toggleWishlist(product.id);
                    }
                  }}
                >
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? 'VIEW WISHLIST' : 'ADD TO WISHLIST'}
                </button>
                <button type="button" className={styles.utilityBtn}>
                  <HelpCircle size={14} /> ASK US
                </button>
                <button type="button" className={styles.utilityBtn}>
                  <Share2 size={14} /> SHARE
                </button>
              </div>"""
util_new = """              {/* Utility Row Links */}
              <div className={styles.utilityRow}>
                <button type="button" className={styles.utilityBtn} onClick={() => showToast('Compare feature coming soon!')}>
                  <Shuffle size={14} /> COMPARE
                </button>
                <button 
                  type="button" 
                  className={`${styles.utilityBtn} ${isWishlisted ? styles.utilityBtnActive : ''}`}
                  onClick={() => {
                    if (isWishlisted) {
                      router.push('/wishlist');
                    } else {
                      toggleWishlist(product.id);
                      showToast('Added to Wishlist!');
                    }
                  }}
                >
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? 'VIEW WISHLIST' : 'ADD TO WISHLIST'}
                </button>
                <button type="button" className={styles.utilityBtn} onClick={() => router.push('/contact-us')}>
                  <HelpCircle size={14} /> ASK US
                </button>
                <button type="button" className={styles.utilityBtn} onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard!');
                }}>
                  <Share2 size={14} /> SHARE
                </button>
              </div>"""

safe_replace(util_old, util_new)

# 5. Viewer Counter
viewer_old = """              {/* Viewer counter */}
              <div className={styles.eyeTag}>
                <Eye size={16} className={styles.eyeIcon} />
                <span>{viewerCount} people are viewing this right now</span>
              </div>"""
viewer_new = """              {/* Viewer counter */}
              <div className={styles.eyeTag}>
                <Eye size={16} className={styles.eyeIcon} />
                <span>{product.viewerCount || 18} people are viewing this right now</span>
              </div>"""

safe_replace(viewer_old, viewer_new)

# 6. Toast UI at the bottom
end_old = """        </div>
      </div>
    </div>
  );
}"""
end_new = """        </div>
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
}"""

safe_replace(end_old, end_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
