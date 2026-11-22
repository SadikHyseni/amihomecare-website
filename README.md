# Ami Home Care website

A static website (HTML, CSS and a little JavaScript) with one PHP file for the contact and job application forms. Built for one.com hosting.

**Live since 22 November 2026** at https://www.amihomecare.com. GitHub copy: `SadikHyseni/ami-home-care`.

## What's in this folder

| File or folder | What it is |
|---|---|
| `index.html` | Home page |
| `services.html` | Our Services (all 9 services, each with its own section) |
| `about.html` | About Us, directors, CQC registration details, areas covered |
| `careers.html` | Vacancies and the job application form |
| `contact.html` | Contact details and the care enquiry form |
| `policies.html` | Policies and documents (PDF links and on-page preview) |
| `carbon-reduction-plan.html` | Carbon Reduction Plan summary and signed PDF. **This exact address is quoted in the signed documents. Do not rename it.** |
| `net-zero-policy.html` | Net Zero and Environmental Sustainability Policy summary and signed PDF. **Same: do not rename.** |
| `privacy.html` | Summary of the Privacy Notice, plus how the website handles enquiries |
| `404.html` | "Page not found" page |
| `send.php` | Emails form submissions to info@amihomecare.com, with spam protection |
| `css/styles.css` | All styling. Brand colours are at the top (`--plum`, `--berry`, `--stone`) |
| `js/main.js` | Menu, forms, PDF preview and the optional analytics consent banner |
| `js/vendor/` | pdf.js (used only when someone clicks "Preview on this page") |
| `img/` | Photos in several sizes (`name-480.webp`, `-800`, `-1200`, full size), social image, icons, and `logo-trimmed.png` (the official logo with its empty margins cropped, used in the header and footer) |
| `docs/` | The three policy PDFs. |
| `.htaccess` | Server settings: https redirect, hides the backup folder, redirects from the old site's addresses, 404 page, caching, security headers |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` | Browser and phone icons |
| `_backup-*` folders | Earlier versions. **Do not upload.** |

## Viewing it on your laptop

Open the folder in VS Code and use the **Live Server** extension (right-click `index.html` → Open with Live Server).

Live Server cannot run PHP, so the forms will say the message could not be sent. That is expected. They work once the site is on one.com.

## Editing

- **Text:** edit the HTML file for that page. The header, footer and icons are repeated at the top and bottom of every page, so a change to the menu or footer must be made in all 10 HTML files (VS Code: Edit → Replace in Files).
- **Photos:** each photo exists in four widths. To replace one, create the same four sizes with the same names (for example `hero-480.webp`, `hero-800.webp`, `hero-1200.webp`, `hero-1536.webp`), or ask a developer to regenerate them.
- **After editing CSS or JS:** change `?v=20261122b` to today's date in the `<link>` and `<script>` lines of every page, so returning visitors get the new version.

## On one.com (live site)

- **Uploading changes:** in one.com File Manager, upload the changed files to the main website folder, replacing the old ones. Never upload `README.md`, `.git`, `.gitignore`, `_backup-*` or `_to_delete` folders.
- **Never press Publish in the one.com Website Builder.** It would replace this site with the old one.
- **Old website backup:** the previous site is kept in a backup folder in File Manager, hidden from visitors. It also still exists in Website Builder.
- **HTTPS:** `.htaccess` sends every `http://` visit to `https://`.
- **Forms:** `send.php` uses PHP `mail()`. one.com's PHP rejects mail()'s optional fifth argument, so it is not used; do not add it back. Tested on 22 November 2026: the enquiry form sends to info@amihomecare.com. If messages stop arriving, check spam, then ask one.com support to confirm PHP email is enabled.
- **Old addresses:** `.htaccess` permanently redirects the old Website Builder addresses (`/our-services`, `/about-us`, `/vacancies`, the same with `.html`, the old policy pages and PDF links) to the new pages, so existing links and search results keep working. The Privacy Notice PDF refers to `/privacy-notice-for-service-users`, which redirects to `privacy.html`.
- If the site shows "Internal Server Error" right after uploading `.htaccess`, rename that file to `htaccess-disabled.txt` and contact one.com support.

### Still to do

- Test the **job application form** on the Careers page.
- **Google:** submit `https://www.amihomecare.com/sitemap.xml` in Google Search Console, and update the website link on the Google Business Profile if needed.

## Analytics and cookies

The site currently sets no cookies and uses no analytics, so no cookie banner is shown. To add Google Analytics later, put the measurement ID in `ANALYTICS_ID` at the top of `js/main.js`. A consent banner then appears automatically, analytics only load after a visitor accepts, and a "Cookie settings" link appears in the footer. Update the "Using this website" section of `privacy.html` at the same time.

## If the CQC rating changes

The CQC rating is written by hand in three places: the CQC section and ratings box on `index.html`, the footer trust strip (all 10 pages) and `about.html` (Good, report published 28 May 2021). Update all of them if CQC publishes a new rating.
