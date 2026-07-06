import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from models import (
    db,
    User,
    OTP,
    Order,
    HeroSlide,
    PromoBanner,
    ServiceCard,
    PromotionBanner,
    Product,
    ProductImage,
    SiteSetting,
    Category,
    Subcategory,
    MidPageBanner,
    Testimonial,
    FooterLink,
    ContactMessage,
    Subscriber,
    FAQ,
    ProductReview,
)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))

# Configure Database URI: use POSTGRES_URI if provided, otherwise fallback to SQLite
db_uri = os.environ.get("POSTGRES_URI")
if db_uri:
    if db_uri.startswith("postgresql://"):
        prefix = "postgresql://"
        rest = db_uri[len(prefix) :]
        if "@" in rest:
            # Split by the last '@' to separate userinfo from host info
            parts = rest.rsplit("@", 1)
            userinfo = parts[0]
            hostinfo = parts[1]
            # URL-encode the password if it contains special characters and is not already encoded
            if ":" in userinfo:
                username, password = userinfo.split(":", 1)
                if "%" not in password:
                    from urllib.parse import quote

                    password = quote(password)
                userinfo = f"{username}:{password}"
            db_uri = f"postgresql+pg8000://{userinfo}@{hostinfo}"
        else:
            db_uri = db_uri.replace("postgresql://", "postgresql+pg8000://", 1)
else:
    db_uri = "sqlite:///" + os.path.join(basedir, "instance", "site.db")

app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

import time
_cache = {}
def ttl_cache(key, ttl=300):
    def decorator(func):
        def wrapper(*args, **kwargs):
            now = time.time()
            if key in _cache and now - _cache[key]["time"] < ttl:
                return _cache[key]["data"]
            result = func(*args, **kwargs)
            # Only cache successful JSON responses (tuple of dict, 200)
            if isinstance(result, tuple) and result[1] == 200:
                # Flask's jsonify returns a Response, we need to extract JSON if we want to cache it, or just cache the response data.
                # Actually, if the function returns (jsonify(...), 200), we can just cache the tuple if it's safe. But Flask Response objects are bound to the app context.
                pass
            return result
        # To avoid Flask Response context issues, we'll implement caching directly in the route functions instead of a decorator for simplicity.
        return wrapper

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": time.time()}), 200



# ==========================================
# Auth API
# ==========================================
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()
    if user and user.password_hash == data.get("password"):
        return jsonify({"message": "Success", "user": user.to_dict()}), 200
    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "Email already exists"}), 400
    new_user = User(
        email=data.get("email"),
        password_hash=data.get("password"),
        name=data.get("name"),
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
    if "is_admin" in data:
        user.is_admin = data["is_admin"]
    db.session.commit()
    return jsonify({"message": "Success", "user": user.to_dict()}), 200


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
    if "wishlist" in data:
        user.wishlist = json.dumps(data["wishlist"])
        db.session.commit()
    return jsonify({"message": "Success", "user": user.to_dict()}), 200


# ==========================================
# Products API
# ==========================================


@app.route("/api/products/<id>", methods=["PUT"])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    for key, val in data.items():
        if key == "images" and isinstance(val, list):
            ProductImage.query.filter_by(product_id=id).delete()
            for idx, img_url in enumerate(val):
                new_img = ProductImage(
                    product_id=id, image_url=img_url, display_order=idx
                )
                db.session.add(new_img)
        elif hasattr(product, key) and key != "images":
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
# Testimonials ,API
# ==========================================
@app.route("/api/testimonials", methods=["GET"])
def get_testimonials():
    testimonials = Testimonial.query.order_by(Testimonial.created_at.desc()).all()
    return jsonify([t.to_dict() for t in testimonials]), 200


@app.route("/api/testimonials", methods=["POST"])
def add_testimonial():
    data = request.json
    new_t = Testimonial(
        author_name=data.get("author_name", ""),
        author_role=data.get("author_role", ""),
        content=data.get("content", ""),
        rating=data.get("rating", 5),
        is_approved=data.get("is_approved", False),
    )
    db.session.add(new_t)
    db.session.commit()
    return jsonify(new_t.to_dict()), 201


@app.route("/api/testimonials/<int:id>", methods=["PUT"])
def update_testimonial(id):
    t = Testimonial.query.get_or_404(id)
    data = request.json
    if "title" in data:
        t.title = data["title"]
    if "quote" in data:
        t.quote = data["quote"]
    if "author" in data:
        t.author = data["author"]
    if "role" in data:
        t.role = data["role"]
    if "status" in data:
        t.status = data["status"]
    if "image_url" in data:
        t.image_url = data["image_url"]
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
    links = FooterLink.query.order_by(
        FooterLink.column_name, FooterLink.display_order
    ).all()
    return jsonify([l.to_dict() for l in links]), 200


@app.route("/api/footer", methods=["POST"])
def add_footer():
    data = request.json
    link = FooterLink(
        column_name=data.get("column_name"),
        label=data.get("label"),
        url=data.get("url"),
        display_order=data.get("display_order", 0),
        is_active=data.get("is_active", True),
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
        name=data.get("name"), email=data.get("email"), message=data.get("message")
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
    email = data.get("email")
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
        question=data.get("question", "").strip(),
        answer=data.get("answer", "").strip(),
        display_order=data.get("display_order", 0),
        is_active=data.get("is_active", True),
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
        c_dict["subcategories"] = [s.to_dict() for s in subs]
        result.append(c_dict)
    return jsonify(result), 200


@app.route("/api/content/hero", methods=["GET"])
def get_hero():
    slides = HeroSlide.query.order_by(HeroSlide.id).all()
    return jsonify([s.to_dict() for s in slides]), 200


@app.route("/api/content/promo", methods=["GET", "PUT", "OPTIONS"])
def api_promo_single():
    if request.method == "OPTIONS":
        return "", 204
    banner = PromoBanner.query.first()
    if request.method == "GET":
        if banner:
            return jsonify(banner.to_dict()), 200
        else:
            return (
                jsonify(
                    {"text": "", "link_text": "", "link_url": "", "is_active": True}
                ),
                200,
            )

    if request.method == "PUT":
        data = request.json
        if not banner:
            banner = PromoBanner(
                text=data.get("text", ""),
                link_text=data.get("link_text", ""),
                link_url=data.get("link_url", ""),
                is_active=data.get("is_active", True),
            )
            db.session.add(banner)
        else:
            banner.text = data.get("text", banner.text)
            banner.link_text = data.get("link_text", banner.link_text)
            banner.link_url = data.get("link_url", banner.link_url)
            banner.is_active = data.get("is_active", banner.is_active)

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


@app.route("/api/user/profile", methods=["GET"])
def get_user_profile():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    orders = (
        Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    )
    return (
        jsonify({"user": user.to_dict(), "orders": [o.to_dict() for o in orders]}),
        200,
    )


@app.route("/api/content/hero/<id>", methods=["PUT", "DELETE"])
def update_hero(id):
    slide = HeroSlide.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(slide)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200

    data = request.json
    for key, val in data.items():
        if hasattr(slide, key):
            setattr(slide, key, val)
    db.session.commit()
    return jsonify(slide.to_dict()), 200


@app.route("/api/content/hero", methods=["POST"])
def add_hero():
    data = request.json
    new_slide = HeroSlide(
        title=data.get("title", ""),
        subtitle=data.get("subtitle", ""),
        description=data.get("description", ""),
        button_text=data.get("button_text", ""),
        image_url=data.get("image_url", ""),
        link=data.get("link", ""),
        object_position=data.get("object_position", "center"),
        is_active=data.get("is_active", True),
    )
    db.session.add(new_slide)
    db.session.commit()
    return jsonify(new_slide.to_dict()), 201


@app.route("/api/content/services/<id>", methods=["PUT", "DELETE"])
def update_service(id):
    card = ServiceCard.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(card)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200

    data = request.json
    for key, val in data.items():
        if hasattr(card, key):
            setattr(card, key, val)
    db.session.commit()
    return jsonify(card.to_dict()), 200


@app.route("/api/content/services", methods=["POST", "PUT"])
def add_or_update_services():
    if request.method == "PUT":
        data = request.json
        if isinstance(data, list):
            for item in data:
                card = ServiceCard.query.get(item.get("id"))
                if card:
                    for key, val in item.items():
                        if hasattr(card, key):
                            setattr(card, key, val)
            db.session.commit()
            services = ServiceCard.query.order_by(ServiceCard.display_order).all()
            return jsonify({"cards": [s.to_dict() for s in services]}), 200
        return jsonify({"error": "Invalid format"}), 400

    data = request.json
    new_card = ServiceCard(
        icon_name=data.get("icon_name", ""),
        title=data.get("title", ""),
        description=data.get("description", ""),
        is_active=data.get("is_active", True),
    )
    db.session.add(new_card)
    db.session.commit()
    return jsonify(new_card.to_dict()), 201


@app.route("/api/content/mid-banners/<id>", methods=["PUT", "DELETE"])
def update_mid_banner(id):
    banner = MidPageBanner.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(banner)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200

    data = request.json
    for key, val in data.items():
        if hasattr(banner, key):
            setattr(banner, key, val)
    db.session.commit()
    return jsonify(banner.to_dict()), 200


@app.route("/api/content/mid-banners", methods=["POST"])
def add_mid_banner():
    data = request.json
    new_banner = MidPageBanner(
        title=data.get("title", ""),
        subtitle=data.get("subtitle", ""),
        button_text=data.get("button_text", ""),
        image_url=data.get("image_url", ""),
        link=data.get("link", ""),
        is_active=data.get("is_active", True),
    )
    db.session.add(new_banner)
    db.session.commit()
    return jsonify(new_banner.to_dict()), 201


@app.route("/api/content/promotion-banners", methods=["GET", "POST", "PUT"])
def api_promo_banners():
    if request.method == "GET":
        banners = PromotionBanner.query.all()
        return jsonify([b.to_dict() for b in banners]), 200
    if request.method == "POST":
        data = request.json
        new_banner = PromotionBanner(
            **{k: v for k, v in data.items() if hasattr(PromotionBanner, k)}
        )
        db.session.add(new_banner)
        db.session.commit()
        return jsonify(new_banner.to_dict()), 201
    if request.method == "PUT":
        data = request.json
        if isinstance(data, list):
            for item in data:
                b = PromotionBanner.query.get(item.get("id"))
                if b:
                    for k, v in item.items():
                        if hasattr(b, k):
                            setattr(b, k, v)
            db.session.commit()
            banners = PromotionBanner.query.all()
            return jsonify({"banners": [b.to_dict() for b in banners]}), 200


@app.route("/api/content/promotion-banners/<id>", methods=["PUT", "DELETE"])
def update_promo_banner(id):
    b = PromotionBanner.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(b)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(b, k):
            setattr(b, k, v)
    db.session.commit()
    return jsonify(b.to_dict()), 200


@app.route("/api/footer-links", methods=["GET", "POST"])
def api_footer_links():
    if request.method == "GET":
        links = FooterLink.query.all()
        return jsonify([l.to_dict() for l in links]), 200
    data = request.json
    new_link = FooterLink(**{k: v for k, v in data.items() if hasattr(FooterLink, k)})
    db.session.add(new_link)
    db.session.commit()
    return jsonify(new_link.to_dict()), 201


@app.route("/api/footer-links/<id>", methods=["PUT", "DELETE"])
def update_footer_link(id):
    l = FooterLink.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(l)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(l, k):
            setattr(l, k, v)
    db.session.commit()
    return jsonify(l.to_dict()), 200


@app.route("/api/contact-messages", methods=["GET"])
def api_contact_messages():
    msgs = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([m.to_dict() for m in msgs]), 200


@app.route("/api/contact-messages/<id>", methods=["DELETE"])
def del_contact_message(id):
    m = ContactMessage.query.get_or_404(id)
    db.session.delete(m)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@app.route("/api/content/mid_banners", methods=["GET"])
@app.route("/api/content/mid_banners/<slot>", methods=["GET", "PUT", "DELETE"])
def mid_banners_alias(slot=None):
    if not slot:
        banners = MidPageBanner.query.all()
        return jsonify([b.to_dict() for b in banners]), 200

    banner = MidPageBanner.query.filter_by(slot_name=slot).first()
    if not banner and request.method == "GET":
        return jsonify({}), 404

    if request.method == "GET":
        return jsonify(banner.to_dict()), 200
    elif request.method == "DELETE":
        if banner:
            db.session.delete(banner)
            db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    elif request.method == "PUT":
        data = request.json
        if not banner:
            banner = MidPageBanner(
                slot_name=slot,
                **{
                    k: v
                    for k, v in data.items()
                    if hasattr(MidPageBanner, k) and k != "slot_name"
                },
            )
            db.session.add(banner)
        else:
            for k, v in data.items():
                if hasattr(banner, k) and k != "slot_name":
                    setattr(banner, k, v)
        db.session.commit()
        return jsonify(banner.to_dict()), 200


@app.route("/api/content/categories", methods=["GET", "POST"])
def api_categories():
    if request.method == "GET":
        cats = Category.query.all()
        return jsonify([c.to_dict() for c in cats]), 200
    data = request.json
    new_cat = Category(
        name=data.get("name", ""), display_order=int(data.get("display_order", 0))
    )
    db.session.add(new_cat)
    db.session.commit()
    return jsonify(new_cat.to_dict()), 201


@app.route("/api/content/categories/<id>", methods=["PUT", "DELETE"])
def update_category(id):
    c = Category.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(c)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(c, k):
            setattr(c, k, v)
    db.session.commit()
    return jsonify(c.to_dict()), 200


@app.route("/api/content/subcategories/<id>", methods=["PUT", "DELETE"])
def update_subcategory(id):
    c = Subcategory.query.get_or_404(id)
    if request.method == "DELETE":
        db.session.delete(c)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    data = request.json
    for k, v in data.items():
        if hasattr(c, k):
            setattr(c, k, v)
    db.session.commit()
    return jsonify(c.to_dict()), 200


@app.route("/api/content/categories/<cat_id>/subcategories", methods=["POST"])
def add_subcategory(cat_id):
    data = request.json
    new_sub = Subcategory(
        category_id=int(cat_id),
        name=data.get("name", ""),
        display_order=int(data.get("display_order", 0)),
        is_home_featured=data.get("is_home_featured", False),
        home_image_url=data.get("home_image_url"),
        home_count_text=data.get("home_count_text"),
    )
    db.session.add(new_sub)
    db.session.commit()
    return jsonify(new_sub.to_dict()), 201


@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.json
    new_p = Product(
        **{k: v for k, v in data.items() if hasattr(Product, k) and k != "images"}
    )
    db.session.add(new_p)
    if "images" in data and isinstance(data["images"], list):
        for idx, img_url in enumerate(data["images"]):
            new_img = ProductImage(
                product_id=new_p.id, image_url=img_url, display_order=idx
            )
            db.session.add(new_img)
    db.session.commit()
    return jsonify(new_p.to_dict()), 201


@app.route("/api/products", methods=["GET"])
def get_products():
    tab = request.args.get("tab")
    is_latest = request.args.get("is_latest")
    category = request.args.get("category")

    # Simple cache key
    cache_key = f"products_{tab}_{is_latest}_{category}"
    now = time.time()
    if cache_key in _cache and now - _cache[cache_key]["time"] < 300:
        return jsonify(_cache[cache_key]["data"]), 200

    query = Product.query

    if is_latest == "true":
        query = query.filter_by(is_latest=True)
    if category and category != "All":
        query = query.filter_by(category=category)
    if tab == "featured":
        query = query.filter_by(is_featured=True)
    elif tab == "bestseller" or tab == "best_sellers":
        query = query.filter_by(is_bestseller=True)
    elif tab == "new" or tab == "new_arrivals":
        query = query.filter_by(is_new=True)
    elif tab == "top_rated":
        query = query.order_by(Product.rating.desc())

    products = query.all()
    products_data = [p.to_dict() for p in products]
    _cache[cache_key] = {"data": products_data, "time": now}
    return jsonify(products_data), 200


@app.route("/api/products/search", methods=["GET"])
def search_products():
    q = request.args.get("q", "")
    if not q:
        return jsonify([]), 200
    products = Product.query.filter(Product.name.ilike(f"%{q}%")).limit(10).all()
    return jsonify([p.to_dict() for p in products]), 200


@app.route("/api/content/categories/home_featured", methods=["GET"])
def get_home_featured_categories():
    categories = (
        Subcategory.query.filter_by(is_home_featured=True)
        .order_by(Subcategory.display_order)
        .all()
    )
    return jsonify([c.to_dict() for c in categories]), 200


import json
import threading

def send_smtp_email(to_email, subject, body_text):
    import urllib.request
    import json
    import os

    # 1. Try sending via Brevo HTTP API (HTTP REST over port 443, never blocked by Render)
    brevo_api_key = os.environ.get("BREVO_API_KEY")
    if brevo_api_key:
        print("Attempting email transmission via Brevo HTTP API...")
        
        # HTML content template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #2c3e50;
                    background-color: #faf8f6;
                    padding: 30px;
                    margin: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #ebdcd5;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.03);
                }}
                .header {{
                    background: linear-gradient(135deg, #1c1b19 0%, #2d1f1f 100%);
                    color: #ffffff;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 26px;
                    font-weight: 500;
                    letter-spacing: 3px;
                    color: #f7e6d4;
                }}
                .content {{
                    padding: 40px 30px;
                    line-height: 1.7;
                    font-size: 15px;
                }}
                .footer {{
                    background-color: #fcfbfa;
                    padding: 24px;
                    text-align: center;
                    font-size: 11px;
                    color: #9e9a95;
                    border-top: 1px solid #ebdcd5;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>SD TRENDS DESIGN</h1>
                </div>
                <div class="content">
                    {body_text.replace('\n', '<br>')}
                </div>
                <div class="footer">
                    &copy; 2026 SD Trends Luxury Jewelry. All rights reserved.<br>
                    This email was sent to you as an official order transaction notice.
                </div>
            </div>
        </body>
        </html>
        """

        sender = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@sdtrends.com")
        
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json",
        }
        data = {
            "sender": {"name": "SD Trends", "email": sender},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_content,
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req) as response:
                print(f"Successfully sent Brevo email to {to_email}")
                return True
        except Exception as e:
            print(f"Brevo HTTP exception: {e}")

    # Fallback to local console logging if Brevo fails or API key is missing
    print(
        f"--- EMAIL FALLBACK TO {to_email} ---\nSubject: {subject}\nBody:\n{body_text}\n----------------------"
    )
    return False

def send_smtp_email_async(to_email, subject, body_text):
    # Sends email in a background thread to prevent blocking the request
    thread = threading.Thread(target=send_smtp_email, args=(to_email, subject, body_text))
    thread.daemon = True
    thread.start()



def notify_admin_of_new_order(order, user, items):
    admin_email = os.environ.get("ADMIN_EMAIL", "karthikrajay.cc@gmail.com")
    frontend_url = os.environ.get("FRONTEND_URL", "https://sd-trends.netlify.app")


    items_list_str = ""
    for item in items:
        items_list_str += f"- {item.get('name')} ({item.get('metal')}): Qty {item.get('quantity')} @ ₹{item.get('price')}\n"

    subject = f"NEW ORDER: Order #{order.id} Pending Verification"
    body = f"""Hello Admin,

A new order has been placed and requires payment verification.

Order ID: #{order.id}
Payment Method: {order.payment_method}
Total Amount: ₹{order.total_amount}

Customer Details:
Name: {user.name}
Email: {user.email}
Phone: {user.phone}
Address: {user.street_name}, {user.state}, {user.pincode}

Items Ordered:
{items_list_str}

Please review the payment and update the status in the Admin Dashboard:
{frontend_url}/admin/orders
"""
    send_smtp_email_async(admin_email, subject, body)


def notify_customer_order_verified(order, user):
    frontend_url = os.environ.get("FRONTEND_URL", "https://sd-trends.netlify.app")
    subject = f"Your SD Trends Order #{order.id} has been confirmed!"
    body = f"""Dear {user.name},

Thank you for your purchase! We have successfully verified your payment of ₹{order.total_amount} for Order #{order.id}.

Your order has been confirmed and is now being processed.

You can view your order status, items ordered, and progress on our website:
{frontend_url}/checkout/status?order_id={order.id}

Best regards,
SD Trends Team
"""
    send_smtp_email_async(user.email, subject, body)


def notify_customer_order_declined(order, user):
    frontend_url = os.environ.get("FRONTEND_URL", "https://sd-trends.netlify.app")
    subject = f"Payment Verification Failed for SD Trends Order #{order.id}"
    body = f"""Dear {user.name},

We are writing to inform you that we were unable to verify your payment of ₹{order.total_amount} for Order #{order.id}. 

As a result, your order has been declined (Payment not done).

You can review your order status and attempt payment again on our website:
{frontend_url}/checkout/status?order_id={order.id}

Best regards,
SD Trends Team
"""
    send_smtp_email_async(user.email, subject, body)


def notify_customer_order_shipped(order, user):
    frontend_url = os.environ.get("FRONTEND_URL", "https://sd-trends.netlify.app")
    subject = f"Your SD Trends Order #{order.id} has been Shipped!"
    body = f"""Dear {user.name},

Great news! Your Order #{order.id} has been marked as Shipped and is on its way to your address.

You can track your order status on our website:
{frontend_url}/track-order?order_id={order.id}

Thank you for shopping with SD Trends!

Best regards,
SD Trends Team
"""
    send_smtp_email_async(user.email, subject, body)


@app.route("/api/orders", methods=["GET", "POST"])
def handle_orders():
    if request.method == "GET":
        orders = Order.query.order_by(Order.created_at.desc()).all()
        result = []
        for o in orders:
            d = o.to_dict()
            d["user"] = o.user.to_dict() if o.user else None
            result.append(d)
        return jsonify(result), 200

    data = request.json
    email = data.get("email")
    total_amount = float(data.get("total_amount", 0))
    status = data.get("status", "Pending")
    payment_method = data.get("payment_method", "Direct Bank Transfer")
    items = data.get("items", [])

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            email=email,
            name=data.get("name", ""),
            phone=data.get("phone", ""),
            street_name=data.get("street_name", ""),
            city=data.get("city", ""),
            state=data.get("state", ""),
            pincode=data.get("pincode", ""),
        )
        db.session.add(user)
        db.session.commit()

    order = Order(
        user_id=user.id,
        total_amount=total_amount,
        status=status,
        payment_method=payment_method,
        items_json=json.dumps(items),
    )
    db.session.add(order)
    db.session.commit()

    if status == "Pending Verification":
        try:
            notify_admin_of_new_order(order, user, items)
        except Exception as ex:
            print("Error notifying admin:", ex)

    return jsonify(order.to_dict()), 201


@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.json
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status is required"}), 400

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    old_status = order.status
    order.status = status
    db.session.commit()

    if status != old_status:
        try:
            if status == "Pending Verification":
                import json

                items = []
                if order.items_json:
                    try:
                        items = json.loads(order.items_json)
                    except:
                        pass
                notify_admin_of_new_order(order, order.user, items)
            elif status == "Processing":
                notify_customer_order_verified(order, order.user)
            elif status == "Declined":
                notify_customer_order_declined(order, order.user)
            elif status == "Shipped":
                notify_customer_order_shipped(order, order.user)
        except Exception as ex:
            print("Error sending status transition email:", ex)

    return jsonify(order.to_dict()), 200


@app.route("/api/orders/<int:order_id>", methods=["GET"])
def get_single_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    d = order.to_dict()
    d["user"] = order.user.to_dict() if order.user else None
    return jsonify(d), 200


@app.route("/api/settings", methods=["GET", "POST", "PUT"])
def api_settings():
    if request.method == "GET":
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


@app.route("/api/contact/setup", methods=["GET", "POST", "PUT"])
def api_contact_setup():
    if request.method == "GET":
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

otp_store = {}


def send_otp_email(to_email, otp):
    sender = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@sdtrends.com")
    print(f"sender: {sender}")

    # Try Brevo HTTP API (Best for Render free tier, no port blocking)
    brevo_api_key = os.environ.get("BREVO_API_KEY")
    if brevo_api_key:
        import urllib.request
        import json

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json",
        }
        data = {
            "sender": {"name": "SD Trends", "email": sender},
            "to": [{"email": to_email}],
            "subject": "Your SD Trends Verification Code",
            "htmlContent": f"<html><body><p>Your SD Trends Verification Code is: <strong>{otp}</strong></p><p>Please do not share this code with anyone.</p></body></html>",
        }
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req) as response:
                print(f"Successfully sent OTP via Brevo API to {to_email}")
                return True
        except Exception as e:
            print(f"Failed to send email via Brevo API: {e}")
            return False

    print(
        f"--- OTP EMAIL FALLBACK TO {to_email} ---\nSubject: Your SD Trends Verification Code\nCode: {otp}\n----------------------"
    )
    return False



@app.route("/api/auth/request-otp", methods=["POST", "OPTIONS"])
def request_otp():
    if request.method == "OPTIONS":
        return "", 200
    data = request.json
    email = data.get("email")
    is_login = data.get("is_login", True)

    user = User.query.filter_by(email=email).first()

    if is_login and not user:
        return jsonify({"error": "User is not available. Please go to Sign Up."}), 404

    if not is_login and user:
        return jsonify({"error": "Email already registered. Please login."}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    print("=" * 50)
    print(f"=== GENERATED OTP FOR {email}: {otp} ===")
    print("=" * 50)

    # Send email
    send_otp_email(email, otp)

    return jsonify({"message": "OTP sent", "dev_otp": otp}), 200


@app.route("/api/auth/verify-otp", methods=["POST", "OPTIONS"])
def verify_otp():
    if request.method == "OPTIONS":
        return "", 200
    data = request.json
    email = data.get("email")
    otp = data.get("otp_code")

    if str(otp_store.get(email)) != str(otp):
        return jsonify({"error": "Invalid OTP"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Register new user
        user = User(
            email=email,
            name=data.get("name", "User"),
            phone=data.get("phone", ""),
            street_name=data.get("street_name", ""),
            landmark=data.get("landmark", ""),
            city=data.get("city", ""),
            state=data.get("state", ""),
            pincode=data.get("pincode", ""),
            is_admin=False,
        )
        db.session.add(user)
        db.session.commit()

    # Clean up OTP
    del otp_store[email]

    return jsonify({"message": "Success", "user": user.to_dict()}), 200


# ==========================================
# ADMIN WISHLIST ROUTES
# ==========================================


@app.route("/api/admin/users/<int:user_id>/wishlist", methods=["GET"])
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


@app.route("/api/admin/users/<int:user_id>/send-wishlist-reminder", methods=["POST"])
def send_wishlist_reminder(user_id):
    # In a real app, you would check admin authorization here

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        wishlist_ids = json.loads(user.wishlist) if user.wishlist else []
    except:
        wishlist_ids = []

    if not wishlist_ids:
        return jsonify({"error": "User has no items in their wishlist"}), 400

    # Build email content
    product_names = []
    for pid in wishlist_ids:
        p = Product.query.get(pid)
        if p:
            product_names.append(p.name)
    product_list_str = "\\n- ".join(product_names)

    # Email setup using unified send_smtp_email (which uses Brevo)
    subject = "Special Offer: Your Favorites are waiting!"
    email_body = f"""Hi {user.name or 'there'},

We noticed you have some amazing items saved in your favorites!

Closing Soon Offer: Use code CLOSING10 for 10% off your next purchase. This is a limited time offer!

Your Favorites:
- {product_list_str}

Don't miss out, these items are selling fast!

Best,
SD Trends Team
"""

    try:
        if send_smtp_email_async(user.email, subject, email_body):
            return jsonify({"message": "Reminder email sent successfully"}), 200
        else:
            return jsonify({"error": "Failed to send email. Check server logs."}), 500
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({"error": "Failed to send email. Check server logs."}), 500



# ==========================================
# Top Deals Config API
# ==========================================
@app.route("/api/settings/top-deals", methods=["GET"])
def get_top_deals_settings():
    categories_setting = SiteSetting.query.get("top_deals_categories")
    timer_setting = SiteSetting.query.get("top_deals_timer")

    # Default mock categories if not set
    default_categories = [
        {
            "name": "Diamond Ring",
            "imageUrl": "/images/featured_ring_1.png",
            "link": "/shop?subcategory=Diamond Rings",
        },
        {
            "name": "Hoops Earring",
            "imageUrl": "/images/products/earrings_hoop_1.png",
            "link": "/shop?subcategory=Hoops Earring",
        },
        {
            "name": "Studs Earring",
            "imageUrl": "/images/featured_earring_1.png",
            "link": "/shop?subcategory=Mamuli Earring",
        },
        {
            "name": "Antique Bangle",
            "imageUrl": "/images/featured_bangle_1.png",
            "link": "/shop?subcategory=Antique Bangle",
        },
    ]

    try:
        categories = (
            json.loads(categories_setting.value)
            if categories_setting
            else default_categories
        )
    except Exception:
        categories = default_categories

    return (
        jsonify(
            {
                "categories": categories,
                "timer": timer_setting.value if timer_setting else "",
            }
        ),
        200,
    )


@app.route("/api/admin/settings/top-deals", methods=["POST"])
def save_top_deals_settings():
    data = request.json
    categories = data.get("categories")
    timer = data.get("timer", "")

    if categories is not None:
        cat_setting = SiteSetting.query.get("top_deals_categories")
        if not cat_setting:
            cat_setting = SiteSetting(key="top_deals_categories")
            db.session.add(cat_setting)
        cat_setting.value = json.dumps(categories)

    timer_setting = SiteSetting.query.get("top_deals_timer")
    if not timer_setting:
        timer_setting = SiteSetting(key="top_deals_timer")
        db.session.add(timer_setting)
    timer_setting.value = timer

    db.session.commit()

    return jsonify({"message": "Top deals settings saved successfully"}), 200


# ==========================================
# Product Reviews API
# ==========================================


@app.route("/api/products/<id>/reviews", methods=["GET"])
def get_product_reviews(id):
    print("Inside get_product_reviews for ID:", id, flush=True)
    product = Product.query.get_or_404(id)
    approved_reviews = [r.to_dict() for r in product.reviews if r.status == "approved"]
    return jsonify(approved_reviews), 200


@app.route("/api/products/<id>/reviews", methods=["POST"])
def add_product_review(id):
    product = Product.query.get_or_404(id)
    data = request.json
    new_review = ProductReview(
        product_id=id,
        author=data.get("author", "Anonymous"),
        rating=int(data.get("rating", 5)),
        review_text=data.get("review_text", ""),
        status="approved",  # Default to approved based on user request
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
        product_id=data.get("product_id"),
        author=data.get("author", "Admin"),
        rating=int(data.get("rating", 5)),
        review_text=data.get("review_text", ""),
        status=data.get("status", "approved"),
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify(new_review.to_dict()), 201


@app.route("/api/admin/reviews/<int:id>", methods=["PUT"])
def update_review(id):
    review = ProductReview.query.get_or_404(id)
    data = request.json
    if "status" in data:
        review.status = data["status"]
    if "author" in data:
        review.author = data["author"]
    if "rating" in data:
        review.rating = int(data["rating"])
    if "review_text" in data:
        review.review_text = data["review_text"]

    db.session.commit()
    return jsonify(review.to_dict()), 200


@app.route("/api/admin/reviews/<int:id>", methods=["DELETE"])
def delete_review(id):
    review = ProductReview.query.get_or_404(id)
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"}), 200


# ==========================================
# Aggregated Home Data API (Optimization)
# ==========================================
@app.route("/api/layout-data", methods=["GET"])
def get_layout_data():
    now = time.time()
    if "layout_data" in _cache and now - _cache["layout_data"]["time"] < 300:
        return jsonify(_cache["layout_data"]["data"]), 200

    try:
        # Full Category hierarchy for Header navigation
        all_categories = Category.query.all()
        categories = []
        for c in all_categories:
            c_dict = c.to_dict()
            subs = Subcategory.query.filter_by(category_id=c.id).all()
            c_dict["subcategories"] = [s.to_dict() for s in subs]
            categories.append(c_dict)

        settings_records = SiteSetting.query.all()
        settings = {s.key: s.value for s in settings_records}

        footer_links = [l.to_dict() for l in FooterLink.query.all()]
        
        # Promo Banner
        promo = PromoBanner.query.filter_by(is_active=True).first()
        promo_data = promo.to_dict() if promo else None

        response_data = {
            "categories": categories,
            "settings": settings,
            "footerLinks": footer_links,
            "promo": promo_data
        }
        _cache["layout_data"] = {"data": response_data, "time": now}
        return jsonify(response_data), 200
    except Exception as e:
        print("Error aggregating layout data:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/home-data", methods=["GET"])
def get_home_data():
    now = time.time()
    if "home_data" in _cache and now - _cache["home_data"]["time"] < 300:
        return jsonify(_cache["home_data"]["data"]), 200

    try:
        # Fetch all required data concurrently (using DB queries which are fast)
        hero = [s.to_dict() for s in HeroSlide.query.order_by(HeroSlide.id).all()]
        services = [
            s.to_dict() for s in ServiceCard.query.order_by(ServiceCard.id).all()
        ]
        banners = [
            b.to_dict()
            for b in PromotionBanner.query.order_by(PromotionBanner.id).all()
        ]
        latest = [p.to_dict() for p in Product.query.filter_by(is_latest=True).all()]

        # Categories hierarchy structure (home_featured)
        home_categories = (
            Subcategory.query.filter_by(is_home_featured=True).limit(5).all()
        )
        categories = [c.to_dict() for c in home_categories]

        bracelet = MidPageBanner.query.filter_by(slot_name="bracelet").first()
        bracelet_data = bracelet.to_dict() if bracelet else {}

        featured = [
            p.to_dict() for p in Product.query.filter_by(is_featured=True).all()
        ]

        highlights = MidPageBanner.query.filter_by(slot_name="highlights").first()
        highlights_data = highlights.to_dict() if highlights else {}

        testimonials = [
            t.to_dict() for t in Testimonial.query.filter_by(status="approved").all()
        ]

        settings_records = SiteSetting.query.all()
        settings = {s.key: s.value for s in settings_records}

        footer_links = [l.to_dict() for l in FooterLink.query.all()]

        response_data = {
            "hero": hero,
            "services": services,
            "banners": banners,
            "latest": latest,
            "categories": categories,
            "bracelet": bracelet_data,
            "featured": featured,
            "highlights": highlights_data,
            "testimonials": testimonials,
            "settings": settings,
            "footerLinks": footer_links,
        }
        _cache["home_data"] = {"data": response_data, "time": now}
        return jsonify(response_data), 200
    except Exception as e:
        print("Error aggregating home data:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Only run migration in the active worker process to prevent connection leaks from the parent reloader
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.config.get(
        "DEBUG", True
    ):
        with app.app_context():
            # Automatically create any entirely new tables (like sd_product_reviews)
            try:
                db.create_all()
                print("Successfully created any missing tables")
            except Exception as e:
                print(f"Error creating tables: {e}")

            # self-healing migration to add payment_method and items_json if not exist
            try:
                db.session.execute(
                    db.text(
                        "ALTER TABLE sd_orders ADD COLUMN payment_method VARCHAR(100) DEFAULT 'Direct Bank Transfer';"
                    )
                )
                db.session.commit()
                print("Successfully added payment_method column to sd_orders")
            except Exception as e:
                db.session.rollback()
                if (
                    "already exists" in str(e).lower()
                    or "duplicate column" in str(e).lower()
                ):
                    print(
                        "Database column payment_method already exists (skipping alter)."
                    )
                else:
                    print(f"Error checking/altering payment_method column: {e}")

            try:
                db.session.execute(
                    db.text("ALTER TABLE sd_orders ADD COLUMN items_json TEXT;")
                )
                db.session.commit()
                print("Successfully added items_json column to sd_orders")
            except Exception as e:
                db.session.rollback()
                if (
                    "already exists" not in str(e).lower()
                    and "duplicate column" not in str(e).lower()
                ):
                    print(f"Error checking/altering items_json column: {e}")

            # Self-healing migration for ALL newly added Product columns
            product_columns = [
                ("subcategory", "VARCHAR(100)"),
                ("timer", "VARCHAR(100)"),
                ("is_new", "BOOLEAN DEFAULT FALSE"),
                ("is_bestseller", "BOOLEAN DEFAULT FALSE"),
                ("is_latest", "BOOLEAN DEFAULT FALSE"),
                ("review_count", "INTEGER DEFAULT 0"),
                ("stock", "INTEGER DEFAULT 10"),
                ("viewer_count", "INTEGER DEFAULT 18"),
                ("sold_count", "INTEGER DEFAULT 15"),
                ("about_text", "TEXT"),
                ("shipping_text", "TEXT"),
                ("details_json", "TEXT"),
            ]

            for col_name, col_type in product_columns:
                try:
                    db.session.execute(
                        db.text(
                            f"ALTER TABLE sd_products ADD COLUMN {col_name} {col_type};"
                        )
                    )
                    db.session.commit()
                    print(f"Successfully added {col_name} column to sd_products")
                except Exception as e:
                    db.session.rollback()
                    if (
                        "already exists" not in str(e).lower()
                        and "duplicate column" not in str(e).lower()
                    ):
                        print(f"Error checking/altering {col_name} column: {e}")

            # Self-healing migration for newly added User columns
            user_columns = [
                ("name", "VARCHAR(100)"),
                ("phone", "VARCHAR(20)"),
                ("street_name", "VARCHAR(200)"),
                ("landmark", "VARCHAR(200)"),
                ("city", "VARCHAR(100)"),
                ("state", "VARCHAR(100)"),
                ("pincode", "VARCHAR(20)"),
                ("is_admin", "BOOLEAN DEFAULT FALSE"),
                ("password_hash", "VARCHAR(255)"),
                ("is_subscribed", "BOOLEAN DEFAULT FALSE"),
                ("wishlist", "TEXT DEFAULT '[]'"),
            ]

            for col_name, col_type in user_columns:
                try:
                    db.session.execute(
                        db.text(
                            f"ALTER TABLE sd_users ADD COLUMN {col_name} {col_type};"
                        )
                    )
                    db.session.commit()
                    print(f"Successfully added {col_name} column to sd_users")
                except Exception as e:
                    db.session.rollback()
                    if (
                        "already exists" not in str(e).lower()
                        and "duplicate column" not in str(e).lower()
                    ):
                        print(
                            f"Error checking/altering {col_name} column in sd_users: {e}"
                        )

    app.run(host="0.0.0.0", port=5000, debug=True)
