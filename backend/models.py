from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'sd_users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    street_name = db.Column(db.String(200), nullable=True)
    landmark = db.Column(db.String(200), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    pincode = db.Column(db.String(20), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    password_hash = db.Column(db.String(255), nullable=True)
    is_subscribed = db.Column(db.Boolean, default=False)
    wishlist = db.Column(db.Text, default="[]")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json
        try:
            wishlist_arr = json.loads(self.wishlist) if self.wishlist else []
        except Exception:
            wishlist_arr = []
            
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'street_name': self.street_name,
            'landmark': self.landmark,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'is_admin': self.is_admin,
            'is_subscribed': self.is_subscribed,
            'wishlist': wishlist_arr,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class HeroSlide(db.Model):
    __tablename__ = 'sd_hero_slides'
    id = db.Column(db.Integer, primary_key=True)
    subtitle = db.Column(db.String(200), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    button_text = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(500), nullable=False)
    link = db.Column(db.String(500), nullable=True)
    object_position = db.Column(db.String(100), default='center')
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'subtitle': self.subtitle,
            'title': self.title,
            'description': self.description,
            'button_text': self.button_text,
            'image_url': self.image_url,
            'link': self.link,
            'object_position': self.object_position,
            'is_active': self.is_active,
            'display_order': self.display_order
        }

class PromoBanner(db.Model):
    __tablename__ = 'sd_promo_banner'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    link_text = db.Column(db.String(100), nullable=True)
    link_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'link_text': self.link_text,
            'link_url': self.link_url,
            'is_active': self.is_active
        }

class ServiceCard(db.Model):
    __tablename__ = 'sd_service_cards'
    id = db.Column(db.Integer, primary_key=True)
    icon_name = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'icon_name': self.icon_name,
            'title': self.title,
            'description': self.description,
            'display_order': self.display_order
        }

class PromotionBanner(db.Model):
    __tablename__ = 'sd_promotion_banners'
    id = db.Column(db.Integer, primary_key=True)
    slot_name = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    subtitle = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(200), nullable=True)
    link_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'slot_name': self.slot_name,
            'image_url': self.image_url,
            'subtitle': self.subtitle,
            'title': self.title,
            'link_url': self.link_url
        }

class MidPageBanner(db.Model):
    __tablename__ = 'sd_mid_banners'
    id = db.Column(db.Integer, primary_key=True)
    slot_name = db.Column(db.String(50), nullable=False) # 'bracelet', 'highlights'
    image_url = db.Column(db.String(500), nullable=True)
    subtitle = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(200), nullable=True)
    description = db.Column(db.String(255), nullable=True) # Used for Highlights
    link_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'slot_name': self.slot_name,
            'image_url': self.image_url,
            'subtitle': self.subtitle,
            'title': self.title,
            'description': self.description,
            'link_url': self.link_url
        }

class Testimonial(db.Model):
    __tablename__ = 'sd_testimonials'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=True)
    quote = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'quote': self.quote,
            'author': self.author,
            'role': self.role,
            'image_url': self.image_url,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FooterLink(db.Model):
    __tablename__ = 'sd_footer_links'
    id = db.Column(db.Integer, primary_key=True)
    column_name = db.Column(db.String(50), nullable=False) # e.g. "Quick Links", "Shop By Category", "Customer Care"
    label = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'column_name': self.column_name,
            'label': self.label,
            'url': self.url,
            'display_order': self.display_order
        }

class ContactMessage(db.Model):
    __tablename__ = 'sd_contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Subscriber(db.Model):
    __tablename__ = 'sd_subscribers'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FAQ(db.Model):
    __tablename__ = 'sd_faqs'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Product(db.Model):
    __tablename__ = 'sd_products'
    id = db.Column(db.String(100), primary_key=True)  # Using string ID to match existing slug logic (e.g. ring-solitaire)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True)
    subcategory = db.Column(db.String(100), nullable=True, index=True)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, nullable=True)
    price_range = db.Column(db.String(100), nullable=True)
    color = db.Column(db.String(100), nullable=True)
    color_group = db.Column(db.String(100), nullable=True)
    custom_badge = db.Column(db.String(50), nullable=True)
    timer = db.Column(db.String(100), nullable=True)
    is_new = db.Column(db.Boolean, default=False, index=True)
    is_bestseller = db.Column(db.Boolean, default=False, index=True)
    is_featured = db.Column(db.Boolean, default=False, index=True)
    is_latest = db.Column(db.Boolean, default=False, index=True)  # For LatestProducts section
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    stock = db.Column(db.Integer, default=10)
    viewer_count = db.Column(db.Integer, default=18)
    sold_count = db.Column(db.Integer, default=15)
    description = db.Column(db.Text, nullable=True)
    about_text = db.Column(db.Text, nullable=True)
    shipping_text = db.Column(db.Text, nullable=True)
    details_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    images = db.relationship('ProductImage', backref='product', lazy='selectin', cascade="all, delete-orphan")

    def to_dict(self):
        approved_reviews = [r for r in self.reviews if r.status == 'approved']
        actual_review_count = len(approved_reviews)
        actual_rating = sum(r.rating for r in approved_reviews) / actual_review_count if actual_review_count > 0 else self.rating

        import json
        details_obj = {}
        if self.details_json:
            try:
                details_obj = json.loads(self.details_json)
            except:
                pass

        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'subcategory': self.subcategory,
            'price': self.price,
            'originalPrice': self.original_price,
            'priceRange': self.price_range,
            'customBadge': self.custom_badge,
            'timer': self.timer,
            'isNew': self.is_new,
            'isBestSeller': self.is_bestseller,
            'isFeatured': self.is_featured,
            'is_latest': self.is_latest,
            'rating': round(actual_rating, 1),
            'reviewCount': actual_review_count if actual_review_count > 0 else self.review_count,
            'stock': self.stock,
            'viewerCount': self.viewer_count,
            'soldCount': self.sold_count,
            'description': self.description,
            'aboutText': self.about_text,
            'shippingText': self.shipping_text,
            'details': details_obj,
            'images': [img.image_url for img in sorted(self.images, key=lambda x: x.display_order)],
            'image': self.images[0].image_url if self.images else '',
            'color': self.color,
            'color_group': self.color_group,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ProductImage(db.Model):
    __tablename__ = 'sd_product_images'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(100), db.ForeignKey('sd_products.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    display_order = db.Column(db.Integer, default=0)

class SiteSetting(db.Model):
    __tablename__ = 'sd_site_settings'
    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value
        }

class Category(db.Model):
    __tablename__ = 'sd_categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, default=0)
    
    subcategories = db.relationship('Subcategory', backref='category', lazy='selectin', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'display_order': self.display_order,
            'subcategories': [sub.to_dict() for sub in sorted(self.subcategories, key=lambda x: x.display_order)]
        }

class Subcategory(db.Model):
    __tablename__ = 'sd_subcategories'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('sd_categories.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    
    # Homepage Feature Fields
    is_home_featured = db.Column(db.Boolean, default=False)
    home_image_url = db.Column(db.String(500), nullable=True)
    home_count_text = db.Column(db.String(50), nullable=True)
    
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'category_id': self.category_id,
            'name': self.name,
            'is_home_featured': self.is_home_featured,
            'home_image_url': self.home_image_url,
            'home_count_text': self.home_count_text,
            'display_order': self.display_order
        }

class OTP(db.Model):
    __tablename__ = 'sd_otps'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), index=True, nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

class Order(db.Model):
    __tablename__ = 'sd_orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('sd_users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Processing')
    payment_method = db.Column(db.String(100), default='Direct Bank Transfer')
    items_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('orders', lazy=True))

    def to_dict(self):
        import json
        items = []
        if self.items_json:
            try:
                items = json.loads(self.items_json)
            except Exception:
                pass
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_method': self.payment_method,
            'items': items,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class WishlistItem(db.Model):
    __tablename__ = 'sd_wishlist_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('sd_users.id'), nullable=False)
    product_id = db.Column(db.String(100), db.ForeignKey('sd_products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('wishlist_items', lazy=True, cascade='all, delete-orphan'))
    product = db.relationship('Product', backref=db.backref('wishlisted_by', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ProductReview(db.Model):
    __tablename__ = 'sd_product_reviews'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(100), db.ForeignKey('sd_products.id'), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='approved') # 'pending', 'approved', 'rejected'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    product = db.relationship('Product', backref=db.backref('reviews', lazy='selectin', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'author': self.author,
            'rating': self.rating,
            'review_text': self.review_text,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


