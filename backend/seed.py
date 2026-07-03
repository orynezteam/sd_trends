import os
import json
from app import app, db
from models import (
    Category, Subcategory, SiteSetting, User, 
    Product, ProductImage, MidPageBanner, FAQ, 
    FooterLink, Testimonial, ContactMessage, PromotionBanner, ServiceCard
)
from werkzeug.security import generate_password_hash

# ==========================================
# SEED DATA
# ==========================================

HIERARCHY_DATA = [
    {
        "name": "Rings",
        "display_order": 1,
        "subcategories": [
            {"name": "Diamond Rings"},
            {"name": "Rose Gold Rings", "is_home_featured": True, "home_image_url": "/images/category_rose_gold_rings.png", "home_count_text": "6 Items"},
            {"name": "Gold Rings"},
            {"name": "Cocktail Rings", "is_home_featured": True, "home_image_url": "/images/category_cocktail_rings.png", "home_count_text": "5 Items"},
            {"name": "Solitaire Rings", "is_home_featured": True, "home_image_url": "/images/category_solitaire_rings.png", "home_count_text": "7 Items"}
        ]
    },
    {
        "name": "Ankle",
        "display_order": 2,
        "subcategories": [
            {"name": "Ankle Bracelets"},
            {"name": "Beaded Ankle"},
            {"name": "Braided Ankle"},
            {"name": "Charmed Ankle"}
        ]
    },
    {
        "name": "Bracelets",
        "display_order": 3,
        "subcategories": [
            {"name": "Antique Bangle"},
            {"name": "Beaded Bracelets"},
            {"name": "Charm Bracelet"},
            {"name": "Tennis Bracelets"}
        ]
    },
    {
        "name": "Earring",
        "display_order": 4,
        "subcategories": [
            {"name": "Dangles Earring"},
            {"name": "Drops Earring", "is_home_featured": True, "home_image_url": "/images/category_drops_earring.png", "home_count_text": "8 Items"},
            {"name": "Hoops Earring"},
            {"name": "Mamuli Earring"}
        ]
    },
    {
        "name": "Brooches",
        "display_order": 5,
        "subcategories": [
            {"name": "Animal Brooche"},
            {"name": "Floral Brooche"},
            {"name": "Modern Brooche"},
            {"name": "Vintage Brooche"}
        ]
    },
    {
        "name": "Pendant",
        "display_order": 6,
        "subcategories": [
            {"name": "Choker"},
            {"name": "Butterfly Pendant", "is_home_featured": True, "home_image_url": "/images/category_butterfly_pendant.png", "home_count_text": "2 Items"},
            {"name": "Flower Necklace", "is_home_featured": True, "home_image_url": "/images/category_flower_necklace.png", "home_count_text": "4 Items"},
            {"name": "Princess Necklace"}
        ]
    }
]

SETTINGS_DEFAULTS = {
    "latest_products_title": "Latest Products",
    "latest_products_subtitle": "There are many variations of passages of lorem Ipsum available",
    "contact_page_title": "Get In Touch With Us",
    "contact_page_subtitle": "If you wish to directly reach us, Please fill out the form below -",
    "contact_page_map_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.056633633887!2d-0.12181742338167998!3d51.50318637181313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604b900d26973%3A0x4291f3172409ea92!2sLastminute.com%20London%20Eye!5e0!3m2!1sen!2suk!4v1719220000000!5m2!1sen!2suk",
    "contact_page_address_1": "60 29th San Francisco,",
    "contact_page_address_2": "507 - Union Trade Center",
    "contact_page_phone": "(+01) 987-654-3210",
    "contact_page_email": "demo@example.com",
    "contact_page_hours": "10:00AM - 6:00PM",
    "footer_newsletter_title": "Join Our Newsletter",
    "footer_newsletter_subtitle": "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",
    "footer_logo_url": "/images/logo.png",
    "footer_about_text": "The point of using lorem Ipsum is that it has a more is normal they always wash up well no matter how many versions.",
    "footer_social_fb": "#",
    "footer_social_tw": "#",
    "footer_social_ig": "#",
    "footer_social_yt": "#",
    "upi_id": "mythu2124@oksbi",
    "upi_merchant_name": "SD Trends"
}

FOOTER_LINKS = [
    # Quick Links
    {"column_name": "Quick Links", "label": "Contact Us", "url": "#", "display_order": 1},
    {"column_name": "Quick Links", "label": "Shipping", "url": "#", "display_order": 2},
    {"column_name": "Quick Links", "label": "Sitemap", "url": "#", "display_order": 3},
    {"column_name": "Quick Links", "label": "FAQs", "url": "#", "display_order": 4},
    {"column_name": "Quick Links", "label": "Store Us", "url": "#", "display_order": 5},
    {"column_name": "Quick Links", "label": "About Us", "url": "#", "display_order": 6},
    # Services
    {"column_name": "Services", "label": "Order Status", "url": "#", "display_order": 1},
    {"column_name": "Services", "label": "Terms Conditions", "url": "#", "display_order": 2},
    {"column_name": "Services", "label": "Policy For Sellers", "url": "#", "display_order": 3},
    {"column_name": "Services", "label": "Policy For Buyers", "url": "#", "display_order": 4},
    {"column_name": "Services", "label": "Shipping & Refund", "url": "#", "display_order": 5},
    {"column_name": "Services", "label": "Wholesale Policy", "url": "#", "display_order": 6},
    # Your Account
    {"column_name": "Your Account", "label": "Checkout", "url": "#", "display_order": 1},
    {"column_name": "Your Account", "label": "Press", "url": "#", "display_order": 2},
    {"column_name": "Your Account", "label": "Careers", "url": "#", "display_order": 3},
    {"column_name": "Your Account", "label": "Delivery", "url": "#", "display_order": 4},
    {"column_name": "Your Account", "label": "Service", "url": "#", "display_order": 5},
    {"column_name": "Your Account", "label": "Sitemap", "url": "#", "display_order": 6}
]

MID_BANNERS = [
    {
        'slot_name': 'bracelet',
        'title': 'Rose Gold With Diamond <br /> Hotsell Bracelet',
        'subtitle': 'Diamond Bracelets',
        'description': None,
        'image_url': '/images/bracelet_banner.png',
        'link_url': '#featured-section'
    },
    {
        'slot_name': 'highlights',
        'title': 'Drop Cut Blue Necklace <br /> With Earrings Set',
        'subtitle': 'This Week’s Highlights',
        'description': 'Awesome Products For The Dynamic Urban Lifestyle',
        'image_url': '/images/highlights_bg.png',
        'link_url': '#categories'
    }
]

PROMOTION_BANNERS = [
    {
        "id": 1,
        "slot_name": "Left Banner (Large)",
        "image_url": "/images/banner_rings.png",
        "subtitle": "Diamond Rings",
        "title": "Yellow Gold & <br /> Diamond Ring",
        "link_url": "/shop"
    },
    {
        "id": 2,
        "slot_name": "Top Right Banner",
        "image_url": "https://xznlbaqqxmmglaidridj.supabase.co/storage/v1/object/public/sd_assets/banners/0.4386439561423694.png",
        "subtitle": "Wedding & Bridal",
        "title": "Exclusive Diamond<br />Necklaces",
        "link_url": "/shop"
    },
    {
        "id": 3,
        "slot_name": "Bottom Right Banner",
        "image_url": "https://xznlbaqqxmmglaidridj.supabase.co/storage/v1/object/public/sd_assets/banners/0.146504395000412.png",
        "subtitle": "New Collection",
        "title": "Discover Our<br />Latest Earrings",
        "link_url": "/shop"
    }
]

SERVICE_CARDS = [
    {
        "id": 1,
        "icon_name": "Truck",
        "title": "Free Shipping",
        "description": "On all orders over ",
        "display_order": 1
    },
    {
        "id": 2,
        "icon_name": "RotateCcw",
        "title": "Easy Returns",
        "description": "30 Days return policy",
        "display_order": 2
    },
    {
        "id": 3,
        "icon_name": "CreditCard",
        "title": "Secure Payment",
        "description": "100% secure payment",
        "display_order": 3
    },
    {
        "id": 4,
        "icon_name": "Headphones",
        "title": "24/7 Support",
        "description": "Dedicated support",
        "display_order": 4
    }
]

TESTIMONIALS = [
  {
    "title": "“Great Product Price Delivery Perfect”",
    "quote": "The point of using lorem Ipsum is that it has a more is normal they always wash up well no matter how many versions of lorem Ipsum.",
    "author": "Augusta Wind",
    "role": "Founder",
    "image_url": "/images/client_augusta.png",
    "status": "approved"
  },
  {
    "title": "“Impressive Quality, & Reliable”",
    "quote": "The point of using lorem Ipsum is that it has a more is normal they always wash up well no matter how many versions of lorem Ipsum.",
    "author": "John Doe",
    "role": "Manager",
    "image_url": "/images/client_john.png",
    "status": "approved"
  },
  {
    "title": "“Reliable Product, Consistently Delivers.”",
    "quote": "The point of using lorem Ipsum is that it has a more is normal they always wash up well no matter how many versions of lorem Ipsum.",
    "author": "Reema Ghurde",
    "role": "CEO",
    "image_url": "/images/client_reema.png",
    "status": "approved"
  }
]

INITIAL_FAQS = [
    {
        "question": "How can you help?",
        "answer": "We offer bespoke design services for engagement rings and fine jewelry.",
        "display_order": 1,
        "is_active": True
    },
    {
        "question": "What is a return policy?",
        "answer": "We offer a 30-day complimentary return or exchange window.",
        "display_order": 2,
        "is_active": True
    },
    {
        "question": "What payment methods do you accept?",
        "answer": "We accept all major credit cards, PayPal, Apple Pay, Google Pay.",
        "display_order": 3,
        "is_active": True
    }
]

# ==========================================
# SEED FUNCTIONS
# ==========================================

def seed_settings():
    for key, value in SETTINGS_DEFAULTS.items():
        if not db.session.get(SiteSetting, key):
            db.session.add(SiteSetting(key=key, value=value))
    
    if FooterLink.query.count() == 0:
        for link_data in FOOTER_LINKS:
            db.session.add(FooterLink(**link_data))

    print("Site settings and Footer Links seeded!")

def seed_users():
    if User.query.count() == 0:
        u1 = User(name='Admin User', email='admin@example.com', password_hash=generate_password_hash('password123'), is_admin=True, phone='123-456-7890')
        u2 = User(name='Jane Doe', email='jane@example.com', password_hash=generate_password_hash('password123'), is_admin=False, phone='555-555-5555')
        db.session.add_all([u1, u2])
        print('Admin and dummy users seeded!')

def seed_hierarchy():
    if Category.query.count() == 0:
        for cat_data in HIERARCHY_DATA:
            new_cat = Category(name=cat_data["name"], display_order=cat_data["display_order"])
            db.session.add(new_cat)
            db.session.flush() # get new_cat.id
            
            sub_order = 0
            for sub_data in cat_data["subcategories"]:
                sub_order += 1
                new_sub = Subcategory(
                    category_id=new_cat.id,
                    name=sub_data["name"],
                    is_home_featured=sub_data.get("is_home_featured", False),
                    home_image_url=sub_data.get("home_image_url"),
                    home_count_text=sub_data.get("home_count_text"),
                    display_order=sub_order
                )
                db.session.add(new_sub)
        print("Categories and Subcategories seeded!")

def seed_mid_banners():
    for b_data in MID_BANNERS:
        if not MidPageBanner.query.filter_by(slot_name=b_data['slot_name']).first():
            db.session.add(MidPageBanner(**b_data))
    print("Mid-page banners seeded!")

def seed_promotion_banners():
    if PromotionBanner.query.count() == 0:
        for pb in PROMOTION_BANNERS:
            db.session.add(PromotionBanner(**pb))
        print("Promotion banners seeded!")

def seed_services():
    if ServiceCard.query.count() == 0:
        for sc in SERVICE_CARDS:
            db.session.add(ServiceCard(**sc))
        print("Service cards seeded!")

def seed_testimonials():
    if Testimonial.query.count() == 0:
        for t in TESTIMONIALS:
            db.session.add(Testimonial(**t))
        print("Testimonials seeded!")

def seed_faqs():
    if FAQ.query.count() == 0:
        for f in INITIAL_FAQS:
            db.session.add(FAQ(**f))
        print("FAQs seeded!")

def seed_products():
    json_path = os.path.join(os.path.dirname(__file__), 'new_products.json')
    if not os.path.exists(json_path):
        print(f"Skipping product seed, {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    for p in products:
        if not db.session.get(Product, p['id']):
            is_latest = len(p.get('images', [])) == 2
            is_featured = len(p.get('images', [])) != 2
            
            details = p.get('details', {})
            about_text = "<ul>"
            for k, v in details.items():
                about_text += f"<li><strong>{k.capitalize()}:</strong> {v}</li>"
            about_text += "</ul>"
            
            prod = Product(id=p['id'])
            prod.name = p['name']
            prod.category = p['category']
            prod.price = float(p.get('price', 0))
            prod.original_price = float(p.get('originalPrice', p.get('price', 0)))
            prod.price_range = p.get('priceRange')
            prod.custom_badge = p.get('customBadge', p.get('custom_badge'))
            prod.timer = p.get('timer')
            prod.is_new = p.get('isNew', False)
            prod.is_bestseller = p.get('isBestSeller', False)
            prod.is_featured = p.get('isFeatured', is_featured)
            prod.is_latest = is_latest
            prod.rating = float(p.get('rating', 0.0))
            prod.review_count = int(p.get('reviewCount', 0))
            prod.stock = int(p.get('stock', 10))
            prod.description = p.get('description', '')
            prod.about_text = about_text
            prod.details_json = json.dumps(details)
            db.session.add(prod)
            db.session.flush()

            for idx, img_url in enumerate(p.get('images', [])):
                img = ProductImage(product_id=p['id'], image_url=img_url, display_order=idx)
                db.session.add(img)
    print("Products seeded from new_products.json!")

def run_all():
    with app.app_context():
        # Drop all tables to ensure clean schema recreation
        db.drop_all()
        # Ensures all tables are created
        db.create_all()
        
        # Run individual seeders
        seed_settings()
        seed_users()
        seed_hierarchy()
        seed_mid_banners()
        seed_promotion_banners()
        seed_services()
        seed_testimonials()
        seed_faqs()
        seed_products()

        # Final commit
        db.session.commit()
        print("Database seeding completed successfully!")

if __name__ == "__main__":
    run_all()
