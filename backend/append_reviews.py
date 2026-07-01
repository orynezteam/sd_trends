import sys

filepath = r'd:\sd\sd_trends\backend\app.py'

reviews_api = """
# ==========================================
# Product Reviews API
# ==========================================

@app.route("/api/products/<id>/reviews", methods=["GET"])
def get_product_reviews(id):
    product = Product.query.get_or_404(id)
    approved_reviews = [r.to_dict() for r in product.reviews if r.status == 'approved']
    return jsonify(approved_reviews), 200

@app.route("/api/products/<id>/reviews", methods=["POST"])
def add_product_review(id):
    product = Product.query.get_or_404(id)
    data = request.json
    new_review = ProductReview(
        product_id=id,
        author=data.get('author', 'Anonymous'),
        rating=int(data.get('rating', 5)),
        review_text=data.get('review_text', ''),
        status='approved'  # Default to approved based on user request
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify(new_review.to_dict()), 201

@app.route("/api/admin/reviews", methods=["GET"])
def get_all_reviews():
    reviews = ProductReview.query.order_by(ProductReview.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews]), 200

@app.route("/api/admin/reviews", methods=["POST"])
def admin_add_review():
    data = request.json
    new_review = ProductReview(
        product_id=data.get('product_id'),
        author=data.get('author', 'Admin'),
        rating=int(data.get('rating', 5)),
        review_text=data.get('review_text', ''),
        status=data.get('status', 'approved')
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify(new_review.to_dict()), 201

@app.route("/api/admin/reviews/<int:id>", methods=["PUT"])
def update_review(id):
    review = ProductReview.query.get_or_404(id)
    data = request.json
    if 'status' in data:
        review.status = data['status']
    if 'author' in data:
        review.author = data['author']
    if 'rating' in data:
        review.rating = int(data['rating'])
    if 'review_text' in data:
        review.review_text = data['review_text']
        
    db.session.commit()
    return jsonify(review.to_dict()), 200

@app.route("/api/admin/reviews/<int:id>", methods=["DELETE"])
def delete_review(id):
    review = ProductReview.query.get_or_404(id)
    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'}), 200
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(reviews_api)

print('Appended review endpoints successfully')
