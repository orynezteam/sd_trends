# SD Trends Design - Luxury Jewelry Store

SD Trends Design is a premium e-commerce storefront showcasing luxury fine jewelry. This codebase replicates the elegant design and layout principles of the Jubilee Jewelry WooCommerce theme.

Built using:
- **Frontend**: Next.js (React), styled with modular Vanilla CSS.
- **Backend**: Flask (Python) REST API serving catalogs, search results, and newsletter subscriptions.
- **Assets**: Insured-grade, macro-photography generated assets showing fine jewelry items with 1:1 ratios.

---

## Getting Started

Follow these steps to run both the frontend and backend locally on your system.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Python 3** (v3.8 or higher recommended)

---

### Step 1: Run the Flask Backend API

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask application:
   ```bash
   python app.py
   ```
   *The backend will be running on [http://localhost:5000](http://localhost:5000).*

---

### Step 2: Run the Next.js Frontend

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   *The storefront will be running on [http://localhost:3000](http://localhost:3000).*

---

## Key Features

1. **Luxury Visual Presentation**: Curated color palettes with a toggle to switch between a clean Light Mode and an obsidian-dark Dark Mode.
2. **Dynamic Hero & Promotional Banners**: Sleek sliding and zoom-on-hover card systems designed to draw attention to high-end collections.
3. **Interactive Store Context**: Add pieces to your Wishlist or Cart, with live counters updating inside the header immediately.
4. **AJAX Live Search**: Search input queries the backend directly on change to show matching pieces with images and prices in real-time.
5. **Product Detail Quick View**: Click the preview icon on any item card to open a modal containing metal options, descriptions, weight specifications, and quantity controls.
6. **Deal of the Day Countdown**: Highlighted Duchess Tiara necklace featuring an active countdown timer.
7. **Active Backend Forms**: Newsletter subscription and contact forms save data locally on the Flask server.
