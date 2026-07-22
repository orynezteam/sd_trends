import sqlite3

db_path = r'd:\sd_trends\backend\instance\site.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Map label -> correct URL based on actual pages in the site
url_map = {
    # Quick Links
    'Contact Us':        '/contact-us',
    'FAQs':              '/faqs',
    'About Us':          '/#about',

    # Services
    'Order Status':      '/track-order',
    'Terms Conditions':  '/terms-conditions',
    'Wholesale Policy':  '/contact-us',

    # Your Account
    'Checkout':          '/checkout',
    'Delivery':          '/track-order',
    'Sitemap':           '/shop',
}

for label, url in url_map.items():
    cursor.execute(
        "UPDATE sd_footer_links SET url = ? WHERE label = ?",
        (url, label)
    )
    print(f"  Updated '{label}' -> '{url}' (rows affected: {cursor.rowcount})")

conn.commit()
conn.close()
print("\nDone! All footer links updated.")
