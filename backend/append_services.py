
@app.route('/api/content/services/<id>', methods=['PUT', 'DELETE'])
def update_service(id):
    card = ServiceCard.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(card)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    
    data = request.json
    for key, val in data.items():
        if hasattr(card, key):
            setattr(card, key, val)
    db.session.commit()
    return jsonify(card.to_dict()), 200

@app.route('/api/content/services', methods=['POST'])
def add_service():
    data = request.json
    new_card = ServiceCard(
        icon_name=data.get('icon_name', ''),
        title=data.get('title', ''),
        description=data.get('description', ''),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_card)
    db.session.commit()
    return jsonify(new_card.to_dict()), 201

@app.route('/api/content/mid-banners/<id>', methods=['PUT', 'DELETE'])
def update_mid_banner(id):
    banner = MidPageBanner.query.get_or_404(id)
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

@app.route('/api/content/mid-banners', methods=['POST'])
def add_mid_banner():
    data = request.json
    new_banner = MidPageBanner(
        title=data.get('title', ''),
        subtitle=data.get('subtitle', ''),
        button_text=data.get('button_text', ''),
        image_url=data.get('image_url', ''),
        link=data.get('link', ''),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_banner)
    db.session.commit()
    return jsonify(new_banner.to_dict()), 201

