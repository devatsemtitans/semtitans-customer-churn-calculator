# SEMTITANS Customer Churn Rate & Retention Loss Calculator

An interactive, high-converting **Customer Churn Rate Calculator & Revenue Loss Analysis** web application engineered for **SEMTITANS** (Performance Marketing Agency specializing in Google Ads, Meta Ads, SEO, and CRO).

Designed specifically for founders, CMOs, and marketing decision-makers across **Shopify D2C E-commerce, B2B SaaS, and Agencies**.

---

## 🚀 Live Demo & Production Staging
* **Live Staging URL**: `https://vold.semtitans.com/tools/customer-churn-calculator/`
* **GitHub Repository**: `https://github.com/devatsemtitans/semtitans-customer-churn-calculator`

---

## ⚡ Key Features

1. **Reactive Financial Modeling**:
   - Monthly Churn Rate `%` calculation: `(Lost Customers ÷ Starting Customers) × 100`
   - Annual Lost Buyers count & Annual Revenue Drag
   - Implied Customer Lifespan & Cumulative Customer Lifetime Value (LTV)

2. **Decision Intelligence for Paid Ads**:
   - **Ad Scaling Readiness Score (0–100)**: Dynamically evaluates whether the business is ready to scale cold top-of-funnel ads or needs precision remarketing first.
   - **Max Ad Spend per Customer (The 3x Golden Ratio)**: Establishes the maximum allowable CPA on Google & Meta Ads to guarantee a healthy 30%+ profit margin.
   - **1st-Order Target CPA**: The target ad cost limit to profit immediately on transaction #1.

3. **Retention Lift Simulator**:
   - Interactive slider modeling revenue recovered by lowering monthly churn.
   - Dynamic callouts calculating protected revenue with \$0 extra ad spend.

4. **1-Click Industry Benchmarks**:
   - **SaaS / B2B Subscription** (3.5%–5.0% monthly benchmark)
   - **E-commerce & D2C Subscriptions** (5.5%–8.0% monthly benchmark)
   - **Agency / B2B Retainers** (2.0%–4.0% monthly benchmark)
   - **Consumer Apps & Memberships** (5.0%–8.0% monthly benchmark)

5. **Integrated Lead Capture**:
   - Seamless AJAX submission directly mapped to dedicated **WPForms** ID `32856` (`/wp-admin/admin-ajax.php`).
   - Separate lead entries accessible in WordPress at `/wp-admin/admin.php?page=vxcf_leads&tab=entries&form_id=wp_32856`.
   - Inline personalized confirmation card and high-trust security seals.

6. **URL State Persistence & Team Sharing**:
   - Real-time URL query parameter synchronization (`?industry=...&starting=...&lost=...&arpu=...`).
   - One-click smart share button that copies a Slack / WhatsApp executive brief + direct link.

---

## 📦 Deployment (WordPress Subdirectory)

1. Upload all files from this build directly to:
   `/public_html/tools/customer-churn-calculator/`
2. Ensure `.htaccess` is present with `RewriteEngine Off` to prevent root WordPress router interception.
3. Verify access at `https://vold.semtitans.com/tools/customer-churn-calculator/`.

---

## 🛡️ License & Credits
Developed for **SEMTITANS** — Performance Marketing & Growth Agency. © 2026 SEMTITANS.
