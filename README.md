# WhiteStores website — navigation-fixed export

## Run locally
1. Open this folder in Visual Studio Code.
2. Install/enable the Live Server extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Resize the browser to test desktop and mobile.

## Pages
- `index.html` — Home
- `solutions.html` — Solutions
- `storage-distribution.html` — Storage & Distribution
- `commerce-operations.html` — Commerce Operations
- `quick-kitchen.html` — Quick Kitchen
- `our-network.html` — Our Network
- `about-us.html` — About Us
- `partner-with-us.html` — Partner With Us

## Navigation changes
- A single shared mobile drawer is added to all eight pages.
- The hamburger button opens the drawer on mobile.
- The X button closes it.
- Escape closes the drawer.
- Solutions expands/collapses its submenu.
- The mobile drawer is forcibly hidden on desktop widths.
- Internal page links point to the matching local HTML files.
- The supplied transparent WhiteStores logo is stored at `assets/whitestores-logo.png`.

## Images
All image files exported in the Stitch ZIP are retained in `assets/stitch-exports/` as reference assets. The existing page HTML still contains some Stitch-hosted Google image URLs; those images may require an internet connection to load. They have not been silently replaced with unrelated pictures.

## Notes
This is a frontend-only export. No backend or enquiry-form submission service is configured.


## JavaScript

The shared mobile navigation logic is stored in `js/navigation.js` and loaded by all eight main pages. Other page-specific scripts originally supplied by the Stitch export may remain inline in their HTML files.
