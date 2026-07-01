import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, OTP, Order, HeroSlide, PromoBanner, ServiceCard, PromotionBanner, Product, ProductImage, SiteSetting, Category, Subcategory, MidPageBanner, Testimonial, FooterLink, ContactMessage, Subscriber, FAQ

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# ==========================================
# Auth API
# ==========================================
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.password_hash == data.get('password'):
        return jsonify({'message': 'Success', 'user': user.to_dict()}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    new_user = User(
        email=data.get('email'),
        password_hash=data.get('password'),
        name=data.get('name')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

# ==========================================
# Users API
# ==========================================
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@app.route("/api/users/<int:id>", methods=["PUT"])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json
    if 'is_admin' in data:
        user.is_admin = data['is_admin']
    db.session.commit()
    return jsonify({'message': 'Success', 'user': user.to_dict()}), 200

@app.route("/api/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@app.route("/api/users/<int:id>/wishlist", methods=["PUT"])
def update_user_wishlist(id):
    user = User.query.get_or_404(id)
    data = request.json
    if 'wishlist' in data:
        user.wishlist = json.dumps(data['wishlist'])
        db.session.commit()
    return jsonify({'message': 'Success', 'user': user.to_dict()}), 200

# ==========================================
# Products API
# ==========================================


@app.route("/api/products/<id>", methods=["PUT"])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    for key, val in data.items():
        if key == 'images' and isinstance(val, list):
            ProductImage.query.filter_by(product_id=id).delete()
            for idx, img_url in enumerate(val):
                new_img = ProductImage(product_id=id, image_url=img_url, display_order=idx)
                db.session.add(new_img)
        elif hasattr(product, key) and key != 'images':
            setattr(product, key, val)
    db.session.commit()
    return jsonify(product.to_dict()), 200

@app.route("/api/products/<id>", methods=["DELETE"])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ==========================================
# Testimonials API
# ==========================================
@app.route("/api/testimonials", methods=["GET"])
def get_testimonials():
    testimonials = Testimonial.query.order_by(Testimonial.created_at.desc()).all()
    return jsonify([t.to_dict() for t in testimonials]), 200

@app.route("/api/testimonials", methods=["POST"])
def add_testimonial():
    data = request.json
    new_t = Testimonial(
        author_name=data.get('author_name', ''),
        author_role=data.get('author_role', ''),
        content=data.get('content', ''),
        rating=data.get('rating', 5),
        is_approved=data.get('is_approved', False)
    )
    db.session.add(new_t)
    db.session.commit()
    return jsonify(new_t.to_dict()), 201

@app.route("/api/testimonials/<int:id>", methods=["PUT"])
def update_testimonial(id):
    t = Testimonial.query.get_or_404(id)
    data = request.json
    if 'is_approved' in data:
        t.is_approved = data['is_approved']
    if 'content' in data:
        t.content = data['content']
    db.session.commit()
    return jsonify(t.to_dict()), 200

@app.route("/api/testimonials/<int:id>", methods=["DELETE"])
def delete_testimonial(id):
    t = Testimonial.query.get_or_404(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ==========================================
# Footer API
# ==========================================
@app.route("/api/footer", methods=["GET"])
def get_footer():
    links = FooterLink.query.order_by(FooterLink.column_name, FooterLink.display_order).all()
    return jsonify([l.to_dict() for l in links]), 200

@app.route("/api/footer", methods=["POST"])
def add_footer():
    data = request.json
    link = FooterLink(
        column_name=data.get('column_name'),
        label=data.get('label'),
        url=data.get('url'),
        display_order=data.get('display_order', 0),
        is_active=data.get('is_active', True)
    )
    db.session.add(link)
    db.session.commit()
    return jsonify(link.to_dict()), 201

@app.route("/api/footer/<int:id>", methods=["PUT", "DELETE"])
def update_footer(id):
    link = FooterLink.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(link)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(link, k):
            setattr(link, k, v)
    db.session.commit()
    return jsonify(link.to_dict()), 200

# ==========================================
# Contact API
# ==========================================
@app.route("/api/contact", methods=["POST"])
def submit_contact():
    data = request.json
    msg = ContactMessage(
        name=data.get('name'),
        email=data.get('email'),
        message=data.get('message')
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict()), 201

@app.route("/api/contact/messages", methods=["GET"])
def get_messages():
    msgs = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([m.to_dict() for m in msgs]), 200

@app.route("/api/contact/messages/<int:id>", methods=["DELETE"])
def delete_message(id):
    msg = ContactMessage.query.get_or_404(id)
    db.session.delete(msg)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200





# ==========================================
# Newsletter API
# ==========================================
@app.route("/api/newsletter", methods=["POST"])
def subscribe_newsletter():
    data = request.json
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if user:
        user.is_subscribed = True
    sub = Subscriber.query.filter_by(email=email).first()
    if not sub:
        sub = Subscriber(email=email, is_active=True)
        db.session.add(sub)
    db.session.commit()
    return jsonify({"message": "Subscribed!"}), 200

@app.route("/api/newsletter/send", methods=["POST"])
def send_newsletter():
    data = request.json
    print(f"Sending newsletter to {data.get('productIds')}")
    return jsonify({"message": "Sent!"}), 200

# ==========================================
# FAQs API
# ==========================================
@app.route("/api/faqs", methods=["GET"])
def get_faqs():
    faqs = FAQ.query.order_by(FAQ.display_order.asc()).all()
    return jsonify([f.to_dict() for f in faqs]), 200

@app.route("/api/faqs", methods=["POST"])
def add_faq():
    data = request.json
    new_faq = FAQ(
        question=data.get('question', '').strip(),
        answer=data.get('answer', '').strip(),
        display_order=data.get('display_order', 0),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_faq)
    db.session.commit()
    return jsonify(new_faq.to_dict()), 201

@app.route("/api/faqs/<int:id>", methods=["PUT", "DELETE"])
def update_faq(id):
    faq = FAQ.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(faq)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(faq, k):
            setattr(faq, k, v)
    db.session.commit()
    return jsonify(faq.to_dict()), 200

# ==========================================
# Content API
# ==========================================

@app.route("/api/content/categories/hierarchy", methods=["GET"])
def get_categories_hierarchy():
    categories = Category.query.all()
    result = []
    for c in categories:
        c_dict = c.to_dict()
        subs = Subcategory.query.filter_by(category_id=c.id).all()
        c_dict['subcategories'] = [s.to_dict() for s in subs]
        result.append(c_dict)
    return jsonify(result), 200

@app.route("/api/content/hero", methods=["GET"])
def get_hero():
    slides = HeroSlide.query.order_by(HeroSlide.id).all()
    return jsonify([s.to_dict() for s in slides]), 200

@app.route("/api/content/promo", methods=["GET", "PUT", "OPTIONS"])
def api_promo_single():
    if request.method == "OPTIONS":
        return '', 204
    banner = PromoBanner.query.first()
    if request.method == "GET":
        if banner:
            return jsonify(banner.to_dict()), 200
        else:
            return jsonify({
                "text": "",
                "link_text": "",
                "link_url": "",
                "is_active": True
            }), 200
            
    if request.method == "PUT":
        data = request.json
        if not banner:
            banner = PromoBanner(
                text=data.get('text', ''),
                link_text=data.get('link_text', ''),
                link_url=data.get('link_url', ''),
                is_active=data.get('is_active', True)
            )
            db.session.add(banner)
        else:
            banner.text = data.get('text', banner.text)
            banner.link_text = data.get('link_text', banner.link_text)
            banner.link_url = data.get('link_url', banner.link_url)
            banner.is_active = data.get('is_active', banner.is_active)
            
        db.session.commit()
        return jsonify(banner.to_dict()), 200

@app.route("/api/content/mid-banners", methods=["GET"])
def get_mid_banners():
    banners = MidPageBanner.query.order_by(MidPageBanner.id).all()
    return jsonify([b.to_dict() for b in banners]), 200

@app.route("/api/content/services", methods=["GET"])
def get_services():
    services = ServiceCard.query.order_by(ServiceCard.display_order).all()
    return jsonify([s.to_dict() for s in services]), 200



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

@app.route('/api/content/services', methods=['POST', 'PUT'])
def add_or_update_services():
    if request.method == 'PUT':
        data = request.json
        if isinstance(data, list):
            for item in data:
                card = ServiceCard.query.get(item.get('id'))
                if card:
                    for key, val in item.items():
                        if hasattr(card, key):
                            setattr(card, key, val)
            db.session.commit()
            services = ServiceCard.query.order_by(ServiceCard.display_order).all()
            return jsonify({'cards': [s.to_dict() for s in services]}), 200
        return jsonify({'error': 'Invalid format'}), 400

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
            banners = PromotionBanner.query.all()
            return jsonify({'banners': [b.to_dict() for b in banners]}), 200

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
    if 'images' in data and isinstance(data['images'], list):
        for idx, img_url in enumerate(data['images']):
            new_img = ProductImage(product_id=new_p.id, image_url=img_url, display_order=idx)
            db.session.add(new_img)
    db.session.commit()
    return jsonify(new_p.to_dict()), 201




@app.route('/api/products', methods=['GET'])
def get_products():
    query = Product.query
    tab = request.args.get('tab')
    is_latest = request.args.get('is_latest')
    category = request.args.get('category')
    
    if is_latest == 'true':
        query = query.filter_by(is_latest=True)
    if category and category != 'All':
        query = query.filter_by(category=category)
    if tab == 'featured':
        query = query.filter_by(is_featured=True)
    elif tab == 'bestseller' or tab == 'best_sellers':
        query = query.filter_by(is_bestseller=True)
    elif tab == 'new' or tab == 'new_arrivals':
        query = query.filter_by(is_new=True)
    elif tab == 'top_rated':
        query = query.order_by(Product.rating.desc())
        
    products = query.all()
    return jsonify([p.to_dict() for p in products]), 200

@app.route('/api/products/search', methods=['GET'])
def search_products():
    q = request.args.get('q', '')
    if not q:
        return jsonify([]), 200
    products = Product.query.filter(Product.name.ilike(f'%{q}%')).limit(10).all()
    return jsonify([p.to_dict() for p in products]), 200

@app.route('/api/content/categories/home_featured', methods=['GET'])
def get_home_featured_categories():
    categories = Subcategory.query.filter_by(is_home_featured=True).limit(5).all()
    return jsonify([c.to_dict() for c in categories]), 200



@app.route('/api/settings', methods=['GET', 'POST', 'PUT'])
def api_settings():
    if request.method == 'GET':
        settings = SiteSetting.query.all()
        return jsonify({s.key: s.value for s in settings}), 200
    
    data = request.json
    for k, v in data.items():
        setting = SiteSetting.query.get(k)
        if setting:
            setting.value = str(v)
        else:
            db.session.add(SiteSetting(key=k, value=str(v)))
    db.session.commit()
    
    settings = SiteSetting.query.all()
    return jsonify({s.key: s.value for s in settings}), 200

@app.route('/api/contact/setup', methods=['GET', 'POST', 'PUT'])
def api_contact_setup():
    if request.method == 'GET':
        settings = SiteSetting.query.all()
        return jsonify({s.key: s.value for s in settings}), 200
    
    data = request.json
    for k, v in data.items():
        setting = SiteSetting.query.get(k)
        if setting:
            setting.value = str(v)
        else:
            db.session.add(SiteSetting(key=k, value=str(v)))
    db.session.commit()
    
    settings = SiteSetting.query.all()
    return jsonify({s.key: s.value for s in settings}), 200


import random
import os
import smtplib
from email.message import EmailMessage

otp_store = {}

def send_otp_email(to_email, otp):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    sender = os.environ.get('MAIL_DEFAULT_SENDER', smtp_username)
    
    if not smtp_username or not smtp_password:
        print('Error: SMTP credentials not found in environment variables.')
        return False
        
    msg = EmailMessage()
    msg.set_content(f'Your SD Trends Verification Code is: {otp}\n\nPlease do not share this code with anyone.')
    msg['Subject'] = 'Your SD Trends Verification Code'
    msg['From'] = sender
    msg['To'] = to_email
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f'Successfully sent OTP email to {to_email}')
        return True
    except Exception as e:
        print(f'Failed to send email: {e}')
        return False

@app.route('/api/auth/request-otp', methods=['POST', 'OPTIONS'])
def request_otp():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.json
    email = data.get('email')
    is_login = data.get('is_login', True)
    
    user = User.query.filter_by(email=email).first()
    
    if is_login and not user:
        return jsonify({'error': 'User is not available. Please go to Sign Up.'}), 404
        
    if not is_login and user:
        return jsonify({'error': 'Email already registered. Please login.'}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp
    
    print('='*50)
    print(f'=== GENERATED OTP FOR {email}: {otp} ===')
    print('='*50)
    
    # Send email
    send_otp_email(email, otp)
    
    return jsonify({'message': 'OTP sent', 'dev_otp': otp}), 200

@app.route('/api/auth/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.json
    email = data.get('email')
    otp = data.get('otp_code')
    
    if str(otp_store.get(email)) != str(otp):
        return jsonify({'error': 'Invalid OTP'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Register new user
        user = User(
            email=email,
            name=data.get('name', 'User'),
            phone=data.get('phone', ''),
            street_name=data.get('street_name', ''),
            landmark=data.get('landmark', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', ''),
            is_admin=False
        )
        db.session.add(user)
        db.session.commit()
    
    # Clean up OTP
    del otp_store[email]
    
    return jsonify({'message': 'Success', 'user': user.to_dict()}), 200









# ==========================================
# ADMIN WISHLIST ROUTES
# ==========================================

@app.route('/api/admin/users/<int:user_id>/wishlist', methods=['GET'])
def get_admin_user_wishlist(user_id):
    # In a real app, you would check admin authorization here
        
    user = User.query.get_or_404(user_id)
    try:
        wishlist_ids = json.loads(user.wishlist) if user.wishlist else []
    except:
        wishlist_ids = []
        
    wishlist_products = []
    for pid in wishlist_ids:
        product = Product.query.get(pid)
        if product:
            wishlist_products.append(product.to_dict())
            
    return jsonify(wishlist_products), 200

@app.route('/api/admin/users/<int:user_id>/send-wishlist-reminder', methods=['POST'])
def send_wishlist_reminder(user_id):
    # In a real app, you would check admin authorization here
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    try:
        wishlist_ids = json.loads(user.wishlist) if user.wishlist else []
    except:
        wishlist_ids = []
        
    if not wishlist_ids:
        return jsonify({'error': 'User has no items in their wishlist'}), 400
        
    # Build email content
    product_names = []
    for pid in wishlist_ids:
        p = Product.query.get(pid)
        if p:
            product_names.append(p.name)
    product_list_str = "\\n- ".join(product_names)
    
    # Email setup
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    sender = os.environ.get('MAIL_DEFAULT_SENDER', smtp_username)
    
    if not smtp_username or not smtp_password:
        return jsonify({'error': 'SMTP credentials not configured on the server'}), 500
        
    try:
        from email.message import EmailMessage
        import smtplib
        msg = EmailMessage()
        
        email_body = f"""Hi {user.name or 'there'},

We noticed you have some amazing items saved in your favorites!

Closing Soon Offer: Use code CLOSING10 for 10% off your next purchase. This is a limited time offer!

Your Favorites:
- {product_list_str}

Don't miss out, these items are selling fast!

Best,
SD Trends Team
"""
        
        msg.set_content(email_body)
        msg['Subject'] = 'Special Offer: Your Favorites are waiting!'
        msg['From'] = sender
        msg['To'] = user.email
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return jsonify({'message': 'Reminder email sent successfully'}), 200
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send email. Check server logs.'}), 500


# ==========================================
# Top Deals Config API
# ==========================================
@app.route('/api/settings/top-deals', methods=['GET'])
def get_top_deals_settings():
    categories_setting = SiteSetting.query.get('top_deals_categories')
    timer_setting = SiteSetting.query.get('top_deals_timer')
    
    # Default mock categories if not set
    default_categories = [
        {"name": "Diamond Ring", "imageUrl": "/images/featured_ring_1.png", "link": "/shop?subcategory=Diamond Rings"},
        {"name": "Hoops Earring", "imageUrl": "/images/products/earrings_hoop_1.png", "link": "/shop?subcategory=Hoops Earring"},
        {"name": "Studs Earring", "imageUrl": "/images/featured_earring_1.png", "link": "/shop?subcategory=Mamuli Earring"},
        {"name": "Antique Bangle", "imageUrl": "/images/featured_bangle_1.png", "link": "/shop?subcategory=Antique Bangle"}
    ]
    
    try:
        categories = json.loads(categories_setting.value) if categories_setting else default_categories
    except Exception:
        categories = default_categories
        
    return jsonify({
        'categories': categories,
        'timer': timer_setting.value if timer_setting else ""
    }), 200

@app.route('/api/admin/settings/top-deals', methods=['POST'])
def save_top_deals_settings():
    data = request.json
    categories = data.get('categories')
    timer = data.get('timer', '')
    
    if categories is not None:
        cat_setting = SiteSetting.query.get('top_deals_categories')
        if not cat_setting:
            cat_setting = SiteSetting(key='top_deals_categories')
            db.session.add(cat_setting)
        cat_setting.value = json.dumps(categories)
        
    timer_setting = SiteSetting.query.get('top_deals_timer')
    if not timer_setting:
        timer_setting = SiteSetting(key='top_deals_timer')
        db.session.add(timer_setting)
    timer_setting.value = timer
    
    db.session.commit()
    
    return jsonify({'message': 'Top deals settings saved successfully'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

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
