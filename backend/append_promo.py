
@app.route('/api/content/promo/<id>', methods=['PUT', 'DELETE'])
def update_promo(id):
    banner = PromoBanner.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(banner)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    
    data = request.json
    for key, val in data.items():
        if hasattr(banner, key):
            setattr(banner, key, val)
    db.session.commit()
    return jsonify(banner.to_dict()), 200

@app.route('/api/content/promo', methods=['POST'])
def add_promo():
    data = request.json
    new_banner = PromoBanner(
        text=data.get('text', ''),
        link_text=data.get('link_text', ''),
        link_url=data.get('link_url', ''),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_banner)
    db.session.commit()
    return jsonify(new_banner.to_dict()), 201

