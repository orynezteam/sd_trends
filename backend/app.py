import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'products.json')
NEWSLETTER_FILE = os.path.join(os.path.dirname(__file__), 'data', 'newsletter.json')
CONTACT_FILE = os.path.join(os.path.dirname(__file__), 'data', 'contacts.json')

def load_products():
    try:
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading products: {e}")
        return []

@app.route('/api/products', methods=['GET'])
def get_products():
    products = load_products()
    
    category = request.args.get('category')
    tab = request.args.get('tab')
    
    # Filter by category if provided
    if category:
        products = [p for p in products if p['category'].lower() == category.lower()]
        
    # Filter by tab type (new, bestseller, featured)
    if tab:
        tab = tab.lower()
        if tab == 'new':
            products = [p for p in products if p.get('isNew')]
        elif tab == 'bestseller':
            products = [p for p in products if p.get('isBestSeller')]
        elif tab == 'featured':
            products = [p for p in products if p.get('isFeatured')]
            
    return jsonify(products)

@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '').strip().lower()
    if not query:
        return jsonify([])
        
    products = load_products()
    results = []
    
    for p in products:
        if (query in p['name'].lower() or 
            query in p['category'].lower() or 
            query in p['description'].lower()):
            results.append(p)
            
    return jsonify(results)

@app.route('/api/newsletter', methods=['POST'])
def subscribe_newsletter():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    
    if not email or '@' not in email:
        return jsonify({'error': 'Invalid email address'}), 400
        
    # Save to local newsletter list
    subscriptions = []
    if os.path.exists(NEWSLETTER_FILE):
        try:
            with open(NEWSLETTER_FILE, 'r', encoding='utf-8') as f:
                subscriptions = json.load(f)
        except Exception:
            pass
            
    if email not in subscriptions:
        subscriptions.append(email)
        try:
            os.makedirs(os.path.dirname(NEWSLETTER_FILE), exist_ok=True)
            with open(NEWSLETTER_FILE, 'w', encoding='utf-8') as f:
                json.dump(subscriptions, f, indent=2)
        except Exception as e:
            return jsonify({'error': f'Failed to save subscription: {e}'}), 500
            
    return jsonify({'success': True, 'message': 'Successfully subscribed to newsletter!'})

@app.route('/api/contact', methods=['POST'])
def contact_submit():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()
    
    if not name or not email or not message:
        return jsonify({'error': 'All fields (name, email, message) are required'}), 400
        
    # Save contact request
    contact_entry = {
        'name': name,
        'email': email,
        'message': message
    }
    
    contacts = []
    if os.path.exists(CONTACT_FILE):
        try:
            with open(CONTACT_FILE, 'r', encoding='utf-8') as f:
                contacts = json.load(f)
        except Exception:
            pass
            
    contacts.append(contact_entry)
    try:
        os.makedirs(os.path.dirname(CONTACT_FILE), exist_ok=True)
        with open(CONTACT_FILE, 'w', encoding='utf-8') as f:
            json.dump(contacts, f, indent=2)
    except Exception as e:
        return jsonify({'error': f'Failed to save message: {e}'}), 500
        
    return jsonify({'success': True, 'message': 'Message received. We will contact you soon!'})

if __name__ == '__main__':
    # Running on port 5000 by default
    app.run(host='0.0.0.0', port=5000, debug=True)
