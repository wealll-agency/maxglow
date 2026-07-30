# Project Constraints and Rules

The following rules have been strictly set by the user and MUST NOT be changed or overridden in the future. These apply strictly to the live/production environment as well.

## 1. CCAvenue Payment Integration
- **Strict Rule:** NEVER change the checkout UI or business logic related to payments.
- **Strict Rule:** Use the official CCAvenue encryption algorithm ONLY. Do NOT implement any custom patches or custom encryption logic.
- **Strict Rule:** Ensure Sandbox and Production credentials are never mixed. Always use the exact Merchant ID, Access Code, and Working Key provided in the respective environment's configuration.

## 2. Checkout Resume Flow
- **Strict Rule:** Guest users clicking "Pay Now" must be prompted to authenticate, but their complete checkout state (cart, route, address, coupon, etc.) MUST be securely saved.
- **Strict Rule:** After successful Login/Register, the user MUST be automatically redirected back to the exact Checkout page they were on.
- **Strict Rule:** NEVER redirect a user back to the Home page if their authentication originated from the Checkout flow.

## 3. Alerts and Notifications
- **Strict Rule:** NEVER use native `window.alert()` or `window.confirm()` anywhere in the application.
- **Strict Rule:** Always use the custom Bootstrap-based `NotificationContext` (Modals/Toasts) for user prompts and confirmations.

## 4. Form Inputs and Placeholders
- **Strict Rule:** Do NOT use `placeholder` attributes on any HTML or React inputs/forms anywhere on the website.

## 5. UI and Navigation Specifics
- **Strict Rule:** The 'Shop by Category' section on mobile MUST remain in a single horizontal line (flex-nowrap) by resizing elements via media query. Do NOT add horizontal scrolling or wrap them to multiple lines on mobile.
- **Strict Rule:** The footer 'We All' developer logo MUST strictly link to `https://wealll.com/` without any appended paths like `/sweetree`. 
- **Strict Rule:** There is NO 'Inventory Notifications' page in the admin sidebar. Clicking on a restock notification MUST redirect the admin directly to the 'Inventory Manager' page.
- **Strict Rule:** The Warehouse Add/Edit popup MUST include 'Working Days' and 'Return Details' fields. The popup MUST be scrollable (`modal-dialog-scrollable`) and large (`modal-lg`) to prevent UI cut-offs. Do not revert these structural changes.

## 6. Homepage and Admin Content Fixes
- **Strict Rule:** The 'Shop by Category' section on mobile MUST only display exactly 5 categories. It MUST NOT contain any horizontal scrolling. The custom generated category icons must remain in place.
- **Strict Rule:** The spacing between the Hero Slider and the Category Row on mobile MUST remain minimal (do not revert the margin reductions).
- **Strict Rule:** The Admin Products page "Add Category" and "Add Sub-category" popups MUST include the scrolling list of existing categories with a delete option. Do not remove this UI or the backend deletion logic. 
- **Strict Rule:** There is NO "New Arrival" or "Healthy Product" tag logic; it has been strictly replaced with "New Arrivals" across the frontend and admin panel.

## 7. Database Stability
- **Strict Rule:** The MongoDB connection in `config/db.js` uses a robust connection pool (`maxPoolSize`, `minPoolSize`, `socketTimeoutMS`, etc.) and event listeners for auto-reconnection. NEVER modify these connection pool settings or the reconnect logic to prevent database disconnects in production. Ensure error logs are never suppressed.

---
*Note to agents: Adhere to these rules unconditionally to prevent overriding critical user-approved functionality.*
