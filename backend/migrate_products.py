import os
import json
from app import app, db, load_products
from models import Product, ProductImage

def migrate():
    with app.app_context():
        # Ensure tables are created
        db.create_all()

        products = load_products()
        if not products:
            print("No products found in products.json")
            return

        # List of LatestProducts hardcoded IDs to automatically flag them
        LATEST_IDS = [
            "ring-solitaire",
            "ring-emerald",
            "ring-rose-gold",
            "ring-casual-thomas",
            "necklace-sapphire",
            "earrings-halo",
            "bracelet-tennis",
            "earrings-hoops"
        ]

        count = 0
        for p_data in products:
            # Check if product already exists
            existing = Product.query.get(p_data.get("id"))
            if existing:
                print(f"Product {p_data.get('id')} already exists, skipping...")
                continue

            # Create product
            new_prod = Product(
                id=p_data.get("id"),
                name=p_data.get("name", ""),
                category=p_data.get("category", ""),
                price=float(p_data.get("price", 0)),
                original_price=float(p_data.get("originalPrice", 0)) if p_data.get("originalPrice") else None,
                price_range=p_data.get("priceRange"),
                custom_badge=p_data.get("customBadge"),
                timer=p_data.get("timer"),
                is_new=p_data.get("isNew", False),
                is_bestseller=p_data.get("isBestSeller", False),
                is_featured=p_data.get("isFeatured", False),
                is_latest=(p_data.get("id") in LATEST_IDS),
                rating=float(p_data.get("rating", 0.0)),
                review_count=int(p_data.get("reviewCount", 0)),
                description=p_data.get("description")
            )

            db.session.add(new_prod)
            db.session.flush() # To be able to add images

            # Add images
            images = p_data.get("images", [])
            for idx, img_url in enumerate(images):
                new_img = ProductImage(
                    product_id=new_prod.id,
                    image_url=img_url,
                    display_order=idx
                )
                db.session.add(new_img)
            
            count += 1
        
        db.session.commit()
        print(f"Successfully migrated {count} products!")

if __name__ == "__main__":
    migrate()
