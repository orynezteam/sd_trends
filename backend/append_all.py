
@app.route('/api/settings', methods=['GET', 'POST', 'PUT'])
def api_settings():
    setting = SiteSetting.query.first()
    if request.method == 'GET':
        return jsonify(setting.to_dict()) if setting else jsonify({}), 200
    data = request.json
    if not setting:
        setting = SiteSetting(**{k: v for k, v in data.items() if hasattr(SiteSetting, k)})
        db.session.add(setting)
    else:
        for k, v in data.items():
            if hasattr(setting, k):
                setattr(setting, k, v)
    db.session.commit()
    return jsonify(setting.to_dict()), 200

@app.route('/api/content/promotion-banners', methods=['GET', 'POST', 'PUT'])
def api_promo_banners():
    if request.method == 'GET':
        banners = PromotionBanner.query.all()
        return jsonify([b.to_dict() for b in banners]), 200
    if request.method == 'POST':
        data = request.json
        new_banner = PromotionBanner(**{k: v for k, v in data.items() if hasattr(PromotionBanner, k)})
        db.session.add(new_banner)
        db.session.commit()
        return jsonify(new_banner.to_dict()), 201
    if request.method == 'PUT':
        data = request.json
        if isinstance(data, list):
            for item in data:
                b = PromotionBanner.query.get(item.get('id'))
                if b:
                    for k, v in item.items():
                        if hasattr(b, k): setattr(b, k, v)
            db.session.commit()
            return jsonify({'message': 'Updated'}), 200

@app.route('/api/content/promotion-banners/<id>', methods=['PUT', 'DELETE'])
def update_promo_banner(id):
    b = PromotionBanner.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(b)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(b, k): setattr(b, k, v)
    db.session.commit()
    return jsonify(b.to_dict()), 200

@app.route('/api/footer-links', methods=['GET', 'POST'])
def api_footer_links():
    if request.method == 'GET':
        links = FooterLink.query.all()
        return jsonify([l.to_dict() for l in links]), 200
    data = request.json
    new_link = FooterLink(**{k: v for k, v in data.items() if hasattr(FooterLink, k)})
    db.session.add(new_link)
    db.session.commit()
    return jsonify(new_link.to_dict()), 201

@app.route('/api/footer-links/<id>', methods=['PUT', 'DELETE'])
def update_footer_link(id):
    l = FooterLink.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(l)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(l, k): setattr(l, k, v)
    db.session.commit()
    return jsonify(l.to_dict()), 200

@app.route('/api/contact-messages', methods=['GET'])
def api_contact_messages():
    msgs = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([m.to_dict() for m in msgs]), 200

@app.route('/api/contact-messages/<id>', methods=['DELETE'])
def del_contact_message(id):
    m = ContactMessage.query.get_or_404(id)
    db.session.delete(m)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

@app.route('/api/content/mid_banners', methods=['GET'])
@app.route('/api/content/mid_banners/<slot>', methods=['GET', 'PUT', 'DELETE'])
def mid_banners_alias(slot=None):
    if not slot:
        banners = MidPageBanner.query.all()
        return jsonify([b.to_dict() for b in banners]), 200
    
    banner = MidPageBanner.query.filter_by(slot_name=slot).first()
    if not banner and request.method == 'GET':
        return jsonify({}), 404
        
    if request.method == 'GET':
        return jsonify(banner.to_dict()), 200
    elif request.method == 'DELETE':
        if banner:
            db.session.delete(banner)
            db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    elif request.method == 'PUT':
        data = request.json
        if not banner:
            banner = MidPageBanner(slot_name=slot, **{k: v for k, v in data.items() if hasattr(MidPageBanner, k) and k != 'slot_name'})
            db.session.add(banner)
        else:
            for k, v in data.items():
                if hasattr(banner, k) and k != 'slot_name': setattr(banner, k, v)
        db.session.commit()
        return jsonify(banner.to_dict()), 200

@app.route('/api/content/categories', methods=['GET', 'POST'])
def api_categories():
    if request.method == 'GET':
        cats = Category.query.all()
        return jsonify([c.to_dict() for c in cats]), 200
    data = request.json
    new_cat = Category(name=data.get('name', ''), description=data.get('description', ''), image_url=data.get('image_url', ''), is_active=data.get('is_active', True))
    db.session.add(new_cat)
    db.session.commit()
    return jsonify(new_cat.to_dict()), 201

@app.route('/api/content/categories/<id>', methods=['PUT', 'DELETE'])
def update_category(id):
    c = Category.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(c)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(c, k): setattr(c, k, v)
    db.session.commit()
    return jsonify(c.to_dict()), 200

@app.route('/api/content/subcategories/<id>', methods=['PUT', 'DELETE'])
def update_subcategory(id):
    c = Subcategory.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(c)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(c, k): setattr(c, k, v)
    db.session.commit()
    return jsonify(c.to_dict()), 200

@app.route('/api/content/categories/<cat_id>/subcategories', methods=['POST'])
def add_subcategory(cat_id):
    data = request.json
    new_sub = Subcategory(category_id=cat_id, name=data.get('name', ''), description=data.get('description', ''), is_active=data.get('is_active', True))
    db.session.add(new_sub)
    db.session.commit()
    return jsonify(new_sub.to_dict()), 201

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    new_p = Product(**{k: v for k, v in data.items() if hasattr(Product, k) and k != 'images'})
    db.session.add(new_p)
    db.session.commit()
    return jsonify(new_p.to_dict()), 201


