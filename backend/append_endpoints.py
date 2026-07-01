
@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    return jsonify({
        'user': user.to_dict(),
        'orders': [o.to_dict() for o in orders]
    }), 200

@app.route('/api/content/hero/<id>', methods=['PUT', 'DELETE'])
def update_hero(id):
    slide = HeroSlide.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(slide)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    
    data = request.json
    for key, val in data.items():
        if hasattr(slide, key):
            setattr(slide, key, val)
    db.session.commit()
    return jsonify(slide.to_dict()), 200

@app.route('/api/content/hero', methods=['POST'])
def add_hero():
    data = request.json
    new_slide = HeroSlide(
        title=data.get('title', ''),
        subtitle=data.get('subtitle', ''),
        description=data.get('description', ''),
        button_text=data.get('button_text', ''),
        image_url=data.get('image_url', ''),
        link=data.get('link', ''),
        object_position=data.get('object_position', 'center'),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_slide)
    db.session.commit()
    return jsonify(new_slide.to_dict()), 201


