import sqlite3

conn = sqlite3.connect('instance/site.db')
cursor = conn.cursor()
try:
    cursor.execute('ALTER TABLE sd_products ADD COLUMN details_json TEXT;')
    print("Column details_json added successfully.")
except sqlite3.OperationalError as e:
    print(f"Error: {e}")
conn.commit()
conn.close()
